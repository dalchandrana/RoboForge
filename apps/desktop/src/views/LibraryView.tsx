import React, { useState, useMemo } from 'react';
import { Card, Badge, Callout } from '@roboforge/ui';
import type { Component, PinFunction } from '@roboforge/content-schema';
import bundleData from '../content-bundle.json';

interface ContentBundleWithComponents {
  components: Record<string, Component>;
}

const typedBundle = bundleData as unknown as ContentBundleWithComponents;
const ALL_COMPONENTS: Component[] = Object.values(typedBundle.components || {});

type CategoryFilter =
  'all' | 'passive' | 'semiconductor' | 'ic' | 'power' | 'sensor' | 'actuator' | 'microcontroller';

const PIN_FUNCTION_COLORS: Record<
  PinFunction,
  { bg: string; text: string; border: string; label: string }
> = {
  power: {
    bg: 'bg-red-950/80',
    text: 'text-red-300',
    border: 'border-red-700/60',
    label: 'Power (VCC)',
  },
  ground: {
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    label: 'Ground (GND)',
  },
  gpio: {
    bg: 'bg-sky-950/80',
    text: 'text-sky-300',
    border: 'border-sky-700/60',
    label: 'Digital GPIO',
  },
  analog_in: {
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-700/60',
    label: 'Analog In (ADC)',
  },
  pwm: {
    bg: 'bg-purple-950/80',
    text: 'text-purple-300',
    border: 'border-purple-700/60',
    label: 'PWM Output',
  },
  i2c_sda: {
    bg: 'bg-teal-950/80',
    text: 'text-teal-300',
    border: 'border-teal-700/60',
    label: 'I2C SDA (Data)',
  },
  i2c_scl: {
    bg: 'bg-teal-950/80',
    text: 'text-teal-300',
    border: 'border-teal-700/60',
    label: 'I2C SCL (Clock)',
  },
  spi_mosi: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    label: 'SPI MOSI',
  },
  spi_miso: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    label: 'SPI MISO',
  },
  spi_sck: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    label: 'SPI Clock (SCK)',
  },
  spi_cs: {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    label: 'SPI Chip Select',
  },
  uart_tx: {
    bg: 'bg-fuchsia-950/80',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-700/60',
    label: 'UART Transmit (TX)',
  },
  uart_rx: {
    bg: 'bg-fuchsia-950/80',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-700/60',
    label: 'UART Receive (RX)',
  },
  passive: {
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-800/40',
    label: 'Passive Terminal',
  },
  control: {
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-300',
    border: 'border-indigo-700/60',
    label: 'Control / Gate',
  },
  output: {
    bg: 'bg-orange-950/80',
    text: 'text-orange-300',
    border: 'border-orange-700/60',
    label: 'Power Output',
  },
  input: {
    bg: 'bg-cyan-950/80',
    text: 'text-cyan-300',
    border: 'border-cyan-700/60',
    label: 'Signal Input',
  },
};

