/**
 * AvrRunner: Complete ATmega328P emulator running avr8js with GPIO, Timers, ADC, and USART.
 */

import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRADC,
  adcConfig,
  AVRUSART,
  usart0Config,
  PinState as AvrPinState,
} from 'avr8js';
import { parseIntelHex } from './hex-loader';
import {
  PinState,
  type ArduinoPin,
  type DigitalPin,
  type AnalogPin,
  type AvrRunnerConfig,
  type AvrCpuState,
  type PinListener,
  type SerialListener,
} from './types';

export class AvrRunner {
  public readonly cpu: CPU;
  public readonly progMem: Uint16Array;
  public readonly progBytes: Uint8Array;
  public readonly frequencyHz: number;

  public readonly portB: AVRIOPort;
  public readonly portC: AVRIOPort;
  public readonly portD: AVRIOPort;

  public readonly timer0: AVRTimer;
  public readonly timer1: AVRTimer;
  public readonly timer2: AVRTimer;

  public readonly adc: AVRADC;
  public readonly usart: AVRUSART;

  private pinListeners: PinListener[] = [];
  private serialByteListeners: SerialListener[] = [];
  private serialLineListeners: ((line: string) => void)[] = [];
  private serialLineBuffer: string = '';

  private isRunning: boolean = false;

  constructor(config: AvrRunnerConfig = {}) {
    this.frequencyHz = config.frequencyHz ?? 16000000;
    const flashBytes = config.flashBytes ?? 32768;
    const sramBytes = config.sramBytes ?? 2048;

    // Flash memory allocated as 16-bit word array
    this.progMem = new Uint16Array(flashBytes / 2);
    this.progBytes = new Uint8Array(this.progMem.buffer);

    this.cpu = new CPU(this.progMem, sramBytes);

    // GPIO Ports
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    // Timers
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);

    // Analog to Digital Converter
    this.adc = new AVRADC(this.cpu, adcConfig);

    // USART Serial Port
    this.usart = new AVRUSART(this.cpu, usart0Config, this.frequencyHz);

