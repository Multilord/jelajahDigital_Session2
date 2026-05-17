import { Trophy } from 'lucide-react';

export default function GamePreview({ config }) {
  if (!config || !config.html) {
    return (
      <section className="panel game-panel">
        <div className="section-title-row">
          <div>
            <p className="mini-label">Playable preview</p>
            <h2>No game yet</h2>
            <p>Your game will appear here after you create it.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel game-panel animate-in">
      <div className="section-title-row">
        <div>
          <p className="mini-label">Playable preview</p>
          <h2>{config.title || 'My AI Game'}</h2>
          <p>{config.description || 'A custom game made with AI.'}</p>
        </div>
      </div>

      <div className="game-container">
        <iframe
          title="AI Generated Game"
          srcDoc={config.html}
          sandbox="allow-scripts"
          className="game-iframe"
          frameBorder="0"
        />
      </div>

      <div className="game-footer">
        <div className="game-instructions">
          <Trophy size={18} />
          <span>{config.instructions || 'Use arrow keys to play!'}</span>
        </div>
      </div>
    </section>
  );
}
