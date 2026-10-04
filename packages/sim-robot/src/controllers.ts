/**
 * Autonomous and Manual Mobile Robot Controllers
 *
 * Implements standard educational robotics algorithms directly matching
 * Curriculum Module 5 (Lessons 27-29) and Hardware Projects P3 & P4.
 */

import { LineSensorReading, SonarReading } from './sensors';

export interface MotorSpeeds {
  omegaL: number; // rad/s
  omegaR: number; // rad/s
}

/**
 * 2-Sensor Line Follower Controller (Bang-Bang or Proportional)
 */
export class LineFollowerController {
  private baseSpeed: number;
  private turnSpeed: number;
  private kp: number;

  constructor(baseSpeed = 10.0, turnSpeed = 4.0, kp = 8.0) {
    this.baseSpeed = baseSpeed;
    this.turnSpeed = turnSpeed;
    this.kp = kp;
  }

  /**
   * Classical 2-sensor discrete Bang-Bang line follower
   */
  updateBangBang(sensorReading: LineSensorReading): MotorSpeeds {
    const { leftOnLine, rightOnLine } = sensorReading;

    if (!leftOnLine && !rightOnLine) {
      // Both on floor: drive forward search
      return { omegaL: this.baseSpeed, omegaR: this.baseSpeed };
    }

    if (leftOnLine && !rightOnLine) {
      // Line is under left sensor -> steer left (pivot turn)
      return { omegaL: -this.turnSpeed, omegaR: this.baseSpeed };
    }

    if (!leftOnLine && rightOnLine) {
      // Line is under right sensor -> steer right (pivot turn)
      return { omegaL: this.baseSpeed, omegaR: -this.turnSpeed };
    }

    // Both on line (T-junction or cross): forward slowly
    return { omegaL: this.baseSpeed * 0.7, omegaR: this.baseSpeed * 0.7 };
  }

  /**
   * Continuous Proportional (P) line follower based on analog reflectance difference
   */
  updateProportional(sensorReading: LineSensorReading): MotorSpeeds {
    // Error > 0 means line is more to the left
    const error = sensorReading.leftReflectance - sensorReading.rightReflectance;
    const correction = this.kp * error;

    const omegaL = this.baseSpeed - correction;
    const omegaR = this.baseSpeed + correction;

    return { omegaL, omegaR };
  }
}

export type ObstacleAvoidanceState = 'FORWARD' | 'BACKUP' | 'TURN';

/**
 * Reactive Ultrasonic Obstacle Avoidance Controller (FSM)
 */
export class ObstacleAvoidanceController {
  private baseSpeed: number;
  private safeDistance: number; // cm
  private state: ObstacleAvoidanceState = 'FORWARD';
  private stateTimer = 0; // seconds spent in current state
  private turnDirection: 1 | -1 = 1; // 1 = turn right, -1 = turn left

  constructor(baseSpeed = 9.0, safeDistance = 22.0) {
    this.baseSpeed = baseSpeed;
    this.safeDistance = safeDistance;
  }

  getState(): ObstacleAvoidanceState {
    return this.state;
  }

  reset(): void {
    this.state = 'FORWARD';
    this.stateTimer = 0;
    this.turnDirection = 1;
  }

  update(sonarReading: SonarReading, dt: number): MotorSpeeds {
    this.stateTimer += dt;

    switch (this.state) {
      case 'FORWARD':
        if (sonarReading.distance <= this.safeDistance) {
          // Obstacle ahead! Switch to backup
          this.state = 'BACKUP';
          this.stateTimer = 0;
          // Randomize or alternate turn direction
          this.turnDirection = Math.random() > 0.5 ? 1 : -1;
          return { omegaL: -this.baseSpeed * 0.5, omegaR: -this.baseSpeed * 0.5 };
        }
        return { omegaL: this.baseSpeed, omegaR: this.baseSpeed };

      case 'BACKUP':
        if (this.stateTimer >= 0.5) {
          // Backed up for 0.5 seconds, now spin in place
          this.state = 'TURN';
          this.stateTimer = 0;
          return {
            omegaL: this.baseSpeed * 0.7 * this.turnDirection,
            omegaR: -this.baseSpeed * 0.7 * this.turnDirection,
          };
        }
        return { omegaL: -this.baseSpeed * 0.6, omegaR: -this.baseSpeed * 0.6 };

      case 'TURN':
        // Turn until path ahead is clear (> 30 cm) and at least 0.6 seconds passed
        if (this.stateTimer >= 0.6 && sonarReading.distance > this.safeDistance + 10) {
          this.state = 'FORWARD';
          this.stateTimer = 0;
          return { omegaL: this.baseSpeed, omegaR: this.baseSpeed };
        }
        return {
          omegaL: this.baseSpeed * 0.7 * this.turnDirection,
          omegaR: -this.baseSpeed * 0.7 * this.turnDirection,
        };
    }
  }
}

/**
 * Manual keyboard / joystick teleoperation controller
 */
export function calculateManualSpeeds(
  forward: number, // -1 (back) to +1 (forward)
  turn: number, // -1 (left) to +1 (right)
  maxSpeed = 12.0,
): MotorSpeeds {
  // Unicycle translation to differential drive
  const omegaL = (forward - turn) * maxSpeed;
  const omegaR = (forward + turn) * maxSpeed;
  return { omegaL, omegaR };
}
