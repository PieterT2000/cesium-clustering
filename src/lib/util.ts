import type { Viewer } from "cesium";

export function getCameraAltitude(viewer: Viewer): number {
  return viewer.camera.positionCartographic.height;
}
// https://stackoverflow.com/questions/36544209/converting-altitude-to-z-level-and-vice-versa
// https://gis.stackexchange.com/questions/129903/cesium-3d-determining-the-map-scale-of-the-viewed-globe/144496#144496
export function altitudeToZoom(altitude: number): number {
  const A = 40487.57;
  const B = 0.00007096758;
  const C = 91610.74;
  const D = -40467.74;

  const res = D + (A - D) / (1 + Math.pow(altitude / C, B));
  return res;
}

/**
 *
 * @param input Numeric value.
 * @param inputMin Minimum input value.
 * @param inputMax Maximum input value.
 * @param outputMin Minimum value of the returned output.
 * @param outputMax Maximum value of the returned output.
 * @param clampInput Wether to clamp the input to the provided input range, this is true by default. Setting this to false can mess up the calculation.
 * @returns The input value mapped to the output range.
 */
export function mapToRange(
  input: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  clampInput: boolean = true
): number {
  input = clampInput ? clamp(input, inputMin, inputMax) : input;
  return (
    outputMin +
    ((outputMax - outputMin) / (inputMax - inputMin)) * (input - inputMin)
  );
}

/**
 *
 * @param value The value to clamp.
 * @param min This value will be returned if the value is less than this value.
 * @param max This value will be returned if the value is greater than this value.
 * @returns The clamped value.
 */
export function clamp(value: number, min?: number, max?: number): number {
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}
