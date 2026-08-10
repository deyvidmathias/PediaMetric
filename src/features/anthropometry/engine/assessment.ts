import type {
  AnthropometricResult,
  AnthropometryAssessment,
  AnthropometryInput,
  Indicator,
  LmsDataset,
  LmsDatasetProvider,
  LmsParameters,
  MeasurementPosition,
  Reference,
  ResultValidity,
  Sex
} from "../types.ts";
import { calculateExactAge, selectReference } from "./age.ts";
import { calculateBmi } from "./bmi.ts";
import { classify } from "./classifications.ts";
import {
  findExactTuple,
  interpolateParametersByKey,
  lmsZScore,
  parametersFromTuple,
  restrictedLmsZScore
} from "./lms.ts";
import { zScoreToPercentile } from "./percentile.ts";
import { adjustStature } from "./stature.ts";

interface MeasurementRequest {
  indicator: Indicator;
  measurement: number;
  unit: AnthropometricResult["measurementUnit"];
  lmsKey?: number;
  invalidReason?: string;
}

const DIRECT_LMS = new Set<Indicator>([
  "HEIGHT_FOR_AGE",
  "HEAD_CIRCUMFERENCE_FOR_AGE"
]);

function datasetFor(
  provider: LmsDatasetProvider,
  reference: Reference,
  indicator: Indicator
): LmsDataset {
  const value = provider.getDataset(reference, indicator);
  if (!value) throw new RangeError(`${indicator} não existe em ${reference}.`);
  return value;
}

function rowsFor(dataset: LmsDataset, sex: Sex) {
  return dataset[sex];
}

function scoreWithParameters(
  indicator: Indicator,
  measurement: number,
  parameters: LmsParameters
): number {
  return DIRECT_LMS.has(indicator)
    ? lmsZScore(measurement, parameters)
    : restrictedLmsZScore(measurement, parameters);
}

function scoreWho2006(
  provider: LmsDatasetProvider,
  indicator: Indicator,
  sex: Sex,
  ageDays: number,
  measurement: number,
  lmsKey?: number
): number | null {
  const dataset = datasetFor(provider, "WHO_2006", indicator);
  const rows = rowsFor(dataset, sex);
  let parameters: LmsParameters | null = null;
  if (indicator === "WEIGHT_FOR_LENGTH" || indicator === "WEIGHT_FOR_HEIGHT") {
    parameters = lmsKey === undefined
      ? null
      : interpolateParametersByKey(rows, lmsKey, 0.1);
  } else {
    const tuple = findExactTuple(rows, ageDays);
    parameters = tuple ? parametersFromTuple(tuple) : null;
  }
  return parameters ? scoreWithParameters(indicator, measurement, parameters) : null;
}

function scoreWho2007(
  provider: LmsDatasetProvider,
  indicator: Indicator,
  sex: Sex,
  ageMonths: number,
  measurement: number
): number | null {
  const rows = rowsFor(datasetFor(provider, "WHO_2007", indicator), sex);
  const lowMonth = Math.floor(ageMonths);
  const fraction = ageMonths - lowMonth;
  const lowTuple = findExactTuple(rows, lowMonth);
  if (!lowTuple) return null;
  const lowZ = scoreWithParameters(indicator, measurement, parametersFromTuple(lowTuple));
  if (fraction < 1e-12) return lowZ;
  const highTuple = findExactTuple(rows, lowMonth + 1);
  if (!highTuple) return null;
  const highZ = scoreWithParameters(indicator, measurement, parametersFromTuple(highTuple));
  return lowZ + fraction * (highZ - lowZ);
}

function isImplausible(indicator: Indicator, z: number): boolean {
  if (indicator === "WEIGHT_FOR_AGE") return z < -6 || z > 5;
  if (indicator === "HEIGHT_FOR_AGE") return Math.abs(z) > 6;
  return Math.abs(z) > 5;
}

function baseValidity(errors: string[] = [], warnings: string[] = []): ResultValidity {
  return { valid: errors.length === 0, biologicallyImplausible: false, warnings, errors };
}

