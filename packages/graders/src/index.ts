import type { QuizItem } from '@roboforge/content-schema';

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
