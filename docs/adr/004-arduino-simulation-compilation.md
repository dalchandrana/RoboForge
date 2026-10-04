# ADR-004: Arduino AVR Simulation Engine & Compilation Strategy

## Context
RoboForge requires an offline Arduino / AVR simulation capability for its educational robotics curriculum (PRD FR-ARD-01..05).
Key requirements:
1. **Instruction-Level Emulation:** Accurately simulate an 8-bit AVR microcontroller (ATmega328P as found on the Arduino Uno and Nano) with accurate clock timing, GPIO registers, hardware timers (Timer0, Timer1, Timer2), ADC converter, and USART communication.
2. **Zero-Network Invariant:** Microcontroller simulation and sketch execution must work 100% offline with zero cloud compile servers.
3. **Low Latency & High Frame Rate:** Emulation must run smoothly alongside the UI (60 fps) on low-spec hardware (e.g. 4 GB RAM laptops).
4. **Pedagogical Feedback:** Virtual peripherals must provide immediate visual feedback (built-in LED toggling, TX/RX activity, analog voltage reading, Serial Monitor text streaming) without cryptic hardware faults.
5. **Licensing Compliance:** Permissive open-source license compatible with RoboForge's Apache-2.0 codebase.

## Options Considered

### Option 1: `avr8js` Core Emulation + Verified Pre-Compiled Intel HEX Pipeline (Accepted)
- **Architecture**:
  - Integrate `avr8js` (MIT license, written by Uri Shaked), a pure JavaScript AVR instruction cycle emulator.
  - Implement a clean TypeScript wrapper in `packages/sim-avr` providing cycle-accurate CPU execution, GPIO port listeners (Port B, C, D), Timer0 interrupt generation (for `millis()` and `delay()`), 10-bit ADC conversion, and USART serial streams.
  - Bundle verified, pre-compiled Intel HEX binaries alongside starter sketches and curriculum challenges. The UI displays the clean, commented C++ Arduino sketch, and allows interactive parameter tuning.
- **Pros**:
  - **Zero native toolchain overhead**: Eliminates the requirement to bundle 100+ MB of native GCC binaries (`avr-gcc`, `avr-libc`, `arduino-cli`) which would bloat the installer beyond our 250 MB budget.
  - **Instant startup**: Zero compilation delay (< 1 ms); sketch runs immediately on click.
  - **100% Offline & Cross-Platform**: No system compiler dependencies across Windows, macOS (x64/ARM64), and Linux.
  - **Tested in Pure Node**: Runs in headless test environments (Vitest) with fast execution benchmarks.
  - **Zero Network**: No requests to external web compilers.
- **Cons**:
  - Arbitrary user-typed C++ code requires either pre-compiled variations or an optional local sidecar compiler in future phases.

### Option 2: Bundled Native `arduino-cli` + `avr-gcc` Sidecar
- **Architecture**: Packaging native OS-specific `arduino-cli` binaries and the complete `avr-gcc` toolchain for all supported OS/architecture combinations.
- **Pros**: Can compile arbitrary user C++ code locally.
- **Cons**:
  - **Massive bundle size**: Adds ~150–200 MB per operating system, violating our PRD installer size budget ($\le 250\,\text{MB}$).
  - **GPL License Burden**: `avr-gcc` is licensed under GPLv3, complicating redistribution alongside our Apache-2.0 desktop shell.
  - **Compilation Latency**: Running native `arduino-cli` takes 3–8 seconds per compile, causing disruptive delays for a student testing a one-line change.

### Option 3: Browser-Bundled WebAssembly GCC Compiler
- **Architecture**: Compiling `avr-gcc` to WebAssembly using Emscripten.
- **Pros**: In-browser compilation without native sidecars.
- **Cons**:
  - WebAssembly ports of GCC are experimental, fragile, and require 30–60 MB WASM binaries and hundreds of megabytes of virtual filesystem memory.
  - Extremely slow compilation on lower-end learner devices (10–30 seconds per compile).

## Decision
Adopt **Option 1 (`avr8js` Engine + Verified Pre-Compiled Intel HEX Pipeline)**:
1. `packages/sim-avr` wraps `avr8js` to provide a robust, typed interface for CPU control, GPIO pins, ADC channels, PWM, and bidirectional Serial Monitor.
2. Educational sketches are paired with verified Intel HEX binaries so learners experience instant execution, live variable observation, and zero waiting.
3. For custom code variations in project challenges, provide structured parameter customization and instant sketch switching.
4. If full arbitrary C++ compiling is requested in advanced college tracks (Phase 4), it will be offered as an opt-in user-installed local toolchain integration via Tauri sidecar without compromising the base lightweight installer.

## Consequences
- The desktop app remains ultra-lightweight, fast, and 100% offline.
- Real-time simulation runs at target clock speeds with smooth UI integration.
- Clear separation of concerns: `packages/sim-avr` has zero UI/DOM dependencies and is 100% testable in Vitest.