function unavailableResult(
  request: MeasurementRequest,
  reference: Reference,
  sex: Sex,
  ageDays: number,
  ageMonths: number,
  reason: string
): AnthropometricResult {
  return {
    indicator: request.indicator,
    reference,
    sex,
    ageDays,
    ageMonths,
    measurement: request.measurement,
    measurementUnit: request.unit,
    zScore: null,
    percentile: null,
    classification: null,
    validity: baseValidity([reason])
  };
}

function calculatedResult(
  request: MeasurementRequest,
  reference: Reference,
  sex: Sex,
  ageDays: number,
  ageMonths: number,
  zScore: number
): AnthropometricResult {
  const biologicallyImplausible = isImplausible(request.indicator, zScore);
  const warnings = biologicallyImplausible
    ? ["Escore fora dos limites de plausibilidade da OMS; confira datas e medidas."]
    : [];
  return {
    indicator: request.indicator,
    reference,
    sex,
    ageDays,
    ageMonths,
    measurement: request.measurement,
    measurementUnit: request.unit,
    zScore,
    percentile: zScoreToPercentile(zScore),
    classification: classify(request.indicator, reference, zScore),
    validity: {
      valid: true,
      biologicallyImplausible,
      warnings,
      errors: []
    }
  };
}

function validatePositive(name: string, value: number | undefined, errors: string[]): void {
  if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
    errors.push(`${name} deve ser um número finito maior que zero.`);
  }
}

function buildRequests(
  input: AnthropometryInput,
  reference: Reference,
  ageDays: number,
  ageMonths: number,
  adjustedStatureCm: number | null,
  bmi: number | null
): MeasurementRequest[] {
  const requests: MeasurementRequest[] = [];
  const weightReason = input.oedema
    ? "Indicador dependente de peso indisponível na presença de edema."
    : undefined;
  const wrongOlderPosition =
    reference === "WHO_2007" && input.measurementPosition === "length"
      ? "WHO 2007 requer altura em pé; não há conversão oficial de 0,7 cm após 60 meses."
      : undefined;

  if (input.weightKg !== undefined) {
    const weightForAgeReason =
      weightReason ??
      (reference === "WHO_2007" && ageMonths >= 121
        ? "Peso/idade WHO 2007 só é suportado até o fim do 120º mês."
        : undefined);
    requests.push({
      indicator: "WEIGHT_FOR_AGE",
      measurement: input.weightKg,
      unit: "kg",
      ...(weightForAgeReason ? { invalidReason: weightForAgeReason } : {})
    });
  }
  if (adjustedStatureCm !== null) {
    requests.push({
      indicator: "HEIGHT_FOR_AGE",
      measurement: adjustedStatureCm,
      unit: "cm",
      ...(wrongOlderPosition ? { invalidReason: wrongOlderPosition } : {})
    });
  }
  if (bmi !== null) {
    const invalidReason = weightReason ?? wrongOlderPosition;
    requests.push({
      indicator: "BMI_FOR_AGE",
      measurement: bmi,
      unit: "kg/m2",
      ...(invalidReason ? { invalidReason } : {})
    });
  }
  if (reference === "WHO_2006" && input.weightKg !== undefined && adjustedStatureCm !== null) {
    requests.push({
      indicator: ageDays < 731 ? "WEIGHT_FOR_LENGTH" : "WEIGHT_FOR_HEIGHT",
      measurement: input.weightKg,
      unit: "kg",
      lmsKey: adjustedStatureCm,
      ...(weightReason ? { invalidReason: weightReason } : {})
    });
  }
  if (input.headCircumferenceCm !== undefined) {
    requests.push({
      indicator: "HEAD_CIRCUMFERENCE_FOR_AGE",
      measurement: input.headCircumferenceCm,
      unit: "cm",
      ...(reference === "WHO_2007"
        ? {
            invalidReason:
              "Perímetro cefálico/idade é suportado somente pela referência WHO 2006 até o fim do 60º mês."
          }
        : {})
    });
  }
  if (reference === "WHO_2006" && input.armCircumferenceCm !== undefined) {
    requests.push({
      indicator: "ARM_CIRCUMFERENCE_FOR_AGE",
      measurement: input.armCircumferenceCm,
      unit: "cm"
    });
  }
  if (reference === "WHO_2006" && input.tricepsSkinfoldMm !== undefined) {
    requests.push({
      indicator: "TRICEPS_SKINFOLD_FOR_AGE",
      measurement: input.tricepsSkinfoldMm,
      unit: "mm"
    });
  }
  if (reference === "WHO_2006" && input.subscapularSkinfoldMm !== undefined) {
    requests.push({
      indicator: "SUBSCAPULAR_SKINFOLD_FOR_AGE",
      measurement: input.subscapularSkinfoldMm,
      unit: "mm"
    });
  }
  return requests;
}

