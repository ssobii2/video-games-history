import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Era, MuseumItem } from '../types';
import type { QuizQuestion } from './types';
import { generateQuiz } from './generate';
import type { Sfx } from '../audio/sfx';

interface Props {
  items: MuseumItem[];
  eras: Era[];
  onClose: () => void;
  onOpenItem: (item: MuseumItem) => void;
  sfx?: { play: (n: Sfx) => void };
}

type Phase = 'playing' | 'finished';

export function Quiz({ items, eras, onClose, onOpenItem, sfx }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate quiz once on mount, stable across re-renders
  const questionsRef = useRef<QuizQuestion[] | null>(null);
  if (!questionsRef.current) {
    questionsRef.current = generateQuiz(items, eras);
  }

  const [questions, setQuestions] = useState<QuizQuestion[]>(questionsRef.current);
  const [phase, setPhase] = useState<Phase>('playing');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  // per-question answers: chosen option index, or -1 if unanswered
  const [answers, setAnswers] = useState<number[]>(() => new Array(questionsRef.current!.length).fill(-1));
  // locked = user has answered current question
  const [locked, setLocked] = useState(false);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
    );
    return () => { tl.kill(); };
  }, []);

  // Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = questions[index];
  const n = questions.length;

  function handleOption(optIdx: number) {
    if (locked) return;
    setLocked(true);
    const correct = optIdx === current.correctIndex;
    sfx?.play(correct ? 'correct' : 'wrong');
    const next = answers.slice();
    next[index] = optIdx;
    setAnswers(next);
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    sfx?.play('step');
    if (index + 1 >= n) {
      setPhase('finished');
    } else {
      setIndex((i) => i + 1);
      setLocked(false);
    }
  }

  function handlePlayAgain() {
    const fresh = generateQuiz(items, eras);
    questionsRef.current = fresh;
    setQuestions(fresh);
    setPhase('playing');
    setIndex(0);
    setScore(0);
    setAnswers(new Array(fresh.length).fill(-1));
    setLocked(false);
  }

  function handleViewItem(slug: string) {
    const item = items.find((i) => i.slug === slug);
    if (item) onOpenItem(item);
  }

  // ── Playing phase ──────────────────────────────────────────────────────────

  function renderPlaying() {
    const chosenIdx = answers[index];
    return (
      <>
        <div className="quiz-header-row">
          <span className="quiz-progress">Q {index + 1} / {n}</span>
          <span className="quiz-score">Score: {score}</span>
        </div>

        <p className="quiz-prompt">{current.prompt}</p>

        <div className="quiz-options">
          {current.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (locked) {
              cls += ' locked';
              if (i === current.correctIndex) cls += ' correct';
              else if (i === chosenIdx) cls += ' wrong';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleOption(i)}
                disabled={locked}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {locked && (
          <button className="quiz-next" onClick={handleNext}>
            {index + 1 >= n ? 'See results →' : 'Next →'}
          </button>
        )}
      </>
    );
  }

  // ── Finished phase ─────────────────────────────────────────────────────────

  function renderFinished() {
    return (
      <>
        <div className="quiz-result">
          <span className="quiz-result-score">{score} / {n}</span>
          <span className="quiz-result-label">
            {score === n ? 'Perfect score!' : score >= Math.ceil(n * 0.7) ? 'Well done!' : 'Keep exploring!'}
          </span>
        </div>

        <div className="quiz-review">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const correct = chosen === q.correctIndex;
            return (
              <div key={q.id} className={`quiz-review-item ${correct ? 'correct' : 'wrong'}`}>
                <p className="quiz-review-prompt">{q.prompt}</p>
                <p className="quiz-review-answer">
                  Your answer:{' '}
                  <span className={correct ? 'quiz-answer-correct' : 'quiz-answer-wrong'}>
                    {chosen >= 0 ? q.options[chosen] : '—'}
                  </span>
                  {!correct && (
                    <>
                      {' '}· Correct:{' '}
                      <span className="quiz-answer-correct">{q.options[q.correctIndex]}</span>
                    </>
                  )}
                </p>
                {q.itemSlug && (
                  <button
                    className="quiz-view-item"
                    onClick={() => handleViewItem(q.itemSlug!)}
                  >
                    View →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button className="quiz-replay" onClick={handlePlayAgain}>
          ↺ Play again
        </button>
      </>
    );
  }

  // ── Shell ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="quiz-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal={true}
      aria-label="Trivia quiz"
    >
      <div className="quiz-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <button className="quiz-close" onClick={onClose} aria-label="Close quiz">
          ✕
        </button>

        <h2 className="quiz-title">Trivia Quiz</h2>

        {phase === 'playing' ? renderPlaying() : renderFinished()}
      </div>
    </div>
  );
}
