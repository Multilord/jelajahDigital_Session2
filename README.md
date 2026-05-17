# AI Prompting 101 — Create a Mini Pac-Man Game with AI

A workshop web app for students aged 10–12. It follows a 90-minute activity module:

| Section | Activity | Time |
| --- | --- | ---: |
| 3.1 | Introduction to AI and prompting | 30 minutes |
| 3.2 | Demonstration of building a Pac-Man-style game idea | 20 minutes |
| 3.3 | Hands-on: create, amend and play the game | 30 minutes |
| 3.4 | Showcase and sharing | 10 minutes |

## What the app does

- Provides a fun module flow for young students.
- Includes simple quiz checkpoints.
- Lets a student create a Pac-Man-style game with one prompt.
- Lets the student amend the game with one more prompt.
- Enforces a 2-prompt student limit using a local session log.
- Keeps Gemini API keys on the backend only.
- Rotates across multiple Gemini API keys if one key fails or hits a quota/rate limit.
- Uses a safe built-in game engine; Gemini only generates the game configuration, not executable code.

## Project structure

```txt
ai-prompting-pacman/
├─ api/
│  ├─ _gemini.js              # Gemini REST call, key rotation, safe config validation
│  └─ generate-game.js        # Vercel/Node API endpoint
├─ server/
│  └─ dev-api.js              # Local Express API for development
├─ src/
│  ├─ components/             # React UI components
│  ├─ utils/sessionLog.js     # 2-prompt session log using localStorage
│  ├─ App.jsx
│  ├─ data.js
│  ├─ main.jsx
│  └─ styles.css
├─ .env.example
├─ package.json
├─ vite.config.js
└─ README.md
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Add your Gemini API keys into `.env`:

```bash
GEMINI_API_KEYS=key_from_account_1,key_from_account_2,key_from_account_3,key_from_account_4,key_from_account_5,key_from_account_6
GEMINI_MODEL=gemini-1.5-flash
```

You can also use numbered variables:

```bash
GEMINI_API_KEY_1=key_from_account_1
GEMINI_API_KEY_2=key_from_account_2
GEMINI_API_KEY_3=key_from_account_3
GEMINI_API_KEY_4=key_from_account_4
GEMINI_API_KEY_5=key_from_account_5
GEMINI_API_KEY_6=key_from_account_6
```

4. Run the app locally:

```bash
npm run dev
```

5. Open:

```txt
http://localhost:5173
```

## Vercel deployment

1. Push this project to GitHub.
2. Import the GitHub repo into Vercel.
3. Add these environment variables in Vercel Project Settings:
   - `GEMINI_API_KEYS`
   - `GEMINI_MODEL`
4. Build command:

```bash
npm run build
```

5. Output directory:

```txt
dist
```

Vercel will automatically deploy files inside the `/api` directory as Node serverless functions.

## Prompt limit behaviour

Each browser/device gets a student session ID stored in `localStorage`.

- Prompt 1: create game.
- Prompt 2: amend game.
- After 2 prompts, the prompt area locks.
- The facilitator reset button clears the session for testing or a new group.

For a stricter production workshop, connect the session log to a small database such as Supabase, Vercel KV or Upstash so students cannot reset the limit by clearing browser storage.

## Safety design

Gemini does not return runnable JavaScript. It only returns a JSON game configuration:

- title
- theme
- player name and emoji
- enemy name and emoji
- collectible name and emoji
- colours
- difficulty
- instructions
- win/lose messages

The React game engine renders the result safely.

## Gemini CLI checking prompt

After opening the project in your editor, you can send this to Gemini CLI:

```txt
You are reviewing a React + Vite + Node/Vercel workshop web app for students aged 10–12. Check the entire project for setup, build, runtime, frontend/backend integration, environment variables, Gemini REST API usage, prompt limit handling, and Vercel deployment readiness. Fix any errors you find without exposing API keys in frontend code. Make sure /api/generate-game works locally through the Vite proxy and works on Vercel as a serverless function. Run npm install, npm run build, and any relevant checks. Preserve the 2-prompt-per-student local session limit and the safe JSON-only Gemini output design.
```
