import React, { useState } from 'react';
import {
  calculateResistorColorCode,
  resistanceToColorBands,
  type CalculationOutput,
  type ResistorColorBand,
  type ResistorColorCodeResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

const BAND_COLOR_HEX: Record<ResistorColorBand, string> = {
  black: '#1a1a1a',
  brown: '#8B4513',
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  green: '#16A34A',
  blue: '#2563EB',
  violet: '#9333EA',
  gray: '#6B7280',
  white: '#F3F4F6',
  gold: '#D97706',
  silver: '#9CA3AF',
};

const DIGIT_COLORS: ResistorColorBand[] = [
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'gray',
  'white',
];

const MULTIPLIER_COLORS: ResistorColorBand[] = [
  'silver',
  'gold',
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'gray',
  'white',
];

const TOLERANCE_COLORS: ResistorColorBand[] = [
  'brown',
  'red',
  'green',
  'blue',
  'violet',
  'gray',
  'gold',
  'silver',
];

export const ResistorColorCalc: React.FC = () => {
  const [bandCount, setBandCount] = useState<4 | 5>(4);
  const [bands4, setBands4] = useState<ResistorColorBand[]>(['brown', 'black', 'red', 'gold']);
  const [bands5, setBands5] = useState<ResistorColorBand[]>([
    'yellow',
    'violet',
    'black',
    'red',
    'brown',
  ]);
  const [lookupOhms, setLookupOhms] = useState('');
  const [error, setError] = useState('');

  const activeBands = bandCount === 4 ? bands4 : bands5;

  let output: CalculationOutput<ResistorColorCodeResult> | null = null;
  try {
    output = calculateResistorColorCode({ bands: activeBands });
  } catch (err) {
    if (!error) setError((err as Error).message);
  }

  const handleBandChange = (index: number, newColor: ResistorColorBand) => {
    setError('');
    if (bandCount === 4) {
      const next = [...bands4];
      next[index] = newColor;
      setBands4(next);
    } else {
      const next = [...bands5];
      next[index] = newColor;
      setBands5(next);
    }
  };

  const handleLookup = () => {
    setError('');
    try {
      const val = parseFloat(lookupOhms);
      if (isNaN(val) || val <= 0) return;
      const res = resistanceToColorBands(val);
      if (bandCount === 4) {
        setBands4(res.bands4);
      } else {
        setBands5(res.bands5);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        { label: 'Nominal Resistance', value: output.result.formattedResistance, highlight: true },
        { label: 'Tolerance', value: `±${output.result.tolerancePercent}%` },
        { label: 'Min Acceptable (Ohms)', value: `${output.result.minResistance} Ω` },
        { label: 'Max Acceptable (Ohms)', value: `${output.result.maxResistance} Ω` },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🎨</span> Resistor Color Code (4-Band & 5-Band)
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Select color bands to decode resistance and tolerance, or enter an Ohm value to encode
            bands.
          </p>
        </div>
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setBandCount(4)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              bandCount === 4 ? 'bg-sky-600 text-white shadow' : 'text-text-muted hover:text-white'
            }`}
          >
            4-Band (Standard)
          </button>
          <button
            onClick={() => setBandCount(5)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              bandCount === 5 ? 'bg-sky-600 text-white shadow' : 'text-text-muted hover:text-white'
            }`}
          >
            5-Band (Precision)
          </button>
        </div>
      </div>

      {/* Visual Resistor Graphic */}
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-border-subtle flex flex-col items-center justify-center gap-3">
        <svg viewBox="0 0 340 100" className="w-72 max-w-full drop-shadow-md">
          {/* Wire leads */}
          <line
            x1="10"
            y1="50"
            x2="60"
            y2="50"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="280"
            y1="50"
            x2="330"
            y2="50"
            stroke="#94a3b8"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Resistor Body */}
          <path
            d="M 60 30 Q 70 30 80 38 L 260 38 Q 270 30 280 30 L 280 70 Q 270 70 260 62 L 80 62 Q 70 70 60 70 Z"
            fill="#d6b896"
            stroke="#b3906b"
            strokeWidth="2"
          />

          {/* Color Bands */}
          {bandCount === 4 ? (
            <>
              {/* Digit 1 */}
              <rect
                x="95"
                y="38"
                width="10"
                height="24"
                fill={BAND_COLOR_HEX[bands4[0] ?? 'brown']}
                rx="1"
              />
              {/* Digit 2 */}
              <rect
                x="125"
                y="38"
                width="10"
                height="24"
                fill={BAND_COLOR_HEX[bands4[1] ?? 'black']}
                rx="1"
              />
              {/* Multiplier */}
              <rect
                x="155"
                y="38"
                width="10"
                height="24"
                fill={BAND_COLOR_HEX[bands4[2] ?? 'red']}
                rx="1"
              />
              {/* Tolerance */}
              <rect
                x="235"
                y="38"
                width="10"
                height="24"
                fill={BAND_COLOR_HEX[bands4[3] ?? 'gold']}
                rx="1"
              />
            </>
          ) : (
            <>
              {/* Digit 1 */}
              <rect
                x="90"
                y="38"
                width="8"
                height="24"
                fill={BAND_COLOR_HEX[bands5[0] ?? 'yellow']}
                rx="1"
              />
              {/* Digit 2 */}
              <rect
                x="115"
                y="38"
                width="8"
                height="24"
                fill={BAND_COLOR_HEX[bands5[1] ?? 'violet']}
                rx="1"
              />
              {/* Digit 3 */}
              <rect
                x="140"
                y="38"
                width="8"
                height="24"
                fill={BAND_COLOR_HEX[bands5[2] ?? 'black']}
                rx="1"
              />
              {/* Multiplier */}
              <rect
                x="170"
                y="38"
                width="8"
                height="24"
                fill={BAND_COLOR_HEX[bands5[3] ?? 'red']}
                rx="1"
              />
              {/* Tolerance */}
              <rect
                x="240"
                y="38"
                width="8"
                height="24"
                fill={BAND_COLOR_HEX[bands5[4] ?? 'brown']}
                rx="1"
              />
            </>
          )}
        </svg>

        {output && (
          <div className="text-xl font-bold font-mono text-sky-400">
            {output.result.formattedResistance}
          </div>
        )}
      </div>

      {/* Band Pickers */}
      <div
        className={`grid grid-cols-2 ${bandCount === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-5'} gap-3`}
      >
        {/* Band 1 */}
        <div>
          <label
            htmlFor="band-select-1"
            className="block text-[11px] font-bold uppercase text-text-muted mb-1"
          >
            Band 1 (1st Digit)
          </label>
          <select
            id="band-select-1"
            value={activeBands[0]}
            onChange={e => handleBandChange(0, e.target.value as ResistorColorBand)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs capitalize text-white"
          >
            {DIGIT_COLORS.filter(c => c !== 'black').map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Band 2 */}
        <div>
          <label
            htmlFor="band-select-2"
            className="block text-[11px] font-bold uppercase text-text-muted mb-1"
          >
            Band 2 (2nd Digit)
          </label>
          <select
            id="band-select-2"
            value={activeBands[1]}
            onChange={e => handleBandChange(1, e.target.value as ResistorColorBand)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs capitalize text-white"
          >
            {DIGIT_COLORS.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Band 3 */}
        {bandCount === 5 && (
          <div>
            <label
              htmlFor="band-select-3"
              className="block text-[11px] font-bold uppercase text-text-muted mb-1"
            >
              Band 3 (3rd Digit)
            </label>
            <select
              id="band-select-3"
              value={bands5[2]}
              onChange={e => handleBandChange(2, e.target.value as ResistorColorBand)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs capitalize text-white"
            >
              {DIGIT_COLORS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multiplier Band */}
        <div>
          <label
            htmlFor="band-select-mult"
            className="block text-[11px] font-bold uppercase text-text-muted mb-1"
          >
            Multiplier
          </label>
          <select
            id="band-select-mult"
            value={bandCount === 4 ? bands4[2] : bands5[3]}
            onChange={e =>
              handleBandChange(bandCount === 4 ? 2 : 3, e.target.value as ResistorColorBand)
            }
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs capitalize text-white"
          >
            {MULTIPLIER_COLORS.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tolerance Band */}
        <div>
          <label
            htmlFor="band-select-tol"
            className="block text-[11px] font-bold uppercase text-text-muted mb-1"
          >
            Tolerance
          </label>
          <select
            id="band-select-tol"
            value={bandCount === 4 ? bands4[3] : bands5[4]}
            onChange={e =>
              handleBandChange(bandCount === 4 ? 3 : 4, e.target.value as ResistorColorBand)
            }
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs capitalize text-white"
          >
            {TOLERANCE_COLORS.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reverse Lookup by Resistance */}
      <div className="p-4 bg-slate-950/40 rounded-xl border border-border-subtle flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-bold text-text-muted whitespace-nowrap">
          🔍 Reverse Lookup:
        </span>
        <div className="flex-1 flex items-center gap-2 w-full">
          <input
            type="number"
            placeholder="e.g. 4700 or 10000"
            value={lookupOhms}
            onChange={e => setLookupOhms(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs text-white"
          />
          <span className="text-xs font-bold text-text-muted">Ω</span>
          <button
            onClick={handleLookup}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-lg border border-border-subtle whitespace-nowrap"
          >
            Find Bands
          </button>
        </div>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
