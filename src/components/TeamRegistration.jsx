import { useState } from "react";
import { createTeamSession } from "../lib/firebase.js";
import { saveTeamId } from "../utils/teamSession.js";

/**
 * TeamRegistration — First screen students see.
 * Asks for team name (required) and optional member count.
 * Creates a team in Firestore and saves teamId to localStorage.
 */
export default function TeamRegistration({ onRegistered }) {
  const [teamName, setTeamName] = useState("");
  const [memberCount, setMemberCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const name = teamName.trim();
    if (!name || name.length < 2) {
      setError("Sila masukkan nama pasukan (sekurang-kurangnya 2 huruf).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const teamId = await createTeamSession(name, memberCount);
      saveTeamId(teamId);
      onRegistered(teamId);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Sambungan terganggu. Cuba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registration-screen animate-in">
      <div className="registration-card">
        <div className="reg-icon">🎮</div>
        <h1 className="reg-title">Jelajah Dunia AI</h1>
        <p className="reg-subtitle">Bengkel AI Prompting 101</p>

        <div className="reg-divider" />

        <p className="reg-description">
          Masukkan nama pasukan kamu untuk mula menjelajah dunia AI!
        </p>

        <form onSubmit={handleSubmit} className="reg-form">
          <div className="reg-field">
            <label htmlFor="team-name">Nama Pasukan</label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Contoh: Pasukan Roket 🚀"
              maxLength={40}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="reg-field">
            <label htmlFor="member-count">Bilangan Ahli</label>
            <div className="member-counter">
              <button
                type="button"
                className="counter-btn"
                onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                disabled={loading || memberCount <= 1}
                aria-label="Kurang ahli"
              >
                −
              </button>
              <span className="counter-value">{memberCount}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                disabled={loading || memberCount >= 10}
                aria-label="Tambah ahli"
              >
                +
              </button>
            </div>
          </div>

          {error && <p className="reg-error">{error}</p>}

          <button
            type="submit"
            className="primary-button large reg-submit"
            disabled={loading}
          >
            {loading ? "Sedang mendaftar..." : "🚀 Mula Jelajah!"}
          </button>
        </form>
      </div>
    </div>
  );
}
