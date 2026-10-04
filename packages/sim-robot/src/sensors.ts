/**
 * 2D Robot Sensor Models: Ultrasonic Sonar (HC-SR04) & Infrared Line Sensors (TCRT5000)
 */

import {
  RobotConfig,
  RobotState,
  DEFAULT_ROBOT_CONFIG,
  localToGlobal,
  getRobotBoundingBox,
} from './kinematics';

export interface Point2D {
  x: number;
  y: number;
}

export interface LineSegment2D {
  p1: Point2D;
  p2: Point2D;
}

export interface ObstacleBox {
  id: string;
  x: number; // center x in cm
  y: number; // center y in cm
  width: number; // width along x in cm
  height: number; // height along y in cm
  rotation?: number; // rotation in radians (default: 0)
}

export interface TrackLine {
  id: string;
  points: Point2D[];
  closed: boolean;
  width: number; // track line thickness in cm (e.g. 2.0 cm for standard electrical tape)
}

export interface SonarReading {
  /** Distance to nearest obstacle in cm (clamped to [minRange, maxRange]) */
  distance: number;
  /** Whether an obstacle was detected within max range */
  detected: boolean;
  /** Global coordinate of the contact hit point, if detected */
  hitPoint?: Point2D;
  /** Global coordinates of the sensor emitter head */
  sensorOrigin: Point2D;
  /** Angle of the sonar beam in global space (radians) */
  beamAngle: number;
}

export interface LineSensorReading {
  /** Left sensor analog reflectance (0.0 = white/floor, 1.0 = black/line) */
  leftReflectance: number;
  /** Right sensor analog reflectance (0.0 = white/floor, 1.0 = black/line) */
  rightReflectance: number;
  /** Whether left sensor sees line (reflectance > threshold) */
  leftOnLine: boolean;
  /** Whether right sensor sees line (reflectance > threshold) */
  rightOnLine: boolean;
  /** Global position of left sensor probe */
  leftPos: Point2D;
  /** Global position of right sensor probe */
  rightPos: Point2D;
}

export interface ArenaEnvironment {
  width: number; // Arena width in cm
  height: number; // Arena height in cm
  obstacles: ObstacleBox[];
  tracks: TrackLine[];
}

/**
 * Calculates intersection between a ray (origin + t * dir, t >= 0) and a line segment (p1 to p2).
 * Returns the intersection distance t, or null if no intersection.
 */
export function raySegmentIntersection(
  origin: Point2D,
  dir: Point2D,
  segment: LineSegment2D,
): { distance: number; hitPoint: Point2D } | null {
  const dx = segment.p2.x - segment.p1.x;
  const dy = segment.p2.y - segment.p1.y;

  const cross = dir.x * dy - dir.y * dx;
  if (Math.abs(cross) < 1e-9) return null; // Parallel or collinear

  const px = segment.p1.x - origin.x;
  const py = segment.p1.y - origin.y;

  const t = (px * dy - py * dx) / cross;
  const u = (px * dir.y - py * dir.x) / cross;

  if (t >= 0 && u >= 0 && u <= 1) {
    return {
      distance: t,
      hitPoint: {
        x: origin.x + t * dir.x,
        y: origin.y + t * dir.y,
      },
    };
  }

  return null;
}

/**
 * Extracts line segments of an obstacle box
 */
export function getObstacleSegments(box: ObstacleBox): LineSegment2D[] {
  const hw = box.width / 2;
  const hh = box.height / 2;
  const rot = box.rotation || 0;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const corners: Point2D[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ].map(c => ({
    x: box.x + c.x * cos - c.y * sin,
    y: box.y + c.x * sin + c.y * cos,
  }));

  const c0 = corners[0]!;
  const c1 = corners[1]!;
  const c2 = corners[2]!;
  const c3 = corners[3]!;
  return [
    { p1: c0, p2: c1 },
    { p1: c1, p2: c2 },
    { p1: c2, p2: c3 },
    { p1: c3, p2: c0 },
  ];
}

/**
 * Extracts boundary walls of an arena
 */
