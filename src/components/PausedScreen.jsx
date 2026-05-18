/**
 * PausedScreen — Shown when the admin has paused the workshop.
 * Students see this instead of the level map.
 */
export default function PausedScreen() {
  return (
    <div className="paused-screen animate-in">
      <div className="paused-card">
        <div className="paused-pacman">
          <div className="pacman-anim" />
          <div className="pac-dots">
            <span className="pac-dot" />
            <span className="pac-dot" />
            <span className="pac-dot" />
          </div>
        </div>
        <h2>Bengkel Dijeda</h2>
        <p>Sila tunggu arahan fasilitator. ⏸️</p>
        <p className="paused-sub">
          Jangan risau — markah dan kemajuan kamu selamat!
        </p>
      </div>
    </div>
  );
}
