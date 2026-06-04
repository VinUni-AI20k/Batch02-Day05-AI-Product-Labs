import { normalizeText, evaluateSafety } from './drug-engine.js';
import { parseIntakeAnswers } from './symptom-flow.js';

/** @typedef {'symptom'|'drug'|'ocr'|'compatibility'} MainNeed */

export const MAIN_NEEDS = [
  {
    id: 'symptom',
    code: 'A',
    title: 'Tôi đang có triệu chứng',
    hint: 'Gợi ý thuốc OTC phù hợp sau khi sàng lọc an toàn',
  },
  {
    id: 'drug',
    code: 'B',
    title: 'Tôi muốn hỏi về một thuốc/hoạt chất',
    hint: 'Tra cứu công dụng, liều, tác dụng phụ, tương tác',
  },
  {
    id: 'ocr',
    code: 'C',
    title: 'Tôi muốn chụp ảnh thuốc/đơn thuốc',
    hint: 'OCR nhãn thuốc rồi tra cứu an toàn',
  },
  {
    id: 'compatibility',
    code: 'D',
    title: 'Kiểm tra thuốc có phù hợp với tình trạng của tôi',
    hint: 'Đối chiếu thuốc với tuổi, bệnh nền, thuốc đang dùng',
  },
];

export const SAFETY_DISCLAIMER =
  'Bot không thay thế bác sĩ, không tự kê đơn thuốc. Thông tin chỉ mang tính tham khảo.';

export const INTAKE_PROMPT = `Để kiểm tra an toàn, mình cần một số thông tin cơ bản:

• Tuổi, giới tính
• Cân nặng (nếu biết)
• Có mang thai / cho con bú không?
• Bệnh nền (gan, thận, tim, dạ dày, hen, tiểu đường…)
• Dị ứng thuốc nào không?
• Đang dùng thuốc nào khác?
• Triệu chứng kéo dài bao lâu? (nếu có)

Bạn trả lời gọn một tin nhắn (vd: <em>30 tuổi, nữ, sốt 2 ngày, không mang thai, không dị ứng</em>).`;

const TRIAGE_SETS = {
  'đau bụng': [
    { id: 'severe', q: 'Đau dữ dội hoặc đau tăng nhanh?', danger: true },
    { id: 'fever', q: 'Có sốt cao?', danger: true },
    { id: 'vomit', q: 'Nôn liên tục, không giữ được nước?', danger: true },
    { id: 'blood', q: 'Đi ngoài ra máu hoặc phân đen?', danger: true },
    { id: 'chest', q: 'Đau bụng kèm khó thở hoặc đau ngực?', danger: true },
    { id: 'pregnant', q: 'Phụ nữ có thai bị đau bụng?', danger: true },
    { id: 'dehydration', q: 'Trẻ nhỏ / người già có dấu hiệu mất nước nặng?', danger: true },
  ],
  default: [
    { id: 'severe', q: 'Triệu chứng đột ngột, dữ dội hoặc tệ đi nhanh?', danger: true },
    { id: 'breath', q: 'Khó thở, đau ngực, choáng hoặc ngất?', danger: true },
    { id: 'bleed', q: 'Chảy máu bất thường, phản vệ, sưng mặt/môi?', danger: true },
    { id: 'pregnant', q: 'Đang mang thai / cho con bú và triệu chứng nặng?', danger: true },
  ],
};

const YES = /^(có|co|yes|đúng|dung|1|ok)\b|(^|\s)(có|co)(\s|$)/i;
const NO = /^(không|khong|no|0|chưa)\b|(^|\s)(không|khong)(\s|$)/i;

/** @param {string} condition */
export function getTriageQuestions(condition) {
  const n = normalizeText(condition || '');
  for (const key of Object.keys(TRIAGE_SETS)) {
    if (key !== 'default' && n.includes(normalizeText(key))) {
      return TRIAGE_SETS[key];
    }
  }
  return TRIAGE_SETS.default;
}

