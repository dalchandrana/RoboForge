import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateGearRatio,
  type CalculationOutput,
  type GearRatioResult,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

export const GearRatioCalc: React.FC = () => {
  const [driverTeeth, setDriverTeeth] = useState('12');
  const [drivenTeeth, setDrivenTeeth] = useState('60');
  const [inputRpm, setInputRpm] = useState('3000');
  const [inputTorque, setInputTorque] = useState('0.05');
  const [efficiency, setEfficiency] = useState('90');
  const [output, setOutput] = useState<CalculationOutput<GearRatioResult> | null>(() => {
    return calculateGearRatio({
      driverTeeth: 12,
      drivenTeeth: 60,
      inputRpm: 3000,
      inputTorqueNm: 0.05,
      efficiencyPercent: 90,
    });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const n1 = parseInt(driverTeeth, 10);
      const n2 = parseInt(drivenTeeth, 10);
      const rpm = parseFloat(inputRpm);
      const t = parseFloat(inputTorque);
      const eff = parseFloat(efficiency);
      const res = calculateGearRatio({
        driverTeeth: n1,
        drivenTeeth: n2,
        inputRpm: rpm,
        inputTorqueNm: t,
        efficiencyPercent: eff,
      });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Gear Ratio (GR)',
          value: `${output.result.gearRatio} : 1`,
          subtext: output.result.gearRatio > 1 ? 'Speed Reduction' : 'Speed Multiplier',
          highlight: true,
        },
        {
          label: 'Output Rotational Speed',
          value: `${output.result.outputRpm.toLocaleString()} RPM`,
          subtext: `Motor: ${inputRpm} RPM`,
          highlight: true,
        },
        {
          label: 'Output Torque (N·m)',
          value: `${output.result.outputTorqueNm} N·m`,
          subtext: `Motor: ${inputTorque} N·m`,
        },
        {
          label: 'Hobby Torque (kg·cm)',
          value: `${output.result.outputTorqueKgCm} kg·cm`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>⚙️</span> Gear Ratio & Mechanical Transmission
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Size robotic drivetrain spur gearboxes, planetary stages, and torque multipliers.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          GR = N_driven / N_driver · RPM_out = RPM_in / GR
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="gear-n1"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Driver Gear Teeth (N1, Motor)
          </label>
          <input
            id="gear-n1"
            type="number"
            min="1"
            value={driverTeeth}
            onChange={e => setDriverTeeth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="gear-n2"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Driven Gear Teeth (N2, Wheel/Load)
          </label>
          <input
            id="gear-n2"
            type="number"
            min="1"
            value={drivenTeeth}
            onChange={e => setDrivenTeeth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="gear-eff"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Gearbox Efficiency (%)
          </label>
          <input
            id="gear-eff"
            type="number"
            min="10"
            max="100"
            value={efficiency}
            onChange={e => setEfficiency(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="gear-rpm"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Motor Input Speed (RPM)
          </label>
          <input
            id="gear-rpm"
            type="number"
            value={inputRpm}
            onChange={e => setInputRpm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="gear-torque"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Motor Input Torque (N·m)
          </label>
          <input
            id="gear-torque"
            type="number"
            step="0.01"
            value={inputTorque}
            onChange={e => setInputTorque(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleCompute} id="btn-compute-gear">
          Compute Transmission Output
        </Button>
        <button
          onClick={() => {
            setDriverTeeth('10');
            setDrivenTeeth('50');
            setInputRpm('6000');
            setInputTorque('0.02');
            setOutput(
              calculateGearRatio({
                driverTeeth: 10,
                drivenTeeth: 50,
                inputRpm: 6000,
                inputTorqueNm: 0.02,
                efficiencyPercent: 90,
              }),
            );
          }}
          className="text-xs text-text-muted hover:text-sky-400 underline transition-colors"
        >
          Preset: 5:1 Robotic Wheel Drive
        </button>
      </div>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
