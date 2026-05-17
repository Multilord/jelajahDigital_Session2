import { useState, useEffect } from 'react';
import { PartyPopper, ArrowRight } from 'lucide-react';

export default function QuizCard({ quiz, onComplete }) {
  const [chosen, setChosen] = useState(null);
  const isCorrect = chosen === quiz.answer;

  // Reset chosen state when quiz question changes
  useEffect(() => {
    setChosen(null);
  }, [quiz]);

  return (
    <section className="panel quiz-panel animate-in">
      <div className="quiz-header">
        <p className="mini-label">Quick Quiz</p>
        <h2>{quiz.question}</h2>
      </div>

      <div className="options-grid">
        {quiz.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`option-button large ${chosen === index ? (index === quiz.answer ? 'correct' : 'wrong') : ''}`}
            onClick={() => chosen === null && setChosen(index)}
            disabled={chosen !== null}
          >
            {option}
          </button>
        ))}
      </div>

      {chosen !== null && (
        <div className={`quiz-feedback animate-in ${isCorrect ? 'good' : 'try'}`}>
          <p>
            {isCorrect ? <PartyPopper size={20} /> : null}
            {isCorrect ? quiz.explanation : 'Oops! Try again next time.'}
          </p>
          <button className="primary-button" onClick={onComplete}>
            Next <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