/** @param {string} text @param {object} answers @param {object[]} questions */
export function parseTriageAnswers(text, answers = {}, questions = []) {
  const out = { ...answers };
  const t = text.trim();

  for (const q of questions) {
    const re = new RegExp(`${q.id}\\s*[:\\-]?\\s*(có|không|co|khong|yes|no)`, 'i');
    const m = t.match(re);
    if (m) {
      out[q.id] = /có|co|yes/i.test(m[1]);
      continue;
    }
  }

  if (/tất cả\s*(đều\s*)?không|không có|không gì|toàn không/i.test(t)) {
    for (const q of questions) {
      if (out[q.id] === undefined) out[q.id] = false;
    }
  }

  const lines = t.split(/[,;·\n]/).map((s) => s.trim()).filter(Boolean);
  for (const line of lines) {
    for (const q of questions) {
      if (out[q.id] !== undefined) continue;
      const snippet = normalizeText(line);
      const qNorm = normalizeText(q.q.slice(0, 12));
      if (snippet.length > 3 && (snippet.includes(qNorm.slice(0, 8)) || line.length < 40)) {
        if (YES.test(line)) out[q.id] = true;
        else if (NO.test(line)) out[q.id] = false;
      }
    }
  }

  if (Object.keys(out).length === 0) {
    if (YES.test(t) && t.length < 20) {
      for (const q of questions) out[q.id] = true;
    } else if (NO.test(t) && t.length < 30) {
      for (const q of questions) out[q.id] = false;
    }
  }

  return out;
}

export function triageComplete(answers, questions) {
  return questions.every((q) => typeof answers[q.id] === 'boolean');
}

/** @param {object} answers @param {object[]} questions */
export function triageHasDanger(answers, questions) {
  return questions.some((q) => q.danger && answers[q.id] === true);
}

/** @param {string} text @param {object} ctx */
export function parseExtendedIntake(text, ctx = {}) {
  const out = parseIntakeAnswers(text, ctx);

  const weightMatch = text.match(/(\d{2,3}(?:[.,]\d)?)\s*kg/i);
  if (weightMatch) out.weightKg = Number(String(weightMatch[1]).replace(',', '.'));

  if (/đang dùng|uống|dùng thêm|kết hợp/i.test(text)) {
    const med = text.match(/(?:đang dùng|uống|dùng thêm|kết hợp)[^,\n.]*/i);
    if (med) out.medications = med[0];
  }

  if (/hen|tiểu đường|đái tháo đường|huyết áp|tim mạch|dạ dày|gan|thận/i.test(text)) {
    out.medical_conditions = out.medical_conditions || [];
    const found = text.match(/(hen|tiểu đường|đái tháo đường|huyết áp|tim mạch|dạ dày|gan|thận)[^,\n.]*/gi);
    if (found) out.medical_conditions = [...new Set([...(out.medical_conditions || []), ...found])];
  }

  return out;
}

export function intakeBasicComplete(ctx) {
  return ctx.age != null && (ctx.gender === 'male' || ctx.gender === 'female');
}

export function needSymptomContext(mainNeed) {
  return mainNeed === 'symptom' || mainNeed === 'compatibility';
}

export function needDrugContext(mainNeed) {
  return mainNeed === 'drug' || mainNeed === 'compatibility';
}

/**
 * Safety Check Engine — 6 checks theo flow
 * @param {object} drug
 * @param {object} evaluation
 * @param {object} profile
 * @param {string} condition
 */
