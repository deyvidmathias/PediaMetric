import arm2006 from "./generated/who2006/arm-circumference-for-age.json" with { type: "json" };
import bmi2006 from "./generated/who2006/bmi-for-age.json" with { type: "json" };
import head2006 from "./generated/who2006/head-circumference-for-age.json" with { type: "json" };
import height2006 from "./generated/who2006/height-for-age.json" with { type: "json" };
import subscapular2006 from "./generated/who2006/subscapular-skinfold-for-age.json" with { type: "json" };
import triceps2006 from "./generated/who2006/triceps-skinfold-for-age.json" with { type: "json" };
import weight2006 from "./generated/who2006/weight-for-age.json" with { type: "json" };
import weightHeight2006 from "./generated/who2006/weight-for-height.json" with { type: "json" };
import weightLength2006 from "./generated/who2006/weight-for-length.json" with { type: "json" };
import bmi2007 from "./generated/who2007/bmi-for-age.json" with { type: "json" };
import height2007 from "./generated/who2007/height-for-age.json" with { type: "json" };
import weight2007 from "./generated/who2007/weight-for-age.json" with { type: "json" };
import type {
  Indicator,
  LmsDataset,
  LmsDatasetProvider,
  Reference
} from "../types.ts";

const dataset = (value: unknown): LmsDataset => value as LmsDataset;

export const datasets: Readonly<
  Record<Reference, Partial<Record<Indicator, LmsDataset>>>
> = {
  WHO_2006: {
    WEIGHT_FOR_AGE: dataset(weight2006),
    HEIGHT_FOR_AGE: dataset(height2006),
    WEIGHT_FOR_LENGTH: dataset(weightLength2006),
    WEIGHT_FOR_HEIGHT: dataset(weightHeight2006),
    BMI_FOR_AGE: dataset(bmi2006),
    HEAD_CIRCUMFERENCE_FOR_AGE: dataset(head2006),
    ARM_CIRCUMFERENCE_FOR_AGE: dataset(arm2006),
    TRICEPS_SKINFOLD_FOR_AGE: dataset(triceps2006),
    SUBSCAPULAR_SKINFOLD_FOR_AGE: dataset(subscapular2006)
  },
  WHO_2007: {
    WEIGHT_FOR_AGE: dataset(weight2007),
    HEIGHT_FOR_AGE: dataset(height2007),
    BMI_FOR_AGE: dataset(bmi2007)
  }
};

export const whoDatasetProvider: LmsDatasetProvider = {
  getDataset(reference, indicator) {
    return datasets[reference][indicator];
  }
};
