// Numerical Recipes erfc approximation; max absolute error is about 1.2e-7.
function erfc(value: number): number {
  const z = Math.abs(value);
  const t = 1 / (1 + z / 2);
  const result = t * Math.exp(
    -z * z - 1.26551223 + t * (
      1.00002368 + t * (
        0.37409196 + t * (
          0.09678418 + t * (
            -0.18628806 + t * (
              0.27886807 + t * (
                -1.13520398 + t * (
                  1.48851587 + t * (-0.82215223 + t * 0.17087277)
                )
              )
            )
          )
        )
      )
    )
  );
  return value >= 0 ? result : 2 - result;
}

export function zScoreToPercentile(zScore: number): number {
  if (!Number.isFinite(zScore)) throw new RangeError("Escore Z deve ser finito.");
  if (zScore === 0) return 50;
  return 50 * erfc(-zScore / Math.SQRT2);
}
