import * as Cesium from "cesium";
import { Point, Polygon } from "geojson";

export function polygonToCartesians(polygon: Polygon): Cesium.Cartesian3[] {
  return polygon.coordinates[0].map((coordinates) =>
    coordinatesToCartesian(coordinates)
  );
}

export function pointToCartesian(point: Point): Cesium.Cartesian3 {
  return coordinatesToCartesian(point.coordinates);
}

export function coordinatesToCartesian(
  coordinates: number[]
): Cesium.Cartesian3 {
  const [lon, lat, height] = coordinates;
  const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  return cartesian;
}
