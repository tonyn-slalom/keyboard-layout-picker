/** Returns the median of a numeric array. Returns 0 for empty arrays. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Population standard deviation of a numeric array. Returns 0 for arrays with <2 elements. */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Returns the median of the values after trimming the top `trimPct` fraction
 * (removes outlier hesitations). e.g. trimPct=0.1 drops the slowest 10%.
 */
export function trimmedMedian(values: number[], trimPct = 0.1): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const cutoff = Math.floor(sorted.length * (1 - trimPct));
  return median(sorted.slice(0, Math.max(1, cutoff)));
}

/** Min-max normalizes a value to [0, 1]. Returns 0.5 if min === max. */
export function minMaxNorm(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Returns a closure that normalizes a single layout's stat value
 * across all layouts using min-max normalization.
 */
export function normalizeAcrossLayouts<T>(
  layouts: T[],
  statFn: (l: T) => number,
): (l: T) => number {
  const values = layouts.map(statFn);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (l: T) => minMaxNorm(statFn(l), min, max);
}
