import React, { useState } from 'react';
import { Card, Button, Callout, Badge } from '@roboforge/ui';
import { t } from '@roboforge/i18n';
import { gradeQuizItem } from '@roboforge/graders';
import type { Quiz, QuizItem } from '@roboforge/content-schema';
import bundleData from '../content-bundle.json';

interface LearnViewProps {
  isCompleted: boolean;
  onToggleComplete: (lessonId: string, completed: boolean) => Promise<void>;
  onAskCoach: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  isCompleted,
  onToggleComplete,
  onAskCoach,
}) => {
  const lesson = bundleData.lessons['m01-l01-what-is-electricity'];
  const quiz = lesson?.quiz as Quiz | undefined;

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, unknown>>({});
  const [quizResults, setQuizResults] = useState<
    Record<number, { passed: boolean; feedback: string }>
  >({});
  const [numericInputs, setNumericInputs] = useState<Record<number, string>>({});
  const [revealOpen, setRevealOpen] = useState(false);

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">No lesson loaded</h2>
        <p className="text-text-muted mt-2">Please run pnpm content:build to generate bundle.</p>
      </div>
    );
  }

  const handleCheckQuizItem = (idx: number, item: QuizItem) => {
    let answer = selectedAnswers[idx];
    if (item.type === 'numeric') {
      answer = parseFloat(numericInputs[idx] || '');
    }
    const result = gradeQuizItem(item, answer);
    setQuizResults(prev => ({
      ...prev,
      [idx]: { passed: result.passed, feedback: result.feedback },
    }));
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <header className="space-y-3 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Electronics & Embedded Foundations</span>
          <span>/</span>
          <span>Module 1: Electricity Basics</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">{lesson.frontmatter.title}</h1>
          {isCompleted && <Badge variant="success">✓ Completed</Badge>}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>⏱️ {lesson.frontmatter.minutes} minutes</span>
          <span>📊 Level: {lesson.frontmatter.level}</span>
          <span>🪪 License: {lesson.frontmatter.license}</span>
        </div>
      </header>

      {/* Objectives */}
      <section aria-labelledby="objectives-heading">
        <Card variant="subtle" className="border-sky-500/30">
          <h2
            id="objectives-heading"
            className="text-sm font-bold uppercase tracking-wider text-sky-400 mb-2"
          >
            🎯 {t('lesson.objectives')}
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {lesson.frontmatter.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Lesson Body Content */}
      <div className="space-y-6 text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-white pt-2">1. Hook</h2>
        <p>
          Have you ever felt a tiny shock when touching a metal doorknob in winter? That sudden snap
          is static electricity jumping through the dry air. Electricity powers everything around us
          — from a tiny digital watch to an autonomous rover traversing Mars!
        </p>

        <Callout type="safety" title="Safe Lab Practice">
          In RoboForge, every hands-on circuit uses low-voltage DC batteries (under 12 volts). Never
          experiment with household wall sockets or mains power. Wall outlets carry lethal voltages!
        </Callout>

        <h2 className="text-2xl font-bold text-white pt-4">2. The Core Idea: What is Charge?</h2>
        <p>
          All matter around you is made of tiny atoms. Atoms contain positively charged protons and
          negatively charged electrons. When electrons are pushed along a conductor like a copper
          wire, they form an <strong>electric current</strong>.
        </p>
        <p>Think of electric current like water moving through a closed circular garden hose:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>Water particles</strong> are like electric charge carriers.
          </li>
          <li>
            <strong>The water pump</strong> acts like a battery pushing the charges.
          </li>
          <li>
            <strong>The hose</strong> is the conductive copper wire.
          </li>
        </ul>

        <Callout type="info" title="Where the Water Analogy Breaks">
          Water can spill out into the open air from a cut hose. Electric current cannot spill onto
          your desk! Charges will only flow if there is a complete, unbroken closed loop back to the
          battery.
        </Callout>

        <h2 className="text-2xl font-bold text-white pt-4">3. See It: A Closed Circuit</h2>
        <p>To light up a small bulb or an LED, charges must travel in a complete circuit loop:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4 bg-slate-900/60 p-4 rounded-xl border border-border-subtle font-mono text-sm">
          <li>Electrons leave the negative terminal of the battery.</li>
          <li>They travel through the connecting conductive wire.</li>
          <li>They pass through the light bulb filament, making it glow.</li>
          <li>They return to the positive terminal of the battery.</li>
        </ol>
        <p>If the wire is disconnected at any point, the electric current ceases instantly.</p>

        <h2 className="text-2xl font-bold text-white pt-4">4. Try It Out (Prediction)</h2>
        <p>
          Imagine you have a battery, two wires, and an LED bulb. What happens if you suddenly snip
          one wire with cutters? Make your prediction first:
        </p>
        <div className="bg-slate-900/40 border border-border-subtle rounded-xl p-4 space-y-3">
          <p className="font-semibold text-sm">
            Will the light stay on for a moment, or turn off immediately?
          </p>
          <Button size="sm" variant="outline" onClick={() => setRevealOpen(!revealOpen)}>
            {revealOpen ? 'Hide Explanation' : '👁️ Reveal Explanation'}
          </Button>
          {revealOpen && (
            <div className="p-3 bg-slate-800/80 rounded-lg text-sm text-sky-200 mt-2">
              It turns off instantly! At low voltages, electrons cannot jump across air gaps. The
              circuit must form an unbroken closed loop.
            </div>
          )}
        </div>

        {/* Quiz Section */}
        {quiz && (
          <section
            className="pt-8 border-t border-border-subtle space-y-6"
            aria-labelledby="quiz-heading"
          >
            <div className="flex items-center justify-between">
              <h2 id="quiz-heading" className="text-2xl font-bold">
                📝 {t('lesson.quizTitle')}
              </h2>
              <Badge variant="primary">{quiz.items.length} Questions</Badge>
            </div>

            <div className="space-y-6">
              {quiz.items.map((rawItem, idx) => {
                const item = rawItem as QuizItem;
                const res = quizResults[idx];
                return (
                  <Card key={idx} variant="surface" className="space-y-4">
                    <p className="font-semibold text-base">
                      {idx + 1}. {item.prompt}
                    </p>

                    {/* Single choice rendering */}
                    {item.type === 'single' && (
                      <div className="space-y-2">
                        {item.choices.map((choice, cIdx) => (
                          <label
                            key={cIdx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-subtle cursor-pointer text-sm"
                          >
                            <input
                              type="radio"
                              name={`quiz-${idx}`}
                              checked={selectedAnswers[idx] === cIdx}
                              onChange={() =>
                                setSelectedAnswers(prev => ({ ...prev, [idx]: cIdx }))
                              }
                              className="w-4 h-4 text-sky-500"
                            />
                            <span>{choice.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Multi choice rendering */}
                    {item.type === 'multi' && (
                      <div className="space-y-2">
                        {item.choices.map((choice, cIdx) => {
                          const currentArr = (selectedAnswers[idx] as number[]) || [];
                          const isChecked = currentArr.includes(cIdx);
                          return (
                            <label
                              key={cIdx}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:bg-surface-subtle cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  const next = e.target.checked
                                    ? [...currentArr, cIdx]
                                    : currentArr.filter(i => i !== cIdx);
                                  setSelectedAnswers(prev => ({ ...prev, [idx]: next }));
                                }}
                                className="w-4 h-4 text-sky-500 rounded"
                              />
                              <span>{choice.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Numeric item rendering */}
                    {item.type === 'numeric' && (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder="Your answer"
                          value={numericInputs[idx] || ''}
                          onChange={e =>
                            setNumericInputs(prev => ({ ...prev, [idx]: e.target.value }))
                          }
                          className="px-3 py-2 bg-slate-900 border border-border-strong rounded-lg text-sm w-40"
                        />
                        <span className="text-sm font-bold text-text-muted">{item.unit}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCheckQuizItem(idx, item)}
                      >
                        {t('lesson.submitAnswer')}
                      </Button>
                      {res && (
                        <span
                          className={`text-sm font-semibold ${
                            res.passed ? 'text-green-400' : 'text-amber-400'
                          }`}
                        >
                          {res.passed ? '✓ Correct' : '✗ Try again'}
                        </span>
                      )}
                    </div>

                    {res && (
                      <div
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          res.passed
                            ? 'bg-green-950/40 text-green-200 border border-green-800'
                            : 'bg-amber-950/40 text-amber-200 border border-amber-800'
                        }`}
                      >
                        {res.feedback}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Key Ideas Recap */}
        <section className="pt-6" aria-labelledby="key-ideas-heading">
          <Card variant="subtle" className="border-sky-500/20">
            <h2
              id="key-ideas-heading"
              className="text-sm font-bold uppercase tracking-wider text-sky-400 mb-2"
            >
              💡 {t('lesson.keyIdeas')}
            </h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {lesson.frontmatter.keyIdeas.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      {/* Lesson Footer */}
      <footer className="pt-8 border-t border-border-strong flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <Button
            variant={isCompleted ? 'secondary' : 'primary'}
            onClick={() => onToggleComplete(lesson.frontmatter.id, !isCompleted)}
            id="mark-complete-btn"
          >
            {isCompleted ? '✓ ' + t('lesson.completed') : t('lesson.markComplete')}
          </Button>
          <Button variant="outline" onClick={onAskCoach}>
            🤖 {t('lesson.imConfused')}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            alert('Issue report template: [Content Error] in ' + lesson.frontmatter.id)
          }
        >
          🚩 {t('lesson.reportError')}
        </Button>
      </footer>
    </article>
  );
};
