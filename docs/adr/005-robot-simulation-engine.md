# ADR-005: 2D Robot Simulation Physics & Sensor Raycasting Strategy

## Context
RoboForge requires a 2D robot simulation environment (`FR-ARD-06`) to bridge circuit design and Arduino microcontroller programming with real-world physical robot behavior (specifically Project P3: Autonomous Line Follower and Project P4: Ultrasonic Obstacle-Avoiding Car).

In educational robotics, students build 2-wheel differential drive robots with a front or rear caster ball, equipped with:
1. Two DC gear motors (typically 6V yellow TT motors) driven by an H-bridge (L298N) using PWM speed control.
2. Dual or triple infrared reflectance line sensors (TCRT5000) mounted under the chassis near the front axle.
3. An ultrasonic distance sensor (HC-SR04) mounted on the front chassis or an SG90 servo pan radar.
4. Optical wheel encoders tracking rotation ticks.

We evaluated several architectural approaches for the 2D simulation engine:
1. **Heavy Physics Engine (Box2D / Rapier / Matter.js WASM):**
   - *Pros:* General rigid-body collision, friction impulse solvers.
   - *Cons:* Heavy binary overhead (1–3 MB), non-deterministic floating point behavior across platforms, complex setup for simple unicycle/differential kinematics, unnecessary mass/inertia parameter tuning that obscures elementary robotics formulas.
2. **Deterministic Continuous-Time Differential Drive Kinematics & Geometric Raycasting (`@roboforge/sim-robot`):**
   - *Pros:*
     - Exact, closed-form differential drive kinematics ($v = \frac{R}{2}(\omega_R + \omega_L)$, $\omega = \frac{R}{L}(\omega_R - \omega_L)$) directly matching curriculum lessons (Module 4 & Module 5).
     - Sub-millisecond execution with 0 external dependencies (pure TypeScript).
     - Deterministic time stepping: identical inputs yield identical odometry tracks and sensor readings across all machines.
     - Precise ray-segment intersection math for sonar distance measurement and multi-point ground surface sampling for IR line sensors.
     - Directly testable in Node.js test suites with Vitest at 100% test coverage.

## Decision
We adopt **pure TypeScript continuous-time differential drive kinematics and geometric raycasting** within `packages/sim-robot`.

### Core Architectural Contracts
1. **Robot State & Geometry (`RobotState`, `RobotConfig`):**
   - Pose: $(x, y, \theta)$ where $\theta$ is heading in radians ($0 = \text{East}, \pi/2 = \text{North}$).
   - Geometry: Chassis width/length, wheelbase $L$, wheel radius $R$, sensor offsets from robot center.
   - Wheel Velocities: Angular velocities $\omega_L, \omega_R$ in $\text{rad/s}$, translated to linear velocity $v$ and angular velocity $\omega$.
2. **Continuous Integration Step (`stepRobotKinematics`):**
   - Given $\Delta t$, computes new pose $(x', y', \theta')$.
   - Handles straight-line motion ($\omega \approx 0$) and instantaneous center of curvature (ICC) arc rotation ($\omega \neq 0$).
   - Computes wheel travel distance and encoder tick accumulation.
3. **Sensors (`HC-SR04`, `TCRT5000`):**
   - **Ultrasonic Sonar:** Projects a ray/cone from sensor location $(x_s, y_s)$ along angle $(\theta + \theta_{\text{servo}})$ with beam aperture ($15^\circ$). Intersects with arena boundary walls and polygonal/rectangular obstacle boxes. Computes minimum distance clamped to $[2\,\text{cm}, 400\,\text{cm}]$.
   - **IR Line Sensors:** Evaluates sensor probe coordinates against line segments/polylines or texture masks. Returns analog reflectance value $[0.0, 1.0]$ and binary threshold state (`DARK` on black tape, `LIGHT` on white floor).
4. **Arena Environment (`RobotArena`):**
   - Bounding dimensions (e.g. $800 \times 600$ mm).
   - Track paths (polyline or bezier curves with configurable line thickness, e.g. 20 mm electrical tape).
   - Obstacle collection (rectangles with collision bounding boxes).
5. **Decoupled Controllers (`DifferentialDriveController`):**
   - Manual Teleoperation (linear/angular velocity setpoints).
   - Autonomous 2-Sensor Line Follower (Bang-Bang and Proportional modes).
   - Autonomous Reactive Obstacle Avoider (sonar threshold trigger, reverse & pivot turn state machine).

## Consequences
- **Positive:**
  - Zero heavy binary dependencies. Extremely lightweight and fast.
  - Matches elementary robotics physics taught in schools and introductory college courses.
  - Rock-solid 60 fps simulation on low-spec hardware without GPU acceleration.
  - 100% offline and deterministic.
- **Negative:**
  - Does not model 3D dynamics (e.g. ramps, wheel slip on ice, tipping over). This is an acceptable educational tradeoff documented in `PRD §6.5`.

## Status
Accepted.
