import { hasOpenAI, suggestSpelling as openAiSuggest, lookupWithOpenAI, chatConversational as openAiChat } from './openai.js';
import {
  hasGemini,
  suggestSpelling as geminiSuggest,
  lookupWithGoogleGrounding,
  chatConversational as geminiChat,
} from './gemini.js';
import {
  hasDeepSeek,
  suggestSpelling as deepseekSuggest,
  lookupWithDeepSeek,
  chatConversational as deepseekChat,
} from './deepseek.js';

export { hasOpenAI, hasGemini, hasDeepSeek };

/** @typedef {'openai'|'deepseek'|'gemini'} AiProviderId */

/** @returns {AiProviderId[]} */
function autoOrder() {
  return ['openai', 'deepseek', 'gemini'];
}

/** @param {AiProviderId} id */
function isAvailable(id) {
  if (id === 'openai') return hasOpenAI();
  if (id === 'deepseek') return hasDeepSeek();
  if (id === 'gemini') return hasGemini();
  return false;
}

/** @returns {'openai'|'deepseek'|'gemini'|'auto'} */
function normalizePref(raw) {
  const p = (raw || 'auto').toLowerCase().trim();
  if (p === 'auto') return 'auto';
  if (p.startsWith('open')) return 'openai';
  if (p.startsWith('gem')) return 'gemini';
  if (p.startsWith('deep')) return 'deepseek';
  return /** @type {AiProviderId} */ (p);
}

/** @returns {AiProviderId|null} */
export function activeProvider() {
  const pref = normalizePref(process.env.AI_PROVIDER);

  if (pref !== 'auto') {
    if (isAvailable(/** @type {AiProviderId} */ (pref))) return /** @type {AiProviderId} */ (pref);
    for (const id of autoOrder()) {
      if (isAvailable(id)) return id;
    }
    return null;
  }

  for (const id of autoOrder()) {
    if (isAvailable(id)) return id;
  }
  return null;
}

export function hasAi() {
  return Boolean(activeProvider());
}

export async function aiSuggestSpelling(query, localHints = []) {
  const provider = activeProvider();
  if (provider === 'openai') return openAiSuggest(query, localHints);
  if (provider === 'deepseek') return deepseekSuggest(query, localHints);
  if (provider === 'gemini') return geminiSuggest(query, localHints);
  throw new Error('Chưa cấu hình OPENAI_API_KEY, DEEPSEEK_API_KEY hoặc GEMINI_API_KEY');
}

export async function aiLookup(drugQuery, condition, patient = {}) {
  const provider = activeProvider();
  if (provider === 'openai') return lookupWithOpenAI(drugQuery, condition, patient);
  if (provider === 'deepseek') return lookupWithDeepSeek(drugQuery, condition, patient);
  if (provider === 'gemini') return lookupWithGoogleGrounding(drugQuery, condition, patient);
  throw new Error('Chưa cấu hình OPENAI_API_KEY, DEEPSEEK_API_KEY hoặc GEMINI_API_KEY');
}

export async function aiChat(messages, profile, drugCatalog, disclaimer) {
  const provider = activeProvider();
  if (provider === 'openai') return openAiChat(messages, profile, drugCatalog, disclaimer);
  if (provider === 'deepseek') return deepseekChat(messages, profile, drugCatalog, disclaimer);
  if (provider === 'gemini') return geminiChat(messages, profile, drugCatalog, disclaimer);
  throw new Error('Chưa cấu hình OPENAI_API_KEY, DEEPSEEK_API_KEY hoặc GEMINI_API_KEY');
}

/** @param {AiProviderId|null} provider */
export function providerLabel(provider) {
  if (provider === 'openai') return 'OpenAI';
  if (provider === 'deepseek') return 'DeepSeek';
  if (provider === 'gemini') return 'Gemini + Google Search';
  return 'local';
}

/** @param {AiProviderId|null} provider */
export function enrichedModePrefix(provider) {
  if (provider === 'openai') return 'local+openai';
  if (provider === 'deepseek') return 'local+deepseek';
  if (provider === 'gemini') return 'local+google+gemini';
  return 'local';
}
