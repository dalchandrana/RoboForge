/**
 * Pure 2D Differential Drive Kinematics Engine
 *
 * Implements standard unicycle and differential-drive kinematics for educational
 * mobile robots (e.g. 2WD Arduino smart car with 2 DC gear motors and caster ball).
 */

export interface RobotConfig {
  /** Wheel radius in centimeters (default: 3.3 cm for standard 66mm TT wheel) */
  wheelRadius: number;
  /** Distance between left and right wheel contact points in cm (default: 13.5 cm) */
  wheelBase: number;
  /** Overall chassis width in cm (default: 15 cm) */
  chassisWidth: number;
  /** Overall chassis length in cm (default: 20 cm) */
  chassisLength: number;
  /** Maximum wheel angular velocity in rad/s (default: ~20 rad/s / ~200 RPM) */
  maxWheelSpeed: number;
  /** Optical encoder disk slots / ticks per wheel revolution (default: 20) */
  encoderTicksPerRev: number;
  /** Position of left IR line sensor relative to robot center [forward, left] in cm */
  leftSensorOffset: { x: number; y: number };
  /** Position of right IR line sensor relative to robot center [forward, right] in cm */
  rightSensorOffset: { x: number; y: number };
  /** Position of ultrasonic sensor relative to robot center [forward, lateral] in cm */
  sonarOffset: { x: number; y: number };
}

export const DEFAULT_ROBOT_CONFIG: RobotConfig = {
  wheelRadius: 3.3, // 33 mm
  wheelBase: 13.5, // 135 mm
  chassisWidth: 15.0, // 150 mm
  chassisLength: 20.0, // 200 mm
  maxWheelSpeed: 21.0, // ~200 RPM
  encoderTicksPerRev: 20,
  leftSensorOffset: { x: 8.5, y: 1.8 }, // 8.5 cm forward, 1.8 cm left
  rightSensorOffset: { x: 8.5, y: -1.8 }, // 8.5 cm forward, 1.8 cm right
  sonarOffset: { x: 10.0, y: 0.0 }, // 10 cm forward, centerline
};

export interface RobotState {
  /** X coordinate in arena space (cm) */
  x: number;
  /** Y coordinate in arena space (cm) */
  y: number;
  /** Heading angle in radians (0 = East / positive X, PI/2 = North / positive Y) */
  theta: number;
  /** Left wheel angular velocity (rad/s) */
  leftWheelSpeed: number;
  /** Right wheel angular velocity (rad/s) */
  rightWheelSpeed: number;
  /** Robot body linear forward velocity (cm/s) */
  linearVelocity: number;
  /** Robot body angular turning velocity (rad/s) */
  angularVelocity: number;
  /** Accumulated encoder ticks on left wheel */
  leftEncoderTicks: number;
  /** Accumulated encoder ticks on right wheel */
  rightEncoderTicks: number;
  /** Ultrasonic servo scan angle relative to robot body heading (radians) */
  sonarServoAngle: number;
  /** Total distance traveled along trajectory (cm) */
  totalDistanceTraveled: number;
}

export function createInitialRobotState(
  x = 0,
  y = 0,
  theta = 0,
  initialWheelSpeed = 0,
): RobotState {
  return {
    x,
    y,
    theta: normalizeAngle(theta),
    leftWheelSpeed: initialWheelSpeed,
    rightWheelSpeed: initialWheelSpeed,
    linearVelocity: 0,
    angularVelocity: 0,
    leftEncoderTicks: 0,
    rightEncoderTicks: 0,
    sonarServoAngle: 0,
    totalDistanceTraveled: 0,
  };
}

/**
 * Normalizes an angle into the canonical range [-PI, PI)
 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a >= Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * Calculates linear and angular body velocities from wheel angular speeds
 */
export function wheelSpeedsToBodyVelocities(
  omegaL: number,
  omegaR: number,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
): { linearVelocity: number; angularVelocity: number } {
  // v = (R / 2) * (omega_R + omega_L)
  const v = (config.wheelRadius / 2) * (omegaR + omegaL);
  // omega = (R / L) * (omega_R - omega_L)
  const omega = (config.wheelRadius / config.wheelBase) * (omegaR - omegaL);
  return { linearVelocity: v, angularVelocity: omega };
}

/**
 * Calculates required wheel angular velocities from target body velocities (inverse kinematics)
 */
