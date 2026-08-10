import assert from "node:assert/strict";
import test from "node:test";
import { assessAnthropometry } from "../src/features/anthropometry/index.ts";

const resultByIndicator = (
  assessment: ReturnType<typeof assessAnthropometry>,
  indicator: string
) => {
  const result = assessment.results.find((item) => item.indicator === indicator);
  assert.ok(result, `Resultado ausente: ${indicator}`);
  return result;
};

test("regressão do pacote R anthro: peso/idade feminino, 1522 dias, 17 kg", () => {
  const birth = new Date(Date.UTC(2020, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 1522 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: birth,
    assessmentDate,
    weightKg: 17
  });
  const result = resultByIndicator(assessment, "WEIGHT_FOR_AGE");
  assert.ok(result.zScore !== null);
  assert.ok(Math.abs(result.zScore - 0.24) <= 0.005);
});

test("regressão do pacote R anthro: comprimento/idade masculino aos 44 dias", () => {
  const birth = new Date(Date.UTC(2024, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 44 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate: birth,
    assessmentDate,
    statureCm: 50,
    measurementPosition: "length"
  });
  const result = resultByIndicator(assessment, "HEIGHT_FOR_AGE");
  const expected = ((50 / 56.4833) - 1) / 0.03492;
  assert.ok(result.zScore !== null);
  assert.ok(Math.abs(result.zScore - expected) < 1e-10);
});

test("ajuste comprimento/altura alimenta IMC e peso/estatura", () => {
  const birth = new Date(Date.UTC(2024, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 730 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate: birth,
    assessmentDate,
    weightKg: 12,
    statureCm: 85,
    measurementPosition: "height"
  });
  assert.equal(assessment.adjustedStature?.adjustedCm, 85.7);
  assert.equal(assessment.bmi, 12 / (0.857 ** 2));
  assert.ok(resultByIndicator(assessment, "WEIGHT_FOR_LENGTH").validity.valid);
});

test("aos 731 dias seleciona altura e converte comprimento", () => {
  const birth = new Date(Date.UTC(2024, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 731 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: birth,
    assessmentDate,
    weightKg: 10,
    statureCm: 80,
    measurementPosition: "length"
  });
  assert.equal(assessment.adjustedStature?.adjustedCm, 79.3);
  assert.ok(resultByIndicator(assessment, "WEIGHT_FOR_HEIGHT"));
});

test("circunferência braquial não existe antes de 91 dias", () => {
  const birth = new Date(Date.UTC(2025, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 90 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate: birth,
    assessmentDate,
    armCircumferenceCm: 13
  });
  const result = resultByIndicator(assessment, "ARM_CIRCUMFERENCE_FOR_AGE");
  assert.equal(result.zScore, null);
  assert.equal(result.validity.valid, false);
});

test("edema bloqueia apenas indicadores dependentes de peso", () => {
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: "2024-04-15",
    assessmentDate: "2026-08-09",
    weightKg: 12.45,
    statureCm: 89.3,
    measurementPosition: "height",
    headCircumferenceCm: 48,
    oedema: true
  });
  assert.equal(resultByIndicator(assessment, "WEIGHT_FOR_AGE").zScore, null);
  assert.equal(resultByIndicator(assessment, "BMI_FOR_AGE").zScore, null);
  assert.ok(resultByIndicator(assessment, "HEIGHT_FOR_AGE").zScore !== null);
  assert.ok(resultByIndicator(assessment, "HEAD_CIRCUMFERENCE_FOR_AGE").zScore !== null);
});

test("regressão oficial SPSS WHO 2006 cobre os oito indicadores disponíveis aos 93 dias", () => {
  const birth = new Date(Date.UTC(2025, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 93 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate: birth,
    assessmentDate,
    weightKg: 6.5,
    statureCm: 61,
    measurementPosition: "length",
    headCircumferenceCm: 41.9,
    armCircumferenceCm: 13.7,
    tricepsSkinfoldMm: 8.6,
    subscapularSkinfoldMm: 9.8
  });
  const expected: Record<string, number> = {
    HEIGHT_FOR_AGE: -0.28,
    WEIGHT_FOR_AGE: 0.11,
    WEIGHT_FOR_LENGTH: 0.44,
    BMI_FOR_AGE: 0.38,
    HEAD_CIRCUMFERENCE_FOR_AGE: 1.11,
    ARM_CIRCUMFERENCE_FOR_AGE: 0.20,
    TRICEPS_SKINFOLD_FOR_AGE: -0.76,
    SUBSCAPULAR_SKINFOLD_FOR_AGE: 1.38
  };
  for (const [indicator, z] of Object.entries(expected)) {
    const result = resultByIndicator(assessment, indicator);
    assert.ok(result.zScore !== null, indicator);
    assert.ok(Math.abs(result.zScore - z) <= 0.005, `${indicator}: ${result.zScore} != ${z}`);
  }
});

test("regressão oficial SPSS WHO 2006 cobre sexo feminino", () => {
  const birth = new Date(Date.UTC(2025, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 133 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "female",
    birthDate: birth,
    assessmentDate,
    weightKg: 7,
    statureCm: 63.3,
    measurementPosition: "length",
    headCircumferenceCm: 41.8,
    armCircumferenceCm: 15,
    tricepsSkinfoldMm: 14,
    subscapularSkinfoldMm: 8.2
  });
  const expected: Record<string, number> = {
    HEIGHT_FOR_AGE: 0.21,
    WEIGHT_FOR_AGE: 0.46,
    WEIGHT_FOR_LENGTH: 0.50,
    BMI_FOR_AGE: 0.46,
    HEAD_CIRCUMFERENCE_FOR_AGE: 0.69,
    ARM_CIRCUMFERENCE_FOR_AGE: 1.29,
    TRICEPS_SKINFOLD_FOR_AGE: 2.12,
    SUBSCAPULAR_SKINFOLD_FOR_AGE: 0.51
  };
  for (const [indicator, z] of Object.entries(expected)) {
    const result = resultByIndicator(assessment, indicator);
    assert.ok(result.zScore !== null, indicator);
    assert.ok(Math.abs(result.zScore - z) <= 0.005, `${indicator}: ${result.zScore} != ${z}`);
  }
});

test("regressão oficial SPSS converte comprimento para peso/altura após 731 dias", () => {
  const birth = new Date(Date.UTC(2023, 0, 1));
  const assessmentDate = new Date(birth.getTime() + 736 * 86_400_000);
  const assessment = assessAnthropometry({
    sex: "male",
    birthDate: birth,
    assessmentDate,
    weightKg: 12.8,
    statureCm: 89.2,
    measurementPosition: "length"
  });
  assert.ok(Math.abs((assessment.adjustedStature?.adjustedCm ?? 0) - 88.5) < 1e-12);
  const result = resultByIndicator(assessment, "WEIGHT_FOR_HEIGHT");
  assert.ok(result.zScore !== null);
  assert.ok(Math.abs(result.zScore - 0.26) <= 0.005);
});
