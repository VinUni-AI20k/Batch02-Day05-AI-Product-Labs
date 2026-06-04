import {
  loadDrugDatabase,
  detectUrgent,
  parseAge,
  formatGender,
  findDrugCandidates,
} from './drug-engine.js';
import { fetchHealth, lookupDrug } from './api-client.js';
import { resolveDrug, lookupLocalClient, suggestLocal } from './local-lookup.js';

/** @typedef {'form'|'chat'|'disambiguate'} Step */

const state = {
  db: null,
  api: null,
  step: /** @type {Step} */ ('form'),
  profileLocked: false,
  condition: '',
  drugQuery: '',
  age: /** @type {number|null} */ (null),
  gender: /** @type {'male'|'female'|null} */ (null),
  lastCard: null,
  loading: false,
  lookupLoader: /** @type {HTMLElement|null} */ (null),
};

const els = {
  messages: document.getElementById('messages'),
  composer: document.getElementById('composer'),
  input: document.getElementById('user-input'),
  sendBtn: document.getElementById('send-btn'),
  resetBtn: document.getElementById('reset-btn'),
  apiBadge: document.getElementById('api-badge'),
  profileForm: document.getElementById('profile-form'),
  profileBar: document.getElementById('profile-bar'),
  profileBarText: document.getElementById('profile-bar-text'),
  editProfileBtn: document.getElementById('edit-profile-btn'),
  formError: document.getElementById('form-error'),
  fieldCondition: document.getElementById('field-condition'),
  fieldDrug: document.getElementById('field-drug'),
  fieldAge: document.getElementById('field-age'),
  apiAlert: document.getElementById('api-alert'),
  lookupStatus: document.getElementById('lookup-status'),
  lookupStatusTitle: document.getElementById('lookup-status-title'),
  lookupStatusDetail: document.getElementById('lookup-status-detail'),
  submitBtn: document.getElementById('submit-form-btn'),
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
    els.apiAlert.innerHTML = '';
    els.apiAlert.className = 'api-alert';
    return;
  }
  els.apiAlert.hidden = false;
  els.apiAlert.className = `api-alert api-alert--${type}`;
  els.apiAlert.innerHTML = html;
}

function friendlyApiError(message) {
  const m = String(message || '');
  if (/invalid|authentication|401|403/i.test(m)) {
    return `Key API không hợp lệ hoặc hết hạn. Kiểm tra lại <code>.env</code>:
      <ul>
        <li><strong>DeepSeek</strong> → lấy tại <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener">platform.deepseek.com</a></li>
        <li><strong>Gemini</strong> → <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a></li>
        <li><strong>OpenAI</strong> → <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a></li>
      </ul>
      <strong>Lưu ý:</strong> Key Cursor KHÔNG dùng được. Sau khi sửa <code>.env</code>, restart <code>npm run dev</code>.`;
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
    return {
      badge: 'API: local',
      on: false,
      note: '⚠️ Chưa có API key — thêm OPENAI / DEEPSEEK / GEMINI trong .env',
    };
  }
  const map = {
    openai: { badge: 'API: OpenAI ✓', note: '✅ OpenAI đang bật' },
    deepseek: { badge: 'API: DeepSeek ✓', note: '✅ DeepSeek đang bật' },
    gemini: { badge: 'API: Gemini ✓', note: '✅ Gemini + Google Search đang bật' },
  };
  const item = map[api.apis.active] || map.gemini;
  return { badge: item.badge, on: true, note: item.note };
}

function setFormError(msg) {
  if (!msg) {
    els.formError.hidden = true;
    els.formError.textContent = '';
    return;
  }
  els.formError.hidden = false;
  els.formError.textContent = msg;
}

function setComposerEnabled(on) {
  const active = on && !state.loading && state.profileLocked;
  els.input.disabled = !active;
  els.sendBtn.disabled = !active;
  els.composer.classList.toggle('composer--locked', !state.profileLocked);
  if (state.profileLocked) {
    els.input.placeholder = 'Nhập tên thuốc khác để tra tiếp...';
  } else {
    els.input.placeholder = 'Điền form phía trên trước...';
  }
}

