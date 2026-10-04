import React, { useState } from 'react';
import {
  calculateServoPulse,
  type CalculationOutput,
  type ServoPulseResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const ServoPulseCalc: React.FC = () => {
  const [angle, setAngle] = useState('90');
  const [minPulse, setMinPulse] = useState('544');
  const [maxPulse, setMaxPulse] = useState('2400');
  const [error, setError] = useState('');

  let output: CalculationOutput<ServoPulseResult> | null = null;
  try {
    const ang = parseFloat(angle);
    const minP = parseFloat(minPulse);
    const maxP = parseFloat(maxPulse);
    if (!isNaN(ang) && !isNaN(minP) && !isNaN(maxP)) {
      output = calculateServoPulse({
        angleDegrees: ang,
        minPulseUs: minP,
        maxPulseUs: maxP,
      });
    }
  } catch (err) {
    if (!error) setError((err as Error).message);
  }

  const angleNum = parseFloat(angle) || 0;

  const summaryCards = output
    ? [
        {
          label: 'Target Shaft Angle',
          value: `${output.result.angleDegrees}°`,
          highlight: true,
        },
        {
          label: 'Control Pulse Duration',
          value: `${output.result.pulseWidthUs} µs`,
          subtext: `${output.result.pulseWidthMs} ms`,
          highlight: true,
        },
        {
          label: '50 Hz Frame Duty Cycle',
          value: `${output.result.dutyCyclePercent}%`,
          subtext: 'Period: 20.0 ms',
        },
        {
          label: 'Neutral Position (90°)',
          value: `${((parseFloat(minPulse) + parseFloat(maxPulse)) / 2).toFixed(0)} µs`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🎯</span> RC Servo Pulse Width & Angle
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Convert standard 50 Hz PWM pulse widths (544–2400 µs) to mechanical servo angles
            (0°–180°).
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          Pulse = Min + (Angle / 180) × Span
        </span>
      </div>

      {/* Visual Rotating Servo Horn */}
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-border-subtle flex flex-col items-center justify-center gap-3">
        <svg viewBox="0 0 200 120" className="w-48 max-w-full drop-shadow">
          {/* Servo Case Outline */}
          <rect
            x="50"
            y="50"
            width="100"
            height="60"
            rx="4"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="2"
          />
          <circle cx="100" cy="50" r="28" fill="#334155" />
          <circle cx="100" cy="50" r="16" fill="#0f172a" />

          {/* Rotating Servo Horn */}
          <g
            transform={`rotate(${angleNum - 90}, 100, 50)`}
            className="transition-transform duration-200"
          >
            {/* Horn Body */}
            <path d="M 94 50 L 96 12 Q 100 8 104 12 L 106 50 Z" fill="#38bdf8" />
            <circle cx="100" cy="50" r="10" fill="#0284c7" />
            <circle cx="100" cy="50" r="4" fill="#f8fafc" />
            <circle cx="100" cy="18" r="2.5" fill="#0f172a" />
            <circle cx="100" cy="28" r="2.5" fill="#0f172a" />
            <circle cx="100" cy="38" r="2.5" fill="#0f172a" />
          </g>

          {/* Angle Arc Labels */}
          <text x="25" y="50" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            0°
          </text>
          <text x="94" y="15" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">
            90°
          </text>
          <text x="160" y="50" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            180°
          </text>
        </svg>

        <div className="text-xl font-bold font-mono text-sky-400">
          {angleNum}° ({output?.result.pulseWidthUs ?? 1500} µs)
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="servo-slider"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Shaft Angle: {angle}°
          </label>
          <input
            id="servo-slider"
            type="range"
            min="0"
            max="180"
            step="1"
            value={angle}
            onChange={e => {
              setError('');
              setAngle(e.target.value);
            }}
            className="w-full accent-sky-500"
          />
          <div className="flex justify-between text-[11px] text-text-muted font-mono mt-1">
            <span>0° (Min Pulse: {minPulse} µs)</span>
            <span>90° (Neutral: 1500 µs)</span>
            <span>180° (Max Pulse: {maxPulse} µs)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label
              htmlFor="servo-min"
              className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Minimum Pulse Width (µs)
            </label>
            <input
              id="servo-min"
              type="number"
              value={minPulse}
              onChange={e => setMinPulse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
            />
          </div>

          <div>
            <label
              htmlFor="servo-max"
              className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
            >
              Maximum Pulse Width (µs)
            </label>
            <input
              id="servo-max"
              type="number"
              value={maxPulse}
              onChange={e => setMaxPulse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
            />
          </div>
        </div>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
