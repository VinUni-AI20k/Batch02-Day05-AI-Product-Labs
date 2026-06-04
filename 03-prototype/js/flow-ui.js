import {
  MAIN_NEEDS,
  SAFETY_DISCLAIMER,
  INTAKE_PROMPT,
  getTriageQuestions,
  runSafetyChecks,
  suitabilityFromLevel,
  whenToSeeProfessional,
} from './bot-flow.js';
import { evaluateSafety } from './drug-engine.js';

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWelcomeHtml() {
  return `<div class="flow-card flow-card--welcome">
    <h3>Long Châu Safety Bot</h3>
    <p>Chatbot tư vấn thông tin thuốc an toàn</p>
    <p>Xin chào! Mình có thể hỗ trợ <strong>tra cứu thuốc</strong>, <strong>triệu chứng</strong>, <strong>cảnh báo an toàn</strong> và hướng dẫn khi nào cần gặp dược sĩ/bác sĩ.</p>
    <p class="flow-disclaimer">⚠️ ${escapeHtml(SAFETY_DISCLAIMER)}</p>
  </div>`;
}

export function buildNeedSelectHtml() {
  const buttons = MAIN_NEEDS.map(
    (n) =>
      `<button type="button" class="need-btn" data-need="${n.id}">
        <span class="need-btn__code">${n.code}</span>
        <span class="need-btn__text">
          <strong>${escapeHtml(n.title)}</strong>
          <small>${escapeHtml(n.hint)}</small>
        </span>
      </button>`
  ).join('');
  return `<div class="flow-card">
    <h3>Chọn nhu cầu chính</h3>
    <div class="need-grid">${buttons}</div>
  </div>`;
}

export function buildIntakePromptHtml(mainNeed) {
  const extra =
    mainNeed === 'symptom'
      ? '<p>Sau thông tin cơ bản, bạn mô tả <strong>triệu chứng</strong> (vd: đau bụng vùng rốn 2 ngày).</p>'
      : mainNeed === 'drug'
        ? '<p>Sau thông tin cơ bản, bạn gõ <strong>tên thuốc/hoạt chất</strong> và câu hỏi (vd: Panadol dùng khi sốt thế nào?).</p>'
        : mainNeed === 'ocr'
          ? '<p>Sau thông tin cơ bản, bạn bấm 📷 gửi ảnh nhãn thuốc hoặc đơn.</p>'
          : '<p>Sau thông tin cơ bản, bạn gõ <strong>tên thuốc</strong> và <strong>tình trạng</strong> cần kiểm tra.</p>';
  return `<div class="flow-card flow-card--intake">
    <h3>Thu thập thông tin cơ bản</h3>
    ${INTAKE_PROMPT}
    ${extra}
  </div>`;
}

