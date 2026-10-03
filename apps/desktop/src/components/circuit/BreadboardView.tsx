import React from 'react';
import type { CircuitNetlist, SimulationResult, CircuitComponent } from '@roboforge/sim-circuit';
import { getResistorColorBands } from '@roboforge/sim-circuit';

interface BreadboardViewProps {
  netlist: CircuitNetlist;
  simResult: SimulationResult;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onToggleSwitch: (componentId: string) => void;
  redProbeNode: string | null;
  blackProbeNode: string | null;
  onProbeClick?: (nodeId: string) => void;
}

export const BreadboardView: React.FC<BreadboardViewProps> = ({
  netlist,
  simResult,
  selectedComponentId,
  onSelectComponent,
  onToggleSwitch,
  redProbeNode,
  blackProbeNode,
}) => {
  // SVG Breadboard dimensions
  const boardWidth = 820;
  const boardHeight = 360;

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="w-full max-w-4xl h-auto drop-shadow-2xl"
        style={{ minHeight: '360px' }}
      >
        <defs>
          {/* Radial Glow filter for active LED */}
          <radialGradient id="ledGlowRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f87171" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ledGlowGreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4ade80" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ledGlowYellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#fde047" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ledGlowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          {/* Solderless Breadboard Hole Pattern */}
          <pattern id="gridHoles" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" x="5" y="5" rx="1.5" fill="#1e293b" />
            <rect width="4" height="4" x="6" y="6" rx="1" fill="#0f172a" />
          </pattern>
        </defs>

        {/* Outer Breadboard Plastic Chassis */}
        <rect
          x="10"
          y="10"
          width={boardWidth - 20}
          height={boardHeight - 20}
          rx="16"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="3"
        />

        {/* Top Power Rails (Red + and Blue -) */}
        <line
          x1="40"
          y1="36"
          x2="780"
          y2="36"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="25" y="40" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">
          +
        </text>
        <line
          x1="40"
          y1="56"
          x2="780"
          y2="56"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="25" y="60" fill="#3b82f6" fontSize="16" fontWeight="bold" fontFamily="monospace">
          -
        </text>

        {/* Terminal strip section A-E */}
        <rect x="40" y="80" width="740" height="85" fill="url(#gridHoles)" opacity="0.85" />

        {/* Center Trench Divider */}
        <rect x="25" y="175" width="770" height="12" fill="#e2e8f0" rx="4" />
        <text
          x="410"
          y="184"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="bold"
          letterSpacing="3"
        >
          ROBOFORGE HALF-SIZE BREADBOARD
        </text>

        {/* Terminal strip section F-J */}
        <rect x="40" y="196" width="740" height="85" fill="url(#gridHoles)" opacity="0.85" />

        {/* Bottom Power Rails (Blue - and Red +) */}
        <line
          x1="40"
          y1="300"
          x2="780"
          y2="300"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="25" y="304" fill="#3b82f6" fontSize="16" fontWeight="bold" fontFamily="monospace">
          -
        </text>
        <line
          x1="40"
          y1="320"
          x2="780"
          y2="320"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="25" y="324" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace">
          +
        </text>

        {/* Breadboard Column Numbers 1 to 30 */}
        {Array.from({ length: 30 }).map((_, i) => (
          <text
            key={i}
            x={50 + i * 24.5}
            y="75"
            textAnchor="middle"
            fill="#64748b"
            fontSize="8"
            fontFamily="monospace"
          >
            {i + 1}
          </text>
        ))}

        {/* Render Components */}
        {netlist.components.map(comp => (
          <g
            key={comp.id}
            onClick={() => onSelectComponent(comp.id)}
            className="cursor-pointer transition-transform"
          >
            {renderBreadboardComponent(
              comp,
              simResult,
              onToggleSwitch,
              selectedComponentId === comp.id,
            )}
          </g>
        ))}

        {/* Render Multimeter Probe Indicators */}
        {redProbeNode && renderProbeBadge(redProbeNode, '#ef4444', '+ RED PROBE', netlist)}
        {blackProbeNode && renderProbeBadge(blackProbeNode, '#1e293b', '- BLK PROBE', netlist)}
      </svg>
    </div>
  );
};

