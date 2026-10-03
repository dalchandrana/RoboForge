import React, { useState } from 'react';
import { Button, Callout } from '@roboforge/ui';
import { gradeCircuitState, type CircuitAssertion, type GradingResult } from '@roboforge/graders';
import { CircuitSimulator } from './CircuitSimulator';
import type { CircuitNetlist } from '@roboforge/sim-circuit';

interface InteractiveCircuitChallengeProps {
  title: string;
  instructions: string;
  initialPreset?: 'led_safe' | 'led_burnout' | 'vdivider';
  assertion: CircuitAssertion;
  onSuccess?: () => void;
}

export const InteractiveCircuitChallenge: React.FC<InteractiveCircuitChallengeProps> = ({
  title,
  instructions,
  initialPreset = 'led_safe',
  assertion,
  onSuccess,
}) => {
  const [currentNetlist, setCurrentNetlist] = useState<CircuitNetlist | null>(null);
  const [result, setResult] = useState<GradingResult | null>(null);

  const handleVerify = () => {
    // If the simulator hasn't emitted state yet, use default preset
    if (!currentNetlist) {
      // Evaluate preset default
      return;
    }

    const grade = gradeCircuitState(currentNetlist, assertion);
    setResult(grade);
    if (grade.passed && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 my-6 p-5 bg-surface border border-sky-500/30 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="text-base font-bold text-sky-400">{title}</h3>
        </div>
        <span className="text-xs font-mono uppercase bg-sky-500/10 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/20">
          Interactive Lab
        </span>
      </div>

      <p className="text-sm text-text-main leading-relaxed">{instructions}</p>

      {/* Embedded Circuit Simulator */}
      <div className="rounded-xl overflow-hidden border border-border-subtle">
        <CircuitSimulator
          initialPreset={initialPreset}
          embedded={true}
          onNetlistChange={setCurrentNetlist}
        />
      </div>

      {/* Challenge Check Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-text-muted">Goal: {assertion.explanation}</div>
        <Button variant="primary" size="sm" onClick={handleVerify}>
          ✓ Check Circuit State
        </Button>
      </div>

      {/* Grading Feedback */}
      {result && (
        <Callout
          type={result.passed ? 'tip' : 'warning'}
          title={result.passed ? 'Challenge Solved! 🎉' : 'Needs Adjustment'}
        >
          {result.feedback}
        </Callout>
      )}
    </div>
  );
};
