import { detectUrgent, findDrugCandidates, normalizeText, isExactDrugInDb, resolveExactDrug } from './drug-engine.js';

const SYMPTOM_HINT =
  /đau|sốt|ho|ngứa|mệt|buồn nôn|chóng mặt|khó thở|nôn|tiêu chảy|táo bón|đầy bụng|mề đay|dị ứng|sưng|viêm|mang thai|bầu|cho con bú|bị |đang bị/i;

const DRUG_QUESTION =
  /dùng được|có uống|uống được|an toàn|tương tác|kết hợp|uống chung|trước hay sau ăn|uống lúc nào|liều|tác dụng phụ|thì sao|thế nào|ra sao/i;

const GENERAL_QUESTION =
  /trước hay sau ăn|uống lúc nào|bao lâu|tác dụng phụ|bảo quản|uống cùng|kết hợp với/i;

/** @param {object} db @param {string} text */
export function checkEmergency(db, text) {
  return detectUrgent(db, text);
}

/** Lấy đúng tên thuốc khách gõ (không fuzzy) */
export function extractExplicitDrugQuery(text) {
  const t = text.trim();
  const patterns = [
    /(?:thuốc|hoạt chất)\s+([a-zA-Z0-9À-ỹ][a-zA-Z0-9À-ỹ+\-/]{1,40})(?:\s+thì|\s+thế|\s+có|\s+dùng|\s+được|\s+không|\?|$)/i,
    /(?:thuốc|hoạt chất)\s+([a-zA-Z0-9À-ỹ+\-]{2,40})/i,
    /^([a-zA-Z0-9À-ỹ+\-]{3,40})(?:\s+thì|\s+thế|\s+có|\s+dùng|\?|$)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) {
      const name = m[1].trim();
      if (name.length >= 2 && !looksLikeSymptom(name) && isValidDrugQueryToken(name)) return name;
    }
  }
  return null;
}

/** @param {object} db @param {string} text */
export function extractDrugName(db, text) {
  const explicit = extractExplicitDrugQuery(text);
  if (explicit) {
    if (isExactDrugInDb(db, explicit)) {
      const d = resolveExactDrug(db, explicit, null);
      return d?.name || explicit;
    }
    return explicit;
  }

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
      if (isExactDrugInDb(db, name)) {
        const d = resolveExactDrug(db, name, null);
        return d?.name || name;
      }
    }
  }

  const resolved = resolveExactDrug(db, t, null);
  if (resolved) return resolved.name;

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
  /tránh thai|ngừa thai|kế hoạch hóa|tránh mang thai|thuốc nào|thuốc gì|dùng thuốc gì|uống gì|nên dùng thuốc gì|nên uống gì|phù hợp/i;

const QUERY_STOPWORDS = new Set([
  'nao',
  'gi',
  'sao',
  'the',
  'vay',
  'duoc',
  'khong',
  'nen',
  'co',
  'thi',
  'la',
  'ok',
  'voi',
  'cho',
  'ban',
  'toi',
  'minh',
]);

function isValidDrugQueryToken(name) {
  const n = normalizeText(String(name || '').trim());
  if (n.length < 3) return false;
  if (QUERY_STOPWORDS.has(n)) return false;
  return true;
}

const FOLLOW_UP_DRUG =
  /thuốc này|thuốc đó|thuốc ấy|thuốc kia|loại này|con này|viên này|có nên dùng|có dùng được|dùng được không|uống được không|ổn không|an toàn không|như vậy có|vậy có|thế có|được không/i;

/** Hỏi tiếp về thuốc vừa gợi ý / thẻ vừa tra */
export function isFollowUpAboutSuggestedDrug(text, ctx = {}) {
  if (!ctx.drugQuery && !ctx.lastCardDrug) return false;
  const t = text.trim();
  if (!FOLLOW_UP_DRUG.test(t)) return false;
  if (extractExplicitDrugQuery(t)) return false;
  return true;
}

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

  if (DRUG_RECOMMEND.test(lower) && /thuốc nào|thuốc gì|uống gì|dùng thuốc gì|nên dùng thuốc/i.test(lower)) {
    const cond = extractSymptomText(t) || ctx.condition || 'tư vấn chung';
    return {
      condition: cond,
      drugQuery: cond,
      label: cond,
    };
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
 * @returns {'emergency'|'drug_lookup'|'follow_up_drug'|'drug_recommendation'|'symptom_advice'|'general_question'|'unclear'}
 */
export function classifyTextIntent(db, text, ctx = {}) {
  const t = text.trim();
  if (!t) return 'unclear';
  if (checkEmergency(db, t)) return 'emergency';

  if (isFollowUpAboutSuggestedDrug(t, ctx)) return 'follow_up_drug';

  const explicit = extractExplicitDrugQuery(t);
  if (explicit) return 'drug_lookup';

  if (extractRecommendationTopic(t, ctx)) return 'drug_recommendation';

  const drug = extractDrugName(db, t);
  if (drug && DRUG_QUESTION.test(t)) return 'drug_lookup';
  if (drug && !looksLikeSymptom(t)) return 'drug_lookup';

  if (looksLikeSymptom(t)) return 'symptom_advice';
  if (GENERAL_QUESTION.test(t)) return 'general_question';
  if (drug) return 'drug_lookup';

  return 'unclear';
}
