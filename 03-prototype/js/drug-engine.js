/** @typedef {'green'|'yellow'|'red'} SafetyLevel */

/**
 * @param {object} db
 * @param {string} raw
 */
export function normalizeText(raw) {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * @param {object} db
 * @param {string} condition
 */
export function detectUrgent(db, condition) {
  const n = normalizeText(condition);
  return db.urgentKeywords.some((kw) => n.includes(normalizeText(kw)));
}

/**
 * @param {string} a
 * @param {string} b
 */
function levenshteinRatio(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}

function labelMatchesQuery(label, query) {
  const n = normalizeText(label);
  const q = normalizeText(query);
  if (!q) return false;
  if (n === q) return true;
  if (levenshteinRatio(q, n) >= 0.78) return true;
  if (q.length >= 3 && n.startsWith(q)) return true;
  if (q.length >= 4 && n.includes(q)) return true;
  return false;
}

/**
 * @param {object} db
 * @param {string} query
 */
export function findDrugCandidates(db, query) {
  const q = normalizeText(query);
  if (!q) return [];

  const matches = db.drugs.filter((drug) => {
    const labels = [drug.name, drug.activeIngredient, ...(drug.aliases || [])];
    return labels.some((label) => labelMatchesQuery(label, q));
  });

  const unique = [];
  const seen = new Set();
  for (const d of matches) {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      unique.push(d);
    }
  }
  return unique;
}

/** Khớp chính xác tên/hoạt chất/alias — không fuzzy */
export function isExactDrugInDb(db, query) {
  const q = normalizeText(query);
  if (!q) return false;
  return db.drugs.some(
    (d) =>
      normalizeText(d.name) === q ||
      normalizeText(d.activeIngredient) === q ||
      (d.aliases || []).some((a) => normalizeText(a) === q)
  );
}

/**
 * @param {object} db
 * @param {string} query
 * @param {string|null} drugId
 */
export function resolveExactDrug(db, query, drugId = null) {
  if (drugId) {
    return db.drugs.find((d) => d.id === drugId) || null;
  }
  if (!isExactDrugInDb(db, query)) return null;
  const candidates = findDrugCandidates(db, query).filter(
    (d) =>
      normalizeText(d.name) === normalizeText(query) ||
      normalizeText(d.activeIngredient) === normalizeText(query) ||
      (d.aliases || []).some((a) => normalizeText(a) === normalizeText(query))
  );
  return candidates.length >= 1 ? candidates[0] : null;
}

/**
 * @param {object} drug
 * @param {string} condition
 * @param {{ age?: number|null, gender?: 'male'|'female'|null }} [patient]
 */
export function evaluateSafety(drug, condition, patient = {}) {
  const n = normalizeText(condition);
  const { age = null, gender = null } = patient;
  /** @type {{ level: SafetyLevel, note: string }[]} */
  const hits = [];

  for (const rule of drug.conditionRules || []) {
    const matched = rule.match.some((m) => n.includes(normalizeText(m)));
    if (matched) hits.push({ level: rule.level, note: rule.note });
  }

  for (const ci of drug.contraindications || []) {
    const parts = normalizeText(ci).split(/\s+/);
    if (parts.some((p) => p.length > 3 && n.includes(p))) {
      hits.push({
        level: 'red',
        note: `Liên quan chống chỉ định: ${ci}`,
      });
    }
  }

  if (age != null && Number.isFinite(age)) {
    for (const rule of drug.ageRules || []) {
      if (rule.minAge != null && age < rule.minAge) continue;
      if (rule.maxAge != null && age > rule.maxAge) continue;
      hits.push({ level: rule.level, note: rule.note });
    }
  }

  if (gender && age != null) {
    for (const rule of drug.genderRules || []) {
      if (rule.gender !== gender) continue;
      if (rule.minAge != null && age < rule.minAge) continue;
      if (rule.maxAge != null && age > rule.maxAge) continue;
      hits.push({ level: rule.level, note: rule.note });
    }
  }

  if (hits.length === 0) {
    return {
      level: /** @type {SafetyLevel} */ ('yellow'),
      summary:
        'Chưa đủ dữ liệu demo để kết luận an toàn — nên hỏi dược sĩ Long Châu.',
      matchedRules: [],
    };
  }

  const order = { red: 3, yellow: 2, green: 1 };
  hits.sort((a, b) => order[b.level] - order[a.level]);
  const top = hits[0];

  const levelLabels = {
    green: 'An toàn có điều kiện',
    yellow: 'Thận trọng — nên hỏi dược sĩ',
    red: 'Không nên tự ý — cần chuyên môn / cấp cứu',
  };

  return {
    level: top.level,
    summary: levelLabels[top.level],
    matchedRules: hits,
  };
}