export function assessAnthropometryWithProvider(
  input: AnthropometryInput,
  provider: LmsDatasetProvider
): AnthropometryAssessment {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (input.sex !== "male" && input.sex !== "female") errors.push("Sexo inválido.");
  validatePositive("Peso", input.weightKg, errors);
  validatePositive("Comprimento/altura", input.statureCm, errors);
  validatePositive("Perímetro cefálico", input.headCircumferenceCm, errors);
  validatePositive("Circunferência braquial", input.armCircumferenceCm, errors);
  validatePositive("Prega tricipital", input.tricepsSkinfoldMm, errors);
  validatePositive("Prega subescapular", input.subscapularSkinfoldMm, errors);

  let age = null;
  try {
    age = calculateExactAge(input.birthDate, input.assessmentDate);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Datas inválidas.");
  }
  if (!age || errors.length > 0) {
    return {
      age,
      reference: age ? selectReference(age) : null,
      adjustedStature: null,
      bmi: null,
      results: [],
      validity: { valid: false, warnings, errors }
    };
  }

  const reference = selectReference(age);
  if (!reference) {
    errors.push("Idade fora das referências WHO 2006/2007 suportadas.");
    return {
      age,
      reference: null,
      adjustedStature: null,
      bmi: null,
      results: [],
      validity: { valid: false, warnings, errors }
    };
  }

  const adjustedStature = input.statureCm === undefined
    ? null
    : adjustStature(age.days, input.statureCm, input.measurementPosition);
  if (adjustedStature && adjustedStature.providedPosition === null) {
    warnings.push(
      `Posição não informada; foi pressuposta ${adjustedStature.expectedPosition === "length" ? "comprimento deitado" : "altura em pé"}.`
    );
  }
  if (adjustedStature && adjustedStature.adjustmentCm !== 0) {
    warnings.push(
      `Medida ajustada em ${adjustedStature.adjustmentCm > 0 ? "+" : ""}${adjustedStature.adjustmentCm.toFixed(1)} cm conforme a posição recomendada pela OMS.`
    );
  }
  if (
    reference === "WHO_2007" &&
    input.measurementPosition === "length"
  ) {
    warnings.push("Comprimento deitado não foi convertido após 60 meses.");
  }
  const bmi = input.weightKg !== undefined && adjustedStature
    ? calculateBmi(input.weightKg, adjustedStature.adjustedCm)
    : null;
  const requests = buildRequests(
    input,
    reference,
    age.days,
    age.months,
    adjustedStature?.adjustedCm ?? null,
    bmi
  );
  const results = requests.map((request): AnthropometricResult => {
    if (request.invalidReason) {
      return unavailableResult(
        request,
        reference,
        input.sex,
        age.days,
        age.months,
        request.invalidReason
      );
    }
    const zScore = reference === "WHO_2006"
      ? scoreWho2006(
          provider,
          request.indicator,
          input.sex,
          age.days,
          request.measurement,
          request.lmsKey
        )
      : scoreWho2007(
          provider,
          request.indicator,
          input.sex,
          age.months,
          request.measurement
        );
    if (zScore === null || !Number.isFinite(zScore)) {
      return unavailableResult(
        request,
        reference,
        input.sex,
        age.days,
        age.months,
        "Medida fora do domínio oficial do indicador."
      );
    }
    return calculatedResult(
      request,
      reference,
      input.sex,
      age.days,
      age.months,
      zScore
    );
  });
  return {
    age,
    reference,
    adjustedStature,
    bmi,
    results,
    validity: {
      valid: errors.length === 0,
      warnings,
      errors
    }
  };
}

export function createAnthropometryAssessment(provider: LmsDatasetProvider) {
  return (input: AnthropometryInput): AnthropometryAssessment =>
    assessAnthropometryWithProvider(input, provider);
}

export function expectedPositionForAge(ageDays: number): MeasurementPosition {
  return ageDays < 731 ? "length" : "height";
}
