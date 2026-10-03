import React from 'react';
import type { CircuitNetlist, SimulationResult, CircuitComponent } from '@roboforge/sim-circuit';

interface SchematicViewProps {
  netlist: CircuitNetlist;
  simResult: SimulationResult;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onToggleSwitch: (componentId: string) => void;
  redProbeNode: string | null;
  blackProbeNode: string | null;
}

export const SchematicView: React.FC<SchematicViewProps> = ({
  netlist,
  simResult,
  selectedComponentId,
  onSelectComponent,
  onToggleSwitch,
  redProbeNode,
  blackProbeNode,
}) => {
  const width = 800;
  const height = 360;

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-4xl h-auto drop-shadow-xl bg-surface border border-border-subtle rounded-2xl"
        style={{ minHeight: '360px' }}
      >
        <defs>
          {/* Subtle schematic grid background */}
          <pattern id="schematicGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#64748b" opacity="0.3" />
          </pattern>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#schematicGrid)" />

        {/* Draw Wire Connections between components sharing nodeIds */}
        {renderOrthogonalNets(netlist, simResult)}

        {/* Components */}
        {netlist.components.map(comp => (
          <g key={comp.id} onClick={() => onSelectComponent(comp.id)} className="cursor-pointer">
            {renderSchematicSymbol(
              comp,
              simResult,
              onToggleSwitch,
              selectedComponentId === comp.id,
            )}
          </g>
        ))}

        {/* Multimeter Probe Markers */}
        {redProbeNode && (
          <text
            x={150}
            y={25}
            fill="#ef4444"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            [+] Red Probe attached to Net: {redProbeNode}
          </text>
        )}
        {blackProbeNode && (
          <text
            x={450}
            y={25}
            fill="#94a3b8"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            [-] Black Probe attached to Net: {blackProbeNode}
          </text>
        )}
      </svg>
    </div>
  );
};

