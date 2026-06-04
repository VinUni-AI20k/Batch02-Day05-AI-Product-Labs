import { parseLlmJson } from './parse-llm-json.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function geminiKey() {
  return process.env.GEMINI_API_KEY?.trim() || '';
}

export function hasGemini() {
  return Boolean(geminiKey());
}

async function geminiGenerate(body) {
  const key = geminiKey();
  if (!key) throw new Error('GEMINI_API_KEY chưa cấu hình');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`Gemini API: ${msg}`);
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join('') || '';

  const grounding =
    data.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c) => ({
      title: c.web?.title || 'Nguồn web',
      link: c.web?.uri || null,
      snippet: '',
    })) || [];

  return { text, grounding, raw: data };
}

/**
 * Gợi ý tên thuốc khi user gõ sai (AI + danh sách gợi ý local)
 */
export async function suggestSpelling(query, localHints = []) {
  const hintList = localHints
    .map((h) => `- ${h.label} (hoạt chất: ${h.drug.activeIngredient})`)
    .join('\n');

  const prompt = `Người dùng Việt Nam gõ sai tên thuốc: "${query}"

Gợi ý từ hệ thống (có thể đúng):
${hintList || '(không có)'}

Trả về JSON thuần (không markdown), format:
{
  "correctedQuery": "tên thuốc/hoạt chất đúng nhất",
  "suggestions": [
    { "name": "...", "activeIngredient": "...", "reason": "vì sao gợi ý" }
  ],
  "confidence": "high|medium|low"
}

Chỉ gợi ý thuốc OTC/phổ biến tại Việt Nam. Tối đa 4 gợi ý. Nếu không chắc, confidence=low.`;

  const { text } = await geminiGenerate({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  });

  return parseLlmJson(text) || {
      correctedQuery: query,
      suggestions: [],
      confidence: 'low',
      raw: text,
    };
}

/**
 * Tra cứu Safety Card qua Gemini + Google Search grounding
 * @param {string} drugQuery
 * @param {string} condition
 * @param {{ age?: number|null, gender?: 'male'|'female'|null }} [patient]
 */
export async function lookupWithGoogleGrounding(drugQuery, condition, patient = {}) {
  const { age = null, gender = null } = patient;
  const genderLabel = gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '—';
  const ageLine = age != null ? `${age} tuổi` : 'chưa rõ';

  const prompt = `Bạn là trợ lý thông tin thuốc (KHÔNG phải bác sĩ) cho nhà thuốc Long Châu Việt Nam.

Người dùng khai báo:
- Tình trạng: "${condition}"
- Tuổi: ${ageLine}
- Giới tính: ${genderLabel}
- Muốn tra cứu thuốc/hoạt chất: "${drugQuery}"

Dùng Google Search để tìm thông tin đáng tin (ưu tiên tờ hướng dẫn sử dụng, nhà thuốc uy tín, cơ quan y tế VN).

Trả về JSON thuần:
{
  "drugName": "...",
  "activeIngredient": "...",
  "indications": "...",
  "contraindications": ["..."],
  "warnings": ["..."],
  "safetyLevel": "green|yellow|red",
  "safetySummary": "...",
  "ageAppropriate": "đánh giá phù hợp độ tuổi ${ageLine} — có/không/chỉ khi có chỉ định",
  "matchedRules": [{ "level": "green|yellow|red", "note": "đối chiếu tình trạng + tuổi + giới tính" }],
  "sourcesSummary": "tóm tắt nguồn đã tham khảo"
}

Quy tắc:
- Đối chiếu riêng độ tuổi (trẻ em, người cao tuổi) và giới tính (mang thai, cho con bú nếu nữ)
- safetyLevel=red nếu chống chỉ định rõ hoặc không phù hợp độ tuổi hoặc cần kê đơn
- Không khẳng định "được uống/chắc chắn an toàn"
- Nếu không đủ thông tin: safetyLevel=yellow, nói rõ cần hỏi dược sĩ`;

  const { text, grounding } = await geminiGenerate({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  });

  const parsed = parseLlmJson(text);
  if (!parsed) {
    throw new Error('Gemini không trả JSON hợp lệ cho Safety Card');
  }

  return {
    card: {
      condition,
      age,
      gender,
      genderLabel,
      drugName: parsed.drugName || drugQuery,
      activeIngredient: parsed.activeIngredient || '—',
      indications: parsed.indications || '—',
      contraindications: parsed.contraindications || [],
      warnings: parsed.warnings || [],
      safetyLevel: parsed.safetyLevel || 'yellow',
      safetySummary: parsed.safetySummary || 'Thận trọng — hỏi dược sĩ',
      ageAppropriate: parsed.ageAppropriate || null,
      matchedRules: parsed.matchedRules || [],
      source: parsed.sourcesSummary || 'Google Search (Gemini grounding)',
      timestamp: new Date().toISOString(),
      sources: grounding.length
        ? grounding
        : [{ title: 'Google Search', link: null, snippet: parsed.sourcesSummary || '' }],
    },
    mode: 'google+gemini',
  };
}