function renderProbeBadge(
  nodeId: string,
  color: string,
  label: string,
  netlist: CircuitNetlist,
): React.ReactNode {
  // Find a component pin connected to this node to anchor the probe
  let anchorX = 100;
  let anchorY = 50;

  for (const comp of netlist.components) {
    const pin = comp.pins.find(p => p.nodeId === nodeId);
    if (pin) {
      anchorX = comp.position.x + (comp.pins[0]?.id === pin.id ? 20 : 60);
      anchorY = comp.position.y - 15;
      break;
    }
  }

  return (
    <g transform={`translate(${anchorX}, ${anchorY})`}>
      <polygon points="0,0 -8,-18 8,-18" fill={color} stroke="#ffffff" strokeWidth="1.5" />
      <rect
        x="-35"
        y="-36"
        width="70"
        height="18"
        rx="4"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1"
      />
      <text
        x="0"
        y="-24"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="9"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

function renderBreadboardComponent(
  comp: CircuitComponent,
  simResult: SimulationResult,
  onToggleSwitch: (id: string) => void,
  isSelected: boolean,
): React.ReactNode {
  const { x, y } = comp.position;
  const state = simResult.componentStates[comp.id];

  switch (comp.type) {
    case 'battery':
    case 'dc_source': {
      const v = comp.properties.voltage_V ?? 9;
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Battery Body */}
          <rect
            x="0"
            y="0"
            width="80"
            height="120"
            rx="8"
            fill="#1e293b"
            stroke={isSelected ? '#38bdf8' : '#0f172a'}
            strokeWidth={isSelected ? '3' : '1.5'}
          />
          {/* Terminals */}
          <circle cx="25" cy="0" r="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="55" cy="0" r="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <text x="25" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">
            +
          </text>
          <text x="55" y="4" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3b82f6">
            -
          </text>
          {/* Battery Label */}
          <text x="40" y="55" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="black">
            {v}V
          </text>
          <text x="40" y="75" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
            DC SOURCE
          </text>
          {/* Wire leads to breadboard rails */}
          <path d="M 25 0 Q 25 -25, 45 36" fill="none" stroke="#ef4444" strokeWidth="3" />
          <path d="M 55 0 Q 55 -30, 45 56" fill="none" stroke="#3b82f6" strokeWidth="3" />
        </g>
      );
    }

    case 'resistor': {
      const r = comp.properties.resistance_Ohm ?? 1000;
      const bands = getResistorColorBands(r);
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Metal Wire Leads */}
          <line
            x1="-30"
            y1="12"
            x2="0"
            y2="12"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="70"
            y1="12"
            x2="100"
            y2="12"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Resistor Beige Body */}
          <rect
            x="0"
            y="2"
            width="70"
            height="20"
            rx="5"
            fill="#e2d2a4"
            stroke={isSelected ? '#38bdf8' : '#c8b47e'}
            strokeWidth={isSelected ? '2.5' : '1.5'}
          />

          {/* 4 EIA Color Bands */}
          <rect x="12" y="2" width="6" height="20" fill={bands.hexColors[0]} />
          <rect x="24" y="2" width="6" height="20" fill={bands.hexColors[1]} />
          <rect x="36" y="2" width="6" height="20" fill={bands.hexColors[2]} />
          <rect x="52" y="2" width="5" height="20" fill={bands.hexColors[3]} />

          {/* Value Display */}
          <text
            x="35"
            y="-5"
            textAnchor="middle"
            fill="#334155"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {r >= 1000 ? `${(r / 1000).toFixed(1)}kΩ` : `${r}Ω`}
          </text>
        </g>
      );
    }

    case 'led': {
      const color = comp.properties.color || 'red';
      const isBurnedOut = state?.status === 'burned_out';
      const isLit = (state?.brightness ?? 0) > 0.05;
      const glowFilter =
        color === 'green'
          ? 'url(#ledGlowGreen)'
          : color === 'yellow'
            ? 'url(#ledGlowYellow)'
            : color === 'blue'
              ? 'url(#ledGlowBlue)'
              : 'url(#ledGlowRed)';

      const domeColor = isBurnedOut
        ? '#334155'
        : color === 'green'
          ? '#22c55e'
          : color === 'yellow'
            ? '#eab308'
            : color === 'blue'
              ? '#3b82f6'
              : '#ef4444';

      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Glow circle when active */}
          {isLit && !isBurnedOut && (
            <circle
              cx="20"
              cy="20"
              r={30 + (state?.brightness ?? 1) * 20}
              fill={glowFilter}
              opacity={state?.brightness ?? 0.8}
            />
          )}

          {/* Metal Wire Leads */}
          <line x1="12" y1="26" x2="12" y2="70" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="28" y1="26" x2="28" y2="60" stroke="#94a3b8" strokeWidth="2.5" />

          {/* LED Lens Collar / Base */}
          <rect
            x="6"
            y="22"
            width="28"
            height="6"
            rx="2"
            fill={domeColor}
            stroke="#000000"
            strokeWidth="0.8"
          />

          {/* LED 5mm Dome */}
          <path
            d="M 8 22 C 8 4, 32 4, 32 22 Z"
            fill={domeColor}
            stroke={isSelected ? '#38bdf8' : '#000000'}
            strokeWidth={isSelected ? '2' : '0.8'}
            opacity={isBurnedOut ? 0.7 : 0.95}
          />

          {/* Dome highlight reflection */}
          {!isBurnedOut && <ellipse cx="15" cy="12" rx="3" ry="5" fill="#ffffff" opacity="0.4" />}

          {/* Burnout smoke puff indicator */}
          {isBurnedOut && (
            <g transform="translate(10, -25)">
              <text x="10" y="10" fontSize="24" textAnchor="middle">
                💥💨
              </text>
              <rect x="-15" y="-12" width="50" height="14" rx="3" fill="#dc2626" />
              <text x="10" y="-2" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                BURNED OUT
              </text>
            </g>
          )}

          {/* Current readout */}
          <text
            x="20"
            y="85"
            textAnchor="middle"
            fill="#334155"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {state?.current_mA ? `${state.current_mA} mA` : '0 mA'}
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
          {/* Switch Base */}
          <rect
            x="0"
            y="0"
            width="50"
            height="36"
            rx="4"
            fill="#334155"
            stroke={isSelected ? '#38bdf8' : '#1e293b'}
            strokeWidth={isSelected ? '2' : '1'}
          />
          {/* Lever / Rocker */}
          <rect
            x={isClosed ? '26' : '6'}
            y="6"
            width="18"
            height="24"
            rx="3"
            fill={isClosed ? '#22c55e' : '#ef4444'}
            stroke="#ffffff"
            strokeWidth="1"
          />
          <text
            x={isClosed ? '35' : '15'}
            y="22"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
          >
            {isClosed ? 'ON' : 'OFF'}
          </text>
          {/* Pin leads */}
          <line x1="10" y1="36" x2="10" y2="54" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="40" y1="36" x2="40" y2="54" stroke="#94a3b8" strokeWidth="2.5" />
        </g>
      );
    }

    case 'ground': {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <line x1="15" y1="0" x2="15" y2="15" stroke="#3b82f6" strokeWidth="2" />
          <line x1="0" y1="15" x2="30" y2="15" stroke="#3b82f6" strokeWidth="2" />
          <line x1="5" y1="20" x2="25" y2="20" stroke="#3b82f6" strokeWidth="2" />
          <line x1="10" y1="25" x2="20" y2="25" stroke="#3b82f6" strokeWidth="2" />
          <text x="15" y="38" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">
            GND
          </text>
        </g>
      );
    }

    default:
      return null;
  }
}
