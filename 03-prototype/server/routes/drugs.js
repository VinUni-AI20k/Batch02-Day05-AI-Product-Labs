import { Router } from 'express';
import {
  getDb,
  suggestDrugNames,
  lookupLocal,
  checkUrgent,
  findDrugCandidates,
  normalizeText,
  parseAge,
  parseGender,
} from '../drug-db.js';
import {
  hasAi,
  hasOpenAI,
  hasGemini,
  hasDeepSeek,
  activeProvider,
  aiSuggestSpelling,
  aiLookup,
  providerLabel,
} from '../ai-provider.js';
import { hasGoogleCse, searchDrugInfo } from '../google-cse.js';
import { ocrDrugImage } from '../ocr.js';
import { buildStructuredFromCard } from '../lookup-structured.js';

const router = Router();

function mapLocalSuggestions(fuzzyLocal) {
  return fuzzyLocal.map((s) => ({
    name: s.drug.name,
    drugId: s.drug.id,
    activeIngredient: s.drug.activeIngredient,
    score: s.score,
    reason: s.reason,
  }));
}

function suggestionsFromAi(ai, db) {
  const out = [];
  for (const s of ai?.suggestions || []) {
    const local = db.drugs.find(
      (d) =>
        normalizeText(d.name) === normalizeText(s.name) ||
        normalizeText(d.activeIngredient) === normalizeText(s.activeIngredient)
    );
    if (local) {
      out.push({
        name: local.name,
        drugId: local.id,
        activeIngredient: local.activeIngredient,
        reason: s.reason || `AI gợi ý đúng tên (${providerLabel(activeProvider())})`,
      });
    } else if (s.name) {
      out.push({
        name: s.name,
        drugId: null,
        activeIngredient: s.activeIngredient || '—',
        reason: s.reason || 'AI gợi ý (tra cứu qua API khi chọn)',
      });
    }
  }
  return out;
}

