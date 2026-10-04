import type {
  CalculationOutput,
  CalculationStep,
  VoltageDividerParams,
  VoltageDividerResult,
} from './types';

/**
 * Calculates unloaded and loaded voltage divider outputs, attenuation ratio, and power dissipation.
 */
export function calculateVoltageDivider(
  params: VoltageDividerParams,
): CalculationOutput<VoltageDividerResult> {
  const { inputVoltage: Vin, r1, r2, loadResistance: RL } = params;

  if (r1 <= 0 || r2 <= 0) {
    throw new Error('Divider resistances R1 and R2 must be strictly greater than zero.');
  }
  if (RL !== undefined && RL <= 0) {
    throw new Error('Load resistance RL must be strictly greater than zero.');
  }

  const steps: CalculationStep[] = [];
  const formula = 'Vout = Vin × [R2 / (R1 + R2)]';

  // Unloaded
  const totalR = r1 + r2;
  const unloadedVout = Vin * (r2 / totalR);
  const attenuationRatio = r2 / totalR;
  const dividerCurrent = Vin / totalR;
  const r1Power = dividerCurrent * dividerCurrent * r1;
  const r2Power = dividerCurrent * dividerCurrent * r2;

  steps.push({
    label: 'Unloaded Divider Equation',
    math: `Vout = ${Vin} V × [${r2} Ω / (${r1} Ω + ${r2} Ω)] = ${unloadedVout.toFixed(3)} V`,
    explanation:
      'Unloaded output voltage is determined solely by the ratio of R2 to total series resistance.',
  });

  steps.push({
    label: 'Divider Branch Current',
    math: `I_divider = ${Vin} V / ${totalR} Ω = ${(dividerCurrent * 1000).toFixed(2)} mA`,
    explanation:
      'Quiescent current continuously drawn from the source through the divider resistors.',
  });

  let loadedVout = unloadedVout;
  if (RL !== undefined) {
    const r2Equivalent = (r2 * RL) / (r2 + RL);
    loadedVout = Vin * (r2Equivalent / (r1 + r2Equivalent));

    steps.push({
      label: 'Parallel Loading Effect (R2 || RL)',
      math: `R2_eff = (${r2} × ${RL}) / (${r2} + ${RL}) = ${r2Equivalent.toFixed(2)} Ω`,
      explanation:
        'When a load is attached across R2, it forms a parallel combination, lowering effective resistance.',
    });

    steps.push({
      label: 'Loaded Output Voltage',
      math: `Vout_loaded = ${Vin} V × [${r2Equivalent.toFixed(2)} / (${r1} + ${r2Equivalent.toFixed(2)})] = ${loadedVout.toFixed(3)} V`,
      explanation: `Loading causes the output voltage to sag by ${(unloadedVout - loadedVout).toFixed(3)} V. Maintain RL >> R2 to avoid loading.`,
    });
  }

  return {
    result: {
      unloadedVoltage: Number(unloadedVout.toFixed(4)),
      loadedVoltage: Number(loadedVout.toFixed(4)),
      dividerCurrent: Number(dividerCurrent.toFixed(6)),
      r1Power: Number(r1Power.toFixed(4)),
      r2Power: Number(r2Power.toFixed(4)),
      attenuationRatio: Number(attenuationRatio.toFixed(4)),
    },
    formula,
    steps,
    unit: 'V',
  };
}
