import type { QuizItem } from '@roboforge/content-schema';
import { solveCircuit, type CircuitNetlist } from '@roboforge/sim-circuit';

export interface GradingResult {
  passed: boolean;
  score: number; // 0.0 to 1.0
  feedback: string;
  expected?: string | number;
  actual?: string | number;
}

/**
 * Pure numeric grader supporting tolerance bounds.
 * Feedback is encouraging, specific, and actionable.
 */
export function gradeNumeric(
  attempt: number,
  target: number,
  tolerance: number,
  unit = '',
): GradingResult {
  if (typeof attempt !== 'number' || isNaN(attempt)) {
    return {
      passed: false,
      score: 0,
      feedback: 'Please enter a valid numeric value.',
      expected: `${target}${unit ? ` ${unit}` : ''}`,
      actual: 'NaN',
    };
  }

  const delta = Math.abs(attempt - target);
  const passed = delta <= tolerance;

  if (passed) {
    return {
      passed: true,
      score: 1.0,
      feedback: `Spot on! ${attempt}${unit ? ` ${unit}` : ''} is within acceptable precision.`,
      expected: target,
      actual: attempt,
    };
  }

  // Near miss check (within 2x tolerance or 10% off)
  const isNearMiss = delta <= Math.max(tolerance * 2, Math.abs(target) * 0.1);
  if (isNearMiss) {
    return {
      passed: false,
      score: 0.5,
      feedback: `Very close! Check your rounding or calculations. You gave ${attempt}${unit ? ` ${unit}` : ''}.`,
      expected: target,
      actual: attempt,
    };
  }

  return {
    passed: false,
    score: 0,
    feedback: `Not quite yet. Double check the formula and units. (Given: ${attempt}${unit ? ` ${unit}` : ''})`,
    expected: target,
    actual: attempt,
  };
}

/**
 * Pure grader for single/multi/numeric/order quiz items.
 */
export function gradeQuizItem(item: QuizItem, userResponse: unknown): GradingResult {
  switch (item.type) {
    case 'numeric': {
      const num = typeof userResponse === 'number' ? userResponse : Number(userResponse);
      const res = gradeNumeric(num, item.answer, item.tolerance, item.unit);
      return {
        ...res,
        feedback: res.passed ? `${res.feedback} ${item.explanation}` : res.feedback,
      };
    }

    case 'single': {
      const selectedIndex = Number(userResponse);
      const correctChoiceIndex = item.choices.findIndex(c => c.correct);
      const passed = selectedIndex === correctChoiceIndex;
      return {
        passed,
        score: passed ? 1.0 : 0.0,
        feedback: passed
          ? `Correct! ${item.explanation}`
          : `That wasn't the right choice. Take another look: ${item.explanation}`,
        expected: correctChoiceIndex,
        actual: selectedIndex,
      };
    }

    case 'multi': {
      if (!Array.isArray(userResponse)) {
        return {
          passed: false,
          score: 0,
          feedback: 'Select all options that apply.',
        };
      }
      const selectedIndices = new Set(userResponse.map(Number));
      const correctIndices = new Set(
        item.choices.map((c, i) => (c.correct ? i : -1)).filter(i => i >= 0),
      );

      const isExact =
        selectedIndices.size === correctIndices.size &&
        [...selectedIndices].every(i => correctIndices.has(i));

      return {
        passed: isExact,
        score: isExact ? 1.0 : 0.0,
        feedback: isExact
          ? `Well done! ${item.explanation}`
          : `Review the selected choices. ${item.explanation}`,
      };
    }

    case 'order': {
      if (!Array.isArray(userResponse)) {
        return { passed: false, score: 0, feedback: 'Arrange all items in the correct order.' };
      }
      const isCorrect =
        userResponse.length === item.correctOrder.length &&
        userResponse.every((val, idx) => Number(val) === item.correctOrder[idx]);

      return {
        passed: isCorrect,
        score: isCorrect ? 1.0 : 0.0,
        feedback: isCorrect
          ? `Perfect sequence! ${item.explanation}`
          : `Order is not quite right. ${item.explanation}`,
      };
    }
  }
}

export interface CircuitAssertion {
  target: 'node_voltage' | 'component_current' | 'component_status' | 'switch_state';
  id: string; // node name or component id
  expectedValue: number | string | boolean;
  tolerance?: number;
  explanation: string;
}

/**
 * Auto-grades a circuit's simulated physical state against challenge criteria.
 */
export function gradeCircuitState(
  netlist: CircuitNetlist,
  assertion: CircuitAssertion,
): GradingResult {
  const result = solveCircuit(netlist);

  if (!result.success) {
    return {
      passed: false,
      score: 0,
      feedback:
        'Circuit cannot be solved: ' +
        (result.ercIssues[0]?.message || 'severe short circuit detected.'),
    };
  }

  switch (assertion.target) {
    case 'node_voltage': {
      const v = result.nodeVoltages[assertion.id];
      if (v === undefined) {
        return {
          passed: false,
          score: 0,
          feedback: `Node "${assertion.id}" was not found in the circuit.`,
        };
      }
      const expected = Number(assertion.expectedValue);
      const tol = assertion.tolerance ?? 0.1;
      const numGrading = gradeNumeric(v, expected, tol, 'V');
      return {
        ...numGrading,
        feedback: numGrading.passed
          ? `${numGrading.feedback} ${assertion.explanation}`
          : numGrading.feedback,
      };
    }

    case 'component_current': {
      const state = result.componentStates[assertion.id];
      if (!state) {
        return {
          passed: false,
          score: 0,
          feedback: `Component "${assertion.id}" was not found or has no current flow.`,
        };
      }
      const expected = Number(assertion.expectedValue);
      const tol = assertion.tolerance ?? 0.5;
      const numGrading = gradeNumeric(state.current_mA, expected, tol, 'mA');
      return {
        ...numGrading,
        feedback: numGrading.passed
          ? `${numGrading.feedback} ${assertion.explanation}`
          : numGrading.feedback,
      };
    }

    case 'component_status': {
      const state = result.componentStates[assertion.id];
      const actualStatus = state?.status ?? 'unpowered';
      const passed = actualStatus === assertion.expectedValue;
      return {
        passed,
        score: passed ? 1.0 : 0.0,
        feedback: passed
          ? `Correct! ${assertion.explanation}`
          : `Component status is "${actualStatus}", expected "${assertion.expectedValue}". ${assertion.explanation}`,
        expected: String(assertion.expectedValue),
        actual: actualStatus,
      };
    }

    case 'switch_state': {
      const comp = netlist.components.find(c => c.id === assertion.id);
      const isClosed = Boolean(comp?.properties.closed);
      const expectedClosed =
        assertion.expectedValue === 'closed' || assertion.expectedValue === true;
      const passed = isClosed === expectedClosed;
      return {
        passed,
        score: passed ? 1.0 : 0.0,
        feedback: passed
          ? `Switch position is correct! ${assertion.explanation}`
          : `Switch is currently ${isClosed ? 'closed' : 'open'}, please toggle it.`,
        expected: expectedClosed ? 'closed' : 'open',
        actual: isClosed ? 'closed' : 'open',
      };
    }
  }
}
