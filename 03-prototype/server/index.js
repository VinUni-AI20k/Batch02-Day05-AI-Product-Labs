import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import drugsRouter from './routes/drugs.js';
import { loadDb } from './drug-db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;

loadDb();

const app = express();
app.use(express.json());
app.use('/api/drugs', drugsRouter);
app.use(
  express.static(ROOT, {
    setHeaders(res, filePath) {
      if (/\.(js|css|html)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.redirect(307, '/api/drugs/health');
});

app.listen(PORT, () => {
  console.log(`Long Châu Safety Bot → http://localhost:${PORT}`);
  console.log(`API health → http://localhost:${PORT}/api/drugs/health`);
  const hasOai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasDs = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  const hasGem = Boolean(process.env.GEMINI_API_KEY?.trim());
  const pref = (process.env.AI_PROVIDER || 'auto').toLowerCase();
  if (hasOai || hasDs || hasGem) {
    const labels = { openai: 'OpenAI', deepseek: 'DeepSeek', gemini: 'Gemini' };
    const pick =
      pref !== 'auto' && ((pref === 'openai' && hasOai) || (pref === 'deepseek' && hasDs) || (pref === 'gemini' && hasGem))
        ? labels[pref]
        : hasOai
          ? 'OpenAI (auto)'
          : hasDs
            ? 'DeepSeek (auto)'
            : 'Gemini (auto)';
    console.log(`✅ AI provider: ${pick}`);
  } else {
    console.log('⚠️  Chưa có OPENAI / DEEPSEEK / GEMINI API key — chỉ DB local + fuzzy');
    console.log('   Copy .env.example → .env và thêm ít nhất một key');
  }
});
