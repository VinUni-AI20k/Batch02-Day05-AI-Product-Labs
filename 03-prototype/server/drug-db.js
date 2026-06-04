import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Fuse from 'fuse.js';
import {
  findDrugCandidates,
  evaluateSafety,
  buildSafetyCardPayload,
  normalizeText,
  detectUrgent,
  parseAge,
  parseGender,
} from '../js/drug-engine.js';
import { buildStructuredFromCard } from './lookup-structured.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../data/drugs-demo.json');

let db = null;
let fuse = null;

export function loadDb() {
  if (db) return db;
  db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
  const index = [];
  for (const drug of db.drugs) {
    index.push({ drug, label: drug.name, type: 'name' });
    index.push({ drug, label: drug.activeIngredient, type: 'ingredient' });
    for (const alias of drug.aliases || []) {
      index.push({ drug, label: alias, type: 'alias' });
    }
  }
  fuse = new Fuse(index, {
    keys: ['label'],
    threshold: 0.45,
    includeScore: true,
    ignoreLocation: true,
  });
  return db;
}

export function getDb() {
  return loadDb();
}

/** @returns {{ drug: object, label: string, score: number }[]} */
export function suggestDrugNames(query, limit = 5) {
  loadDb();
  const q = query.trim();
  if (!q) return [];

  const exact = findDrugCandidates(db, q);
  const seen = new Set();
  /** @type {{ drug: object, label: string, score: number, reason: string }[]} */
  const out = [];

  for (const drug of exact) {
    if (seen.has(drug.id)) continue;
    seen.add(drug.id);
    out.push({
      drug,
      label: drug.name,
      score: 0,
      reason: 'Khớp trực tiếp trong DB',
    });
  }

  if (fuse) {
    const fuzzy = fuse.search(q).slice(0, limit * 2);
    for (const hit of fuzzy) {
      const drug = hit.item.drug;
      if (seen.has(drug.id)) continue;
      seen.add(drug.id);
      out.push({
        drug,
        label: hit.item.label,
        score: hit.score ?? 1,
        reason:
          hit.score < 0.2
            ? 'Gần giống tên bạn nhập'
            : 'Có thể bạn muốn tra cứu',
      });
      if (out.length >= limit) break;
    }
  }

  return out.slice(0, limit);
}

export function lookupLocal(drug, condition, userName, patient = {}) {
  const evaluation = evaluateSafety(drug, condition, patient);
  const card = buildSafetyCardPayload(drug, condition, evaluation, userName, patient);
  const fullCard = {
    ...card,
    sources: [{ title: card.source, link: null, snippet: 'Dữ liệu từ database nội bộ Long Châu (demo)' }],
  };
  return {
    status: 'ok',
    mode: 'database',
    dataSource: 'database',
    card: fullCard,
    structured: buildStructuredFromCard(fullCard, drug),
    normalizedQuery: drug.name,
  };
}

export { parseAge, parseGender };

export function checkUrgent(condition) {
  const database = loadDb();
  return detectUrgent(database, condition);
}

export { normalizeText, findDrugCandidates };