function mergeSuggestions(existing, incoming) {
  const seen = new Set();
  const out = [];
  for (const s of [...existing, ...incoming]) {
    const key = normalizeText(s.name || '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.slice(0, 8);
}

router.get('/health', (_req, res) => {
  const db = getDb();
  const provider = activeProvider();
  res.json({
    ok: true,
    drugsInDb: db.drugs.length,
    apis: {
      openai: hasOpenAI(),
      deepseek: hasDeepSeek(),
      gemini: hasGemini(),
      active: provider,
      googleCse: hasGoogleCse(),
    },
    modes: [
      provider === 'openai' ? 'openai (web search / Google CSE)' : null,
      provider === 'deepseek' ? 'deepseek (+ Google CSE nếu có)' : null,
      provider === 'gemini' ? 'google+gemini (Gemini Google Search grounding)' : null,
      hasGoogleCse() ? 'google-cse' : null,
      'local+fuzzy',
    ].filter(Boolean),
  });
});

/** GET /api/drugs/suggest?q=panadl */
router.get('/suggest', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Thiếu tham số q' });

    const local = suggestDrugNames(q, 5);
    const exact = findDrugCandidates(getDb(), q);

    /** @type {object} */
    let ai = null;
    if (hasAi() && exact.length === 0) {
      try {
        ai = await aiSuggestSpelling(q, local);
      } catch (e) {
        ai = { error: e.message };
      }
    }

    res.json({
      query: q,
      exactMatch: exact.length > 0,
      provider: activeProvider(),
      localSuggestions: local.map((s) => ({
        name: s.drug.name,
        drugId: s.drug.id,
        activeIngredient: s.drug.activeIngredient,
        score: s.score,
        reason: s.reason,
      })),
      aiSuggestions: ai?.suggestions || [],
      correctedQuery: ai?.correctedQuery || null,
      confidence: ai?.confidence || (exact.length ? 'high' : 'medium'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/drugs/lookup  body: { condition, drugQuery, age, gender, userName?, drugId? } */
router.post('/lookup', async (req, res) => {
  try {
    const condition = String(req.body.condition || '').trim();
    const drugQuery = String(req.body.drugQuery || '').trim();
    const userName = req.body.userName || null;
    const drugId = req.body.drugId || null;
    const age = parseAge(req.body.age);
    const gender = parseGender(req.body.gender);
    const patient = { age, gender };

    if (!condition || !drugQuery) {
      return res.status(400).json({ error: 'Cần condition và drugQuery' });
    }
    if (age == null) {
      return res.status(400).json({ error: 'Cần tuổi hợp lệ (0–120)' });
    }
    if (!gender) {
      return res.status(400).json({ error: 'Cần giới tính: nam hoặc nữ' });
    }

    if (checkUrgent(condition)) {
      return res.json({
        status: 'urgent',
        message: 'Triệu chứng cần chú ý khẩn cấp — không tra cứu tự động',
      });
    }

    const db = getDb();
    let drug = null;

    if (drugId) {
      drug = db.drugs.find((d) => d.id === drugId) || null;
    }
    if (!drug) {
      const candidates = findDrugCandidates(db, drugQuery);
      if (candidates.length === 1) drug = candidates[0];
      else if (candidates.length > 1) {
        return res.json({
          status: 'disambiguate',
          candidates: candidates.map((d) => ({
            id: d.id,
            name: d.name,
            activeIngredient: d.activeIngredient,
          })),
        });
      }
    }

    if (!drug) {
      const fuzzyLocal = suggestDrugNames(drugQuery, 5);
      let merged = mapLocalSuggestions(fuzzyLocal);
      let correctedQuery = null;

      if (hasAi()) {
        try {
          const ai = await aiSuggestSpelling(drugQuery, fuzzyLocal);
          correctedQuery = ai?.correctedQuery || null;
          if (correctedQuery) {
            const corrected = findDrugCandidates(db, correctedQuery);
            const exactCorrected = corrected.filter(
              (d) =>
                normalizeText(d.name) === normalizeText(correctedQuery) ||
                (d.aliases || []).some((a) => normalizeText(a) === normalizeText(correctedQuery))
            );
            if (exactCorrected.length === 1) {
              return res.json(lookupLocal(exactCorrected[0], condition, userName, patient));
            }
          }
          merged = mergeSuggestions(merged, suggestionsFromAi(ai, db));
        } catch {
          // tiếp tục với gợi ý local hoặc lookup AI
        }
      }

      if (merged.length > 0) {
        const hint = correctedQuery ? ` (gợi ý đúng: ${correctedQuery})` : '';
        return res.json({
          status: 'suggest',
          message: `Không tìm thấy chính xác "${drugQuery}"${hint} — chọn thuốc:`,
          suggestions: merged,
          correctedQuery,
        });
      }

      if (hasAi()) {
        try {
          const result = await aiLookup(drugQuery, condition, patient);
          const card = result.card;
          return res.json({
            status: 'ok',
            mode: result.mode,
            dataSource: 'api',
            suggestions: [],
            card,
            structured: buildStructuredFromCard(card),
            normalizedQuery: card.drugName || drugQuery,
          });
        } catch (aiErr) {
          return res.status(502).json({
            status: 'error',
            error: aiErr.message,
            suggestions: [],
          });
        }
      }

        return res.json({
          status: 'not_found',
          message: `Không tìm thấy "${drugQuery}". Vui lòng nhập lại tên thuốc hoặc chọn gợi ý bên dưới.`,
          suggestions: [],
          flowStep: 'retry_input',
        });
    }

    // Có trong database → chỉ dùng DB, không gọi API
    return res.json(lookupLocal(drug, condition, userName, patient));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/drugs/search-google — raw Google CSE (debug) */
router.post('/search-google', async (req, res) => {
  try {
    if (!hasGoogleCse()) {
      return res.status(503).json({ error: 'Chưa cấu hình GOOGLE_API_KEY + GOOGLE_CSE_ID' });
    }
    const { query, condition } = req.body;
    const items = await searchDrugInfo(query, condition || '');
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/drugs/chat  body: { messages, profile? } */
router.post('/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const profile = req.body.profile || {};
    if (messages.length === 0) {
      return res.status(400).json({ error: 'Cần messages' });
    }
    const result = await handleConversation({ messages, profile });
    res.json({ status: 'ok', ...result, provider: activeProvider() });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/** POST /api/drugs/ocr  body: { imageBase64, mimeType? } */
router.post('/ocr', async (req, res) => {
  try {
    const raw = String(req.body.imageBase64 || '');
    if (!raw) return res.status(400).json({ error: 'Thiếu imageBase64' });
    const imageBase64 = raw.replace(/^data:[^;]+;base64,/, '');
    const mimeType = req.body.mimeType || 'image/jpeg';
    const ocr_result = await ocrDrugImage(imageBase64, mimeType);
    res.json({
      intent: 'image_lookup',
      input_type: 'image',
      ocr_result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
