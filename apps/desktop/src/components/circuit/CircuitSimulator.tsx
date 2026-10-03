import React, { useState, useMemo } from 'react';
import {
  type CircuitNetlist,
  type CircuitComponent,
  solveCircuit,
  exportToSPICE,
} from '@roboforge/sim-circuit';
import { Button, Card, Badge } from '@roboforge/ui';
import { BreadboardView } from './BreadboardView';
import { SchematicView } from './SchematicView';
import { VirtualMultimeter } from './VirtualMultimeter';
import { BurnoutModal } from './BurnoutModal';
import { SpiceExportModal } from './SpiceExportModal';

// Preset educational circuits
const PRESETS: Record<string, CircuitNetlist> = {
  led_safe: {
    id: 'c-led-safe',
    title: 'Series LED Circuit (Safe)',
    version: 1,
    groundNodeId: '0',
    components: [
      {
        id: 'V1',
        type: 'battery',
        label: '9V Battery',
        position: { x: 50, y: 120 },
        rotation: 0,
        properties: { voltage_V: 9 },
        pins: [
          { id: 'p1', name: '+', nodeId: 'VCC' },
          { id: 'p2', name: '-', nodeId: '0' },
        ],
      },
      {
        id: 'SW1',
        type: 'switch',
        label: 'Push Switch',
        position: { x: 200, y: 100 },
        rotation: 0,
        properties: { closed: true },
        pins: [
          { id: 'p1', name: '1', nodeId: 'VCC' },
          { id: 'p2', name: '2', nodeId: 'SW_OUT' },
        ],
      },
      {
        id: 'R1',
        type: 'resistor',
        label: '350Ω Resistor',
        position: { x: 340, y: 110 },
        rotation: 0,
        properties: { resistance_Ohm: 350 },
        pins: [
          { id: 'p1', name: '1', nodeId: 'SW_OUT' },
          { id: 'p2', name: '2', nodeId: 'LED_A' },
        ],
      },
      {
        id: 'LED1',
        type: 'led',
        label: 'Red LED',
        position: { x: 520, y: 100 },
        rotation: 0,
        properties: { forwardVoltage_V: 2.0, maxCurrent_mA: 25, color: 'red' },
        pins: [
          { id: 'p1', name: 'Anode', nodeId: 'LED_A' },
          { id: 'p2', name: 'Cathode', nodeId: '0' },
        ],
      },
      {
        id: 'G1',
        type: 'ground',
        label: 'Ground',
        position: { x: 650, y: 100 },
        rotation: 0,
        properties: {},
        pins: [{ id: 'p1', name: 'GND', nodeId: '0' }],
      },
    ],
  },

  led_burnout: {
    id: 'c-led-burnout',
    title: 'Overcurrent Burnout Test (No Resistor)',
    version: 1,
    groundNodeId: '0',
    components: [
      {
        id: 'V1',
        type: 'battery',
        label: '9V Battery',
        position: { x: 80, y: 120 },
        rotation: 0,
        properties: { voltage_V: 9 },
        pins: [
          { id: 'p1', name: '+', nodeId: 'VCC' },
          { id: 'p2', name: '-', nodeId: '0' },
        ],
      },
      {
        id: 'LED1',
        type: 'led',
        label: 'Unprotected LED',
        position: { x: 300, y: 100 },
        rotation: 0,
        properties: { forwardVoltage_V: 2.0, maxCurrent_mA: 25, color: 'red' },
        pins: [
          { id: 'p1', name: 'Anode', nodeId: 'VCC' },
          { id: 'p2', name: 'Cathode', nodeId: '0' },
        ],
      },
      {
        id: 'G1',
        type: 'ground',
        label: 'Ground',
        position: { x: 500, y: 100 },
        rotation: 0,
        properties: {},
        pins: [{ id: 'p1', name: 'GND', nodeId: '0' }],
      },
    ],
  },

  vdivider: {
    id: 'c-vdivider',
    title: 'Voltage Divider (1kΩ / 1kΩ)',
    version: 1,
    groundNodeId: '0',
    components: [
      {
        id: 'V1',
        type: 'battery',
        label: '9V Battery',
        position: { x: 60, y: 120 },
        rotation: 0,
        properties: { voltage_V: 9 },
        pins: [
          { id: 'p1', name: '+', nodeId: 'VCC' },
          { id: 'p2', name: '-', nodeId: '0' },
        ],
      },
      {
        id: 'R1',
        type: 'resistor',
        label: '1kΩ Resistor',
        position: { x: 240, y: 110 },
        rotation: 0,
        properties: { resistance_Ohm: 1000 },
        pins: [
          { id: 'p1', name: '1', nodeId: 'VCC' },
          { id: 'p2', name: '2', nodeId: 'MID' },
        ],
      },
      {
        id: 'R2',
        type: 'resistor',
        label: '1kΩ Resistor',
        position: { x: 440, y: 110 },
        rotation: 0,
        properties: { resistance_Ohm: 1000 },
        pins: [
          { id: 'p1', name: '1', nodeId: 'MID' },
          { id: 'p2', name: '2', nodeId: '0' },
        ],
      },
      {
        id: 'G1',
        type: 'ground',
        label: 'Ground',
        position: { x: 620, y: 100 },
        rotation: 0,
        properties: {},
        pins: [{ id: 'p1', name: 'GND', nodeId: '0' }],
      },
    ],
  },
};

