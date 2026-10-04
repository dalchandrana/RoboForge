import React from 'react';
import { PinState } from '@roboforge/sim-avr';

interface ArduinoBoardViewProps {
  pinStates: Record<string, PinState>;
  txActive: boolean;
  rxActive: boolean;
  isPowered: boolean;
  potVoltage: number;
  onPotChange: (voltage: number) => void;
  buttonPressed: boolean;
  onButtonChange: (pressed: boolean) => void;
}

export const ArduinoBoardView: React.FC<ArduinoBoardViewProps> = ({
  pinStates,
  txActive,
  rxActive,
  isPowered,
  potVoltage,
  onPotChange,
  buttonPressed,
  onButtonChange,
}) => {
  const isPin13High = pinStates['13'] === PinState.High;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Arduino Uno PCB Layout */}
      <div className="relative w-full max-w-[620px] aspect-[1.48/1] bg-[#00878F] rounded-2xl shadow-2xl border-4 border-[#006f75] p-6 text-white font-mono select-none overflow-hidden">
        {/* Subtle PCB Trace Texture Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* USB Type B Connector */}
        <div className="absolute -top-1 left-8 w-16 h-12 bg-slate-300 rounded-b-md border-2 border-slate-400 shadow-md flex items-center justify-center">
          <div className="w-8 h-6 bg-slate-800 rounded-sm border border-slate-600 flex items-center justify-center">
            <span className="text-[8px] text-slate-400">USB</span>
          </div>
        </div>

        {/* DC Barrel Power Jack */}
        <div className="absolute -bottom-1 left-8 w-20 h-14 bg-slate-800 rounded-t-md border-2 border-slate-700 shadow-md flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {}}
          className="absolute top-4 left-32 w-7 h-7 bg-red-600 hover:bg-red-500 active:scale-95 rounded-full border-2 border-slate-800 shadow flex items-center justify-center text-[8px] font-bold text-white transition-transform"
          title="Hardware Reset"
        >
          RST
        </button>

        {/* 16 MHz Quartz Crystal */}
        <div className="absolute top-16 left-32 w-12 h-6 bg-slate-300 rounded-md border border-slate-400 shadow-inner flex items-center justify-center text-[8px] font-bold text-slate-700">
          16.000
        </div>

        {/* Top Digital Header Sockets (Pins 0 to 13, GND, AREF) */}
        <div className="absolute top-3 right-6 flex items-start gap-1 bg-slate-950 p-1.5 rounded-b-lg border-x border-b border-slate-800 shadow-md">
          {/* Header row 1: AREF, GND, 13..8 */}
          {['AREF', 'GND', '13', '12', '~11', '~10', '~9', '8'].map(label => {
            const rawPin = label.replace('~', '');
            const isHigh = pinStates[rawPin] === PinState.High;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-slate-400 font-semibold">{label}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-sm border ${
                    isHigh
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : 'bg-slate-900 border-slate-700'
                  } transition-colors`}
                  title={`Pin ${label}`}
                />
              </div>
            );
          })}
          <div className="w-2" />
          {/* Header row 2: 7..0 */}
          {['7', '~6', '~5', '4', '~3', '2', 'TX>1', 'RX<0'].map(label => {
            const rawPin = label.replace(/[~><]/g, '').replace('TX', '').replace('RX', '');
            const isHigh = pinStates[rawPin] === PinState.High;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-slate-400 font-semibold">{label}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-sm border ${
                    isHigh
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : 'bg-slate-900 border-slate-700'
                  } transition-colors`}
                  title={`Pin ${label}`}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Analog & Power Header Sockets */}
        <div className="absolute bottom-3 right-6 flex items-end gap-1 bg-slate-950 p-1.5 rounded-t-lg border-x border-t border-slate-800 shadow-md">
          {/* Power Header */}
          {['IOREF', 'RST', '3.3V', '5V', 'GND', 'GND', 'VIN'].map(label => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-900 border border-slate-700" />
              <span className="text-[8px] text-slate-400 font-semibold">{label}</span>
            </div>
          ))}
          <div className="w-4" />
          {/* Analog In Header: A0..A5 */}
          {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map(label => {
            const isA0 = label === 'A0';
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-sm border ${
                    isA0 && potVoltage > 0.1
                      ? 'bg-sky-400 border-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                  title={`${label}: ${isA0 ? potVoltage.toFixed(2) + 'V' : '0.0V'}`}
                />
                <span className="text-[8px] text-slate-400 font-semibold">{label}</span>
              </div>
            );
          })}
        </div>

        {/* ATmega328P DIP-28 IC Chip */}
        <div className="absolute bottom-16 right-36 w-44 h-16 bg-slate-900 rounded-md border-2 border-slate-800 shadow-xl flex items-center justify-between px-3">
          {/* Notch on left */}
          <div className="w-2.5 h-5 bg-[#00878F] rounded-r-full -ml-3 border border-slate-700" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-200 tracking-wider">ATMEGA328P-PU</p>
            <p className="text-[9px] text-slate-400">ATMEL 16MHz AVR</p>
          </div>
          <div className="w-2" />
        </div>

        {/* Arduino Branding */}
        <div className="absolute top-16 left-52">
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span className="text-amber-300">⚡</span> ARDUINO{' '}
            <span className="text-sky-300 text-sm font-normal">UNO</span>
          </h3>
          <p className="text-[9px] text-teal-100 tracking-widest font-semibold uppercase mt-0.5">
            RoboForge Virtual Twin
          </p>
        </div>

        {/* Status Indicator LEDs */}
        <div className="absolute top-28 left-52 bg-slate-950/70 p-2.5 rounded-xl border border-teal-700/50 flex items-center gap-4">
          {/* ON (Power LED) */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full border ${
                isPowered
                  ? 'bg-green-400 border-green-300 shadow-[0_0_10px_rgba(74,222,128,1)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-[8px] text-slate-300 font-bold">ON</span>
          </div>

          {/* L (Pin 13 LED) */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full border transition-all duration-75 ${
                isPin13High
                  ? 'bg-amber-400 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,1)] scale-110'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-[8px] text-slate-300 font-bold">L (13)</span>
          </div>

          {/* TX LED */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full border ${
                txActive
                  ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,1)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-[8px] text-slate-300 font-bold">TX</span>
          </div>

          {/* RX LED */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full border ${
                rxActive
                  ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_rgba(250,204,21,1)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
            <span className="text-[8px] text-slate-300 font-bold">RX</span>
          </div>
        </div>
      </div>

      {/* Virtual Interactive Peripherals Bar */}
      <div className="w-full max-w-[620px] grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-subtle border border-border-subtle p-4 rounded-2xl">
        {/* Tactile Push Button (connected to Pin 2) */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-subtle">
          <div>
            <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <span>🔘</span> Tactile Switch (Pin 2)
            </p>
            <p className="text-[11px] text-text-muted">Active-Low button with internal pull-up</p>
          </div>
          <button
            type="button"
            onMouseDown={() => onButtonChange(true)}
            onMouseUp={() => onButtonChange(false)}
            onTouchStart={() => onButtonChange(true)}
            onTouchEnd={() => onButtonChange(false)}
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${
              buttonPressed
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 scale-95 shadow-inner'
                : 'bg-slate-800 text-text-main hover:bg-slate-700 border border-slate-600'
            }`}
          >
            {buttonPressed ? 'PRESSED' : 'PRESS'}
          </button>
        </div>

        {/* Potentiometer (connected to A0) */}
        <div className="flex flex-col justify-between p-3 bg-surface rounded-xl border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <span>🎛️</span> Potentiometer (A0)
            </p>
            <span className="text-xs font-mono font-bold text-sky-400">
              {potVoltage.toFixed(2)} V ({Math.round((potVoltage / 5.0) * 1023)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.05"
            value={potVoltage}
            onChange={e => onPotChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>
    </div>
  );
};
