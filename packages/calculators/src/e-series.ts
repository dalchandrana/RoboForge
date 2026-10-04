/**
 * Standard E-series (E12 and E24) resistor values and engineering helpers.
 */

export const E12_BASE = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

export const E24_BASE = [
  10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91,
];

/**
 * Finds the nearest standard resistor value from a base decade series.
 */
export function findNearestESeries(value: number, series: number[]): number {
  const fallback = series[0] ?? 10;
  if (value <= 0) return fallback;

  const exponent = Math.floor(Math.log10(value));
  const decade = Math.pow(10, exponent - 1);
  const normalized = value / decade;

  let closest = fallback;
  let minDiff = Math.abs(normalized - fallback);

  for (const item of series) {
    const diff = Math.abs(normalized - item);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }

  // Also check wrapping to next decade
  const nextDecadeDiff = Math.abs(normalized - 100);
  if (nextDecadeDiff < minDiff) {
    return Math.round(100 * decade);
  }

  return Math.round(closest * decade * 100) / 100;
}

export function findNearestE12(value: number): number {
  return findNearestESeries(value, E12_BASE);
}

export function findNearestE24(value: number): number {
  return findNearestESeries(value, E24_BASE);
}

/**
 * Formats a resistance value to human-readable SI engineering notation (e.g. 4.7 kΩ, 1 MΩ).
 */
export function formatResistance(ohms: number): string {
  if (ohms >= 1e6) {
    const val = ohms / 1e6;
    return `${Number(val.toFixed(2))} MΩ`;
  }
  if (ohms >= 1e3) {
    const val = ohms / 1e3;
    return `${Number(val.toFixed(2))} kΩ`;
  }
  return `${Number(ohms.toFixed(2))} Ω`;
}
