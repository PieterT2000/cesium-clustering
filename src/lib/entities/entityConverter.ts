import * as Cesium from "cesium";
import type { Entity as CesiumEntity } from "cesium";
import { AnyProps, ClusterFeature, PointFeature } from "supercluster";
import { mapToRange } from "../util.js";
import { v4 as uuid } from "uuid";
import { pointToCartesian } from "./geojson/conversions.js";

const scaleByDistanceScalar = new Cesium.NearFarScalar(10.0e4, 1, 8.0e6, 0.0);

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
      pixelSize: 40,
      scaleByDistance: scaleByDistanceScalar,
      color: Cesium.Color.fromCssColorString(
        getClusterColor(pointsClusteredCount)
      ),
      outlineColor: Cesium.Color.fromCssColorString(
        getClusterColor(pointsClusteredCount, true)
      ),
      outlineWidth: 7,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: pointsClusteredText.toString(),
      fillColor: Cesium.Color.BLACK,
      scaleByDistance: scaleByDistanceScalar,
      font: '500 20px/40px "Helvetica Neue"',
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

function getClusterColor(value: number, outline = false): string {
  // const mappedValue = mapToRange(value, 1, 100, 0, 1);
  // const hue = (1 - mappedValue) * 120;

  // return "hsla(" + hue + `,100%,50%,${outline ? 0.3 : 0.6})`;
  if (value < 10) {
    return outline ? DEFAULT_COLOR_MAP.small_outline : DEFAULT_COLOR_MAP.small;
  }
  if (value < 100) {
    return outline
      ? DEFAULT_COLOR_MAP.medium_outline
      : DEFAULT_COLOR_MAP.medium;
  }
  return outline ? DEFAULT_COLOR_MAP.large_outline : DEFAULT_COLOR_MAP.large;
}

const DEFAULT_COLOR_MAP = {
  small: "rgba(110, 204, 57, 0.8)",
  small_outline: "rgba(181, 226, 140, 0.6)",
  medium: "rgba(240, 194, 12, 0.8)",
  medium_outline: "rgba(241, 211, 87, 0.6)",
  large: "rgba(241, 128, 23, 0.8)",
  large_outline: "rgba(253, 156, 115, 0.6)",
};

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