function readFormValues() {
  const condition = els.fieldCondition.value.trim();
  const drugQuery = els.fieldDrug.value.trim();
  const age = parseAge(els.fieldAge.value);
  const genderInput = /** @type {HTMLInputElement|null} */ (
    els.profileForm.querySelector('input[name="gender"]:checked')
  );
  const gender = genderInput?.value === 'male' || genderInput?.value === 'female'
    ? genderInput.value
    : null;

  return { condition, drugQuery, age, gender };
}

function syncFormFromState() {
  els.fieldCondition.value = state.condition;
  els.fieldDrug.value = state.drugQuery;
  els.fieldAge.value = state.age != null ? String(state.age) : '';
  const genderEl = els.profileForm.querySelector(
    `input[name="gender"][value="${state.gender}"]`
  );
  if (genderEl) genderEl.checked = true;
}

function updateProfileBar() {
  els.profileBarText.textContent = `${state.condition} · ${state.age} tuổi · ${formatGender(state.gender)}`;
}

function showFormPanel() {
  state.profileLocked = false;
  els.profileForm.hidden = false;
  els.profileBar.hidden = true;
  setComposerEnabled(false);
}

function lockProfile() {
  state.profileLocked = true;
  els.profileForm.hidden = true;
  els.profileBar.hidden = false;
  updateProfileBar();
  setComposerEnabled(true);
  els.input.focus();
}

function unlockProfile() {
  state.profileLocked = false;
  els.profileForm.hidden = false;
  els.profileBar.hidden = true;
  syncFormFromState();
  setComposerEnabled(false);
  setFormError('');
}

function ensureIdleUI() {
  state.loading = false;
  if (els.lookupStatus) els.lookupStatus.hidden = true;
  els.safetyFeature?.classList.remove('safety-feature--loading');
  if (els.submitBtn) {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = 'Bắt đầu tra cứu';
  }
  if (els.sendBtn) {
    els.sendBtn.disabled = true;
    els.sendBtn.textContent = 'Tra thuốc';
  }
  setComposerEnabled(false);
}

