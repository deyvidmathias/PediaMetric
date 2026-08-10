import assert from "node:assert/strict";
import {
  calculateBmi,
  createAnthropometryAssessment,
  createGrowthChartModelWithProvider
} from "@pediametric/core";

assert.equal(calculateBmi(18, 120), 12.5);

const provider = {
  getDataset(reference, indicator) {
    if (reference !== "WHO_2006" || indicator !== "WEIGHT_FOR_AGE") return undefined;
    return {
      reference,
      source: "package-smoke",
      key: "ageDays",
      male: [[0, 1, 3.3, 0.1]],
      female: [[0, 1, 3.2, 0.1]]
    };
  }
};

const assess = createAnthropometryAssessment(provider);

const result = assess({
  sex: "female",
  birthDate: "2026-01-01",
  assessmentDate: "2026-01-01",
  weightKg: 3.2
});

assert.equal(result.validity.valid, true);
assert.equal(result.results[0]?.indicator, "WEIGHT_FOR_AGE");
assert.ok(Math.abs(result.results[0]?.zScore ?? Number.NaN) < 1e-12);

const chart = createGrowthChartModelWithProvider(result.results[0], provider);

assert.deepEqual(chart?.curves.map((curve) => curve.zScore), [-3, -2, -1, 0, 1, 2, 3]);
assert.equal(chart?.marker?.measurement, 3.2);

console.log("Core package smoke test passed.");
