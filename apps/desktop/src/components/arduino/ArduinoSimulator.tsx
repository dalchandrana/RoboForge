import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AvrRunner,
  SKETCH_BLINK,
  PinState,
  type SketchPreset,
  type AvrCpuState,
  type ArduinoPin,
} from '@roboforge/sim-avr';
import { ArduinoBoardView } from './ArduinoBoardView';
import { ArduinoCodeEditor } from './ArduinoCodeEditor';
import { SerialMonitor } from './SerialMonitor';

interface ArduinoSimulatorProps {
  /** Called once the simulation starts executing instructions. */
  onSimulationRan?: () => void;
}

export const ArduinoSimulator: React.FC<ArduinoSimulatorProps> = ({ onSimulationRan }) => {
  const [currentSketch, setCurrentSketch] = useState<SketchPreset>(SKETCH_BLINK);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [potVoltage, setPotVoltage] = useState<number>(2.5);
  const [buttonPressed, setButtonPressed] = useState<boolean>(false);

  const [pinStates, setPinStates] = useState<Record<string, PinState>>({});
  const [serialLines, setSerialLines] = useState<string[]>([]);
  const [txActive, setTxActive] = useState<boolean>(false);
  const [rxActive, setRxActive] = useState<boolean>(false);

  const runnerRef = useRef<AvrRunner | null>(null);
  const txTimeoutRef = useRef<number | null>(null);
  const rxTimeoutRef = useRef<number | null>(null);

  // Initialize runner once
  if (!runnerRef.current) {
    runnerRef.current = new AvrRunner({ frequencyHz: 16000000 });
  }
  const runner = runnerRef.current;

  const [cpuState, setCpuState] = useState<AvrCpuState>(() => runner.getStatus());

  // Load sketch whenever currentSketch changes
  useEffect(() => {
    runner.loadHex(currentSketch.hex);
    setPinStates({});
    setSerialLines([]);
    setCpuState(runner.getStatus());
  }, [currentSketch, runner]);

  // Set up pin and serial listeners
  useEffect(() => {
    const unsubPin = runner.onPinChange((pin: ArduinoPin, state: PinState) => {
      setPinStates(prev => ({
        ...prev,
        [pin.toString()]: state,
      }));
    });

    const unsubByte = runner.onSerialByte(() => {
      setTxActive(true);
      if (txTimeoutRef.current) window.clearTimeout(txTimeoutRef.current);
      txTimeoutRef.current = window.setTimeout(() => setTxActive(false), 120);
    });

    const unsubLine = runner.onSerialLine((line: string) => {
      setSerialLines(prev => [...prev.slice(-100), line]);
    });

    return () => {
      unsubPin();
      unsubByte();
      unsubLine();
      if (txTimeoutRef.current) window.clearTimeout(txTimeoutRef.current);
      if (rxTimeoutRef.current) window.clearTimeout(rxTimeoutRef.current);
    };
  }, [runner]);

  // Update analog input on potentiometer change
  const handlePotChange = useCallback(
    (volts: number) => {
      setPotVoltage(volts);
      runner.setAnalogVoltage(0, volts);
    },
    [runner],
  );

  // Update button pin state on press/release (active low on Pin 2)
  const handleButtonChange = useCallback(
    (pressed: boolean) => {
      setButtonPressed(pressed);
      runner.setPin(2, pressed ? PinState.Low : PinState.High);
    },
    [runner],
  );

  // Send message over serial
  const handleSendMessage = useCallback(
    (msg: string) => {
      setRxActive(true);
      if (rxTimeoutRef.current) window.clearTimeout(rxTimeoutRef.current);
      rxTimeoutRef.current = window.setTimeout(() => setRxActive(false), 120);

      runner.sendSerialString(msg);
    },
    [runner],
  );

  const handleReset = useCallback(() => {
    runner.reset();
    setPinStates({});
    setSerialLines([]);
    setCpuState(runner.getStatus());
  }, [runner]);

  // Main simulation animation loop
  useEffect(() => {
    if (!isRunning) return;
    onSimulationRan?.();

    let animId: number;
    // ~50,000 cycles per frame gives ~3,000,000 cycles/sec at 60fps (smooth interactive simulation)
    const baseCyclesPerFrame = 50000;

    const tick = () => {
      const targetCycles = Math.round(baseCyclesPerFrame * speed);
      runner.runForCycles(targetCycles);
      setCpuState(runner.getStatus());
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, speed, runner, onSimulationRan]);

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🤖</span> Arduino AVR Microcontroller Simulator
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Real-time ATmega328P instruction emulation (16 MHz) with virtual GPIO, Timers, ADC, and
            Serial Monitor.
          </p>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Arduino Board & Peripherals Canvas (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <ArduinoBoardView
            pinStates={pinStates}
            txActive={txActive}
            rxActive={rxActive}
            isPowered={isRunning}
            potVoltage={potVoltage}
            onPotChange={handlePotChange}
            buttonPressed={buttonPressed}
            onButtonChange={handleButtonChange}
          />
        </div>

        {/* Right Column: Code Editor & Serial Monitor (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
          <ArduinoCodeEditor
            currentSketch={currentSketch}
            onSelectSketch={setCurrentSketch}
            cpuState={cpuState}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          <SerialMonitor
            lines={serialLines}
            onSendMessage={handleSendMessage}
            onClear={() => setSerialLines([])}
            baudRate={9600}
            onBaudRateChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
