import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ROBOT_CONFIG,
  createInitialRobotState,
  normalizeAngle,
  wheelSpeedsToBodyVelocities,
  bodyVelocitiesToWheelSpeeds,
  clampWheelSpeed,
  stepRobotKinematics,
  localToGlobal,
  getRobotBoundingBox,
  raySegmentIntersection,
  getObstacleSegments,
  getArenaBoundarySegments,
  readUltrasonicSonar,
  distancePointToSegment,
  readLineSensors,
  checkRobotCollision,
  LineFollowerController,
  ObstacleAvoidanceController,
  calculateManualSpeeds,
  createOvalTrackArena,
  createFigureEightArena,
  createObstacleCourseArena,
} from './index';

describe('2D Differential Drive Kinematics', () => {
  it('normalizes angles into [-PI, PI)', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(Math.PI)).toBeCloseTo(-Math.PI, 5);
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(-Math.PI, 5);
    expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI, 5);
    expect(normalizeAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 5);
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 5);
  });

  it('converts wheel speeds to body velocities accurately', () => {
    const config = DEFAULT_ROBOT_CONFIG; // R = 3.3 cm, L = 13.5 cm
    // Straight forward: both wheels 10 rad/s
    const straight = wheelSpeedsToBodyVelocities(10, 10, config);
    expect(straight.linearVelocity).toBeCloseTo(33.0, 3); // 3.3 * 10 = 33 cm/s
    expect(straight.angularVelocity).toBeCloseTo(0.0, 5);

    // Pure spin in place: left = -10, right = 10
    const spin = wheelSpeedsToBodyVelocities(-10, 10, config);
    expect(spin.linearVelocity).toBeCloseTo(0.0, 5);
    // omega = (3.3 / 13.5) * 20 = 4.8889 rad/s
    expect(spin.angularVelocity).toBeCloseTo((3.3 / 13.5) * 20, 3);
  });

  it('inverts body velocities back to wheel speeds (roundtrip)', () => {
    const config = DEFAULT_ROBOT_CONFIG;
    const vTarget = 25.0; // cm/s
    const omegaTarget = 1.5; // rad/s

    const wheels = bodyVelocitiesToWheelSpeeds(vTarget, omegaTarget, config);
    const roundtrip = wheelSpeedsToBodyVelocities(wheels.omegaL, wheels.omegaR, config);

    expect(roundtrip.linearVelocity).toBeCloseTo(vTarget, 4);
    expect(roundtrip.angularVelocity).toBeCloseTo(omegaTarget, 4);
  });

  it('clamps wheel speeds to maximum limits', () => {
    expect(clampWheelSpeed(15, 20)).toBe(15);
    expect(clampWheelSpeed(25, 20)).toBe(20);
    expect(clampWheelSpeed(-30, 20)).toBe(-20);
  });

  it('steps robot forward in a straight line', () => {
    const start = createInitialRobotState(50, 50, 0); // At (50, 50), facing East
    const dt = 0.1; // 100 ms
    const next = stepRobotKinematics(start, 10, 10, dt);

    // Speed = 33 cm/s -> in 0.1s moves 3.3 cm forward along X
    expect(next.x).toBeCloseTo(53.3, 2);
    expect(next.y).toBeCloseTo(50.0, 2);
    expect(next.theta).toBeCloseTo(0, 4);
    expect(next.totalDistanceTraveled).toBeCloseTo(3.3, 2);
    expect(next.leftEncoderTicks).toBeGreaterThan(0);
    expect(next.rightEncoderTicks).toBeGreaterThan(0);
  });

  it('steps robot in an arc turn about ICC', () => {
    const start = createInitialRobotState(100, 100, 0);
    const dt = 0.5; // 0.5s
    // Left wheel slower than right wheel -> turns left (counter-clockwise)
    const next = stepRobotKinematics(start, 5, 10, dt);

    expect(next.theta).toBeGreaterThan(0);
    expect(next.y).toBeGreaterThan(100);
    expect(next.totalDistanceTraveled).toBeGreaterThan(0);
  });

  it('transforms local points to global arena space', () => {
    const pose = { x: 100, y: 100, theta: 0 };
    const pt = localToGlobal(pose, { x: 10, y: 5 });
    expect(pt.x).toBeCloseTo(110, 3);
    expect(pt.y).toBeCloseTo(105, 3);

    // Facing North (PI/2)
    const poseNorth = { x: 100, y: 100, theta: Math.PI / 2 };
    const ptNorth = localToGlobal(poseNorth, { x: 10, y: 0 });
    expect(ptNorth.x).toBeCloseTo(100, 3);
    expect(ptNorth.y).toBeCloseTo(110, 3);
  });

  it('computes 4 bounding box corners', () => {
    const state = createInitialRobotState(50, 50, 0);
    const corners = getRobotBoundingBox(state);
    expect(corners.length).toBe(4);
    // Check center is roughly average of corners
    const avgX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
    const avgY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
    expect(avgX).toBeCloseTo(50, 2);
    expect(avgY).toBeCloseTo(50, 2);
  });
});

