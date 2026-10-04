import type { CalculationOutput, CalculationStep, PwmParams, PwmResult } from './types';

/**
 * Calculates PWM timing, duty cycle, Arduino analogWrite (0-255) register values, and filtered average voltage.
 */
export function calculatePwm(params: PwmParams): CalculationOutput<PwmResult> {
  const { frequencyHz, dutyCyclePercent, arduinoValue8Bit, peakVoltage = 5.0 } = params;

  if (frequencyHz <= 0) {
    throw new Error('PWM frequency must be strictly greater than zero.');
  }
  if (peakVoltage <= 0) {
    throw new Error('Peak voltage must be strictly greater than zero.');
  }

  let finalDuty = dutyCyclePercent;
  let final8Bit = arduinoValue8Bit;

  if (finalDuty === undefined && final8Bit === undefined) {
    throw new Error(
      'Provide either duty cycle percentage (0-100%) or Arduino 8-bit value (0-255).',
    );
  }

  if (finalDuty !== undefined) {
    if (finalDuty < 0 || finalDuty > 100) {
      throw new Error('Duty cycle percentage must be between 0% and 100%.');
    }
    final8Bit = Math.round((finalDuty / 100) * 255);
  } else if (final8Bit !== undefined) {
    if (final8Bit < 0 || final8Bit > 255) {
      throw new Error('Arduino 8-bit analogWrite value must be between 0 and 255.');
    }
    finalDuty = Number(((final8Bit / 255) * 100).toFixed(2));
  }

  const steps: CalculationStep[] = [];
  const formula =
    'Duty = (Ton / T) × 100%, Vavg = Vpeak × (Duty / 100), Value8Bit = (Duty / 100) × 255';

  const periodSeconds = 1 / frequencyHz;
  const periodMs = periodSeconds * 1000;
  const onTimeMs = periodMs * ((finalDuty ?? 0) / 100);
  const offTimeMs = periodMs - onTimeMs;
  const avgVoltage = peakVoltage * ((finalDuty ?? 0) / 100);

  steps.push({
    label: 'Waveform Period',
    math: `T = 1 / ${frequencyHz} Hz = ${periodMs.toFixed(3)} ms`,
    explanation: 'Total elapsed time for one complete PWM pulse cycle.',
  });

  steps.push({
    label: 'Pulse Width (Active High Time)',
    math: `Ton = ${periodMs.toFixed(3)} ms × ${finalDuty}% = ${onTimeMs.toFixed(3)} ms (Toff = ${offTimeMs.toFixed(3)} ms)`,
    explanation: 'Duration the digital signal remains driven HIGH during each period.',
  });

  steps.push({
    label: 'Average Output Voltage',
    math: `Vavg = ${peakVoltage} V × (${finalDuty}% / 100) = ${avgVoltage.toFixed(3)} V`,
    explanation: 'Effective DC voltage delivered to low-pass filters or resistive thermal loads.',
  });

  steps.push({
    label: 'Arduino analogWrite() Register',
    math: `OCR register value = (${finalDuty}% / 100) × 255 ≈ ${final8Bit}`,
    explanation:
      'Equivalent 8-bit timer compare register integer for Arduino analogWrite(pin, val).',
  });

  return {
    result: {
      dutyCyclePercent: finalDuty ?? 0,
      arduinoValue8Bit: final8Bit ?? 0,
      periodMs: Number(periodMs.toFixed(4)),
      onTimeMs: Number(onTimeMs.toFixed(4)),
      offTimeMs: Number(offTimeMs.toFixed(4)),
      averageVoltage: Number(avgVoltage.toFixed(3)),
      peakVoltage,
    },
    formula,
    steps,
    unit: '% / V',
  };
}
