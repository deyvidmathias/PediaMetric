import { createAnthropometryAssessment } from "./engine/assessment.ts";
import { createGrowthChartModelWithProvider } from "./engine/growthChart.ts";
import { whoDatasetProvider } from "./data/datasets.ts";
import type { AnthropometricResult } from "./types.ts";

export * from "./core.ts";

/** Ready-to-use facade backed by the versioned WHO datasets bundled here. */
export const assessAnthropometry = createAnthropometryAssessment(whoDatasetProvider);

/** Builds chart-ready WHO Z-score curves without exposing datasets to the Web. */
export const createGrowthChartModel = (result: AnthropometricResult) =>
  createGrowthChartModelWithProvider(result, whoDatasetProvider);