/** @param {object[]} questions */
export function buildTriageHtml(questions, condition) {
  const list = questions
    .map((q, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(q.q)} <span class="fine">(có/không)</span></li>`)
    .join('');
  return `<div class="flow-card flow-card--triage">
    <h3>Sàng lọc nguy hiểm</h3>
    <p>Với <strong>${escapeHtml(condition || 'triệu chứng của bạn')}</strong>, bạn trả lời <strong>có/không</strong> cho từng mục (có thể gọn: <em>không có gì / tất cả không</em>):</p>
    <ol class="triage-list">${list}</ol>
  </div>`;
}

export function buildUrgentTriageHtml() {
  return `<div class="card card--red">
    <h3>⚠️ Có dấu hiệu nguy hiểm</h3>
    <p>Bot <strong>không gợi ý thuốc</strong> trong trường hợp này.</p>
    <p>Khuyên <strong>đi khám / cấp cứu</strong> hoặc gặp dược sĩ/bác sĩ ngay nếu triệu chứng nặng.</p>
    <p class="fine">Gọi <strong>115</strong> khi khó thở, đau ngực, choáng hoặc triệu chứng cấp tính.</p>
  </div>`;
}

export function buildNextActionsHtml() {
  return `<div class="next-actions">
    <p class="fine"><strong>Hành động tiếp theo:</strong></p>
    <div class="next-actions__grid">
      <button type="button" class="next-btn" data-action="pharmacist">1. Hỏi dược sĩ</button>
      <button type="button" class="next-btn" data-action="similar">2. Thuốc tương tự</button>
      <button type="button" class="next-btn" data-action="comorbidity">3. Kiểm tra bệnh nền</button>
      <button type="button" class="next-btn" data-action="upload">4. Upload ảnh khác</button>
      <button type="button" class="next-btn" data-action="save">5. Lưu kết quả</button>
    </div>
  </div>`;
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

function checkIcon(status) {
  if (status === 'pass') return '✓';
  if (status === 'fail') return '✗';
  return '!';
}

/**
 * Thẻ an toàn đầy đủ — bước 8 flow
 * @param {object} structured
 * @param {object} drug
 * @param {object} profile
 * @param {string} disclaimer
 */
export function buildFullSafetyCardHtml(structured, drug, profile, disclaimer) {
  const level = structured.safetyLevel || 'yellow';
  const patient = { age: profile.age, gender: profile.gender };
  const evaluation = drug
    ? evaluateSafety(drug, structured.condition || '', patient)
    : { level, summary: structured.safetySummary, matchedRules: structured.matchedRules || [] };
  const safety = runSafetyChecks(drug, evaluation, profile, structured.condition || '');
  const suitability = safety.suitability || suitabilityFromLevel(level);
  const whenAsk = whenToSeeProfessional(level, suitability);

  const checksHtml = safety.checks
    .map(
      (c) =>
        `<li><span class="check-icon check-icon--${c.status}">${checkIcon(c.status)}</span> <strong>${escapeHtml(c.name)}:</strong> ${escapeHtml(c.note)}</li>`
    )
    .join('');

  const warnings = Array.isArray(structured.warnings)
    ? structured.warnings
    : structured.sections?.[3]?.body
      ? [structured.sections[3].body]
      : [];
  const contraindications = Array.isArray(structured.contraindications)
    ? structured.contraindications
    : structured.sections?.[4]?.body
      ? [structured.sections[4].body]
      : [];

  const sourcesHtml = (structured.sources || [])
    .map((s) => `<li>${escapeHtml(s.title || s.link || 'Nguồn tham khảo')}</li>`)
    .join('');

  return `<div class="card ${levelClass(level)} safety-card safety-card--full">
    <div class="card__header">
      <span class="badge">${levelBadge(level)}</span>
      <h3>Thẻ an toàn — ${escapeHtml(structured.drugName)}</h3>
    </div>
    <dl class="kv">
      <dt>Tên thuốc</dt><dd><strong>${escapeHtml(structured.drugName)}</strong></dd>
      <dt>Hoạt chất</dt><dd>${escapeHtml(structured.activeIngredient || '—')}</dd>
      <dt>Công dụng</dt><dd>${escapeHtml(structured.sections?.[1]?.body || structured.indications || '—')}</dd>
      <dt>Phù hợp tình trạng?</dt><dd><strong class="suitability suitability--${level}">${escapeHtml(suitability)}</strong> — ${escapeHtml(structured.safetySummary || '')}</dd>
      <dt>Cảnh báo</dt><dd>${escapeHtml(warnings.join('; ') || 'Theo tờ hướng dẫn và chỉ định dược sĩ.')}</dd>
      <dt>Chống chỉ định</dt><dd>${escapeHtml(contraindications.join('; ') || 'Xem nhãn thuốc / hỏi dược sĩ.')}</dd>
      <dt>Tác dụng phụ</dt><dd>${escapeHtml(warnings.join('; ') || 'Thường gặp ở mức nhẹ nếu dùng đúng liều.')}</dd>
      <dt>Khi nào gặp dược sĩ/bác sĩ</dt><dd>${escapeHtml(whenAsk)}</dd>
      <dt>Mức tin cậy</dt><dd>${escapeHtml(safety.confidence)} (DB demo + rule engine)</dd>
    </dl>
    <details class="safety-details">
      <summary>Safety Check Engine (6 bước)</summary>
      <ul class="check-list">${checksHtml}</ul>
    </details>
    ${sourcesHtml ? `<p class="fine"><strong>Nguồn tham khảo:</strong></p><ul class="pick-list">${sourcesHtml}</ul>` : ''}
    <p class="disclaimer">${escapeHtml(disclaimer)}</p>
    ${buildNextActionsHtml()}
  </div>`;
}

export function bindNeedButtons(container, onPick) {
  container.querySelectorAll('[data-need]').forEach((btn) => {
    btn.addEventListener('click', () => onPick(btn.getAttribute('data-need')));
  });
}

export function bindNextActions(container, handlers) {
  container.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      handlers[action]?.();
    });
  });
}