describe('Sensors and Raycasting', () => {
  it('computes ray-segment intersection correctly', () => {
    const origin = { x: 0, y: 5 };
    const dir = { x: 1, y: 0 }; // Ray along positive X
    const segment = { p1: { x: 10, y: 0 }, p2: { x: 10, y: 10 } }; // Vertical wall at X=10

    const hit = raySegmentIntersection(origin, dir, segment);
    expect(hit).not.toBeNull();
    expect(hit?.distance).toBeCloseTo(10, 4);
    expect(hit?.hitPoint.x).toBeCloseTo(10, 4);
    expect(hit?.hitPoint.y).toBeCloseTo(5, 4);

    // Parallel ray should not hit
    const parallelDir = { x: 0, y: 1 };
    expect(raySegmentIntersection(origin, parallelDir, segment)).toBeNull();

    // Segment behind ray origin should not hit
    const behindOrigin = { x: 20, y: 5 };
    expect(raySegmentIntersection(behindOrigin, dir, segment)).toBeNull();
  });

  it('reads ultrasonic sonar against arena boundaries and obstacles', () => {
    const arena = createObstacleCourseArena(300, 200);
    // Place robot at (150, 50) facing North (toward obstacle at (150, 100))
    const robot = createInitialRobotState(150, 50, Math.PI / 2);

    const reading = readUltrasonicSonar(robot, arena);
    expect(reading.detected).toBe(true);
    // Obstacle is at Y=100 with height 25 (bottom edge is 100 - 12.5 = 87.5)
    // Sonar offset is +10 forward -> sensor head at Y = 50 + 10 = 60
    // Expected distance = 87.5 - 60 = 27.5 cm
    expect(reading.distance).toBeCloseTo(27.5, 1);
  });

  it('measures distance from point to line segment', () => {
    const seg = { p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 } };
    expect(distancePointToSegment({ x: 5, y: 3 }, seg)).toBeCloseTo(3, 4);
    expect(distancePointToSegment({ x: -4, y: 0 }, seg)).toBeCloseTo(4, 4);
    expect(distancePointToSegment({ x: 13, y: 0 }, seg)).toBeCloseTo(3, 4);
  });

  it('reads IR line sensors on and off track line', () => {
    const arena = createOvalTrackArena(300, 200, 2.5);
    const trackPt = arena.tracks[0]!.points[0]!;

    // Place robot with sensors directly straddling the track point
    const robotOnTrack = createInitialRobotState(
      trackPt.x - DEFAULT_ROBOT_CONFIG.leftSensorOffset.x,
      trackPt.y,
      0,
    );

    const readingOn = readLineSensors(robotOnTrack, arena);
    expect(readingOn.leftReflectance).toBeGreaterThan(0.2);

    // Place robot far away in corner (0, 0)
    const robotInCorner = createInitialRobotState(10, 10, 0);
    const readingOff = readLineSensors(robotInCorner, arena);
    expect(readingOff.leftReflectance).toBe(0);
    expect(readingOff.rightReflectance).toBe(0);
    expect(readingOff.leftOnLine).toBe(false);
    expect(readingOff.rightOnLine).toBe(false);
  });

  it('detects collision with arena boundaries and obstacle blocks', () => {
    const arena = createObstacleCourseArena(300, 200);

    // Robot safely in open space
    const safeRobot = createInitialRobotState(50, 50, 0);
    expect(checkRobotCollision(safeRobot, arena)).toBe(false);

    // Robot penetrating west boundary wall
    const wallCrashRobot = createInitialRobotState(5, 50, 0);
    expect(checkRobotCollision(wallCrashRobot, arena)).toBe(true);

    // Robot inside center obstacle pillar (center is at 150, 100)
    const obstacleCrashRobot = createInitialRobotState(150, 100, 0);
    expect(checkRobotCollision(obstacleCrashRobot, arena)).toBe(true);
  });
});

