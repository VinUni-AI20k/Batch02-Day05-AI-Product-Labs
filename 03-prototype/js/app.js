import {
  loadDrugDatabase,
  detectUrgent,
  parseAge,
  formatGender,
  findDrugCandidates,
  normalizeText,
} from './drug-engine.js';
import { fetchHealth, lookupDrug, ocrDrugImage } from './api-client.js';
import { resolveDrug, lookupLocalClient, suggestLocal } from './local-lookup.js';
import {
  classifyTextIntent,
  checkEmergency,
  extractDrugName,
  extractSymptomText,
  looksLikeSymptom,
} from './intent-engine.js';
import {
  INTAKE_PROMPT,
  suggestDrugsForCondition,
  parseIntakeAnswers,
  intakeComplete,
  buildConditionSummary,
} from './symptom-flow.js';

/** @typedef {'idle'|'symptom_intake'|'ocr_confirm'|'drug_need_context'} FlowMode */

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
  baseSymptom: '',
};

const els = {
  messages: document.getElementById('messages'),
  composer: document.getElementById('composer'),
  input: document.getElementById('user-input'),
  sendBtn: document.getElementById('send-btn'),
  imageInput: document.getElementById('image-input'),
  resetBtn: document.getElementById('reset-btn'),
  apiBadge: document.getElementById('api-badge'),
  profileForm: document.getElementById('profile-form'),
  profileBar: document.getElementById('profile-bar'),
  profileBarText: document.getElementById('profile-bar-text'),
  fieldCondition: document.getElementById('field-condition'),
  fieldDrug: document.getElementById('field-drug'),
  fieldAge: document.getElementById('field-age'),
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

function syncHiddenFields() {
  if (els.fieldCondition) els.fieldCondition.value = state.condition;
  if (els.fieldDrug) els.fieldDrug.value = state.drugQuery;
  if (els.fieldAge) els.fieldAge.value = state.age != null ? String(state.age) : '';
}

function updateProfileBar() {
  if (!els.profileBar || !els.profileBarText) return;
  const parts = [];
  if (state.condition) parts.push(state.condition);
  if (state.age != null) parts.push(`${state.age} tuổi`);
  if (state.gender) parts.push(formatGender(state.gender));
  if (state.drugQuery) parts.push(`Thuốc: ${state.drugQuery}`);
  els.profileBarText.textContent = parts.join(' · ') || 'Chưa có hồ sơ';
  els.profileBar.hidden = parts.length === 0;
  syncHiddenFields();
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

function applyPatientFromText(text) {
  const ageMatch = text.match(/(\d{1,3})\s*(tuổi|t\b)/i);
  if (ageMatch) {
    const age = parseAge(ageMatch[1]);
    if (age != null) state.age = age;
  }
  if (/\bnữ\b/i.test(text)) state.gender = 'female';
  if (/\bnam\b/i.test(text) && !/\bnam\s*định/i.test(text)) state.gender = 'male';

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

async function runLookup(drugId = null, drugQueryOverride = null) {
  const drugQuery = (drugQueryOverride ?? state.drugQuery).trim();
  if (!state.condition || !drugQuery || state.age == null || !state.gender) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Để tra <strong>${escapeHtml(drugQuery)}</strong>, cho mình biết thêm: tuổi, giới tính và triệu chứng/tình trạng hiện tại.</p>`);
    return;
  }

  state.drugQuery = drugQuery;
  const patient = { age: state.age, gender: state.gender };
  const localDrug = resolveDrug(state.db, drugQuery, drugId);
  beginLoading(localDrug ? `Tra cứu ${drugQuery} từ DB...` : `Tra cứu ${drugQuery}...`);

  if (localDrug) {
    const result = lookupLocalClient(state.db, localDrug, state.condition, patient);
    endLoading();
    handleLookupResult(result);
    return;
  }

  const candidates = findDrugCandidates(state.db, drugQuery);
  if (candidates.length > 1 && !drugId) {
    endLoading();
    handleLookupResult({
      status: 'disambiguate',
      candidates: candidates.map((d) => ({ id: d.id, name: d.name, activeIngredient: d.activeIngredient })),
    });
    return;
  }

  const localSuggestions = suggestLocal(state.db, drugQuery);
  if (localSuggestions.length > 0 && !drugId) {
    endLoading();
    handleLookupResult({ status: 'suggest', message: `Không tìm thấy "${drugQuery}" — có thể:`, suggestions: localSuggestions });
    return;
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
    handleLookupResult(result);
  } catch (err) {
    endLoading();
    addMessage('bot', `<p class="error">${escapeHtml(err.message)}</p>`);
  }
}

function handleLookupResult(result) {
  if (result.status === 'urgent') {
    showUrgentCard();
    return;
  }
  if (result.status === 'disambiguate') {
    renderSuggestions('Chọn đúng thuốc:', result.candidates.map((c) => ({
      name: c.name, activeIngredient: c.activeIngredient, drugId: c.id, reason: '',
    })), (pick) => {
      addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
      runLookup(pick.drugId, pick.name);
    });
    return;
  }
  if (result.status === 'suggest') {
    renderSuggestions(result.message, result.suggestions, (pick) => {
      addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
      runLookup(pick.drugId, pick.name);
    });
    return;
  }
  if (result.status === 'ok' && result.card) {
    renderSafetyCard(result.card, result.mode);
  }
}

function renderSafetyCard(card, mode) {
  state.lastCard = card;
  state.flow = 'idle';
  const suitability =
    card.safetyLevel === 'green' ? 'caution' : card.safetyLevel === 'red' ? 'not_recommended' : 'caution';

  addMessage(
    'bot',
    `<div class="card ${levelClass(card.safetyLevel)} safety-card">
      <div class="card__header"><span class="badge">${levelBadge(card.safetyLevel)}</span><h3>Thẻ an toàn thuốc — ${escapeHtml(card.drugName)}</h3></div>
      <dl class="kv">
        <dt>Hoạt chất</dt><dd>${escapeHtml(card.activeIngredient)}</dd>
        <dt>Công dụng</dt><dd>${escapeHtml(card.indications)}</dd>
        <dt>Tình trạng bạn hỏi</dt><dd>${escapeHtml(card.condition)}</dd>
        <dt>Có nên dùng không</dt><dd><strong>${escapeHtml(card.safetySummary)}</strong> (${suitability})</dd>
        <dt>Lý do / đối chiếu</dt><dd>${(card.matchedRules || []).map((r) => escapeHtml(r.note)).join('; ') || '—'}</dd>
        <dt>Cảnh báo</dt><dd>${(card.warnings || []).map(escapeHtml).join('; ') || '—'}</dd>
        <dt>Không nên dùng nếu</dt><dd>${(card.contraindications || []).map(escapeHtml).join('; ') || '—'}</dd>
        <dt>Cách dùng</dt><dd>Theo nhãn thuốc hoặc chỉ định dược sĩ/bác sĩ</dd>
        <dt>Khi nào hỏi dược sĩ</dt><dd>Vàng/Đỏ, thiếu thông tin, triệu chứng nặng hoặc kéo dài</dd>
        <dt>Nguồn</dt><dd>${escapeHtml(mode === 'database' ? 'Database nội bộ' : mode || card.source || 'AI')}</dd>
      </dl>
      <p class="disclaimer">${escapeHtml(state.db.meta.disclaimer)}</p>
      <button type="button" class="btn btn--primary" id="pharmacist-card">Hỏi dược sĩ Long Châu</button>
    </div>`
  );
  document.getElementById('pharmacist-card')?.addEventListener('click', showPharmacistHandoff);
  addMessage('bot', '<p class="fine">💬 Gửi <strong>text</strong> (triệu chứng/thuốc) hoặc <strong>📷 ảnh nhãn thuốc</strong> để tra tiếp.</p>');
}

function showPharmacistHandoff() {
  addMessage('bot', `<div class="card card--blue"><h3>Handoff dược sĩ</h3><pre class="prefill">${escapeHtml(JSON.stringify({
    condition: state.condition, drugQuery: state.drugQuery, age: state.age, gender: state.gender, lastCard: state.lastCard,
  }, null, 2))}</pre><p class="fine">Hotline: 1800 6928</p></div>`);
}

function startSymptomFlow(symptomText) {
  state.baseSymptom = extractSymptomText(symptomText);
  state.condition = state.baseSymptom;
  state.flow = 'symptom_intake';
  state.ctx = { symptoms: [state.baseSymptom] };
  updateProfileBar();
  addMessage('bot', `<p>${INTAKE_PROMPT.replace(/\n/g, '<br/>')}</p>`);
}

function continueSymptomIntake(text) {
  state.ctx = parseIntakeAnswers(text, state.ctx);
  if (state.ctx.age != null) state.age = /** @type {number} */ (state.ctx.age);
  if (state.ctx.gender) state.gender = /** @type {'male'|'female'} */ (state.ctx.gender);
  state.condition = buildConditionSummary(state.ctx, state.baseSymptom);
  updateProfileBar();

  if (checkEmergency(state.db, text) || checkEmergency(state.db, state.condition)) {
    showUrgentCard();
    return;
  }

  if (!intakeComplete(state.ctx)) {
    addMessage('bot', '<p class="fine">Còn thiếu <strong>tuổi</strong> hoặc <strong>giới tính</strong> — bạn trả lời giúp mình nhé.</p>');
    return;
  }

  state.flow = 'idle';
  const suggestions = suggestDrugsForCondition(state.db, state.condition);
  if (suggestions.length === 0) {
    addMessage('bot', '<p>Chưa có gợi ý cụ thể trong DB demo — nên hỏi dược sĩ Long Châu hoặc nhập tên thuốc bạn đang cân nhắc.</p>');
    return;
  }

  addMessage('bot', '<p>Dựa trên triệu chứng, bạn có thể tra cứu thêm các thuốc sau (chọn để xem Thẻ an toàn):</p>');
  renderSuggestions('Gợi ý nhóm thuốc (OTC demo):', suggestions.map((s) => ({
    name: s.drug.name,
    activeIngredient: s.drug.activeIngredient,
    drugId: s.drug.id,
    reason: s.note,
  })), (pick) => {
    addMessage('user', `<p>Tra cứu ${escapeHtml(pick.name)}</p>`);
    state.drugQuery = pick.name;
    runLookup(pick.drugId, pick.name);
  });
}

function startDrugLookup(text) {
  applyPatientFromText(text);
  const drug = extractDrugName(state.db, text);
  if (!drug) {
    addMessage('bot', '<p>Mình chưa nhận diện được tên thuốc. Bạn gõ lại tên/hoạt chất hoặc gửi 📷 ảnh nhãn thuốc.</p>');
    return;
  }
  state.drugQuery = drug;
  if (!state.condition && looksLikeSymptom(text)) {
    state.condition = extractSymptomText(text);
  }
  if (!state.condition) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Đã nhận thuốc <strong>${escapeHtml(drug)}</strong>. Bạn đang gặp triệu chứng/tình trạng gì? (vd: sốt nhẹ, đau đầu)</p>`);
    return;
  }
  if (state.age == null || !state.gender) {
    state.flow = 'drug_need_context';
    addMessage('bot', `<p>Tra <strong>${escapeHtml(drug)}</strong> cần thêm tuổi và giới tính (vd: 30 tuổi, nữ).</p>`);
    return;
  }
  updateProfileBar();
  runLookup(null, drug);
}

function handleDrugNeedContext(text) {
  applyPatientFromText(text);
  state.ctx = parseIntakeAnswers(text, state.ctx);
  if (state.ctx.age != null) state.age = /** @type {number} */ (state.ctx.age);
  if (state.ctx.gender) state.gender = /** @type {'male'|'female'} */ (state.ctx.gender);
  if (!state.condition && looksLikeSymptom(text)) state.condition = extractSymptomText(text);
  updateProfileBar();

  if (state.drugQuery && state.condition && state.age != null && state.gender) {
    state.flow = 'idle';
    runLookup(null, state.drugQuery);
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

  if (state.flow === 'symptom_intake') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    continueSymptomIntake(text);
    return;
  }
  if (state.flow === 'drug_need_context') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    handleDrugNeedContext(text);
    return;
  }
  if (state.flow === 'ocr_confirm') {
    addMessage('user', `<p>${escapeHtml(text)}</p>`);
    if (/đúng|ok|yes|phải/i.test(text)) {
      const ocr = state.pendingOcr;
      if (ocr?.detected_drug_name) {
        state.drugQuery = ocr.detected_drug_name;
        state.flow = 'drug_need_context';
        addMessage('bot', '<p>Triệu chứng và tuổi/giới tính của bạn là gì?</p>');
      }
    } else {
      state.flow = 'idle';
      addMessage('bot', '<p>Nhập lại tên thuốc hoặc gửi ảnh khác.</p>');
    }
    return;
  }

  addMessage('user', `<p>${escapeHtml(text)}</p>`);
  const intent = classifyTextIntent(state.db, text);

  if (intent === 'emergency') {
    showUrgentCard();
    return;
  }
  if (intent === 'symptom_advice') {
    startSymptomFlow(text);
    return;
  }
  if (intent === 'drug_lookup') {
    startDrugLookup(text);
    return;
  }
  if (intent === 'general_question') {
    addMessage('bot', `<p>Câu hỏi về cách dùng cần gắn với <strong>tên thuốc cụ thể</strong>. Bạn gửi tên thuốc hoặc 📷 ảnh nhãn — mình sẽ tạo Thẻ an toàn (không thay dược sĩ).</p>`);
    return;
  }

  addMessage('bot', '<p>Bạn mô tả <strong>triệu chứng</strong> (vd: đau bụng), gửi <strong>tên thuốc</strong> (vd: Panadol có dùng được không?) hoặc 📷 <strong>ảnh nhãn thuốc</strong>.</p>');
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
  els.messages.innerHTML = '';
  ensureIdleUI();
  updateProfileBar();
  bootWelcome();
}

function bootWelcome() {
  const { note } = apiStatusLabel(state.api);
  addMessage(
    'bot',
    `<p><strong>Long Châu Safety Bot</strong> 👋</p>
     <p>Gửi <strong>text</strong> hoặc <strong>📷 ảnh thuốc</strong>:</p>
     <ul class="fine">
       <li>Triệu chứng → hỏi thêm → gợi ý thuốc</li>
       <li>Tên thuốc → Thẻ an toàn</li>
       <li>Ảnh nhãn → OCR → xác nhận → Thẻ an toàn</li>
     </ul>
     <p class="fine">${note}</p>`
  );
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
    const { badge, on, note } = apiStatusLabel(state.api);
    if (els.apiBadge) {
      els.apiBadge.textContent = badge;
      els.apiBadge.className = on ? 'api-badge api-badge--on api-badge--top' : 'api-badge api-badge--top';
    }
    showApiAlert(on ? 'ok' : 'warn', `<strong>${badge}</strong> — ${note}`);
  } catch (err) {
    showApiAlert('error', escapeHtml(err.message));
    return;
  }
  bootWelcome();
}

init();
