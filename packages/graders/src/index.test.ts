import { describe, it, expect } from 'vitest';
import { gradeNumeric, gradeQuizItem, gradeCircuitState } from './index';
import type { CircuitNetlist } from '@roboforge/sim-circuit';

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

  describe('gradeCircuitState', () => {
    const testNetlist: CircuitNetlist = {
      id: 'c-test-grader',
      title: 'Grader Test Circuit',
      version: 1,
      groundNodeId: '0',
      components: [
        {
          id: 'V1',
          type: 'battery',
          position: { x: 0, y: 0 },
          rotation: 0,
          properties: { voltage_V: 9 },
          pins: [
            { id: 'p1', name: '+', nodeId: 'VCC' },
            { id: 'p2', name: '-', nodeId: '0' },
          ],
        },
        {
          id: 'SW1',
          type: 'switch',
          position: { x: 50, y: 0 },
          rotation: 0,
          properties: { closed: true },
          pins: [
            { id: 'p1', name: '1', nodeId: 'VCC' },
            { id: 'p2', name: '2', nodeId: 'SW_OUT' },
          ],
        },
        {
          id: 'R1',
          type: 'resistor',
          position: { x: 100, y: 0 },
          rotation: 0,
          properties: { resistance_Ohm: 350 },
          pins: [
            { id: 'p1', name: '1', nodeId: 'SW_OUT' },
            { id: 'p2', name: '2', nodeId: 'LED_A' },
          ],
        },
        {
          id: 'LED1',
          type: 'led',
          position: { x: 150, y: 0 },
          rotation: 0,
          properties: { forwardVoltage_V: 2.0, maxCurrent_mA: 25 },
          pins: [
            { id: 'p1', name: 'Anode', nodeId: 'LED_A' },
            { id: 'p2', name: 'Cathode', nodeId: '0' },
          ],
        },
      ],
    };

    it('grades node voltage correctly', () => {
      const res = gradeCircuitState(testNetlist, {
        target: 'node_voltage',
        id: 'VCC',
        expectedValue: 9.0,
        tolerance: 0.1,
        explanation: 'VCC should be 9V.',
      });
      expect(res.passed).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it('fails when node does not exist', () => {
      const res = gradeCircuitState(testNetlist, {
        target: 'node_voltage',
        id: 'NON_EXISTENT',
        expectedValue: 5.0,
        explanation: 'Should fail gracefully.',
      });
      expect(res.passed).toBe(false);
      expect(res.feedback).toContain('was not found');
    });

    it('grades component current correctly', () => {
      const res = gradeCircuitState(testNetlist, {
        target: 'component_current',
        id: 'R1',
        expectedValue: 19.1,
        tolerance: 2.0,
        explanation: 'Current should be around 19mA.',
      });
      expect(res.passed).toBe(true);
    });

    it('grades component status correctly', () => {
      const res = gradeCircuitState(testNetlist, {
        target: 'component_status',
        id: 'LED1',
        expectedValue: 'ok',
        explanation: 'LED is safely lit.',
      });
      expect(res.passed).toBe(true);
    });

    it('grades switch state correctly', () => {
      const res = gradeCircuitState(testNetlist, {
        target: 'switch_state',
        id: 'SW1',
        expectedValue: 'closed',
        explanation: 'Switch is on.',
      });
      expect(res.passed).toBe(true);

      const resOpen = gradeCircuitState(testNetlist, {
        target: 'switch_state',
        id: 'SW1',
        expectedValue: 'open',
        explanation: 'Switch should be off.',
      });
      expect(resOpen.passed).toBe(false);
    });
  });
});
