import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateMotorPower,
  type CalculationOutput,
  type MotorPowerResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const MotorPowerCalc: React.FC = () => {
  const [voltage, setVoltage] = useState('12');
  const [current, setCurrent] = useState('2.0');
  const [speedRpm, setSpeedRpm] = useState('3000');
  const [torqueNm, setTorqueNm] = useState('0.05');
  const [output, setOutput] = useState<CalculationOutput<MotorPowerResult> | null>(() => {
    return calculateMotorPower({ voltage: 12, current: 2.0, speedRpm: 3000, torqueNm: 0.05 });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const v = parseFloat(voltage);
      const i = parseFloat(current);
      const rpm = parseFloat(speedRpm);
      const t = parseFloat(torqueNm);
      const res = calculateMotorPower({ voltage: v, current: i, speedRpm: rpm, torqueNm: t });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Electrical Input Power',
          value: `${output.result.electricalPowerWatts} W`,
          subtext: `${voltage}V × ${current}A`,
        },
        {
          label: 'Mechanical Shaft Power',
          value: `${output.result.mechanicalPowerWatts} W`,
          subtext: `Torque × Angular Velocity`,
          highlight: true,
        },
        {
          label: 'Motor Efficiency (η)',
          value: `${output.result.efficiencyPercent}%`,
          highlight: true,
        },
        {
          label: 'Thermal Heat Loss (Winding)',
          value: `${output.result.powerLossWatts} W`,
          subtext: 'Dissipated as heat',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🏎️</span> DC Motor Speed, Torque & Efficiency
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Evaluate electrical input versus shaft mechanical power and thermal loss.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          P_mech = τ × ω · η = P_mech / P_elec
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="motor-v"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Voltage (V)
          </label>
          <input
            id="motor-v"
            type="number"
            value={voltage}
            onChange={e => setVoltage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="motor-i"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Current (A)
          </label>
          <input
            id="motor-i"
            type="number"
            step="0.1"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="motor-rpm"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Shaft Speed (RPM)
          </label>
          <input
            id="motor-rpm"
            type="number"
            value={speedRpm}
            onChange={e => setSpeedRpm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="motor-t"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Shaft Torque (N·m)
          </label>
          <input
            id="motor-t"
            type="number"
            step="0.01"
            value={torqueNm}
            onChange={e => setTorqueNm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleCompute} id="btn-compute-motor">
          Compute Motor Efficiency
        </Button>
        <button
          onClick={() => {
            setVoltage('6');
            setCurrent('0.5');
            setSpeedRpm('150');
            setTorqueNm('0.15');
            setOutput(
              calculateMotorPower({ voltage: 6, current: 0.5, speedRpm: 150, torqueNm: 0.15 }),
            );
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: Yellow TT Robot Gearmotor (6V, 150 RPM)
        </button>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
