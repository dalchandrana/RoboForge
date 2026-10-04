import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateOhmsLaw,
  type CalculationOutput,
  type OhmsLawResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const OhmsLawCalc: React.FC = () => {
  const [voltage, setVoltage] = useState('9');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('1000');
  const [output, setOutput] = useState<CalculationOutput<OhmsLawResult> | null>(() => {
    return calculateOhmsLaw({ voltage: 9, resistance: 1000 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const v = voltage ? parseFloat(voltage) : undefined;
      const i = current ? parseFloat(current) : undefined;
      const r = resistance ? parseFloat(resistance) : undefined;
      const res = calculateOhmsLaw({ voltage: v, current: i, resistance: r });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        { label: 'Voltage', value: `${output.result.voltage} V`, highlight: !voltage },
        {
          label: 'Current',
          value:
            output.result.current >= 0.001
              ? `${(output.result.current * 1000).toFixed(2)} mA`
              : `${output.result.current} A`,
          highlight: !current,
        },
        {
          label: 'Resistance',
          value: `${output.result.resistance.toLocaleString()} Ω`,
          highlight: !resistance,
        },
        {
          label: 'Power Dissipation',
          value:
            output.result.power >= 0.001
              ? `${(output.result.power * 1000).toFixed(1)} mW`
              : `${output.result.power} W`,
          highlight: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>⚡</span> Ohm's Law & Power Dissipation
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Fill in any <strong>2</strong> fields to solve for the missing parameter and power
            dissipation.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          V = I × R · P = V × I
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="ohms-v"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Voltage (V)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ohms-v"
              type="number"
              step="any"
              placeholder="e.g. 9"
              value={voltage}
              onChange={e => setVoltage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white focus:border-sky-500 focus:outline-none"
            />
            <span className="text-xs font-bold text-text-muted">V</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="ohms-i"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Current (A)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ohms-i"
              type="number"
              step="any"
              placeholder="e.g. 0.02"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white focus:border-sky-500 focus:outline-none"
            />
            <span className="text-xs font-bold text-text-muted">A</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="ohms-r"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Resistance (Ω)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ohms-r"
              type="number"
              step="any"
              placeholder="e.g. 1000"
              value={resistance}
              onChange={e => setResistance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white focus:border-sky-500 focus:outline-none"
            />
            <span className="text-xs font-bold text-text-muted">Ω</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleCompute} id="btn-compute-ohms">
          Compute Results
        </Button>
        <button
          onClick={() => {
            setVoltage('5');
            setCurrent('');
            setResistance('220');
            setOutput(calculateOhmsLaw({ voltage: 5, resistance: 220 }));
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: 5V Arduino LED (220Ω)
        </button>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