export function bodyVelocitiesToWheelSpeeds(
  linearVelocity: number,
  angularVelocity: number,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
): { omegaL: number; omegaR: number } {
  // omega_L = (v - (L/2) * omega) / R
  const omegaL = (linearVelocity - (config.wheelBase / 2) * angularVelocity) / config.wheelRadius;
  // omega_R = (v + (L/2) * omega) / R
  const omegaR = (linearVelocity + (config.wheelBase / 2) * angularVelocity) / config.wheelRadius;
  return { omegaL, omegaR };
}

/**
 * Clamps wheel speeds to physical motor limits
 */
export function clampWheelSpeed(
  speed: number,
  maxSpeed = DEFAULT_ROBOT_CONFIG.maxWheelSpeed,
): number {
  return Math.max(-maxSpeed, Math.min(maxSpeed, speed));
}

/**
 * Steps the robot differential-drive state forward by delta time dt (in seconds).
 * Uses exact arc integration (ICC) when turning, or linear projection when straight.
 */
export function stepRobotKinematics(
  currentState: RobotState,
  targetOmegaL: number,
  targetOmegaR: number,
  dt: number,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
): RobotState {
  if (dt <= 0) return { ...currentState };

  // 1. Clamp wheel speeds
  const omegaL = clampWheelSpeed(targetOmegaL, config.maxWheelSpeed);
  const omegaR = clampWheelSpeed(targetOmegaR, config.maxWheelSpeed);

  // 2. Compute body velocities
  const { linearVelocity: v, angularVelocity: omega } = wheelSpeedsToBodyVelocities(
    omegaL,
    omegaR,
    config,
  );

  let newX = currentState.x;
  let newY = currentState.y;
  let newTheta = currentState.theta;

  // 3. Pose integration
  if (Math.abs(omega) < 1e-6) {
    // Pure straight line translation
    newX += v * Math.cos(currentState.theta) * dt;
    newY += v * Math.sin(currentState.theta) * dt;
    newTheta = currentState.theta;
  } else {
    // Motion about Instantaneous Center of Curvature (ICC)
    const R_icc = v / omega;
    const iccX = currentState.x - R_icc * Math.sin(currentState.theta);
    const iccY = currentState.y + R_icc * Math.cos(currentState.theta);
    const dTheta = omega * dt;

    newTheta = normalizeAngle(currentState.theta + dTheta);
    newX = iccX + R_icc * Math.sin(newTheta);
    newY = iccY - R_icc * Math.cos(newTheta);
  }

  // 4. Distance and encoder tick accumulation
  const distL = Math.abs(omegaL * config.wheelRadius * dt);
  const distR = Math.abs(omegaR * config.wheelRadius * dt);
  const wheelCircumference = 2 * Math.PI * config.wheelRadius;

  const newLeftTicks =
    currentState.leftEncoderTicks +
    Math.round((distL / wheelCircumference) * config.encoderTicksPerRev);
  const newRightTicks =
    currentState.rightEncoderTicks +
    Math.round((distR / wheelCircumference) * config.encoderTicksPerRev);

  const deltaDist = Math.abs(v * dt);

  return {
    ...currentState,
    x: newX,
    y: newY,
    theta: newTheta,
    leftWheelSpeed: omegaL,
    rightWheelSpeed: omegaR,
    linearVelocity: v,
    angularVelocity: omega,
    leftEncoderTicks: newLeftTicks,
    rightEncoderTicks: newRightTicks,
    totalDistanceTraveled: currentState.totalDistanceTraveled + deltaDist,
  };
}

/**
 * Transforms a point in robot local coordinates [forward, left] into global arena coordinates
 */
export function localToGlobal(
  robotPose: { x: number; y: number; theta: number },
  localPoint: { x: number; y: number },
): { x: number; y: number } {
  // Local x is forward (along heading theta), local y is lateral left (orthogonal)
  const cosT = Math.cos(robotPose.theta);
  const sinT = Math.sin(robotPose.theta);
  return {
    x: robotPose.x + localPoint.x * cosT - localPoint.y * sinT,
    y: robotPose.y + localPoint.x * sinT + localPoint.y * cosT,
  };
}

/**
 * Computes bounding polygon vertices of the robot chassis in global arena space
 */
export function getRobotBoundingBox(
  state: RobotState,
  config: RobotConfig = DEFAULT_ROBOT_CONFIG,
): Array<{ x: number; y: number }> {
  const halfL = config.chassisLength / 2;
  const halfW = config.chassisWidth / 2;

  // 4 corners: front-left, front-right, rear-right, rear-left
  const localCorners = [
    { x: halfL, y: halfW },
    { x: halfL, y: -halfW },
    { x: -halfL, y: -halfW },
    { x: -halfL, y: halfW },
  ];

  return localCorners.map(pt => localToGlobal(state, pt));
}
