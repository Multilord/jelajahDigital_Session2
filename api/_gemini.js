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
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    return JSON.parse(cleaned.slice(first, last + 1));
  } catch {
    return null;
  }
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
      maxOutputTokens: 2048,
      responseMimeType: 'application/json'
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
        errors.push(`Key ${index + 1}: ${response.status}`);
        continue;
      }

      const payload = JSON.parse(text);
      const outputText = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
      const parsed = extractJson(outputText);

      if (!parsed || !parsed.html) {
        errors.push(`Key ${index + 1}: Gemini returned invalid JSON or missing HTML.`);
        continue;
      }

      return {
        config: parsed,
        source: 'gemini',
        keyIndex: index + 1
      };
    } catch (error) {
      errors.push(`Key ${index + 1}: ${error.message}`);
    }
  }

  throw new Error('AI is busy right now. Please ask the facilitator to try again.');
}
