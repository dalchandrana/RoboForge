import { describe, it, expect } from 'vitest';
import {
  validateLessonFrontmatter,
  validateQuiz,
  validateExercise,
  validateModule,
  validatePath,
  validateComponent,
} from './index';

describe('packages/content-schema', () => {
  it('validates a correct lesson frontmatter', () => {
    const valid = {
      id: 'm01-l01-what-is-electricity',
      title: 'What is electricity?',
      path: 'electronics-embedded-foundations',
      module: 'm01-electricity-basics',
      order: 1,
      level: 'beginner',
      minutes: 15,
      prerequisites: [],
      objectives: ['Explain charge and current', 'Understand water analogy limits'],
      keyIdeas: ['Electricity is the flow of electric charge.'],
      tags: ['electricity', 'basics'],
      glossary: ['charge', 'current'],
      needsHumanVerification: false,
      verified: true,
      sources: [{ title: 'Physics reference', url: 'https://example.com' }],
      license: 'CC-BY-SA-4.0',
      authors: ['rudrarana'],
      locale: 'en',
    };

    const parsed = validateLessonFrontmatter(valid);
    expect(parsed.id).toBe('m01-l01-what-is-electricity');
    expect(parsed.objectives).toHaveLength(2);
  });

  it('rejects invalid lesson frontmatter missing objectives', () => {
    const invalid = {
      id: 'invalid-lesson',
      title: 'Bad Lesson',
      path: 'path',
      module: 'mod',
      order: 1,
      level: 'beginner',
      minutes: 10,
      objectives: [], // invalid: requires min 1
      keyIdeas: ['Idea'],
      authors: ['me'],
    };
    expect(() => validateLessonFrontmatter(invalid)).toThrow();
  });

  it('validates numeric and single choice quiz items', () => {
    const quiz = {
      id: 'q-m01-l01',
      items: [
        {
          type: 'numeric',
          prompt: 'Calculate current for 9V and 3k ohm',
          unit: 'mA',
          answer: 3,
          tolerance: 0.01,
          explanation: 'I = 9 / 3000 = 3mA',
        },
        {
          type: 'single',
          prompt: 'What flows in an electric circuit?',
          choices: [
            { text: 'Charge', correct: true },
            { text: 'Pure heat', correct: false },
          ],
          explanation: 'Electric current is the movement of electric charge carriers.',
        },
      ],
    };
    const parsed = validateQuiz(quiz);
    expect(parsed.items).toHaveLength(2);
  });

  it('validates exercise with 3 staged hints', () => {
    const exercise = {
      id: 'ex-led',
      type: 'circuit-state',
      prompt: 'Make the LED glow safely',
      hints: ['Check current limit', 'Use series resistor', 'Use R = (V - Vf)/I'],
      explanation: 'Resistor limits current to prevent burning out the LED.',
      assert: [{ part: 'LED1', current_mA: { min: 5, max: 20 } }],
    };
    const parsed = validateExercise(exercise);
    expect(parsed.hints).toHaveLength(3);
  });

  it('enforces at least 3 staged hints for exercises', () => {
    const badExercise = {
      id: 'ex-bad',
      type: 'numeric',
      prompt: 'Calculate R',
      hints: ['Only one hint'],
      explanation: 'Explanation',
    };
    expect(() => validateExercise(badExercise)).toThrow();
  });

  it('validates module and path schemas', () => {
    const mod = validateModule({
      id: 'm01-basics',
      title: 'Basics',
      description: 'Intro to electricity',
      order: 1,
      lessons: ['l01'],
    });
    expect(mod.order).toBe(1);

    const path = validatePath({
      id: 'foundations',
      title: 'Foundations',
      description: 'Robotics track',
      modules: ['m01-basics'],
    });
    expect(path.modules[0]).toBe('m01-basics');
  });

  it('validates a component library item', () => {
    const comp = {
      id: 'resistor-axial',
      name: 'Resistor (1/4W)',
      category: 'passive',
      package: 'Axial Through-Hole',
      description: 'Standard current-limiting resistor',
      symbol: 'R',
      pinout: [
        { pin: 1, name: 'Lead 1', function: 'passive', description: 'Terminal 1' },
        { pin: 2, name: 'Lead 2', function: 'passive', description: 'Terminal 2' },
      ],
      absoluteMaxRatings: {
        power_mW: 250,
        voltage_V: 250,
      },
      commonMistakes: ['Exceeding power rating leading to charred resistor'],
      cheatSheetMarkdown: "## Resistor Cheat Sheet\nUse Ohm's Law V = I * R.",
    };
    const parsed = validateComponent(comp);
    expect(parsed.id).toBe('resistor-axial');
    expect(parsed.pinout).toHaveLength(2);
  });
});