/** @param {unknown} raw @returns {number|null} */
export function parseAge(raw) {
  const m = String(raw ?? '').match(/\d+/);
  if (!m) return null;
  const age = Number(m[0]);
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  return age;
}

/** @param {unknown} raw @returns {'male'|'female'|null} */
export function parseGender(raw) {
  const t = normalizeText(String(raw ?? ''));
  if (['nam', 'male', 'boy', 'dan ong'].includes(t) || t === '__gender_male__') return 'male';
  if (['nu', 'nữ', 'female', 'girl', 'dan ba'].includes(t) || t === '__gender_female__') return 'female';
  return null;
}

/**
 * Trích tuổi + giới tính từ câu chat (vd: "35 tuổi, nữ", "35 tuổi nữ")
 * @param {string} text
 * @returns {{ age: number|null, gender: 'male'|'female'|null }}
 */
export function extractPatientFromMessage(text) {
  const t = String(text || '').trim();
  let age = null;
  let gender = null;

  const ageMatch =
    t.match(/(\d{1,3})\s*(?:tuổi|tuoi)/i) ||
    t.match(/(\d{1,3})\s*t(?=[\s,;·]|$)/i) ||
    t.match(/^(\d{1,3})(?:\s*[,;·]|\s+(?:nữ|nu|nam)\b)/i);
  if (ageMatch) age = parseAge(ageMatch[1]);

  const chunks = [t, ...t.split(/[,;·]/).map((s) => s.trim()).filter(Boolean)];
  for (const chunk of chunks) {
    const g = parseGender(chunk);
    if (g) gender = g;
  }

  const n = normalizeText(t);
  if (!gender) {
    if (/(^|[\s,;])nu($|[\s,;])|nữ|female|phu nu|dan ba/.test(n)) gender = 'female';
    else if (/(^|[\s,;])nam($|[\s,;])|male|dan ong/.test(n) && !/nam dinh/.test(n)) gender = 'male';
  }

  if (!age) {
    const bare = t.match(/^(\d{1,3})$/);
    if (bare) age = parseAge(bare[1]);
  }

  return { age, gender };
}

export function formatGender(gender) {
  return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '—';
}

function buildAgeAppropriateSummary(evaluation, age, gender) {
  const ageGenderHits = (evaluation.matchedRules || []).filter((r) =>
    /tuổi|trẻ|trẻ em|cao tuổi|mang thai|nữ|nam/i.test(r.note)
  );
  if (ageGenderHits.length) return ageGenderHits.map((h) => h.note).join(' ');
  if (age != null && gender) {
    return `Đã đối chiếu ${age} tuổi, giới tính ${formatGender(gender)} — chưa có rule độ tuổi cụ thể trong DB demo.`;
  }
  return null;
}

/**
 * @param {object} db
 */
export async function loadDrugDatabase() {
  const res = await fetch('./data/drugs-demo.json');
  if (!res.ok) throw new Error('Không tải được drugs-demo.json — chạy qua local server.');
  return res.json();
}

export function buildSafetyCardPayload(drug, condition, evaluation, userName, patient = {}) {
  const { age = null, gender = null } = patient;
  return {
    userName: userName || null,
    condition,
    age,
    gender,
    genderLabel: formatGender(gender),
    drugName: drug.name,
    activeIngredient: drug.activeIngredient,
    indications: drug.indications,
    contraindications: drug.contraindications,
    warnings: drug.warnings,
    safetyLevel: evaluation.level,
    safetySummary: evaluation.summary,
    ageAppropriate: buildAgeAppropriateSummary(evaluation, age, gender),
    matchedRules: evaluation.matchedRules,
    source: drug.source,
    timestamp: new Date().toISOString(),
  };
}
