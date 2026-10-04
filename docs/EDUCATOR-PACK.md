# RoboForge Educator & Classroom Pack

A comprehensive deployment and teaching guide for educators, STEM teachers, robotics club mentors, and makerspaces.

---

## 1. Why RoboForge for Classrooms?

1. **Zero Privacy / Compliance Burden (FERPA, COPPA, GDPR compliant by design)**:
   - **No student accounts, emails, or logins required.**
   - **Zero telemetry, cloud analytics, or external network requests.**
   - All student progress, quiz answers, and simulation experiments stay 100% on the local machine in local SQLite and JSON files.
2. **True Offline Reliability**:
   - School Wi-Fi outages never disrupt class. Once installed, students can complete all 30 lessons, circuit simulations, Arduino sketches, and 2D robot experiments without internet.
3. **Hardware Safety Built-In**:
   - Curriculum is restricted to **Class III SELV** ($\le 12\,\text{V DC}, \le 2\,\text{A}$).
   - Every hardware lesson and project includes safety callouts, preventing damaged components with simulated burnout warnings before students touch real hardware.
4. **Low Hardware Cost**:
   - High-fidelity simulators allow entire cohorts to learn and debug circuits and code before touching physical kits.

---

## 2. Classroom Lab Deployment

### Mass Installation
RoboForge is packaged as standalone native binaries:
- **macOS**: Drag `RoboForge.app` to `/Applications` or deploy via Jamf/Munki.
- **Windows**: Silent install using NSIS:
  ```powershell
  RoboForge_1.0.0_x64-setup.exe /S
  ```
- **Linux**: Install via `.deb` package across lab workstations:
  ```bash
  sudo apt-get install ./roboforge_1.0.0_amd64.deb
  ```

### Low-Spec Computer Labs
For older school laptops (dual-core Intel Celeron / Core i3, 4GB RAM):
- Enable **Low-Spec Mode** in `Settings -> Display & Accessibility`.
- This disables GPU backdrop filters, strips heavy glow effects, and throttles simulation canvas rendering to a steady 30 FPS.

---

## 3. Local AI Coach Setup (Optional)

RoboForge includes a built-in Socratic AI coach. It is completely optional—the application is 100% functional with authored hints if the AI is disabled (`Settings -> AI-Off Mode`).

To enable local AI without internet or API fees:
1. Install [Ollama](https://ollama.ai) on student workstations or a local classroom server.
2. Pull a lightweight model:
   - **Small (8GB RAM laptops)**: `ollama pull qwen2.5-coder:1.5b`
   - **Balanced (16GB RAM workstations)**: `ollama pull llama3.2:3b`
3. RoboForge connects directly to `http://127.0.0.1:11434` on localhost. No cloud tokens or student accounts are required.

---

## 4. Curriculum Structure & Pacing

RoboForge contains 30 modular, self-paced lessons divided into 5 modules (approx. 20–35 minutes each):

| Module | Core Topics | Hands-on Labs & Simulator |
| :--- | :--- | :--- |
| **M1: Electricity Foundations** | Charge, Voltage, Current, Ohm's Law, Series/Parallel | Interactive breadboard, resistor color decoder, voltage divider challenge |
| **M2: Passive & Active Parts** | Capacitors, Diodes, LEDs, BJT & MOSFET switches | LED current limiter circuit, switch debouncing, transistor motor drive |
| **M3: Digital & Microcontrollers** | Logic Gates, Truth Tables, ATmega328P Architecture | 7400-series gate challenges, AVR memory map & register explorer |
| **M4: Embedded C++ Coding** | GPIO registers, PWM duty cycle, Timer interrupts, I2C/SPI | Arduino Uno blink sketch, PWM servo pulse calculator, UART serial monitor |
| **M5: Your First Robot** | Differential drive kinematics, IR line tracking, Sonar navigation | 2D robot physics arena, PID line follower, autonomous obstacle avoider |

### Capstone Project: Autonomous Two-Wheeled Robot
Students combine all 5 modules to design, simulate, and optionally assemble a 2-wheeled differential drive rover capable of tracking tape tracks and dodging obstacles.

---

## 5. Homework & Grading Workflow

### Collecting Student Work
RoboForge makes homework submission simple without a cloud database:
1. **Export Portable Bundle (`.roboforge`)**:
   - Students click `Settings -> Export Progress` to generate a single portable `.roboforge` JSON file containing all completed lessons, quiz scores, and workshop logs.
   - Teachers can import this file into a master workstation to review completion status.
2. **Project Build Logs & Share Template**:
   - In the `Projects -> Workshop Logs` tab, students can click **Export for Sharing** to generate a clean GitHub Markdown report detailing their schematic, wiring checklist, code, and test observations.
3. **Completion Certificate**:
   - Students who complete all projects can generate a vector SVG **Certificate of Completion** with their name, date, and verification hash, ready for printing or saving to PDF.

---

## 6. Classroom 10-Pack Hardware Kit Bill of Materials

RoboForge projects use generic, globally available, open-standard components. A full classroom lab kit for 10 student pairs can be procured for under $250–$300 total:

| Component | Quantity for 10 Stations | Est. Unit Cost | Purpose |
| :--- | :--- | :--- | :--- |
| **Arduino Uno R3 Clone (CH340)** | 10 pcs | $4.50 | Microcontroller brain |
| **Full-size Breadboard (830 points)** | 10 pcs | $2.50 | Prototyping circuits |
| **Jumper Wires (M-M, M-F, F-F 120pc)** | 5 packs | $3.00 | Interconnects |
| **Assorted Resistors (E12 kit, 600pc)** | 2 kits | $6.00 | Ohm's Law & LED current limiting |
| **5mm LEDs (Red, Green, Yellow, Blue)** | 1 kit (100pc) | $5.00 | Status & output indicators |
| **HC-SR04 Ultrasonic Sonar** | 10 pcs | $1.20 | Obstacle detection rangefinder |
| **TCRT5000 Dual IR Line Sensors** | 10 pcs | $1.50 | Black line tape tracking |
| **L298N or TB6612FNG Motor Driver** | 10 pcs | $2.00 | Dual DC motor H-Bridge |
| **2WD Smart Robot Chassis + TT Motors** | 10 kits | $8.00 | Wheels, chassis plate, caster |
| **4x AA Battery Holder with DC Jack** | 10 pcs | $1.20 | Safe 6V DC power supply |
