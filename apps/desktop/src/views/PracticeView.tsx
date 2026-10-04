import React, { useEffect, useMemo, useState } from 'react';
import {
  BADGES,
  buildFlashcards,
  computeStreak,
  evaluateBadges,
  toDayString,
  type StorageService,
} from '@roboforge/storage';
import bundleData from '../content-bundle.json';

interface BundleShape {
  modules: Record<string, { lessons: string[] }>;
  lessons: Record<string, { frontmatter: { id: string; title: string; keyIdeas: string[] } }>;
}
const bundle = bundleData as unknown as BundleShape;

const MODULE_LESSONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(bundle.modules).map(([id, m]) => [id, m.lessons]),
);
const LESSON_SOURCES = Object.values(bundle.lessons).map(l => ({
  id: l.frontmatter.id,
  title: l.frontmatter.title,
  keyIdeas: l.frontmatter.keyIdeas,
}));

interface PracticeViewProps {
  storage: StorageService;
  completedLessons: ReadonlySet<string>;
  /** Bumped by the app when milestones change so this view refreshes. */
  refreshKey: number;
}

type Game = 'color' | 'pins' | 'logic';

/* ------------------------------ Mini-game 1 ------------------------------ */

const DIGIT_COLORS = [
  { name: 'Black', css: '#111827' },
  { name: 'Brown', css: '#92400e' },
  { name: 'Red', css: '#dc2626' },
  { name: 'Orange', css: '#f97316' },
  { name: 'Yellow', css: '#facc15' },
  { name: 'Green', css: '#16a34a' },
  { name: 'Blue', css: '#2563eb' },
  { name: 'Violet', css: '#7c3aed' },
  { name: 'Grey', css: '#9ca3af' },
  { name: 'White', css: '#f9fafb' },
];
const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

function formatOhms(v: number): string {
  if (v >= 1e6) return `${v / 1e6} MΩ`;
  if (v >= 1e3) return `${v / 1e3} kΩ`;
  return `${v} Ω`;
}

interface ColorQuestion {
  bands: number[]; // digit1, digit2, multiplier exponent
  answer: number;
  options: number[];
}

