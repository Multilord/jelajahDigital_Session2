import { BrainCircuit } from 'lucide-react';

export default function Showcase({ config, events = [] }) {
  const amendment = [...events].reverse().find(e => e.mode === 'amend');

  return (
    <section className="panel showcase-panel animate-in">
      <div className="showcase-header">
        <p className="mini-label">Step 4: Share</p>
        <h2>Your Presentation Card</h2>
        <p className="sub-text">Use this card to tell the class about your game!</p>
      </div>

      <div className="showcase-grid">
        <article className="share-card main">
          <h3>Say this in 30 seconds:</h3>
          <div className="share-info">
            <p><strong>Hi! My game is called:</strong> {config?.title || '______'}</p>
            <p><strong>The theme is:</strong> {config?.description || '______'}</p>
            <p><strong>One thing I changed was:</strong> {amendment ? amendment.prompt : '______'}</p>
            <p><strong>I learned that:</strong> A clear prompt helps AI understand my idea.</p>
          </div>
        </article>

        <article className="share-card tips">
          <h3><BrainCircuit size={20} /> My AI Checklist</h3>
          <ul>
            <li>I used AI as a creative helper.</li>
            <li>I checked if the game worked.</li>
            <li>I used my own ideas to make it unique!</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
