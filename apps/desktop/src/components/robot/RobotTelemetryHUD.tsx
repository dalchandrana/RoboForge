import React from 'react';
import { RobotState, SonarReading, LineSensorReading } from '@roboforge/sim-robot';

interface RobotTelemetryHUDProps {
  robotState: RobotState;
  sonarReading: SonarReading;
  lineReading: LineSensorReading;
  isCollision: boolean;
  controllerMode: 'manual' | 'line-follower' | 'obstacle-avoider';
}

export const RobotTelemetryHUD: React.FC<RobotTelemetryHUDProps> = ({
  robotState,
  sonarReading,
  lineReading,
  isCollision,
  controllerMode,
}) => {
  const headingDeg = Math.round(((robotState.theta * 180) / Math.PI + 360) % 360);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Linear & Angular Speed */}
      <div className="bg-surface-subtle border border-border-subtle p-3 rounded-xl flex flex-col justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Velocity
        </span>
        <div className="my-1">
          <div className="text-lg font-bold text-text-main">
            {robotState.linearVelocity.toFixed(1)}{' '}
            <span className="text-xs font-normal text-text-muted">cm/s</span>
          </div>
          <div className="text-xs text-text-muted">
            Turn: {robotState.angularVelocity.toFixed(2)} rad/s
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-75"
            style={{ width: `${Math.min(100, (Math.abs(robotState.linearVelocity) / 35) * 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Heading Angle */}
      <div className="bg-surface-subtle border border-border-subtle p-3 rounded-xl flex flex-col justify-between">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Heading
        </span>
        <div className="my-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-text-main">{headingDeg}°</span>
          <span className="text-xs text-text-muted">
            {headingDeg >= 315 || headingDeg < 45
              ? 'East'
              : headingDeg >= 45 && headingDeg < 135
                ? 'North'
                : headingDeg >= 135 && headingDeg < 225
                  ? 'West'
                  : 'South'}
          </span>
        </div>
        <div className="text-xs text-text-muted font-mono truncate">
          X: {Math.round(robotState.x)} Y: {Math.round(robotState.y)} cm
        </div>
      </div>

      {/* 3. Ultrasonic Sonar */}
      <div className="bg-surface-subtle border border-border-subtle p-3 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Sonar Range
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              sonarReading.distance <= 20
                ? 'bg-rose-500 animate-ping'
                : sonarReading.distance <= 40
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
            }`}
          />
        </div>
        <div className="my-1">
          <div className="text-lg font-bold text-text-main">
            {sonarReading.distance} <span className="text-xs font-normal text-text-muted">cm</span>
          </div>
          <div className="text-xs text-text-muted">
            {sonarReading.distance <= 20
              ? '⚠️ Close Obstacle'
              : sonarReading.distance <= 40
                ? 'Approaching'
                : 'Clear Forward'}
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              sonarReading.distance <= 20
                ? 'bg-rose-500'
                : sonarReading.distance <= 40
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
            }`}
            style={{ width: `${Math.min(100, (sonarReading.distance / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Left IR Line Sensor */}
      <div className="bg-surface-subtle border border-border-subtle p-3 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            IR Left (D2)
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              lineReading.leftOnLine
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lineReading.leftOnLine ? 'LINE' : 'FLOOR'}
          </span>
        </div>
        <div className="my-1">
          <div className="text-lg font-bold text-text-main">
            {Math.round(lineReading.leftReflectance * 100)}%
          </div>
          <div className="text-xs text-text-muted">Reflectance</div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-75"
            style={{ width: `${Math.round(lineReading.leftReflectance * 100)}%` }}
          />
        </div>
      </div>

      {/* 5. Right IR Line Sensor */}
      <div className="bg-surface-subtle border border-border-subtle p-3 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            IR Right (D3)
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              lineReading.rightOnLine
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {lineReading.rightOnLine ? 'LINE' : 'FLOOR'}
          </span>
        </div>
        <div className="my-1">
          <div className="text-lg font-bold text-text-main">
            {Math.round(lineReading.rightReflectance * 100)}%
          </div>
          <div className="text-xs text-text-muted">Reflectance</div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-75"
            style={{ width: `${Math.round(lineReading.rightReflectance * 100)}%` }}
          />
        </div>
      </div>

      {/* 6. Encoders & Chassis Status */}
      <div
        className={`border p-3 rounded-xl flex flex-col justify-between transition-colors ${
          isCollision
            ? 'bg-rose-950/40 border-rose-500 text-rose-200'
            : 'bg-surface-subtle border-border-subtle'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Odometry
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              isCollision ? 'bg-rose-500 text-white' : 'bg-sky-500/20 text-sky-400'
            }`}
          >
            {isCollision ? 'COLLISION' : 'RUNNING'}
          </span>
        </div>
        <div className="my-1">
          <div className="text-lg font-bold text-text-main">
            {Math.round(robotState.totalDistanceTraveled)}{' '}
            <span className="text-xs font-normal text-text-muted">cm</span>
          </div>
          <div className="text-xs text-text-muted">
            Ticks: L{robotState.leftEncoderTicks} R{robotState.rightEncoderTicks}
          </div>
        </div>
        <div className="text-[10px] text-text-muted capitalize">Mode: {controllerMode}</div>
      </div>
    </div>
  );
};
