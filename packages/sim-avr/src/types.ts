/**
 * Types and interfaces for the RoboForge AVR / Arduino simulation engine.
 */

export enum PinState {
  Low = 0,
  High = 1,
  Input = 2,
  InputPullUp = 3,
}

export type DigitalPin = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type AnalogPin = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
export type ArduinoPin = DigitalPin | AnalogPin;

export interface AvrRunnerConfig {
  frequencyHz?: number; // Clock frequency (default 16MHz)
  sramBytes?: number; // SRAM size in bytes (default 2048 for ATmega328P)
  flashBytes?: number; // Flash memory size in bytes (default 32768)
}

export interface AvrCpuState {
  pc: number;
  cycles: number;
  sp: number;
  sreg: number;
  uptimeMs: number;
  running: boolean;
}

export type PinListener = (pin: ArduinoPin, state: PinState) => void;
export type SerialListener = (byte: number) => void;

export interface SketchPreset {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'digital' | 'analog' | 'serial' | 'robotics';
  code: string;
  hex: string;
}
