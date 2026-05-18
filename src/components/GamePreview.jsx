/**
 * GamePreview — iframe-based preview of the AI-generated game.
 * All text in Bahasa Melayu.
 */
export default function GamePreview({ config }) {
  if (!config || !config.html) {
    return (
      <section className="panel game-panel">
        <div className="section-title-row">
          <div>
            <p className="mini-label">Pratonton Game</p>
            <h2>Belum ada game</h2>
            <p>Game kamu akan muncul di sini selepas kamu menciptanya.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel game-panel animate-in">
      <div className="section-title-row">
        <div>
          <p className="mini-label">Pratonton Game</p>
          <h2>{config.title || "Game Mini ala Pac-Man"}</h2>
          <p>{config.description || "Game dicipta menggunakan AI."}</p>
        </div>
      </div>

      <div className="game-container">
        <iframe
          title="Game Mini ala Pac-Man"
          srcDoc={config.html}
          sandbox="allow-scripts"
          className="game-iframe"
          frameBorder="0"
        />
      </div>

      <div className="game-footer">
        <div className="game-instructions">
          🎮 <span>{config.instructions || "Gunakan kekunci anak panah untuk bermain!"}</span>
        </div>
      </div>
    </section>
  );
}
