import { parseLlmJson } from './parse-llm-json.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

const OCR_PROMPT = `Bạn đọc ảnh nhãn/hộp/vỉ thuốc Việt Nam. CHỈ trả JSON thuần:
{
  "detected_drug_name": "",
  "active_ingredient": "",
  "strength": "",
  "dosage_form": "",
  "expiry_date": "",
  "manufacturer": "",
  "confidence": "low|medium|high",
  "need_user_confirmation": true,
  "notes": "ghi chú nếu ảnh mờ"
}
Không đoán thuốc chỉ từ màu viên. Nếu không đọc rõ → confidence=low.`;

async function ocrWithGemini(base64, mimeType) {
  const key = process.env.GEMINI_API_KEY.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: OCR_PROMPT },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Gemini OCR lỗi');
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  return parseLlmJson(text);
}

async function ocrWithOpenAI(base64, mimeType) {
  const key = process.env.OPENAI_API_KEY.trim();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'OpenAI OCR lỗi');
  return parseLlmJson(data.choices?.[0]?.message?.content || '');
}

/** @param {string} base64 @param {string} mimeType */
export async function ocrDrugImage(base64, mimeType = 'image/jpeg') {
  if (hasGemini()) {
    try {
      const parsed = await ocrWithGemini(base64, mimeType);
      if (parsed) return { ...parsed, source: 'gemini_ocr' };
    } catch {
      // fallback
    }
  }
  if (hasOpenAI()) {
    try {
      const parsed = await ocrWithOpenAI(base64, mimeType);
      if (parsed) return { ...parsed, source: 'openai_ocr' };
    } catch {
      // fallback
    }
  }

  return {
    detected_drug_name: '',
    active_ingredient: '',
    strength: '',
    dosage_form: '',
    expiry_date: '',
    confidence: 'low',
    need_user_confirmation: true,
    notes: 'Chưa có API vision — thêm GEMINI_API_KEY hoặc OPENAI_API_KEY, hoặc nhập tay tên thuốc.',
    source: 'mock',
  };
}
