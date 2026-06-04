import { detectUrgent, findDrugCandidates, normalizeText } from './drug-engine.js';
import { resolveDrug } from './local-lookup.js';

const SYMPTOM_HINT =
  /đau|sốt|ho|ngứa|mệt|buồn nôn|chóng mặt|khó thở|nôn|tiêu chảy|táo bón|đầy bụng|mề đay|dị ứng|sưng|viêm|mang thai|bầu|cho con bú|bị |đang bị/i;

const DRUG_QUESTION =
  /dùng được|có uống|uống được|an toàn|tương tác|kết hợp|uống chung|trước hay sau ăn|uống lúc nào|liều|tác dụng phụ/i;

const GENERAL_QUESTION =
  /trước hay sau ăn|uống lúc nào|bao lâu|tác dụng phụ|bảo quản|uống cùng|kết hợp với/i;

/** @param {object} db @param {string} text */
export function checkEmergency(db, text) {
  return detectUrgent(db, text);
}

/** @param {object} db @param {string} text */
export function extractDrugName(db, text) {
  const t = text.trim();
  if (!t) return null;

  const patterns = [
    /(?:thuốc|hoạt chất)\s+([A-Za-z0-9À-ỹ\s+\-/]+?)(?:\s+có|\s+dùng|\s+an toàn|\?|$)/i,
    /^([A-Za-z0-9À-ỹ+\-/]{2,40})(?:\s+có|\s+dùng|\s+an toàn|\?)/i,
    /([A-Za-z0-9À-ỹ+\-/]{3,40})\s+có dùng/i,
  ];

  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) {
      const name = m[1].trim();
      if (resolveDrug(db, name, null)) return name;
      const c = findDrugCandidates(db, name);
      if (c.length >= 1) return c[0].name;
    }
  }

  const resolved = resolveDrug(db, t, null);
  if (resolved) return resolved.name;

  const candidates = findDrugCandidates(db, t);
  if (candidates.length === 1 && !looksLikeSymptom(t)) return candidates[0].name;

  const words = t.split(/\s+/).filter((w) => w.length > 2);
  for (const w of words) {
    const r = resolveDrug(db, w, null);
    if (r) return r.name;
  }

  return null;
}

export function looksLikeSymptom(text) {
  const t = text.trim();
  if (!t) return false;
  if (SYMPTOM_HINT.test(t)) return true;
  if (/nên dùng thuốc gì|uống gì|làm sao|tư vấn/i.test(t)) return true;
  return false;
}

export function extractSymptomText(text) {
  let t = text.trim();
  t = t.replace(/^(tôi |mình |em |chị |anh )?(đang )?(bị |gặp )?/i, '');
  t = t.replace(/\?.*$/, '').trim();
  t = t.replace(/(nên dùng thuốc gì|uống gì|phải làm sao).*$/i, '').trim();
  return t || text.trim();
}

const DRUG_RECOMMEND =
  /tránh thai|ngừa thai|kế hoạch hóa|tránh mang thai|thuốc nào|dùng thuốc gì|uống gì|nên uống|nên dùng|dùng loại nào|hợp lý|phù hợp/i;

const FOLLOW_UP =
  /^(tiếp|thế|vậy|ok|oke|còn|mà|cho hỏi|hỏi thêm)/i;

/** @param {object} ctx */
export function extractRecommendationTopic(text, ctx = {}) {
  const t = text.trim();
  const lower = t.toLowerCase();

  if (/tránh thai|ngừa thai|kế hoạch hóa|tránh mang thai/.test(lower)) {
    return {
      condition: 'tư vấn tránh thai',
      drugQuery: 'thuốc tránh thai',
      label: 'tránh thai',
    };
  }

  if (/đau đầu|nhức đầu/.test(lower) && DRUG_RECOMMEND.test(lower)) {
    return { condition: 'đau đầu', drugQuery: 'Paracetamol', label: 'đau đầu' };
  }

  if (/sốt/.test(lower) && DRUG_RECOMMEND.test(lower)) {
    return { condition: 'sốt nhẹ', drugQuery: 'Paracetamol', label: 'sốt' };
  }

  if (/đau bụng|đau bụng/.test(lower) && DRUG_RECOMMEND.test(lower)) {
    return { condition: 'đau bụng', drugQuery: 'thuốc giảm đau bụng', label: 'đau bụng' };
  }

  if (DRUG_RECOMMEND.test(lower)) {
    const cond = extractSymptomText(t) || ctx.condition || 'tư vấn chung';
    return {
      condition: cond,
      drugQuery: cond,
      label: cond,
    };
  }

  if (FOLLOW_UP.test(lower) && ctx.condition && /thuốc|dùng|uống|tránh/.test(lower)) {
    return extractRecommendationTopic(`${ctx.condition} ${t}`, ctx);
  }

  return null;
}

/**
 * @param {object} db
 * @param {string} text
 * @returns {'emergency'|'drug_lookup'|'drug_recommendation'|'symptom_advice'|'general_question'|'unclear'}
 */
export function classifyTextIntent(db, text) {
  const t = text.trim();
  if (!t) return 'unclear';
  if (checkEmergency(db, t)) return 'emergency';

  if (extractRecommendationTopic(t, {})) return 'drug_recommendation';

  const drug = extractDrugName(db, t);
  if (drug && DRUG_QUESTION.test(t)) return 'drug_lookup';
  if (drug && !looksLikeSymptom(t)) return 'drug_lookup';

  if (looksLikeSymptom(t)) return 'symptom_advice';
  if (GENERAL_QUESTION.test(t)) return 'general_question';
  if (drug) return 'drug_lookup';

  return 'unclear';
}
