/**
 * Pure motivation logic: non-punitive streaks, skill badges, review flashcards.
 * No I/O here so everything is trivially testable.
 */

export interface StreakResult {
  /** Consecutive active days; days bridged by freezes keep the streak alive but are not counted. */
  current: number;
  /** Longest streak found in the history. */
  longest: number;
  /** Freezes used to bridge single missed days in the current streak. */
  freezesUsed: number;
  /** Freezes still available. */
  freezesRemaining: number;
  /** True when today already has activity. */
  activeToday: boolean;
}

export const DEFAULT_FREEZE_ALLOWANCE = 2;

const DAY_MS = 86_400_000;

/** Parse a YYYY-MM-DD string to a UTC day number. */
function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) / DAY_MS);
}

/** Format a Date as a local YYYY-MM-DD string. */
export function toDayString(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/**
 * Compute a streak. A single missed day is bridged by a "freeze" (up to the
 * allowance); two or more missed days in a row end the streak. Missing today
 * never breaks the streak: the learner still has until the end of today.
 */
export function computeStreak(
  activeDays: string[],
  today: string,
  freezeAllowance = DEFAULT_FREEZE_ALLOWANCE,
): StreakResult {
  const days = Array.from(new Set(activeDays.map(dayNumber))).sort((a, b) => a - b);
  const todayN = dayNumber(today);
  const daySet = new Set(days);
  const activeToday = daySet.has(todayN);

  // Longest streak without freezes (plain consecutive days).
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of days) {
    run = prev !== null && d - prev === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }

  // Current streak: walk back from today (or yesterday if today is empty).
  let cursor = activeToday ? todayN : todayN - 1;
  let current = 0;
  let freezesUsed = 0;
  while (cursor >= (days[0] ?? cursor + 1)) {
    if (daySet.has(cursor)) {
      current += 1;
      cursor -= 1;
    } else if (
      freezesUsed < freezeAllowance &&
      daySet.has(cursor - 1) // only bridge a single-day gap
    ) {
      freezesUsed += 1;
      cursor -= 1;
    } else {
      break;
    }
  }
  return {
    current,
    longest: Math.max(longest, current),
    freezesUsed,
    freezesRemaining: Math.max(0, freezeAllowance - freezesUsed),
    activeToday,
  };
}

export interface BadgeDefinition {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'circuit-starter',
    icon: '⚡',
    title: 'Circuit Starter',
    description: 'Completed Module 1: Electricity Basics.',
  },
  {
    id: 'component-master',
    icon: '💡',
    title: 'Component Master',
    description: 'Completed Module 2: Components.',
  },
  {
    id: 'code-blinker',
    icon: '💻',
    title: 'Code Blinker',
    description: 'Ran your first Arduino simulation.',
  },
  {
    id: 'motion-maker',
    icon: '⚙️',
    title: 'Motion Maker',
    description: 'Completed Module 4: Motion & Actuators.',
  },
  {
    id: 'first-robot',
    icon: '🤖',
    title: 'First Robot',
    description: 'Completed the Line Follower or Obstacle Car project.',
  },
];

export interface BadgeContext {
  completedLessons: ReadonlySet<string>;
  /** Module id -> lesson ids in that module. */
  moduleLessons: Readonly<Record<string, readonly string[]>>;
  ranArduinoSimulation: boolean;
  completedProjects: ReadonlySet<string>;
}

function moduleDone(ctx: BadgeContext, moduleId: string): boolean {
  const lessons = ctx.moduleLessons[moduleId];
  return !!lessons && lessons.length > 0 && lessons.every(l => ctx.completedLessons.has(l));
}

/** Returns the ids of every badge the learner currently qualifies for. */
export function evaluateBadges(ctx: BadgeContext): string[] {
  const earned: string[] = [];
  if (moduleDone(ctx, 'm01-electricity-basics')) earned.push('circuit-starter');
  if (moduleDone(ctx, 'm02-discrete-circuits')) earned.push('component-master');
  if (ctx.ranArduinoSimulation) earned.push('code-blinker');
  if (moduleDone(ctx, 'm04-motion-and-actuators')) earned.push('motion-maker');
  if (
    ctx.completedProjects.has('p3-autonomous-line-follower') ||
    ctx.completedProjects.has('p4-ultrasonic-obstacle-avoider')
  ) {
    earned.push('first-robot');
  }
  return earned;
}

export interface Flashcard {
  id: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  answer: string;
}

export interface FlashcardSource {
  id: string;
  title: string;
  keyIdeas: readonly string[];
}

/** Build review cards from the keyIdeas of completed lessons only. */
export function buildFlashcards(
  lessons: readonly FlashcardSource[],
  completed: ReadonlySet<string>,
): Flashcard[] {
  const cards: Flashcard[] = [];
  for (const lesson of lessons) {
    if (!completed.has(lesson.id)) continue;
    lesson.keyIdeas.forEach((idea, i) => {
      cards.push({
        id: `${lesson.id}#${i}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        prompt: `Recall a key idea from "${lesson.title}"`,
        answer: idea,
      });
    });
  }
  return cards;
}
