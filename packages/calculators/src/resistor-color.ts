import type {
  CalculationOutput,
  CalculationStep,
  ResistanceToBandsResult,
  ResistorColorBand,
  ResistorColorCodeParams,
  ResistorColorCodeResult,
} from './types';
import { findNearestE12, findNearestE24, formatResistance } from './e-series';

export const COLOR_DIGITS: Record<ResistorColorBand, number | null> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  gray: 8,
  white: 9,
  gold: null,
  silver: null,
};

export const COLOR_MULTIPLIERS: Record<ResistorColorBand, number> = {
  black: 1, // 10^0
  brown: 10, // 10^1
  red: 100, // 10^2
  orange: 1000, // 10^3
  yellow: 10000, // 10^4
  green: 100000, // 10^5
  blue: 1000000, // 10^6
  violet: 10000000, // 10^7
  gray: 100000000, // 10^8
  white: 1000000000, // 10^9
  gold: 0.1, // 10^-1
  silver: 0.01, // 10^-2
};

export const COLOR_TOLERANCES: Partial<Record<ResistorColorBand, number>> = {
  brown: 1, // ±1%
  red: 2, // ±2%
  green: 0.5, // ±0.5%
  blue: 0.25, // ±0.25%
  violet: 0.1, // ±0.1%
  gray: 0.05, // ±0.05%
  gold: 5, // ±5%
  silver: 10, // ±10%
};

const MULTIPLIER_TO_COLOR: { multiplier: number; color: ResistorColorBand }[] = [
  { multiplier: 0.01, color: 'silver' },
  { multiplier: 0.1, color: 'gold' },
  { multiplier: 1, color: 'black' },
  { multiplier: 10, color: 'brown' },
  { multiplier: 100, color: 'red' },
  { multiplier: 1e3, color: 'orange' },
  { multiplier: 1e4, color: 'yellow' },
  { multiplier: 1e5, color: 'green' },
  { multiplier: 1e6, color: 'blue' },
  { multiplier: 1e7, color: 'violet' },
  { multiplier: 1e8, color: 'gray' },
  { multiplier: 1e9, color: 'white' },
];

const DIGIT_TO_COLOR: ResistorColorBand[] = [
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'gray',
  'white',
];

/**
 * Calculates resistance and tolerance from 4 or 5 color bands.
 */
export function calculateResistorColorCode(
  params: ResistorColorCodeParams,
): CalculationOutput<ResistorColorCodeResult> {
  const { bands } = params;

  if (bands.length !== 4 && bands.length !== 5) {
    throw new Error('Resistor color code requires exactly 4 or 5 color bands.');
  }

  const steps: CalculationStep[] = [];
  let baseValue = 0;
  let multiplierBand: ResistorColorBand;
  let toleranceBand: ResistorColorBand;
  let formula = '';

  if (bands.length === 4) {
    const b0 = bands[0];
    const b1 = bands[1];
    const b2 = bands[2];
    const b3 = bands[3];
    if (!b0 || !b1 || !b2 || !b3) {
      throw new Error('4-band resistor requires 4 valid bands.');
    }
    const d1 = COLOR_DIGITS[b0];
    const d2 = COLOR_DIGITS[b1];
    if (d1 === null || d2 === null || d1 === undefined || d2 === undefined) {
      throw new Error('First two bands of a 4-band resistor must be digit colors (black-white).');
    }
    baseValue = d1 * 10 + d2;
    multiplierBand = b2;
    toleranceBand = b3;
    formula = 'R = (Digit1 × 10 + Digit2) × Multiplier ± Tolerance';

    steps.push({
      label: 'Read Digits',
      math: `Band 1 (${b0} = ${d1}), Band 2 (${b1} = ${d2}) → ${baseValue}`,
      explanation: 'First two bands form the two-digit significant figure.',
    });
  } else {
    const b0 = bands[0];
    const b1 = bands[1];
    const b2 = bands[2];
    const b3 = bands[3];
    const b4 = bands[4];
    if (!b0 || !b1 || !b2 || !b3 || !b4) {
      throw new Error('5-band resistor requires 5 valid bands.');
    }
    const d1 = COLOR_DIGITS[b0];
    const d2 = COLOR_DIGITS[b1];
    const d3 = COLOR_DIGITS[b2];
    if (
      d1 === null ||
      d2 === null ||
      d3 === null ||
      d1 === undefined ||
      d2 === undefined ||
      d3 === undefined
    ) {
      throw new Error('First three bands of a 5-band resistor must be digit colors.');
    }
    baseValue = d1 * 100 + d2 * 10 + d3;
    multiplierBand = b3;
    toleranceBand = b4;
    formula = 'R = (Digit1 × 100 + Digit2 × 10 + Digit3) × Multiplier ± Tolerance';

    steps.push({
      label: 'Read Digits',
      math: `Band 1 (${b0} = ${d1}), Band 2 (${b1} = ${d2}), Band 3 (${b2} = ${d3}) → ${baseValue}`,
      explanation: 'First three bands form the three-digit precision significant figure.',
    });
  }

  const multiplier = COLOR_MULTIPLIERS[multiplierBand];
  if (multiplier === undefined) {
    throw new Error(`Invalid multiplier band: ${multiplierBand}`);
  }

  const tolerance = COLOR_TOLERANCES[toleranceBand] ?? 20; // default 20% if none
  const resistance = Number((baseValue * multiplier).toFixed(4));

  steps.push({
    label: 'Apply Multiplier',
    math: `${baseValue} × ${multiplier} (${multiplierBand}) = ${resistance} Ω`,
    explanation: 'Multiply significant digits by the decade multiplier.',
  });

  const minR = Number((resistance * (1 - tolerance / 100)).toFixed(2));
  const maxR = Number((resistance * (1 + tolerance / 100)).toFixed(2));

  steps.push({
    label: 'Calculate Tolerance Window',
    math: `±${tolerance}% (${toleranceBand}) → [${minR} Ω to ${maxR} Ω]`,
    explanation: 'Calculates acceptable manufacturing variation range.',
  });

  const formatted = `${formatResistance(resistance)} ±${tolerance}%`;

  return {
    result: {
      resistance,
      tolerancePercent: tolerance,
      formattedResistance: formatted,
      minResistance: minR,
      maxResistance: maxR,
    },
    formula,
    steps,
    unit: 'Ω',
  };
}