function makeColorQuestion(): ColorQuestion {
  const base = E12[Math.floor(Math.random() * E12.length)] ?? 10;
  const exp = Math.floor(Math.random() * 5); // 10 Ω .. 820 kΩ
  const answer = base * 10 ** exp;
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const b = E12[Math.floor(Math.random() * E12.length)] ?? 10;
    options.add(b * 10 ** Math.floor(Math.random() * 5));
  }
  return {
    bands: [Math.floor(base / 10), base % 10, exp],
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

const ColorGame: React.FC = () => {
  const ROUND_SECONDS = 60;
  const [q, setQ] = useState<ColorQuestion>(makeColorQuestion);
  const [secs, setSecs] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const restart = () => {
    setScore(0);
    setTries(0);
    setSecs(ROUND_SECONDS);
    setFeedback(null);
    setQ(makeColorQuestion());
    setRunning(true);
  };

  const pick = (value: number) => {
    if (!running) return;
    setTries(t => t + 1);
    if (value === q.answer) {
      setScore(s => s + 1);
      setFeedback('✅ Correct!');
    } else {
      setFeedback(`Not quite — it was ${formatOhms(q.answer)}. Keep going!`);
    }
    setQ(makeColorQuestion());
  };

  const bandColors = [
    DIGIT_COLORS[q.bands[0] ?? 0],
    DIGIT_COLORS[q.bands[1] ?? 0],
    DIGIT_COLORS[q.bands[2] ?? 0],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">
          Time left: <strong className="text-text-main">{secs}s</strong>
        </span>
        <span className="text-text-muted">
          Score: <strong className="text-text-main">{score}</strong> / {tries}
        </span>
      </div>
      <div
        role="img"
        aria-label={`Resistor with bands ${bandColors.map(c => c?.name).join(', ')}, then gold`}
        className="flex items-center justify-center py-6"
      >
        <div className="h-1 w-10 bg-slate-400" />
        <div className="flex h-14 w-56 items-center justify-around rounded-2xl bg-amber-200/80 px-6">
          {[...bandColors, { name: 'Gold', css: '#d4af37' }].map((c, i) => (
            <div key={i} className="h-full w-4" style={{ backgroundColor: c?.css }} />
          ))}
        </div>
        <div className="h-1 w-10 bg-slate-400" />
      </div>
      {running ? (
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              className="rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 font-mono text-sm font-bold hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {formatOhms(o)} ±5%
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <p className="text-text-main">
            Time&apos;s up! You got <strong>{score}</strong> right out of {tries}. Nice work — every
            round makes the colours stick.
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white"
          >
            Play again
          </button>
        </div>
      )}
      {feedback && running && (
        <p role="status" className="text-center text-xs text-text-muted">
          {feedback}
        </p>
      )}
    </div>
  );
};

/* ------------------------------ Mini-game 2 ------------------------------ */

const PIN_PAIRS = [
  { part: 'Dimmable LED (PWM)', pin: 'D9 (~)', hint: 'PWM pins are 3, 5, 6, 9, 10, 11.' },
  { part: 'Potentiometer wiper (ADC)', pin: 'A0', hint: 'Analog inputs are A0–A5.' },
  { part: 'I²C data line (SDA)', pin: 'A4', hint: 'On the Uno, SDA is A4 and SCL is A5.' },
  { part: 'UART transmit (TX)', pin: 'D1', hint: 'D0 is RX and D1 is TX.' },
];
const PIN_CHOICES = ['D9 (~)', 'A0', 'A4', 'D1', 'D2'];

const PinGame: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('Pick a part, then pick the pin it belongs on.');

  const choosePin = (pin: string) => {
    if (!selectedPart) {
      setMessage('Pick a part first.');
      return;
    }
    const pair = PIN_PAIRS.find(p => p.part === selectedPart);
    if (pair && pair.pin === pin) {
      setMatches(m => ({ ...m, [selectedPart]: pin }));
      setMessage(`✅ ${selectedPart} → ${pin}`);
      setSelectedPart(null);
    } else {
      setMessage(`Hint: ${pair?.hint ?? ''}`);
    }
  };

  const done = Object.keys(matches).length === PIN_PAIRS.length;

  return (
    <div className="space-y-4">
      <p role="status" className="text-sm text-text-muted">
        {done ? '🎉 All matched! You know your Uno pins.' : message}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Parts</h4>
          {PIN_PAIRS.map(p => (
            <button
              key={p.part}
              type="button"
              disabled={!!matches[p.part]}
              aria-pressed={selectedPart === p.part}
              onClick={() => setSelectedPart(p.part)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                matches[p.part]
                  ? 'border-emerald-600 bg-emerald-950/30 text-emerald-300'
                  : selectedPart === p.part
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-border-subtle bg-surface-subtle'
              }`}
            >
              {p.part} {matches[p.part] ? `→ ${matches[p.part]}` : ''}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Uno pins</h4>
          <div className="flex flex-wrap gap-2">
            {PIN_CHOICES.map(pin => (
              <button
                key={pin}
                type="button"
                onClick={() => choosePin(pin)}
                className="rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 font-mono text-sm font-bold hover:border-sky-500"
              >
                {pin}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setMatches({});
          setSelectedPart(null);
          setMessage('Pick a part, then pick the pin it belongs on.');
        }}
        className="text-xs text-sky-400 underline"
      >
        Reset
      </button>
    </div>
  );
};

/* ------------------------------ Mini-game 3 ------------------------------ */

type GateName = 'AND' | 'OR' | 'NOT' | 'XOR';
const GATES: Record<GateName, (a: boolean, b: boolean) => boolean> = {
  AND: (a, b) => a && b,
  OR: (a, b) => a || b,
  NOT: a => !a,
  XOR: (a, b) => a !== b,
};

const LogicGame: React.FC = () => {
  const [gate, setGate] = useState<GateName>('AND');
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const out = GATES[gate](a, b);
  const bit = (v: boolean) => (v ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a logic gate">
        {(Object.keys(GATES) as GateName[]).map(g => (
          <button
            key={g}
            type="button"
            aria-pressed={gate === g}
            onClick={() => setGate(g)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              gate === g ? 'bg-sky-500 text-white' : 'bg-surface-subtle text-text-muted'
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="space-y-2">
          <button
            type="button"
            aria-pressed={a}
            onClick={() => setA(v => !v)}
            className={`block w-20 rounded-lg px-3 py-2 text-sm font-bold ${a ? 'bg-emerald-600 text-white' : 'bg-surface-subtle'}`}
          >
            A = {bit(a)}
          </button>
          {gate !== 'NOT' && (
            <button
              type="button"
              aria-pressed={b}
              onClick={() => setB(v => !v)}
              className={`block w-20 rounded-lg px-3 py-2 text-sm font-bold ${b ? 'bg-emerald-600 text-white' : 'bg-surface-subtle'}`}
            >
              B = {bit(b)}
            </button>
          )}
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-subtle px-5 py-4 text-lg font-black">
          {gate}
        </div>
        <div
          role="status"
          aria-label={`Output is ${bit(out)}`}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-black ${
            out
              ? 'bg-amber-300 text-slate-900 shadow-[0_0_24px_rgba(252,211,77,0.7)]'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {bit(out)}
        </div>
      </div>
      <table className="mx-auto text-center text-xs">
        <thead>
          <tr className="text-text-muted">
            <th className="px-3">A</th>
            {gate !== 'NOT' && <th className="px-3">B</th>}
            <th className="px-3">Out</th>
          </tr>
        </thead>
        <tbody>
          {(gate === 'NOT'
            ? [[false], [true]]
            : [
                [false, false],
                [false, true],
                [true, false],
                [true, true],
              ]
          ).map(row => {
            const [ra, rb = false] = row as boolean[];
            const active = ra === a && (gate === 'NOT' || rb === b);
            return (
              <tr key={row.join()} className={active ? 'bg-sky-500/10 font-bold' : ''}>
                <td className="px-3">{bit(!!ra)}</td>
                {gate !== 'NOT' && <td className="px-3">{bit(rb)}</td>}
                <td className="px-3">{bit(GATES[gate](!!ra, rb))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-center text-xs text-text-muted">
        Challenge: find the input combination that turns the output on for {gate}.
      </p>
    </div>
  );
};

/* -------------------------------- Main view ------------------------------- */

export const PracticeView: React.FC<PracticeViewProps> = ({
  storage,
  completedLessons,
  refreshKey,
}) => {
  const [days, setDays] = useState<string[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [game, setGame] = useState<Game>('color');

  // Refresh persisted state and award any newly qualified badges.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const milestones = new Set(await storage.getMilestones());
      const completedProjects = new Set(
        Array.from(milestones)
          .filter(m => m.startsWith('project:'))
          .map(m => m.slice('project:'.length)),
      );
      const qualified = evaluateBadges({
        completedLessons,
        moduleLessons: MODULE_LESSONS,
        ranArduinoSimulation: milestones.has('ran-arduino-sim'),
        completedProjects,
      });
      for (const id of qualified) await storage.awardBadge(id);
      const [activeDays, badges] = await Promise.all([
        storage.getActiveDays(),
        storage.getBadges(),
      ]);
      if (!cancelled) {
        setDays(activeDays);
        setEarned(new Set(badges.map(b => b.id)));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [storage, completedLessons, refreshKey]);

  const streak = useMemo(() => computeStreak(days, toDayString(new Date())), [days]);
  const cards = useMemo(
    () => buildFlashcards(LESSON_SOURCES, completedLessons),
    [completedLessons],
  );
  const card = cards[cardIndex % Math.max(cards.length, 1)];

  const step = (delta: number) => {
    setRevealed(false);
    setCardIndex(i => (cards.length ? (i + delta + cards.length) % cards.length : 0));
  };

  const games: { id: Game; label: string }[] = [
    { id: 'color', label: '🎨 Resistor Colours' },
    { id: 'pins', label: '📍 Pin Matcher' },
    { id: 'logic', label: '🔀 Logic Gates' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          <span aria-hidden="true">🎯</span> Practice
        </h1>
        <p className="text-sm text-text-muted">
          Short, friendly practice. Streaks are forgiving, and everything stays on your device.
        </p>
      </header>

      {/* Streak + badges */}
      <section aria-label="Streak and badges" className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-surface p-5">
          <div className="text-4xl" aria-hidden="true">
            🔥
          </div>
          <div className="mt-1 text-3xl font-black text-text-main">
            {streak.current} <span className="text-sm font-medium text-text-muted">day streak</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Best: {streak.longest} · Freezes left: {streak.freezesRemaining}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {streak.activeToday
              ? "You've practised today — nice!"
              : 'Complete a lesson today to keep it going. A missed day is covered by a freeze.'}
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 md:col-span-2">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
            Badge shelf
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {BADGES.map(b => {
              const has = earned.has(b.id);
              return (
                <li
                  key={b.id}
                  title={b.description}
                  className={`rounded-xl border p-3 text-center ${
                    has
                      ? 'border-amber-400/60 bg-amber-400/10'
                      : 'border-border-subtle bg-surface-subtle opacity-60'
                  }`}
                >
                  <div className={`text-3xl ${has ? '' : 'grayscale'}`} aria-hidden="true">
                    {b.icon}
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-main">{b.title}</div>
                  <div className="text-[10px] text-text-muted">{has ? 'Earned' : 'Locked'}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Review cards */}
      <section
        aria-label="Review cards"
        className="rounded-2xl border border-border-subtle bg-surface p-6"
      >
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
          Review cards ({cards.length})
        </h2>
        {card ? (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              Card {(cardIndex % cards.length) + 1} of {cards.length}
            </p>
            <div className="min-h-[7rem] rounded-xl border border-border-subtle bg-surface-subtle p-5">
              <p className="font-semibold text-text-main">{card.prompt}</p>
              {revealed ? (
                <p className="mt-3 text-sky-300">{card.answer}</p>
              ) : (
                <p className="mt-3 text-xs italic text-text-muted">
                  Try to say it in your own words first, then reveal.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                className="rounded-lg bg-surface-subtle px-3 py-2 text-xs font-bold"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setRevealed(r => !r)}
                className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white"
              >
                {revealed ? 'Hide answer' : 'Reveal answer'}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="rounded-lg bg-surface-subtle px-3 py-2 text-xs font-bold"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Complete a lesson in the Learn tab and its key ideas will appear here as review cards.
          </p>
        )}
      </section>

      {/* Mini-games */}
      <section
        aria-label="Break-time mini-games"
        className="rounded-2xl border border-border-subtle bg-surface p-6"
      >
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-muted">
          Break-time mini-games
        </h2>
        <div className="mb-5 flex flex-wrap gap-2" role="tablist">
          {games.map(g => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={game === g.id}
              onClick={() => setGame(g.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${
                game === g.id ? 'bg-sky-500 text-white' : 'bg-surface-subtle text-text-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        {game === 'color' && <ColorGame />}
        {game === 'pins' && <PinGame />}
        {game === 'logic' && <LogicGame />}
      </section>
    </div>
  );
};
