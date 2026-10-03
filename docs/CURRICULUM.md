# Curriculum

## Principles
Intuition → formula → practice → build. One idea per lesson (10–20 min). Every lesson: ≥1 interactive element, quiz, recap. Prerequisites explicit.

## Path 1 (MVP): Electronics & Embedded Foundations — 30 lessons
Target: ages 12–18, no prior knowledge. Low voltage only (≤ 12 V DC).

### Module 1 — Electricity Basics (6)
1. What is electricity? (charge, flow, analogy with water — and where the analogy breaks)
2. Voltage, current, resistance
3. Ohm's law (V = I·R) with worked examples
4. Series and parallel circuits
5. Power and energy (P = V·I), why things get hot
6. Your lab tools: multimeter basics, safe habits, reading a schematic

### Module 2 — Meet the Components (6)
7. Resistors and the colour code
8. LEDs and diodes (why polarity and a resistor matter)
9. Capacitors (charge, discharge, RC time)
10. Switches, buttons and the breadboard
11. Transistors as switches
12. Sensors: LDR, thermistor, ultrasonic (what they measure and how)

### Module 3 — Arduino & Code (8)
13. What is a microcontroller?
14. Your first sketch: blink
15. Digital output and input (buttons, pull-ups)
16. Analog input (potentiometer, sensors)
17. PWM: dimming and speed
18. Serial monitor and debugging
19. Functions, variables and logic for robots
20. Reading a sensor and making a decision

### Module 4 — Motion (6)
21. DC motors (and why they need a driver)
22. H-bridge and motor drivers
23. Servo motors
24. Stepper motors (intro)
25. Powering robots: batteries, voltage, current budget
26. Encoders and measuring movement

### Module 5 — Your First Robot (4)
27. Differential drive: how a two-wheel robot turns
28. Project: line follower
29. Project: obstacle-avoiding car
30. Capstone: design your own mini-robot (plan, simulate, build, reflect)

### Projects (MVP)
P1 LED blink · P2 Traffic light · P3 Line follower · P4 Obstacle car · P5 Servo arm
Starter kit: Arduino Uno/Nano-compatible, breadboard, jumper wires, LEDs, resistor assortment, push buttons, potentiometer, LDR, buzzer, servo (SG90-class), ultrasonic sensor (HC-SR04-class), motor driver (L298N/TB6612-class), 2 DC gear motors + wheels + chassis, 4×AA holder, IR line sensors. *Maintainer verifies every part and the final BOM before publication.*

## Path 2 (Phase 4): College Core
Math for robotics (vectors, matrices, calculus refresher) · Circuit analysis (KCL/KVL, Thevenin, AC, filters, op-amps) · Digital logic · Embedded C on ESP32/STM32/RP2040 (timers, interrupts, UART/I2C/SPI, RTOS intro) · PCB design with KiCad (schematic, footprints, layout, DRC, DFM, ordering) · Control systems (transfer functions, PID tuning lab, state-space intro, stability) · Kinematics (FK/IK, DH, Jacobian) · Sensors & actuators selection (motor sizing).

## Path 3 (Phase 5): Advanced Robotics
ROS 2 fundamentals (nodes, topics, tf, URDF, Nav2) · Perception (OpenCV, calibration, detection) · Localization & mapping (odometry, EKF, SLAM intro) · Motion planning (A*, RRT) · ML for robotics (intro, TinyML) · Drones (flight control basics) · Systems engineering, testing, safety standards awareness.

## Component library (MVP 20)
Resistor, potentiometer, LDR, thermistor, capacitor (ceramic/electrolytic), diode, LED, push button, slide switch, buzzer, NPN transistor, N-MOSFET, relay (low-voltage coil, awareness only), DC motor, servo, stepper (intro), HC-SR04, IR line sensor, motor driver, Arduino Uno/Nano.

## Calculators (MVP 12)
See `PRD.md FR-TLS-01`.

## Assessment
Per lesson quiz · per module test · capstone rubric (plan, simulation evidence, build evidence, reflection). Badges: "Circuit Starter", "Code Blinker", "Motion Maker", "First Robot".

## Mapping (later)
Provide mappings to common school/college syllabi as community contributions (`content/mappings/`). Do not claim official alignment without verification.
