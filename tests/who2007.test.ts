import assert from "node:assert/strict";
import test from "node:test";
import { assessAnthropometry } from "../src/features/anthropometry/index.ts";

function bmiResult(birthDate: string, assessmentDate: string, bmi: number) {
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate,
    assessmentDate,
    weightKg: bmi,
    statureCm: 100,
    measurementPosition: "height"
  });
  const result = assessment.results.find((item) => item.indicator === "BMI_FOR_AGE");
  assert.ok(result);
  assert.ok(result.zScore !== null);
  return result;
}

test("exemplo oficial WHO 2007: menino de 11 anos, IMC 30, Z 3,35", () => {
  const result = bmiResult("2015-08-09", "2026-08-09", 30);
  assert.ok(Math.abs(result.zScore! - 3.35) <= 0.01);
});

test("exemplo oficial WHO 2007: menino de 16 anos, IMC 14, Z -3,80", () => {
  const result = bmiResult("2010-08-09", "2026-08-09", 14);
  assert.ok(Math.abs(result.zScore! - (-3.8)) <= 0.01);
});

test("exemplo oficial WHO 2007: menino de 9 anos, IMC 19, Z 1,47", () => {
  const result = bmiResult("2017-08-09", "2026-08-09", 19);
  assert.ok(Math.abs(result.zScore! - 1.47) <= 0.01);
});

test("peso/idade fica indisponível após o 120º mês", () => {
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: "2015-01-01",
    assessmentDate: "2026-08-09",
    weightKg: 40
  });
  const result = assessment.results.find((item) => item.indicator === "WEIGHT_FOR_AGE");
  assert.ok(result);
  assert.equal(result.zScore, null);
  assert.match(result.validity.errors[0] ?? "", /120/);
});

test("comprimento deitado não é convertido no WHO 2007", () => {
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: "2018-01-01",
    assessmentDate: "2026-08-09",
    weightKg: 25,
    statureCm: 125,
    measurementPosition: "length"
  });
  assert.equal(assessment.adjustedStature?.adjustmentCm, 0);
  const height = assessment.results.find((item) => item.indicator === "HEIGHT_FOR_AGE");
  assert.ok(height);
  assert.equal(height.validity.valid, false);
});

