import React, { useState } from 'react';
import type { SimulationResult, CircuitNetlist } from '@roboforge/sim-circuit';

export type MultimeterMode = 'OFF' | 'V_DC' | 'MA_DC' | 'OHM';

interface VirtualMultimeterProps {
  netlist: CircuitNetlist;
  simResult: SimulationResult;
  redProbeNode: string | null;
  blackProbeNode: string | null;
  onSelectRedProbe: (nodeId: string | null) => void;
  onSelectBlackProbe: (nodeId: string | null) => void;
  onClose?: () => void;
}

export const VirtualMultimeter: React.FC<VirtualMultimeterProps> = ({
  netlist,
  simResult,
  redProbeNode,
  blackProbeNode,
  onSelectRedProbe,
  onSelectBlackProbe,
  onClose,
}) => {
  const [mode, setMode] = useState<MultimeterMode>('V_DC');
  const [isMinimized, setIsMinimized] = useState(false);

  // Calculate LCD measurement string based on current mode and probe positions
  const getMeasurementDisplay = (): { value: string; unit: string } => {
    if (mode === 'OFF') {
      return { value: '', unit: '' };
    }

    if (!redProbeNode && !blackProbeNode) {
      return { value: '0.000', unit: mode === 'V_DC' ? 'V' : mode === 'MA_DC' ? 'mA' : 'Ω' };
    }

    if (mode === 'V_DC') {
      const vRed = (redProbeNode ? simResult.nodeVoltages[redProbeNode] : 0) ?? 0;
      const vBlack = (blackProbeNode ? simResult.nodeVoltages[blackProbeNode] : 0) ?? 0;
      const diff = vRed - vBlack;
      const absDiff = Math.abs(diff);

      if (absDiff < 0.001) {
        return { value: '0.000', unit: 'V' };
      }
      if (absDiff < 1.0) {
        return { value: (diff * 1000).toFixed(1), unit: 'mV' };
      }
      return { value: diff.toFixed(3), unit: 'V' };
    }

    if (mode === 'OHM') {
      // Find component connected between red and black probe
      if (redProbeNode && blackProbeNode && redProbeNode !== blackProbeNode) {
        const comp = netlist.components.find(c => {
          const n1 = c.pins[0]?.nodeId;
          const n2 = c.pins[1]?.nodeId;
          return (
            (n1 === redProbeNode && n2 === blackProbeNode) ||
            (n1 === blackProbeNode && n2 === redProbeNode)
          );
        });

        if (comp && comp.type === 'resistor') {
          const r = comp.properties.resistance_Ohm ?? 1000;
          if (r >= 1000000) return { value: (r / 1000000).toFixed(2), unit: 'MΩ' };
          if (r >= 1000) return { value: (r / 1000).toFixed(2), unit: 'kΩ' };
          return { value: r.toFixed(1), unit: 'Ω' };
        }
      }
      return { value: 'O.L', unit: 'MΩ' };
    }

    if (mode === 'MA_DC') {
      // Find component connected to red probe node
      if (redProbeNode) {
        const comp = netlist.components.find(
          c => c.pins[0]?.nodeId === redProbeNode || c.pins[1]?.nodeId === redProbeNode,
        );
        if (comp && simResult.componentStates[comp.id]) {
          const i_mA = simResult.componentStates[comp.id]?.current_mA ?? 0;
          return { value: i_mA.toFixed(2), unit: 'mA' };
        }
      }
      return { value: '0.00', unit: 'mA' };
    }

    return { value: '0.00', unit: '' };
  };

  const reading = getMeasurementDisplay();

  // All available unique net nodes for probe clipping
  const availableNodes: string[] = Array.from(
    new Set(
      netlist.components.flatMap(c =>
        c.pins.map(p => p.nodeId).filter((id): id is string => Boolean(id)),
      ),
    ),
  );

  return (
    <div
      role="region"
      aria-label="Virtual Multimeter"
      className="bg-amber-400 p-2.5 rounded-2xl shadow-2xl border-4 border-amber-500 w-80 text-slate-900 select-none font-sans"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-xs tracking-wider uppercase bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded">
            RF-830D
          </span>
          <span className="text-[11px] font-bold text-slate-800">DIGITAL MULTIMETER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs font-bold w-6 h-6 rounded bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-slate-900"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '_'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold w-6 h-6 rounded bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-slate-900"
              title="Close Multimeter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex flex-col gap-3">
          {/* LCD Digital Display */}
          <div className="bg-[#b4c99c] border-4 border-slate-700 rounded-lg p-2.5 flex items-baseline justify-between shadow-inner">
            <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest">
              {mode !== 'OFF' ? 'AUTO DC' : 'OFF'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-mono text-3xl font-black text-slate-900 tracking-wider"
                style={{ fontFamily: 'ui-monospace, monospace' }}
              >
                {mode === 'OFF' ? ' ' : reading.value}
              </span>
              <span className="font-mono text-sm font-bold text-slate-800">{reading.unit}</span>
            </div>
          </div>

          {/* Rotary Dial Selector */}
          <div className="flex flex-col items-center py-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Function Dial
            </div>
            <div className="grid grid-cols-4 gap-1.5 w-full">
              {(
                [
                  { id: 'OFF', label: 'OFF' },
                  { id: 'V_DC', label: 'V ⎓' },
                  { id: 'MA_DC', label: 'mA ⎓' },
                  { id: 'OHM', label: 'Ω' },
                ] as const
              ).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={`py-1 px-2 rounded text-xs font-bold tracking-wider transition-all ${
                    mode === opt.id
                      ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Probe Lead Connection Points */}
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 space-y-2 text-xs">
            {/* Red (+) Probe */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm"></span>
                <span className="text-red-400 font-bold font-mono text-[11px]">V/Ω/mA (+)</span>
              </div>
              <select
                aria-label="Red Probe Connected Node"
                value={redProbeNode || ''}
                onChange={e => onSelectRedProbe(e.target.value || null)}
                className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs focus:ring-1 focus:ring-red-500"
              >
                <option value="">Unclipped</option>
                {availableNodes.map(node => (
                  <option key={node} value={node}>
                    Net {node}
                  </option>
                ))}
              </select>
            </div>

            {/* Black (-) Probe */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-bold font-mono text-[11px]">COM (–)</span>
              </div>
              <select
                aria-label="Black Probe Connected Node"
                value={blackProbeNode || ''}
                onChange={e => onSelectBlackProbe(e.target.value || null)}
                className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs focus:ring-1 focus:ring-slate-400"
              >
                <option value="">Unclipped</option>
                {availableNodes.map(node => (
                  <option key={node} value={node}>
                    Net {node}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Probe Reset Button */}
          {(redProbeNode || blackProbeNode) && (
            <button
              type="button"
              onClick={() => {
                onSelectRedProbe(null);
                onSelectBlackProbe(null);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline text-center"
            >
              Reset probe clips
            </button>
          )}
        </div>
      )}
    </div>
  );
};
