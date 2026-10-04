import React, { useState } from 'react';
import { CircuitSimulator } from '../components/circuit/CircuitSimulator';
import { ArduinoSimulator } from '../components/arduino/ArduinoSimulator';
import { RobotSimulator } from '../components/robot/RobotSimulator';

interface SimulatorViewProps {
  onArduinoRan?: () => void;
  onRobotRan?: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ onArduinoRan, onRobotRan }) => {
  const [activeSim, setActiveSim] = useState<'circuit' | 'arduino' | 'robot'>('circuit');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Simulator Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" role="img" aria-label="Workbench">
              ⚡
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Robotics Simulation Workbench
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            100% offline interactive simulation: analog/digital circuits with SPICE bridge, Arduino
            Uno AVR, and 2D mobile robot physics.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSim('circuit')}
            id="tab-circuit-sim"
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSim === 'circuit'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            ⚡ Circuit Simulator
          </button>

          <button
            type="button"
            onClick={() => setActiveSim('arduino')}
            id="tab-arduino-sim"
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSim === 'arduino'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            🤖 Arduino Simulator
          </button>

          <button
            type="button"
            onClick={() => setActiveSim('robot')}
            id="tab-robot-sim"
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSim === 'robot'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            🏎️ 2D Robot Simulator
          </button>
        </div>
      </div>

      {/* Simulator Content */}
      {activeSim === 'circuit' ? (
        <CircuitSimulator />
      ) : activeSim === 'arduino' ? (
        <ArduinoSimulator onSimulationRan={onArduinoRan} />
      ) : (
        <RobotSimulator onRobotRan={onRobotRan} />
      )}
    </div>
  );
};
