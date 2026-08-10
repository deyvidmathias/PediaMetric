export type Sex = "male" | "female";
export type Reference = "WHO_2006" | "WHO_2007";
export type MeasurementPosition = "length" | "height";

export type Indicator =
  | "WEIGHT_FOR_AGE"
  | "HEIGHT_FOR_AGE"
  | "WEIGHT_FOR_LENGTH"
  | "WEIGHT_FOR_HEIGHT"
  | "BMI_FOR_AGE"
  | "HEAD_CIRCUMFERENCE_FOR_AGE"
  | "ARM_CIRCUMFERENCE_FOR_AGE"
  | "TRICEPS_SKINFOLD_FOR_AGE"
  | "SUBSCAPULAR_SKINFOLD_FOR_AGE";

export interface AnthropometryInput {
  sex: Sex;
  birthDate: string | Date;
  assessmentDate: string | Date;
  weightKg?: number;
  statureCm?: number;
  measurementPosition?: MeasurementPosition;
  headCircumferenceCm?: number;
  armCircumferenceCm?: number;
  tricepsSkinfoldMm?: number;
  subscapularSkinfoldMm?: number;
  oedema?: boolean;
}

export interface ExactAge {
  days: number;
  months: number;
  completedMonths: number;
  years: number;
  completedYears: number;
  calendar: {
    years: number;
    months: number;
    days: number;
  };
}

export interface AdjustedStature {
  originalCm: number;
  adjustedCm: number;
  providedPosition: MeasurementPosition | null;
  expectedPosition: MeasurementPosition;
  adjustmentCm: -0.7 | 0 | 0.7;
}

export interface Classification {
  code: string;
  basis: "WHO_CUTOFF" | "DESCRIPTIVE_Z_BAND";
}

export interface ResultValidity {
  valid: boolean;
  biologicallyImplausible: boolean;
  warnings: string[];
  errors: string[];
}

export interface AnthropometricResult {
  indicator: Indicator;
  reference: Reference;
  sex: Sex;
  ageDays: number;
  ageMonths: number;
  measurement: number;
  measurementUnit: "kg" | "cm" | "mm" | "kg/m2";
  zScore: number | null;
  percentile: number | null;
  classification: Classification | null;
  validity: ResultValidity;
}

export type GrowthChartIndicator =
  | "WEIGHT_FOR_AGE"
  | "HEIGHT_FOR_AGE"
  | "BMI_FOR_AGE"
  | "HEAD_CIRCUMFERENCE_FOR_AGE";

export type GrowthChartZScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export interface GrowthChartPoint {
  ageMonths: number;
  measurement: number;
}

export interface GrowthChartCurve {
  zScore: GrowthChartZScore;
  points: readonly GrowthChartPoint[];
}

export interface GrowthChartMarker {
  ageMonths: number;
  measurement: number;
  zScore: number;
  percentile: number;
  biologicallyImplausible: boolean;
}

export interface GrowthChartModel {
  indicator: GrowthChartIndicator;
  reference: Reference;
  sex: Sex;
  measurementUnit: AnthropometricResult["measurementUnit"];
  curves: readonly GrowthChartCurve[];
  marker: GrowthChartMarker | null;
  unavailableReason: string | null;
}

export interface AnthropometryAssessment {
  age: ExactAge | null;
  reference: Reference | null;
  adjustedStature: AdjustedStature | null;
  bmi: number | null;
  results: AnthropometricResult[];
  validity: {
    valid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export type LmsTuple = readonly [key: number, l: number, m: number, s: number];

export interface LmsDataset {
  reference: Reference;
  source: string;
  key: "ageDays" | "ageMonths" | "lengthCm" | "heightCm";
  male: readonly LmsTuple[];
  female: readonly LmsTuple[];
}

/**
 * Core-facing contract for obtaining reference data.
 *
 * Implementations (such as the bundled WHO datasets) live outside the engine,
 * which keeps the calculation core independent from a concrete data source.
 */
export interface LmsDatasetProvider {
  getDataset(reference: Reference, indicator: Indicator): LmsDataset | undefined;
}

export interface LmsParameters {
  l: number;
  m: number;
  s: number;
}
