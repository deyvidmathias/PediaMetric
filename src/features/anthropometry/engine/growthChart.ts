import type {
  AnthropometricResult,
  GrowthChartCurve,
  GrowthChartIndicator,
  GrowthChartModel,
  GrowthChartZScore,
  LmsDatasetProvider,
  LmsTuple
} from "../types.ts";
import { DAYS_PER_MONTH } from "./age.ts";
import { measurementAtZ, parametersFromTuple } from "./lms.ts";

const CHART_INDICATORS = new Set<GrowthChartIndicator>([
  "WEIGHT_FOR_AGE",
  "HEIGHT_FOR_AGE",
  "BMI_FOR_AGE",
  "HEAD_CIRCUMFERENCE_FOR_AGE"
]);

const CHART_Z_SCORES: readonly GrowthChartZScore[] = [-3, -2, -1, 0, 1, 2, 3];
const MAX_CURVE_POINTS = 121;

function isGrowthChartIndicator(indicator: AnthropometricResult["indicator"]): indicator is GrowthChartIndicator {
  return CHART_INDICATORS.has(indicator as GrowthChartIndicator);
}

function rowIsWithinOfficialDomain(
  result: AnthropometricResult,
  row: LmsTuple
): boolean {
  if (result.reference === "WHO_2006") return row[0] <= 1856;
  if (result.indicator === "WEIGHT_FOR_AGE") return row[0] <= 120;
  return row[0] <= 228;
}

function sampleRows(rows: readonly LmsTuple[]): readonly LmsTuple[] {
  if (rows.length <= MAX_CURVE_POINTS) return rows;
  const sampled: LmsTuple[] = [];
  for (let index = 0; index < MAX_CURVE_POINTS; index += 1) {
    const rowIndex = Math.round((index * (rows.length - 1)) / (MAX_CURVE_POINTS - 1));
    const row = rows[rowIndex];
    if (row && sampled.at(-1) !== row) sampled.push(row);
  }
  return sampled;
}

function ageMonthsForTuple(result: AnthropometricResult, tuple: LmsTuple): number {
  return result.reference === "WHO_2006" ? tuple[0] / DAYS_PER_MONTH : tuple[0];
}

function buildCurve(
  result: AnthropometricResult,
  rows: readonly LmsTuple[],
  zScore: GrowthChartZScore
): GrowthChartCurve {
  return {
    zScore,
    points: rows.map((tuple) => ({
      ageMonths: ageMonthsForTuple(result, tuple),
      measurement: measurementAtZ(zScore, parametersFromTuple(tuple))
    }))
  };
}

export function createGrowthChartModelWithProvider(
  result: AnthropometricResult,
  provider: LmsDatasetProvider
): GrowthChartModel | null {
  if (!isGrowthChartIndicator(result.indicator)) return null;

  const dataset = provider.getDataset(result.reference, result.indicator);
  const officialRows = dataset
    ? dataset[result.sex].filter((row) => rowIsWithinOfficialDomain(result, row))
    : [];
  const rows = sampleRows(officialRows);
  const curves = rows.length > 0
    ? CHART_Z_SCORES.map((zScore) => buildCurve(result, rows, zScore))
    : [];
  const hasMarker = result.zScore !== null && result.percentile !== null;
  const unavailableReason = result.validity.errors[0]
    ?? (dataset
      ? (hasMarker ? null : "Marcador indisponível para os dados informados.")
      : "Curvas de referência indisponíveis para este indicador e faixa etária.");

  return {
    indicator: result.indicator,
    reference: result.reference,
    sex: result.sex,
    measurementUnit: result.measurementUnit,
    curves,
    marker: hasMarker
      ? {
          ageMonths: result.ageMonths,
          measurement: result.measurement,
          zScore: result.zScore as number,
          percentile: result.percentile as number,
          biologicallyImplausible: result.validity.biologicallyImplausible
        }
      : null,
    unavailableReason
  };
}
