import { canAccessLevel } from "../utils/teamSession.js";
import { LEVELS } from "../data/levels.js";

/**
 * LevelMap — Student home screen showing 4 level cards.
 * Shows locked/unlocked/completed states based on admin control + team progress.
 */

const FINAL_QUEST = {
  id: "finalQuest",
  title: "Final Quest: Cipta Game Pac-Man",
  subtitle: "Bina game mini ala Pac-Man menggunakan AI!",
  icon: "🏆",
};

export default function LevelMap({ team, control, onSelectLevel, onSelectFinalQuest, onShowScoreboard }) {
  const completedCount = team
    ? Object.values(team.completedLevels || {}).filter(Boolean).length
    : 0;
  const totalLevels = 4;

  function renderLevelCard(level, index) {
    const isCompleted = team?.completedLevels?.[level.id];
    const access = canAccessLevel(level.id, team, control);
    const score = team?.levelScores?.[level.id] || 0;

    const handleClick = () => {
      if (isCompleted && level.id !== "finalQuest") return; // Already done
      if (!access.allowed) return;
      if (level.id === "finalQuest") {
        onSelectFinalQuest();
      } else {
        onSelectLevel(level.id);
      }
    };

    let statusLabel = "";
    let statusClass = "";
    if (isCompleted) {
      statusLabel = "✅ Misi Selesai!";
      statusClass = "completed";
    } else if (!access.allowed) {
      statusLabel =
        access.reason === "incomplete_prev"
          ? "🔒 Selesaikan level sebelumnya"
          : "🔒 Level Dikunci";
      statusClass = "locked";
    } else {
      statusLabel = "🎯 Level Dibuka!";
      statusClass = "unlocked";
    }

    return (
      <button
        key={level.id}
        className={`level-card ${statusClass} ${isCompleted ? "done" : ""}`}
        onClick={handleClick}
        disabled={!access.allowed || (isCompleted && level.id !== "finalQuest")}
        aria-label={`${level.title} — ${statusLabel}`}
      >
        <div className="level-card-icon">{level.icon}</div>
        <div className="level-card-number">
          {level.id === "finalQuest" ? "★" : index + 1}
        </div>
        <h3 className="level-card-title">{level.title}</h3>
        <p className="level-card-subtitle">{level.subtitle}</p>
        <div className={`level-card-status ${statusClass}`}>{statusLabel}</div>
        {isCompleted && (
          <div className="level-card-score">+{score} mata</div>
        )}
      </button>
    );
  }

  return (
    <div className="level-map-screen animate-in">
      {/* Team header */}
      <div className="team-header">
        <div className="team-info">
          <span className="team-badge">🎮</span>
          <div>
            <h2 className="team-name">{team?.teamName || "Pasukan"}</h2>
            <p className="team-score-label">
              Jumlah Mata: <strong>{team?.totalScore || 0}</strong>
            </p>
          </div>
        </div>
        <button
          className="scoreboard-btn"
          onClick={onShowScoreboard}
          aria-label="Lihat papan markah"
        >
          🏅 Papan Markah
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-section">
        <div className="progress-label">
          Kemajuan: {completedCount}/{totalLevels} level selesai
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / totalLevels) * 100}%` }}
          />
        </div>
        {completedCount >= 3 && !team?.completedLevels?.finalQuest && (
          <p className="progress-hint animate-in">
            🎉 Pasukan Hebat! Semua kuiz selesai — buka Final Quest!
          </p>
        )}
      </div>

      {/* Level cards grid */}
      <div className="level-cards-grid">
        {LEVELS.map((level, i) => renderLevelCard(level, i))}
        {renderLevelCard(FINAL_QUEST, 3)}
      </div>
    </div>
  );
}