export const LibraryView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(ALL_COMPONENTS[0]?.id || 'resistor-axial');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protocols'>('overview');

  const filteredComponents = useMemo(() => {
    return ALL_COMPONENTS.filter(comp => {
      const matchesCategory = categoryFilter === 'all' || comp.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        comp.name.toLowerCase().includes(q) ||
        comp.id.toLowerCase().includes(q) ||
        comp.package.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.aliases.some(a => a.toLowerCase().includes(q)) ||
        comp.pinout.some(
          p => p.name.toLowerCase().includes(q) || p.function.toLowerCase().includes(q),
        );
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const selectedComp = ALL_COMPONENTS.find(c => c.id === selectedId) || ALL_COMPONENTS[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="border-b border-border-subtle pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <span>📚</span> Component Library & Cheat Sheets
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Pinouts, absolute maximum ratings, communication protocols, and safety guidelines for 20
            core robotics components.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Component Catalog
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'protocols'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Protocols Cheat Sheet
            </button>
          </div>

          {/* Search Box */}
          <div className="w-56">
            <input
              type="text"
              placeholder="Search components or pins..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-border-strong rounded-lg text-xs text-white placeholder-text-muted focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </header>

      {activeTab === 'protocols' ? (
        /* Protocols Cheat Sheet Tab */
        <div className="space-y-6">
          <Card variant="surface" className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📡</span> Microcontroller Communication Protocols Cheat Sheet
            </h2>
            <p className="text-xs text-text-muted">
              Quick hardware reference for standard communication buses used across sensors,
              displays, and motor drivers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* I2C */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-teal-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-teal-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    I2C (Inter-Integrated Circuit / TWI)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-teal-950 text-teal-300 rounded font-mono border border-teal-800/40">
                    2-Wire Synchronous
                  </span>
                </div>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Wires:</strong> SDA (Serial Data) & SCL (Serial Clock) + GND reference.
                  </li>
                  <li>
                    <strong>Arduino Uno Pins:</strong> Pin A4 = SDA, Pin A5 = SCL.
                  </li>
                  <li>
                    <strong>Pull-Up Resistors:</strong> Open-drain bus; requires{' '}
                    <strong>4.7 kΩ</strong> pull-up resistors on both SDA and SCL to +5V (or +3.3V).
                  </li>
                  <li>
                    <strong>Addressing:</strong> 7-bit device address (up to 127 devices on a single
                    2-wire bus).
                  </li>
                  <li>
                    <strong>Standard Speeds:</strong> 100 kHz (Standard Mode), 400 kHz (Fast Mode).
                  </li>
                </ul>
              </div>

              {/* SPI */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    SPI (Serial Peripheral Interface)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono border border-emerald-800/40">
                    4-Wire Full Duplex
                  </span>
                </div>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Wires:</strong> MOSI (Master-Out), MISO (Master-In), SCK (Clock), CS/SS
                    (Chip Select active-LOW).
                  </li>
                  <li>
                    <strong>Arduino Uno Pins:</strong> Pin 11 = MOSI, Pin 12 = MISO, Pin 13 = SCK,
                    Pin 10 = SS.
                  </li>
                  <li>
                    <strong>Speed:</strong> High throughput up to <strong>8 MHz - 20 MHz</strong>.
                  </li>
                  <li>
                    <strong>Topology:</strong> Push-pull outputs (no pull-ups required); requires
                    dedicated CS wire for each slave device.
                  </li>
                </ul>
              </div>

              {/* UART */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-fuchsia-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-fuchsia-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
                    UART / Serial
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-fuchsia-950 text-fuchsia-300 rounded font-mono border border-fuchsia-800/40">
                    2-Wire Asynchronous
                  </span>
                </div>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Wires:</strong> TX (Transmit) & RX (Receive) crossed over (Device A TX
                    &rarr; Device B RX).
                  </li>
                  <li>
                    <strong>Arduino Uno Pins:</strong> Pin 0 = RX, Pin 1 = TX (shared with USB
                    Serial interface).
                  </li>
                  <li>
                    <strong>Baud Rates:</strong> 9600, 19200, 38400, 57600, 115200 baud (both
                    devices must agree).
                  </li>
                  <li>
                    <strong>Framing:</strong> Standard 8-N-1 (8 data bits, no parity bit, 1 stop
                    bit).
                  </li>
                </ul>
              </div>

              {/* PWM */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    PWM (Pulse Width Modulation)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-mono border border-purple-800/40">
                    Digital Simulated Analog
                  </span>
                </div>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Wires:</strong> Single control wire + Ground.
                  </li>
                  <li>
                    <strong>Arduino Uno Pins:</strong> Marked with tilde (~): Pins 3, 5, 6, 9, 10,
                    11.
                  </li>
                  <li>
                    <strong>DC Motor Speed:</strong> `analogWrite(pin, 0..255)` controls power duty
                    cycle (0% to 100%).
                  </li>
                  <li>
                    <strong>RC Servos:</strong> Standard 50 Hz frame (20 ms), pulse width from 544
                    &micro;s (0&deg;) to 2400 &micro;s (180&deg;).
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Component Catalog View */
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
            {[
              { id: 'all', label: `All Components (${ALL_COMPONENTS.length})` },
              { id: 'passive', label: '⚡ Passives (4)' },
              { id: 'semiconductor', label: '🔬 Semiconductors (5)' },
              { id: 'ic', label: '🔲 Integrated Circuits (2)' },
              { id: 'power', label: '🔌 Power (1)' },
              { id: 'sensor', label: '📡 Sensors (2)' },
              { id: 'actuator', label: '🤖 Actuators (3)' },
              { id: 'microcontroller', label: '🧠 Microcontrollers (1)' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-text-muted hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Component Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {filteredComponents.map(comp => {
              const isSelected = comp.id === selectedId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                      : 'bg-slate-900/50 border-border-subtle hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                        {comp.symbol || 'PART'}
                      </span>
                      <span className="text-[10px] text-text-muted capitalize">
                        {comp.pinout.length} pins
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold block line-clamp-1 ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {comp.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted mt-2 block truncate">
                    {comp.package}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Component Detail Card */}
          {selectedComp && (
            <Card variant="surface" className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                      Symbol: {selectedComp.symbol || 'N/A'}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {selectedComp.category}
                    </Badge>
                    <span className="text-xs px-2.5 py-0.5 bg-slate-900 text-slate-300 rounded-full border border-border-subtle">
                      Package: {selectedComp.package}
                    </span>
                    {selectedComp.protocols.map(p => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950/80 text-indigo-300 rounded border border-indigo-800/40 uppercase"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black text-white">{selectedComp.name}</h2>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">
                    {selectedComp.description}
                  </p>
                </div>
              </div>

              {/* Pinout Visualization Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                  <span>
                    📌 Pinout Diagram & Function Mapping ({selectedComp.pinout.length} Pins)
                  </span>
                  <span className="text-xs text-sky-400 font-normal">Hover pins for details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedComp.pinout.map(pin => {
                    const style = PIN_FUNCTION_COLORS[pin.function] || {
                      bg: 'bg-slate-900',
                      text: 'text-white',
                      border: 'border-border-subtle',
                      label: pin.function,
                    };
                    const isHovered = hoveredPin === pin.pin;

                    return (
                      <div
                        key={pin.pin}
                        onMouseEnter={() => setHoveredPin(pin.pin)}
                        onMouseLeave={() => setHoveredPin(null)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                            : `${style.bg} ${style.border}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800/80 text-white text-[11px] font-mono font-bold flex items-center justify-center border border-border-subtle">
                              {pin.pin}
                            </span>
                            <span className="font-bold text-xs font-mono text-white">
                              {pin.name}
                            </span>
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.text} bg-black/40`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted pl-7">{pin.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Absolute Maximum Ratings Danger Block */}
              <div className="p-4 bg-red-950/40 rounded-xl border border-red-800/60 space-y-3">
                <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                  <span>⚠️</span> Absolute Maximum Electrical Ratings (Do Not Exceed)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {selectedComp.absoluteMaxRatings.voltage_V !== undefined && (
                    <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-900/50">
                      <span className="text-red-400 block text-[11px]">Max Voltage</span>
                      <span className="text-base font-bold font-mono text-white">
                        {selectedComp.absoluteMaxRatings.voltage_V} V
                      </span>
                    </div>
                  )}
                  {selectedComp.absoluteMaxRatings.current_mA !== undefined && (
                    <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-900/50">
                      <span className="text-red-400 block text-[11px]">Max Current</span>
                      <span className="text-base font-bold font-mono text-white">
                        {selectedComp.absoluteMaxRatings.current_mA} mA
                      </span>
                    </div>
                  )}
                  {selectedComp.absoluteMaxRatings.power_mW !== undefined && (
                    <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-900/50">
                      <span className="text-red-400 block text-[11px]">Max Power</span>
                      <span className="text-base font-bold font-mono text-white">
                        {selectedComp.absoluteMaxRatings.power_mW} mW
                      </span>
                    </div>
                  )}
                  {selectedComp.absoluteMaxRatings.tempMax_C !== undefined && (
                    <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-900/50">
                      <span className="text-red-400 block text-[11px]">Max Junction Temp</span>
                      <span className="text-base font-bold font-mono text-white">
                        {selectedComp.absoluteMaxRatings.tempMax_C} °C
                      </span>
                    </div>
                  )}
                </div>
                {selectedComp.absoluteMaxRatings.notes && (
                  <p className="text-xs text-red-300/90 italic">
                    {selectedComp.absoluteMaxRatings.notes}
                  </p>
                )}
              </div>

              {/* Common Pitfalls & Mistakes */}
              {selectedComp.commonMistakes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span>⚡</span> Common Beginner Mistakes & Burnout Pitfalls
                  </h3>
                  <div className="space-y-2">
                    {selectedComp.commonMistakes.map((mistake, i) => (
                      <div
                        key={i}
                        className="p-3 bg-amber-950/30 rounded-xl border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-2.5"
                      >
                        <span className="text-amber-400 font-bold">✕</span>
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cheat Sheet & Application Notes */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span>📖</span> Application Notes & Formulas
                </h3>
                <div className="p-4 bg-slate-950/70 rounded-xl border border-border-subtle text-xs text-slate-300 space-y-2 font-mono whitespace-pre-line leading-relaxed">
                  {selectedComp.cheatSheetMarkdown}
                </div>
              </div>

              {/* Safety Callout */}
              {selectedComp.safetyNotes && (
                <Callout type="safety" title="Safety First">
                  {selectedComp.safetyNotes}
                </Callout>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
