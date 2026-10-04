import { describe, it, expect } from 'vitest';
import { computeStreak, evaluateBadges, buildFlashcards, toDayString, BADGES } from './motivation';

describe('computeStreak', () => {
  it('returns zero for no activity', () => {
    const s = computeStreak([], '2026-10-10');
    expect(s.current).toBe(0);
    expect(s.activeToday).toBe(false);
  });

  it('counts consecutive days including today', () => {
    const s = computeStreak(['2026-10-08', '2026-10-09', '2026-10-10'], '2026-10-10');
    expect(s.current).toBe(3);
    expect(s.activeToday).toBe(true);
  });

  it('does not break the streak when today is still empty', () => {
    const s = computeStreak(['2026-10-08', '2026-10-09'], '2026-10-10');
    expect(s.current).toBe(2);
    expect(s.activeToday).toBe(false);
  });

  it('bridges a single missed day with a freeze', () => {
    const s = computeStreak(['2026-10-07', '2026-10-09', '2026-10-10'], '2026-10-10');
    expect(s.current).toBe(3);
    expect(s.freezesUsed).toBe(1);
    expect(s.freezesRemaining).toBe(1);
  });

  it('ends the streak after a two-day gap', () => {
    const s = computeStreak(['2026-10-05', '2026-10-09', '2026-10-10'], '2026-10-10');
    expect(s.current).toBe(2);
  });

  it('respects the freeze allowance', () => {
    const days = ['2026-10-04', '2026-10-06', '2026-10-08', '2026-10-10'];
    expect(computeStreak(days, '2026-10-10', 2).current).toBe(3);
    expect(computeStreak(days, '2026-10-10', 0).current).toBe(1);
  });

  it('tracks the longest streak and ignores duplicates', () => {
    const s = computeStreak(
      ['2026-10-01', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-09'],
      '2026-10-10',
    );
    expect(s.longest).toBe(3);
    expect(s.current).toBe(1);
  });
});

describe('toDayString', () => {
  it('formats local dates with zero padding', () => {
    expect(toDayString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('evaluateBadges', () => {
  const moduleLessons = {
    'm01-electricity-basics': ['a', 'b'],
    'm02-discrete-circuits': ['c'],
    'm04-motion-and-actuators': ['d'],
  };
  const base = {
    completedLessons: new Set<string>(),
    moduleLessons,
    ranArduinoSimulation: false,
    completedProjects: new Set<string>(),
  };

  it('awards nothing initially', () => {
    expect(evaluateBadges(base)).toEqual([]);
  });

  it('awards module badges only when every lesson is complete', () => {
    expect(evaluateBadges({ ...base, completedLessons: new Set(['a']) })).toEqual([]);
    expect(evaluateBadges({ ...base, completedLessons: new Set(['a', 'b']) })).toEqual([
      'circuit-starter',
    ]);
  });

  it('awards simulation and project badges', () => {
    const got = evaluateBadges({
      ...base,
      ranArduinoSimulation: true,
      completedProjects: new Set(['p4-ultrasonic-obstacle-avoider']),
    });
    expect(got).toEqual(['code-blinker', 'first-robot']);
  });

  it('only returns known badge ids', () => {
    const ids = BADGES.map(b => b.id);
    const got = evaluateBadges({
      completedLessons: new Set(['a', 'b', 'c', 'd']),
      moduleLessons,
      ranArduinoSimulation: true,
      completedProjects: new Set(['p3-autonomous-line-follower']),
    });
    expect(got.every(g => ids.includes(g))).toBe(true);
    expect(got).toHaveLength(5);
  });
});

describe('buildFlashcards', () => {
  const lessons = [
    { id: 'l1', title: 'One', keyIdeas: ['x', 'y'] },
    { id: 'l2', title: 'Two', keyIdeas: ['z'] },
  ];
  it('builds cards only from completed lessons', () => {
    const cards = buildFlashcards(lessons, new Set(['l1']));
    expect(cards.map(c => c.answer)).toEqual(['x', 'y']);
    expect(cards[0]?.id).toBe('l1#0');
  });
  it('returns empty when nothing is completed', () => {
    expect(buildFlashcards(lessons, new Set())).toEqual([]);
  });
});

describe('StorageService motivation persistence', () => {
  it('awards badges once and round-trips through export/import', async () => {
    const { StorageService } = await import('./index');
    const a = new StorageService();
    await a.recordActivity('2026-10-09');
    await a.setMilestone('ran-arduino-sim');
    expect(await a.awardBadge('code-blinker')).toBe(true);
    expect(await a.awardBadge('code-blinker')).toBe(false);

    const bundle = await a.exportBundle();
    const b = new StorageService();
    await b.importBundle(bundle);
    expect(await b.getActiveDays()).toEqual(['2026-10-09']);
    expect((await b.getBadges()).map(x => x.id)).toEqual(['code-blinker']);
    expect(await b.getMilestones()).toEqual(['ran-arduino-sim']);

    await b.resetAll();
    expect(await b.getBadges()).toEqual([]);
  });
});
