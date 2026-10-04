import type {
  CalculationOutput,
  CalculationStep,
  MetricPrefix,
  UnitCategory,
  UnitConverterParams,
  UnitConverterResult,
} from './types';

export const PREFIX_EXPONENTS: Record<MetricPrefix, number> = {
  pico: -12,
  nano: -9,
  micro: -6,
  milli: -3,
  base: 0,
  kilo: 3,
  mega: 6,
  giga: 9,
};

export const PREFIX_SYMBOLS: Record<MetricPrefix, string> = {
  pico: 'p',
  nano: 'n',
  micro: 'µ',
  milli: 'm',
  base: '',
  kilo: 'k',
  mega: 'M',
  giga: 'G',
};

export const CATEGORY_SYMBOLS: Record<UnitCategory, string> = {
  resistance: 'Ω',
  capacitance: 'F',
  current: 'A',
  voltage: 'V',
  frequency: 'Hz',
  power: 'W',
};

export const CATEGORY_NAMES: Record<UnitCategory, string> = {
  resistance: 'Resistance (Ohms)',
  capacitance: 'Capacitance (Farads)',
  current: 'Electric Current (Amperes)',
  voltage: 'Electric Potential (Volts)',
  frequency: 'Frequency (Hertz)',
  power: 'Power (Watts)',
};

/**
 * Converts SI units and metric prefixes with explicit exponential scaling steps.
 */
export function calculateUnitConversion(
  params: UnitConverterParams,
): CalculationOutput<UnitConverterResult> {
  const { value, category, fromPrefix, toPrefix } = params;

  if (isNaN(value)) {
    throw new Error('Please enter a valid numeric value to convert.');
  }

  const steps: CalculationStep[] = [];
  const formula = 'BaseValue = Value × 10^(Exp_from), Converted = BaseValue / 10^(Exp_to)';

  const fromExp = PREFIX_EXPONENTS[fromPrefix];
  const toExp = PREFIX_EXPONENTS[toPrefix];
  const unitSym = CATEGORY_SYMBOLS[category];

  const baseMultiplier = Math.pow(10, fromExp);
  const baseValue = value * baseMultiplier;

  const toDivisor = Math.pow(10, toExp);
  const convertedValue = baseValue / toDivisor;

  const fromLabel = `${PREFIX_SYMBOLS[fromPrefix]}${unitSym}`;
  const toLabel = `${PREFIX_SYMBOLS[toPrefix]}${unitSym}`;

  steps.push({
    label: 'Convert to SI Base Unit',
    math: `${value} ${fromLabel} × 10^(${fromExp}) = ${baseValue.toExponential(4)} ${unitSym}`,
    explanation: `Normalizes the input quantity to the fundamental SI base unit (${unitSym}).`,
  });

  const deltaExp = fromExp - toExp;
  steps.push({
    label: 'Scale to Target Metric Prefix',
    math: `${baseValue.toExponential(4)} ${unitSym} / 10^(${toExp}) = ${convertedValue} ${toLabel} (scale factor: 10^${deltaExp})`,
    explanation: `Multiplies by 10^(${deltaExp}) to express the quantity in ${toPrefix}${unitSym}.`,
  });

  // Engineering notation representation
  const engExp = Math.floor(Math.log10(Math.abs(baseValue === 0 ? 1 : baseValue)) / 3) * 3;
  const engMantissa = baseValue / Math.pow(10, engExp);
  const engNotation = `${engMantissa.toFixed(3)} × 10^${engExp} ${unitSym}`;

  return {
    result: {
      originalValue: value,
      convertedValue,
      baseValue,
      fromLabel,
      toLabel,
      engineeringNotation: engNotation,
    },
    formula,
    steps,
    unit: toLabel,
  };
}
