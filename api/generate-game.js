import { generateGameConfig } from './_gemini.js';

function sendJson(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { prompt, mode, currentConfig, sessionId, teamId, sessionPromptCount } = body;

    const id = teamId || sessionId;
    if (!id || String(id).length < 6) {
      sendJson(res, 400, { error: 'Missing team/session. Please refresh the page.' });
      return;
    }

    if (Number(sessionPromptCount) >= 2) {
      sendJson(res, 429, { error: 'This student session has already used 2 prompts.' });
      return;
    }

    const result = await generateGameConfig({ prompt, mode, currentConfig });

    sendJson(res, 200, {
      config: result.config,
      source: result.source,
      keyUsed: result.keyIndex ? `Gemini key ${result.keyIndex}` : 'No Gemini key exposed',
      remainingStudentPrompts: Math.max(0, 2 - (Number(sessionPromptCount || 0) + 1)),
      warnings: result.errors || []
    });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error.message || 'Unable to generate game right now.'
    });
  }
}