function showLoading(text = 'NEO đang tra cứu qua API...') {
  state.loading = true;
  setComposerEnabled(false);

  if (els.submitBtn) {
    els.submitBtn.disabled = true;
    els.submitBtn.dataset.label = els.submitBtn.dataset.label || els.submitBtn.textContent;
    els.submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Đang tra cứu...';
  }
  if (els.sendBtn) {
    els.sendBtn.disabled = true;
    els.sendBtn.dataset.label = els.sendBtn.dataset.label || els.sendBtn.textContent;
    els.sendBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Đang tra...';
  }

  if (els.lookupStatus) {
    els.lookupStatus.hidden = false;
    if (els.lookupStatusTitle) els.lookupStatusTitle.textContent = 'Đang trong quá trình tra cứu';
    if (els.lookupStatusDetail) els.lookupStatusDetail.textContent = text;
    els.lookupStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  els.safetyFeature?.classList.add('safety-feature--loading');

  return addMessage(
    'bot',
    `<div class="lookup-card">
      <span class="lookup-card__spinner" aria-hidden="true"></span>
      <div>
        <strong>Đang tra cứu...</strong>
        <p class="fine">${escapeHtml(text)}</p>
      </div>
    </div>`,
    'msg--loading'
  );
}

function clearLoading(el) {
  state.loading = false;
  const node = el || state.lookupLoader;
  node?.remove();
  if (state.lookupLoader === node) state.lookupLoader = null;

  if (els.submitBtn) {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = els.submitBtn.dataset.label || 'Bắt đầu tra cứu';
  }
  if (els.sendBtn) {
    els.sendBtn.disabled = false;
    els.sendBtn.textContent = els.sendBtn.dataset.label || 'Tra thuốc';
  }

  if (els.lookupStatus) els.lookupStatus.hidden = true;
  els.safetyFeature?.classList.remove('safety-feature--loading');

  setComposerEnabled(true);
}

function beginLookup(text) {
  clearLoading(state.lookupLoader);
  state.lookupLoader = showLoading(text);
  return state.lookupLoader;
}

function endLookup() {
  clearLoading(state.lookupLoader);
}

function paintFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

const DB_LOOKUP_MIN_MS = 450;

async function waitMinLookup(startMs, minMs = DB_LOOKUP_MIN_MS) {
  const elapsed = Date.now() - startMs;
  if (elapsed < minMs) {
    await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
  }
}

function loadingMessage(drugQuery = state.drugQuery, drugId = null) {
  const inDb =
    drugId ||
    (state.db && drugQuery && Boolean(resolveDrug(state.db, drugQuery, drugId)));

  if (inDb) {
    return `Đang tra cứu "${drugQuery}" từ database nội bộ (tức thì)...`;
  }

  const p = state.api?.apis?.active;
  if (p === 'openai') return 'NEO đang tra cứu qua OpenAI API (thuốc chưa có trong DB)...';
  if (p === 'deepseek') return 'NEO đang tra cứu qua DeepSeek API (thuốc chưa có trong DB)...';
  if (p === 'gemini') return 'NEO đang tra cứu qua Google/Gemini (thuốc chưa có trong DB)...';
  return 'NEO đang tra cứu (thuốc chưa có trong DB)...';
}

function validateProfile({ condition, drugQuery, age, gender }) {
  if (!condition) return 'Vui lòng nhập tình trạng hiện tại.';
  if (!drugQuery) return 'Vui lòng nhập tên thuốc hoặc hoạt chất.';
  if (age == null) return 'Vui lòng nhập tuổi hợp lệ (0–120).';
  if (!gender) return 'Vui lòng chọn giới tính.';
  return null;
}

function applyProfile({ condition, drugQuery, age, gender }) {
  state.condition = condition;
  state.drugQuery = drugQuery;
  state.age = age;
  state.gender = gender;
}

function showUrgentCard() {
  state.step = 'chat';
  setComposerEnabled(false);
  addMessage(
    'bot',
    `<div class="card card--red">
      <h3>⚠️ Triệu chứng cần chú ý khẩn cấp</h3>
      <p>Không tiếp tục tra cứu tự động. <strong>Gọi 115</strong> hoặc đến CSYT nếu nặng.</p>
      <button type="button" class="btn btn--primary" id="pharmacist-urgent">Chat dược sĩ Long Châu</button>
    </div>`
  );
  document.getElementById('pharmacist-urgent')?.addEventListener('click', showPharmacistHandoff);
}

function renderSuggestions(message, suggestions, onPick) {
  state.step = 'disambiguate';
  const list = suggestions
    .map(
      (s, i) =>
        `<li><button type="button" class="link-btn" data-sug="${i}">${escapeHtml(s.name)} <span class="fine">(${escapeHtml(s.activeIngredient)})</span></button>
         <span class="fine"> — ${escapeHtml(s.reason || 'Gợi ý')}</span></li>`
    )
    .join('');

  const wrap = addMessage(
    'bot',
    `<div class="card card--yellow">
      <h3>${escapeHtml(message)}</h3>
      <ul class="pick-list">${list}</ul>
    </div>`
  );

  wrap.querySelectorAll('[data-sug]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-sug'));
      onPick(suggestions[idx]);
    });
  });
}

