import React, { useRef, useEffect, useCallback } from 'react';
import {
  RobotState,
  DEFAULT_ROBOT_CONFIG,
  ArenaEnvironment,
  SonarReading,
  LineSensorReading,
  getRobotBoundingBox,
} from '@roboforge/sim-robot';

interface RobotArenaCanvasProps {
  robotState: RobotState;
  arena: ArenaEnvironment;
  sonarReading: SonarReading;
  lineReading: LineSensorReading;
  isCollision: boolean;
  onMoveObstacle?: (id: string, x: number, y: number) => void;
  onAddObstacle?: (x: number, y: number) => void;
}

export const RobotArenaCanvas: React.FC<RobotArenaCanvasProps> = ({
  robotState,
  arena,
  sonarReading,
  lineReading,
  isCollision,
  onMoveObstacle,
  onAddObstacle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingObstacleRef = useRef<string | null>(null);

  // Arena coordinate scaling
  // We map arena dimensions (e.g. 300cm x 200cm) to canvas pixels
  const getScale = useCallback(
    (canvas: HTMLCanvasElement) => {
      const scaleX = canvas.width / arena.width;
      const scaleY = canvas.height / arena.height;
      return Math.min(scaleX, scaleY);
    },
    [arena.width, arena.height],
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = getScale(canvas);
    const offsetX = (canvas.width - arena.width * scale) / 2;
    const offsetY = (canvas.height - arena.height * scale) / 2;

    // Helper: convert arena (cm) to canvas (px)
    const toCanvasX = (cmX: number) => offsetX + cmX * scale;
    // Invert Y so North is up
    const toCanvasY = (cmY: number) => offsetY + (arena.height - cmY) * scale;
    const toCanvasDist = (distCm: number) => distCm * scale;

    // Clear background
    ctx.fillStyle = '#0f172a'; // Deep slate dark arena
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw arena floor grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSizeCm = 20; // 20cm grid squares
    for (let x = 0; x <= arena.width; x += gridSizeCm) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), toCanvasY(0));
      ctx.lineTo(toCanvasX(x), toCanvasY(arena.height));
      ctx.stroke();
    }
    for (let y = 0; y <= arena.height; y += gridSizeCm) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), toCanvasY(y));
      ctx.lineTo(toCanvasX(arena.width), toCanvasY(y));
      ctx.stroke();
    }

    // 2. Draw arena boundary walls
    ctx.strokeStyle = isCollision ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      toCanvasX(0),
      toCanvasY(arena.height),
      toCanvasDist(arena.width),
      toCanvasDist(arena.height),
    );

    // 3. Draw Track Lines (e.g. black line with subtle white borders)
    for (const track of arena.tracks) {
      if (track.points.length < 2) continue;
      const pts = track.points;
      const lineWidthPx = toCanvasDist(track.width);

      // Outer glow / edge border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = lineWidthPx + 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const firstPt = pts[0]!;
      ctx.moveTo(toCanvasX(firstPt.x), toCanvasY(firstPt.y));
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i]!;
        ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
      }
      if (track.closed) ctx.closePath();
      ctx.stroke();

      // Main dark electrical tape line
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = lineWidthPx;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(firstPt.x), toCanvasY(firstPt.y));
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i]!;
        ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
      }
      if (track.closed) ctx.closePath();
      ctx.stroke();
    }

    // 4. Draw Obstacle Boxes
    for (const obs of arena.obstacles) {
      const cx = toCanvasX(obs.x);
      const cy = toCanvasY(obs.y);
      const w = toCanvasDist(obs.width);
      const h = toCanvasDist(obs.height);
      const rot = obs.rotation || 0;

      ctx.save();
      ctx.translate(cx, cy);
      // Canvas Y is inverted
      ctx.rotate(-rot);

      // Obstacle block fill
      ctx.fillStyle = '#dc2626'; // Bright safety red
      ctx.fillRect(-w / 2, -h / 2, w, h);

      // Border and shadow
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Diagonal hazard stripes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.stroke();

      ctx.restore();
    }

    // 5. Draw Sonar Raycast Cone & Distance Tag
    if (sonarReading.detected && sonarReading.hitPoint) {
      const origX = toCanvasX(sonarReading.sensorOrigin.x);
      const origY = toCanvasY(sonarReading.sensorOrigin.y);
      const hitX = toCanvasX(sonarReading.hitPoint.x);
      const hitY = toCanvasY(sonarReading.hitPoint.y);

      // Sonar cone beam
      const beamGrad = ctx.createRadialGradient(
        origX,
        origY,
        2,
        origX,
        origY,
        toCanvasDist(sonarReading.distance),
      );
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(origX, origY);
      // 15 deg aperture
      const halfAperture = ((15 / 2) * Math.PI) / 180;
      const angle = -sonarReading.beamAngle; // invert for canvas
      const distPx = toCanvasDist(sonarReading.distance);
      ctx.arc(origX, origY, distPx, angle - halfAperture, angle + halfAperture);
      ctx.closePath();
      ctx.fill();

      // Main line of sight
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(origX, origY);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Contact hit dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(hitX, hitY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Distance tag
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${sonarReading.distance}cm`, hitX + 6, hitY - 4);
    }

    // 6. Draw Robot Chassis & Peripherals
    const corners = getRobotBoundingBox(robotState, DEFAULT_ROBOT_CONFIG);
    if (corners.length === 4) {
      const c0 = corners[0]!;
      const c1 = corners[1]!;
      const c2 = corners[2]!;
      const c3 = corners[3]!;

      // Chassis Body
      ctx.fillStyle = isCollision ? 'rgba(239, 68, 68, 0.85)' : 'rgba(14, 165, 233, 0.85)';
      ctx.strokeStyle = isCollision ? '#fca5a5' : '#7dd3fc';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(toCanvasX(c0.x), toCanvasY(c0.y));
      ctx.lineTo(toCanvasX(c1.x), toCanvasY(c1.y));
      ctx.lineTo(toCanvasX(c2.x), toCanvasY(c2.y));
      ctx.lineTo(toCanvasX(c3.x), toCanvasY(c3.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Heading orientation arrow from robot center
      const robX = toCanvasX(robotState.x);
      const robY = toCanvasY(robotState.y);
      const arrowLength = toCanvasDist(14);
      const headX = robX + arrowLength * Math.cos(-robotState.theta);
      const headY = robY + arrowLength * Math.sin(-robotState.theta);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(robX, robY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      // Wheels (Left and Right)
      ctx.save();
      ctx.translate(robX, robY);
      ctx.rotate(-robotState.theta);

      const wheelLengthPx = toCanvasDist(DEFAULT_ROBOT_CONFIG.wheelRadius * 2);
      const wheelWidthPx = toCanvasDist(2.5); // 2.5cm wheel thickness
      const halfWheelBase = toCanvasDist(DEFAULT_ROBOT_CONFIG.wheelBase / 2);

      ctx.fillStyle = '#020617'; // Rubber black
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;

      // Left wheel (lateral positive Y in local coordinates)
      ctx.fillRect(-wheelLengthPx / 2, -halfWheelBase - wheelWidthPx, wheelLengthPx, wheelWidthPx);
      ctx.strokeRect(
        -wheelLengthPx / 2,
        -halfWheelBase - wheelWidthPx,
        wheelLengthPx,
        wheelWidthPx,
      );

      // Right wheel (lateral negative Y in local coordinates)
      ctx.fillRect(-wheelLengthPx / 2, halfWheelBase, wheelLengthPx, wheelWidthPx);
      ctx.strokeRect(-wheelLengthPx / 2, halfWheelBase, wheelLengthPx, wheelWidthPx);

      // Front Caster Wheel
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(toCanvasDist(7.5), 0, toCanvasDist(1.5), 0, 2 * Math.PI);
      ctx.fill();

      // HC-SR04 Sonar sensor cylinder eyes at front
      ctx.fillStyle = '#e2e8f0'; // Silver aluminum
      ctx.fillRect(toCanvasDist(9.0), -toCanvasDist(3.0), toCanvasDist(1.5), toCanvasDist(2.2));
      ctx.fillRect(toCanvasDist(9.0), toCanvasDist(0.8), toCanvasDist(1.5), toCanvasDist(2.2));

      ctx.restore();
    }

    // 7. Draw IR Sensor Probes (Left & Right)
    const drawIrProbe = (pos: { x: number; y: number }, onLine: boolean, label: string) => {
      const px = toCanvasX(pos.x);
      const py = toCanvasY(pos.y);

      ctx.fillStyle = onLine ? '#22c55e' : '#f59e0b'; // Green on line, Amber on floor
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(label, px - 3, py - 6);
    };

    drawIrProbe(lineReading.leftPos, lineReading.leftOnLine, 'L');
    drawIrProbe(lineReading.rightPos, lineReading.rightOnLine, 'R');
  }, [robotState, arena, sonarReading, lineReading, isCollision, getScale]);

  // Handle canvas mouse interaction (click-to-add obstacle, drag obstacle)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickPxX = e.clientX - rect.left;
    const clickPxY = e.clientY - rect.top;

    const scale = getScale(canvas);
    const offsetX = (canvas.width - arena.width * scale) / 2;
    const offsetY = (canvas.height - arena.height * scale) / 2;

    const cmX = (clickPxX - offsetX) / scale;
    const cmY = arena.height - (clickPxY - offsetY) / scale;

    // Check if clicked inside an obstacle
    for (const obs of arena.obstacles) {
      if (Math.abs(cmX - obs.x) <= obs.width / 2 && Math.abs(cmY - obs.y) <= obs.height / 2) {
        draggingObstacleRef.current = obs.id;
        return;
      }
    }

    // Clicked empty arena space -> add new obstacle if callback provided
    if (
      onAddObstacle &&
      cmX > 10 &&
      cmX < arena.width - 10 &&
      cmY > 10 &&
      cmY < arena.height - 10
    ) {
      onAddObstacle(Math.round(cmX), Math.round(cmY));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingObstacleRef.current || !onMoveObstacle) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickPxX = e.clientX - rect.left;
    const clickPxY = e.clientY - rect.top;

    const scale = getScale(canvas);
    const offsetX = (canvas.width - arena.width * scale) / 2;
    const offsetY = (canvas.height - arena.height * scale) / 2;

    const cmX = (clickPxX - offsetX) / scale;
    const cmY = arena.height - (clickPxY - offsetY) / scale;

    onMoveObstacle(
      draggingObstacleRef.current,
      Math.max(15, Math.min(arena.width - 15, Math.round(cmX))),
      Math.max(15, Math.min(arena.height - 15, Math.round(cmY))),
    );
  };

  const handleMouseUp = () => {
    draggingObstacleRef.current = null;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border-subtle bg-slate-950 shadow-xl flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        width={760}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full max-w-full h-auto cursor-crosshair rounded-xl"
        aria-label="2D Robot Simulation Arena Canvas"
      />
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        Click canvas to drop obstacle · Drag to reposition
      </div>
    </div>
  );
};
