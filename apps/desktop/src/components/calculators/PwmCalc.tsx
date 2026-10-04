import React, { useState } from 'react';
import { calculatePwm, type CalculationOutput, type PwmResult } from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const PwmCalc: React.FC = () => {
  const [freqHz, setFreqHz] = useState('490');
  const [dutyPercent, setDutyPercent] = useState('50');
  const [peakV, setPeakV] = useState('5.0');
  const [error, setError] = useState('');

  let output: CalculationOutput<PwmResult> | null = null;
  try {
    const f = parseFloat(freqHz);
    const d = parseFloat(dutyPercent);
    const v = parseFloat(peakV);
    if (!isNaN(f) && !isNaN(d) && !isNaN(v)) {
      output = calculatePwm({ frequencyHz: f, dutyCyclePercent: d, peakVoltage: v });
    }
  } catch (err) {
    if (!error) setError((err as Error).message);
  }

  const handleDutyChange = (val: string) => {
    setError('');
    setDutyPercent(val);
  };

  const handleArduinoByteChange = (byteVal: number) => {
    setError('');
    const duty = Number(((byteVal / 255) * 100).toFixed(1));
    setDutyPercent(duty.toString());
  };

  const summaryCards = output
    ? [
        {
          label: 'Duty Cycle',
          value: `${output.result.dutyCyclePercent}%`,
          subtext: `Ton: ${output.result.onTimeMs} ms`,
          highlight: true,
        },
        {
          label: 'Arduino 8-Bit (OCR)',
          value: `${output.result.arduinoValue8Bit} / 255`,
          subtext: `analogWrite(pin, ${output.result.arduinoValue8Bit})`,
          highlight: true,
        },
        {
          label: 'Filtered Average Voltage',
          value: `${output.result.averageVoltage} V`,
          subtext: `Peak: ${output.result.peakVoltage} V`,
        },
        {
          label: 'Cycle Period (T)',
          value: `${output.result.periodMs} ms`,
          subtext: `${freqHz} Hz`,
        },
      ]
    : [];

  const dutyNum = parseFloat(dutyPercent) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>〰️</span> Pulse Width Modulation (PWM) & Filtering
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Analyze digital square waves, timer periods, Arduino 8-bit registers, and smoothed DC
            voltages.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          Vavg = Vpeak × (Duty / 100)
        </span>
      </div>

      {/* Visual PWM Waveform Bar */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-border-subtle space-y-2">
        <div className="flex items-center justify-between text-xs text-text-muted font-mono">
          <span>HIGH (Ton = {output?.result.onTimeMs ?? 0} ms)</span>
          <span>LOW (Toff = {output?.result.offTimeMs ?? 0} ms)</span>
        </div>
        <div className="h-8 w-full bg-slate-950 rounded-lg overflow-hidden border border-border-subtle flex">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-150 flex items-center justify-center text-[10px] font-bold text-white font-mono"
            style={{ width: `${Math.min(Math.max(dutyNum, 0), 100)}%` }}
          >
            {dutyNum >= 10 ? `${dutyNum}%` : ''}
          </div>
          <div className="flex-1 bg-slate-900 flex items-center justify-center text-[10px] font-mono text-text-muted">
            {100 - dutyNum >= 10 ? `${(100 - dutyNum).toFixed(1)}%` : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="pwm-freq"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            PWM Frequency (Hz)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="pwm-freq"
              type="number"
              value={freqHz}
              onChange={e => setFreqHz(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
            />
            <button
              onClick={() => setFreqHz('490')}
              className="px-2 py-1 bg-slate-800 text-sky-300 text-xs rounded font-mono hover:bg-slate-700"
              title="Arduino default Pins 3, 9, 10, 11"
            >
              490
            </button>
            <button
              onClick={() => setFreqHz('980')}
              className="px-2 py-1 bg-slate-800 text-sky-300 text-xs rounded font-mono hover:bg-slate-700"
              title="Arduino fast Pins 5, 6"
            >
              980
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="pwm-peak"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Peak Voltage (V)
          </label>
          <input
            id="pwm-peak"
            type="number"
            step="0.1"
            value={peakV}
            onChange={e => setPeakV(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="pwm-duty-slider"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Duty Cycle: {dutyPercent}%
          </label>
          <input
            id="pwm-duty-slider"
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={dutyPercent}
            onChange={e => handleDutyChange(e.target.value)}
            className="w-full accent-sky-500 mt-2"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pwm-byte-slider"
          className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
        >
          Arduino 8-Bit Register Slider (0 - 255): {output?.result.arduinoValue8Bit ?? 128}
        </label>
        <input
          id="pwm-byte-slider"
          type="range"
          min="0"
          max="255"
          value={output?.result.arduinoValue8Bit ?? 128}
          onChange={e => handleArduinoByteChange(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-500"
        />
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
