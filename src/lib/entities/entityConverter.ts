import * as Cesium from "cesium";
import type { Entity as CesiumEntity } from "cesium";
import { AnyProps, ClusterFeature, PointFeature } from "supercluster";
import { mapToRange } from "../util";
import { v4 as uuid } from "uuid";
import { pointToCartesian } from "./geojson/conversions";

const scaleByDistanceScalar = new Cesium.NearFarScalar(5000, 1, 8.0e6, 0.0);

export function toCesiumEntity(
  cluster: PointFeature<AnyProps> | ClusterFeature<AnyProps>
): CesiumEntity | void {
  if (!cluster.properties.cluster) return;
  const cartesian = pointToCartesian(cluster.geometry);
  const pointsClusteredCount = cluster.properties.point_count;
  const pointsClusteredText =
    cluster.properties.point_count_abbreviated.toString();

  return new Cesium.Entity({
    id: (cluster.id as string) ?? uuid(),
    position: cartesian,
    show: true,
    point: {
      pixelSize: 30,
      color: Cesium.Color.fromCssColorString(
        getClusterColor(pointsClusteredCount)
      ),
      outlineColor: Cesium.Color.fromCssColorString(
        getClusterColor(pointsClusteredCount, true)
      ),
      outlineWidth: 5,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: pointsClusteredText.toString(),
      fillColor: Cesium.Color.BLACK,
      scaleByDistance: scaleByDistanceScalar,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

function getClusterColor(value: number, outline = false): string {
  const mappedValue = mapToRange(value, 1, 100, 0, 1);
  const hue = (1 - mappedValue) * 120;

  return "hsla(" + hue + `,100%,50%,${outline ? 0.3 : 0.6})`;
}

function getClusterSize(
  clusterPoints: number,
  minSize: number,
  maxSize: number,
  minClusterPoints: number = 1,
  maxClusterPoints: number = 100
): number {
  return mapToRange(
    clusterPoints,
    minClusterPoints,
    maxClusterPoints,
    minSize,
    maxSize
  );
}
