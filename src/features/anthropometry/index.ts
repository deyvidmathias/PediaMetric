import { createAnthropometryAssessment } from "./engine/assessment.ts";
import { whoDatasetProvider } from "./data/datasets.ts";

export * from "./core.ts";

/** Ready-to-use facade backed by the versioned WHO datasets bundled here. */
export const assessAnthropometry = createAnthropometryAssessment(whoDatasetProvider);
