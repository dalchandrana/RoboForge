import type {
  CalculationOutput,
  CalculationStep,
  MotorPowerParams,
  MotorPowerResult,
} from './types';

/**
 * Calculates DC motor mechanical output power, electrical input power, and electro-mechanical efficiency.
 */
export function calculateMotorPower(params: MotorPowerParams): CalculationOutput<MotorPowerResult> {
  const { voltage: V, current: I, speedRpm: rpm, torqueNm: torque } = params;

  if (V <= 0 || I <= 0) {
    throw new Error('Voltage and current must be strictly greater than zero.');
  }
  if (rpm < 0 || torque < 0) {
    throw new Error('Speed (RPM) and torque must be non-negative.');
  }

  const steps: CalculationStep[] = [];
  const formula =
    'P_elec = V × I, ω = 2π × (RPM / 60), P_mech = Torque × ω, η = (P_mech / P_elec) × 100%';

  const pElec = V * I;
  const omegaRadS = (2 * Math.PI * rpm) / 60;
  const pMech = torque * omegaRadS;

  if (pMech > pElec * 1.05) {
    throw new Error(
      'Mechanical output power cannot exceed electrical input power (violates conservation of energy).',
    );
  }

  const efficiencyPercent = pElec > 0 ? Math.min((pMech / pElec) * 100, 100) : 0;
  const powerLossWatts = Math.max(pElec - pMech, 0);

  steps.push({
    label: 'Electrical Input Power',
    math: `P_elec = ${V} V × ${I} A = ${pElec.toFixed(2)} W`,
    explanation: 'Total electric power supplied to the motor terminals.',
  });

  steps.push({
    label: 'Angular Velocity (Radian Frequency)',
    math: `ω = 2π × (${rpm} RPM / 60) = ${omegaRadS.toFixed(2)} rad/s`,
    explanation:
      'Converts revolutions per minute to standard SI angular velocity in radians per second.',
  });

  steps.push({
    label: 'Mechanical Shaft Power',
    math: `P_mech = ${torque} N·m × ${omegaRadS.toFixed(2)} rad/s = ${pMech.toFixed(2)} W`,
    explanation: 'Useful mechanical work delivered at the output drive shaft.',
  });

  steps.push({
    label: 'Electro-Mechanical Efficiency & Thermal Loss',
    math: `η = (${pMech.toFixed(2)} W / ${pElec.toFixed(2)} W) × 100% = ${efficiencyPercent.toFixed(1)}% (Thermal loss: ${powerLossWatts.toFixed(2)} W)`,
    explanation:
      'Remaining input power is converted into heat through armature winding copper resistance (I²R) and mechanical bearing friction.',
  });

  return {
    result: {
      electricalPowerWatts: Number(pElec.toFixed(3)),
      mechanicalPowerWatts: Number(pMech.toFixed(3)),
      angularVelocityRadS: Number(omegaRadS.toFixed(3)),
      efficiencyPercent: Number(efficiencyPercent.toFixed(1)),
      powerLossWatts: Number(powerLossWatts.toFixed(3)),
    },
    formula,
    steps,
    unit: 'W / %',
  };
}
