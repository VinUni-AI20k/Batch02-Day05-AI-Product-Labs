import { hasGoogleCse, searchDrugInfo } from './google-cse.js';
import { parseLlmJson } from './parse-llm-json.js';

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');

function deepseekKey() {
  return process.env.DEEPSEEK_API_KEY?.trim() || '';
}

export function hasDeepSeek() {
  return Boolean(deepseekKey());
}

async function deepseekFetch(path, body) {
  const key = deepseekKey();
  if (!key) throw new Error('DEEPSEEK_API_KEY chưa cấu hình');

  const res = await fetch(`${DEEPSEEK_BASE_URL}/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`DeepSeek API: ${msg}`);
  }
  return data;
}

async function chatJson(prompt) {
  const data = await deepseekFetch('/chat/completions', {
    model: DEEPSEEK_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Bạn trả lời bằng JSON thuần, không markdown.' },
      { role: 'user', content: prompt },
    ],
  });
  return data.choices?.[0]?.message?.content || '';
}

function patientContext(patient) {
  const { age = null, gender = null } = patient;
  const genderLabel = gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '—';
  const ageLine = age != null ? `${age} tuổi` : 'chưa rõ';
  return { genderLabel, ageLine, age, gender };
}

export async function suggestSpelling(query, localHints = []) {
  const hintList = localHints
    .map((h) => `- ${h.label || h.drug?.name} (hoạt chất: ${h.drug?.activeIngredient || '—'})`)
    .join('\n');

  const prompt = `Người dùng Việt Nam gõ sai tên thuốc: "${query}"

Gợi ý từ hệ thống (có thể đúng):
${hintList || '(không có)'}

Trả về JSON:
{
  "correctedQuery": "tên thuốc/hoạt chất đúng nhất",
  "suggestions": [
    { "name": "...", "activeIngredient": "...", "reason": "vì sao gợi ý" }
  ],
  "confidence": "high|medium|low"
}

Chỉ gợi ý thuốc OTC/phổ biến tại Việt Nam. Tối đa 4 gợi ý.`;

  const text = await chatJson(prompt);
  return parseLlmJson(text) || { correctedQuery: query, suggestions: [], confidence: 'low', raw: text };
}

function buildSafetyPrompt(drugQuery, condition, patient) {
  const { genderLabel, ageLine } = patientContext(patient);

  return `Bạn là trợ lý thông tin thuốc (KHÔNG phải bác sĩ) cho nhà thuốc Long Châu Việt Nam.

Người dùng khai báo:
- Tình trạng: "${condition}"
- Tuổi: ${ageLine}
- Giới tính: ${genderLabel}
- Muốn tra cứu thuốc/hoạt chất: "${drugQuery}"

Trả về JSON:
{
  "drugName": "...",
  "activeIngredient": "...",
  "indications": "...",
  "contraindications": ["..."],
  "warnings": ["..."],
  "safetyLevel": "green|yellow|red",
  "safetySummary": "...",
  "ageAppropriate": "đánh giá phù hợp độ tuổi ${ageLine}",
  "matchedRules": [{ "level": "green|yellow|red", "note": "đối chiếu tình trạng + tuổi + giới tính" }],
  "sourcesSummary": "tóm tắt nguồn tham khảo"
}

Quy tắc:
- Đối chiếu độ tuổi (trẻ em, người cao tuổi) và giới tính (mang thai, cho con bú nếu nữ)
- safetyLevel=red nếu chống chỉ định rõ hoặc không phù hợp độ tuổi hoặc cần kê đơn
- Không khẳng định "được uống/chắc chắn an toàn"
- Nếu không đủ thông tin: safetyLevel=yellow, nói rõ cần hỏi dược sĩ`;
}

function buildCard(parsed, drugQuery, condition, patient, sources, mode) {
  const { age, gender, genderLabel } = patientContext(patient);

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
      source: parsed.sourcesSummary || `DeepSeek (${mode})`,
      timestamp: new Date().toISOString(),
      sources: sources.length
        ? sources
        : [{ title: parsed.sourcesSummary || 'DeepSeek', link: null, snippet: mode }],
    },
    mode,
  };
}

/** Tra cứu Safety Card qua DeepSeek (+ Google CSE nếu có) */
export async function lookupWithDeepSeek(drugQuery, condition, patient = {}) {
  const prompt = buildSafetyPrompt(drugQuery, condition, patient);
  /** @type {{ title: string, link: string|null, snippet: string }[]} */
  let sources = [];
  let text = '';
  let mode = 'deepseek';

  if (hasGoogleCse()) {
    const items = await searchDrugInfo(drugQuery, condition);
    sources = items;
    const context = items
      .map((i, idx) => `[${idx + 1}] ${i.title}\n${i.snippet}\n${i.link}`)
      .join('\n\n');
    text = await chatJson(
      `${prompt}\n\nThông tin web tham khảo:\n${context || '(không có)'}`
    );
    mode = 'deepseek+google-cse';
  } else {
    text = await chatJson(prompt);
  }

  const parsed = parseLlmJson(text);
  if (!parsed) {
    throw new Error('DeepSeek không trả JSON hợp lệ cho Safety Card');
  }

  return buildCard(parsed, drugQuery, condition, patient, sources, mode);
}

/** @param {{ role: string, content: string }[]} messages */
export async function chatConversational(messages, profile = {}, drugCatalog = '', disclaimer = '') {
  const { genderLabel, ageLine } = patientContext(profile);
  const system = `Bạn là Long Châu Safety Bot. Trả lời tiếng Việt tự nhiên, ngắn gọn. ${disclaimer}
Hồ sơ: ${ageLine}, ${genderLabel}, tình trạng: "${profile.condition || 'chưa rõ'}".
Thuốc DB: ${drugCatalog}
JSON: {"reply":"...","lookupDrug":null|"tên thuốc","condition":null|"tình trạng"}`;

  const text = await chatJson(
    `${system}\n\nLịch sử:\n${messages
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')}\n\nTrả JSON cho tin nhắn cuối của user.`
  );
  const parsed = parseLlmJson(text);
  return {
    reply: parsed?.reply || text,
    lookupDrug: parsed?.lookupDrug || null,
    condition: parsed?.condition || null,
  };
}
