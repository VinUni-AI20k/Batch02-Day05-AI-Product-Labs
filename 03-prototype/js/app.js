import {
  loadDrugDatabase,
  detectUrgent,
  parseAge,
  formatGender,
  findDrugCandidates,
  normalizeText,
  extractPatientFromMessage,
  isExactDrugInDb,
  resolveExactDrug,
} from './drug-engine.js';
import { fetchHealth, lookupDrug, ocrDrugImage, chatMessage } from './api-client.js';
import { lookupLocalClient } from './local-lookup.js';
import {
  classifyTextIntent,
  checkEmergency,
  extractDrugName,
  extractExplicitDrugQuery,
  extractSymptomText,
  isFollowUpAboutSuggestedDrug,
  extractRecommendationTopic,
  looksLikeSymptom,
} from './intent-engine.js';
import {
  suggestDrugsForCondition,
  parseIntakeAnswers,
} from './symptom-flow.js';
import {
  detectLookupObjectives,
  getMissingLookupFields,
  buildStructuredLookup,
  objectivesSummary,
} from './lookup-flow.js';
import {
  parseExtendedIntake,
  intakeBasicComplete,
  getTriageQuestions,
  parseTriageAnswers,
  triageComplete,
  triageHasDanger,
  needSymptomContext,
  needDrugContext,
  intentToMainNeed,
  MAIN_NEEDS,
} from './bot-flow.js';
import {
  buildWelcomeHtml,
  buildNeedSelectHtml,
  buildIntakePromptHtml,
  buildTriageHtml,
  buildUrgentTriageHtml,
  buildFullSafetyCardHtml,
  bindNeedButtons,
  bindNextActions,
} from './flow-ui.js';

/** @typedef {'idle'|'collect_profile'|'ocr_confirm'|'drug_need_context'} FlowMode */
/** @typedef {'welcome'|'need_select'|'intake'|'triage'|'ocr_wait'} BotStep */

const state = {
  db: null,
  api: null,
  step: 'chat',
  profileLocked: true,
  condition: '',
  drugQuery: '',
  age: /** @type {number|null} */ (null),
  gender: /** @type {'male'|'female'|null} */ (null),
  lastCard: null,
  loading: false,
  lookupLoader: /** @type {HTMLElement|null} */ (null),
  flow: /** @type {FlowMode} */ ('idle'),
  ctx: /** @type {Record<string, unknown>} */ ({}),
  pendingOcr: /** @type {object|null} */ (null),
  pendingAction: /** @type {object|null} */ (null),
  history: /** @type {{ role: string, content: string }[]} */ ([]),
  pharmacistHandoffUsed: false,
  lastUserText: '',
  lookupObjectives: /** @type {object[]} */ ([]),
  botStep: /** @type {BotStep} */ ('welcome'),
  mainNeed: /** @type {string|null} */ (null),
  patientProfile: /** @type {Record<string, unknown>} */ ({}),
  triage: /** @type {{ questions: object[], answers: Record<string, boolean> }} */ ({
    questions: [],
    answers: {},
  }),
  lastDrug: /** @type {object|null} */ (null),
  lastStructured: /** @type {object|null} */ (null),
};

const els = {
  messages: document.getElementById('messages'),
  composer: document.getElementById('composer'),
  input: document.getElementById('user-input'),
  sendBtn: document.getElementById('send-btn'),
  imageInput: document.getElementById('image-input'),
  resetBtn: document.getElementById('reset-btn'),
  apiBadge: document.getElementById('api-badge'),
  profileBar: document.getElementById('profile-bar'),
  profileBarText: document.getElementById('profile-bar-text'),
  apiAlert: document.getElementById('api-alert'),
  lookupStatus: document.getElementById('lookup-status'),
  lookupStatusTitle: document.getElementById('lookup-status-title'),
  lookupStatusDetail: document.getElementById('lookup-status-detail'),
  safetyFeature: document.querySelector('.safety-feature'),
  chatFab: document.getElementById('chat-fab'),
  chatPanel: document.getElementById('chat-panel'),
  chatBackdrop: document.getElementById('chat-backdrop'),
  chatCloseBtn: document.getElementById('chat-close-btn'),
};

function showApiAlert(type, html) {
  if (!els.apiAlert) return;
  if (!html) {
    els.apiAlert.hidden = true;
    return;
  }
  els.apiAlert.hidden = false;
  els.apiAlert.className = `api-alert api-alert--${type}`;
  els.apiAlert.innerHTML = html;
}

function friendlyApiError(message) {
  const m = String(message || '');
  if (/invalid|authentication|401|403/i.test(m)) {
    return `Key API không hợp lệ — kiểm tra <code>.env</code> và restart server.`;
  }
  return escapeHtml(m);
}

function scrollBottom() {
  els.messages.scrollTop = els.messages.scrollHeight;
}

