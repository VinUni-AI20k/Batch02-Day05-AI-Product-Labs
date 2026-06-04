import {
  findDrugCandidates,
  evaluateSafety,
  buildSafetyCardPayload,
  normalizeText,
} from './drug-engine.js';

/**
 * @param {object} db
 * @param {string} query
 * @param {string|null} drugId
 */
export function resolveDrug(db, query, drugId = null) {
  if (drugId) {
    return db.drugs.find((d) => d.id === drugId) || null;
  }
  const candidates = findDrugCandidates(db, query);
  if (candidates.length === 1) return candidates[0];
  return null;
}

/** Tra cứu Safety Card từ DB demo — trên browser, không gọi mạng */
export function lookupLocalClient(db, drug, condition, patient) {
  const evaluation = evaluateSafety(drug, condition, patient);
  const card = buildSafetyCardPayload(drug, condition, evaluation, null, patient);
  return {
    status: 'ok',
    mode: 'database',
    dataSource: 'database',
    card: {
      ...card,
      sources: [
        {
          title: card.source,
          link: null,
          snippet: 'Database nội bộ — tra cứu tức thì',
        },
      ],
    },
  };
}

/** Gợi ý khi gõ sai — chỉ trong DB demo */
export function suggestLocal(db, query, limit = 5) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exact = findDrugCandidates(db, query);
  const seen = new Set();
  /** @type {object[]} */
  const out = [];

  for (const drug of exact) {
    if (seen.has(drug.id)) continue;
    seen.add(drug.id);
    out.push({
      name: drug.name,
      drugId: drug.id,
      activeIngredient: drug.activeIngredient,
      reason: 'Khớp trực tiếp trong DB',
    });
  }

  for (const drug of db.drugs) {
    if (seen.has(drug.id)) continue;
    const labels = [drug.name, drug.activeIngredient, ...(drug.aliases || [])];
    const hit = labels.some((label) => {
      const n = normalizeText(label);
      return levenshteinRatio(q, n) > 0.72;
    });
    if (hit) {
      seen.add(drug.id);
      out.push({
        name: drug.name,
        drugId: drug.id,
        activeIngredient: drug.activeIngredient,
        reason: 'Gần giống tên bạn nhập',
      });
    }
    if (out.length >= limit) break;
  }

  return out.slice(0, limit);
}

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
  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}
