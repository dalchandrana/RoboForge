import type { CalculationOutput, CalculationStep, GearRatioParams, GearRatioResult } from './types';

/**
 * Calculates gear ratio, speed reduction, output torque, and mechanical advantage for robotic gearboxes.
 */
export function calculateGearRatio(params: GearRatioParams): CalculationOutput<GearRatioResult> {
  const { driverTeeth, drivenTeeth, inputRpm, inputTorqueNm, efficiencyPercent = 90 } = params;

  if (driverTeeth <= 0 || drivenTeeth <= 0) {
    throw new Error('Gear tooth counts must be strictly positive integers.');
  }
  if (inputRpm < 0 || inputTorqueNm < 0) {
    throw new Error('Input RPM and torque must be non-negative.');
  }
  if (efficiencyPercent <= 0 || efficiencyPercent > 100) {
    throw new Error('Gearbox efficiency must be between 1% and 100%.');
  }

  const steps: CalculationStep[] = [];
  const formula =
    'GR = N_driven / N_driver, RPM_out = RPM_in / GR, Torque_out = Torque_in × GR × η';

  const gearRatio = drivenTeeth / driverTeeth;
  const efficiency = efficiencyPercent / 100;
  const outputRpm = inputRpm / gearRatio;
  const outputTorqueNm = inputTorqueNm * gearRatio * efficiency;
  const outputTorqueKgCm = outputTorqueNm * 10.197162;

  steps.push({
    label: 'Gear Ratio (GR)',
    math: `GR = ${drivenTeeth} (driven) / ${driverTeeth} (driver) = ${gearRatio.toFixed(3)} : 1`,
    explanation:
      gearRatio > 1
        ? 'Reduction gearing: Trades angular velocity for increased rotational torque.'
        : gearRatio < 1
          ? 'Overdrive gearing: Increases rotational speed at the expense of output torque.'
          : 'Direct 1:1 drive: Speed and torque remain unchanged.',
  });

  steps.push({
    label: 'Output Rotational Speed',
    math: `RPM_out = ${inputRpm} RPM / ${gearRatio.toFixed(2)} = ${outputRpm.toFixed(1)} RPM`,
    explanation: 'Rotational speed reduces proportionally to the gear ratio.',
  });

  steps.push({
    label: 'Output Shaft Torque with Gearbox Losses',
    math: `Torque_out = ${inputTorqueNm} N·m × ${gearRatio.toFixed(2)} × ${efficiencyPercent}% = ${outputTorqueNm.toFixed(3)} N·m (${outputTorqueKgCm.toFixed(2)} kg·cm)`,
    explanation: `Torque multiplication accounts for mechanical tooth friction and bearing drag (losses = ${100 - efficiencyPercent}%).`,
  });

  return {
    result: {
      gearRatio: Number(gearRatio.toFixed(3)),
      outputRpm: Number(outputRpm.toFixed(1)),
      outputTorqueNm: Number(outputTorqueNm.toFixed(4)),
      outputTorqueKgCm: Number(outputTorqueKgCm.toFixed(3)),
      mechanicalAdvantage: Number((gearRatio * efficiency).toFixed(3)),
      speedReductionFactor: Number(gearRatio.toFixed(3)),
    },
    formula,
    steps,
    unit: 'ratio / N·m',
  };
}
