import { useState } from 'react';
import { AMENDMENT_STARTERS, PROMPT_STARTERS } from '../data.js';
import { Wand2 } from 'lucide-react';

export default function GameBuilder({ session, onGenerated }) {
  const mode = session.promptCount === 0 ? 'create' : 'amend';
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const turnsLeft = 2 - (session.promptCount || 0);
  const isLocked = turnsLeft <= 0;
  const starters = mode === 'create' ? PROMPT_STARTERS : AMENDMENT_STARTERS;

  async function submitPrompt(event) {
    event.preventDefault();
    if (isLocked) return;
    setMessage('');

    if (prompt.trim().length < 5) {
      setMessage('Write a little more so AI knows what to make!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          currentConfig: session.gameConfig,
          sessionId: session.sessionId,
          sessionPromptCount: session.promptCount
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Oops! Try again.');

      onGenerated({ mode, prompt, config: data.config });
      setPrompt('');
      setMessage('Game ready! Scroll down to play.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel builder-panel animate-in">
      <div className="builder-header">
        <div>
          <p className="mini-label">Step 3: Build</p>
          <h2>{mode === 'create' ? 'Prompt 1: Create your game' : 'Prompt 2: Improve your game'}</h2>
          <p className="sub-text">
            {mode === 'create' 
              ? 'Describe your dream maze game! AI will turn it into a playable game.' 
              : 'You have one turn to improve your game! Change colours, speed, or themes.'}
          </p>
        </div>
        <div className={`turn-counter ${isLocked ? 'locked' : ''}`}>
          {isLocked ? 'No turns left' : `${turnsLeft} ${turnsLeft === 1 ? 'turn' : 'turns'} left`}
        </div>
      </div>

      <div className="builder-main">
        <form onSubmit={submitPrompt} className="prompt-box">
          <textarea
            value={prompt}
            disabled={isLocked || loading}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === 'create' ? 'Example: A space game where a rocket collects stars...' : 'Example: Make it faster and change colours to neon...'}
          />
          <button className="primary-button large" type="submit" disabled={isLocked || loading}>
            <Wand2 size={20} /> {loading ? 'Gemini is thinking...' : mode === 'create' ? 'Create Game' : 'Update Game'}
          </button>
          {message && <p className="status-message">{message}</p>}
        </form>

        <div className="starters-area">
          <h3>Try an example:</h3>
          <div className="starter-chips">
            {starters.map((s) => (
              <button key={s} type="button" onClick={() => setPrompt(s)} disabled={isLocked || loading}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