export interface CircuitSimulatorProps {
  initialPreset?: keyof typeof PRESETS;
  embedded?: boolean;
  onNetlistChange?: (netlist: CircuitNetlist) => void;
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  initialPreset = 'led_safe',
  embedded: _embedded = false,
  onNetlistChange,
}) => {
  const [netlist, setNetlist] = useState<CircuitNetlist>(() =>
    JSON.parse(JSON.stringify(PRESETS[initialPreset] || PRESETS.led_safe)),
  );

  React.useEffect(() => {
    if (onNetlistChange) {
      onNetlistChange(netlist);
    }
  }, [netlist, onNetlistChange]);

  const [viewMode, setViewMode] = useState<'breadboard' | 'schematic'>('breadboard');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  // Multimeter probe state
  const [showMultimeter, setShowMultimeter] = useState(true);
  const [redProbeNode, setRedProbeNode] = useState<string | null>('VCC');
  const [blackProbeNode, setBlackProbeNode] = useState<string | null>('0');

  // Modals
  const [showSpiceModal, setShowSpiceModal] = useState(false);
  const [burnoutAlertShown, setBurnoutAlertShown] = useState(false);

  // Run MNA simulation solver reactively on every netlist state change
  const simResult = useMemo(() => {
    return solveCircuit(netlist);
  }, [netlist]);

  // Check if any component burned out
  const burnedComponent = useMemo(() => {
    for (const comp of netlist.components) {
      if (simResult.componentStates[comp.id]?.status === 'burned_out') {
        return {
          comp,
          state: simResult.componentStates[comp.id]!,
        };
      }
    }
    return null;
  }, [netlist, simResult]);

  // Toggle switch closed/open
  const handleToggleSwitch = (compId: string) => {
    setNetlist((prev: CircuitNetlist) => ({
      ...prev,
      components: prev.components.map((c: CircuitComponent) => {
        if (c.id === compId) {
          return {
            ...c,
            properties: { ...c.properties, closed: !c.properties.closed },
          };
        }
        return c;
      }),
    }));
  };

  // Change selected component property (e.g. resistance)
  const handleUpdateProperty = (
    compId: string,
    updates: Partial<CircuitComponent['properties']>,
  ) => {
    setNetlist((prev: CircuitNetlist) => ({
      ...prev,
      components: prev.components.map((c: CircuitComponent) => {
        if (c.id === compId) {
          return { ...c, properties: { ...c.properties, ...updates } };
        }
        return c;
      }),
    }));
  };

  // Automatically fix burned out LED by inserting a 330 Ohm resistor in series
  const handleFixBurnout = () => {
    if (!burnedComponent) return;
    const led = burnedComponent.comp;

    // Insert resistor before LED anode
    const oldAnodeNode = led.pins[0]?.nodeId || 'VCC';
    const newIntermediateNode = 'NET_RES_FIX';

    const newResistor: CircuitComponent = {
      id: `R_PROTECT_${Date.now().toString().slice(-4)}`,
      type: 'resistor',
      label: '330Ω Limiting Resistor',
      position: { x: led.position.x - 140, y: led.position.y + 10 },
      rotation: 0,
      properties: { resistance_Ohm: 330 },
      pins: [
        { id: 'p1', name: '1', nodeId: oldAnodeNode },
        { id: 'p2', name: '2', nodeId: newIntermediateNode },
      ],
    };

    setNetlist((prev: CircuitNetlist) => ({
      ...prev,
      components: [
        ...prev.components.map((c: CircuitComponent) => {
          if (c.id === led.id) {
            return {
              ...c,
              pins: [{ id: 'p1', name: 'Anode', nodeId: newIntermediateNode }, c.pins[1]!],
            };
          }
          return c;
        }),
        newResistor,
      ],
    }));

    setBurnoutAlertShown(false);
  };

  // Load a preset
  const handleLoadPreset = (key: keyof typeof PRESETS) => {
    setNetlist(JSON.parse(JSON.stringify(PRESETS[key])));
    setSelectedCompId(null);
    setBurnoutAlertShown(false);
  };

  const selectedComp = netlist.components.find(c => c.id === selectedCompId);
  const spiceNetlist = useMemo(() => exportToSPICE(netlist), [netlist]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              MNA SOLVER: LIVE
            </span>
          </div>
          <span className="text-sm font-semibold text-text-main hidden sm:inline">
            {netlist.title}
          </span>
        </div>

        {/* View Mode Toggle & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Circuits Selector */}
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => handleLoadPreset('led_safe')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                netlist.id === 'c-led-safe'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Safe LED
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('led_burnout')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                netlist.id === 'c-led-burnout'
                  ? 'bg-red-500 text-white font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Burnout Demo 💥
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('vdivider')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                netlist.id === 'c-vdivider'
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Voltage Divider
            </button>
          </div>

          {/* Dual View Toggle */}
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setViewMode('breadboard')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'breadboard'
                  ? 'bg-surface text-sky-400 font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Breadboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'schematic'
                  ? 'bg-surface text-sky-400 font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Schematic
            </button>
          </div>

          {/* Multimeter & SPICE Action Buttons */}
          <Button variant="secondary" size="sm" onClick={() => setShowMultimeter(!showMultimeter)}>
            {showMultimeter ? 'Hide Multimeter' : 'Show Multimeter'}
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setShowSpiceModal(true)}>
            SPICE Netlist
          </Button>
        </div>
      </div>

      {/* Burnout Warning Banner */}
      {burnedComponent && (
        <div className="flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💥</span>
            <div>
              <span className="font-bold text-sm text-red-300">
                Warning: {burnedComponent.comp.label || burnedComponent.comp.id} has burned out!
              </span>
              <span className="text-xs text-red-300/80 block">
                Current exceeded safe limit ({burnedComponent.state.current_mA} mA &gt;{' '}
                {burnedComponent.comp.properties.maxCurrent_mA ?? 25} mA).
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setBurnoutAlertShown(true)}>
              Learn Why
            </Button>
            <Button variant="primary" size="sm" onClick={handleFixBurnout}>
              Insert 330Ω Resistor
            </Button>
          </div>
        </div>
      )}

      {/* ERC Issues Banner (if any) */}
      {simResult.ercIssues.length > 0 && !burnedComponent && (
        <div className="flex flex-col gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span>⚡ Electrical Rules Check ({simResult.ercIssues.length} note(s)):</span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-amber-200/90 pl-1">
            {simResult.ercIssues.map((issue, idx) => (
              <li key={idx}>
                <strong>{issue.code}</strong>: {issue.message} —{' '}
                <span className="text-amber-300/70 italic">{issue.learnerTip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Workbench: Canvas & Floating Multimeter */}
      <div className="relative flex flex-col xl:flex-row gap-6 items-start">
        {/* Canvas Workspace */}
        <div className="flex-1 w-full bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col items-center justify-center min-h-[420px] shadow-sm">
          {viewMode === 'breadboard' ? (
            <BreadboardView
              netlist={netlist}
              simResult={simResult}
              selectedComponentId={selectedCompId}
              onSelectComponent={setSelectedCompId}
              onToggleSwitch={handleToggleSwitch}
              redProbeNode={redProbeNode}
              blackProbeNode={blackProbeNode}
            />
          ) : (
            <SchematicView
              netlist={netlist}
              simResult={simResult}
              selectedComponentId={selectedCompId}
              onSelectComponent={setSelectedCompId}
              onToggleSwitch={handleToggleSwitch}
              redProbeNode={redProbeNode}
              blackProbeNode={blackProbeNode}
            />
          )}

          <div className="w-full text-center text-xs text-text-muted mt-3">
            Tip: Click the switch to toggle ON/OFF. Click any component to inspect and adjust its
            properties.
          </div>
        </div>

        {/* Side Panel: Virtual Multimeter & Inspector */}
        <div className="w-full xl:w-80 flex flex-col gap-4 flex-shrink-0">
          {/* Virtual Multimeter */}
          {showMultimeter && (
            <VirtualMultimeter
              netlist={netlist}
              simResult={simResult}
              redProbeNode={redProbeNode}
              blackProbeNode={blackProbeNode}
              onSelectRedProbe={setRedProbeNode}
              onSelectBlackProbe={setBlackProbeNode}
              onClose={() => setShowMultimeter(false)}
            />
          )}

          {/* Component Properties Inspector */}
          {selectedComp && (
            <Card title={`Inspector: ${selectedComp.label || selectedComp.id}`}>
              <div className="space-y-3 text-xs text-text-main">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Type:</span>
                  <Badge variant="secondary">{selectedComp.type.toUpperCase()}</Badge>
                </div>

                {selectedComp.type === 'resistor' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Resistance:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {selectedComp.properties.resistance_Ohm ?? 1000} Ω
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="10000"
                      step="50"
                      value={selectedComp.properties.resistance_Ohm ?? 1000}
                      onChange={e =>
                        handleUpdateProperty(selectedComp.id, {
                          resistance_Ohm: Number(e.target.value),
                        })
                      }
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted font-mono">
                      <span>50Ω</span>
                      <span>1kΩ</span>
                      <span>10kΩ</span>
                    </div>
                  </div>
                )}

                {selectedComp.type === 'battery' && (
                  <div className="space-y-1.5">
                    <span className="text-text-muted">Voltage:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[3.3, 5, 9, 12].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleUpdateProperty(selectedComp.id, { voltage_V: v })}
                          className={`py-1 rounded font-bold ${
                            selectedComp.properties.voltage_V === v
                              ? 'bg-sky-500 text-white'
                              : 'bg-surface-subtle text-text-muted hover:text-text-main'
                          }`}
                        >
                          {v}V
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedComp.type === 'led' && (
                  <div className="space-y-1.5">
                    <span className="text-text-muted">LED Color:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['red', 'green', 'yellow', 'blue'] as const).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleUpdateProperty(selectedComp.id, { color: c })}
                          className={`py-1 rounded capitalize font-medium ${
                            (selectedComp.properties.color || 'red') === c
                              ? 'bg-sky-500 text-white font-bold'
                              : 'bg-surface-subtle text-text-muted hover:text-text-main'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live measured values for selected component */}
                {simResult.componentStates[selectedComp.id] && (
                  <div className="bg-surface-subtle p-2.5 rounded-xl border border-border-subtle space-y-1">
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                      Live Operating Point
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-text-muted block text-[10px]">Voltage:</span>
                        <span className="font-bold">
                          {simResult.componentStates[selectedComp.id]?.voltage_V} V
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px]">Current:</span>
                        <span className="font-bold">
                          {simResult.componentStates[selectedComp.id]?.current_mA} mA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setSelectedCompId(null)}
                >
                  Deselect
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Burnout Modal */}
      {burnedComponent && (
        <BurnoutModal
          isOpen={burnoutAlertShown}
          componentLabel={burnedComponent.comp.label || burnedComponent.comp.id}
          current_mA={burnedComponent.state.current_mA}
          maxCurrent_mA={burnedComponent.comp.properties.maxCurrent_mA ?? 25}
          onDismiss={() => setBurnoutAlertShown(false)}
          onFixWithResistor={handleFixBurnout}
        />
      )}

      {/* SPICE Netlist Export Modal */}
      <SpiceExportModal
        isOpen={showSpiceModal}
        spiceNetlist={spiceNetlist}
        onClose={() => setShowSpiceModal(false)}
      />
    </div>
  );
};
