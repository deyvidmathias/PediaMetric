import assert from "node:assert/strict";
import test from "node:test";
import {
  adjustStature,
  calculateBmi,
  calculateExactAge,
  classify,
  lmsZScore,
  measurementAtZ,
  restrictedLmsZScore,
  selectReference,
  zScoreToPercentile
} from "../src/features/anthropometry/index.ts";

test("idade usa datas civis e respeita ano bissexto", () => {
  const age = calculateExactAge("2024-02-29", "2025-03-01");
  assert.equal(age.days, 366);
  assert.equal(age.completedMonths, 12);
  assert.deepEqual(age.calendar, { years: 1, months: 0, days: 0 });
});

test("avaliação anterior ao nascimento é rejeitada", () => {
  assert.throws(
    () => calculateExactAge("2025-01-01", "2024-12-31"),
    /antes do nascimento/
  );
});

test("seleção da referência não cria lacuna entre 2006 e 2007", () => {
  const birth = new Date(Date.UTC(2020, 0, 1));
  const at = (days: number) => new Date(birth.getTime() + days * 86_400_000);
  assert.equal(selectReference(calculateExactAge(birth, at(1856))), "WHO_2006");
  assert.equal(selectReference(calculateExactAge(birth, at(1857))), "WHO_2007");
});

test("IMC é calculado em kg/m²", () => {
  assert.equal(calculateBmi(12.45, 89.3), 12.45 / (0.893 ** 2));
  assert.throws(() => calculateBmi(0, 89.3));
});

test("posição divergente aplica 0,7 cm somente no domínio WHO 2006", () => {
  assert.equal(adjustStature(730, 80, "height").adjustedCm, 80.7);
  assert.equal(adjustStature(731, 80, "length").adjustedCm, 79.3);
  assert.equal(adjustStature(2000, 120, "length").adjustedCm, 120);
});

test("LMS direto é reversível na faixa modelada", () => {
  const parameters = { l: -0.5, m: 15, s: 0.1 };
  for (const z of [-3, -2, -1, 0, 1, 2, 3]) {
    const measurement = measurementAtZ(z, parameters);
    assert.ok(Math.abs(lmsZScore(measurement, parameters) - z) < 1e-12);
  }
});

test("LMS restrito prolonga linearmente as caudas", () => {
  const parameters = { l: -0.5, m: 15, s: 0.1 };
  const sd2 = measurementAtZ(2, parameters);
  const sd3 = measurementAtZ(3, parameters);
  const measurement = sd3 + (sd3 - sd2);
  assert.ok(Math.abs(restrictedLmsZScore(measurement, parameters) - 4) < 1e-12);
});

test("percentil é derivado do Z completo", () => {
  assert.ok(Math.abs(zScoreToPercentile(0) - 50) < 1e-6);
  assert.ok(Math.abs(zScoreToPercentile(1) - 84.1344746) < 2e-5);
  assert.ok(Math.abs(zScoreToPercentile(-1) - 15.8655254) < 2e-5);
});

test("classificações WHO usam pontos de corte diferentes antes e depois de 5 anos", () => {
  assert.equal(classify("BMI_FOR_AGE", "WHO_2006", 1.5).code, "RISK_OF_OVERWEIGHT");
  assert.equal(classify("BMI_FOR_AGE", "WHO_2007", 1.5).code, "OVERWEIGHT");
  assert.equal(classify("BMI_FOR_AGE", "WHO_2007", 2.1).code, "OBESITY");
  assert.equal(classify("BMI_FOR_AGE", "WHO_2007", -3.1).code, "SEVERE_THINNESS");
  const descriptiveClassification = classify(
    "HEAD_CIRCUMFERENCE_FOR_AGE",
    "WHO_2006",
    -2.5
  );
  assert.equal(descriptiveClassification.basis, "DESCRIPTIVE_Z_BAND");
  assert.deepEqual(Object.keys(descriptiveClassification).sort(), ["basis", "code"]);
});
