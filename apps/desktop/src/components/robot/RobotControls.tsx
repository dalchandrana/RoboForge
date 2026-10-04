import React from 'react';

export type ControllerMode = 'manual' | 'line-follower' | 'obstacle-avoider';
export type ArenaPreset = 'oval' | 'figure-8' | 'obstacle-course';

interface RobotControlsProps {
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  controllerMode: ControllerMode;
  onChangeControllerMode: (mode: ControllerMode) => void;
  arenaPreset: ArenaPreset;
  onChangeArenaPreset: (preset: ArenaPreset) => void;
  onManualDrive: (forward: number, turn: number) => void;
}

export const RobotControls: React.FC<RobotControlsProps> = ({
  isRunning,
  onToggleRun,
  onReset,
  simSpeed,
  onChangeSimSpeed,
  controllerMode,
  onChangeControllerMode,
  arenaPreset,
  onChangeArenaPreset,
  onManualDrive,
}) => {
  return (
    <div className="bg-surface-subtle border border-border-subtle rounded-2xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Play / Pause / Reset / Speed */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleRun}
            id="btn-robot-run-pause"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <span>{isRunning ? '⏸️ Pause' : '▶️ Run Simulation'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            id="btn-robot-reset"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-text-main rounded-xl text-xs font-bold transition-all border border-border-subtle"
          >
            🔄 Reset
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-border-subtle rounded-xl p-1 text-xs">
            <span className="px-2 text-text-muted text-[10px] font-bold uppercase">Speed</span>
            {[0.5, 1.0, 2.0].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSimSpeed(s)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                  simSpeed === s
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Arena Preset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-border-subtle rounded-xl p-1 text-xs">
          <span className="px-2 text-text-muted text-[10px] font-bold uppercase">Arena:</span>
          {(
            [
              { id: 'oval', label: 'Oval Track' },
              { id: 'figure-8', label: 'Figure-8' },
              { id: 'obstacle-course', label: 'Obstacle Maze' },
            ] as const
          ).map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeArenaPreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                arenaPreset === preset.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Modes and D-Pad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border-subtle">
        {/* Mode Selector */}
        <div className="md:col-span-2 space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
            Navigation Controller Mode
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChangeControllerMode('manual')}
              className={`p-3 rounded-xl border text-left transition-all ${
                controllerMode === 'manual'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-300 shadow-sm'
                  : 'bg-surface border-border-subtle text-text-muted hover:border-slate-600'
              }`}
            >
              <div className="text-sm font-bold text-text-main flex items-center gap-1.5 mb-1">
                <span>🎮 Manual Drive</span>
              </div>
              <div className="text-xs text-text-muted leading-tight">
                WASD / Arrow keys or on-screen D-pad teleoperation
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeControllerMode('line-follower')}
              className={`p-3 rounded-xl border text-left transition-all ${
                controllerMode === 'line-follower'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-surface border-border-subtle text-text-muted hover:border-slate-600'
              }`}
            >
              <div className="text-sm font-bold text-text-main flex items-center gap-1.5 mb-1">
                <span>〰️ Line Follower</span>
              </div>
              <div className="text-xs text-text-muted leading-tight">
                Autonomous 2-sensor optical IR line tracking (P3)
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeControllerMode('obstacle-avoider')}
              className={`p-3 rounded-xl border text-left transition-all ${
                controllerMode === 'obstacle-avoider'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-sm'
                  : 'bg-surface border-border-subtle text-text-muted hover:border-slate-600'
              }`}
            >
              <div className="text-sm font-bold text-text-main flex items-center gap-1.5 mb-1">
                <span>🦇 Obstacle Avoider</span>
              </div>
              <div className="text-xs text-text-muted leading-tight">
                Autonomous ultrasonic sonar obstacle evasion (P4)
              </div>
            </button>
          </div>
        </div>

        {/* On-screen D-Pad for manual drive */}
        <div className="flex flex-col items-center justify-center p-2 bg-surface rounded-xl border border-border-subtle">
          <span className="text-[10px] font-bold text-text-muted uppercase mb-2">
            Manual D-Pad (or WASD keys)
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-32">
            <div />
            <button
              type="button"
              disabled={controllerMode !== 'manual'}
              onMouseDown={() => onManualDrive(1, 0)}
              onMouseUp={() => onManualDrive(0, 0)}
              className="p-2.5 bg-slate-800 active:bg-sky-500 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-sm font-bold text-text-main transition-colors text-center"
              aria-label="Drive Forward"
            >
              ▲
            </button>
            <div />

            <button
              type="button"
              disabled={controllerMode !== 'manual'}
              onMouseDown={() => onManualDrive(0, -1)}
              onMouseUp={() => onManualDrive(0, 0)}
              className="p-2.5 bg-slate-800 active:bg-sky-500 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-sm font-bold text-text-main transition-colors text-center"
              aria-label="Turn Left"
            >
              ◀
            </button>
            <button
              type="button"
              disabled={controllerMode !== 'manual'}
              onClick={() => onManualDrive(0, 0)}
              className="p-2.5 bg-slate-900 active:bg-sky-500 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-xs font-bold text-text-muted transition-colors text-center"
              aria-label="Stop"
            >
              ⏹️
            </button>
            <button
              type="button"
              disabled={controllerMode !== 'manual'}
              onMouseDown={() => onManualDrive(0, 1)}
              onMouseUp={() => onManualDrive(0, 0)}
              className="p-2.5 bg-slate-800 active:bg-sky-500 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-sm font-bold text-text-main transition-colors text-center"
              aria-label="Turn Right"
            >
              ▶
            </button>

            <div />
            <button
              type="button"
              disabled={controllerMode !== 'manual'}
              onMouseDown={() => onManualDrive(-1, 0)}
              onMouseUp={() => onManualDrive(0, 0)}
              className="p-2.5 bg-slate-800 active:bg-sky-500 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-sm font-bold text-text-main transition-colors text-center"
              aria-label="Drive Reverse"
            >
              ▼
            </button>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};
