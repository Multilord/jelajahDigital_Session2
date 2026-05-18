import { useState, useEffect, useRef } from "react";
import { PROMPT_STARTERS, AMENDMENT_STARTERS } from "../data/levels.js";
import { savePrompt, saveGame } from "../lib/firebase.js";

/**
 * GameBuilder — Final Quest game creation with 2-prompt limit.
 * Shows animated loading status box during generation.
 */

const LOADING_STEPS = [
  { icon: "📝", text: "Menghantar prompt ke Gemini AI..." },
  { icon: "🤖", text: "AI sedang membaca prompt kamu..." },
  { icon: "🎨", text: "AI mereka bentuk game..." },
  { icon: "⚙️", text: "Menjana kod HTML game..." },
  { icon: "🎮", text: "Hampir siap! Menyiapkan game..." },
];

export default function GameBuilder({ team, gameConfig, onGenerated, onBack }) {
  const promptCount = team?.promptCount || 0;
  const mode = promptCount === 0 ? "create" : "amend";
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [message, setMessage] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const turnsLeft = 2 - promptCount;
  const isLocked = turnsLeft <= 0;
  const starters = mode === "create" ? PROMPT_STARTERS : AMENDMENT_STARTERS;
  const timerRef = useRef(null);

  // Animate loading steps
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      timerRef.current = setInterval(() => {
        setLoadingStep((prev) =>
          prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 4000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [loading]);

  async function submitPrompt(event) {
    event.preventDefault();
    if (isLocked) return;
    setMessage("");
    setErrorDetail("");

    if (prompt.trim().length < 5) {
      setMessage("Tulis lebih sedikit supaya AI faham apa yang kamu mahu!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          currentConfig: gameConfig || null,
          teamId: team?.teamId,
          sessionPromptCount: promptCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ralat! Cuba lagi.");
      }

      // Save prompt to Firestore
      await savePrompt(team.teamId, {
        mode,
        prompt,
        resultSummary: data.config?.title || "",
        gameConfig: {
          title: data.config?.title,
          description: data.config?.description,
        },
      });

      // Save game to Firestore (also handles bonus points)
      await saveGame(
        team.teamId,
        {
          teamName: team.teamName,
          title: data.config?.title,
          description: data.config?.description,
          instructions: data.config?.instructions,
          html: data.config?.html,
        },
        mode
      );

      onGenerated({ mode, prompt, config: data.config });
      setPrompt("");
      setMessage(
        mode === "create"
          ? "🎮 Game sedia! Tatal ke bawah untuk bermain."
          : "✨ Game dikemas kini! Tatal ke bawah."
      );
    } catch (error) {
      setMessage("❌ " + error.message);
      if (error.message.includes("busy")) {
        setErrorDetail(
          "Semua kunci API sibuk. Minta fasilitator periksa log pelayan."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel builder-panel animate-in">
      <div className="builder-header">
        <div>
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              ← Kembali
            </button>
          )}
          <p className="mini-label">Final Quest: Cipta Game</p>
          <h2>
            {mode === "create"
              ? "Prompt 1: Cipta game mini ala Pac-Man"
              : "Prompt 2: Perbaiki game kamu"}
          </h2>
          <p className="sub-text">
            {mode === "create"
              ? "Huraikan game impian kamu! AI akan jadikannya game boleh dimainkan."
              : "Kamu ada satu peluang lagi untuk perbaiki game — tukar warna, musuh, kuasa khas dan lain-lain!"}
          </p>
        </div>
        <div className={`turn-counter ${isLocked ? "locked" : ""}`}>
          {isLocked ? "Tiada giliran lagi" : `${turnsLeft} giliran lagi`}
        </div>
      </div>

      <div className="builder-main">
        <form onSubmit={submitPrompt} className="prompt-box">
          <textarea
            value={prompt}
            disabled={isLocked || loading}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "create"
                ? "Contoh: Cipta game mini ala Pac-Man bertema angkasa lepas. Hero ialah roket kecil..."
                : "Contoh: Jadikan game lebih mudah untuk kanak-kanak umur 10 tahun..."
            }
          />
          <button
            className="primary-button large"
            type="submit"
            disabled={isLocked || loading}
          >
            {loading
              ? "⏳ Gemini sedang berfikir..."
              : mode === "create"
              ? "🚀 Cipta Game"
              : "✨ Kemas Kini Game"}
          </button>

          {/* Loading status box */}
          {loading && (
            <div className="loading-status-box animate-in">
              <div className="loading-spinner" />
              <div className="loading-status-content">
                <p className="loading-status-step">
                  <span className="loading-step-icon">
                    {LOADING_STEPS[loadingStep].icon}
                  </span>
                  {LOADING_STEPS[loadingStep].text}
                </p>
                <div className="loading-progress-dots">
                  {LOADING_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`ldot ${i <= loadingStep ? "active" : ""}`}
                    />
                  ))}
                </div>
                <p className="loading-hint">
                  Ini mungkin mengambil masa 15–30 saat...
                </p>
              </div>
            </div>
          )}

          {message && (
            <p className={`status-message ${message.startsWith("❌") ? "error" : ""}`}>
              {message}
            </p>
          )}
          {errorDetail && (
            <p className="status-detail">{errorDetail}</p>
          )}
        </form>

        <div className="starters-area">
          <h3>Cuba contoh prompt:</h3>
          <div className="starter-chips">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                disabled={isLocked || loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