async function runLookup(drugId = null, drugQueryOverride = null) {
  const drugQuery = (drugQueryOverride ?? state.drugQuery).trim();
  if (!state.condition || !drugQuery || state.age == null || !state.gender) {
    addMessage('bot', '<p class="error">Thiếu thông tin tra cứu.</p>');
    return;
  }
  if (!state.db?.drugs?.length) {
    addMessage('bot', '<p class="error">Database chưa tải xong — vui lòng tải lại trang.</p>');
    return;
  }

  state.drugQuery = drugQuery;
  const patient = { age: state.age, gender: state.gender };
  const localDrug = resolveDrug(state.db, drugQuery, drugId);
  const statusText = localDrug
    ? `Đang tra cứu "${drugQuery}" từ database nội bộ (tức thì)...`
    : loadingMessage(drugQuery, drugId);

  beginLookup(statusText);
  const lookupStarted = Date.now();
  await paintFrame();

  // ── Thuốc có trong DB → xử lý trên browser, không gọi API
  if (localDrug) {
    const result = lookupLocalClient(state.db, localDrug, state.condition, patient);
    await waitMinLookup(lookupStarted);
    endLookup();
    handleLookupResult(result);
    return;
  }

  // ── Nhiều kết quả khớp trong DB
  const candidates = findDrugCandidates(state.db, drugQuery);
  if (candidates.length > 1 && !drugId) {
    await waitMinLookup(lookupStarted, 250);
    endLookup();
    handleLookupResult({
      status: 'disambiguate',
      candidates: candidates.map((d) => ({
        id: d.id,
        name: d.name,
        activeIngredient: d.activeIngredient,
      })),
    });
    return;
  }

  // ── Gõ sai tên nhưng fuzzy khớp DB → gợi ý local, không gọi API
  const localSuggestions = suggestLocal(state.db, drugQuery);
  if (localSuggestions.length > 0 && !drugId) {
    await waitMinLookup(lookupStarted, 250);
    endLookup();
    handleLookupResult({
      status: 'suggest',
      message: `Không tìm thấy "${drugQuery}" — có thể bạn muốn:`,
      suggestions: localSuggestions,
    });
    return;
  }

  // ── Thuốc không có trong DB → gọi API (có thể chậm vài giây)
  try {
    const result = await lookupDrug({
      condition: state.condition,
      drugQuery,
      age: state.age,
      gender: state.gender,
      drugId,
    });
    endLookup();
    handleLookupResult(result);
  } catch (err) {
    endLookup();
    const friendly = friendlyApiError(err.message);
    showApiAlert('error', friendly.includes('<') ? friendly : escapeHtml(friendly));
    addMessage('bot', `<p class="error">${friendly.includes('<') ? friendly : escapeHtml(err.message)}</p>`);
    state.step = 'chat';
  }
}

function finishLookupUi() {
  if (els.submitBtn) {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = els.submitBtn.dataset.label || 'Bắt đầu tra cứu';
  }
  setComposerEnabled(true);
}

function handleLookupResult(result) {
  if (result.status === 'urgent') {
    showUrgentCard();
    return;
  }

  if (result.status === 'disambiguate') {
    finishLookupUi();
    renderSuggestions(
      'Chọn đúng thuốc/hoạt chất:',
      result.candidates.map((c) => ({
        name: c.name,
        activeIngredient: c.activeIngredient,
        drugId: c.id,
        reason: 'Nhiều kết quả khớp',
      })),
      (pick) => {
        addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
        runLookup(pick.drugId, pick.name);
      }
    );
    return;
  }

  if (result.status === 'suggest') {
    finishLookupUi();
    renderSuggestions(
      result.message || 'Có thể bạn muốn tra cứu:',
      result.suggestions.map((s) => ({
        name: s.name,
        activeIngredient: s.activeIngredient,
        drugId: s.drugId,
        reason: s.reason,
      })),
      (pick) => {
        addMessage('user', `<p>${escapeHtml(pick.name)}</p>`);
        runLookup(pick.drugId, pick.name);
      }
    );
    return;
  }

  if (result.status === 'not_found') {
    finishLookupUi();
    state.step = 'chat';
    addMessage(
      'bot',
      `<div class="card card--yellow">
        <h3>Không tìm thấy</h3>
        <p>${escapeHtml(result.message)}</p>
        <button type="button" class="btn btn--primary" id="pharmacist-miss">Chat dược sĩ Long Châu</button>
      </div>`
    );
    document.getElementById('pharmacist-miss')?.addEventListener('click', showPharmacistHandoff);
    return;
  }

  if (result.status === 'ok' && result.card) {
    renderSafetyCardFromApi(result.card, result.mode);
    finishLookupUi();
  }
}

