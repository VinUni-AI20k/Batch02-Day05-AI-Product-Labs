/**
 * Luồng tra cứu thuốc theo flowchart: mục tiêu → đủ TT → chuẩn hóa → CSDL → kết quả / gợi ý
 */

export const LOOKUP_OBJECTIVES = [
  { id: 'indication', label: 'Công dụng', pattern: /công dụng|dùng để|chỉ định|trị\s/i },
  { id: 'usage', label: 'Cách dùng', pattern: /cách dùng|uống như|uống lúc|trước sau ăn/i },
  { id: 'dosage', label: 'Liều tham khảo', pattern: /liều|bao nhiêu viên|mỗi ngày mấy/i },
  { id: 'side_effects', label: 'Tác dụng phụ', pattern: /tác dụng phụ|side effect|phản ứng/i },
  { id: 'contraindications', label: 'Chống chỉ định', pattern: /chống chỉ định|không nên dùng|ai không dùng/i },
  { id: 'interactions', label: 'Tương tác', pattern: /tương tác|uống chung|kết hợp với/i },
];

/** @param {string} text */
export function detectLookupObjectives(text) {
  const t = String(text || '');
  const matched = LOOKUP_OBJECTIVES.filter((o) => o.pattern.test(t));
  return matched.length > 0 ? matched : LOOKUP_OBJECTIVES;
}

/**
 * @param {{ drugQuery?: string, condition?: string, age?: number|null, gender?: string|null }} ctx
 */
export function getMissingLookupFields(ctx) {
  /** @type {string[]} */
  const missing = [];
  if (!ctx.drugQuery?.trim()) missing.push('tên thuốc hoặc hoạt chất');
  if (!ctx.condition?.trim()) missing.push('tình trạng / triệu chứng');
  if (ctx.age == null) missing.push('tuổi');
  if (ctx.gender !== 'male' && ctx.gender !== 'female') missing.push('giới tính');
  return missing;
}

export function hasEnoughLookupInfo(ctx) {
  return getMissingLookupFields(ctx).length === 0;
}

/** @param {object} card @param {object} [drug] @param {string} [mode] */
export function buildStructuredLookup(card, drug = null, mode = 'database') {
  const warnings = Array.isArray(card.warnings) ? card.warnings : [];
  const contraindications = Array.isArray(card.contraindications) ? card.contraindications : [];
  const interactions =
    drug?.interactions ||
    card.interactions ||
    (warnings.some((w) => /tương tác/i.test(w)) ? warnings.filter((w) => /tương tác/i.test(w)) : []);

  const dosageText =
    drug?.dosage ||
    card.dosage ||
    card.usage ||
    'Theo nhãn thuốc, tờ hướng dẫn hoặc chỉ định dược sĩ/bác sĩ — không tự ý tăng liều.';

  const interactionText =
    Array.isArray(interactions) && interactions.length
      ? interactions.join('; ')
      : contraindications.length
        ? contraindications.join('; ')
        : 'Chưa có dữ liệu tương tác chi tiết — hỏi dược sĩ khi dùng kèm thuốc khác.';

  return {
    drugName: card.drugName,
    activeIngredient: card.activeIngredient,
    safetyLevel: card.safetyLevel || 'yellow',
    safetySummary: card.safetySummary || '',
    condition: card.condition || '',
    mode: mode || 'database',
    sources: card.sources || [{ title: card.source || 'Nguồn tra cứu', link: null, snippet: '' }],
    sections: [
      {
        n: 1,
        title: 'Tên thuốc / hoạt chất',
        body: `${card.drugName || '—'} (${card.activeIngredient || '—'})`,
      },
      {
        n: 2,
        title: 'Công dụng',
        body: card.indications || '—',
      },
      {
        n: 3,
        title: 'Cách dùng / liều tham khảo',
        body: dosageText,
      },
      {
        n: 4,
        title: 'Tác dụng phụ',
        body: warnings.length ? warnings.join('; ') : 'Theo tờ hướng dẫn — thường gặp ở mức nhẹ nếu dùng đúng liều.',
      },
      {
        n: 5,
        title: 'Chống chỉ định / tương tác',
        body: interactionText,
      },
    ],
    ageAppropriate: card.ageAppropriate || null,
    matchedRules: card.matchedRules || [],
  };
}

export function objectivesSummary(objectives) {
  if (!objectives?.length) return 'Tra cứu thông tin thuốc';
  return `Mục tiêu: ${objectives.map((o) => o.label).join(', ')}`;
}
