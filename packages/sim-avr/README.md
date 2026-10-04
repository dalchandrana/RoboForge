# @roboforge/sim-avr

ATmega328P instruction set emulator and virtual peripheral runner for RoboForge, built on `avr8js`.

## Features

- **CPU Emulation:** Cycle-accurate 8-bit AVR instruction execution for ATmega328P (16 MHz clock timing, 32KB Flash, 2KB SRAM).
- **GPIO Ports:** Port B (Pins 8–13, including Pin 13 built-in LED), Port C (Analog inputs A0–A5), Port D (Pins 0–7, including RX/TX).
- **Timers:** Hardware Timer0 (`millis()`, `micros()`, `delay()`), Timer1, and Timer2 (`analogWrite()` PWM).
- **ADC:** 10-bit Analog-to-Digital conversion with virtual voltage mapping ($0.0\,\text{V} - 5.0\,\text{V}$).
- **USART:** Serial transmission and reception with baud rate simulation and line buffer listeners.
- **Intel HEX Loader:** Pure TypeScript decoder supporting record types 00, 01, 02, and 04 with checksum verification.
- **Sample Sketches:** Verified pre-compiled standard sketches (Blink, Serial, Push Button, Analog PWM, Traffic Light).

## Usage Example

```typescript
import { AvrRunner, SKETCH_BLINK, PinState } from '@roboforge/sim-avr';

const runner = new AvrRunner({ frequencyHz: 16000000 });
runner.loadHex(SKETCH_BLINK.hex);

runner.onPinChange((pin, state) => {
  if (pin === 13) {
    console.log(`LED Pin 13 is now ${state === PinState.High ? 'ON' : 'OFF'}`);
  }
});

// Run for 1,000,000 clock cycles (~62.5ms of real execution)
runner.runForCycles(1000000);
```

## License

Apache-2.0. Third-party engine `avr8js` is licensed under MIT.
