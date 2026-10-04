import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateLedResistor,
  type CalculationOutput,
  type LedResistorResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

interface LedPreset {
  name: string;
  vf: number;
  ifMa: number;
  colorHex: string;
}

const LED_PRESETS: LedPreset[] = [
  { name: 'Red LED', vf: 2.0, ifMa: 20, colorHex: '#ef4444' },
  { name: 'Yellow LED', vf: 2.1, ifMa: 20, colorHex: '#eab308' },
  { name: 'Green LED', vf: 2.2, ifMa: 20, colorHex: '#22c55e' },
  { name: 'Blue LED', vf: 3.2, ifMa: 20, colorHex: '#3b82f6' },
  { name: 'White LED', vf: 3.2, ifMa: 20, colorHex: '#f8fafc' },
  { name: 'Infrared (IR)', vf: 1.3, ifMa: 50, colorHex: '#a855f7' },
];

export const LedResistorCalc: React.FC = () => {
  const [supplyV, setSupplyV] = useState('5');
  const [forwardV, setForwardV] = useState('2.0');
  const [forwardI, setForwardI] = useState('20');
  const [output, setOutput] = useState<CalculationOutput<LedResistorResult> | null>(() => {
    return calculateLedResistor({ supplyVoltage: 5, forwardVoltage: 2.0, forwardCurrentMa: 20 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const vs = parseFloat(supplyV);
      const vf = parseFloat(forwardV);
      const ifMa = parseFloat(forwardI);
      const res = calculateLedResistor({
        supplyVoltage: vs,
        forwardVoltage: vf,
        forwardCurrentMa: ifMa,
      });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const applyPreset = (p: LedPreset) => {
    setForwardV(p.vf.toString());
    setForwardI(p.ifMa.toString());
    try {
      const vs = parseFloat(supplyV);
      setOutput(
        calculateLedResistor({ supplyVoltage: vs, forwardVoltage: p.vf, forwardCurrentMa: p.ifMa }),
      );
    } catch {
      // ignore
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Standard E12 Resistor',
          value: `${output.result.standardE12Resistance} Ω`,
          subtext: `Exact: ${output.result.calculatedResistance} Ω`,
          highlight: true,
        },
        {
          label: 'Nearest E24 Resistor',
          value: `${output.result.standardE24Resistance} Ω`,
        },
        {
          label: 'Actual LED Current',
          value: `${output.result.actualCurrentMa} mA`,
        },
        {
          label: 'Power Rating (2× Safety)',
          value: output.result.recommendedRatingWatts,
          subtext: `Loss: ${(output.result.resistorPowerWatts * 1000).toFixed(1)} mW`,
          highlight: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>💡</span> LED Current-Limiting Resistor & Wattage
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Size standard through-hole resistors to safely power LEDs without burnout or
            overheating.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          R = (Vs - Vf) / If
        </span>
      </div>

      {/* Preset Buttons */}
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Common LED Color Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {LED_PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-border-subtle text-xs flex items-center gap-2 text-white transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colorHex }} />
              {p.name} ({p.vf}V, {p.ifMa}mA)
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="led-vs"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Supply Voltage Vs (V)
          </label>
          <input
            id="led-vs"
            type="number"
            placeholder="e.g. 5 or 9"
            value={supplyV}
            onChange={e => setSupplyV(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="led-vf"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            LED Forward Voltage Vf (V)
          </label>
          <input
            id="led-vf"
            type="number"
            step="0.1"
            placeholder="e.g. 2.0"
            value={forwardV}
            onChange={e => setForwardV(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="led-if"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Target Forward Current If (mA)
          </label>
          <input
            id="led-if"
            type="number"
            placeholder="e.g. 20"
            value={forwardI}
            onChange={e => setForwardI(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <Button variant="primary" onClick={handleCompute} id="btn-compute-led">
        Calculate Resistor Sizing
      </Button>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
