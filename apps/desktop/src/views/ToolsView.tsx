import React, { useState } from 'react';
import { Card } from '@roboforge/ui';
import {
  OhmsLawCalc,
  ResistorColorCalc,
  SeriesParallelCalc,
  VoltageDividerCalc,
  LedResistorCalc,
  RcFilterCalc,
  BatteryRuntimeCalc,
  PwmCalc,
  ServoPulseCalc,
  GearRatioCalc,
  MotorPowerCalc,
  UnitConverterCalc,
} from '../components/calculators';

type ToolCategory = 'all' | 'electronics' | 'components' | 'robotics' | 'units';

interface CalculatorDef {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
  formula: string;
  description: string;
  component: React.ReactNode;
}

export const ToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ohms-law');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const CALCULATORS: CalculatorDef[] = [
    {
      id: 'ohms-law',
      name: "Ohm's Law & Power",
      icon: '⚡',
      category: 'electronics',
      formula: 'V = I × R · P = V × I',
      description: 'Solve voltage, current, resistance, and wattage dissipation.',
      component: <OhmsLawCalc />,
    },
    {
      id: 'resistor-color',
      name: 'Resistor Color Code',
      icon: '🎨',
      category: 'electronics',
      formula: '4-Band & 5-Band Color Decoding',
      description: 'Decode color bands to resistance or find bands from Ohms.',
      component: <ResistorColorCalc />,
    },
    {
      id: 'series-parallel',
      name: 'Series & Parallel Resistors',
      icon: '🔗',
      category: 'electronics',
      formula: 'Req = ΣRi · 1/Req = Σ(1/Ri)',
      description: 'Equivalent resistance and branch power distribution.',
      component: <SeriesParallelCalc />,
    },
    {
      id: 'voltage-divider',
      name: 'Voltage Divider & Load',
      icon: '⚖️',
      category: 'electronics',
      formula: 'Vout = Vin × [R2 / (R1 + R2)]',
      description: 'Attenuation ratio and output loading voltage sag.',
      component: <VoltageDividerCalc />,
    },
    {
      id: 'led-resistor',
      name: 'LED Current Limiter',
      icon: '💡',
      category: 'components',
      formula: 'R = (Vs - Vf) / If',
      description: 'Size standard E12/E24 resistors and 2× safety power rating.',
      component: <LedResistorCalc />,
    },
    {
      id: 'rc-filter',
      name: 'RC Time Constant & Filter',
      icon: '⏱️',
      category: 'components',
      formula: 'τ = R × C · fc = 1 / (2πRC)',
      description: 'Charge/discharge delay and -3 dB cutoff frequency.',
      component: <RcFilterCalc />,
    },
    {
      id: 'battery-runtime',
      name: 'Battery Operating Life',
      icon: '🔋',
      category: 'components',
      formula: 'T = (Capacity × Derate) / I_eff',
      description: 'Operating life with duty cycle and Peukert derating factor.',
      component: <BatteryRuntimeCalc />,
    },
    {
      id: 'pwm',
      name: 'PWM Duty Cycle & Waveform',
      icon: '〰️',
      category: 'robotics',
      formula: 'Duty% = (Ton / T) × 100%',
      description: 'Period, Arduino 8-bit analogWrite(0-255), and filtered DC.',
      component: <PwmCalc />,
    },
    {
      id: 'servo-pulse',
      name: 'RC Servo Pulse Width',
      icon: '🎯',
      category: 'robotics',
      formula: '544 µs (0°) to 2400 µs (180°)',
      description: '50 Hz refresh frame timing and interactive horn rotation.',
      component: <ServoPulseCalc />,
    },
    {
      id: 'gear-ratio',
      name: 'Gear Ratio & Transmission',
      icon: '⚙️',
      category: 'robotics',
      formula: 'GR = N_driven / N_driver',
      description: 'Speed reduction, torque multiplication (N·m, kg·cm), and losses.',
      component: <GearRatioCalc />,
    },
    {
      id: 'motor-power',
      name: 'DC Motor Power & Efficiency',
      icon: '🏎️',
      category: 'robotics',
      formula: 'P_mech = τ × ω · η = P_out / P_in',
      description: 'Electrical input vs shaft torque, speed, and thermal heat loss.',
      component: <MotorPowerCalc />,
    },
    {
      id: 'unit-converter',
      name: 'SI Engineering Prefix Converter',
      icon: '📐',
      category: 'units',
      formula: 'pico · nano · micro · milli · kilo · mega',
      description: 'Convert units with explicit exponent derivations.',
      component: <UnitConverterCalc />,
    },
  ];

  const filteredCalculators = CALCULATORS.filter(calc => {
    const matchesCategory = categoryFilter === 'all' || calc.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCalc = CALCULATORS.find(c => c.id === activeTab) ?? CALCULATORS[0]!;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <header className="border-b border-border-subtle pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <span>🧮</span> Engineering Calculators
          </h1>
          <p className="text-sm text-text-muted mt-1">
            All 12 robotics & electronics calculators with step-by-step mathematical proofs,
            formulas, and SI units.
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search calculators & formulas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs text-white placeholder-text-muted focus:border-sky-500 focus:outline-none"
          />
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'all'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-850'
          }`}
        >
          All Calculators ({CALCULATORS.length})
        </button>
        <button
          onClick={() => setCategoryFilter('electronics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'electronics'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-850'
          }`}
        >
          ⚡ Basic Electronics (4)
        </button>
        <button
          onClick={() => setCategoryFilter('components')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'components'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-850'
          }`}
        >
          💡 Components & Power (3)
        </button>
        <button
          onClick={() => setCategoryFilter('robotics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'robotics'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-850'
          }`}
        >
          🤖 Robotics & Actuators (4)
        </button>
        <button
          onClick={() => setCategoryFilter('units')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'units'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-850'
          }`}
        >
          📐 SI Units (1)
        </button>
      </div>

      {/* Calculator Grid / Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredCalculators.map(c => {
          const isActive = c.id === activeTab;
          return (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-sky-950/70 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-slate-900/50 border-border-subtle hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-xl block mb-1.5">{c.icon}</span>
                <span
                  className={`text-xs font-bold block leading-tight ${
                    isActive ? 'text-sky-300' : 'text-white'
                  }`}
                >
                  {c.name}
                </span>
              </div>
              <span className="text-[10px] text-text-muted mt-2 block font-mono truncate">
                {c.formula}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Calculator Container */}
      <Card variant="surface" className="p-6">
        {activeCalc.component}
      </Card>
    </div>
  );
};
