import { useEffect, useState, useCallback } from "react";
import TeamRegistration from "./components/TeamRegistration.jsx";
import LevelMap from "./components/LevelMap.jsx";
import LevelQuiz from "./components/LevelQuiz.jsx";
import GameBuilder from "./components/GameBuilder.jsx";
import GamePreview from "./components/GamePreview.jsx";
import Scoreboard from "./components/Scoreboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import PausedScreen from "./components/PausedScreen.jsx";
import { getTeamId, saveTeamId } from "./utils/teamSession.js";
import {
  isFirebaseConfigured,
  subscribeTeam,
  subscribeWorkshopControl,
  loadTeam,
} from "./lib/firebase.js";

/**
 * App — Root component for Jelajah Dunia AI workshop platform.
 *
 * Routes (hash-based, no react-router needed):
 *   #/            → TeamRegistration or LevelMap
 *   #/level/X     → LevelQuiz for level X
 *   #/final-quest → GameBuilder + GamePreview
 *   #/scoreboard  → Scoreboard
 *   #/admin       → AdminDashboard
 */

const DEFAULT_GAME = {
  title: "Game Mini ala Pac-Man",
  description: "Game dicipta menggunakan AI.",
  instructions: "Gunakan kekunci anak panah untuk bermain!",
  html: `<!DOCTYPE html>
<html><head><style>
body{background:#0f172a;color:#94a3b8;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0}
.msg{padding:40px;border:2px dashed rgba(255,255,255,0.1);border-radius:20px;text-align:center}
</style></head><body>
<div class="msg">
<h2 style="color:#facc15;margin-bottom:8px">🎮 Sedia untuk cipta?</h2>
<p>Game kamu akan muncul di sini selepas kamu menciptanya.</p>
</div></body></html>`,
};

function getRoute() {
  const hash = window.location.hash || "#/";
  return hash;
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [teamId, setTeamId] = useState(() => getTeamId());
  const [team, setTeam] = useState(null);
  const [control, setControl] = useState(null);
  const [gameConfig, setGameConfig] = useState(null);
  const [firebaseOk] = useState(() => isFirebaseConfigured());

  // Hash-based routing
  useEffect(() => {
    function onHashChange() {
      setRoute(getRoute());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(hash) {
    window.location.hash = hash;
  }

  // Subscribe to workshop control (real-time)
  useEffect(() => {
    if (!firebaseOk) return;
    const unsub = subscribeWorkshopControl((data) => {
      setControl(data);
    });
    return () => unsub();
  }, [firebaseOk]);

  // Subscribe to team data (real-time)
  useEffect(() => {
    if (!firebaseOk || !teamId) return;
    const unsub = subscribeTeam(teamId, (data) => {
      if (data) {
        setTeam(data);
      } else {
        // Team doc deleted (admin reset) — clear session
        setTeamId(null);
        setTeam(null);
        saveTeamId("");
        navigate("#/");
      }
    });
    return () => unsub();
  }, [firebaseOk, teamId]);

  // ── Firebase not configured ─────────────────────────────────
  if (!firebaseOk) {
    return (
      <main className="dark-theme">
        <div className="setup-error animate-in">
          <h1>⚠️ Firebase Belum Disediakan</h1>
          <p>
            Sila tetapkan pemboleh ubah <code>VITE_FIREBASE_*</code> dalam fail{" "}
            <code>.env</code> untuk memulakan.
          </p>
        </div>
      </main>
    );
  }

  // ── Admin route ─────────────────────────────────────────────
  if (route === "#/admin") {
    return (
      <main className="dark-theme admin-layout">
        <AdminDashboard />
      </main>
    );
  }

  // ── Scoreboard route ────────────────────────────────────────
  if (route === "#/scoreboard") {
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <Scoreboard onBack={() => navigate("#/")} />
        </div>
      </main>
    );
  }

  // ── Registration ────────────────────────────────────────────
  if (!teamId) {
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <TeamRegistration
            onRegistered={(id) => {
              setTeamId(id);
              saveTeamId(id);
              navigate("#/");
            }}
          />
        </div>
      </main>
    );
  }

  // ── Loading team data ───────────────────────────────────────
  if (!team || !control) {
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <div className="loading-state animate-in">
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
            <p>Memuatkan data pasukan...</p>
          </div>
        </div>
      </main>
    );
  }

  // ── Workshop paused ─────────────────────────────────────────
  if (control.workshopPaused) {
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <PausedScreen />
        </div>
      </main>
    );
  }

  // ── Level Quiz route ────────────────────────────────────────
  const levelMatch = route.match(/^#\/level\/(level[1-3])$/);
  if (levelMatch) {
    const levelId = levelMatch[1];
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <LevelQuiz
            levelId={levelId}
            teamId={teamId}
            onComplete={() => navigate("#/")}
            onBack={() => navigate("#/")}
          />
        </div>
      </main>
    );
  }

  // ── Final Quest route ───────────────────────────────────────
  if (route === "#/final-quest") {
    const currentConfig = gameConfig || DEFAULT_GAME;
    return (
      <main className="dark-theme">
        <div className="app-shell">
          <GameBuilder
            team={team}
            gameConfig={gameConfig}
            onGenerated={({ config }) => setGameConfig(config)}
            onBack={() => navigate("#/")}
          />
          <GamePreview config={currentConfig} />
        </div>
      </main>
    );
  }

  // ── Default: Level Map ──────────────────────────────────────
  return (
    <main className="dark-theme">
      <div className="app-shell">
        <LevelMap
          team={team}
          control={control}
          onSelectLevel={(levelId) => navigate(`#/level/${levelId}`)}
          onSelectFinalQuest={() => navigate("#/final-quest")}
          onShowScoreboard={() => navigate("#/scoreboard")}
        />
      </div>

      <footer className="footer-note">
        AI membantu dengan idea. Sentiasa semak dan gunakan pemikiran sendiri!
      </footer>
    </main>
  );
}
