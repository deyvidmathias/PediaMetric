export function calculateBmi(weightKg: number, statureCm: number): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new RangeError("Peso deve ser maior que zero.");
  }
  if (!Number.isFinite(statureCm) || statureCm <= 0) {
    throw new RangeError("Comprimento/altura deve ser maior que zero.");
  }
  return weightKg / ((statureCm / 100) ** 2);
}

