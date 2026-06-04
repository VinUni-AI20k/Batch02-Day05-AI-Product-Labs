import { hasGoogleCse, searchDrugInfo } from './google-cse.js';
import { parseLlmJson } from './parse-llm-json.js';

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function openaiKey() {
  return process.env.OPENAI_API_KEY?.trim() || '';
}

export function hasOpenAI() {
  return Boolean(openaiKey());
}

async function openaiFetch(path, body) {
  const key = openaiKey();
  if (!key) throw new Error('OPENAI_API_KEY chưa cấu hình');

  const res = await fetch(`https://api.openai.com/v1${path}`, {
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
    throw new Error(`OpenAI API: ${msg}`);
  }
  return data;
}

function extractResponseText(data) {
  if (typeof data.output_text === 'string' && data.output_text) return data.output_text;

  const fromOutput = (data.output || [])
    .flatMap((item) => {
      if (item.type === 'message' && Array.isArray(item.content)) {
        return item.content
          .filter((c) => c.type === 'output_text' || c.type === 'text')
          .map((c) => c.text || c.output_text || '');
      }
      if (item.type === 'output_text') return [item.text || ''];
      return [];
    })
    .filter(Boolean)
    .join('');

  if (fromOutput) return fromOutput;

  return data.choices?.[0]?.message?.content || '';
}

function extractSources(data) {
  /** @type {{ title: string, link: string|null, snippet: string }[]} */
  const sources = [];

  for (const item of data.output || []) {
    if (item.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const block of item.content) {
      for (const ann of block.annotations || []) {
        if (ann.type === 'url_citation' && ann.url) {
          sources.push({
            title: ann.title || ann.url,
            link: ann.url,
            snippet: '',
          });
        }
      }
    }
  }

  const seen = new Set();
  return sources.filter((s) => {
    if (seen.has(s.link)) return false;
    seen.add(s.link);
    return true;
  });
}

async function chatJson(prompt) {
  const data = await openaiFetch('/chat/completions', {
    model: OPENAI_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Bạn trả lời bằng JSON thuần, không markdown.',
      },
      { role: 'user', content: prompt },
    ],
  });
  return extractResponseText(data);
}

async function responsesWithWebSearch(prompt) {
  const data = await openaiFetch('/responses', {
    model: OPENAI_MODEL,
    tools: [{ type: 'web_search_preview' }],
    input: prompt,
  });
  return {
    text: extractResponseText(data),
    sources: extractSources(data),
  };
}

function patientContext(patient) {
  const { age = null, gender = null } = patient;
  const genderLabel = gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '—';
  const ageLine = age != null ? `${age} tuổi` : 'chưa rõ';
  return { genderLabel, ageLine, age, gender };
}

/**
 * Gợi ý tên thuốc khi user gõ sai
 */
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

Tìm thông tin đáng tin (ưu tiên tờ hướng dẫn sử dụng, nhà thuốc uy tín, cơ quan y tế VN).

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
  "sourcesSummary": "tóm tắt nguồn đã tham khảo"
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
      source: parsed.sourcesSummary || `OpenAI (${mode})`,
      timestamp: new Date().toISOString(),
      sources: sources.length
        ? sources
        : [{ title: parsed.sourcesSummary || 'OpenAI', link: null, snippet: mode }],
    },
    mode,
  };
}

/**
 * Tra cứu Safety Card qua OpenAI (+ web search hoặc Google CSE)
 */
export async function lookupWithOpenAI(drugQuery, condition, patient = {}) {
  const prompt = buildSafetyPrompt(drugQuery, condition, patient);
  /** @type {{ title: string, link: string|null, snippet: string }[]} */
  let sources = [];
  let text = '';
  let mode = 'openai';

  try {
    const result = await responsesWithWebSearch(
      `${prompt}\n\nDùng web search để tra cứu nguồn mới nhất. CHỈ trả về một object JSON thuần, không markdown, không giải thích thêm.`
    );
    text = result.text;
    sources = result.sources;
    mode = 'openai+web_search';
  } catch {
    if (hasGoogleCse()) {
      const items = await searchDrugInfo(drugQuery, condition);
      sources = items;
      const context = items
        .map((i, idx) => `[${idx + 1}] ${i.title}\n${i.snippet}\n${i.link}`)
        .join('\n\n');
      text = await chatJson(
        `${prompt}\n\nThông tin web tham khảo:\n${context || '(không có)'}`
      );
      mode = 'openai+google-cse';
    } else {
      text = await chatJson(prompt);
      mode = 'openai';
    }
  }

  let parsed = parseLlmJson(text);
  if (!parsed) {
    text = await chatJson(
      `${prompt}\n\nTrả về đúng một object JSON theo schema ở trên, không markdown.`
    );
    parsed = parseLlmJson(text);
    if (mode === 'openai+web_search') mode = 'openai+web_search+fallback';
  }

  if (!parsed) {
    throw new Error('OpenAI không trả JSON hợp lệ cho Safety Card');
  }

  return buildCard(parsed, drugQuery, condition, patient, sources, mode);
}

/**
 * Hội thoại tự nhiên — có thể gợi ý tra cứu thuốc
 * @param {{ role: string, content: string }[]} messages
 */
export async function chatConversational(messages, profile = {}, drugCatalog = '', disclaimer = '') {
  const { genderLabel, ageLine } = patientContext(profile);

  const system = `Bạn là Long Châu Safety Bot — trợ lý tư vấn an toàn thuốc OTC tại Việt Nam.
Trả lời tiếng Việt tự nhiên, thân thiện như dược sĩ, ngắn gọn (2–6 câu).
Không chẩn đoán bệnh. Triệu chứng khẩn cấp (khó thở, đau ngực, ngất...) → khuyên gọi 115 ngay.
${disclaimer}

Hồ sơ khách (nếu biết): tuổi ${ageLine}, giới tính ${genderLabel}, tình trạng: "${profile.condition || 'chưa rõ'}".

Thuốc có trong database nội bộ (ưu tiên gợi ý nếu phù hợp):
${drugCatalog || '(chưa có)'}

Trả về JSON:
{
  "reply": "câu trả lời tự nhiên cho khách",
  "lookupDrug": "tên thuốc/hoạt chất cần tra Thẻ an toàn hoặc null",
  "condition": "tình trạng/triệu chứng để tra cứu hoặc null"
}

Nếu khách hỏi nên dùng thuốc gì (vd tránh thai, đau đầu), trả lời trực tiếp trong reply và đặt lookupDrug nếu có tên thuốc cụ thể cần kiểm tra an toàn.`;

  const data = await openaiFetch('/chat/completions', {
    model: OPENAI_MODEL,
    temperature: 0.55,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      ...messages.slice(-14).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ],
  });

  const text = extractResponseText(data);
  const parsed = parseLlmJson(text);
  return {
    reply: parsed?.reply || text || 'Xin lỗi, mình chưa trả lời được — bạn thử hỏi lại hoặc gửi tên thuốc cụ thể nhé.',
    lookupDrug: parsed?.lookupDrug || null,
    condition: parsed?.condition || null,
  };
}
