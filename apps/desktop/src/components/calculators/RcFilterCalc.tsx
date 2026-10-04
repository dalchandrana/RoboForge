import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateRcTimeConstant,
  type CalculationOutput,
  type RcTimeConstantResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const RcFilterCalc: React.FC = () => {
  const [resR, setResR] = useState('10000');
  const [capUf, setCapUf] = useState('100');
  const [v0, setV0] = useState('5');
  const [output, setOutput] = useState<CalculationOutput<RcTimeConstantResult> | null>(() => {
    return calculateRcTimeConstant({ resistance: 10000, capacitanceUf: 100, supplyVoltage: 5 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const r = parseFloat(resR);
      const c = parseFloat(capUf);
      const v = v0 ? parseFloat(v0) : undefined;
      const res = calculateRcTimeConstant({ resistance: r, capacitanceUf: c, supplyVoltage: v });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Time Constant (Tau τ)',
          value:
            output.result.timeConstantSeconds >= 1
              ? `${output.result.timeConstantSeconds} s`
              : `${output.result.timeConstantMs} ms`,
          subtext: '63.2% charge threshold',
          highlight: true,
        },
        {
          label: 'Cutoff Frequency (fc)',
          value:
            output.result.cutoffFrequencyHz >= 1000
              ? `${(output.result.cutoffFrequencyHz / 1000).toFixed(2)} kHz`
              : `${output.result.cutoffFrequencyHz} Hz`,
          subtext: '-3 dB Low-Pass Corner',
        },
        {
          label: '3τ (95.0% Settled)',
          value: `${output.result.timeTo95PercentMs} ms`,
        },
        {
          label: '5τ (99.3% Fully Charged)',
          value: `${output.result.timeTo99PercentMs} ms`,
          highlight: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>⏱️</span> RC Time Constant & Low-Pass Filter
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Calculate capacitor charging timing, RC delay periods, and cutoff filter frequencies.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          τ = R × C · fc = 1 / (2πRC)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="rc-r"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Resistance R (Ω)
          </label>
          <input
            id="rc-r"
            type="number"
            placeholder="e.g. 10000"
            value={resR}
            onChange={e => setResR(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="rc-c"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Capacitance C (µF)
          </label>
          <input
            id="rc-c"
            type="number"
            placeholder="e.g. 100"
            value={capUf}
            onChange={e => setCapUf(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="rc-v"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Step Voltage V0 (V, optional)
          </label>
          <input
            id="rc-v"
            type="number"
            placeholder="e.g. 5"
            value={v0}
            onChange={e => setV0(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleCompute} id="btn-compute-rc">
          Compute Time Constant
        </Button>
        <button
          onClick={() => {
            setResR('10000');
            setCapUf('10');
            setV0('5');
            setOutput(
              calculateRcTimeConstant({ resistance: 10000, capacitanceUf: 10, supplyVoltage: 5 }),
            );
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: 10kΩ + 10µF (0.1s delay)
        </button>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
