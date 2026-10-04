import type { CalculationOutput, CalculationStep, OhmsLawParams, OhmsLawResult } from './types';

/**
 * Solves Ohm's law and power dissipation given any 2 parameters.
 * V = I * R, P = V * I = I^2 * R = V^2 / R
 */
export function calculateOhmsLaw(params: OhmsLawParams): CalculationOutput<OhmsLawResult> {
  const { voltage: V, current: I, resistance: R } = params;

  const count = [V, I, R].filter(v => v !== undefined && !isNaN(v)).length;
  if (count < 2) {
    throw new Error("Provide at least 2 parameters to calculate Ohm's law.");
  }

  let finalV = V;
  let finalI = I;
  let finalR = R;
  const steps: CalculationStep[] = [];
  let formula = '';

  if (finalV !== undefined && finalI !== undefined) {
    if (finalI === 0) {
      throw new Error('Current cannot be zero when calculating resistance.');
    }
    finalR = finalV / finalI;
    formula = 'R = V / I, P = V × I';
    steps.push({
      label: 'Find Resistance',
      math: `R = ${finalV} V / ${finalI} A = ${finalR.toFixed(2)} Ω`,
      explanation: 'Resistance equals voltage divided by current.',
    });
  } else if (finalV !== undefined && finalR !== undefined) {
    if (finalR <= 0) {
      throw new Error('Resistance must be strictly positive.');
    }
    finalI = finalV / finalR;
    formula = 'I = V / R, P = V × I';
    steps.push({
      label: 'Find Current',
      math: `I = ${finalV} V / ${finalR} Ω = ${finalI.toFixed(4)} A`,
      explanation: 'Current equals voltage divided by resistance.',
    });
  } else if (finalI !== undefined && finalR !== undefined) {
    finalV = finalI * finalR;
    formula = 'V = I × R, P = V × I';
    steps.push({
      label: 'Find Voltage',
      math: `V = ${finalI} A × ${finalR} Ω = ${finalV.toFixed(2)} V`,
      explanation: 'Voltage equals current multiplied by resistance.',
    });
  }

  const finalPower = (finalV ?? 0) * (finalI ?? 0);
  steps.push({
    label: 'Calculate Power',
    math: `P = ${finalV} V × ${finalI} A = ${finalPower.toFixed(4)} W`,
    explanation: 'Electric power dissipation equals voltage times current.',
  });

  return {
    result: {
      voltage: Number((finalV ?? 0).toFixed(4)),
      current: Number((finalI ?? 0).toFixed(4)),
      resistance: Number((finalR ?? 0).toFixed(4)),
      power: Number(finalPower.toFixed(4)),
    },
    formula,
    steps,
    unit: 'SI (V, A, Ω, W)',
  };
}
