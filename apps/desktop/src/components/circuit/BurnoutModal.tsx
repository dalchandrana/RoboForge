import React from 'react';
import { Modal, Button, Callout } from '@roboforge/ui';

interface BurnoutModalProps {
  isOpen: boolean;
  componentLabel: string;
  current_mA: number;
  maxCurrent_mA: number;
  onDismiss: () => void;
  onFixWithResistor: () => void;
}

export const BurnoutModal: React.FC<BurnoutModalProps> = ({
  isOpen,
  componentLabel,
  current_mA,
  maxCurrent_mA,
  onDismiss,
  onFixWithResistor,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onDismiss} title="⚠️ Component Burnout Warning">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <span className="text-3xl" role="img" aria-label="Smoke puff">
            💨💥
          </span>
          <div>
            <div className="font-bold text-sm text-red-300">
              {componentLabel} was destroyed by excessive current!
            </div>
            <div className="text-xs text-red-200/80 font-mono mt-0.5">
              Measured current: {current_mA.toFixed(1)} mA (Absolute Maximum: {maxCurrent_mA} mA)
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-text-muted leading-relaxed">
          <p>
            <strong className="text-text-main">What happened?</strong> Unlike incandescent bulbs or
            heating coils, light-emitting diodes (LEDs) are semiconductors with very little internal
            resistance once their forward conduction voltage (around 2.0V) is exceeded.
          </p>
          <p>
            When connected directly across a 5V or 9V battery with no series resistor, Ohm&apos;s
            law ($I = \Delta V / R$) dictates that an uncontrolled burst of hundreds of milliamps
            surges through the delicate microscopic bond wire, melting it instantly!
          </p>
        </div>

        <Callout type="safety" title="Real-World Hardware Safety Rule">
          In real hardware experiments, connecting an unresisted LED or short-circuiting a battery
          can make components blisteringly hot within seconds, causing burns or damaging battery
          cells. Always calculate and insert a current-limiting resistor before connecting power.
        </Callout>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onDismiss}>
            Dismiss & Keep Broken
          </Button>
          <Button variant="primary" onClick={onFixWithResistor}>
            Insert 330Ω Limiting Resistor
          </Button>
        </div>
      </div>
    </Modal>
  );
};
