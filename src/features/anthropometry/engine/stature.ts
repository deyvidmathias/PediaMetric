import type { AdjustedStature, MeasurementPosition } from "../types.ts";

export function adjustStature(
  ageDays: number,
  statureCm: number,
  position?: MeasurementPosition
): AdjustedStature {
  if (!Number.isFinite(statureCm) || statureCm <= 0) {
    throw new RangeError("Comprimento/altura deve ser maior que zero.");
  }
  const expectedPosition: MeasurementPosition = ageDays < 731 ? "length" : "height";
  let adjustmentCm: -0.7 | 0 | 0.7 = 0;
  if (ageDays <= 1856) {
    if (position === "height" && expectedPosition === "length") adjustmentCm = 0.7;
    if (position === "length" && expectedPosition === "height") adjustmentCm = -0.7;
  }
  return {
    originalCm: statureCm,
    adjustedCm: statureCm + adjustmentCm,
    providedPosition: position ?? null,
    expectedPosition,
    adjustmentCm
  };
}
