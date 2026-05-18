/**
 * firebase.js — Firestore CRUD & real-time listeners for Jelajah Dunia AI workshop.
 *
 * Collections:
 *   workshopControl/main — admin-controlled level locks & pause state
 *   teams/{teamId}       — team profiles, scores, completed levels
 *   teams/{teamId}/answers/{levelId}_{questionId} — deterministic answer docs
 *   teams/{teamId}/prompts/{autoId} — prompt history
 *   games/{teamId}       — generated game HTML/config
 *
 * Double-scoring prevention:
 *   • Answer docs use deterministic IDs: {levelId}_{questionId}
 *   • submitAnswer() checks for existing doc before awarding points
 *   • completeLevel() is idempotent — no bonus if already completed
 *   • Game bonuses only awarded once (checked via gameGenerated flag)
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { POINTS } from "../data/levels.js";

// ── Firebase config from Vite env ─────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Returns true if Firebase is properly configured.
 * Allows us to show a friendly setup message instead of crashing.
 */
export function isFirebaseConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.error("Firebase init failed:", err);
}

export { db };

// ── Workshop Control ──────────────────────────────────────────────────

const CONTROL_DOC = "workshopControl/main";

/** Ensure workshopControl/main exists with defaults. */
export async function initWorkshopControl() {
  const ref = doc(db, "workshopControl", "main");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      level1Unlocked: false,
      level2Unlocked: false,
      level3Unlocked: false,
      finalQuestUnlocked: false,
      workshopPaused: false,
      activeLevel: null,
      updatedAt: serverTimestamp(),
    });
  }
}

/** Real-time listener on workshop control state. */
export function subscribeWorkshopControl(callback) {
  const ref = doc(db, "workshopControl", "main");
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        // Auto-create if missing
        initWorkshopControl().then(() => callback({
          level1Unlocked: false,
          level2Unlocked: false,
          level3Unlocked: false,
          finalQuestUnlocked: false,
          workshopPaused: false,
          activeLevel: null,
        }));
      }
    },
    (err) => console.error("Workshop control listener error:", err)
  );
}