export function getArenaBoundarySegments(width: number, height: number): LineSegment2D[] {
  return [
    { p1: { x: 0, y: 0 }, p2: { x: width, y: 0 } },
    { p1: { x: width, y: 0 }, p2: { x: width, y: height } },
    { p1: { x: width, y: height }, p2: { x: 0, y: height } },
    { p1: { x: 0, y: height }, p2: { x: 0, y: 0 } },
  ];
}

/**
 * Simulates HC-SR04 ultrasonic distance sensor with multi-ray cone aperture.
 */
export function readUltrasonicSonar(
  robot: RobotState,
  arena: ArenaEnvironment,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
  minRange = 2.0, // 2 cm minimum range
  maxRange = 400.0, // 400 cm maximum range
  beamSpreadDeg = 15.0, // 15 degree conical beam
): SonarReading {
  const sensorOrigin = localToGlobal(robot, config.sonarOffset);
  const baseAngle = robot.theta + robot.sonarServoAngle;

  // Cast 5 rays across beam spread cone [-7.5 deg, +7.5 deg]
  const numRays = 5;
  const halfSpreadRad = ((beamSpreadDeg / 2) * Math.PI) / 180;
  const stepRad = beamSpreadDeg > 0 ? (halfSpreadRad * 2) / (numRays - 1) : 0;

  // Gather all segments to test: boundary walls + all obstacle boxes
  const allSegments: LineSegment2D[] = [
    ...getArenaBoundarySegments(arena.width, arena.height),
    ...arena.obstacles.flatMap(getObstacleSegments),
  ];

  let minDistance = maxRange;
  let nearestHit: Point2D | undefined;
  let hitAngle = baseAngle;

  for (let i = 0; i < numRays; i++) {
    const rayAngle = baseAngle - halfSpreadRad + i * stepRad;
    const dir: Point2D = { x: Math.cos(rayAngle), y: Math.sin(rayAngle) };

    for (const seg of allSegments) {
      const hit = raySegmentIntersection(sensorOrigin, dir, seg);
      if (hit && hit.distance < minDistance) {
        minDistance = hit.distance;
        nearestHit = hit.hitPoint;
        hitAngle = rayAngle;
      }
    }
  }

  const detected = minDistance < maxRange;
  const clampedDist = Math.max(minRange, Math.min(maxRange, minDistance));

  return {
    distance: Number(clampedDist.toFixed(1)),
    detected,
    hitPoint: nearestHit,
    sensorOrigin,
    beamAngle: hitAngle,
  };
}

/**
 * Distance from a 2D point to a line segment
 */
