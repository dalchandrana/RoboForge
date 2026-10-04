import type {
  CalculationOutput,
  CalculationStep,
  LedResistorParams,
  LedResistorResult,
} from './types';
import { findNearestE12, findNearestE24 } from './e-series';

/**
 * Calculates current-limiting series resistor for an LED, standard E-series sizing, and wattage rating.
 */
export function calculateLedResistor(
  params: LedResistorParams,
): CalculationOutput<LedResistorResult> {
  const { supplyVoltage: Vs, forwardVoltage: Vf, forwardCurrentMa: IfMa } = params;

  if (Vs <= 0 || Vf <= 0 || IfMa <= 0) {
    throw new Error('Supply voltage, forward voltage, and current must all be strictly positive.');
  }

  if (Vs <= Vf) {
    throw new Error(
      `Supply voltage (${Vs} V) must be greater than LED forward voltage (${Vf} V) to conduct current.`,
    );
  }

  const steps: CalculationStep[] = [];
  const formula = 'R = (Vs - Vf) / If, P = (Vs - Vf) × If';

  const ifAmps = IfMa / 1000;
  const voltageDrop = Vs - Vf;
  const calculatedR = voltageDrop / ifAmps;

  steps.push({
    label: 'Voltage Across Resistor',
    math: `V_R = Vs - Vf = ${Vs} V - ${Vf} V = ${voltageDrop.toFixed(2)} V`,
    explanation:
      'The current-limiting resistor absorbs all remaining voltage above the LED forward threshold.',
  });

  steps.push({
    label: "Required Resistance (Ohm's Law)",
    math: `R = ${voltageDrop.toFixed(2)} V / ${ifAmps} A (${IfMa} mA) = ${calculatedR.toFixed(2)} Ω`,
    explanation: 'Calculated theoretical resistance to fix operating current.',
  });

  const standardE12 = findNearestE12(calculatedR);
  const standardE24 = findNearestE24(calculatedR);

  // We choose standard E12 (most common for beginners) for physical ratings
  const chosenR = standardE12;
  const actualCurrentAmps = voltageDrop / chosenR;
  const actualCurrentMa = actualCurrentAmps * 1000;
  const resistorPower = actualCurrentAmps * actualCurrentAmps * chosenR;
  const ledPower = Vf * actualCurrentAmps;

  steps.push({
    label: 'Standard Resistor Selection',
    math: `Calculated ${calculatedR.toFixed(1)} Ω → Nearest E12: ${standardE12} Ω (E24: ${standardE24} Ω)`,
    explanation:
      'Select the nearest commercially standard resistor. Using a slightly higher value increases LED lifespan.',
  });

  // Power rating recommendation with 2x safety margin
  let recommendedRating = '1/4 W (0.25 W)';
  const minSafePower = resistorPower * 2;
  if (minSafePower <= 0.125) {
    recommendedRating = '1/8 W (0.125 W)';
  } else if (minSafePower <= 0.25) {
    recommendedRating = '1/4 W (0.25 W)';
  } else if (minSafePower <= 0.5) {
    recommendedRating = '1/2 W (0.50 W)';
  } else if (minSafePower <= 1.0) {
    recommendedRating = '1 W';
  } else {
    recommendedRating = `${Math.ceil(minSafePower)} W High Power Resistor`;
  }

  steps.push({
    label: 'Power Dissipation & Safety Headroom',
    math: `P_R = (${actualCurrentMa.toFixed(1)} mA)² × ${chosenR} Ω = ${(resistorPower * 1000).toFixed(1)} mW → Recommend ${recommendedRating}`,
    explanation:
      'Apply a 2× safety factor to prevent thermal degradation and resistor overheating.',
  });

  return {
    result: {
      calculatedResistance: Number(calculatedR.toFixed(2)),
      standardE12Resistance: standardE12,
      standardE24Resistance: standardE24,
      actualCurrentMa: Number(actualCurrentMa.toFixed(2)),
      resistorPowerWatts: Number(resistorPower.toFixed(4)),
      recommendedRatingWatts: recommendedRating,
      ledPowerWatts: Number(ledPower.toFixed(4)),
    },
    formula,
    steps,
    unit: 'Ω',
  };
}