function renderOrthogonalNets(netlist: CircuitNetlist, simResult: SimulationResult) {
  // Collect positions for each node to draw connections and voltage labels
  const nodePins = new Map<string, Array<{ x: number; y: number }>>();

  for (const comp of netlist.components) {
    comp.pins.forEach((pin, idx) => {
      if (pin.nodeId) {
        const pinPos = {
          x: comp.position.x + (idx === 0 ? 0 : 80),
          y: comp.position.y + 40,
        };
        const list = nodePins.get(pin.nodeId) || [];
        list.push(pinPos);
        nodePins.set(pin.nodeId, list);
      }
    });
  }

  const elements: React.ReactNode[] = [];

  nodePins.forEach((pins, nodeId) => {
    if (pins.length > 1) {
      // Draw lines connecting the pins of the net
      for (let i = 0; i < pins.length - 1; i++) {
        const p1 = pins[i]!;
        const p2 = pins[i + 1]!;
        elements.push(
          <g key={`net-${nodeId}-${i}`}>
            <path
              d={`M ${p1.x} ${p1.y} L ${p2.x} ${p1.y} L ${p2.x} ${p2.y}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Junction dot */}
            <circle cx={p1.x} cy={p1.y} r="3.5" fill="#38bdf8" />
            <circle cx={p2.x} cy={p2.y} r="3.5" fill="#38bdf8" />
          </g>,
        );
      }

      // Display live calculated node voltage badge
      const voltage = simResult.nodeVoltages[nodeId];
      if (voltage !== undefined && pins[0]) {
        elements.push(
          <g key={`badge-${nodeId}`} transform={`translate(${pins[0].x - 15}, ${pins[0].y - 18})`}>
            <rect
              x="0"
              y="0"
              width="38"
              height="14"
              rx="3"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text
              x="19"
              y="10"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {voltage.toFixed(1)}V
            </text>
          </g>,
        );
      }
    }
  });

  return elements;
}

function renderSchematicSymbol(
  comp: CircuitComponent,
  simResult: SimulationResult,
  onToggleSwitch: (id: string) => void,
  isSelected: boolean,
): React.ReactNode {
  const { x, y } = comp.position;
  const strokeColor = isSelected ? '#38bdf8' : '#f8fafc';
  const state = simResult.componentStates[comp.id];

  switch (comp.type) {
    case 'battery':
    case 'dc_source': {
      const v = comp.properties.voltage_V ?? 9;
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* IEEE DC Voltage Source (Long line / short line pair) */}
          <line x1="40" y1="20" x2="40" y2="35" stroke={strokeColor} strokeWidth="2" />
          {/* Long line (+) */}
          <line x1="20" y1="35" x2="60" y2="35" stroke={strokeColor} strokeWidth="3" />
          <text x="68" y="34" fill="#ef4444" fontSize="12" fontWeight="bold">
            +
          </text>
          {/* Short line (-) */}
          <line x1="28" y1="45" x2="52" y2="45" stroke={strokeColor} strokeWidth="4" />
          <text x="68" y="48" fill="#3b82f6" fontSize="14" fontWeight="bold">
            -
          </text>
          <line x1="40" y1="45" x2="40" y2="60" stroke={strokeColor} strokeWidth="2" />

          {/* Reference Designator */}
          <text x="40" y="15" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {comp.id} ({v}V)
          </text>
        </g>
      );
    }

    case 'resistor': {
      const r = comp.properties.resistance_Ohm ?? 1000;
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Classic Zig-zag Resistor */}
          <path
            d="M 0 40 L 15 40 L 20 30 L 30 50 L 40 30 L 50 50 L 60 30 L 65 40 L 80 40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Component Label */}
          <text x="40" y="22" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {comp.id} ({r >= 1000 ? `${r / 1000}kΩ` : `${r}Ω`})
          </text>
        </g>
      );
    }

    case 'led': {
      const isLit = (state?.brightness ?? 0) > 0.05;
      const isBurnedOut = state?.status === 'burned_out';
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Diode Triangle + Cathode Bar */}
          <line x1="0" y1="40" x2="25" y2="40" stroke={strokeColor} strokeWidth="2" />
          <polygon
            points="25,25 25,55 50,40"
            fill={isLit && !isBurnedOut ? '#ef4444' : '#1e293b'}
            stroke={strokeColor}
            strokeWidth="2"
          />
          <line x1="50" y1="25" x2="50" y2="55" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="50" y1="40" x2="80" y2="40" stroke={strokeColor} strokeWidth="2" />

          {/* Light emission arrows */}
          <line
            x1="42"
            y1="22"
            x2="52"
            y2="12"
            stroke="#eab308"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <line
            x1="52"
            y1="22"
            x2="62"
            y2="12"
            stroke="#eab308"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />

          <text x="40" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {comp.id} {isBurnedOut ? '(BURNED OUT)' : isLit ? '(LIT)' : ''}
          </text>
        </g>
      );
    }

    case 'switch': {
      const isClosed = Boolean(comp.properties.closed);
      return (
        <g
          transform={`translate(${x}, ${y})`}
          onClick={e => {
            e.stopPropagation();
            onToggleSwitch(comp.id);
          }}
          className="cursor-pointer"
        >
          {/* Switch Contacts */}
          <line x1="0" y1="40" x2="25" y2="40" stroke={strokeColor} strokeWidth="2" />
          <circle cx="25" cy="40" r="3" fill="#1e293b" stroke={strokeColor} strokeWidth="2" />
          <circle cx="55" cy="40" r="3" fill="#1e293b" stroke={strokeColor} strokeWidth="2" />
          {/* Lever */}
          <line
            x1="25"
            y1="40"
            x2={isClosed ? '55' : '52'}
            y2={isClosed ? '40' : '22'}
            stroke={isClosed ? '#22c55e' : '#ef4444'}
            strokeWidth="3"
          />
          <line x1="55" y1="40" x2="80" y2="40" stroke={strokeColor} strokeWidth="2" />

          <text x="40" y="16" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {comp.id} ({isClosed ? 'CLOSED' : 'OPEN'})
          </text>
        </g>
      );
    }

    case 'ground': {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <line x1="40" y1="20" x2="40" y2="40" stroke="#38bdf8" strokeWidth="2" />
          <line x1="20" y1="40" x2="60" y2="40" stroke="#38bdf8" strokeWidth="2" />
          <line x1="28" y1="46" x2="52" y2="46" stroke="#38bdf8" strokeWidth="2" />
          <line x1="34" y1="52" x2="46" y2="52" stroke="#38bdf8" strokeWidth="2" />
          <text x="40" y="66" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
            GND
          </text>
        </g>
      );
    }

    default:
      return null;
  }
}
