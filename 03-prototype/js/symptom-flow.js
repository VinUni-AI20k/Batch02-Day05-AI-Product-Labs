import { normalizeText, parseAge, parseGender, extractPatientFromMessage } from './drug-engine.js';

export const INTAKE_PROMPT = `Mình cần hỏi thêm vài thông tin để kiểm tra an toàn trước khi gợi ý thuốc:

1. Bạn bao nhiêu tuổi?
2. Giới tính (Nam/Nữ)?
3. Đau/triệu chứng ở vị trí nào, bao lâu rồi?
4. Mức độ (1–10) nếu có đau?
5. Có sốt, nôn, tiêu chảy, đi ngoài ra máu, khó thở hoặc đau ngực không?
6. Mang thai/cho con bú, bệnh nền, dị ứng thuốc, thuốc đang dùng?

Bạn có thể trả lời gọn trong một tin nhắn (vd: "30 tuổi, nữ, đau bụng vùng rốn 2 ngày, mức 5, không sốt").`;

/**
 * @param {object} db
 * @param {string} conditionText
 */
export function suggestDrugsForCondition(db, conditionText) {
  const n = normalizeText(conditionText);
  /** @type {{ drug: object, level: string, note: string, score: number }[]} */
  const hits = [];

  for (const drug of db.drugs) {
    for (const rule of drug.conditionRules || []) {
      const matched = rule.match.some((m) => n.includes(normalizeText(m)));
      if (!matched) continue;
      const score = rule.level === 'green' ? 3 : rule.level === 'yellow' ? 2 : 1;
      hits.push({ drug, level: rule.level, note: rule.note, score });
      break;
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const seen = new Set();
  return hits
    .filter((h) => {
      if (seen.has(h.drug.id)) return false;
      seen.add(h.drug.id);
      return true;
    })
    .slice(0, 5);
}

/** @param {string} text @param {object} ctx */
export function parseIntakeAnswers(text, ctx = {}) {
  const out = { ...ctx };
  const { age, gender } = extractPatientFromMessage(text);
  if (age != null) out.age = age;
  if (gender) out.gender = gender;

  const t = text;

  if (/mang thai|đang bầu|cho con bú/i.test(t)) out.pregnancy_or_breastfeeding = true;
  if (/không mang thai|không bầu|không cho con bú/i.test(t)) out.pregnancy_or_breastfeeding = false;

  const sev = t.match(/mức\s*(\d{1,2})|độ\s*(\d{1,2})/i);
  if (sev) out.severity = Number(sev[1] || sev[2]);

  if (/(\d+)\s*ngày|(\d+)\s*tiếng|(\d+)\s*giờ/i.test(t)) {
    out.duration = t.match(/(\d+\s*(?:ngày|tiếng|giờ|tuần)[^\n,]*)/i)?.[1] || '';
  }

  if (/dị ứng/i.test(t)) {
    out.allergies = t.match(/dị ứng[^,\n.]*/i)?.[0] || 'có dị ứng';
  }

  if (/bệnh nền|tiểu đường|gan|thận|tim/i.test(t)) {
    out.medical_conditions = t.match(/(tiểu đường|gan|thận|tim|huyết áp)[^,\n.]*/gi) || [];
  }

  out.raw_notes = out.raw_notes ? `${out.raw_notes}; ${t}` : t;
  return out;
}

export function intakeComplete(ctx) {
  return ctx.age != null && (ctx.gender === 'male' || ctx.gender === 'female');
}

export function buildConditionSummary(ctx, baseSymptom) {
  const parts = [baseSymptom];
  if (ctx.duration) parts.push(`thời gian: ${ctx.duration}`);
  if (ctx.severity != null) parts.push(`mức độ ${ctx.severity}/10`);
  if (ctx.raw_notes && !parts.join(' ').includes(ctx.raw_notes.slice(0, 20))) {
    parts.push(ctx.raw_notes.slice(0, 120));
  }
  return parts.filter(Boolean).join(' · ');
}
