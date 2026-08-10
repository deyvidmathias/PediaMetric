import assert from "node:assert/strict";
import test from "node:test";
import {
  createGrowthChartModelWithProvider,
  type AnthropometricResult,
  type LmsDatasetProvider
} from "../src/features/anthropometry/core.ts";

const provider: LmsDatasetProvider = {
  getDataset(reference, indicator) {
    if (reference !== "WHO_2006" || indicator !== "WEIGHT_FOR_AGE") return undefined;
    return {
      reference,
      source: "growth-chart-test",
      key: "ageDays",
      male: [
        [0, 1, 3.3, 0.1],
        [30, 1, 4.5, 0.1],
        [60, 1, 5.6, 0.1]
      ],
      female: [
        [0, 1, 3.2, 0.1],
        [30, 1, 4.2, 0.1],
        [60, 1, 5.1, 0.1]
      ]
    };
  }
};

const medianResult: AnthropometricResult = {
  indicator: "WEIGHT_FOR_AGE",
  reference: "WHO_2006",
  sex: "female",
  ageDays: 30,
  ageMonths: 30 / 30.4375,
  measurement: 4.2,
  measurementUnit: "kg",
  zScore: 0,
  percentile: 50,
  classification: { code: "EXPECTED_WEIGHT", basis: "WHO_CUTOFF" },
  validity: {
    valid: true,
    biologicallyImplausible: false,
    warnings: [],
    errors: []
  }
};

test("modelo de gráfico contém curvas de Z -3 a +3 e marcador exato", () => {
  const model = createGrowthChartModelWithProvider(medianResult, provider);
  assert.ok(model);
  assert.deepEqual(model.curves.map((curve) => curve.zScore), [-3, -2, -1, 0, 1, 2, 3]);
  assert.deepEqual(
    model.curves.find((curve) => curve.zScore === 0)?.points.map((point) => point.measurement),
    [3.2, 4.2, 5.1]
  );
  assert.deepEqual(model.marker, {
    ageMonths: medianResult.ageMonths,
    measurement: 4.2,
    zScore: 0,
    percentile: 50,
    biologicallyImplausible: false
  });
});

test("medidas das curvas permanecem ordenadas em cada idade", () => {
  const model = createGrowthChartModelWithProvider(medianResult, provider);
  assert.ok(model);
  for (let pointIndex = 0; pointIndex < 3; pointIndex += 1) {
    const values = model.curves.map((curve) => curve.points[pointIndex]?.measurement);
    assert.ok(values.every((value) => value !== undefined));
    for (let curveIndex = 1; curveIndex < values.length; curveIndex += 1) {
      assert.ok((values[curveIndex] as number) > (values[curveIndex - 1] as number));
    }
  }
});

test("curvas continuam disponíveis quando apenas o marcador é inválido", () => {
  const invalidResult: AnthropometricResult = {
    ...medianResult,
    zScore: null,
    percentile: null,
    classification: null,
    validity: {
      valid: false,
      biologicallyImplausible: false,
      warnings: [],
      errors: ["Indicador indisponível para a medida informada."]
    }
  };
  const model = createGrowthChartModelWithProvider(invalidResult, provider);
  assert.ok(model);
  assert.equal(model.marker, null);
  assert.equal(model.curves.length, 7);
  assert.match(model.unavailableReason ?? "", /indisponível/);
});

test("indicadores fora do conjunto principal não geram gráfico de idade", () => {
  const result: AnthropometricResult = {
    ...medianResult,
    indicator: "WEIGHT_FOR_HEIGHT"
  };
  assert.equal(createGrowthChartModelWithProvider(result, provider), null);
});