    this.setupListeners();
  }

  private setupListeners(): void {
    // Port B: Digital pins 8 to 13 (Bit 5 = Pin 13 LED)
    this.portB.addListener(portState => {
      for (let bit = 0; bit <= 5; bit++) {
        const pin = (8 + bit) as DigitalPin;
        const isHigh = (portState & (1 << bit)) !== 0;
        const state = isHigh ? PinState.High : PinState.Low;
        this.notifyPinChange(pin, state);
      }
    });

    // Port C: Analog pins A0 to A5
    this.portC.addListener(portState => {
      const analogLabels: AnalogPin[] = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
      for (let bit = 0; bit <= 5; bit++) {
        const pin = analogLabels[bit];
        if (pin) {
          const isHigh = (portState & (1 << bit)) !== 0;
          const state = isHigh ? PinState.High : PinState.Low;
          this.notifyPinChange(pin, state);
        }
      }
    });

    // Port D: Digital pins 0 to 7
    this.portD.addListener(portState => {
      for (let bit = 0; bit <= 7; bit++) {
        const pin = bit as DigitalPin;
        const isHigh = (portState & (1 << bit)) !== 0;
        const state = isHigh ? PinState.High : PinState.Low;
        this.notifyPinChange(pin, state);
      }
    });

    // USART Serial Transmit
    this.usart.onByteTransmit = byte => {
      for (const listener of this.serialByteListeners) {
        listener(byte);
      }

      const char = String.fromCharCode(byte);
      if (char === '\n') {
        for (const lineListener of this.serialLineListeners) {
          lineListener(this.serialLineBuffer);
        }
        this.serialLineBuffer = '';
      } else if (char !== '\r') {
        this.serialLineBuffer += char;
      }
    };
  }

  private notifyPinChange(pin: ArduinoPin, state: PinState): void {
    for (const listener of this.pinListeners) {
      listener(pin, state);
    }
  }

  /**
   * Loads an Intel HEX formatted string into Flash memory and resets the CPU.
   */
  public loadHex(hexString: string): void {
    const bytes = parseIntelHex(hexString, this.progBytes.length);
    this.progBytes.set(bytes);
    this.reset();
  }

  /**
   * Resets the CPU program counter, stack pointer, and peripheral states.
   */
  public reset(): void {
    this.cpu.reset();
    this.cpu.cycles = 0;
    this.timer0.reset();
    this.timer1.reset();
    this.timer2.reset();
    this.usart.reset();
    this.serialLineBuffer = '';
  }

  /**
   * Executes a single AVR instruction and ticks CPU peripheral events.
   */
  public step(): void {
    avrInstruction(this.cpu);
    this.cpu.tick();
  }

  /**
   * Executes CPU instructions for a given number of clock cycles.
   *
   * @param cycles Target clock cycles to run
   * @returns Actual cycles executed
   */
  public runForCycles(cycles: number): number {
    const targetCycles = this.cpu.cycles + cycles;
    while (this.cpu.cycles < targetCycles) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }
    return this.cpu.cycles;
  }

  /**
   * Simulates real-time duration in milliseconds.
   *
   * @param ms Milliseconds of microcontroller execution
   */
  public runForMs(ms: number): number {
    const cycles = Math.floor((this.frequencyHz / 1000) * ms);
    return this.runForCycles(cycles);
  }

  /**
   * Sets the external digital input state of an Arduino pin (e.g. from a push button).
   */
  public setPin(pin: ArduinoPin, state: PinState): void {
    const isHigh = state === PinState.High;

    if (typeof pin === 'number') {
      if (pin >= 0 && pin <= 7) {
        this.portD.setPin(pin, isHigh);
      } else if (pin >= 8 && pin <= 13) {
        this.portB.setPin(pin - 8, isHigh);
      }
    } else {
      const index = parseInt(pin.substring(1), 10);
      if (index >= 0 && index <= 5) {
        this.portC.setPin(index, isHigh);
      }
    }
  }

  /**
   * Gets current output state of an Arduino pin.
   */
  public getPin(pin: ArduinoPin): PinState {
    let pinVal = 0;
    if (typeof pin === 'number') {
      if (pin >= 0 && pin <= 7) {
        pinVal = this.portD.pinState(pin);
      } else if (pin >= 8 && pin <= 13) {
        pinVal = this.portB.pinState(pin - 8);
      }
    } else {
      const index = parseInt(pin.substring(1), 10);
      if (index >= 0 && index <= 5) {
        pinVal = this.portC.pinState(index);
      }
    }

    return pinVal === AvrPinState.High ? PinState.High : PinState.Low;
  }

  /**
   * Sets the analog input voltage on an ADC channel (A0 to A5).
   *
   * @param channel Channel index (0 to 5 for A0 to A5)
   * @param volts Voltage between 0.0V and 5.0V
   */
  public setAnalogVoltage(channel: number, volts: number): void {
    if (channel >= 0 && channel < this.adc.channelValues.length) {
      this.adc.channelValues[channel] = Math.max(0, Math.min(5.0, volts));
    }
  }

  /**
   * Gets current analog voltage configured on an ADC channel.
   */
  public getAnalogVoltage(channel: number): number {
    return this.adc.channelValues[channel] ?? 0;
  }

  /**
   * Sends a byte into the Arduino's USART receiver (readable via Serial.read()).
   */
  public sendSerialByte(byte: number): void {
    this.usart.writeByte(byte & 0xff);
  }

  /**
   * Sends a text string into the Arduino's USART receiver.
   */
  public sendSerialString(text: string): void {
    for (let i = 0; i < text.length; i++) {
      this.sendSerialByte(text.charCodeAt(i));
    }
  }

  /**
   * Adds a listener for pin state changes.
   */
  public onPinChange(listener: PinListener): () => void {
    this.pinListeners.push(listener);
    return () => {
      this.pinListeners = this.pinListeners.filter(l => l !== listener);
    };
  }

  /**
   * Adds a listener for raw serial output bytes.
   */
  public onSerialByte(listener: SerialListener): () => void {
    this.serialByteListeners.push(listener);
    return () => {
      this.serialByteListeners = this.serialByteListeners.filter(l => l !== listener);
    };
  }

  /**
   * Adds a listener for complete lines of serial output.
   */
  public onSerialLine(listener: (line: string) => void): () => void {
    this.serialLineListeners.push(listener);
    return () => {
      this.serialLineListeners = this.serialLineListeners.filter(l => l !== listener);
    };
  }

  /**
   * Returns current CPU execution snapshot.
   */
  public getStatus(): AvrCpuState {
    return {
      pc: this.cpu.pc,
      cycles: this.cpu.cycles,
      sp: this.cpu.SP,
      sreg: this.cpu.SREG,
      uptimeMs: Math.floor((this.cpu.cycles / this.frequencyHz) * 1000),
      running: this.isRunning,
    };
  }
}