function addMessage(role, html, extraClass = '') {
  const wrap = document.createElement('div');
  wrap.className = `msg msg--${role} ${extraClass}`.trim();
  wrap.innerHTML = html;
  els.messages.appendChild(wrap);
  scrollBottom();
  return wrap;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function levelClass(level) {
  return { green: 'card--green', yellow: 'card--yellow', red: 'card--red' }[level] || 'card--yellow';
}

function levelBadge(level) {
  const map = {
    green: '🟢 An toàn có điều kiện',
    yellow: '🟡 Thận trọng',
    red: '🔴 Không nên tự ý',
  };
  return map[level] || map.yellow;
}

function apiStatusLabel(api) {
  if (!api?.apis?.active) {
    return { badge: 'API: local', on: false, note: 'DB demo + OCR cần GEMINI/OPENAI key' };
  }
  const map = {
    openai: { badge: 'API: OpenAI ✓', note: '✅ OpenAI + OCR ảnh' },
    deepseek: { badge: 'API: DeepSeek ✓', note: '✅ DeepSeek' },
    gemini: { badge: 'API: Gemini ✓', note: '✅ Gemini + OCR ảnh' },
  };
  const item = map[api.apis.active] || map.gemini;
  return { badge: item.badge, on: true, note: item.note };
}

function updateProfileBar() {
  if (!els.profileBar || !els.profileBarText) return;
  const parts = [];
  if (state.condition) parts.push(state.condition);
  if (state.age != null) parts.push(`${state.age} tuổi`);
  if (state.gender) parts.push(formatGender(state.gender));
  if (state.drugQuery) parts.push(`Thuốc: ${state.drugQuery}`);
  els.profileBarText.textContent = parts.join(' · ') || 'Chưa có ngữ cảnh';
  els.profileBar.hidden = parts.length === 0;
}

function pushHistory(role, content) {
  state.history.push({ role, content });
  if (state.history.length > 24) state.history.shift();
}

function profileForApi() {
  return {
    condition: state.condition || '',
    age: state.age,
    gender: state.gender,
    drugQuery: state.drugQuery || '',
  };
}

function needsProfile() {
  return state.age == null || !state.gender;
}

function askMissingLookupInfo(missing, drugLabel = '') {
  state.flow = 'collect_profile';
  const list = missing.map((m) => `<li>${escapeHtml(m)}</li>`).join('');
  addMessage(
    'bot',
    `<div class="card card--yellow">
      <h3>Chưa đủ thông tin tra cứu</h3>
      ${drugLabel ? `<p>Thuốc: <strong>${escapeHtml(drugLabel)}</strong></p>` : ''}
      <p>Theo quy trình tra cứu, mình cần thêm:</p>
      <ul>${list}</ul>
      <p class="fine">Bạn trả lời gọn một tin nhắn (vd: 30 tuổi, nữ, sốt nhẹ).</p>
    </div>`
  );
}

function askProfile(contextLabel) {
  askMissingLookupInfo(['tuổi', 'giới tính'], contextLabel);
}

function formatNaturalSummary(card) {
  const levelNote =
    card.safetyLevel === 'green'
      ? 'Có thể cân nhắc nếu không có chống chỉ định khác'
      : card.safetyLevel === 'red'
        ? 'Không nên tự ý dùng — nên hỏi dược sĩ/bác sĩ'
        : 'Nên thận trọng và xác nhận với dược sĩ';
  return `Với tình trạng <strong>${escapeHtml(card.condition)}</strong>, thuốc <strong>${escapeHtml(card.drugName)}</strong> (${escapeHtml(card.activeIngredient)}) — ${escapeHtml(card.safetySummary || levelNote)}. Chi tiết trong Thẻ an toàn bên dưới.`;
}

function setComposerEnabled(on) {
  const active = on && !state.loading;
  if (els.input) els.input.disabled = !active;
  if (els.sendBtn) els.sendBtn.disabled = !active;
  if (els.imageInput) els.imageInput.disabled = !active;
}

function ensureIdleUI() {
  state.loading = false;
  if (els.lookupStatus) els.lookupStatus.hidden = true;
  els.safetyFeature?.classList.remove('safety-feature--loading');
  setComposerEnabled(true);
}

function showLoading(text) {
  state.loading = true;
  setComposerEnabled(false);
  if (els.lookupStatus) {
    els.lookupStatus.hidden = false;
    if (els.lookupStatusTitle) els.lookupStatusTitle.textContent = 'Đang xử lý...';
    if (els.lookupStatusDetail) els.lookupStatusDetail.textContent = text;
  }
  return addMessage(
    'bot',
    `<div class="lookup-card"><span class="lookup-card__spinner"></span><div><strong>Đang xử lý...</strong><p class="fine">${escapeHtml(text)}</p></div></div>`,
    'msg--loading'
  );
}

function clearLoading(el) {
  state.loading = false;
  (el || state.lookupLoader)?.remove();
  state.lookupLoader = null;
  if (els.lookupStatus) els.lookupStatus.hidden = true;
  setComposerEnabled(true);
}

function beginLoading(text) {
  clearLoading(state.lookupLoader);
  state.lookupLoader = showLoading(text);
  return state.lookupLoader;
}

function endLoading() {
  clearLoading(state.lookupLoader);
}

function syncProfileFromCtx() {
  if (state.patientProfile.age != null) state.age = /** @type {number} */ (state.patientProfile.age);
  if (state.patientProfile.gender) state.gender = /** @type {'male'|'female'} */ (state.patientProfile.gender);
}

function profileSnapshot() {
  return {
    ...state.patientProfile,
    age: state.age,
    gender: state.gender,
    condition: state.condition,
    drugQuery: state.drugQuery,
  };
}

function applyPatientFromText(text) {
  const { age, gender } = extractPatientFromMessage(text);
  if (age != null) {
    state.age = age;
    state.patientProfile.age = age;
  }
  if (gender) {
    state.gender = gender;
    state.patientProfile.gender = gender;
  }
  state.patientProfile = parseExtendedIntake(text, state.patientProfile);
  syncProfileFromCtx();

  for (const part of text.split(/[,;·]/)) {
    const p = part.trim();
    if (!p || p.length < 3) continue;
    if (/^\d/.test(p)) continue;
    if (extractDrugName(state.db, p)) continue;
    if (/sốt|đau|ho|ngứa|mệt|nôn|tiêu chảy|khó thở/i.test(p)) {
      const norm = normalizeText(state.condition || '');
      const add = normalizeText(p);
      if (!norm.includes(add)) {
        state.condition = state.condition ? `${state.condition}, ${p}` : p;
      }
    }
  }
  updateProfileBar();
}

function showUrgentCard() {
  state.flow = 'idle';
  setComposerEnabled(false);
  addMessage(
    'bot',
    `<div class="card card--red">
      <h3>⚠️ Triệu chứng khẩn cấp</h3>
      <p>Không gợi ý thuốc tự động. <strong>Gọi 115</strong> hoặc đến CSYT ngay nếu nặng.</p>
      <button type="button" class="btn btn--primary" id="pharmacist-urgent">Chat dược sĩ Long Châu</button>
    </div>`
  );
  document.getElementById('pharmacist-urgent')?.addEventListener('click', showPharmacistHandoff);
}

function renderSuggestions(message, suggestions, onPick) {
  const list = suggestions
    .map(
      (s, i) =>
        `<li><button type="button" class="link-btn" data-sug="${i}">${escapeHtml(s.name)} <span class="fine">(${escapeHtml(s.activeIngredient)})</span></button></li>`
    )
    .join('');
  const wrap = addMessage('bot', `<div class="card card--yellow"><h3>${escapeHtml(message)}</h3><ul class="pick-list">${list}</ul></div>`);
  wrap.querySelectorAll('[data-sug]').forEach((btn) => {
    btn.addEventListener('click', () => onPick(suggestions[Number(btn.dataset.sug)]));
  });
}

async function runLookup(drugId = null, drugQueryOverride = null, options = {}) {
  const skipSummary = options.skipSummary === true;
  const drugQuery = (drugQueryOverride ?? state.drugQuery).trim();

  state.lookupObjectives = detectLookupObjectives(state.lastUserText || drugQuery);
  const missing = getMissingLookupFields({
    drugQuery,
    condition: state.condition,
    age: state.age,
    gender: state.gender,
  });

  if (missing.length) {
    state.drugQuery = drugQuery || state.drugQuery;
    askMissingLookupInfo(missing, drugQuery);
    return;
  }

  if (checkEmergency(state.db, state.condition)) {
    showUrgentCard();
    return;
  }

  state.drugQuery = drugQuery;
  const patient = { age: state.age, gender: state.gender };
  const localDrug = resolveExactDrug(state.db, drugQuery, drugId);
  const useLocalOnly = Boolean(localDrug);

  beginLoading(
    useLocalOnly
      ? `Chuẩn hóa → Tra CSDL nội bộ (${drugQuery})`
      : `Chuẩn hóa tên thuốc → Tra CSDL / AI (${drugQuery})`
  );

  if (useLocalOnly && localDrug) {
    const result = lookupLocalClient(state.db, localDrug, state.condition, patient);
    result.structured = buildStructuredLookup(result.card, localDrug, 'database');
    result.normalizedQuery = localDrug.name;
    result.drug = localDrug;
    endLoading();
    handleLookupResult(result, { skipSummary });
    return;
  }

  if (isExactDrugInDb(state.db, drugQuery) && !drugId) {
    const exactMatches = findDrugCandidates(state.db, drugQuery).filter(
      (d) =>
        normalizeText(d.name) === normalizeText(drugQuery) ||
        (d.aliases || []).some((a) => normalizeText(a) === normalizeText(drugQuery))
    );
    if (exactMatches.length > 1) {
      endLoading();
      handleLookupResult({
        status: 'disambiguate',
        candidates: exactMatches.map((d) => ({
          id: d.id,
          name: d.name,
          activeIngredient: d.activeIngredient,
        })),
      }, { skipSummary });
      return;
    }
  }

  try {
    const result = await lookupDrug({
      condition: state.condition,
      drugQuery,
      age: state.age,
      gender: state.gender,
      drugId,
    });
    endLoading();
    handleLookupResult(result, { skipSummary });
  } catch (err) {
    endLoading();
    addMessage('bot', `<p class="error">${escapeHtml(err.message)}</p>`);
  }
}

function handleLookupResult(result, options = {}) {
  const skipSummary = options.skipSummary === true;
  if (result.status === 'urgent') {
    showUrgentCard();
    return;
  }
  if (result.status === 'disambiguate') {
    renderSuggestions('Chọn đúng thuốc:', result.candidates.map((c) => ({
      name: c.name, activeIngredient: c.activeIngredient, drugId: c.id, reason: '',
    })), (pick) => {
      addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
      pushHistory('user', pick.name);
      state.drugQuery = pick.name;
      if (state.lastCard && normalizeText(state.lastCard.drugName) === normalizeText(pick.name)) {
        addMessage('bot', `<p>Mình đã có Thẻ an toàn <strong>${escapeHtml(pick.name)}</strong> ở trên — bạn xem lại nhé.</p>`);
        return;
      }
      runLookup(pick.drugId, pick.name);
    });
    return;
  }
  if (result.status === 'suggest') {
    const msg =
      result.message ||
      `Không tìm thấy chính xác — gợi ý tên thuốc (${result.correctedQuery ? `AI gợi ý: ${result.correctedQuery}` : 'CSDL + AI'}):`;
    addMessage(
      'bot',
      `<p class="fine">Không có kết quả khớp — bạn <strong>chọn thuốc gần đúng</strong> hoặc <strong>nhập lại</strong> tên thuốc.</p>`
    );
    renderSuggestions(msg, result.suggestions, (pick) => {
      addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
      state.drugQuery = pick.name;
      runLookup(pick.drugId || null, pick.name);
    });
    return;
  }
  if (result.status === 'not_found') {
    addMessage(
      'bot',
      `<div class="card card--yellow">
        <h3>Không tìm thấy thuốc</h3>
        <p>${escapeHtml(result.message || 'Không có kết quả phù hợp.')}</p>
        <p class="fine">Vui lòng <strong>nhập lại</strong> tên thuốc / hoạt chất hoặc mô tả rõ hơn.</p>
      </div>`
    );
    return;
  }
  if (result.status === 'error') {
    addMessage('bot', `<p class="error">${escapeHtml(result.error || 'Tra cứu thất bại')}</p>`);
    return;
  }
  if (result.status === 'ok' && result.card) {
    state.drugQuery = result.normalizedQuery || result.card.drugName;
    const structured =
      result.structured || buildStructuredLookup(result.card, null, result.mode || 'api');
    const drugObj = result.drug || resolveExactDrug(state.db, structured.drugName, null);
    if (!skipSummary) {
      const src = result.mode === 'database' ? 'CSDL nội bộ' : result.mode || 'AI';
      addMessage(
        'bot',
        `<p class="fine">${escapeHtml(objectivesSummary(state.lookupObjectives))} · Đã tra cứu: <strong>${escapeHtml(structured.drugName)}</strong> · Nguồn: ${escapeHtml(src)}</p>`
      );
    }
    renderStructuredLookup(structured, result.mode, drugObj);
  }
}

function renderStructuredLookup(structured, mode, drugObj = null) {
  state.flow = 'idle';
  state.botStep = 'welcome';
  const level = structured.safetyLevel || 'yellow';
  const drug =
    drugObj ||
    state.lastDrug ||
    resolveExactDrug(state.db, structured.drugName, null) ||
    state.db.drugs.find((d) => normalizeText(d.name) === normalizeText(structured.drugName));
  state.lastDrug = drug || null;
  state.lastStructured = structured;

  state.lastCard = {
    drugName: structured.drugName,
    activeIngredient: structured.activeIngredient,
    condition: structured.condition,
    safetyLevel: level,
    safetySummary: structured.safetySummary,
    indications: structured.sections?.[1]?.body || '',
    warnings: structured.sections?.[3]?.body ? [structured.sections[3].body] : [],
    contraindications: structured.sections?.[4]?.body ? [structured.sections[4].body] : [],
    matchedRules: structured.matchedRules || [],
    source: structured.sources?.[0]?.title || mode,
  };

  const html = buildFullSafetyCardHtml(
    structured,
    drug,
    profileSnapshot(),
    state.db.meta.disclaimer
  );
  const wrap = addMessage('bot', html);
  bindNextActions(wrap, {
    pharmacist: showPharmacistHandoff,
    similar: handleSimilarDrugs,
    comorbidity: handleComorbidityCheck,
    upload: () => els.imageInput?.click(),
    save: handleSaveConsultation,
  });
  addMessage('bot', '<p class="fine">💬 Hỏi tiếp hoặc bấm <strong>Làm mới</strong> để bắt đầu luồng mới.</p>');
}

function handleSimilarDrugs() {
  if (!state.condition) {
    addMessage('bot', '<p class="fine">Cho mình biết triệu chứng để gợi ý thuốc tương tự nhé.</p>');
    return;
  }
  proceedSymptomAdvice();
}

function handleComorbidityCheck() {
  state.botStep = 'intake';
  state.mainNeed = 'compatibility';
  state.flow = 'collect_profile';
  addMessage(
    'bot',
    `<div class="flow-card"><h3>Kiểm tra với bệnh nền</h3>
    <p>Bạn bổ sung: <strong>bệnh nền, dị ứng, thuốc đang dùng</strong> (vd: tiểu đường, dị ứng aspirin, đang uống thuốc huyết áp).</p></div>`
  );
  if (state.drugQuery && state.age != null && state.gender) {
    state.pendingAction = { type: 'lookup', drugQuery: state.drugQuery, condition: state.condition };
  }
}

function handleSaveConsultation() {
  const payload = {
    savedAt: new Date().toISOString(),
    profile: profileSnapshot(),
    card: state.lastCard,
    structured: state.lastStructured,
  };
  const text = JSON.stringify(payload, null, 2);
  navigator.clipboard?.writeText(text).then(
    () => addMessage('bot', '<p class="fine">✓ Đã sao chép kết quả tư vấn vào clipboard (JSON).</p>'),
    () => addMessage('bot', `<pre class="prefill">${escapeHtml(text.slice(0, 800))}…</pre>`)
  );
}

function renderSafetyCard(card, mode) {
  renderStructuredLookup(buildStructuredLookup(card, null, mode), mode);
}

function showPharmacistHandoff() {
  if (state.pharmacistHandoffUsed) return;
  state.pharmacistHandoffUsed = true;
  addMessage(
    'bot',
    `<div class="card card--blue">
      <h3>Hỏi dược sĩ Long Châu</h3>
      <p>Hiện tại chưa có dược sĩ có thể hỗ trợ bạn. Vui lòng liên hệ lại sau.</p>
    </div>`
  );
}

function proceedSymptomAdvice() {
  state.flow = 'idle';
  const suggestions = suggestDrugsForCondition(state.db, state.condition);
  if (suggestions.length === 0) {
    handleDrugRecommendation(`${state.condition} nên dùng thuốc gì`, true);
    return;
  }
  addMessage(
    'bot',
    `<p>Với <strong>${escapeHtml(state.condition)}</strong>, một số thuốc OTC thường được cân nhắc (cần xác nhận với dược sĩ):</p>`
  );
  renderSuggestions(
    'Gợi ý từ database demo:',
    suggestions.map((s) => ({
      name: s.drug.name,
      activeIngredient: s.drug.activeIngredient,
      drugId: s.drug.id,
      reason: s.note,
    })),
    (pick) => {
      addMessage('user', `<p>Tra cứu ${escapeHtml(pick.name)}</p>`);
      pushHistory('user', `Tra cứu ${pick.name}`);
      state.drugQuery = pick.name;
      runLookup(pick.drugId, pick.name);
    }
  );
}

function handleSymptomAdvice(text) {
  const symptom = extractSymptomText(text);
  state.condition = symptom;
  state.mainNeed = state.mainNeed || 'symptom';
  applyPatientFromText(text);
  updateProfileBar();

  if (checkEmergency(state.db, text) || checkEmergency(state.db, state.condition)) {
    showUrgentCard();
    return;
  }

  if (needsProfile()) {
    state.pendingAction = { type: 'symptom_advice' };
    askProfile(symptom);
    return;
  }

  startTriage();
}

async function executeDrugRecommendation(topic, skipIntro = false) {
  state.flow = 'idle';
  state.condition = topic.condition || state.condition;
  state.drugQuery = topic.drugQuery;
  updateProfileBar();

  const localSuggestions = suggestDrugsForCondition(state.db, topic.condition);
  if (localSuggestions.length > 0) {
    if (!skipIntro) {
      addMessage(
        'bot',
        `<p>Về <strong>${escapeHtml(topic.label)}</strong>, trong database demo Long Châu có một số lựa chọn thường được tham khảo — bạn chọn để xem Thẻ an toàn chi tiết:</p>`
      );
    }
    renderSuggestions(
      'Gợi ý thuốc:',
      localSuggestions.map((s) => ({
        name: s.drug.name,
        activeIngredient: s.drug.activeIngredient,
        drugId: s.drug.id,
        reason: s.note,
      })),
      (pick) => {
        addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
        pushHistory('user', pick.name);
        state.drugQuery = pick.name;
        runLookup(pick.drugId, pick.name);
      }
    );
    return;
  }

  if (!skipIntro) {
    addMessage(
      'bot',
      `<p>Mình tra cứu thêm về <strong>${escapeHtml(topic.drugQuery)}</strong> cho bạn — thuốc này chưa có sẵn trong DB demo nên sẽ dùng nguồn AI nếu có.</p>`
    );
  }
  await runLookup(null, topic.drugQuery);
}

async function handleDrugRecommendation(text, skipIntro = false) {
  applyPatientFromText(text);
  const topic = extractRecommendationTopic(text, state);
  if (!topic) {
    await handleConversationalChat(text, true);
    return;
  }

  state.condition = topic.condition || state.condition;
  updateProfileBar();

  if (needsProfile()) {
    state.pendingAction = { type: 'drug_recommendation', topic, skipIntro };
    askProfile(topic.label);
    return;
  }

  await executeDrugRecommendation(topic, skipIntro);
}

async function handleConversationalChat(text, alreadyAdded = false) {
  if (!alreadyAdded) {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
  }
  pushHistory('user', text);

  if (!state.api?.apis?.active) {
    addMessage(
      'bot',
      '<p>Mình chưa kết nối AI — bạn mô tả triệu chứng hoặc tên thuốc cụ thể (vd: Panadol, tránh thai dùng thuốc nào) để mình tra trong database nhé.</p>'
    );
    return;
  }

  beginLoading('Đang trả lời...');
  try {
    const data = await chatMessage({ messages: state.history, profile: profileForApi() });
    endLoading();
    const reply = data.reply || 'Xin lỗi, mình chưa trả lời được — bạn thử hỏi lại nhé.';
    addMessage('bot', `<p>${escapeHtml(reply).replace(/\n/g, '<br/>')}</p>`);
    pushHistory('assistant', reply);

    const lookupDrug = data.lookupDrug && String(data.lookupDrug).trim();
    if (lookupDrug) state.drugQuery = lookupDrug;
    const explicit = extractExplicitDrugQuery(text);
    const lookupCondition = (data.condition && String(data.condition).trim()) || state.condition || 'tư vấn chung';

    if (explicit) {
      state.drugQuery = explicit;
      if (!state.condition || state.condition === 'tư vấn chung') {
        state.condition = lookupCondition;
      }
      updateProfileBar();
      if (needsProfile()) {
        state.pendingAction = { type: 'lookup', drugQuery: explicit, condition: state.condition };
        askProfile(explicit);
        return;
      }
      if (
        state.lastCard &&
        normalizeText(state.lastCard.drugName) === normalizeText(explicit)
      ) {
        return;
      }
      await runLookup(null, explicit, { skipSummary: true });
      return;
    }

    if (lookupDrug && isExactDrugInDb(state.db, lookupDrug)) {
      state.condition = lookupCondition;
      state.drugQuery = lookupDrug;
      updateProfileBar();
      if (needsProfile()) {
        state.pendingAction = { type: 'lookup', drugQuery: lookupDrug, condition: lookupCondition };
        askProfile(lookupDrug);
        return;
      }
      if (
        state.lastCard &&
        normalizeText(state.lastCard.drugName) === normalizeText(lookupDrug)
      ) {
        return;
      }
      await runLookup(null, lookupDrug, { skipSummary: true });
    } else if (lookupDrug && state.drugQuery && normalizeText(lookupDrug) === normalizeText(state.drugQuery)) {
      state.drugQuery = lookupDrug;
      if (state.lastCard && normalizeText(state.lastCard.drugName) === normalizeText(lookupDrug)) {
        return;
      }
      if (!needsProfile() && state.condition) {
        await runLookup(null, lookupDrug, { skipSummary: true });
      }
    }
  } catch (err) {
    endLoading();
    addMessage('bot', `<p class="error">${friendlyApiError(err.message)}</p>`);
  }
}

function handleCollectProfile(text) {
  applyPatientFromText(text);
  state.ctx = parseExtendedIntake(text, state.ctx);
  if (state.ctx.age != null) state.age = /** @type {number} */ (state.ctx.age);
  if (state.ctx.gender) state.gender = /** @type {'male'|'female'} */ (state.ctx.gender);
  if (!state.condition && looksLikeSymptom(text)) state.condition = extractSymptomText(text);
  updateProfileBar();

  if (needsProfile()) {
    addMessage('bot', '<p class="fine">Bạn ghi giúp tuổi và giới tính trong một câu nhé (vd: 30 tuổi, nữ).</p>');
    return;
  }

  state.flow = 'idle';
  const action = state.pendingAction;
  state.pendingAction = null;

  if (action?.type === 'symptom_advice') {
    startTriage();
    return;
  }
  if (action?.type === 'drug_recommendation') {
    executeDrugRecommendation(action.topic, action.skipIntro);
    return;
  }
  if (action?.type === 'lookup') {
    state.condition = action.condition || state.condition;
    runLookup(null, action.drugQuery);
    return;
  }
  if (state.drugQuery) {
    runLookup(null, state.drugQuery);
    return;
  }
  addMessage('bot', '<p>Cảm ơn bạn! Bạn cần tư vấn triệu chứng hay tên thuốc cụ thể?</p>');
}

function intentContext() {
  return {
    condition: state.condition,
    drugQuery: state.drugQuery,
    lastCardDrug: state.lastCard?.drugName || null,
  };
}

function handleFollowUpDrugQuestion(text) {
  const drug = state.drugQuery || state.lastCard?.drugName;
  if (!drug) {
    handleConversationalChat(text, true);
    return;
  }

  state.drugQuery = drug;

  if (
    state.lastCard &&
    normalizeText(state.lastCard.drugName) === normalizeText(drug)
  ) {
    const card = state.lastCard;
    addMessage(
      'bot',
      `<p>Về <strong>${escapeHtml(card.drugName)}</strong> (đã tra ở trên) với tình trạng <strong>${escapeHtml(card.condition)}</strong>:</p>
       <p><strong>${escapeHtml(card.safetySummary)}</strong></p>
       <p class="fine">Bạn xem lại Thẻ an toàn phía trên. Nếu vẫn chưa rõ, bấm <strong>Hỏi dược sĩ Long Châu</strong> hoặc đến nhà thuốc để được tư vấn trực tiếp.</p>`
    );
    return;
  }

  if (!state.condition) {
    state.flow = 'drug_need_context';
    addMessage(
      'bot',
      `<p>Để trả lời có nên dùng <strong>${escapeHtml(drug)}</strong>, bạn cho mình biết triệu chứng/tình trạng hiện tại nhé.</p>`
    );
    return;
  }
  if (state.age == null || !state.gender) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Tra <strong>${escapeHtml(drug)}</strong> cần thêm tuổi và giới tính (vd: 30 tuổi, nữ).</p>`);
    return;
  }

  runLookup(null, drug);
}

function startDrugLookup(text) {
  applyPatientFromText(text);
  const query = extractExplicitDrugQuery(text) || extractDrugName(state.db, text);
  if (!query) {
    addMessage('bot', '<p>Mình chưa đọc được tên thuốc. Bạn gõ lại tên/hoạt chất hoặc gửi 📷 ảnh nhãn thuốc.</p>');
    return;
  }
  state.drugQuery = query;
  if (!state.condition && looksLikeSymptom(text)) {
    state.condition = extractSymptomText(text);
  }
  if (!state.condition) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Đã nhận thuốc <strong>${escapeHtml(query)}</strong>. Bạn đang gặp triệu chứng/tình trạng gì? (vd: sốt nhẹ, đau đầu)</p>`);
    return;
  }
  if (state.age == null || !state.gender) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Tra <strong>${escapeHtml(query)}</strong> cần thêm tuổi và giới tính (vd: 30 tuổi, nữ).</p>`);
    return;
  }
  updateProfileBar();
  runLookup(null, query);
}

function handleDrugNeedContext(text) {
  applyPatientFromText(text);
  state.ctx = parseExtendedIntake(text, state.ctx);
  if (state.ctx.age != null) state.age = /** @type {number} */ (state.ctx.age);
  if (state.ctx.gender) state.gender = /** @type {'male'|'female'} */ (state.ctx.gender);
  if (!state.condition && looksLikeSymptom(text)) state.condition = extractSymptomText(text);
  const drugFromText = extractExplicitDrugQuery(text) || extractDrugName(state.db, text);
  if (drugFromText) state.drugQuery = drugFromText;
  updateProfileBar();

  if (state.drugQuery && state.condition && state.age != null && state.gender) {
    state.flow = 'idle';
    if (state.mainNeed === 'symptom' || state.mainNeed === 'compatibility' || looksLikeSymptom(state.condition)) {
      startTriage();
    } else {
      runLookup(null, state.drugQuery);
    }
    return;
  }
  addMessage('bot', '<p class="fine">Còn thiếu thông tin — cho mình biết triệu chứng, tuổi và giới tính.</p>');
}

function showOcrConfirm(ocr) {
  state.pendingOcr = ocr;
  state.flow = 'ocr_confirm';
  const conf = ocr.confidence || 'low';
  if (conf === 'low' || !ocr.detected_drug_name) {
    addMessage('bot', `<div class="card card--yellow"><p>Ảnh hơi mờ hoặc chưa đọc chắc tên thuốc.</p><p>${escapeHtml(ocr.notes || 'Chụp lại phần tên/hoạt chất trên hộp hoặc nhập tay tên thuốc.')}</p></div>`);
    state.flow = 'idle';
    return;
  }
  addMessage(
    'bot',
    `<div class="card card--yellow">
      <h3>Đọc được trên ảnh</h3>
      <p><strong>Tên thuốc:</strong> ${escapeHtml(ocr.detected_drug_name || '—')}<br/>
      <strong>Hoạt chất:</strong> ${escapeHtml(ocr.active_ingredient || '—')}<br/>
      <strong>Hàm lượng:</strong> ${escapeHtml(ocr.strength || 'chưa rõ')} · <strong>Dạng:</strong> ${escapeHtml(ocr.dosage_form || '—')}</p>
      <p class="fine">Độ tin cậy OCR: ${escapeHtml(conf)}</p>
      <div class="card__actions">
        <button type="button" class="btn btn--primary" id="ocr-confirm-yes">✓ Đúng, tra cứu</button>
        <button type="button" class="btn btn--ghost" id="ocr-confirm-no">✗ Không đúng</button>
      </div>
    </div>`
  );
  document.getElementById('ocr-confirm-yes')?.addEventListener('click', () => {
    const name = ocr.detected_drug_name || ocr.active_ingredient;
    state.drugQuery = name;
    state.flow = 'idle';
    addMessage('user', `<p>Xác nhận: ${escapeHtml(name)}</p>`);
    if (!state.condition) {
      state.flow = 'drug_need_context';
      addMessage('bot', `<p>Thuốc <strong>${escapeHtml(name)}</strong> — bạn đang gặp triệu chứng gì? (vd: đau bụng, ợ nóng)</p>`);
      return;
    }
    if (state.age == null || !state.gender) {
      state.flow = 'drug_need_context';
      addMessage('bot', '<p>Cho mình thêm tuổi và giới tính để tạo Thẻ an toàn.</p>');
      return;
    }
    runLookup(null, name);
  });
  document.getElementById('ocr-confirm-no')?.addEventListener('click', () => {
    state.flow = 'idle';
    addMessage('bot', '<p>OK — nhập tay tên thuốc hoặc chụp lại ảnh rõ phần nhãn.</p>');
  });
}

async function handleUserImage(file) {
  if (!file || state.loading) return;
  state.mainNeed = state.mainNeed || 'ocr';
  if (!intakeBasicComplete(state.patientProfile) && (state.age == null || !state.gender)) {
    addMessage('bot', buildIntakePromptHtml('ocr'));
    state.botStep = 'intake';
    return;
  }
  addMessage('user', `<p>📷 Ảnh thuốc: ${escapeHtml(file.name)}</p><img src="${URL.createObjectURL(file)}" alt="Thuốc" class="chat-image" />`);
  const loader = beginLoading('Đang OCR ảnh nhãn thuốc...');
  try {
    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const data = await ocrDrugImage(base64, file.type || 'image/jpeg');
    endLoading();
    showOcrConfirm(data.ocr_result || data);
  } catch (err) {
    endLoading();
    addMessage('bot', `<p class="error">${escapeHtml(err.message)}</p>`);
  }
}

function handleUserText(raw) {
  const text = raw.trim();
  if (!text || state.loading || !state.db) return;

  if (state.flow === 'collect_profile') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    pushHistory('user', text);
    handleCollectProfile(text);
    return;
  }
  if (state.flow === 'drug_need_context') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    pushHistory('user', text);
    handleDrugNeedContext(text);
    return;
  }
  if (state.flow === 'ocr_confirm') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    pushHistory('user', text);
    if (/đúng|ok|yes|phải/i.test(text)) {
      const ocr = state.pendingOcr;
      if (ocr?.detected_drug_name) {
        state.drugQuery = ocr.detected_drug_name;
        state.flow = 'drug_need_context';
        addMessage('bot', '<p>Triệu chứng và tuổi/giới tính của bạn là gì?</p>');
      }
    } else {
      state.flow = 'idle';
      addMessage('bot', '<p>OK — nhập tay tên thuốc hoặc gửi ảnh khác.</p>');
    }
    return;
  }

  if (state.botStep === 'intake' || state.botStep === 'ocr_wait') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    pushHistory('user', text);
    state.lastUserText = text;
    handleBotIntake(text);
    return;
  }

  if (state.botStep === 'triage') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    pushHistory('user', text);
    state.lastUserText = text;
    handleBotTriage(text);
    return;
  }

  addMessage('user', `<p>${escapeHtml(text)}</p>`);
  pushHistory('user', text);
  state.lastUserText = text;
  const intent = classifyTextIntent(state.db, text, intentContext());

  if (state.botStep === 'need_select') {
    let need = intentToMainNeed(intent);
    if (/ảnh|chụp|ocr|upload|đơn thuốc/i.test(text)) need = 'ocr';
    if (need) {
      handleMainNeedSelect(need, true);
      handleBotIntake(text);
    } else {
      addMessage('bot', '<p class="fine">Bạn chọn một mục <strong>A / B / C / D</strong> ở trên, hoặc mô tả nhu cầu rõ hơn.</p>');
    }
    return;
  }

  if (intent === 'emergency') {
    showUrgentCard();
    return;
  }
  if (intent === 'follow_up_drug') {
    handleFollowUpDrugQuestion(text);
    return;
  }
  if (intent === 'drug_recommendation') {
    handleDrugRecommendation(text, true);
    return;
  }
  if (intent === 'symptom_advice') {
    handleSymptomAdvice(text);
    return;
  }
  if (intent === 'drug_lookup') {
    startDrugLookup(text);
    return;
  }
  if (intent === 'general_question' || intent === 'unclear') {
    handleConversationalChat(text, true);
    return;
  }

  handleConversationalChat(text, true);
}

function resetFlow() {
  state.condition = '';
  state.drugQuery = '';
  state.age = null;
  state.gender = null;
  state.lastCard = null;
  state.flow = 'idle';
  state.ctx = {};
  state.pendingOcr = null;
  state.pendingAction = null;
  state.history = [];
  state.pharmacistHandoffUsed = false;
  state.lastUserText = '';
  state.lookupObjectives = [];
  state.botStep = 'welcome';
  state.mainNeed = null;
  state.patientProfile = {};
  state.triage = { questions: [], answers: {} };
  state.lastDrug = null;
  state.lastStructured = null;
  els.messages.innerHTML = '';
  ensureIdleUI();
  updateProfileBar();
  bootWelcome();
}

function showNeedSelect() {
  state.botStep = 'need_select';
  const wrap = addMessage('bot', buildNeedSelectHtml());
  bindNeedButtons(wrap, handleMainNeedSelect);
}

function handleMainNeedSelect(needId, skipUserEcho = false) {
  state.mainNeed = needId;
  state.botStep = 'intake';
  if (!skipUserEcho) {
    addMessage('user', `<p>${escapeHtml(MAIN_NEEDS.find((n) => n.id === needId)?.title || needId)}</p>`);
  }

  if (needId === 'ocr') {
    addMessage('bot', buildIntakePromptHtml('ocr'));
    addMessage('bot', '<p class="fine">Sau khi nhập thông tin cơ bản, bấm 📷 để gửi ảnh thuốc/đơn.</p>');
    return;
  }

  addMessage('bot', buildIntakePromptHtml(needId));
}

function proceedAfterIntake() {
  state.flow = 'idle';

  if (state.mainNeed === 'symptom') {
    if (!state.condition) {
      state.flow = 'drug_need_context';
      addMessage('bot', '<p>Bạn mô tả <strong>triệu chứng</strong> hiện tại nhé (vd: đau bụng vùng rốn 2 ngày).</p>');
      return;
    }
    startTriage();
    return;
  }

  if (state.mainNeed === 'compatibility') {
    if (!state.drugQuery) {
      state.flow = 'drug_need_context';
      addMessage('bot', '<p>Bạn gõ <strong>tên thuốc</strong> cần kiểm tra phù hợp nhé.</p>');
      return;
    }
    if (!state.condition) {
      state.flow = 'drug_need_context';
      addMessage('bot', `<p>Thuốc <strong>${escapeHtml(state.drugQuery)}</strong> — bạn đang gặp tình trạng/triệu chứng gì?</p>`);
      return;
    }
    startTriage();
    return;
  }

  if (state.mainNeed === 'drug') {
    const query = state.drugQuery || extractExplicitDrugQuery(state.lastUserText);
    if (!query) {
      state.flow = 'drug_need_context';
      addMessage('bot', '<p>Bạn gõ <strong>tên thuốc/hoạt chất</strong> và câu hỏi nhé.</p>');
      return;
    }
    state.drugQuery = query;
    if (!state.condition) state.condition = 'tư vấn thuốc';
    runLookup(null, query);
    return;
  }
}

function startTriage() {
  if (checkEmergency(state.db, state.condition)) {
    showUrgentCard();
    return;
  }
  state.triage.questions = getTriageQuestions(state.condition);
  state.triage.answers = {};
  state.botStep = 'triage';
  addMessage('bot', buildTriageHtml(state.triage.questions, state.condition));
}

function handleBotTriage(text) {
  state.triage.answers = parseTriageAnswers(text, state.triage.answers, state.triage.questions);

  if (!triageComplete(state.triage.answers, state.triage.questions)) {
    const missing = state.triage.questions.filter((q) => state.triage.answers[q.id] === undefined);
    addMessage(
      'bot',
      `<p class="fine">Còn ${missing.length} câu chưa rõ — trả lời thêm có/không (vd: <em>tất cả không</em> hoặc liệt kê từng mục).</p>`
    );
    return;
  }

  if (triageHasDanger(state.triage.answers, state.triage.questions)) {
    state.botStep = 'welcome';
    state.flow = 'idle';
    setComposerEnabled(false);
    addMessage('bot', buildUrgentTriageHtml() + '<div class="card__actions"><button type="button" class="btn btn--primary" id="pharmacist-triage">Chat dược sĩ Long Châu</button></div>');
    document.getElementById('pharmacist-triage')?.addEventListener('click', showPharmacistHandoff);
    return;
  }

  state.botStep = 'welcome';
  addMessage('bot', '<p class="fine">✓ Không ghi nhận dấu hiệu nguy hiểm — tiếp tục phân loại và tra cứu.</p>');
  proceedAfterTriage();
}

function proceedAfterTriage() {
  if (state.mainNeed === 'compatibility' && state.drugQuery) {
    runLookup(null, state.drugQuery);
    return;
  }
  proceedSymptomAdvice();
}

function handleBotIntake(text) {
  applyPatientFromText(text);
  state.ctx = parseExtendedIntake(text, state.ctx);
  if (state.ctx.age != null) {
    state.age = /** @type {number} */ (state.ctx.age);
    state.patientProfile.age = state.ctx.age;
  }
  if (state.ctx.gender) {
    state.gender = /** @type {'male'|'female'} */ (state.ctx.gender);
    state.patientProfile.gender = state.ctx.gender;
  }

  const drugFromText = extractExplicitDrugQuery(text) || extractDrugName(state.db, text);
  if (drugFromText && needDrugContext(state.mainNeed)) state.drugQuery = drugFromText;
  if (looksLikeSymptom(text) && needSymptomContext(state.mainNeed)) {
    state.condition = extractSymptomText(text) || state.condition;
  }
  updateProfileBar();

  if (!intakeBasicComplete(state.patientProfile)) {
    addMessage('bot', '<p class="fine">Còn thiếu <strong>tuổi</strong> và/hoặc <strong>giới tính</strong> — ghi gọn (vd: 30 tuổi, nữ).</p>');
    return;
  }

  if (state.mainNeed === 'ocr') {
    state.botStep = 'ocr_wait';
    addMessage('bot', '<p>✓ Đã lưu thông tin. Bấm 📷 gửi ảnh thuốc hoặc đơn để OCR.</p>');
    return;
  }

  proceedAfterIntake();
}

function bootWelcome() {
  state.botStep = 'welcome';
  addMessage('bot', buildWelcomeHtml());
  showNeedSelect();
}

els.sendBtn?.addEventListener('click', () => {
  const v = els.input.value;
  els.input.value = '';
  handleUserText(v);
});

els.input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    els.sendBtn.click();
  }
});

els.imageInput?.addEventListener('change', () => {
  const file = els.imageInput.files?.[0];
  els.imageInput.value = '';
  if (file) handleUserImage(file);
});

document.querySelectorAll('[data-demo-msg]').forEach((btn) => {
  btn.addEventListener('click', () => handleUserText(btn.getAttribute('data-demo-msg')));
});

els.resetBtn?.addEventListener('click', resetFlow);

function openChatPanel() {
  els.chatPanel.hidden = false;
  document.body.classList.add('chat-open');
  els.input?.focus();
}
function closeChatPanel() {
  els.chatPanel.hidden = true;
  document.body.classList.remove('chat-open');
}
els.chatFab?.addEventListener('click', openChatPanel);
els.chatCloseBtn?.addEventListener('click', closeChatPanel);
els.chatBackdrop?.addEventListener('click', closeChatPanel);
document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', openChatPanel));

async function init() {
  ensureIdleUI();
  try {
    [state.db, state.api] = await Promise.all([loadDrugDatabase(), fetchHealth()]);
  } catch (err) {
    showApiAlert('error', escapeHtml(err.message));
    return;
  }
  bootWelcome();
}

init();
