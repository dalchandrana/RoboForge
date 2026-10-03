import { describe, it, expect } from 'vitest';
import { gradeNumeric, gradeQuizItem } from './index';

describe('packages/graders', () => {
  describe('gradeNumeric', () => {
    it('passes exact matches', () => {
      const res = gradeNumeric(3.0, 3.0, 0.01, 'mA');
      expect(res.passed).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it('passes within tolerance', () => {
      const res = gradeNumeric(3.008, 3.0, 0.01, 'mA');
      expect(res.passed).toBe(true);
    });

    it('identifies near misses with partial credit feedback', () => {
      const res = gradeNumeric(3.015, 3.0, 0.01, 'mA');
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0.5);
      expect(res.feedback).toContain('Very close');
    });

    it('rejects values far off from target', () => {
      const res = gradeNumeric(10.0, 3.0, 0.01, 'mA');
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
      expect(res.feedback).toContain('Not quite yet');
    });

    it('handles malformed NaN inputs gracefully', () => {
      const res = gradeNumeric(NaN, 3.0, 0.01, 'mA');
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('valid numeric');
    });
  });

  describe('gradeQuizItem', () => {
    it('grades single choice questions', () => {
      const item = {
        type: 'single' as const,
        prompt: 'Which is correct?',
        choices: [
          { text: 'Wrong', correct: false },
          { text: 'Right', correct: true },
        ],
        explanation: 'Because it is right.',
      };
      expect(gradeQuizItem(item, 1).passed).toBe(true);
      expect(gradeQuizItem(item, 0).passed).toBe(false);
    });

    it('grades numeric questions and appends explanation', () => {
      const item = {
        type: 'numeric' as const,
        prompt: 'Compute current',
        unit: 'mA',
        answer: 5,
        tolerance: 0.1,
        explanation: 'I = V/R.',
      };
      const res = gradeQuizItem(item, 5.0);
      expect(res.passed).toBe(true);
      expect(res.feedback).toContain('I = V/R.');
    });

    it('grades multi choice questions', () => {
      const item = {
        type: 'multi' as const,
        prompt: 'Select safe options',
        choices: [
          { text: 'AA Battery', correct: true },
          { text: '9V Battery', correct: true },
          { text: 'Wall Outlet', correct: false },
        ],
        explanation: 'Batteries are safe low-voltage.',
      };
      // Correct multi
      expect(gradeQuizItem(item, [0, 1]).passed).toBe(true);
      // Incomplete multi
      expect(gradeQuizItem(item, [0]).passed).toBe(false);
      // Invalid format
      expect(gradeQuizItem(item, 'not-an-array').passed).toBe(false);
    });

    it('grades order questions', () => {
      const item = {
        type: 'order' as const,
        prompt: 'Order the steps',
        items: ['First', 'Second', 'Third'],
        correctOrder: [0, 1, 2],
        explanation: 'Sequence follows execution.',
      };
      expect(gradeQuizItem(item, [0, 1, 2]).passed).toBe(true);
      expect(gradeQuizItem(item, [2, 1, 0]).passed).toBe(false);
      expect(gradeQuizItem(item, null).passed).toBe(false);
    });
  });
});
