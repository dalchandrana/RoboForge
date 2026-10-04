import type {
  BatteryRuntimeParams,
  BatteryRuntimeResult,
  CalculationOutput,
  CalculationStep,
} from './types';

/**
 * Calculates battery operating life with duty cycle and real-world derating factors.
 */
export function calculateBatteryRuntime(
  params: BatteryRuntimeParams,
): CalculationOutput<BatteryRuntimeResult> {
  const {
    batteryCapacityMah: capacity,
    averageCurrentMa: activeMa,
    deratingFactor = 0.85,
    sleepCurrentMa = 0,
    dutyCyclePercent = 100,
  } = params;

  if (capacity <= 0 || activeMa < 0) {
    throw new Error('Battery capacity and active current must be positive values.');
  }
  if (deratingFactor <= 0 || deratingFactor > 1.0) {
    throw new Error(
      'Derating factor must be between 0.01 and 1.0 (recommended 0.85 for typical Li-ion/Alkaline).',
    );
  }
  if (dutyCyclePercent < 0 || dutyCyclePercent > 100) {
    throw new Error('Duty cycle must be between 0% and 100%.');
  }

  const steps: CalculationStep[] = [];
  const formula = 'Runtime = (Capacity × DeratingFactor) / I_effective';

  // Effective current based on duty cycle
  const activeFraction = dutyCyclePercent / 100;
  const sleepFraction = 1 - activeFraction;
  const effectiveAverageMa = activeMa * activeFraction + sleepCurrentMa * sleepFraction;

  if (effectiveAverageMa <= 0) {
    throw new Error('Effective average current must be greater than zero.');
  }

  const usableCapacityMah = capacity * deratingFactor;

  if (dutyCyclePercent < 100) {
    steps.push({
      label: 'Duty-Cycled Effective Current',
      math: `I_eff = (${activeMa} mA × ${dutyCyclePercent}%) + (${sleepCurrentMa} mA × ${(100 - dutyCyclePercent).toFixed(0)}%) = ${effectiveAverageMa.toFixed(2)} mA`,
      explanation:
        'Calculates the weighted time-average current consumption across active and low-power sleep states.',
    });
  }

  steps.push({
    label: 'Usable Battery Capacity',
    math: `C_usable = ${capacity} mAh × ${deratingFactor} = ${usableCapacityMah.toFixed(1)} mAh`,
    explanation:
      'Applies a safety derating factor (default 85%) for regulator losses, self-discharge, and Peukert effect.',
  });

  const estimatedHours = usableCapacityMah / effectiveAverageMa;
  const estimatedDays = estimatedHours / 24;

  let formatted = '';
  if (estimatedHours >= 48) {
    formatted = `${estimatedDays.toFixed(1)} days (~${Math.round(estimatedHours)} hours)`;
  } else if (estimatedHours >= 1) {
    const wholeHours = Math.floor(estimatedHours);
    const mins = Math.round((estimatedHours - wholeHours) * 60);
    formatted = `${wholeHours}h ${mins}m`;
  } else {
    formatted = `${Math.round(estimatedHours * 60)} minutes`;
  }

  steps.push({
    label: 'Estimated Operating Lifetime',
    math: `T = ${usableCapacityMah.toFixed(1)} mAh / ${effectiveAverageMa.toFixed(2)} mA = ${estimatedHours.toFixed(1)} hours (${formatted})`,
    explanation: 'Total expected continuous operating endurance until battery cutoff threshold.',
  });

  return {
    result: {
      estimatedHours: Number(estimatedHours.toFixed(2)),
      estimatedDays: Number(estimatedDays.toFixed(2)),
      formattedRuntime: formatted,
      effectiveAverageMa: Number(effectiveAverageMa.toFixed(3)),
      usableCapacityMah: Number(usableCapacityMah.toFixed(1)),
    },
    formula,
    steps,
    unit: 'hours',
  };
}
