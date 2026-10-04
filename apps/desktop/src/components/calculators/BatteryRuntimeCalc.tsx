import React, { useState } from 'react';
import { Button } from '@roboforge/ui';
import {
  calculateBatteryRuntime,
  type BatteryRuntimeResult,
  type CalculationOutput,
} from '@roboforge/calculators';
import { CalculationResultView } from './CalculationResultView';

interface BatteryPreset {
  name: string;
  capacityMah: number;
}

const BATTERY_PRESETS: BatteryPreset[] = [
  { name: '4× AA Alkaline (6V)', capacityMah: 2500 },
  { name: '9V Alkaline', capacityMah: 550 },
  { name: '18650 Li-ion Cell', capacityMah: 2600 },
  { name: 'CR2032 Coin Cell', capacityMah: 220 },
  { name: 'USB Power Bank', capacityMah: 10000 },
];

export const BatteryRuntimeCalc: React.FC = () => {
  const [capacity, setCapacity] = useState('2500');
  const [activeCurrent, setActiveCurrent] = useState('80');
  const [sleepCurrent, setSleepCurrent] = useState('2');
  const [dutyCycle, setDutyCycle] = useState('100');
  const [derating, setDerating] = useState('0.85');
  const [output, setOutput] = useState<CalculationOutput<BatteryRuntimeResult> | null>(() => {
    return calculateBatteryRuntime({
      batteryCapacityMah: 2500,
      averageCurrentMa: 80,
      deratingFactor: 0.85,
    });
  });
  const [error, setError] = useState('');

  const handleCompute = () => {
    setError('');
    try {
      const cap = parseFloat(capacity);
      const act = parseFloat(activeCurrent);
      const slp = sleepCurrent ? parseFloat(sleepCurrent) : 0;
      const duty = dutyCycle ? parseFloat(dutyCycle) : 100;
      const der = derating ? parseFloat(derating) : 0.85;

      const res = calculateBatteryRuntime({
        batteryCapacityMah: cap,
        averageCurrentMa: act,
        sleepCurrentMa: slp,
        dutyCyclePercent: duty,
        deratingFactor: der,
      });
      setOutput(res);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const summaryCards = output
    ? [
        {
          label: 'Estimated Operating Life',
          value: output.result.formattedRuntime,
          subtext: `${output.result.estimatedHours} Total Hours`,
          highlight: true,
        },
        {
          label: 'Estimated Operating Days',
          value: `${output.result.estimatedDays} Days`,
        },
        {
          label: 'Effective Average Current',
          value: `${output.result.effectiveAverageMa} mA`,
        },
        {
          label: 'Usable Capacity (Derated)',
          value: `${output.result.usableCapacityMah} mAh`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🔋</span> Battery Operating Life & Power Budget
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Estimate battery life for portable robotics, IoT sensors, and duty-cycled
            microcontrollers.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sky-950 text-sky-300 rounded-full font-mono border border-sky-800/40">
          Life = (Capacity × Derate) / I_effective
        </span>
      </div>

      {/* Preset Buttons */}
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Standard Battery Capacities
        </span>
        <div className="flex flex-wrap gap-2">
          {BATTERY_PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setCapacity(p.capacityMah.toString());
                try {
                  setOutput(
                    calculateBatteryRuntime({
                      batteryCapacityMah: p.capacityMah,
                      averageCurrentMa: parseFloat(activeCurrent) || 80,
                      sleepCurrentMa: parseFloat(sleepCurrent) || 0,
                      dutyCyclePercent: parseFloat(dutyCycle) || 100,
                      deratingFactor: parseFloat(derating) || 0.85,
                    }),
                  );
                } catch {
                  // ignore
                }
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-border-subtle text-xs text-white transition-colors"
            >
              {p.name} ({p.capacityMah} mAh)
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="batt-cap"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Battery Capacity (mAh)
          </label>
          <input
            id="batt-cap"
            type="number"
            placeholder="e.g. 2500"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="batt-act"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Active Current Draw (mA)
          </label>
          <input
            id="batt-act"
            type="number"
            placeholder="e.g. 80"
            value={activeCurrent}
            onChange={e => setActiveCurrent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="batt-duty"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Active Duty Cycle (%)
          </label>
          <input
            id="batt-duty"
            type="number"
            min="0"
            max="100"
            placeholder="100"
            value={dutyCycle}
            onChange={e => setDutyCycle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="batt-sleep"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Sleep / Standby Current (mA, optional)
          </label>
          <input
            id="batt-sleep"
            type="number"
            placeholder="e.g. 0.05"
            value={sleepCurrent}
            onChange={e => setSleepCurrent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>

        <div>
          <label
            htmlFor="batt-derate"
            className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Efficiency / Derating Factor (0.01 - 1.0)
          </label>
          <input
            id="batt-derate"
            type="number"
            step="0.05"
            min="0.1"
            max="1.0"
            placeholder="0.85"
            value={derating}
            onChange={e => setDerating(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm text-white"
          />
        </div>
      </div>

      <Button variant="primary" onClick={handleCompute} id="btn-compute-battery">
        Compute Battery Endurance
      </Button>

      <CalculationResultView output={output} error={error} summaryCards={summaryCards} />
    </div>
  );
};
