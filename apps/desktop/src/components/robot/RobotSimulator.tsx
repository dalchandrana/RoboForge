import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RobotState,
  createInitialRobotState,
  stepRobotKinematics,
  readUltrasonicSonar,
  readLineSensors,
  checkRobotCollision,
  LineFollowerController,
  ObstacleAvoidanceController,
  calculateManualSpeeds,
  createOvalTrackArena,
  createFigureEightArena,
  createObstacleCourseArena,
  ArenaEnvironment,
} from '@roboforge/sim-robot';
import { RobotArenaCanvas } from './RobotArenaCanvas';
import { RobotTelemetryHUD } from './RobotTelemetryHUD';
import { RobotControls, ControllerMode, ArenaPreset } from './RobotControls';

interface RobotSimulatorProps {
  onRobotRan?: () => void;
  lowSpecMode?: boolean;
}

export const RobotSimulator: React.FC<RobotSimulatorProps> = ({
  onRobotRan,
  lowSpecMode = false,
}) => {
  // Preset arena configurations
  const [arenaPreset, setArenaPreset] = useState<ArenaPreset>('oval');
  const [arena, setArena] = useState<ArenaEnvironment>(() => createOvalTrackArena());

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [controllerMode, setControllerMode] = useState<ControllerMode>('line-follower');

  // Robot dynamic state
  // On oval track, position robot on the track line (e.g. x: 50, y: 100, facing North)
  const [robotState, setRobotState] = useState<RobotState>(() =>
    createInitialRobotState(50, 100, Math.PI / 2),
  );

  // Manual drive inputs (-1 to 1)
  const manualInputsRef = useRef<{ forward: number; turn: number }>({ forward: 0, turn: 0 });

  // Autonomous controller instances
  const lineFollowerRef = useRef<LineFollowerController>(new LineFollowerController(12.0, 4.5));
  const obstacleAvoiderRef = useRef<ObstacleAvoidanceController>(
    new ObstacleAvoidanceController(10.0, 24.0),
  );

  // Milestone tracking flag
  const hasTriggeredRanRef = useRef<boolean>(false);
  const runDurationRef = useRef<number>(0);

  // Switch Arena Preset
  const handleArenaPresetChange = useCallback((preset: ArenaPreset) => {
    setArenaPreset(preset);
    if (preset === 'oval') {
      setArena(createOvalTrackArena());
      setRobotState(createInitialRobotState(50, 100, Math.PI / 2));
      setControllerMode('line-follower');
    } else if (preset === 'figure-8') {
      setArena(createFigureEightArena());
      setRobotState(createInitialRobotState(160, 120, 0));
      setControllerMode('line-follower');
    } else {
      setArena(createObstacleCourseArena());
      setRobotState(createInitialRobotState(40, 40, Math.PI / 4));
      setControllerMode('obstacle-avoider');
    }
  }, []);

  // Reset Robot Pose
  const handleReset = useCallback(() => {
    if (arenaPreset === 'oval') {
      setRobotState(createInitialRobotState(50, 100, Math.PI / 2));
    } else if (presetMatchesFig8(arenaPreset)) {
      setRobotState(createInitialRobotState(160, 120, 0));
    } else {
      setRobotState(createInitialRobotState(40, 40, Math.PI / 4));
    }
    manualInputsRef.current = { forward: 0, turn: 0 };
    obstacleAvoiderRef.current.reset();
  }, [arenaPreset]);

  function presetMatchesFig8(p: ArenaPreset): boolean {
    return p === 'figure-8';
  }

  // Handle Manual D-Pad Drive
  const handleManualDrive = useCallback((forward: number, turn: number) => {
    manualInputsRef.current = { forward, turn };
  }, []);

  // Keyboard navigation listener (WASD + Arrows + Space + R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(prev => !prev);
        return;
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
        return;
      }

      if (controllerMode !== 'manual') return;

      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        manualInputsRef.current.forward = 1;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        manualInputsRef.current.forward = -1;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        manualInputsRef.current.turn = -1;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        manualInputsRef.current.turn = 1;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (controllerMode !== 'manual') return;

      if (
        e.code === 'ArrowUp' ||
        e.code === 'KeyW' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyS'
      ) {
        manualInputsRef.current.forward = 0;
      }
      if (
        e.code === 'ArrowLeft' ||
        e.code === 'KeyA' ||
        e.code === 'ArrowRight' ||
        e.code === 'KeyD'
      ) {
        manualInputsRef.current.turn = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controllerMode, handleReset]);

  // Main Simulation Animation Loop
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const simLoop = (now: number) => {
      // In low-spec mode, throttle execution to ~30 FPS (>= 33ms between frames)
      if (lowSpecMode && now - lastTimeRef.current < 33) {
        animFrameIdRef.current = requestAnimationFrame(simLoop);
        return;
      }

      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Cap delta time to prevent tunneling during tab switch
      const dt = Math.min(rawDt, 0.05) * simSpeed;

      if (isRunning && dt > 0) {
        setRobotState(prevState => {
          // Read virtual sensors
          const sonar = readUltrasonicSonar(prevState, arena);
          const line = readLineSensors(prevState, arena);

          // Calculate target motor speeds from active controller
          let targetOmegaL = 0;
          let targetOmegaR = 0;

          if (controllerMode === 'manual') {
            const { omegaL, omegaR } = calculateManualSpeeds(
              manualInputsRef.current.forward,
              manualInputsRef.current.turn,
            );
            targetOmegaL = omegaL;
            targetOmegaR = omegaR;
          } else if (controllerMode === 'line-follower') {
            const { omegaL, omegaR } = lineFollowerRef.current.updateBangBang(line);
            targetOmegaL = omegaL;
            targetOmegaR = omegaR;
          } else if (controllerMode === 'obstacle-avoider') {
            const { omegaL, omegaR } = obstacleAvoiderRef.current.update(sonar, dt);
            targetOmegaL = omegaL;
            targetOmegaR = omegaR;
          }

          // Step physics kinematics
          const nextState = stepRobotKinematics(prevState, targetOmegaL, targetOmegaR, dt);

          // If collision with wall/obstacle, halt forward velocity
          const coll = checkRobotCollision(nextState, arena);
          if (coll) {
            return {
              ...prevState,
              linearVelocity: 0,
              angularVelocity: 0,
            };
          }

          // Track run duration and fire milestone after 2 seconds of running
          runDurationRef.current += dt;
          if (runDurationRef.current > 2.0 && !hasTriggeredRanRef.current) {
            hasTriggeredRanRef.current = true;
            if (onRobotRan) onRobotRan();
          }

          return nextState;
        });
      }

      animFrameIdRef.current = requestAnimationFrame(simLoop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(simLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isRunning, simSpeed, controllerMode, arena, onRobotRan, lowSpecMode]);

  // Read current sensors for rendering HUD and Canvas
  const sonarReading = readUltrasonicSonar(robotState, arena);
  const lineReading = readLineSensors(robotState, arena);
  const isCollision = checkRobotCollision(robotState, arena);

  // Obstacle interaction callbacks
  const handleMoveObstacle = (id: string, x: number, y: number) => {
    setArena(prev => ({
      ...prev,
      obstacles: prev.obstacles.map(obs => (obs.id === id ? { ...obs, x, y } : obs)),
    }));
  };

  const handleAddObstacle = (x: number, y: number) => {
    setArena(prev => ({
      ...prev,
      obstacles: [
        ...prev.obstacles,
        {
          id: `obs-${Date.now()}`,
          x,
          y,
          width: 25,
          height: 25,
        },
      ],
    }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Live Telemetry HUD */}
      <RobotTelemetryHUD
        robotState={robotState}
        sonarReading={sonarReading}
        lineReading={lineReading}
        isCollision={isCollision}
        controllerMode={controllerMode}
      />

      {/* 2. Interactive 2D Canvas */}
      <RobotArenaCanvas
        robotState={robotState}
        arena={arena}
        sonarReading={sonarReading}
        lineReading={lineReading}
        isCollision={isCollision}
        onMoveObstacle={handleMoveObstacle}
        onAddObstacle={handleAddObstacle}
        lowSpecMode={lowSpecMode}
      />

      {/* 3. Controls & Navigation Bar */}
      <RobotControls
        isRunning={isRunning}
        onToggleRun={() => setIsRunning(prev => !prev)}
        onReset={handleReset}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        controllerMode={controllerMode}
        onChangeControllerMode={setControllerMode}
        arenaPreset={arenaPreset}
        onChangeArenaPreset={handleArenaPresetChange}
        onManualDrive={handleManualDrive}
      />
    </div>
  );
};
