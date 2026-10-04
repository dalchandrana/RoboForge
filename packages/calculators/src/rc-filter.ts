import type {
  CalculationOutput,
  CalculationStep,
  RcTimeConstantParams,
  RcTimeConstantResult,
} from './types';

/**
 * Calculates RC circuit time constant, cutoff frequency, and charging characteristics.
 */
export function calculateRcTimeConstant(
  params: RcTimeConstantParams,
): CalculationOutput<RcTimeConstantResult> {
  const { resistance: R, capacitanceUf: Cuf, supplyVoltage: V0 } = params;

  if (R <= 0 || Cuf <= 0) {
    throw new Error('Resistance and capacitance must be strictly greater than zero.');
  }

  const steps: CalculationStep[] = [];
  const formula = 'τ = R × C, fc = 1 / (2 × π × R × C), V(t) = V0 × (1 - e^(-t / τ))';

  const cFarads = Cuf * 1e-6;
  const tauSeconds = R * cFarads;
  const tauMs = tauSeconds * 1000;
  const fcHz = 1 / (2 * Math.PI * R * cFarads);

  steps.push({
    label: 'RC Time Constant (Tau τ)',
    math: `τ = ${R} Ω × (${Cuf} µF × 10⁻⁶) = ${tauSeconds >= 1 ? `${tauSeconds.toFixed(3)} s` : `${tauMs.toFixed(3)} ms`}`,
    explanation:
      'One time constant τ represents the time required to charge the capacitor to 63.2% of final voltage.',
  });

  steps.push({
    label: 'Cutoff Frequency (-3 dB Low-Pass Filter)',
    math: `fc = 1 / (2 × π × ${R} × ${cFarads.toExponential(2)}) = ${fcHz.toFixed(2)} Hz`,
    explanation:
      'The frequency where output power drops by half (-3 dB attenuation) in an RC filter.',
  });

  const t1 = tauMs;
  const t3 = tauMs * 3;
  const t5 = tauMs * 5;

  steps.push({
    label: 'Charging Milestones',
    math: `1τ (63.2%): ${t1.toFixed(2)} ms · 3τ (95.0%): ${t3.toFixed(2)} ms · 5τ (99.3%): ${t5.toFixed(2)} ms`,
    explanation:
      'Capacitors reach ~99.3% of source voltage at 5τ, commonly treated as full charge in digital and timing circuits.',
  });

  let voltageCurve: RcTimeConstantResult['voltageCurve'];
  if (V0 !== undefined && V0 > 0) {
    voltageCurve = {
      t1Tau: Number((V0 * (1 - Math.exp(-1))).toFixed(3)),
      t2Tau: Number((V0 * (1 - Math.exp(-2))).toFixed(3)),
      t3Tau: Number((V0 * (1 - Math.exp(-3))).toFixed(3)),
      t5Tau: Number((V0 * (1 - Math.exp(-5))).toFixed(3)),
    };

    steps.push({
      label: 'Transient Voltage Profile',
      math: `V(1τ) = ${voltageCurve.t1Tau} V · V(3τ) = ${voltageCurve.t3Tau} V · V(5τ) = ${voltageCurve.t5Tau} V (Source: ${V0} V)`,
      explanation: 'Exponential charge progression governed by V(t) = V0 × (1 - e^(-t/τ)).',
    });
  }

  return {
    result: {
      timeConstantSeconds: Number(tauSeconds.toFixed(6)),
      timeConstantMs: Number(tauMs.toFixed(3)),
      cutoffFrequencyHz: Number(fcHz.toFixed(3)),
      timeTo63PercentMs: Number(t1.toFixed(3)),
      timeTo95PercentMs: Number(t3.toFixed(3)),
      timeTo99PercentMs: Number(t5.toFixed(3)),
      voltageCurve,
    },
    formula,
    steps,
    unit: 's',
  };
}