/**
 * Converts a target resistance value in Ohms to 4-band and 5-band color arrays.
 */
export function resistanceToColorBands(targetOhms: number): ResistanceToBandsResult {
  if (targetOhms <= 0) {
    throw new Error('Resistance must be strictly positive.');
  }

  const standardE12 = findNearestE12(targetOhms);
  const standardE24 = findNearestE24(targetOhms);

  // Encode 4-band from standard E12 or target
  const bands4 = encode4Band(targetOhms);
  const bands5 = encode5Band(targetOhms);

  return {
    bands4,
    bands5,
    standardE12Value: standardE12,
    standardE24Value: standardE24,
  };
}

function encode4Band(ohms: number): ResistorColorBand[] {
  const exp = Math.floor(Math.log10(ohms));
  const decade = Math.pow(10, exp - 1);
  const twoDigits = Math.round(ohms / decade);

  const clampedDigits = Math.min(Math.max(twoDigits, 10), 99);
  const d1 = Math.floor(clampedDigits / 10);
  const d2 = clampedDigits % 10;

  const multiplierVal = ohms / clampedDigits;
  let closestMult: ResistorColorBand = 'black';
  let minDiff = Infinity;
  for (const entry of MULTIPLIER_TO_COLOR) {
    const diff = Math.abs(Math.log10(entry.multiplier) - Math.log10(multiplierVal));
    if (diff < minDiff) {
      minDiff = diff;
      closestMult = entry.color;
    }
  }

  const col1 = DIGIT_TO_COLOR[d1] ?? 'brown';
  const col2 = DIGIT_TO_COLOR[d2] ?? 'black';
  return [col1, col2, closestMult, 'gold']; // standard 5% gold
}

function encode5Band(ohms: number): ResistorColorBand[] {
  const exp = Math.floor(Math.log10(ohms));
  const decade = Math.pow(10, exp - 2);
  const threeDigits = Math.round(ohms / decade);

  const clampedDigits = Math.min(Math.max(threeDigits, 100), 999);
  const d1 = Math.floor(clampedDigits / 100);
  const d2 = Math.floor((clampedDigits % 100) / 10);
  const d3 = clampedDigits % 10;

  const multiplierVal = ohms / clampedDigits;
  let closestMult: ResistorColorBand = 'black';
  let minDiff = Infinity;
  for (const entry of MULTIPLIER_TO_COLOR) {
    const diff = Math.abs(Math.log10(entry.multiplier) - Math.log10(multiplierVal));
    if (diff < minDiff) {
      minDiff = diff;
      closestMult = entry.color;
    }
  }

  const col1 = DIGIT_TO_COLOR[d1] ?? 'yellow';
  const col2 = DIGIT_TO_COLOR[d2] ?? 'violet';
  const col3 = DIGIT_TO_COLOR[d3] ?? 'black';
  return [col1, col2, col3, closestMult, 'brown']; // 1% precision brown
}
