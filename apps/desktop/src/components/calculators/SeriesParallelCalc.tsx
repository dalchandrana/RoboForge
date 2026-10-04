import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateSeriesParallel,
  type CalculationOutput,
  type SeriesParallelResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const SeriesParallelCalc: React.FC = () => {
  const [mode, setMode] = useState<'series' | 'parallel'>('parallel');
  const [resistors, setResistors] = useState<string[]>(['1000', '1000']);
  const [sourceVoltage, setSourceVoltage] = useState('5');
  const [output, setOutput] = useState<CalculationOutput<SeriesParallelResult> | null>(() => {
    return calculateSeriesParallel({ resistors: [1000, 1000], mode: 'parallel', sourceVoltage: 5 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const parsed = resistors.map(r => parseFloat(r)).filter(r => !isNaN(r));
      const v = sourceVoltage ? parseFloat(sourceVoltage) : undefined;
      const res = calculateSeriesParallel({ resistors: parsed, mode, sourceVoltage: v });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddResistor = () => {
    setResistors([...resistors, '1000']);
  };

  const handleRemoveResistor = (idx: number) => {
    if (resistors.length <= 2) return;
    setResistors(resistors.filter((_, i) => i !== idx));
  };

  const handleResistorChange = (idx: number, val: string) => {
    const next = [...resistors];
    next[idx] = val;
    setResistors(next);
  };

  const summaryCards = output
    ? [
        {
          label: 'Equivalent Resistance (Req)',
          value: `${output.result.equivalentResistance.toLocaleString()} Ω`,
          highlight: true,
        },
        {
          label: 'Network Configuration',
          value: mode === 'series' ? 'Series Circuit' : 'Parallel Circuit',
        },
        { label: 'Component Count', value: `${output.result.count} Resistors` },
        {
          label: 'Total Power Dissipation',
          value: output.result.totalPower ? `${output.result.totalPower} W` : 'N/A',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🔗</span> Series & Parallel Resistor Networks
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Add any number of resistors to compute equivalent resistance and branch power
            distribution.
          </p>
        </div>
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setMode('series')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              mode === 'series'
                ? 'bg-sky-600 text-white shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => setMode('parallel')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              mode === 'parallel'
                ? 'bg-sky-600 text-white shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            Parallel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Resistor Bank ({resistors.length} Resistors)
          </label>
          <div className="space-y-2">
            {resistors.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 text-xs font-mono font-bold text-sky-400">R{i + 1}</span>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={r}
                  onChange={e => handleResistorChange(i, e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs text-white"
                />
                <span className="text-xs text-text-muted font-bold">Ω</span>
                {resistors.length > 2 && (
                  <button
                    onClick={() => handleRemoveResistor(i)}
                    className="p-1 hover:bg-red-950 text-red-400 rounded text-xs"
                    title="Remove Resistor"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddResistor}
            className="mt-2 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            + Add Another Resistor
          </button>
        </div>

        <div>
          <label
            htmlFor="source-v"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2"
          >
            Source Voltage (Optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="source-v"
              type="number"
              placeholder="e.g. 5 or 12"
              value={sourceVoltage}
              onChange={e => setSourceVoltage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
            />
            <span className="text-xs font-bold text-text-muted">V</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Providing source voltage enables calculation of individual branch currents, resistor
            voltages, and heat dissipation.
          </p>
        </div>
      </div>

      <Button variant="primary" onClick={handleCompute} id="btn-compute-series-parallel">
        Calculate Equivalent Network
      </Button>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
