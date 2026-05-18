import { useState, useEffect } from "react";
import {
  subscribeWorkshopControl,
  subscribeScoreboard,
  adminUpdateWorkshopControl,
  adminResetTeam,
  adminResetWorkshop,
  adminAddBonus,
  adminResetTeamPrompts,
  adminToggleShowcase,
  initWorkshopControl,
} from "../lib/firebase.js";

/**
 * AdminDashboard — Workshop facilitator control panel.
 *
 * ⚠️ WORKSHOP-LEVEL SECURITY ONLY ⚠️
 * Protected by VITE_ADMIN_PASSCODE which is visible in frontend builds.
 * This is acceptable for a live workshop setting but is NOT production-grade security.
 * For production, use Firebase Auth with admin claims or a server-side admin panel.
 */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [control, setControl] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bonus dialog state
  const [bonusDialog, setBonusDialog] = useState(null); // { teamId, teamName }
  const [bonusPoints, setBonusPoints] = useState(10);
  const [bonusReason, setBonusReason] = useState("");

  // Confirm reset dialog
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  /**
   * ⚠️ VITE_ADMIN_PASSCODE is embedded in the frontend bundle.
   * Anyone who inspects the built JS can find it. This is intentional
   * for a temporary workshop tool — it's a convenience gate, not real auth.
   */
  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || "admin123";

  function handleLogin(e) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthed(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Kata laluan salah.");
    }
  }

  useEffect(() => {
    if (!authed) return;

    // Ensure workshopControl doc exists
    initWorkshopControl().catch(console.error);

    const unsub1 = subscribeWorkshopControl((data) => {
      setControl(data);
      setLoading(false);
    });

    const unsub2 = subscribeScoreboard((data) => {
      setTeams(data);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [authed]);

  // ── Login gate ────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-login-screen animate-in">
        <div className="admin-login-card">
          <h2>🔐 Admin Dashboard</h2>
          <p>Jelajah Dunia AI — Kawalan Bengkel</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Kata laluan admin"
              autoFocus
            />
            {passcodeError && <p className="admin-error">{passcodeError}</p>}
            <button type="submit" className="primary-button">
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-screen">
        <p>Memuatkan dashboard...</p>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────
  const totalTeams = teams.length;
  const totalGames = teams.filter((t) => t.gameGenerated).length;
  const topTeam = teams.length > 0 ? teams[0] : null;

  async function toggleLevel(levelKey) {
    await adminUpdateWorkshopControl({
      [levelKey]: !control[levelKey],
    });
  }

  async function togglePause() {
    await adminUpdateWorkshopControl({
      workshopPaused: !control.workshopPaused,
    });
  }

  async function handleResetTeam(teamId) {
    if (!confirm(`Reset pasukan ini? Semua markah dan jawapan akan dipadam.`)) return;
    await adminResetTeam(teamId);
  }

  async function handleResetAll() {
    await adminResetWorkshop();
    setConfirmResetAll(false);
  }

  async function handleAddBonus() {
    if (!bonusDialog) return;
    await adminAddBonus(bonusDialog.teamId, bonusPoints, bonusReason);
    setBonusDialog(null);
    setBonusPoints(10);
    setBonusReason("");
  }

  async function handleResetPrompts(teamId) {
    if (!confirm("Reset kiraan prompt pasukan ini? Mereka boleh cipta game semula.")) return;
    await adminResetTeamPrompts(teamId);
  }

  async function handleToggleShowcase(teamId, current) {
    await adminToggleShowcase(teamId, !current);
  }

  function getLevelStatus(team, levelKey) {
    const completed = team.completedLevels?.[levelKey];
    if (completed) return "✅";
    return "—";
  }

  // ── Dashboard UI ──────────────────────────────────────────────
  return (
    <div className="admin-screen animate-in">
      <div className="admin-header">
        <h1>Admin Dashboard — Jelajah Dunia AI</h1>
        <div className="admin-header-actions">
          <span className={`pause-indicator ${control.workshopPaused ? "paused" : "active"}`}>
            {control.workshopPaused ? "⏸ DIJEDA" : "▶ AKTIF"}
          </span>
        </div>
      </div>

      {/* Status cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{totalTeams}</div>
          <div className="stat-label">Pasukan Berdaftar</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{control.activeLevel || "—"}</div>
          <div className="stat-label">Level Aktif</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{totalGames}</div>
          <div className="stat-label">Game Dicipta</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{topTeam?.teamName || "—"}</div>
          <div className="stat-label">Pasukan Teratas ({topTeam?.totalScore || 0})</div>
        </div>
      </div>

      {/* Control panel */}
      <div className="admin-panel">
        <h3>Kawalan Bengkel</h3>
        <div className="admin-controls-grid">
          <button
            className={`admin-toggle ${control.workshopPaused ? "on" : ""}`}
            onClick={togglePause}
          >
            {control.workshopPaused ? "⏸ Bengkel Dijeda — Klik untuk Teruskan" : "▶ Bengkel Aktif — Klik untuk Jeda"}
          </button>

          <button
            className={`admin-toggle ${control.level1Unlocked ? "on" : ""}`}
            onClick={() => toggleLevel("level1Unlocked")}
          >
            {control.level1Unlocked ? "🔓 Level 1 Dibuka" : "🔒 Level 1 Dikunci"}
          </button>

          <button
            className={`admin-toggle ${control.level2Unlocked ? "on" : ""}`}
            onClick={() => toggleLevel("level2Unlocked")}
          >
            {control.level2Unlocked ? "🔓 Level 2 Dibuka" : "🔒 Level 2 Dikunci"}
          </button>

          <button
            className={`admin-toggle ${control.level3Unlocked ? "on" : ""}`}
            onClick={() => toggleLevel("level3Unlocked")}
          >
            {control.level3Unlocked ? "🔓 Level 3 Dibuka" : "🔒 Level 3 Dikunci"}
          </button>

          <button
            className={`admin-toggle ${control.finalQuestUnlocked ? "on" : ""}`}
            onClick={() => toggleLevel("finalQuestUnlocked")}
          >
            {control.finalQuestUnlocked ? "🔓 Final Quest Dibuka" : "🔒 Final Quest Dikunci"}
          </button>

          <div className="admin-active-level">
            <label htmlFor="active-level">Level Aktif:</label>
            <select
              id="active-level"
              value={control.activeLevel || ""}
              onChange={(e) =>
                adminUpdateWorkshopControl({
                  activeLevel: e.target.value || null,
                })
              }
            >
              <option value="">Tiada</option>
              <option value="level1">Level 1</option>
              <option value="level2">Level 2</option>
              <option value="level3">Level 3</option>
              <option value="finalQuest">Final Quest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3>Senarai Pasukan ({totalTeams})</h3>
          <button
            className="admin-danger-btn"
            onClick={() => setConfirmResetAll(true)}
          >
            🗑 Reset Semua
          </button>
        </div>

        {teams.length === 0 ? (
          <p className="admin-empty">Belum ada pasukan berdaftar.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pasukan</th>
                  <th>Markah</th>
                  <th>L1</th>
                  <th>L2</th>
                  <th>L3</th>
                  <th>Game</th>
                  <th>Prompt</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.teamId}>
                    <td>
                      {t.teamName}
                      {t.showcased && " ⭐"}
                    </td>
                    <td className="mono">{t.totalScore}</td>
                    <td>{getLevelStatus(t, "level1")}</td>
                    <td>{getLevelStatus(t, "level2")}</td>
                    <td>{getLevelStatus(t, "level3")}</td>
                    <td>{t.gameGenerated ? "✅" : "—"}</td>
                    <td className="mono">{t.promptCount || 0}/2</td>
                    <td className="actions-cell">
                      <button
                        className="admin-sm-btn bonus"
                        onClick={() =>
                          setBonusDialog({
                            teamId: t.teamId,
                            teamName: t.teamName,
                          })
                        }
                        title="Tambah bonus"
                      >
                        +🎁
                      </button>
                      <button
                        className="admin-sm-btn"
                        onClick={() => handleResetPrompts(t.teamId)}
                        title="Reset prompt"
                      >
                        🔄
                      </button>
                      <button
                        className="admin-sm-btn"
                        onClick={() =>
                          handleToggleShowcase(t.teamId, t.showcased)
                        }
                        title={t.showcased ? "Buang showcase" : "Showcase"}
                      >
                        {t.showcased ? "⭐" : "☆"}
                      </button>
                      <button
                        className="admin-sm-btn danger"
                        onClick={() => handleResetTeam(t.teamId)}
                        title="Reset pasukan"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bonus dialog */}
      {bonusDialog && (
        <div className="admin-overlay">
          <div className="admin-dialog">
            <h3>Tambah Bonus — {bonusDialog.teamName}</h3>
            <div className="dialog-field">
              <label>Mata bonus:</label>
              <input
                type="number"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>
            <div className="dialog-field">
              <label>Sebab (pilihan):</label>
              <input
                type="text"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
                placeholder="Contoh: Persembahan terbaik"
              />
            </div>
            <div className="dialog-actions">
              <button className="primary-button" onClick={handleAddBonus}>
                Tambah
              </button>
              <button
                className="secondary-button"
                onClick={() => setBonusDialog(null)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset all confirmation */}
      {confirmResetAll && (
        <div className="admin-overlay">
          <div className="admin-dialog danger-dialog">
            <h3>⚠️ Reset Semua Pasukan?</h3>
            <p>
              Semua markah, jawapan, prompt dan game akan dipadam. Tindakan ini
              tidak boleh diundur.
            </p>
            <div className="dialog-actions">
              <button className="admin-danger-btn" onClick={handleResetAll}>
                Ya, Reset Semua
              </button>
              <button
                className="secondary-button"
                onClick={() => setConfirmResetAll(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
