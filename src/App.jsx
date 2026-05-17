import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Stepper from './components/Stepper.jsx';
import QuizCard from './components/QuizCard.jsx';
import GameBuilder from './components/GameBuilder.jsx';
import GamePreview from './components/GamePreview.jsx';
import Showcase from './components/Showcase.jsx';
import { MODULE_FLOW, QUIZZES, LEARN_SLIDES, PROMPT_SLIDES } from './data.js';
import { addSessionEvent, loadSession, recordPromptUse, resetSession } from './utils/sessionLog.js';
import { syncSessionToFirestore, recordGameToGallery } from './lib/firebase.js';
import { Brain, Wand2, Gamepad2, Megaphone } from 'lucide-react';

const DEFAULT_GAME = {
  title: 'My AI Game',
  description: 'A custom game made with AI.',
  instructions: 'Your game instructions will appear here!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          background: #0f172a; 
          color: #94a3b8; 
          font-family: sans-serif; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          margin: 0; 
        }
        .msg {
          padding: 40px;
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="msg">
        <h2 style="color: #22d3ee; margin-bottom: 8px;">Ready to build?</h2>
        <p>Your game will appear here after you create it.</p>
      </div>
    </body>
    </html>
  `
};

const STEPS = [
  // LEARN SECTION
  { id: 'learn-1', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[0] },
  { id: 'learn-2', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[1] },
  { id: 'q-learn-1', type: 'quiz', nav: 'learn', quiz: QUIZZES.learn[0] },
  { id: 'learn-3', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[2] },
  { id: 'learn-4', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[3] },
  { id: 'q-learn-2', type: 'quiz', nav: 'learn', quiz: QUIZZES.learn[1] },
  { id: 'learn-5', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[4] },
  { id: 'learn-6', type: 'lesson', nav: 'learn', slide: LEARN_SLIDES[5] },
  { id: 'q-learn-3', type: 'quiz', nav: 'learn', quiz: QUIZZES.learn[2] },

  // PROMPT SECTION
  { id: 'prompt-1', type: 'lesson', nav: 'prompt', slide: PROMPT_SLIDES[0] },
  { id: 'prompt-2', type: 'lesson', nav: 'prompt', slide: PROMPT_SLIDES[1] },
  { id: 'q-prompt-1', type: 'quiz', nav: 'prompt', quiz: QUIZZES.prompt[0] },
  { id: 'prompt-3', type: 'lesson', nav: 'prompt', slide: PROMPT_SLIDES[2] },
  { id: 'prompt-4', type: 'lesson', nav: 'prompt', slide: PROMPT_SLIDES[3] },
  { id: 'q-prompt-2', type: 'quiz', nav: 'prompt', quiz: QUIZZES.prompt[1] },
  { id: 'q-prompt-3', type: 'quiz', nav: 'prompt', quiz: QUIZZES.prompt[2] },

  // BUILD SECTION
  { id: 'build', type: 'builder', nav: 'build' },

  // SHARE SECTION
  { id: 'share', type: 'showcase', nav: 'share' }
];

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sync session to Firestore whenever it changes
  useEffect(() => {
    if (session?.sessionId) {
      syncSessionToFirestore(session);
    }
  }, [session]);

  useEffect(() => {
    const saved = loadSession();
    setSession(saved);
  }, []);

  const currentStep = STEPS[currentStepIndex];

  function nextStep() {
    if (currentStepIndex < STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setSession((current) => addSessionEvent(current, { type: 'step_changed', stepId: STEPS[nextIndex].id }));
    }
  }

  function handleGenerated({ mode, prompt, config }) {
    const updated = recordPromptUse(session, { mode, prompt, config });
    setSession(updated);
    // Also push to the global gallery for the facilitator to see
    recordGameToGallery(updated, config);
  }

  function handleReset() {
    if (window.confirm('Reset everything and start over?')) {
      setSession(resetSession());
      setCurrentStepIndex(0);
    }
  }

  const gameConfig = session.gameConfig || DEFAULT_GAME;

  return (
    <main className="dark-theme">
      <Header onReset={handleReset} />
      <Stepper steps={MODULE_FLOW} activeNav={currentStep.nav} />

      <div className="content-area">
        {currentStep.type === 'lesson' && (
          <section className="panel lesson-panel animate-in">
            <div className="lesson-icon">
              {currentStep.nav === 'learn' ? <Brain size={48} /> : <Wand2 size={48} />}
            </div>
            <h2>{currentStep.slide.title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{currentStep.slide.content}</p>
            <button className="primary-button large" onClick={nextStep}>
              Got it!
            </button>
          </section>
        )}

        {currentStep.type === 'quiz' && (
          <QuizCard 
            quiz={currentStep.quiz} 
            onComplete={nextStep} 
          />
        )}

        {currentStep.type === 'builder' && (
          <div className="animate-in">
            <GameBuilder session={session} onGenerated={handleGenerated} />
            <GamePreview config={gameConfig} />
            <div className="step-actions">
              <button className="secondary-button" onClick={nextStep}>
                Finish & Share <Megaphone size={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep.type === 'showcase' && (
          <div className="animate-in">
            <Showcase config={gameConfig} events={session.events || []} />
          </div>
        )}
      </div>

      <footer className="footer-note">
        AI helps with ideas. Always check and use your own thinking too!
      </footer>
    </main>
  );
}
