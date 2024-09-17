import * as Cesium from "cesium";
import type { Entity, Viewer, CustomDataSource, Cartesian3 } from "cesium";
import Supercluster, { AnyProps } from "supercluster";
import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import { BBox, Feature, Point } from "geojson";
import { altitudeToZoom, getCameraAltitude } from "./util.js";
import { toCesiumEntity } from "./entities/entityConverter.js";

// BBOX of the United Kingdom [west, south, east, north]
const DEFAULT_BBOX = [-180, -85, 180, 85] as BBox;
const defaultCesiumClusterOptions = {
  radius: 80,
  maxZoom: 24,
  minZoom: 0,
};

export interface CesiumClusterOptions {
  /**
   * The radius in pixels
   */
  radius: number;
  maxZoom?: number;
  minZoom?: number;
}
class CesiumCluster {
  private clusterer: Supercluster;
  private entities: Map<string, Entity> = new Map<string, Entity>();
  private clusterDataSource = new Cesium.CustomDataSource("cluster");
  private viewer: Viewer;
  private lastZoomLevel: number;
  private clusteringEnabled = false;
  constructor(viewer: Viewer, options?: CesiumClusterOptions) {
    this.clusterer = new Supercluster(
      Object.assign({}, defaultCesiumClusterOptions, options)
    );
    this.viewer = viewer;
    this.lastZoomLevel = Math.round(
      altitudeToZoom(getCameraAltitude(this.viewer))
    );
    this.viewer.dataSources.add(this.clusterDataSource);
    this.viewer.camera.changed.addEventListener(() => {
      if (!this.clusteringEnabled) return;
      const currentZoomLevel = Math.round(
        altitudeToZoom(getCameraAltitude(this.viewer))
      );
      if (this.lastZoomLevel !== currentZoomLevel) {
        this.lastZoomLevel = currentZoomLevel;
        this.render();
      }
    });
  }

  /**
   * Loads a cluster using the passed data source. Please note that all entities in the data source will be clustered.
   * @param dataSource the data source containing the entities to be clustered.
   */
  public loadFromDataSource(dataSource: CustomDataSource) {
    const entities = dataSource.entities.values;
    this.load(entities);
  }

  /**
   * Loads a cluster from the passed entities
   * @param entities Entities to cluster
   */
  public load(entities: Entity[]) {
    const clusterableFeatures = [] as Feature<Point, AnyProps>[];
    this.entities.clear();
    entities.forEach((entity) => {
      if (!entity.polygon) return;
      this.entities.set(entity.id, entity);
      entity.show = false;

      const polgyonHierarchy = entity.polygon.hierarchy?.getValue(
        Cesium.JulianDate.now()
      );
      const outerRing = (polgyonHierarchy.positions as Cartesian3[]).map(
        getLonLatFromCartesian
      );
      const innerRings = (
        polgyonHierarchy.holes as { positions: Cartesian3[] }[] | undefined
      )?.map((hole) => hole.positions.map(getLonLatFromCartesian));

      const rings = [outerRing, ...(innerRings || [])];
      for (const ring of rings) {
        for (let j = 0; j < ring[ring.length - 1].length; j++) {
          if (ring[ring.length - 1][j] !== ring[0][j]) {
            // First and last point are not the same for this ring
            ring.push(ring[0]);
          }
        }
      }

      try {
        const geojsonPolygon = polygon(rings);

        const center = (centroid(geojsonPolygon) as Feature<Point>).geometry;
        clusterableFeatures.push({
          type: "Feature",
          id: entity.id,
          geometry: center,
          properties: {},
        });
      } catch (error) {
        console.error(
          `Failed to create a cluster from the entity with id: ${entity.id}`
        );
      }
    });

    this.clusterer.load(clusterableFeatures);
    this.clusteringEnabled = true;
    this.render();
  }

  public enable() {
    this.clusteringEnabled = true;
  }

  public disable() {
    this.clusteringEnabled = false;
  }

  private render() {
    // 1. Clear previous viewer state
    this.clusterDataSource.entities.suspendEvents();
    this.clusterDataSource.entities.removeAll();
    this.entities.forEach((entity) => {
      entity.show = false;
    });

    // 2. Get the current zoom level and get the clusters
    const zoomLevel = altitudeToZoom(getCameraAltitude(this.viewer));
    const clusters = this.clusterer.getClusters(
      DEFAULT_BBOX,
      Math.ceil(zoomLevel)
    );

    const clusterEntities: Entity[] = [];
    clusters.forEach((cluster) => {
      if (cluster.properties.cluster) {
        const clusterEntity = toCesiumEntity(cluster);
        if (clusterEntity) clusterEntities.push(clusterEntity);
      } else {
        const entity = this.entities.get(cluster.id as string);
        if (entity) {
          entity.show = true;
        }
      }
    });
    clusterEntities.forEach((entity) => {
      this.clusterDataSource.entities.add(entity);
    });

    this.clusterDataSource.entities.resumeEvents();
    this.viewer.scene.requestRender();
  }
}

function getLonLatFromCartesian(cartesian: Cartesian3) {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  return [
    Cesium.Math.toDegrees(cartographic.longitude),
    Cesium.Math.toDegrees(cartographic.latitude),
    cartographic.height,
  ];
}

export { CesiumCluster };