/** Admin updates workshop control fields. */
export async function adminUpdateWorkshopControl(updates) {
  const ref = doc(db, "workshopControl", "main");
  await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

// ── Team CRUD ─────────────────────────────────────────────────────────

/**
 * Create a new team document. Returns the teamId.
 */
export async function createTeamSession(teamName, memberCount = 1) {
  const teamId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const teamDoc = {
    teamId,
    teamName: String(teamName).trim().slice(0, 40),
    memberCount: Math.max(1, Math.min(10, Number(memberCount) || 1)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    totalScore: 0,
    currentLevel: "level1",
    completedLevels: {
      level1: false,
      level2: false,
      level3: false,
      finalQuest: false,
    },
    levelScores: {
      level1: 0,
      level2: 0,
      level3: 0,
      finalQuest: 0,
    },
    promptCount: 0,
    gameGenerated: false,
    gameTitle: "",
    showcased: false,
  };

  await setDoc(doc(db, "teams", teamId), teamDoc);
  return teamId;
}

/** One-time fetch of team document. */
export async function loadTeam(teamId) {
  const snap = await getDoc(doc(db, "teams", teamId));
  return snap.exists() ? snap.data() : null;
}

/** Real-time listener on a single team document. */
export function subscribeTeam(teamId, callback) {
  return onSnapshot(
    doc(db, "teams", teamId),
    (snap) => {
      callback(snap.exists() ? snap.data() : null);
    },
    (err) => console.error("Team listener error:", err)
  );
}

// ── Scoreboard ────────────────────────────────────────────────────────

/**
 * Real-time scoreboard listener.
 * Subscribes to all teams and sorts client-side for full tie-breaking:
 *   1. totalScore desc
 *   2. completed level count desc
 *   3. gameGenerated true first
 *   4. updatedAt asc (earlier is better)
 */
export function subscribeScoreboard(callback) {
  const q = query(collection(db, "teams"), orderBy("totalScore", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const teams = snap.docs.map((d) => d.data());
      // Client-side tie-breaking sort
      teams.sort((a, b) => {
        // 1. totalScore desc
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        // 2. completed levels count desc
        const countLevels = (t) =>
          Object.values(t.completedLevels || {}).filter(Boolean).length;
        const aLevels = countLevels(a);
        const bLevels = countLevels(b);
        if (bLevels !== aLevels) return bLevels - aLevels;
        // 3. gameGenerated true first
        if (a.gameGenerated !== b.gameGenerated)
          return a.gameGenerated ? -1 : 1;
        // 4. updatedAt asc (earlier is better)
        const aTime = a.updatedAt?.toMillis?.() || a.updatedAt?.seconds * 1000 || 0;
        const bTime = b.updatedAt?.toMillis?.() || b.updatedAt?.seconds * 1000 || 0;
        return aTime - bTime;
      });
      callback(teams);
    },
    (err) => console.error("Scoreboard listener error:", err)
  );
}

// ── Quiz Answers ──────────────────────────────────────────────────────

/**
 * Submit an answer for a quiz question.
 * Uses deterministic doc ID: {levelId}_{questionId}
 * If the answer already exists, does NOT add points again (prevents double-scoring).
 *
 * @returns {{ alreadyAnswered: boolean, pointsEarned: number }}
 */
export async function submitAnswer(teamId, levelId, answerData) {
  const answerId = `${levelId}_${answerData.questionId}`;
  const answerRef = doc(db, "teams", teamId, "answers", answerId);

  // Check if already answered
  const existing = await getDoc(answerRef);
  if (existing.exists()) {
    return { alreadyAnswered: true, pointsEarned: 0 };
  }

  const pointsEarned = answerData.isCorrect ? POINTS.CORRECT_ANSWER : POINTS.WRONG_ANSWER;

  // Write answer doc
  await setDoc(answerRef, {
    levelId,
    questionId: answerData.questionId,
    question: answerData.question,
    selectedOption: answerData.selectedOption,
    correctAnswer: answerData.correctAnswer,
    isCorrect: answerData.isCorrect,
    pointsEarned,
    answeredAt: serverTimestamp(),
  });

  // Update team score atomically
  if (pointsEarned > 0) {
    const teamRef = doc(db, "teams", teamId);
    await updateDoc(teamRef, {
      totalScore: increment(pointsEarned),
      [`levelScores.${levelId}`]: increment(pointsEarned),
      updatedAt: serverTimestamp(),
    });
  }

  return { alreadyAnswered: false, pointsEarned };
}

// ── Level Completion ──────────────────────────────────────────────────

/**
 * Mark a level as completed. IDEMPOTENT:
 *   — If the level is already completed, no bonus is added.
 *   — If all 3 quiz levels become complete, awards the all-levels bonus (once).
 */
export async function completeLevel(teamId, levelId) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  const team = teamSnap.data();
  const completed = team.completedLevels || {};

  // Already completed — skip (idempotent)
  if (completed[levelId]) return;

  const updates = {
    [`completedLevels.${levelId}`]: true,
    totalScore: increment(POINTS.LEVEL_COMPLETE_BONUS),
    [`levelScores.${levelId}`]: increment(POINTS.LEVEL_COMPLETE_BONUS),
    updatedAt: serverTimestamp(),
  };

  // Determine next level
  if (levelId === "level1") updates.currentLevel = "level2";
  if (levelId === "level2") updates.currentLevel = "level3";
  if (levelId === "level3") updates.currentLevel = "finalQuest";

  await updateDoc(teamRef, updates);

  // Check if all 3 quiz levels are now complete (award all-levels bonus once)
  if (levelId === "level3") {
    // After this update, level1 + level2 were already complete (access control enforces this),
    // and we just set level3 = true. So all 3 are done.
    const allComplete =
      completed.level1 && completed.level2; // level3 was just set above
    if (allComplete) {
      await updateDoc(teamRef, {
        totalScore: increment(POINTS.ALL_LEVELS_BONUS),
        updatedAt: serverTimestamp(),
      });
    }
  }
}

// ── Prompts ───────────────────────────────────────────────────────────

/** Save a prompt to the team's prompt subcollection and increment count. */
export async function savePrompt(teamId, promptData) {
  const promptRef = doc(collection(db, "teams", teamId, "prompts"));
  await setDoc(promptRef, {
    mode: promptData.mode,
    prompt: promptData.prompt,
    createdAt: serverTimestamp(),
    resultSummary: promptData.resultSummary || "",
    gameConfig: promptData.gameConfig || null,
  });

  await updateDoc(doc(db, "teams", teamId), {
    promptCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// ── Game Saving ───────────────────────────────────────────────────────

/**
 * Save generated game to the games collection and update team flags.
 * Awards game creation/improvement bonus only once per type.
 *
 * @param {string} teamId
 * @param {object} gameData — { title, description, instructions, html }
 * @param {"create"|"amend"} mode
 */
export async function saveGame(teamId, gameData, mode) {
  // Save to global games collection
  await setDoc(doc(db, "games", teamId), {
    teamId,
    teamName: gameData.teamName || "",
    title: gameData.title || "Game Mini",
    description: gameData.description || "",
    instructions: gameData.instructions || "",
    html: gameData.html || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Read current team state to prevent duplicate bonuses
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  const team = teamSnap.data();
  const updates = {
    gameTitle: gameData.title || "Game Mini",
    updatedAt: serverTimestamp(),
  };

  if (mode === "create" && !team.gameGenerated) {
    // First game creation — award bonus
    updates.gameGenerated = true;
    updates["completedLevels.finalQuest"] = true;
    updates.totalScore = increment(POINTS.GAME_CREATE_BONUS);
    updates["levelScores.finalQuest"] = increment(POINTS.GAME_CREATE_BONUS);
  } else if (mode === "amend") {
    // Check if amend bonus was already awarded (promptCount > 1 means second prompt)
    // We track this by checking if levelScores.finalQuest > GAME_CREATE_BONUS
    const currentFQScore = team.levelScores?.finalQuest || 0;
    if (currentFQScore <= POINTS.GAME_CREATE_BONUS) {
      updates.totalScore = increment(POINTS.GAME_IMPROVE_BONUS);
      updates["levelScores.finalQuest"] = increment(POINTS.GAME_IMPROVE_BONUS);
    }
  }

  await updateDoc(teamRef, updates);
}

// ── Admin Functions ───────────────────────────────────────────────────

/** Reset a single team's progress. */
export async function adminResetTeam(teamId) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  // Delete all answers
  const answersSnap = await getDocs(collection(db, "teams", teamId, "answers"));
  const batch1 = writeBatch(db);
  answersSnap.forEach((d) => batch1.delete(d.ref));
  await batch1.commit();

  // Delete all prompts
  const promptsSnap = await getDocs(collection(db, "teams", teamId, "prompts"));
  const batch2 = writeBatch(db);
  promptsSnap.forEach((d) => batch2.delete(d.ref));
  await batch2.commit();

  // Delete game doc
  try {
    await deleteDoc(doc(db, "games", teamId));
  } catch {
    // ignore if doesn't exist
  }

  // Reset team fields
  await updateDoc(teamRef, {
    totalScore: 0,
    currentLevel: "level1",
    completedLevels: {
      level1: false,
      level2: false,
      level3: false,
      finalQuest: false,
    },
    levelScores: {
      level1: 0,
      level2: 0,
      level3: 0,
      finalQuest: 0,
    },
    promptCount: 0,
    gameGenerated: false,
    gameTitle: "",
    showcased: false,
    updatedAt: serverTimestamp(),
  });
}

/** Reset all teams. Deletes all team docs, their subcollections, and games. */
export async function adminResetWorkshop() {
  const teamsSnap = await getDocs(collection(db, "teams"));

  for (const teamDoc of teamsSnap.docs) {
    const teamId = teamDoc.id;

    // Delete answers subcollection
    const answersSnap = await getDocs(collection(db, "teams", teamId, "answers"));
    const batch1 = writeBatch(db);
    answersSnap.forEach((d) => batch1.delete(d.ref));
    await batch1.commit();

    // Delete prompts subcollection
    const promptsSnap = await getDocs(collection(db, "teams", teamId, "prompts"));
    const batch2 = writeBatch(db);
    promptsSnap.forEach((d) => batch2.delete(d.ref));
    await batch2.commit();

    // Delete game
    try {
      await deleteDoc(doc(db, "games", teamId));
    } catch {
      // ignore
    }

    // Delete team doc itself
    await deleteDoc(doc(db, "teams", teamId));
  }
}

/** Add bonus points to a team. */
export async function adminAddBonus(teamId, points, reason = "") {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    totalScore: increment(points),
    updatedAt: serverTimestamp(),
  });

  // Log bonus as a prompt-like event
  await setDoc(doc(collection(db, "teams", teamId, "prompts")), {
    mode: "admin_bonus",
    prompt: `Bonus: ${points} points — ${reason}`,
    createdAt: serverTimestamp(),
    resultSummary: "",
    gameConfig: null,
  });
}

/** Reset a team's prompt count (allows them to use the game builder again). */
export async function adminResetTeamPrompts(teamId) {
  await updateDoc(doc(db, "teams", teamId), {
    promptCount: 0,
    updatedAt: serverTimestamp(),
  });
}

/** Mark/unmark a team's game as showcased. */
export async function adminToggleShowcase(teamId, showcased) {
  await updateDoc(doc(db, "teams", teamId), {
    showcased,
    updatedAt: serverTimestamp(),
  });
}
