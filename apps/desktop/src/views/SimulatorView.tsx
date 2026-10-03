import React from 'react';
import { CircuitSimulator } from '../components/circuit/CircuitSimulator';

export const SimulatorView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" role="img" aria-label="Circuit lightning">
              ⚡
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Circuit Simulator & Workbench
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            Interactive solderless breadboard & schematic twin powered by pure on-device MNA solver
            and SPICE verification.
          </p>
        </div>
      </div>

      {/* Simulator Component */}
      <CircuitSimulator />
    </div>
  );
};
