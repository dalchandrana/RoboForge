import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '@roboforge/ui';
import { t } from '@roboforge/i18n';
import { gradeQuizItem } from '@roboforge/graders';
import type { Quiz, QuizItem, LessonFrontmatter } from '@roboforge/content-schema';
import bundleData from '../content-bundle.json';
import { LessonMarkdownRenderer } from '../components/content/LessonMarkdownRenderer';

interface BundleModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: string[];
}

interface BundleLesson {
  frontmatter: LessonFrontmatter;
  rawMarkdown: string;
  quiz?: Quiz;
}

interface BundleData {
  modules: Record<string, BundleModule>;
  lessons: Record<string, BundleLesson>;
}

const typedBundle = bundleData as unknown as BundleData;

interface LearnViewProps {
  completedLessons: Set<string>;
  onToggleComplete: (lessonId: string, completed: boolean) => Promise<void>;
  onAskCoach: () => void;
  initialLessonId?: string;
}

export const LearnView: React.FC<LearnViewProps> = ({
  completedLessons,
  onToggleComplete,
  onAskCoach,
  initialLessonId = 'm01-l01-what-is-electricity',
}) => {
  const [currentLessonId, setCurrentLessonId] = useState<string>(initialLessonId);

  // Quiz state (scoped per lesson)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, unknown>>({});
  const [quizResults, setQuizResults] = useState<
    Record<number, { passed: boolean; feedback: string }>
  >({});
  const [numericInputs, setNumericInputs] = useState<Record<number, string>>({});

  // Flatten all lesson IDs across modules in order
  const moduleEntries = useMemo(() => {
    return Object.values(typedBundle.modules).sort((a, b) => a.order - b.order);
  }, []);

  const allLessonIds = useMemo(() => {
    return moduleEntries.flatMap(m => m.lessons);
  }, [moduleEntries]);

  const currentIndex = allLessonIds.indexOf(currentLessonId);
  const prevLessonId = currentIndex > 0 ? allLessonIds[currentIndex - 1] : null;
  const nextLessonId =
    currentIndex >= 0 && currentIndex < allLessonIds.length - 1
      ? allLessonIds[currentIndex + 1]
      : null;

  // Current lesson data
  const lesson = typedBundle.lessons[currentLessonId];
  const quiz = lesson?.quiz as Quiz | undefined;
  const isCurrentCompleted = completedLessons.has(currentLessonId);

  // Switch lesson helper
  const handleSelectLesson = (id: string) => {
    setCurrentLessonId(id);
    setSelectedAnswers({});
    setQuizResults({});
    setNumericInputs({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Lesson not found</h2>
        <p className="text-text-muted mt-2">Could not find lesson: {currentLessonId}</p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => handleSelectLesson('m01-l01-what-is-electricity')}
        >
          Return to Lesson 1
        </Button>
      </div>
    );
  }

  // Find module title
  const currentModule = typedBundle.modules[lesson.frontmatter.module];

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Lesson Selector Toolbar */}
      <section
        aria-label="Curriculum Navigation"
        className="bg-surface-subtle border border-border-subtle rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <label htmlFor="lesson-selector" className="text-sm font-semibold text-text-muted">
            Curriculum:
          </label>
          <select
            id="lesson-selector"
            value={currentLessonId}
            onChange={e => handleSelectLesson(e.target.value)}
            className="bg-slate-900 border border-border-strong rounded-xl px-3 py-2 text-sm text-text-main font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {moduleEntries.map(mod => (
              <optgroup key={mod.id} label={mod.title}>
                {mod.lessons.map(lId => {
                  const lObj = typedBundle.lessons[lId];
                  const done = completedLessons.has(lId);
                  return (
                    <option key={lId} value={lId}>
                      {done ? '✓ ' : '○ '}
                      {lObj ? lObj.frontmatter.title : lId}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {completedLessons.size} / {allLessonIds.length} completed
          </Badge>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={!prevLessonId}
              onClick={() => prevLessonId && handleSelectLesson(prevLessonId)}
              aria-label="Previous lesson"
            >
              ← Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!nextLessonId}
              onClick={() => nextLessonId && handleSelectLesson(nextLessonId)}
              aria-label="Next lesson"
            >
              Next →
            </Button>
          </div>
        </div>
      </section>

      {/* Header */}
      <header className="space-y-3 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Electronics & Embedded Foundations</span>
          <span>/</span>
          <span>{currentModule?.title || lesson.frontmatter.module}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">{lesson.frontmatter.title}</h1>
          {isCurrentCompleted && <Badge variant="success">✓ Completed</Badge>}
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
            {lesson.frontmatter.objectives.map((obj: string, i: number) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Lesson Body Content (rendered dynamically from authored MDX) */}
      <LessonMarkdownRenderer lessonId={currentLessonId} rawMarkdown={lesson.rawMarkdown} />

      {/* Dynamic Quiz Section */}
      {quiz && quiz.items && quiz.items.length > 0 && (
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
                            onChange={() => setSelectedAnswers(prev => ({ ...prev, [idx]: cIdx }))}
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
            {lesson.frontmatter.keyIdeas.map((idea: string, i: number) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Lesson Navigation Footer */}
      <footer className="pt-8 border-t border-border-strong flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {prevLessonId && (
            <Button
              variant="outline"
              onClick={() => handleSelectLesson(prevLessonId)}
              id="prev-lesson-btn"
            >
              ← Previous Lesson
            </Button>
          )}

          <Button
            variant={isCurrentCompleted ? 'secondary' : 'primary'}
            onClick={() => onToggleComplete(lesson.frontmatter.id, !isCurrentCompleted)}
            id="mark-complete-btn"
          >
            {isCurrentCompleted ? '✓ ' + t('lesson.completed') : t('lesson.markComplete')}
          </Button>

          {nextLessonId && (
            <Button
              variant="outline"
              onClick={() => handleSelectLesson(nextLessonId)}
              id="next-lesson-btn"
            >
              Next Lesson →
            </Button>
          )}

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
