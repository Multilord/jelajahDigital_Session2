import express from 'express';
import cors from 'cors';
import generateGameHandler from '../api/generate-game.js';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '1mb' }));

function adapt(handler) {
  return (req, res) => handler(req, res);
}

app.post('/api/generate-game', adapt(generateGameHandler));
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'AI Prompting Pac-Man API' }));

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Local API running on http://localhost:${port}`);
});
