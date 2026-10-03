import React, { useState } from 'react';
import { Card, Button } from '@roboforge/ui';
import {
  calculateOhmsLaw,
  type CalculationOutput,
  type OhmsLawResult,
} from '@roboforge/calculators';

export const ToolsView: React.FC = () => {
  const [voltage, setVoltage] = useState('9');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('1000');
  const [calcOutput, setCalcOutput] = useState<CalculationOutput<OhmsLawResult> | null>(() => {
    return calculateOhmsLaw({ voltage: 9, resistance: 1000 });
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleCalculate = () => {
    setErrorMsg('');
    try {
      const v = voltage ? parseFloat(voltage) : undefined;
      const i = current ? parseFloat(current) : undefined;
      const r = resistance ? parseFloat(resistance) : undefined;

      const res = calculateOhmsLaw({ voltage: v, current: i, resistance: r });
      setCalcOutput(res);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="border-b border-border-subtle pb-4">
        <h1 className="text-3xl font-extrabold">Engineering Calculators</h1>
        <p className="text-sm text-text-muted mt-1">
          Instant calculations with step-by-step formulas, derivations, and SI units.
        </p>
      </header>

      <Card variant="surface" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">⚡ Ohm's Law & Power Dissipation</h2>
          <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono">
            V = I × R · P = V × I
          </span>
        </div>

        <p className="text-sm text-text-muted">
          Fill in any <strong>2</strong> fields to solve for the rest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="voltage-input"
              className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Voltage (V)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="voltage-input"
                type="number"
                step="any"
                placeholder="e.g. 9"
                value={voltage}
                onChange={e => setVoltage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm"
              />
              <span className="text-sm font-bold text-text-muted">V</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="current-input"
              className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Current (A)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="current-input"
                type="number"
                step="any"
                placeholder="e.g. 0.02"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm"
              />
              <span className="text-sm font-bold text-text-muted">A</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="resistance-input"
              className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1"
            >
              Resistance (Ω)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="resistance-input"
                type="number"
                step="any"
                placeholder="e.g. 1000"
                value={resistance}
                onChange={e => setResistance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm"
              />
              <span className="text-sm font-bold text-text-muted">Ω</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <Button variant="primary" onClick={handleCalculate} id="calculate-ohms-btn">
          Compute Results
        </Button>

        {calcOutput && (
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
              Calculation Output & Worked Steps
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border-subtle">
                <span className="text-xs text-text-muted block">Voltage</span>
                <span className="text-lg font-bold font-mono text-white">
                  {calcOutput.result.voltage} V
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border-subtle">
                <span className="text-xs text-text-muted block">Current</span>
                <span className="text-lg font-bold font-mono text-white">
                  {calcOutput.result.current >= 0.001
                    ? `${(calcOutput.result.current * 1000).toFixed(2)} mA`
                    : `${calcOutput.result.current} A`}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border-subtle">
                <span className="text-xs text-text-muted block">Resistance</span>
                <span className="text-lg font-bold font-mono text-white">
                  {calcOutput.result.resistance} Ω
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border-subtle">
                <span className="text-xs text-text-muted block">Power</span>
                <span className="text-lg font-bold font-mono text-white">
                  {calcOutput.result.power >= 0.001
                    ? `${(calcOutput.result.power * 1000).toFixed(1)} mW`
                    : `${calcOutput.result.power} W`}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Worked Steps
              </h4>
              {calcOutput.steps.map((st, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950/40 rounded-lg border border-border-subtle text-sm flex flex-col gap-1"
                >
                  <span className="font-semibold text-sky-300">
                    {st.label}: {st.math}
                  </span>
                  <span className="text-xs text-text-muted">{st.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
