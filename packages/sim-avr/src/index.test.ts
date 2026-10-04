import { describe, it, expect, vi } from 'vitest';
import {
  AvrRunner,
  parseIntelHex,
  PinState,
  SKETCH_BLINK,
  SKETCH_SERIAL,
  SKETCH_BUTTON,
  SKETCH_ANALOG_PWM,
  SKETCH_TRAFFIC_LIGHT,
  SAMPLE_SKETCHES,
} from './index';

describe('Intel HEX Loader', () => {
  it('parses valid Intel HEX records into memory buffer', () => {
    // 4 bytes: [0x25, 0x9A, 0x2D, 0x9A] at address 0x0000
    // Checksum: ~(04 + 00 + 00 + 00 + 25 + 9A + 2D + 9A) + 1 = ~(0x018A) + 1 = 0x76
    const hex = ':04000000259A2D9A76\n:00000001FF\n';
    const buffer = parseIntelHex(hex, 1024);

    expect(buffer[0]).toBe(0x25);
    expect(buffer[1]).toBe(0x9a);
    expect(buffer[2]).toBe(0x2d);
    expect(buffer[3]).toBe(0x9a);
    expect(buffer[4]).toBe(0x00);
  });

  it('rejects records with invalid checksums', () => {
    const corruptHex = ':04000000259A2D9A00\n:00000001FF\n';
    const buffer = parseIntelHex(corruptHex, 1024);

    // Buffer should remain zero because corrupted line was skipped
    expect(buffer[0]).toBe(0x00);
    expect(buffer[1]).toBe(0x00);
  });

  it('handles extended linear address record (type 04)', () => {
    const extHex = ':020000040001F9\n:02000400AABB95\n:00000001FF\n';
    const buffer = parseIntelHex(extHex, 70000);

    // 0x0001 << 16 + 0x0004 = 0x10004 = 65540
    expect(buffer[65540]).toBe(0xaa);
    expect(buffer[65541]).toBe(0xbb);
  });

  it('safely ignores empty or malformed non-colon lines', () => {
    const malformed = 'Not a hex line\n::short\n:02000000AABB99\n';
    const buffer = parseIntelHex(malformed, 1024);
    expect(buffer[0]).toBe(0xaa);
    expect(buffer[1]).toBe(0xbb);
  });
});

describe('AvrRunner Hardware Emulation', () => {
  it('initializes ATmega328P CPU and peripherals with default clock', () => {
    const runner = new AvrRunner();
    expect(runner.frequencyHz).toBe(16000000);
    expect(runner.progBytes.length).toBe(32768);

    const status = runner.getStatus();
    expect(status.pc).toBe(0);
    expect(status.cycles).toBe(0);
    expect(status.uptimeMs).toBe(0);
  });

  it('executes Blink sketch and toggles Arduino Pin 13', () => {
    const runner = new AvrRunner();
    runner.loadHex(SKETCH_BLINK.hex);

    const pin13States: PinState[] = [];
    runner.onPinChange((pin, state) => {
      if (pin === 13) {
        pin13States.push(state);
      }
    });

    // Run 3000 clock cycles
    runner.runForCycles(3000);

    expect(pin13States.length).toBeGreaterThanOrEqual(2);
    expect(pin13States).toContain(PinState.High);
    expect(pin13States).toContain(PinState.Low);
    expect(runner.getPin(13)).toBeDefined();
  });

  it('executes Serial sketch and transmits greeting text over USART', () => {
    const runner = new AvrRunner();
    runner.loadHex(SKETCH_SERIAL.hex);

    let transmittedText = '';
    const linesReceived: string[] = [];

    runner.onSerialByte(byte => {
      transmittedText += String.fromCharCode(byte);
    });

    runner.onSerialLine(line => {
      linesReceived.push(line);
    });

    // Run instructions to transmit greeting at 9600 baud
    runner.runForCycles(500000);

    expect(transmittedText).toContain('RoboForge Uno ready!');
    expect(linesReceived).toContain('RoboForge Uno ready!');
  });

  it('reads digital button input and updates Pin 13 LED output', () => {
    const runner = new AvrRunner();
    runner.loadHex(SKETCH_BUTTON.hex);

    // Initial state: button not pressed (Pin 2 is High due to pullup)
    runner.setPin(2, PinState.High);
    runner.runForCycles(50);
    expect(runner.getPin(13)).toBe(PinState.Low);

    // Simulate button press (Pin 2 goes Low / connected to GND)
    runner.setPin(2, PinState.Low);
    runner.runForCycles(50);
    expect(runner.getPin(13)).toBe(PinState.High);

    // Release button (Pin 2 goes High)
    runner.setPin(2, PinState.High);
    runner.runForCycles(50);
    expect(runner.getPin(13)).toBe(PinState.Low);
  });

  it('reads analog voltages on ADC channels and enforces clamp bounds', () => {
    const runner = new AvrRunner();

    // Default voltage is 0V
    expect(runner.getAnalogVoltage(0)).toBe(0);

    // Set 2.5V on A0
    runner.setAnalogVoltage(0, 2.5);
    expect(runner.getAnalogVoltage(0)).toBe(2.5);

    // Clamp over 5V
    runner.setAnalogVoltage(1, 9.0);
    expect(runner.getAnalogVoltage(1)).toBe(5.0);

    // Clamp negative voltage
    runner.setAnalogVoltage(2, -1.5);
    expect(runner.getAnalogVoltage(2)).toBe(0.0);
  });

  it('supports unregistering pin and serial listeners', () => {
    const runner = new AvrRunner();
    const pinSpy = vi.fn();
    const byteSpy = vi.fn();
    const lineSpy = vi.fn();

    const unsubPin = runner.onPinChange(pinSpy);
    const unsubByte = runner.onSerialByte(byteSpy);
    const unsubLine = runner.onSerialLine(lineSpy);

    // Unsubscribe all
    unsubPin();
    unsubByte();
    unsubLine();

    runner.loadHex(SKETCH_BLINK.hex);
    runner.runForCycles(100);

    expect(pinSpy).not.toHaveBeenCalled();
    expect(byteSpy).not.toHaveBeenCalled();
    expect(lineSpy).not.toHaveBeenCalled();
  });

  it('supports sending serial input bytes and strings into the receiver', () => {
    const runner = new AvrRunner();
    expect(() => {
      runner.sendSerialByte(65); // 'A'
      runner.sendSerialString('Test');
    }).not.toThrow();
  });

  it('resets CPU and clears line buffer', () => {
    const runner = new AvrRunner();
    runner.loadHex(SKETCH_BLINK.hex);
    runner.runForCycles(500);

    expect(runner.getStatus().cycles).toBeGreaterThan(0);

    runner.reset();
    expect(runner.getStatus().pc).toBe(0);
    expect(runner.getStatus().cycles).toBe(0);
  });

  it('exports valid starter sample sketch presets', () => {
    expect(SAMPLE_SKETCHES.length).toBe(5);
    for (const sketch of SAMPLE_SKETCHES) {
      expect(sketch.id).toBeDefined();
      expect(sketch.title).toBeDefined();
      expect(sketch.code).toContain('void setup()');
      expect(sketch.hex).toContain(':');
    }

    expect(SKETCH_ANALOG_PWM.category).toBe('analog');
    expect(SKETCH_TRAFFIC_LIGHT.category).toBe('robotics');
  });
});
