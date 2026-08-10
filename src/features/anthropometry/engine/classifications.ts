import type { Classification, Indicator, Reference } from "../types.ts";

const classification = (
  code: string,
  basis: Classification["basis"] = "WHO_CUTOFF"
): Classification => ({ code, basis });

export function classify(
  indicator: Indicator,
  reference: Reference,
  z: number
): Classification {
  if (indicator === "HEIGHT_FOR_AGE") {
    if (z < -3) return classification("SEVERE_STUNTING");
    if (z < -2) return classification("STUNTING");
    if (z > 3) return classification("TALL");
    return classification("EXPECTED_HEIGHT");
  }
  if (indicator === "WEIGHT_FOR_AGE") {
    if (z < -3) return classification("SEVERE_UNDERWEIGHT");
    if (z < -2) return classification("UNDERWEIGHT");
    if (z > 2) {
      return classification(
        "HIGH_WEIGHT_FOR_AGE",
        "DESCRIPTIVE_Z_BAND"
      );
    }
    return classification("EXPECTED_WEIGHT");
  }
  if (
    indicator === "WEIGHT_FOR_LENGTH" ||
    indicator === "WEIGHT_FOR_HEIGHT" ||
    (indicator === "BMI_FOR_AGE" && reference === "WHO_2006")
  ) {
    if (z < -3) return classification("SEVERE_WASTING");
    if (z < -2) return classification("WASTING");
    if (z <= 1) return classification("EUTROPHY");
    if (z <= 2) return classification("RISK_OF_OVERWEIGHT");
    if (z <= 3) return classification("OVERWEIGHT");
    return classification("OBESITY");
  }
  if (indicator === "BMI_FOR_AGE" && reference === "WHO_2007") {
    if (z < -3) return classification("SEVERE_THINNESS");
    if (z < -2) return classification("THINNESS");
    if (z <= 1) return classification("EUTROPHY");
    if (z <= 2) return classification("OVERWEIGHT");
    return classification("OBESITY");
  }
  if (z < -3) return classification("VERY_LOW_Z", "DESCRIPTIVE_Z_BAND");
  if (z < -2) return classification("LOW_Z", "DESCRIPTIVE_Z_BAND");
  if (z <= 2) return classification("REFERENCE_Z_BAND", "DESCRIPTIVE_Z_BAND");
  if (z <= 3) return classification("HIGH_Z", "DESCRIPTIVE_Z_BAND");
  return classification("VERY_HIGH_Z", "DESCRIPTIVE_Z_BAND");
}