describe('Robot Controllers', () => {
  it('controls 2-sensor line follower with bang-bang logic', () => {
    const controller = new LineFollowerController(10, 4);

    // Both on floor: drive forward
    const forward = controller.updateBangBang({
      leftReflectance: 0,
      rightReflectance: 0,
      leftOnLine: false,
      rightOnLine: false,
      leftPos: { x: 0, y: 0 },
      rightPos: { x: 0, y: 0 },
    });
    expect(forward.omegaL).toBe(10);
    expect(forward.omegaR).toBe(10);

    // Left on line: steer left (left wheel reverse, right wheel forward)
    const steerLeft = controller.updateBangBang({
      leftReflectance: 0.9,
      rightReflectance: 0.1,
      leftOnLine: true,
      rightOnLine: false,
      leftPos: { x: 0, y: 0 },
      rightPos: { x: 0, y: 0 },
    });
    expect(steerLeft.omegaL).toBe(-4);
    expect(steerLeft.omegaR).toBe(10);

    // Right on line: steer right
    const steerRight = controller.updateBangBang({
      leftReflectance: 0.1,
      rightReflectance: 0.9,
      leftOnLine: false,
      rightOnLine: true,
      leftPos: { x: 0, y: 0 },
      rightPos: { x: 0, y: 0 },
    });
    expect(steerRight.omegaL).toBe(10);
    expect(steerRight.omegaR).toBe(-4);
  });

  it('controls line follower with continuous proportional feedback', () => {
    const controller = new LineFollowerController(10, 4, 10.0);

    // Balanced: no correction
    const balanced = controller.updateProportional({
      leftReflectance: 0.5,
      rightReflectance: 0.5,
      leftOnLine: true,
      rightOnLine: true,
      leftPos: { x: 0, y: 0 },
      rightPos: { x: 0, y: 0 },
    });
    expect(balanced.omegaL).toBe(10);
    expect(balanced.omegaR).toBe(10);

    // Line shifted left (error = 0.8 - 0.2 = 0.6 -> correction = 6.0)
    const leftShift = controller.updateProportional({
      leftReflectance: 0.8,
      rightReflectance: 0.2,
      leftOnLine: true,
      rightOnLine: false,
      leftPos: { x: 0, y: 0 },
      rightPos: { x: 0, y: 0 },
    });
    expect(leftShift.omegaL).toBeCloseTo(4, 5); // 10 - 6
    expect(leftShift.omegaR).toBeCloseTo(16, 5); // 10 + 6
  });

  it('runs reactive obstacle avoidance state machine', () => {
    const controller = new ObstacleAvoidanceController(10, 20);

    // Clear path ahead: FORWARD
    const clearSonar = {
      distance: 80,
      detected: true,
      sensorOrigin: { x: 0, y: 0 },
      beamAngle: 0,
    };
    const forwardSpeeds = controller.update(clearSonar, 0.1);
    expect(controller.getState()).toBe('FORWARD');
    expect(forwardSpeeds.omegaL).toBe(10);
    expect(forwardSpeeds.omegaR).toBe(10);

    // Obstacle detected within 15 cm (< 20 cm safe dist): transitions to BACKUP
    const blockedSonar = {
      distance: 15,
      detected: true,
      sensorOrigin: { x: 0, y: 0 },
      beamAngle: 0,
    };
    const backupSpeeds = controller.update(blockedSonar, 0.1);
    expect(controller.getState()).toBe('BACKUP');
    expect(backupSpeeds.omegaL).toBeLessThan(0);
    expect(backupSpeeds.omegaR).toBeLessThan(0);

    // After 0.5s in BACKUP -> transitions to TURN
    controller.update(blockedSonar, 0.5);
    expect(controller.getState()).toBe('TURN');

    // After path clears and time passes -> transitions back to FORWARD
    controller.update(clearSonar, 0.7);
    expect(controller.getState()).toBe('FORWARD');
  });

  it('calculates manual teleoperation speeds', () => {
    // Full forward
    const fwd = calculateManualSpeeds(1, 0, 10);
    expect(fwd.omegaL).toBe(10);
    expect(fwd.omegaR).toBe(10);

    // Full reverse
    const rev = calculateManualSpeeds(-1, 0, 10);
    expect(rev.omegaL).toBe(-10);
    expect(rev.omegaR).toBe(-10);

    // Turn right in place
    const right = calculateManualSpeeds(0, 1, 10);
    expect(right.omegaL).toBe(-10);
    expect(right.omegaR).toBe(10);

    // Turn left in place
    const left = calculateManualSpeeds(0, -1, 10);
    expect(left.omegaL).toBe(10);
    expect(left.omegaR).toBe(-10);
  });

  it('generates standard arena presets with valid geometries', () => {
    const oval = createOvalTrackArena();
    expect(oval.tracks.length).toBe(1);
    expect(oval.tracks[0]!.points.length).toBeGreaterThan(20);

    const fig8 = createFigureEightArena();
    expect(fig8.tracks.length).toBe(1);
    expect(fig8.tracks[0]!.points.length).toBeGreaterThan(30);

    const course = createObstacleCourseArena();
    expect(course.obstacles.length).toBe(5);
    expect(getArenaBoundarySegments(course.width, course.height).length).toBe(4);
    expect(getObstacleSegments(course.obstacles[0]!).length).toBe(4);
  });
});
