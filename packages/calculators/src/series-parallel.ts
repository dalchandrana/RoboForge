import type {
  CalculationOutput,
  CalculationStep,
  SeriesParallelParams,
  SeriesParallelResult,
} from './types';

/**
 * Calculates equivalent resistance and power distribution for series or parallel networks.
 */
export function calculateSeriesParallel(
  params: SeriesParallelParams,
): CalculationOutput<SeriesParallelResult> {
  const { resistors, mode, sourceVoltage } = params;

  if (!resistors || resistors.length < 2) {
    throw new Error('Provide at least 2 resistors for series or parallel calculation.');
  }

  for (const r of resistors) {
    if (r <= 0) {
      throw new Error('All resistor values must be strictly greater than zero.');
    }
  }

  const steps: CalculationStep[] = [];
  let equivalentResistance = 0;
  let formula = '';

  if (mode === 'series') {
    formula = 'Req = R1 + R2 + ... + Rn';
    equivalentResistance = resistors.reduce((sum, r) => sum + r, 0);

    steps.push({
      label: 'Sum Resistors (Series)',
      math: `Req = ${resistors.join(' + ')} = ${equivalentResistance.toFixed(2)} Ω`,
      explanation:
        'In a series circuit, resistances add directly because current traverses all resistors sequentially.',
    });
  } else {
    formula = '1 / Req = (1 / R1) + (1 / R2) + ... + (1 / Rn)';
    const reciprocalSum = resistors.reduce((sum, r) => sum + 1 / r, 0);
    equivalentResistance = 1 / reciprocalSum;

    const reciprocalsFormatted = resistors.map(r => `(1 / ${r})`).join(' + ');
    steps.push({
      label: 'Sum Conductances (Parallel)',
      math: `1 / Req = ${reciprocalsFormatted} = ${reciprocalSum.toFixed(6)} S`,
      explanation:
        'In a parallel circuit, total conductance is the sum of individual conductances.',
    });
    steps.push({
      label: 'Invert Total Conductance',
      math: `Req = 1 / ${reciprocalSum.toFixed(6)} = ${equivalentResistance.toFixed(2)} Ω`,
      explanation:
        'Equivalent parallel resistance is always lower than the smallest branch resistor.',
    });
  }

  let currents: number[] | undefined;
  let voltages: number[] | undefined;
  let powers: number[] | undefined;
  let totalPower: number | undefined;

  if (sourceVoltage !== undefined && sourceVoltage > 0) {
    totalPower = Number(((sourceVoltage * sourceVoltage) / equivalentResistance).toFixed(4));

    if (mode === 'series') {
      const commonCurrent = sourceVoltage / equivalentResistance;
      currents = resistors.map(() => Number(commonCurrent.toFixed(6)));
      voltages = resistors.map(r => Number((commonCurrent * r).toFixed(4)));
      powers = resistors.map(r => Number((commonCurrent * commonCurrent * r).toFixed(4)));

      steps.push({
        label: 'Series Current & Power Dissipation',
        math: `I_total = ${sourceVoltage} V / ${equivalentResistance.toFixed(2)} Ω = ${(commonCurrent * 1000).toFixed(2)} mA, P_total = ${totalPower.toFixed(3)} W`,
        explanation: 'Each resistor drops voltage proportionally to its resistance: Vi = I × Ri.',
      });
    } else {
      voltages = resistors.map(() => Number(sourceVoltage.toFixed(4)));
      currents = resistors.map(r => Number((sourceVoltage / r).toFixed(6)));
      powers = resistors.map(r => Number(((sourceVoltage * sourceVoltage) / r).toFixed(4)));

      steps.push({
        label: 'Parallel Branch Currents & Power Dissipation',
        math: `V_branch = ${sourceVoltage} V, P_total = ${totalPower.toFixed(3)} W`,
        explanation: 'Each branch experiences full supply voltage: Ii = V / Ri.',
      });
    }
  }

  return {
    result: {
      equivalentResistance: Number(equivalentResistance.toFixed(4)),
      mode,
      count: resistors.length,
      currents,
      voltages,
      powers,
      totalPower,
    },
    formula,
    steps,
    unit: 'Ω',
  };
}
