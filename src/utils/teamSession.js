/**
 * teamSession.js — localStorage helpers for team persistence
 * and level access-control logic for the workshop.
 */

const TEAM_STORAGE_KEY = "jelajah_ai_team_id";

// ── localStorage helpers ──────────────────────────────────────────────

export function saveTeamId(teamId) {
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, teamId);
  } catch {
    // localStorage might be unavailable (private browsing, etc.)
  }
}

export function getTeamId() {
  try {
    return localStorage.getItem(TEAM_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function clearTeamId() {
  try {
    localStorage.removeItem(TEAM_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Access-control logic ──────────────────────────────────────────────

/**
 * Determines whether a team can access a given level.
 *
 * @param {string} levelId — "level1" | "level2" | "level3" | "finalQuest"
 * @param {object} team — the team Firestore doc (completedLevels, etc.)
 * @param {object} control — the workshopControl/main doc
 * @returns {{ allowed: boolean, reason: string }}
 *   reason values: "ok" | "paused" | "locked" | "incomplete_prev"
 */
export function canAccessLevel(levelId, team, control) {
  if (!control || !team) {
    return { allowed: false, reason: "loading" };
  }

  if (control.workshopPaused) {
    return { allowed: false, reason: "paused" };
  }

  const completed = team.completedLevels || {};

  switch (levelId) {
    case "level1":
      return {
        allowed: !!control.level1Unlocked,
        reason: control.level1Unlocked ? "ok" : "locked",
      };

    case "level2":
      if (!control.level2Unlocked) return { allowed: false, reason: "locked" };
      if (!completed.level1) return { allowed: false, reason: "incomplete_prev" };
      return { allowed: true, reason: "ok" };

    case "level3":
      if (!control.level3Unlocked) return { allowed: false, reason: "locked" };
      if (!completed.level2) return { allowed: false, reason: "incomplete_prev" };
      return { allowed: true, reason: "ok" };

    case "finalQuest":
      if (!control.finalQuestUnlocked) return { allowed: false, reason: "locked" };
      if (!completed.level3) return { allowed: false, reason: "incomplete_prev" };
      return { allowed: true, reason: "ok" };

    default:
      return { allowed: false, reason: "locked" };
  }
}
