import React, { useState } from 'react';
import {
  calculateUnitConversion,
  CATEGORY_NAMES,
  PREFIX_EXPONENTS,
  PREFIX_SYMBOLS,
  type CalculationOutput,
  type MetricPrefix,
  type UnitCategory,
  type UnitConverterResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

const ALL_CATEGORIES: UnitCategory[] = [
  'resistance',
  'capacitance',
  'current',
  'voltage',
  'frequency',
  'power',
];

const ALL_PREFIXES: MetricPrefix[] = [
  'pico',
  'nano',
  'micro',
  'milli',
  'base',
  'kilo',
  'mega',
  'giga',
];

export const UnitConverterCalc: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('resistance');
  const [val, setVal] = useState('4.7');
  const [fromP, setFromP] = useState<MetricPrefix>('kilo');
  const [toP, setToP] = useState<MetricPrefix>('base');
  const [error, setError] = useState('');

  let output: CalculationOutput<UnitConverterResult> | null = null;
  try {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      output = calculateUnitConversion({
        value: num,
        category,
        fromPrefix: fromP,
        toPrefix: toP,
      });
    }
  } catch (err) {
    if (!error) setError((err as Error).message);
  }

  const summaryCards = output
    ? [
        {
          label: 'Original Quantity',
          value: `${output.result.originalValue} ${output.result.fromLabel}`,
        },
        {
          label: 'Converted Quantity',
          value: `${output.result.convertedValue.toLocaleString()} ${output.result.toLabel}`,
          highlight: true,
        },
        {
          label: 'SI Base Standard',
          value: `${output.result.baseValue.toExponential(3)}`,
        },
        {
          label: 'Engineering Notation',
          value: output.result.engineeringNotation,
          highlight: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>📐</span> SI Metric & Engineering Prefix Converter
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Convert component ratings and measurements across standard engineering metric prefixes.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          pico · nano · micro · milli · base · kilo · mega · giga
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="unit-cat"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Physical Quantity
          </label>
          <select
            id="unit-cat"
            value={category}
            onChange={e => setCategory(e.target.value as UnitCategory)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          >
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c}>
                {CATEGORY_NAMES[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="unit-val"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Input Value
          </label>
          <input
            id="unit-val"
            type="number"
            step="any"
            value={val}
            onChange={e => {
              setError('');
              setVal(e.target.value);
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="unit-from"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            From Prefix
          </label>
          <select
            id="unit-from"
            value={fromP}
            onChange={e => setFromP(e.target.value as MetricPrefix)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white capitalize"
          >
            {ALL_PREFIXES.map(p => (
              <option key={p} value={p}>
                {p} ({PREFIX_SYMBOLS[p] || 'base'} 10^{PREFIX_EXPONENTS[p]})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="unit-to"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            To Prefix
          </label>
          <select
            id="unit-to"
            value={toP}
            onChange={e => setToP(e.target.value as MetricPrefix)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white capitalize"
          >
            {ALL_PREFIXES.map(p => (
              <option key={p} value={p}>
                {p} ({PREFIX_SYMBOLS[p] || 'base'} 10^{PREFIX_EXPONENTS[p]})
              </option>
            ))}
          </select>
        </div>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