export function runSafetyChecks(drug, evaluation, profile = {}, condition = '') {
  const nCond = normalizeText(condition);
  const nAllergies = normalizeText(String(profile.allergies || ''));
  const nMeds = normalizeText(String(profile.medications || ''));
  const conditions = (profile.medical_conditions || []).map(normalizeText);
  const ingredient = normalizeText(drug?.activeIngredient || '');

  /** @type {{ id: number, name: string, status: 'pass'|'warn'|'fail', note: string }[]} */
  const checks = [];

  const riskGroup =
    (profile.age != null && profile.age < 2) ||
    (profile.age != null && profile.age >= 65) ||
    profile.pregnancy_or_breastfeeding === true;
  checks.push({
    id: 1,
    name: 'Nhóm nguy cơ (trẻ nhỏ, cao tuổi, mang thai/cho bú)',
    status: riskGroup ? 'warn' : 'pass',
    note: riskGroup
      ? 'Thuộc nhóm cần thận trọng liều lượng — nên hỏi dược sĩ.'
      : 'Chưa ghi nhận nhóm nguy cơ đặc biệt từ thông tin bạn cung cấp.',
  });

  const allergyHit =
    nAllergies &&
    (nAllergies.includes(ingredient) ||
      (drug?.contraindications || []).some((c) => nAllergies.includes(normalizeText(c))));
  checks.push({
    id: 2,
    name: 'Dị ứng với hoạt chất',
    status: allergyHit ? 'fail' : nAllergies ? 'pass' : 'warn',
    note: allergyHit
      ? 'Có dấu hiệu dị ứng liên quan hoạt chất — không tự dùng.'
      : nAllergies
        ? 'Chưa thấy trùng hoạt chất trong dị ứng đã khai.'
        : 'Chưa khai báo dị ứng — nên xác nhận trước khi dùng.',
  });

  const ciHit = (drug?.contraindications || []).some((ci) => {
    const p = normalizeText(ci);
    return conditions.some((c) => c && (p.includes(c) || c.includes(p.split(' ')[0]))) || nCond.includes(p.slice(0, 8));
  });
  checks.push({
    id: 3,
    name: 'Bệnh nền / chống chỉ định',
    status: ciHit || evaluation.level === 'red' ? 'fail' : evaluation.level === 'yellow' ? 'warn' : 'pass',
    note: ciHit
      ? 'Có yếu tố chống chỉ định liên quan bệnh nền hoặc tình trạng.'
      : evaluation.matchedRules?.find((r) => r.level === 'red')?.note || 'Chưa phát hiện chống chỉ định rõ trong DB demo.',
  });

  const interactionHint =
    nMeds && /warfarin|aspirin|kháng sinh|thuốc huyết áp|insulin|metformin/i.test(nMeds);
  checks.push({
    id: 4,
    name: 'Tương tác thuốc đang dùng',
    status: interactionHint ? 'warn' : nMeds ? 'warn' : 'pass',
    note: interactionHint
      ? 'Đang dùng thuốc có thể tương tác — cần dược sĩ đối chiếu.'
      : nMeds
        ? 'Có thuốc đang dùng — nên xác nhận tương tác tại nhà thuốc.'
        : 'Chưa ghi nhận thuốc đang dùng khác.',
  });

  const isRx = drug?.otc === false || /kê đơn|prescription/i.test(String(drug?.warnings?.join(' ') || ''));
  checks.push({
    id: 5,
    name: 'OTC hay thuốc kê đơn',
    status: isRx ? 'warn' : 'pass',
    note: isRx ? 'Thuốc kê đơn — không tự mua/uống nếu chưa có chỉ định.' : 'Thuốc OTC thường gặp trong nhà thuốc.',
  });

  const indicationMatch = (drug?.conditionRules || []).some((r) =>
    r.match.some((m) => nCond.includes(normalizeText(m)))
  );
  checks.push({
    id: 6,
    name: 'Triệu chứng có phù hợp công dụng thuốc',
    status: indicationMatch ? 'pass' : nCond ? 'warn' : 'warn',
    note: indicationMatch
      ? 'Triệu chứng phù hợp nhóm công dụng trong DB demo.'
      : 'Chưa đủ dữ liệu để khẳng định phù hợp chỉ định — cần dược sĩ.',
  });

  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;

  let suitability = 'Phù hợp';
  let confidence = 'Cao';
  if (failCount > 0 || evaluation.level === 'red') {
    suitability = 'Không nên tự dùng';
    confidence = evaluation.level === 'red' ? 'Cao' : 'Trung bình';
  } else if (warnCount > 0 || evaluation.level === 'yellow') {
    suitability = 'Cần thận trọng';
    confidence = 'Trung bình';
  }

  return { checks, suitability, confidence };
}

export function suitabilityFromLevel(level) {
  if (level === 'green') return 'Phù hợp';
  if (level === 'red') return 'Không nên tự dùng';
  return 'Cần thận trọng';
}

export function whenToSeeProfessional(level, suitability) {
  if (level === 'red' || suitability === 'Không nên tự dùng') {
    return 'Gặp bác sĩ/dược sĩ trước khi dùng; đến CSYT nếu triệu chứng nặng.';
  }
  if (level === 'yellow') {
    return 'Hỏi dược sĩ Long Châu trước khi mua/uống, đặc biệt khi dùng > 3 ngày.';
  }
  return 'Nếu triệu chứng không cải thiện sau 2–3 ngày hoặc nặng hơn — gặp dược sĩ/bác sĩ.';
}

/** Map intent → main need when user types thay vì bấm nút */
export function intentToMainNeed(intent) {
  const map = {
    symptom_advice: 'symptom',
    drug_recommendation: 'symptom',
    drug_lookup: 'drug',
    follow_up_drug: 'compatibility',
    general_question: 'drug',
  };
  return map[intent] || null;
}
