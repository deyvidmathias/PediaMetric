import type { LmsParameters, LmsTuple } from "../types.ts";

export function lmsZScore(measurement: number, parameters: LmsParameters): number {
  const { l, m, s } = parameters;
  if (![measurement, l, m, s].every(Number.isFinite) || measurement <= 0 || m <= 0 || s <= 0) {
    throw new RangeError("Medida e parâmetros LMS devem ser finitos e positivos.");
  }
  if (Math.abs(l) < 1e-12) return Math.log(measurement / m) / s;
  return (((measurement / m) ** l) - 1) / (s * l);
}

export function measurementAtZ(zScore: number, parameters: LmsParameters): number {
  const { l, m, s } = parameters;
  if (Math.abs(l) < 1e-12) return m * Math.exp(s * zScore);
  const base = 1 + l * s * zScore;
  if (base <= 0) throw new RangeError("Z fora do domínio dos parâmetros LMS.");
  return m * (base ** (1 / l));
}

export function restrictedLmsZScore(
  measurement: number,
  parameters: LmsParameters
): number {
  const raw = lmsZScore(measurement, parameters);
  if (raw > 3) {
    const sd3 = measurementAtZ(3, parameters);
    const distance23 = sd3 - measurementAtZ(2, parameters);
    return 3 + ((measurement - sd3) / distance23);
  }
  if (raw < -3) {
    const sd3 = measurementAtZ(-3, parameters);
    const distance23 = measurementAtZ(-2, parameters) - sd3;
    return -3 + ((measurement - sd3) / distance23);
  }
  return raw;
}

export function parametersFromTuple(tuple: LmsTuple): LmsParameters {
  return { l: tuple[1], m: tuple[2], s: tuple[3] };
}

export function findExactTuple(rows: readonly LmsTuple[], key: number): LmsTuple | null {
  let low = 0;
  let high = rows.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const tuple = rows[middle];
    if (!tuple) return null;
    if (Math.abs(tuple[0] - key) < 1e-9) return tuple;
    if (tuple[0] < key) low = middle + 1;
    else high = middle - 1;
  }
  return null;
}

export function interpolateParametersByKey(
  rows: readonly LmsTuple[],
  key: number,
  step: number
): LmsParameters | null {
  const scaled = key / step;
  const lowIndex = Math.floor(scaled + 1e-10);
  const lowKey = lowIndex * step;
  const fraction = scaled - lowIndex;
  const low = findExactTuple(rows, lowKey);
  if (!low) return null;
  if (Math.abs(fraction) < 1e-9) return parametersFromTuple(low);
  const high = findExactTuple(rows, (lowIndex + 1) * step);
  if (!high) return null;
  return {
    l: low[1] + fraction * (high[1] - low[1]),
    m: low[2] + fraction * (high[2] - low[2]),
    s: low[3] + fraction * (high[3] - low[3])
  };
}

