/** @param {object} card @param {object} [drug] */
export function buildStructuredFromCard(card, drug = null) {
  const warnings = Array.isArray(card.warnings) ? card.warnings : [];
  const contraindications = Array.isArray(card.contraindications) ? card.contraindications : [];

  return {
    drugName: card.drugName,
    activeIngredient: card.activeIngredient,
    safetyLevel: card.safetyLevel,
    safetySummary: card.safetySummary,
    condition: card.condition,
    sections: [
      {
        n: 1,
        title: 'Tên thuốc / hoạt chất',
        body: `${card.drugName} (${card.activeIngredient})`,
      },
      { n: 2, title: 'Công dụng', body: card.indications || '—' },
      {
        n: 3,
        title: 'Cách dùng / liều tham khảo',
        body: drug?.dosage || 'Theo nhãn thuốc hoặc chỉ định dược sĩ/bác sĩ.',
      },
      {
        n: 4,
        title: 'Tác dụng phụ',
        body: warnings.length ? warnings.join('; ') : 'Xem tờ hướng dẫn sử dụng.',
      },
      {
        n: 5,
        title: 'Chống chỉ định / tương tác',
        body: contraindications.length
          ? contraindications.join('; ')
          : 'Hỏi dược sĩ nếu có bệnh nền hoặc dùng nhiều thuốc.',
      },
    ],
    ageAppropriate: card.ageAppropriate,
    matchedRules: card.matchedRules || [],
    sources: card.sources || [],
  };
}
