import React from 'react';
import { Button, Badge } from '@roboforge/ui';
import { SAMPLE_SKETCHES, type SketchPreset, type AvrCpuState } from '@roboforge/sim-avr';

interface ArduinoCodeEditorProps {
  currentSketch: SketchPreset;
  onSelectSketch: (sketch: SketchPreset) => void;
  cpuState: AvrCpuState;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const ArduinoCodeEditor: React.FC<ArduinoCodeEditorProps> = ({
  currentSketch,
  onSelectSketch,
  cpuState,
  isRunning,
  onToggleRun,
  onReset,
  speed,
  onSpeedChange,
}) => {
  const lines = currentSketch.code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSketch.code);
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-subtle border-b border-border-subtle">
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sketch-select" className="text-xs font-bold text-text-muted">
            Sketch:
          </label>
          <select
            id="sketch-select"
            value={currentSketch.id}
            onChange={e => {
              const selected = SAMPLE_SKETCHES.find(s => s.id === e.target.value);
              if (selected) onSelectSketch(selected);
            }}
            className="bg-slate-900 border border-border-strong rounded-xl px-2.5 py-1 text-xs text-text-main font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {SAMPLE_SKETCHES.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Execution & Speed Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isRunning ? 'secondary' : 'primary'}
            onClick={onToggleRun}
            id="run-arduino-btn"
          >
            {isRunning ? '⏸ Pause' : '▶ Run'}
          </Button>

          <Button size="sm" variant="outline" onClick={onReset} id="reset-arduino-btn">
            ⟳ Reset
          </Button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-border-subtle rounded-xl px-2 py-1 text-xs">
            <span className="text-[10px] text-text-muted">Speed:</span>
            {[0.25, 0.5, 1, 2].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  speed === s ? 'bg-sky-500 text-white' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <Button size="sm" variant="ghost" onClick={handleCopy} className="text-xs">
            📋 Copy
          </Button>
        </div>
      </div>

      {/* Sketch Description Banner */}
      <div className="px-4 py-2 bg-sky-950/30 border-b border-sky-500/20 flex items-center justify-between text-xs">
        <span className="text-sky-200">{currentSketch.description}</span>
        <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
          <span>Cycles: {cpuState.cycles.toLocaleString()}</span>
          <span>Time: {(cpuState.cycles / 16000).toFixed(0)} ms</span>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[380px] bg-slate-950 text-slate-200 select-text leading-relaxed">
        {lines.map((line, i) => {
          const isComment = line.trim().startsWith('//');
          const isKeyword =
            /\b(void|int|const|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|Serial|if|else)\b/.test(
              line,
            );

          return (
            <div key={i} className="flex gap-3">
              <span className="w-6 text-right text-slate-600 select-none text-[11px]">{i + 1}</span>
              <span
                className={
                  isComment
                    ? 'text-slate-500 italic'
                    : isKeyword
                      ? 'text-sky-300'
                      : 'text-slate-200'
                }
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-surface-subtle border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isRunning ? 'RUNNING (16 MHz Target)' : 'PAUSED'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>PC: 0x{cpuState.pc.toString(16).padStart(4, '0').toUpperCase()}</span>
          <span>SP: 0x{cpuState.sp.toString(16).toUpperCase()}</span>
          <Badge variant="secondary">ATmega328P</Badge>
        </div>
      </div>
    </div>
  );
};
