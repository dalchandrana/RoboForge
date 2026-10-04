import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateVoltageDivider,
  type CalculationOutput,
  type VoltageDividerResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const VoltageDividerCalc: React.FC = () => {
  const [vin, setVin] = useState('5');
  const [r1, setR1] = useState('10000');
  const [r2, setR2] = useState('10000');
  const [rl, setRl] = useState('');
  const [output, setOutput] = useState<CalculationOutput<VoltageDividerResult> | null>(() => {
    return calculateVoltageDivider({ inputVoltage: 5, r1: 10000, r2: 10000 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const v = parseFloat(vin);
      const res1 = parseFloat(r1);
      const res2 = parseFloat(r2);
      const load = rl ? parseFloat(rl) : undefined;
      const res = calculateVoltageDivider({
        inputVoltage: v,
        r1: res1,
        r2: res2,
        loadResistance: load,
      });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Unloaded Output (Vout)',
          value: `${output.result.unloadedVoltage} V`,
          highlight: !rl,
        },
        {
          label: 'Loaded Output (with RL)',
          value: rl ? `${output.result.loadedVoltage} V` : 'No Load',
          highlight: !!rl,
          subtext: rl
            ? `Sag: ${(output.result.unloadedVoltage - output.result.loadedVoltage).toFixed(3)} V`
            : undefined,
        },
        {
          label: 'Divider Branch Current',
          value: `${(output.result.dividerCurrent * 1000).toFixed(2)} mA`,
        },
        {
          label: 'Attenuation Ratio',
          value: `${(output.result.attenuationRatio * 100).toFixed(1)}%`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>⚖️</span> Voltage Divider & Loading Effect
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Calculate output voltage ratio, quiescent current, and output impedance loading sag.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          Vout = Vin × [R2 / (R1 + R2)]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="vd-vin"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Input Voltage Vin (V)
          </label>
          <input
            id="vd-vin"
            type="number"
            placeholder="e.g. 5"
            value={vin}
            onChange={e => setVin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="vd-r1"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Top Resistor R1 (Ω)
          </label>
          <input
            id="vd-r1"
            type="number"
            placeholder="e.g. 10000"
            value={r1}
            onChange={e => setR1(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="vd-r2"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Bottom Resistor R2 (Ω)
          </label>
          <input
            id="vd-r2"
            type="number"
            placeholder="e.g. 10000"
            value={r2}
            onChange={e => setR2(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="vd-rl"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Load RL across R2 (Ω, optional)
          </label>
          <input
            id="vd-rl"
            type="number"
            placeholder="e.g. 100000"
            value={rl}
            onChange={e => setRl(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleCompute} id="btn-compute-vd">
          Compute Divider Output
        </Button>
        <button
          onClick={() => {
            setVin('5');
            setR1('10000');
            setR2('10000');
            setRl('');
            setOutput(calculateVoltageDivider({ inputVoltage: 5, r1: 10000, r2: 10000 }));
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: 50% Divider (5V → 2.5V)
        </button>
        <button
          onClick={() => {
            setVin('5');
            setR1('1700');
            setR2('3300');
            setRl('');
            setOutput(calculateVoltageDivider({ inputVoltage: 5, r1: 1700, r2: 3300 }));
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: 5V to 3.3V Logic Level
        </button>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
