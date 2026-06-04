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

const router = Router();

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
    if (hasAi() && exact.length === 0 && local.length === 0) {
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
      const suggestions = suggestDrugNames(drugQuery, 5);

      if (suggestions.length > 0) {
        /** @type {object[]} */
        let merged = suggestions.map((s) => ({
          name: s.drug.name,
          drugId: s.drug.id,
          activeIngredient: s.drug.activeIngredient,
          score: s.score,
          reason: s.reason,
        }));

        if (hasAi() && suggestions.length === 0) {
          try {
            const ai = await aiSuggestSpelling(drugQuery, suggestions);
            for (const s of ai.suggestions || []) {
              const local = db.drugs.find(
                (d) =>
                  normalizeText(d.name) === normalizeText(s.name) ||
                  normalizeText(d.activeIngredient) === normalizeText(s.activeIngredient)
              );
              if (local && !merged.some((m) => m.drugId === local.id)) {
                merged.push({
                  name: local.name,
                  drugId: local.id,
                  activeIngredient: local.activeIngredient,
                  reason: s.reason || `AI gợi ý (${providerLabel(activeProvider())})`,
                });
              } else if (!local && s.name) {
                merged.push({
                  name: s.name,
                  drugId: null,
                  activeIngredient: s.activeIngredient || '—',
                  reason: s.reason || 'AI gợi ý (chưa có trong DB demo)',
                });
              }
            }
            merged = merged.slice(0, 6);
          } catch {
            // giữ gợi ý fuzzy
          }
        }

        return res.json({
          status: 'suggest',
          message: `Không tìm thấy "${drugQuery}" — có thể bạn muốn:`,
          suggestions: merged,
        });
      }

      if (hasAi()) {
        try {
          const result = await aiLookup(drugQuery, condition, patient);
          return res.json({
            status: 'ok',
            mode: result.mode,
            dataSource: 'api',
            suggestions: [],
            card: result.card,
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
        message: 'Không tìm thấy thuốc. Vui lòng hỏi dược sĩ Long Châu.',
        suggestions: [],
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
