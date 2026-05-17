const STORAGE_KEY = 'ai_prompting_pacman_session_v1';

function makeSessionId() {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `student-${random}`;
}

export function createEmptySession() {
  return {
    sessionId: makeSessionId(),
    promptCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gameConfig: null,
    events: []
  };
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySession();
    const parsed = JSON.parse(raw);
    if (!parsed.sessionId) return createEmptySession();
    return {
      ...createEmptySession(),
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return createEmptySession();
  }
}

export function saveSession(session) {
  const updated = {
    ...session,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function addSessionEvent(session, event) {
  const next = {
    ...session,
    events: [
      ...(session.events || []),
      {
        ...event,
        at: new Date().toISOString()
      }
    ].slice(-20)
  };
  return saveSession(next);
}

export function recordPromptUse(session, { mode, prompt, config }) {
  const next = {
    ...session,
    promptCount: Math.min(2, Number(session.promptCount || 0) + 1),
    gameConfig: config,
    events: [
      ...(session.events || []),
      {
        type: 'prompt_used',
        mode,
        prompt,
        at: new Date().toISOString()
      }
    ].slice(-20)
  };
  return saveSession(next);
}

export function resetSession() {
  const fresh = createEmptySession();
  saveSession(fresh);
  return fresh;
}
