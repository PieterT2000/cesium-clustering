import { Point, Polygon } from "geojson";

export type SupportedGeoJson = Point | Polygon;
export type SupportedGeoJsonTypes = SupportedGeoJson["type"];
export type GeoJsonKeyToTypeMap = {
	[K in SupportedGeoJsonTypes]: Extract<SupportedGeoJson, { type: K }>;
};