function renderSafetyCardFromApi(card, mode) {
  state.lastCard = card;
  state.step = 'chat';

  const rules = card.matchedRules || [];
  const rulesHtml =
    rules.length > 0
      ? `<ul>${rules
          .map(
            (r) =>
              `<li><span class="tag tag--${r.level}">${r.level}</span> ${escapeHtml(r.note)}</li>`
          )
          .join('')}</ul>`
      : '<p class="fine">Không có rule cụ thể — mặc định thận trọng.</p>';

  const sources = card.sources || [];
  const sourcesHtml =
    sources.length > 0
      ? `<ul class="sources">${sources
          .map((s) => {
            const link = s.link
              ? `<a href="${escapeHtml(s.link)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a>`
              : escapeHtml(s.title);
            return `<li>${link}${s.snippet ? ` — ${escapeHtml(s.snippet)}` : ''}</li>`;
          })
          .join('')}</ul>`
      : `<p>${escapeHtml(card.source || '—')}</p>`;

  const modeLabel = mode
    ? `<span class="fine">Nguồn tra cứu: ${escapeHtml(mode === 'database' ? 'Database nội bộ' : mode)}</span>`
    : '';
  const ageRow =
    card.age != null
      ? `<dt>Tuổi / Giới tính</dt><dd>${escapeHtml(String(card.age))} tuổi · ${escapeHtml(card.genderLabel || formatGender(card.gender))}</dd>`
      : '';
  const ageAppropriateRow = card.ageAppropriate
    ? `<dt>Phù hợp độ tuổi</dt><dd>${escapeHtml(card.ageAppropriate)}</dd>`
    : '';

  const wrap = addMessage(
    'bot',
    `<div class="card ${levelClass(card.safetyLevel)} safety-card">
      <div class="card__header">
        <span class="badge">${levelBadge(card.safetyLevel)}</span>
        <h3>Safety Card — ${escapeHtml(card.drugName)}</h3>
        ${modeLabel}
      </div>
      <dl class="kv">
        <dt>Tình trạng</dt><dd>${escapeHtml(card.condition)}</dd>
        ${ageRow}
        <dt>Thuốc / hoạt chất</dt><dd>${escapeHtml(card.drugName)} — <em>${escapeHtml(card.activeIngredient)}</em></dd>
        <dt>Chỉ định</dt><dd>${escapeHtml(card.indications)}</dd>
        <dt>Chống chỉ định</dt><dd>${(card.contraindications || []).map(escapeHtml).join('; ') || '—'}</dd>
        <dt>Lưu ý</dt><dd>${(card.warnings || []).map(escapeHtml).join('; ') || '—'}</dd>
        ${ageAppropriateRow}
        <dt>Đối chiếu</dt><dd><strong>${escapeHtml(card.safetySummary)}</strong>${rulesHtml}</dd>
        <dt>Nguồn</dt><dd>${sourcesHtml}</dd>
      </dl>
      <p class="disclaimer">${escapeHtml(state.db.meta.disclaimer)}</p>
      <div class="card__actions">
        <button type="button" class="btn btn--primary" id="pharmacist-card">Hỏi dược sĩ Long Châu</button>
      </div>
    </div>`
  );

  wrap.querySelector('#pharmacist-card')?.addEventListener('click', showPharmacistHandoff);

  addMessage(
    'bot',
    '<p class="fine">💬 Nhập <strong>tên thuốc khác</strong> bên dưới để tra tiếp (giữ nguyên tình trạng, tuổi, giới tính).</p>'
  );
}

function showPharmacistHandoff() {
  addMessage(
    'bot',
    `<div class="card card--blue">
      <h3>Handoff dược sĩ</h3>
      <pre class="prefill">${escapeHtml(
        JSON.stringify(
          {
            condition: state.condition,
            drugQuery: state.drugQuery,
            age: state.age,
            gender: state.gender,
            lastCard: state.lastCard,
          },
          null,
          2
        )
      )}</pre>
      <p class="fine">Hotline: 1800 6928</p>
    </div>`
  );
}

function submitProfile(isFollowUpDrug = false) {
  setFormError('');
  const values = readFormValues();
  const err = validateProfile(values);
  if (err) {
    setFormError(err);
    return;
  }

  applyProfile(values);

  if (detectUrgent(state.db, state.condition)) {
    lockProfile();
    addMessage('user', `<p>Tra cứu: ${escapeHtml(state.drugQuery)}</p>`);
    showUrgentCard();
    return;
  }

  lockProfile();
  updateProfileBar();

  if (!isFollowUpDrug) {
    els.messages.innerHTML = '';
    const { note } = apiStatusLabel(state.api);
    addMessage(
      'bot',
      `<p><strong>Long Châu Safety Bot</strong></p>
       <p class="fine">${note}</p>`
    );
  }

  addMessage('user', `<p>${escapeHtml(state.drugQuery)}</p>`);
  state.step = 'chat';
  runLookup();
}

function handleFollowUpDrug(raw) {
  const drug = raw.trim();
  if (!drug || state.loading) return;
  if (!state.profileLocked) return;

  state.drugQuery = drug;
  els.fieldDrug.value = drug;
  addMessage('user', `<p>${escapeHtml(drug)}</p>`);
  state.step = 'chat';
  runLookup(null, drug);
}

function resetFlow() {
  state.step = 'form';
  state.profileLocked = false;
  state.condition = '';
  state.drugQuery = '';
  state.age = null;
  state.gender = null;
  state.lastCard = null;
  state.loading = false;
  els.messages.innerHTML = '';
  ensureIdleUI();
  els.profileForm.reset();
  setFormError('');
  showFormPanel();
  bootWelcome();
}

function bootWelcome() {
  const { note } = apiStatusLabel(state.api);
  addMessage(
    'bot',
    `<p>Xin chào! 👋 Điền form phía trên và bấm <strong>Bắt đầu tra cứu</strong>.</p>
     <p class="fine">${note}</p>`
  );
}

function fillDemo(type) {
  if (type === 'happy') {
    els.fieldCondition.value = 'sốt nhẹ';
    els.fieldDrug.value = 'Panadol';
    els.fieldAge.value = '30';
    els.profileForm.querySelector('input[value="female"]').checked = true;
  } else if (type === 'typo') {
    els.fieldCondition.value = 'sốt nhẹ';
    els.fieldDrug.value = 'Panadl';
    els.fieldAge.value = '8';
    els.profileForm.querySelector('input[value="male"]').checked = true;
  } else if (type === 'urgent') {
    els.fieldCondition.value = 'khó thở, đau ngực';
    els.fieldDrug.value = 'Panadol';
    els.fieldAge.value = '45';
    els.profileForm.querySelector('input[value="male"]').checked = true;
  }
  setFormError('');
}

els.profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitProfile(false);
});

els.editProfileBtn.addEventListener('click', () => {
  unlockProfile();
  addMessage('bot', '<p>Chỉnh sửa thông tin form phía trên, rồi bấm <strong>Bắt đầu tra cứu</strong>.</p>');
});

els.profileForm.querySelectorAll('[data-demo]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fillDemo(btn.getAttribute('data-demo'));
    submitProfile(false);
  });
});

els.sendBtn.addEventListener('click', () => {
  const v = els.input.value;
  els.input.value = '';
  handleFollowUpDrug(v);
});

els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    els.sendBtn.click();
  }
});

els.resetBtn.addEventListener('click', resetFlow);

function openChatPanel() {
  if (!els.chatPanel) return;
  els.chatPanel.hidden = false;
  els.chatPanel.setAttribute('aria-hidden', 'false');
  els.chatFab?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('chat-open');
  els.input?.focus();
}

function closeChatPanel() {
  if (!els.chatPanel) return;
  els.chatPanel.hidden = true;
  els.chatPanel.setAttribute('aria-hidden', 'true');
  els.chatFab?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('chat-open');
}

els.chatFab?.addEventListener('click', openChatPanel);
els.chatCloseBtn?.addEventListener('click', closeChatPanel);
els.chatBackdrop?.addEventListener('click', closeChatPanel);

document.querySelectorAll('[data-open-chat]').forEach((btn) => {
  btn.addEventListener('click', openChatPanel);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && els.chatPanel && !els.chatPanel.hidden) {
    closeChatPanel();
  }
});

async function init() {
  ensureIdleUI();
  try {
    [state.db, state.api] = await Promise.all([loadDrugDatabase(), fetchHealth()]);
    const { badge, on, note } = apiStatusLabel(state.api);
    if (els.apiBadge) {
      els.apiBadge.textContent = badge;
      els.apiBadge.className = on
        ? 'api-badge api-badge--on api-badge--top'
        : 'api-badge api-badge--top';
    }
    if (state.api?.apis?.active) {
      showApiAlert('ok', `<strong>${badge}</strong> — ${note}. Nếu tra cứu lỗi, kiểm tra key trong <code>.env</code> và restart server.`);
    } else {
      showApiAlert('warn', `${note} Vẫn tra được với DB demo + gợi ý fuzzy.`);
    }
  } catch (err) {
    showApiAlert('error', escapeHtml(err.message));
    addMessage(
      'bot',
      `<p class="error">${escapeHtml(err.message)}</p>
       <p>Chạy: <code>npm install && npm run dev</code></p>`
    );
    return;
  }
  showFormPanel();
  bootWelcome();
}

init();
