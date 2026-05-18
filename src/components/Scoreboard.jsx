import { useState, useEffect } from "react";
import { subscribeScoreboard } from "../lib/firebase.js";

/**
 * Scoreboard — Live leaderboard of all teams.
 * Sorted by: totalScore desc, levels desc, gameGenerated first, updatedAt asc.
 * Sorting is handled client-side in subscribeScoreboard().
 */
export default function Scoreboard({ onBack }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeScoreboard((data) => {
      setTeams(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function completedLevelCount(t) {
    return Object.values(t.completedLevels || {}).filter(Boolean).length;
  }

  function getLevelBadges(t) {
    const cl = t.completedLevels || {};
    const badges = [];
    if (cl.level1) badges.push("🧠");
    if (cl.level2) badges.push("✨");
    if (cl.level3) badges.push("🎮");
    if (cl.finalQuest) badges.push("🏆");
    return badges;
  }

  function getRankEmoji(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  return (
    <div className="scoreboard-screen animate-in">
      <div className="scoreboard-header">
        {onBack && (
          <button className="back-btn" onClick={onBack} aria-label="Kembali">
            ← Kembali
          </button>
        )}
        <h2>🏅 Papan Markah</h2>
        <p className="scoreboard-subtitle">Siapakah pasukan terhebat?</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
          <p>Memuatkan papan markah...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada pasukan mendaftar.</p>
        </div>
      ) : (
        <div className="scoreboard-table-wrapper">
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th>Kedudukan</th>
                <th>Pasukan</th>
                <th>Markah</th>
                <th>Level</th>
                <th>Game</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr
                  key={t.teamId}
                  className={`scoreboard-row ${i < 3 ? `top-${i + 1}` : ""} ${t.showcased ? "showcased" : ""}`}
                >
                  <td className="rank-cell">
                    <span className="rank-emoji">{getRankEmoji(i)}</span>
                  </td>
                  <td className="team-cell">
                    <span className="team-name-text">{t.teamName}</span>
                    {t.showcased && <span className="showcase-badge">⭐</span>}
                  </td>
                  <td className="score-cell">
                    <span className="score-value">{t.totalScore}</span>
                  </td>
                  <td className="levels-cell">
                    <span className="level-badges">
                      {getLevelBadges(t).length > 0
                        ? getLevelBadges(t).join(" ")
                        : "—"}
                    </span>
                  </td>
                  <td className="game-cell">
                    {t.gameGenerated ? (
                      <span className="game-status done">✅</span>
                    ) : (
                      <span className="game-status pending">⏳</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