export function distancePointToSegment(p: Point2D, seg: LineSegment2D): number {
  const vx = seg.p2.x - seg.p1.x;
  const vy = seg.p2.y - seg.p1.y;
  const l2 = vx * vx + vy * vy;
  if (l2 === 0) return Math.hypot(p.x - seg.p1.x, p.y - seg.p1.y);

  // Project p onto line segment: t = [(p - p1) . v] / |v|^2
  const t = Math.max(0, Math.min(1, ((p.x - seg.p1.x) * vx + (p.y - seg.p1.y) * vy) / l2));
  const projX = seg.p1.x + t * vx;
  const projY = seg.p1.y + t * vy;

  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Simulates dual TCRT5000 infrared line sensors.
 * Returns reflectance in [0.0, 1.0] and digital boolean states.
 */
export function readLineSensors(
  robot: RobotState,
  arena: ArenaEnvironment,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
  threshold = 0.5,
): LineSensorReading {
  const leftPos = localToGlobal(robot, config.leftSensorOffset);
  const rightPos = localToGlobal(robot, config.rightSensorOffset);

  let leftDist = Infinity;
  let rightDist = Infinity;
  let activeTrackWidth = 2.0;

  for (const track of arena.tracks) {
    activeTrackWidth = track.width;
    const pts = track.points;
    const n = pts.length;
    if (n < 2) continue;

    const segmentCount = track.closed ? n : n - 1;
    for (let i = 0; i < segmentCount; i++) {
      const p1 = pts[i]!;
      const p2 = pts[(i + 1) % n]!;
      const seg: LineSegment2D = { p1, p2 };

      const dL = distancePointToSegment(leftPos, seg);
      const dR = distancePointToSegment(rightPos, seg);

      if (dL < leftDist) leftDist = dL;
      if (dR < rightDist) rightDist = dR;
    }
  }

  // Reflectance model: 1.0 when centered on line, dropping to 0 outside half-width
  const halfW = activeTrackWidth / 2;
  const calcReflectance = (dist: number) => {
    if (dist <= halfW * 0.6) return 1.0;
    if (dist >= halfW * 1.4) return 0.0;
    // Linear transition at line edge
    return Math.max(0, Math.min(1, (halfW * 1.4 - dist) / (halfW * 0.8)));
  };

  const leftReflectance = Number(calcReflectance(leftDist).toFixed(2));
  const rightReflectance = Number(calcReflectance(rightDist).toFixed(2));

  return {
    leftReflectance,
    rightReflectance,
    leftOnLine: leftReflectance >= threshold,
    rightOnLine: rightReflectance >= threshold,
    leftPos,
    rightPos,
  };
}

/**
 * Tests if robot chassis has collided with any obstacle or arena boundary
 */
export function checkRobotCollision(
  robot: RobotState,
  arena: ArenaEnvironment,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
): boolean {
  const boxCorners = getRobotBoundingBox(robot, config);

  // Check arena walls
  for (const pt of boxCorners) {
    if (pt.x <= 0 || pt.x >= arena.width || pt.y <= 0 || pt.y >= arena.height) {
      return true;
    }
  }

  // Check obstacle boxes using Separating Axis Theorem (SAT) / point containment
  for (const obs of arena.obstacles) {
    // Simple bounding circle reject first
    const distToCenter = Math.hypot(robot.x - obs.x, robot.y - obs.y);
    const maxRadius =
      Math.hypot(config.chassisLength, config.chassisWidth) / 2 +
      Math.hypot(obs.width, obs.height) / 2;

    if (distToCenter > maxRadius) continue;

    // Check if robot center or any corner is inside obstacle box
    if (isPointInObstacle({ x: robot.x, y: robot.y }, obs)) return true;
    for (const corner of boxCorners) {
      if (isPointInObstacle(corner, obs)) return true;
    }

    // Check edge crossings between robot polygon and obstacle polygon
    const b0 = boxCorners[0]!;
    const b1 = boxCorners[1]!;
    const b2 = boxCorners[2]!;
    const b3 = boxCorners[3]!;
    const robotSegs: LineSegment2D[] = [
      { p1: b0, p2: b1 },
      { p1: b1, p2: b2 },
      { p1: b2, p2: b3 },
      { p1: b3, p2: b0 },
    ];

    const obsSegs = getObstacleSegments(obs);

    for (const rSeg of robotSegs) {
      for (const oSeg of obsSegs) {
        if (segmentsIntersect(rSeg, oSeg)) return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a 2D point is contained within an obstacle box
 */
export function isPointInObstacle(pt: Point2D, box: ObstacleBox): boolean {
  const rot = box.rotation || 0;
  const dx = pt.x - box.x;
  const dy = pt.y - box.y;
  const cos = Math.cos(-rot);
  const sin = Math.sin(-rot);
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;
  return Math.abs(rx) <= box.width / 2 && Math.abs(ry) <= box.height / 2;
}

/**
 * Helper to check if two line segments intersect
 */
function segmentsIntersect(s1: LineSegment2D, s2: LineSegment2D): boolean {
  const crossProduct = (a: Point2D, b: Point2D, c: Point2D) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

  const d1 = crossProduct(s1.p1, s1.p2, s2.p1);
  const d2 = crossProduct(s1.p1, s1.p2, s2.p2);
  const d3 = crossProduct(s2.p1, s2.p2, s1.p1);
  const d4 = crossProduct(s2.p1, s2.p2, s1.p2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}
