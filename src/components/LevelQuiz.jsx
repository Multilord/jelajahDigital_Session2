import { useState, useEffect, useCallback } from "react";
import { LEVELS } from "../data/levels.js";
import { POINTS } from "../data/levels.js";
import { submitAnswer, completeLevel } from "../lib/firebase.js";

/**
 * LevelQuiz — Shows questions one-by-one for a given level.
 * Immediate feedback, deterministic answer IDs prevent double-scoring.
 */
export default function LevelQuiz({ levelId, teamId, onComplete, onBack }) {
  const level = LEVELS.find((l) => l.id === levelId);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, points, alreadyAnswered }
  const [levelScore, setLevelScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!level) {
    return (
      <div className="quiz-screen animate-in">
        <div className="panel quiz-error">
          <p>Level tidak ditemui.</p>
          <button className="primary-button" onClick={onBack}>
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const questions = level.questions;
  const question = questions[currentQ];
  const total = questions.length;

  async function handleSelect(optionIndex) {
    if (selected !== null || submitting) return;
    setSelected(optionIndex);
    setSubmitting(true);

    const isCorrect = optionIndex === question.answer;

    try {
      const result = await submitAnswer(teamId, levelId, {
        questionId: question.id,
        question: question.question,
        selectedOption: optionIndex,
        correctAnswer: question.answer,
        isCorrect,
      });

      const points = result.alreadyAnswered ? 0 : result.pointsEarned;

      setFeedback({
        isCorrect,
        explanation: question.explanation,
        points,
        alreadyAnswered: result.alreadyAnswered,
      });

      if (points > 0) {
        setLevelScore((prev) => prev + points);
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      setFeedback({
        isCorrect,
        explanation: question.explanation,
        points: 0,
        alreadyAnswered: false,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    if (currentQ < total - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      // Level complete
      try {
        await completeLevel(teamId, levelId);
      } catch (err) {
        console.error("Complete level error:", err);
      }
      setFinished(true);
    }
  }

  // ── Finished screen ──────────────────────────────────────────
  if (finished) {
    return (
      <div className="quiz-screen animate-in">
        <div className="panel quiz-complete-panel">
          <div className="quiz-complete-icon">🎉</div>
          <h2>Misi Selesai!</h2>
          <p className="quiz-complete-level">{level.title}</p>
          <div className="quiz-complete-score">
            <span className="score-number">+{levelScore}</span>
            <span className="score-label">mata diperoleh</span>
          </div>
          <p className="quiz-complete-bonus">
            +{POINTS.LEVEL_COMPLETE_BONUS} bonus siap level!
          </p>
          <button className="primary-button large" onClick={onComplete}>
            🗺️ Kembali ke Peta Level
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz question screen ─────────────────────────────────────
  return (
    <div className="quiz-screen animate-in">
      {/* Top bar */}
      <div className="quiz-top-bar">
        <button className="back-btn" onClick={onBack} aria-label="Kembali">
          ← Kembali
        </button>
        <div className="quiz-level-label">{level.title}</div>
        <div className="quiz-progress-text">
          {currentQ + 1} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentQ + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="panel quiz-question-panel">
        <div className="quiz-q-number">Soalan {currentQ + 1}</div>
        <h2 className="quiz-q-text">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, idx) => {
            let optionClass = "quiz-option";
            if (selected !== null) {
              if (idx === question.answer) optionClass += " correct";
              else if (idx === selected && idx !== question.answer)
                optionClass += " wrong";
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null || submitting}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`quiz-feedback animate-in ${
              feedback.isCorrect ? "correct-fb" : "wrong-fb"
            }`}
          >
            <div className="feedback-icon">
              {feedback.isCorrect ? "🎉" : "💡"}
            </div>
            <div className="feedback-content">
              <p className="feedback-status">
                {feedback.isCorrect
                  ? `Betul! +${feedback.points} mata`
                  : "Tidak mengapa!"}
                {feedback.alreadyAnswered && " (sudah dijawab sebelumnya)"}
              </p>
              <p className="feedback-explanation">{feedback.explanation}</p>
            </div>
            <button className="primary-button" onClick={handleNext}>
              {currentQ < total - 1 ? "Soalan Seterusnya →" : "Siap! 🏁"}
            </button>
          </div>
        )}
      </div>

      {/* Score tally */}
      <div className="quiz-score-tally">
        Mata level ini: <strong>{levelScore}</strong>
      </div>
    </div>
  );
}
