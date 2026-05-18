export function getGeminiKeys() {
  const fromList = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  const fromNumbered = Array.from({ length: 12 }, (_, index) => process.env[`GEMINI_API_KEY_${index + 1}`])
    .map((key) => (key || '').trim())
    .filter(Boolean);

  return [...new Set([...fromList, ...fromNumbered])];
}

export function sanitizeUserPrompt(prompt = '') {
  return String(prompt)
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 700);
}

function extractJson(text) {
  if (!text) return null;

  // 1. Try direct parse (works when responseMimeType is application/json)
  try {
    const direct = JSON.parse(text);
    if (direct && typeof direct === 'object') return direct;
  } catch {
    // not directly parseable, try extraction
  }

  // 2. Strip markdown fences and try again
  const cleaned = text.replace(/```json|```/gi, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // continue to brace matching
  }

  // 3. Fallback: find outermost { } using a depth counter
  const start = cleaned.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--; if (depth === 0) {
        try { return JSON.parse(cleaned.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

function buildSystemPrompt({ mode, userPrompt, currentConfig }) {
  const previousHtml = currentConfig?.html || 'No previous game.';

  return `You are a child-friendly game developer creating a simple playable mini game for students aged 10–12 in an AI Prompting workshop.
Return ONLY valid JSON. Do not include markdown. Do not include extra text.
The game should be a maze or Pac-Man-style game. You must generate the full HTML, CSS, and JavaScript.

Requirements for the generated HTML:
- Must be a single, self-contained HTML document with <style> and <script> tags inside.
- Use standard keyboard controls (Arrow keys).
- Include a score display.
- Include a clear win condition (e.g., collect all items) and lose condition (e.g., hit an enemy).
- Use bright, kid-friendly game colours.
- Must be safe, friendly, and non-violent.
- NO external scripts, NO network calls, NO external images (use CSS shapes or emojis).
- NO localStorage, cookies, or eval.

Mode: ${mode}
${mode === 'amend' ? `Previous Game HTML: ${previousHtml}\nStudent Amendment: ${userPrompt}` : `Student Prompt: ${userPrompt}`}

Return JSON with exactly these keys:
{
  "title": "short fun title",
  "description": "one sentence description for children",
  "instructions": "simple controls and goal (e.g., Use arrows to move)",
  "html": "the complete self-contained HTML document string"
}
Ensure the HTML string is properly escaped for JSON.`;
}

export async function generateGameConfig({ prompt, mode = 'create', currentConfig }) {
  const keys = getGeminiKeys();
  const userPrompt = sanitizeUserPrompt(prompt);

  if (!userPrompt || userPrompt.length < 5) {
    const error = new Error('Prompt is too short.');
    error.statusCode = 400;
    throw error;
  }

  if (!keys.length) {
    throw new Error('No Gemini API keys found in environment.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: buildSystemPrompt({ mode, userPrompt, currentConfig }) }]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 65536
    }
  };

  const errors = [];

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const text = await response.text();
      if (!response.ok) {
        console.error(`Gemini Key ${index + 1} failed: HTTP ${response.status} — ${text.slice(0, 300)}`);
        errors.push(`Key ${index + 1}: ${response.status} ${text.slice(0, 200)}`);
        continue;
      }

      const payload = JSON.parse(text);
      const outputText = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
      const parsed = extractJson(outputText);

      if (!parsed || !parsed.html) {
        console.error(`Key ${index + 1} raw output (first 500 chars):`, outputText.slice(0, 500));
        console.error(`Key ${index + 1} parsed result:`, parsed ? Object.keys(parsed) : 'null');
        errors.push(`Key ${index + 1}: Gemini returned invalid JSON or missing HTML.`);
        continue;
      }

      return {
        config: parsed,
        source: 'gemini',
        keyIndex: index + 1
      };
    } catch (error) {
      console.error(`Gemini Key ${index + 1} error:`, error.message);
      errors.push(`Key ${index + 1}: ${error.message}`);
    }
  }

  console.error('All Gemini keys failed:', errors);
  throw new Error('AI is busy right now. Please ask the facilitator to try again.');
}
