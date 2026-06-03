/**
 * ============================================================
 * AI LEARNING PATH PERSONALIZER — MAIN APPLICATION SCRIPT
 * VinUni Batch 02 · Day 05
 *
 * Architecture:
 *   - AppState: single source of truth
 *   - Tab system
 *   - Multi-step form + validation
 *   - Quiz engine (10 questions, scoring, confidence)
 *   - Chat interface + rate limiter
 *   - Roadmap renderer (tree from JSON)
 *   - Fallback / Failure / Correction modes
 *   - Toast notification system
 *   - API integration: /api/analyze, /api/chat, /api/feedback
 * ============================================================
 */

'use strict';

/* ─── API CONFIGURATION ──────────────────────────────────────── */
const API_BASE = window.location.origin; // Same-origin backend
const ENDPOINTS = {
  analyze:  `${API_BASE}/api/analyze`,
  chat:     `${API_BASE}/api/chat`,
  feedback: `${API_BASE}/api/feedback`,
};

/* ─── INPUT SANITIZATION GUARDRAIL ──────────────────────────── */
/**
 * Basic frontend XSS / injection guardrail.
 * Strips script tags, HTML tags, and dangerous patterns.
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script blocks
    .replace(/<[^>]+>/g, '')                      // Strip HTML tags
    .replace(/javascript:/gi, '')                 // Remove JS protocol
    .replace(/on\w+\s*=/gi, '')                   // Remove event handlers
    .replace(/[<>]/g, (c) => c === '<' ? '&lt;' : '&gt;') // Encode angle brackets
    .trim()
    .substring(0, 1000);                          // Hard length limit
}

/* ─── APP STATE ──────────────────────────────────────────────── */
/**
 * Central state object — single source of truth.
 * Never mutate directly from UI handlers; use setState().
 */
const AppState = {
  // Form data
  userData: {
    goal_why:  '',
    goal_time: '',
    goal_job:  '',
    goal_bg:   '',
  },

  // Quiz
  quiz: {
    currentIndex: 0,
    answers: new Array(10).fill(null), // index → selected option index
    startTime:  null,
    endTime:    null,
    timerInterval: null,
  },

  // Results
  results: {
    score:       0,       // 0–10
    confidence:  0,       // 0–100
    level:       '',      // 'Beginner' | 'Intermediate' | 'Advanced'
    roadmap:     null,    // JSON roadmap data
    isFallback:  false,
    isFailure:   false,
    sessionId:   null,
  },

  // Chat
  chat: {
    history:        [],   // { role: 'user'|'ai', content: string, time: Date }
    rateLimit: {
      remaining:    5,
      max:          5,
      resetAt:      null, // timestamp when limit resets
      countdown:    null, // setInterval ref
    },
    totalTokens:   0,
    totalCostUSD:  0,
    isLoading:     false,
  },

  // Milestones completion
  completedMilestones: new Set(),

  // UI state
  ui: {
    currentTab:    'chat',
    currentStep:   1,
    feedbackRating: 0,
  },
};

/* ─── STATE HELPERS ──────────────────────────────────────────── */
function setState(path, value) {
  const keys = path.split('.');
  let obj = AppState;
  keys.slice(0, -1).forEach(k => { obj = obj[k]; });
  obj[keys[keys.length - 1]] = value;
}

/* ─── QUIZ DATA (10 Vietnamese AI Questions) ─────────────────── */
const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: 'Đạo hàm của hàm số f(x) = x² là gì?',
    options: [
      { label: 'A', text: '2x' },
      { label: 'B', text: 'x²' },
      { label: 'C', text: '2' },
      { label: 'D', text: 'x' },
    ],
    correct: 0, // index 0 = A
    explanation: 'Đạo hàm của xⁿ = n·xⁿ⁻¹. Với n=2: d/dx(x²) = 2x.',
  },
  {
    id: 2,
    text: 'Trong xác suất, P(A|B) có nghĩa là gì?',
    options: [
      { label: 'A', text: 'Xác suất A xảy ra khi B đã xảy ra (xác suất có điều kiện)' },
      { label: 'B', text: 'Xác suất A và B cùng xảy ra' },
      { label: 'C', text: 'Xác suất A hoặc B xảy ra' },
      { label: 'D', text: 'Xác suất A không xảy ra khi B xảy ra' },
    ],
    correct: 0,
    explanation: 'P(A|B) là xác suất có điều kiện: xác suất A xảy ra biết rằng B đã xảy ra.',
  },
  {
    id: 3,
    text: 'Ma trận kích thước 2×3 nhân với ma trận 3×4 cho kết quả có kích thước là gì?',
    options: [
      { label: 'A', text: '2×4' },
      { label: 'B', text: '3×3' },
      { label: 'C', text: '2×3' },
      { label: 'D', text: '3×4' },
    ],
    correct: 0,
    explanation: 'Phép nhân ma trận (m×k) · (k×n) = (m×n). Ở đây (2×3) · (3×4) = (2×4).',
  },
  {
    id: 4,
    text: 'Thuật toán nào dưới đây là thuật toán Supervised Learning (học có giám sát)?',
    options: [
      { label: 'A', text: 'K-Means Clustering' },
      { label: 'B', text: 'Linear Regression' },
      { label: 'C', text: 'Principal Component Analysis (PCA)' },
      { label: 'D', text: 'DBSCAN' },
    ],
    correct: 1, // B = index 1
    explanation: 'Linear Regression là supervised learning vì cần nhãn (label) để huấn luyện. K-Means, PCA, DBSCAN đều là unsupervised.',
  },
  {
    id: 5,
    text: 'Overfitting trong Machine Learning có nghĩa là gì?',
    options: [
      { label: 'A', text: 'Model học quá kỹ training data, không tổng quát được cho dữ liệu mới' },
      { label: 'B', text: 'Model không học đủ từ dữ liệu huấn luyện' },
      { label: 'C', text: 'Model có quá nhiều tham số nhưng vẫn hoạt động tốt' },
      { label: 'D', text: 'Model hội tụ quá nhanh trong quá trình training' },
    ],
    correct: 0,
    explanation: 'Overfitting: model "ghi nhớ" training data, dẫn đến validation/test loss cao hơn training loss đáng kể.',
  },
  {
    id: 6,
    text: 'Thuật toán Gradient Descent được dùng để làm gì trong Machine Learning?',
    options: [
      { label: 'A', text: 'Tăng giá trị của hàm mất mát (loss function)' },
      { label: 'B', text: 'Tối thiểu hóa hàm mất mát bằng cách cập nhật tham số theo hướng ngược chiều gradient' },
      { label: 'C', text: 'Tạo dữ liệu giả để augment tập training' },
      { label: 'D', text: 'Phân tích độ phức tạp tính toán của model' },
    ],
    correct: 1,
    explanation: 'Gradient Descent cập nhật θ = θ - α·∇L(θ), trong đó α là learning rate và ∇L là gradient của loss.',
  },
  {
    id: 7,
    text: 'Trong Python, thư viện nào được sử dụng phổ biến nhất cho Machine Learning?',
    options: [
      { label: 'A', text: 'Flask' },
      { label: 'B', text: 'Django' },
      { label: 'C', text: 'scikit-learn' },
      { label: 'D', text: 'FastAPI' },
    ],
    correct: 2, // C = index 2
    explanation: 'scikit-learn (sklearn) là thư viện ML chuẩn mực cho Python, bao gồm hàng chục thuật toán sẵn dùng.',
  },
  {
    id: 8,
    text: 'Neural Network có nhiều hidden layers (lớp ẩn) được gọi là gì?',
    options: [
      { label: 'A', text: 'Shallow Neural Network' },
      { label: 'B', text: 'Deep Neural Network' },
      { label: 'C', text: 'Wide Neural Network' },
      { label: 'D', text: 'Dense Neural Network' },
    ],
    correct: 1,
    explanation: '"Deep" trong Deep Learning ám chỉ nhiều lớp ẩn (hidden layers). Deep Neural Network ≥ 2 hidden layers.',
  },
  {
    id: 9,
    text: 'Cross-entropy loss (binary/categorical) thường được sử dụng cho loại bài toán nào?',
    options: [
      { label: 'A', text: 'Regression (dự đoán giá trị liên tục)' },
      { label: 'B', text: 'Classification (phân loại)' },
      { label: 'C', text: 'Clustering (phân cụm)' },
      { label: 'D', text: 'Dimensionality Reduction (giảm chiều dữ liệu)' },
    ],
    correct: 1,
    explanation: 'Cross-entropy đo độ khác biệt giữa phân phối xác suất dự đoán và nhãn thực — lý tưởng cho bài toán phân loại.',
  },
  {
    id: 10,
    text: 'Transfer Learning (học chuyển giao) có nghĩa là gì?',
    options: [
      { label: 'A', text: 'Chuyển dữ liệu từ máy tính này sang máy tính khác để huấn luyện' },
      { label: 'B', text: 'Sử dụng lại model đã được huấn luyện sẵn (pre-trained) cho một bài toán mới, thường bằng fine-tuning' },
      { label: 'C', text: 'Chuyển kiến thức từ một lập trình viên sang người khác' },
      { label: 'D', text: 'Huấn luyện model từ đầu với dữ liệu của bài toán đích' },
    ],
    correct: 1,
    explanation: 'Transfer Learning: tận dụng weights từ model đã train (VD: ResNet, BERT) và fine-tune cho task mới, tiết kiệm data và compute.',
  },
];

/* ─── DEFAULT ROADMAP DATA ───────────────────────────────────── */
/**
 * Baseline roadmap shown in fallback/failure mode.
 * Production system generates this from /api/analyze.
 */
const DEFAULT_ROADMAP = {
  title:    'Lộ trình học AI cơ bản',
  subtitle: 'Từ zero đến AI practitioner trong 6–12 tháng',
  phases: [
    {
      id: 'phase-1',
      number: 1,
      title: 'Nền tảng Toán học & Lập trình',
      duration: '4–6 tuần',
      milestones: [
        {
          id: 'm-1-1', icon: '🔢', status: 'active',
          title: 'Đại số tuyến tính cơ bản',
          desc:  'Vector, ma trận, phép nhân ma trận, trị riêng — nền tảng cho ML.',
          tags:  ['Toán học', 'Cơ bản'],
          time:  '1–2 tuần',
        },
        {
          id: 'm-1-2', icon: '📊', status: 'locked',
          title: 'Xác suất & Thống kê',
          desc:  'Phân phối xác suất, kỳ vọng, variance, Bayes theorem.',
          tags:  ['Toán học', 'Thống kê'],
          time:  '1–2 tuần',
        },
        {
          id: 'm-1-3', icon: '🐍', status: 'locked',
          title: 'Python cho Data Science',
          desc:  'NumPy, Pandas, Matplotlib — bộ công cụ thiết yếu.',
          tags:  ['Python', 'Công cụ'],
          time:  '1–2 tuần',
        },
      ],
    },
    {
      id: 'phase-2',
      number: 2,
      title: 'Machine Learning cơ bản',
      duration: '6–8 tuần',
      milestones: [
        {
          id: 'm-2-1', icon: '📈', status: 'locked',
          title: 'Supervised Learning',
          desc:  'Linear/Logistic Regression, Decision Trees, SVM, k-NN.',
          tags:  ['ML', 'Supervised'],
          time:  '2–3 tuần',
        },
        {
          id: 'm-2-2', icon: '🔍', status: 'locked',
          title: 'Unsupervised Learning',
          desc:  'K-Means, PCA, DBSCAN — tìm kiếm pattern trong dữ liệu.',
          tags:  ['ML', 'Unsupervised'],
          time:  '1–2 tuần',
        },
        {
          id: 'm-2-3', icon: '🛠️', status: 'locked',
          title: 'Model Evaluation & Tuning',
          desc:  'Cross-validation, grid search, bias-variance tradeoff.',
          tags:  ['ML', 'Kỹ thuật'],
          time:  '1–2 tuần',
        },
      ],
    },
    {
      id: 'phase-3',
      number: 3,
      title: 'Deep Learning & Neural Networks',
      duration: '8–10 tuần',
      milestones: [
        {
          id: 'm-3-1', icon: '🧠', status: 'locked',
          title: 'Neural Networks & Backpropagation',
          desc:  'Kiến trúc MLP, activation functions, gradient descent.',
          tags:  ['Deep Learning', 'Core'],
          time:  '2–3 tuần',
        },
        {
          id: 'm-3-2', icon: '👁️', status: 'locked',
          title: 'Computer Vision với CNN',
          desc:  'Convolutional layers, image classification, object detection.',
          tags:  ['CNN', 'Vision'],
          time:  '2–3 tuần',
        },
        {
          id: 'm-3-3', icon: '💬', status: 'locked',
          title: 'NLP & Transformers',
          desc:  'RNN, LSTM, Attention, BERT, GPT — nền tảng LLM.',
          tags:  ['NLP', 'Transformer'],
          time:  '3–4 tuần',
        },
      ],
    },
    {
      id: 'phase-4',
      number: 4,
      title: 'Dự án thực tế & Triển khai',
      duration: '4–6 tuần',
      milestones: [
        {
          id: 'm-4-1', icon: '🚀', status: 'locked',
          title: 'Xây dựng dự án AI hoàn chỉnh',
          desc:  'End-to-end ML pipeline: thu thập data → model → API → UI.',
          tags:  ['Project', 'Production'],
          time:  '2–3 tuần',
        },
        {
          id: 'm-4-2', icon: '☁️', status: 'locked',
          title: 'Triển khai & MLOps cơ bản',
          desc:  'Docker, REST API, model serving, monitoring cơ bản.',
          tags:  ['MLOps', 'Deploy'],
          time:  '2–3 tuần',
        },
      ],
    },
  ],
};

/* ─── STAR RATING LABELS ─────────────────────────────────────── */
const STAR_LABELS = {
  1: '😞 Rất không phù hợp',
  2: '😕 Không phù hợp',
  3: '😐 Tạm được',
  4: '😊 Phù hợp',
  5: '🤩 Rất phù hợp! Xuất sắc!',
};

const SCORE_LEVELS = [
  { min: 0,  max: 3,  label: '🌱 Mới bắt đầu',       badge: 'Beginner' },
  { min: 4,  max: 6,  label: '📘 Đang phát triển',    badge: 'Intermediate' },
  { min: 7,  max: 8,  label: '🔥 Khá tốt',            badge: 'Advanced Beginner' },
  { min: 9,  max: 10, label: '⚡ Nâng cao',           badge: 'Advanced' },
];

/* ─── DOM REFERENCES (cached on init) ───────────────────────── */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

/* ─── TOAST SYSTEM ───────────────────────────────────────────── */
const Toast = {
  container: null,

  init() {
    this.container = $('toast-container');
  },

  /**
   * Show a toast notification.
   * @param {Object} opts - { title, message, type: 'success'|'error'|'warning'|'info', duration }
   */
  show({ title = '', message = '', type = 'info', duration = 4000 } = {}) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-body">
        ${title    ? `<div class="toast-title">${title}</div>` : ''}
        ${message  ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <span class="toast-close" aria-label="Đóng">×</span>
    `;
    this.container.appendChild(el);

    // Close handler
    el.querySelector('.toast-close').addEventListener('click', () => this._remove(el));

    // Auto-remove
    const timer = setTimeout(() => this._remove(el), duration);
    el._timer = timer;
  },

  _remove(el) {
    clearTimeout(el._timer);
    el.classList.add('closing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    // Fallback if animation doesn't fire
    setTimeout(() => el.remove(), 500);
  },

  success(title, message) { this.show({ title, message, type: 'success' }); },
  error(title, message)   { this.show({ title, message, type: 'error',   duration: 6000 }); },
  warning(title, message) { this.show({ title, message, type: 'warning' }); },
  info(title, message)    { this.show({ title, message, type: 'info' }); },
};

/* ─── COST DISPLAY ───────────────────────────────────────────── */
const CostDisplay = {
  el:    null,
  label: null,

  init() {
    this.el    = $('cost-display');
    this.label = $('cost-label');
  },

  update(tokens, costUSD) {
    AppState.chat.totalTokens  += tokens;
    AppState.chat.totalCostUSD += costUSD;
    const total = AppState.chat.totalTokens;
    const cost  = AppState.chat.totalCostUSD.toFixed(4);
    if (this.label) this.label.textContent = `${total.toLocaleString()} tokens · $${cost}`;
  },
};

/* ─── TAB SYSTEM ─────────────────────────────────────────────── */
const Tabs = {
  chatBtn:     null,
  roadmapBtn:  null,
  chatPanel:   null,
  roadmapPanel:null,
  underline:   null,

  init() {
    this.chatBtn      = $('tab-chat-btn');
    this.roadmapBtn   = $('tab-roadmap-btn');
    this.chatPanel    = $('tab-chat');
    this.roadmapPanel = $('tab-roadmap');
    this.underline    = $('tab-underline');

    this.chatBtn.addEventListener('click',    () => this.switchTo('chat'));
    this.roadmapBtn.addEventListener('click', () => this.switchTo('roadmap'));

    // Set initial underline position
    this._updateUnderline(this.chatBtn);
  },

  switchTo(tabName) {
    AppState.ui.currentTab = tabName;

    const isChat = (tabName === 'chat');
    this.chatBtn.classList.toggle('active', isChat);
    this.roadmapBtn.classList.toggle('active', !isChat);
    this.chatBtn.setAttribute('aria-selected', isChat);
    this.roadmapBtn.setAttribute('aria-selected', !isChat);

    // Animate panel switch
    const showing = isChat ? this.chatPanel    : this.roadmapPanel;
    const hiding  = isChat ? this.roadmapPanel : this.chatPanel;

    hiding.classList.remove('active');
    showing.classList.add('active');

    // Update underline
    this._updateUnderline(isChat ? this.chatBtn : this.roadmapBtn);

    // Scroll to bottom of chat when switching to it
    if (isChat) {
      requestAnimationFrame(() => ChatUI.scrollToBottom());
    }
  },

  _updateUnderline(activeBtn) {
    if (!this.underline || !activeBtn) return;
    const rect  = activeBtn.getBoundingClientRect();
    const navRect = activeBtn.closest('.tabs-nav').getBoundingClientRect();
    this.underline.style.left  = `${rect.left - navRect.left}px`;
    this.underline.style.width = `${rect.width}px`;
  },
};

/* ─── STEP FORM CONTROLLER ───────────────────────────────────── */
const StepForm = {
  step1El: null,
  step2El: null,
  ind1:    null,
  ind2:    null,
  line1:   null,

  init() {
    this.step1El = $('step-1');
    this.step2El = $('step-2');
    this.ind1    = $('step-ind-1');
    this.ind2    = $('step-ind-2');
    this.line1   = $('step-line-1');

    // Form submission (Step 1 → Step 2)
    $('goal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._submitStep1();
    });

    // Also mark selects as has-value for floating label
    ['goal-why', 'goal-time', 'goal-bg'].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => {
        el.classList.toggle('has-value', el.value !== '');
      });
    });
  },

  _validateStep1() {
    let valid = true;
    const why  = $('goal-why').value;
    const time = $('goal-time').value;
    const bg   = $('goal-bg').value;

    $('err-why').textContent  = why  ? '' : 'Vui lòng chọn lý do học AI.';
    $('err-time').textContent = time ? '' : 'Vui lòng chọn thời gian học.';
    $('err-bg').textContent   = bg   ? '' : 'Vui lòng chọn trình độ lập trình.';

    if (!why || !time || !bg) valid = false;
    return valid;
  },

  _submitStep1() {
    if (!this._validateStep1()) return;

    // Save to state
    AppState.userData.goal_why  = sanitizeInput($('goal-why').value);
    AppState.userData.goal_time = sanitizeInput($('goal-time').value);
    AppState.userData.goal_job  = sanitizeInput($('goal-job').value);
    AppState.userData.goal_bg   = sanitizeInput($('goal-bg').value);

    this.goToStep(2);
  },

  goToStep(step) {
    AppState.ui.currentStep = step;

    if (step === 1) {
      this.step1El.classList.remove('hidden');
      this.step2El.classList.add('hidden');
      this.ind1.classList.add('active');
      this.ind1.classList.remove('completed');
      this.ind2.classList.remove('active', 'completed');
      this.line1.classList.remove('active');
    } else if (step === 2) {
      this.step1El.classList.add('hidden');
      this.step2El.classList.remove('hidden');
      this.ind1.classList.remove('active');
      this.ind1.classList.add('completed');
      this.ind2.classList.add('active');
      this.line1.classList.add('active');
      Quiz.start();
    }
  },
};

/* ─── QUIZ ENGINE ────────────────────────────────────────────── */
const Quiz = {
  _timerEl:     null,
  _progressFill:null,
  _progressLabel:null,
  _cardEl:      null,
  _qNumber:     null,
  _qText:       null,
  _qOptions:    null,
  _qFeedback:   null,
  _dotsEl:      null,
  _prevBtn:     null,
  _nextBtn:     null,

  init() {
    this._timerEl      = $('quiz-time-display');
    this._progressFill = $('quiz-progress-fill');
    this._progressLabel= $('quiz-progress-label');
    this._cardEl       = $('question-card');
    this._qNumber      = $('q-number');
    this._qText        = $('q-text');
    this._qOptions     = $('q-options');
    this._qFeedback    = $('q-feedback');
    this._dotsEl       = $('quiz-dots');
    this._prevBtn      = $('btn-quiz-prev');
    this._nextBtn      = $('btn-quiz-next');

    this._prevBtn.addEventListener('click', () => this._navigate(-1));
    this._nextBtn.addEventListener('click', () => this._navigate(1));
  },

  start() {
    AppState.quiz.currentIndex = 0;
    AppState.quiz.answers      = new Array(10).fill(null);
    AppState.quiz.startTime    = Date.now();

    // Build dots
    this._buildDots();

    // Render first question
    this._renderQuestion(0);

    // Start timer
    this._startTimer();

    Toast.info('Bài kiểm tra bắt đầu!', '10 câu hỏi về nền tảng AI. Chọn đáp án tốt nhất!');
  },

  _startTimer() {
    if (AppState.quiz.timerInterval) clearInterval(AppState.quiz.timerInterval);
    AppState.quiz.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - AppState.quiz.startTime) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(1, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      if (this._timerEl) this._timerEl.textContent = `${m}:${s}`;
    }, 1000);
  },

  _buildDots() {
    this._dotsEl.innerHTML = QUIZ_QUESTIONS.map((_, i) => `
      <div class="quiz-dot" id="qdot-${i}" title="Câu ${i + 1}" data-index="${i}"></div>
    `).join('');

    this._dotsEl.querySelectorAll('.quiz-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        this._navigate(idx - AppState.quiz.currentIndex);
      });
    });
  },

  _updateDots() {
    QUIZ_QUESTIONS.forEach((q, i) => {
      const dot = $(`qdot-${i}`);
      if (!dot) return;
      dot.className = 'quiz-dot';
      if (i === AppState.quiz.currentIndex) { dot.classList.add('active'); return; }
      const answer = AppState.quiz.answers[i];
      if (answer === null) return;
      if (answer === q.correct) dot.classList.add('correct');
      else dot.classList.add('wrong');
    });
  },

  _renderQuestion(index) {
    const q = QUIZ_QUESTIONS[index];
    const selected = AppState.quiz.answers[index];

    // Animate card
    this._cardEl.style.animation = 'none';
    requestAnimationFrame(() => {
      this._cardEl.style.animation = 'slideUp 0.3s ease both';
    });

    this._qNumber.textContent = `Câu ${index + 1}`;
    this._qText.textContent   = q.text;

    // Render options
    this._qOptions.innerHTML = q.options.map((opt, i) => `
      <button
        class="option-btn ${selected !== null ? (i === q.correct ? 'correct' : (selected === i ? 'wrong' : '')) : (selected === i ? 'selected' : '')}"
        data-index="${i}"
        ${selected !== null ? 'disabled' : ''}
        aria-pressed="${selected === i}"
      >
        <span class="opt-label">${opt.label}</span>
        <span>${opt.text}</span>
      </button>
    `).join('');

    // Attach click handlers (only if not already answered)
    if (selected === null) {
      this._qOptions.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._selectAnswer(index, parseInt(btn.dataset.index));
        });
      });
    }

    // Show feedback if already answered
    if (selected !== null) {
      const isCorrect = (selected === q.correct);
      this._qFeedback.className = `question-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      this._qFeedback.textContent = isCorrect
        ? `✓ Chính xác! ${q.explanation}`
        : `✗ Sai. Đáp án đúng: ${q.options[q.correct].text}. ${q.explanation}`;
    } else {
      this._qFeedback.className = 'question-feedback';
      this._qFeedback.textContent = '';
    }

    // Update progress
    const answered = AppState.quiz.answers.filter(a => a !== null).length;
    const pct = ((index + 1) / QUIZ_QUESTIONS.length) * 100;
    this._progressFill.style.width  = `${pct}%`;
    this._progressLabel.textContent = `Câu ${index + 1} / ${QUIZ_QUESTIONS.length}`;

    // Update nav buttons
    this._prevBtn.disabled = (index === 0);
    this._nextBtn.disabled = (selected === null && index < QUIZ_QUESTIONS.length - 1);

    // Last question check
    const isLast = (index === QUIZ_QUESTIONS.length - 1);
    if (isLast && selected !== null) {
      this._nextBtn.innerHTML = `
        Nộp bài
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      `;
      this._nextBtn.onclick = () => this._submitQuiz();
      this._nextBtn.disabled = false;
    } else {
      this._nextBtn.innerHTML = `
        Câu tiếp
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      `;
      this._nextBtn.onclick = () => this._navigate(1);
    }

    this._updateDots();
  },

  _selectAnswer(questionIndex, optionIndex) {
    AppState.quiz.answers[questionIndex] = optionIndex;

    // Re-render to show correct/wrong states
    this._renderQuestion(questionIndex);

    // Enable next button
    this._nextBtn.disabled = false;
  },

  _navigate(delta) {
    const next = AppState.quiz.currentIndex + delta;
    if (next < 0 || next >= QUIZ_QUESTIONS.length) return;
    AppState.quiz.currentIndex = next;
    this._renderQuestion(next);
  },

  _submitQuiz() {
    // Clear timer
    if (AppState.quiz.timerInterval) {
      clearInterval(AppState.quiz.timerInterval);
      AppState.quiz.timerInterval = null;
    }
    AppState.quiz.endTime = Date.now();

    // Calculate score
    const score = AppState.quiz.answers.reduce((acc, ans, i) => {
      return acc + (ans === QUIZ_QUESTIONS[i].correct ? 1 : 0);
    }, 0);

    AppState.results.score = score;

    // Determine level
    const levelInfo = SCORE_LEVELS.find(l => score >= l.min && score <= l.max) || SCORE_LEVELS[0];
    AppState.results.level = levelInfo.badge;

    // Calculate confidence (0–100)
    // Base: (score/10) * 80 + 20 (min 20%)
    // Reduce if many unanswered (shouldn't happen but guard)
    const answered = AppState.quiz.answers.filter(a => a !== null).length;
    const base = (score / 10) * 80 + 20;
    const completionFactor = answered / 10;
    AppState.results.confidence = Math.round(base * completionFactor);

    // Determine fallback mode
    AppState.results.isFallback = AppState.results.confidence < 80;

    Toast.success('Nộp bài thành công!', `Điểm của bạn: ${score}/10. Đang phân tích lộ trình...`);

    // Transition to results
    ResultsUI.show();
  },
};

/* ─── RESULTS UI ─────────────────────────────────────────────── */
const ResultsUI = {
  show() {
    // Hide form section
    $('form-section').classList.add('hidden');

    // Show results
    const resultsEl = $('results-section');
    resultsEl.classList.remove('hidden');

    // Update confidence meter
    this._animateConfidence();

    // Update score
    $('score-display').textContent = `${AppState.results.score} / 10`;
    const levelInfo = SCORE_LEVELS.find(l => AppState.results.score >= l.min && AppState.results.score <= l.max);
    $('score-level').textContent = levelInfo ? levelInfo.label : '—';

    // Show fallback alert if needed
    if (AppState.results.isFallback) {
      $('fallback-alert').classList.remove('hidden');
    }

    // Init tabs
    Tabs.switchTo('chat');

    // Load roadmap (with loading state)
    Roadmap.loadSkeleton();

    // Call API analyze
    this._callAnalyzeAPI();

    // Setup chat welcome message
    ChatUI.init();

    // Smooth scroll to results
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  _animateConfidence() {
    const conf = AppState.results.confidence;
    const fill = $('confidence-fill');
    const val  = $('confidence-value');
    const badge    = $('confidence-badge');
    const badgeText= $('confidence-badge-text');
    const badgeDot = badge.querySelector('.badge-dot');

    // Animate fill with delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (fill) fill.style.width = `${conf}%`;
        if (val)  val.textContent  = `${conf}%`;
      }, 300);
    });

    // Set badge
    if (conf >= 80) {
      if (badgeDot) badgeDot.style.background = 'var(--color-success)';
      if (badgeText) badgeText.textContent = 'Độ tự tin cao — lộ trình cá nhân hóa';
      badge.innerHTML = `<span class="badge-dot" style="background:var(--color-success);width:8px;height:8px;border-radius:999px;animation:pulse 2s infinite"></span> <span>Độ tự tin cao</span>`;
    } else if (conf >= 50) {
      badge.innerHTML = `<span class="badge-dot" style="background:var(--color-warning);width:8px;height:8px;border-radius:999px;animation:pulse 2s infinite"></span> <span>Độ tự tin trung bình — lộ trình cơ bản</span>`;
    } else {
      badge.innerHTML = `<span class="badge-dot" style="background:var(--color-error);width:8px;height:8px;border-radius:999px;animation:pulse 2s infinite"></span> <span>Độ tự tin thấp — cần thêm thông tin</span>`;
    }
  },

  async _callAnalyzeAPI() {
    const payload = {
      user_data: AppState.userData,
      quiz_answers: AppState.quiz.answers,
      quiz_score:   AppState.results.score,
      confidence:   AppState.results.confidence,
      level:        AppState.results.level,
      time_taken_s: AppState.quiz.endTime
        ? Math.round((AppState.quiz.endTime - AppState.quiz.startTime) / 1000) : 0,
    };

    try {
      const response = await fetch(ENDPOINTS.analyze, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Update state with API response
      AppState.results.roadmap    = data.roadmap || DEFAULT_ROADMAP;
      AppState.results.sessionId  = data.session_id || null;
      AppState.results.isFallback = data.is_fallback || AppState.results.isFallback;

      // Update cost
      if (data.usage) {
        CostDisplay.update(data.usage.total_tokens || 0, data.usage.cost_usd || 0);
      }

      // Update confidence from API if provided
      if (typeof data.confidence === 'number') {
        AppState.results.confidence = data.confidence;
        this._animateConfidence();
      }

      // Render roadmap
      Roadmap.render(AppState.results.roadmap);

      // Show fallback alert if API confirms it
      if (data.is_fallback) {
        $('fallback-alert').classList.remove('hidden');
      } else {
        $('fallback-alert').classList.add('hidden');
      }

      Toast.success('Lộ trình đã sẵn sàng!', 'AI đã phân tích xong và tạo lộ trình phù hợp cho bạn.');

    } catch (err) {
      console.warn('[Analyze API] Error (using fallback):', err.message);

      // Failure mode — use default roadmap
      AppState.results.isFailure = true;
      AppState.results.roadmap   = DEFAULT_ROADMAP;
      AppState.results.isFallback = true;

      $('failure-alert').classList.remove('hidden');
      $('fallback-alert').classList.remove('hidden');

      Roadmap.render(DEFAULT_ROADMAP);

      Toast.warning('Dùng lộ trình mặc định', 'Không kết nối được API. Đang hiển thị lộ trình cơ bản.');
    }
  },
};

/* ─── ROADMAP RENDERER ───────────────────────────────────────── */
const Roadmap = {
  treeEl:   null,
  skeletonEl: null,

  init() {
    this.treeEl    = $('roadmap-tree');
    this.skeletonEl = $('roadmap-skeleton');

    $('btn-export-roadmap').addEventListener('click', () => this.exportAsText());
    $('btn-retry').addEventListener('click', () => {
      $('failure-alert').classList.add('hidden');
      ResultsUI._callAnalyzeAPI();
    });
  },

  loadSkeleton() {
    if (this.skeletonEl) this.skeletonEl.classList.remove('hidden');
  },

  render(roadmapData) {
    if (!this.treeEl) return;

    // Hide skeleton
    if (this.skeletonEl) this.skeletonEl.classList.add('hidden');

    // Update meta
    const titleEl = $('roadmap-title');
    const subtitleEl = $('roadmap-subtitle');
    if (titleEl && roadmapData.title)    titleEl.textContent    = roadmapData.title;
    if (subtitleEl && roadmapData.subtitle) subtitleEl.textContent = roadmapData.subtitle;

    // Clear existing content (except skeleton)
    const existingPhases = this.treeEl.querySelectorAll('.roadmap-phase');
    existingPhases.forEach(el => el.remove());

    // Build phases
    const phases = roadmapData.phases || [];
    phases.forEach((phase, phaseIdx) => {
      const phaseEl = this._buildPhase(phase, phaseIdx);
      this.treeEl.appendChild(phaseEl);
    });
  },

  _buildPhase(phase, phaseIdx) {
    const el = document.createElement('div');
    el.className = 'roadmap-phase';
    el.style.animationDelay = `${phaseIdx * 0.12}s`;

    el.innerHTML = `
      <div class="roadmap-phase-header">
        <div class="phase-number">${phase.number || phaseIdx + 1}</div>
        <div>
          <div class="phase-title">${phase.title || 'Giai đoạn ' + (phaseIdx + 1)}</div>
          <div class="phase-duration">⏱ ${phase.duration || ''}</div>
        </div>
        <div class="phase-line"></div>
      </div>
      <div class="milestones-list" id="milestones-${phase.id || phaseIdx}"></div>
    `;

    const listEl = el.querySelector('.milestones-list');
    const milestones = phase.milestones || [];

    milestones.forEach((ms, msIdx) => {
      const card = this._buildMilestone(ms, msIdx);
      listEl.appendChild(card);
    });

    return el;
  },

  _buildMilestone(ms, msIdx) {
    // Check if completed via state
    const isCompleted = AppState.completedMilestones.has(ms.id);
    const status = isCompleted ? 'completed' : (ms.status || 'locked');

    const el = document.createElement('div');
    el.className = `milestone-card ${status}`;
    el.dataset.id = ms.id;
    el.style.animationDelay = `${msIdx * 0.08}s`;

    el.innerHTML = `
      <div class="milestone-node"></div>
      <div class="milestone-icon">${ms.icon || '📌'}</div>
      <div class="milestone-body">
        <div class="milestone-title">${ms.title || 'Milestone'}</div>
        <div class="milestone-desc">${ms.desc || ''}</div>
        <div class="milestone-meta">
          ${(ms.tags || []).map(tag => `<span class="milestone-tag">${tag}</span>`).join('')}
          ${ms.time ? `<span class="milestone-time">⏱ ${ms.time}</span>` : ''}
        </div>
      </div>
      <button class="milestone-check" title="${isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}" aria-label="Toggle hoàn thành">
        ${isCompleted ? '✓' : ''}
      </button>
    `;

    // Toggle completion (not for locked milestones)
    if (status !== 'locked') {
      const checkBtn = el.querySelector('.milestone-check');
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleMilestone(ms.id, el, checkBtn);
      });

      // Click on card to expand / mark active
      el.addEventListener('click', () => {
        if (!el.classList.contains('locked')) {
          el.classList.toggle('active');
        }
      });
    }

    return el;
  },

  _toggleMilestone(id, cardEl, checkBtn) {
    const wasCompleted = AppState.completedMilestones.has(id);

    if (wasCompleted) {
      AppState.completedMilestones.delete(id);
      cardEl.classList.remove('completed');
      cardEl.querySelector('.milestone-node').style.cssText = '';
      checkBtn.textContent = '';
      checkBtn.title = 'Đánh dấu hoàn thành';
    } else {
      AppState.completedMilestones.add(id);
      cardEl.classList.remove('active', 'locked');
      cardEl.classList.add('completed');
      checkBtn.textContent = '✓';
      checkBtn.title = 'Đã hoàn thành';
      Toast.success('Hoàn thành!', `Bạn đã hoàn thành: ${cardEl.querySelector('.milestone-title').textContent}`);
    }
  },

  exportAsText() {
    const roadmap = AppState.results.roadmap || DEFAULT_ROADMAP;
    let text = `# ${roadmap.title}\n`;
    text += `${roadmap.subtitle}\n\n`;
    text += `Người học: ${AppState.userData.goal_why || 'N/A'}\n`;
    text += `Thời gian học: ${AppState.userData.goal_time || 'N/A'} / tuần\n`;
    text += `Điểm quiz: ${AppState.results.score}/10 | Level: ${AppState.results.level}\n\n`;
    text += `${'='.repeat(60)}\n\n`;

    (roadmap.phases || []).forEach((phase, pi) => {
      text += `## Giai đoạn ${phase.number || pi + 1}: ${phase.title}\n`;
      text += `⏱ Thời gian: ${phase.duration}\n\n`;
      (phase.milestones || []).forEach((ms, mi) => {
        const done = AppState.completedMilestones.has(ms.id) ? '[✓]' : '[ ]';
        text += `  ${done} ${ms.icon} ${ms.title}\n`;
        text += `     ${ms.desc}\n`;
        text += `     Tags: ${(ms.tags || []).join(', ')} | ${ms.time}\n\n`;
      });
    });

    text += `\n---\nXuất lúc: ${new Date().toLocaleString('vi-VN')}\nAI Learning Path Personalizer | VinUni`;

    // Download
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'lo-trinh-hoc-ai.txt';
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Đã xuất!', 'Lộ trình đã được tải về máy của bạn.');
  },
};

/* ─── CHAT UI ────────────────────────────────────────────────── */
const ChatUI = {
  messagesEl:  null,
  inputEl:     null,
  sendBtn:     null,
  charCount:   null,
  rlLabel:     null,
  rlFill:      null,
  rlTimer:     null,
  rlCountdown: null,

  init() {
    this.messagesEl  = $('chat-messages');
    this.inputEl     = $('chat-input');
    this.sendBtn     = $('btn-send');
    this.charCount   = $('char-count');
    this.rlLabel     = $('rate-limit-label');
    this.rlFill      = $('rate-limit-fill');
    this.rlTimer     = $('rate-limit-timer');
    this.rlCountdown = $('rl-countdown');

    // Welcome message
    this._addWelcomeMessage();

    // Event listeners
    this.inputEl.addEventListener('input', () => this._onInputChange());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // Auto-resize textarea
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 120) + 'px';
    });
  },

  _onInputChange() {
    const len = this.inputEl.value.length;
    this.charCount.textContent = `${len}/500`;
    this.charCount.classList.toggle('near-limit', len > 400 && len <= 490);
    this.charCount.classList.toggle('at-limit',   len > 490);
  },

  _addWelcomeMessage() {
    const score = AppState.results.score;
    const level = AppState.results.level;
    const name  = AppState.userData.goal_job
      ? ` (${AppState.userData.goal_job})`
      : '';

    const welcome = `Chào mừng bạn${name}! 🎉

Tôi đã phân tích kết quả quiz của bạn:
• **Điểm số**: ${score}/10 — *${level}*
• **Mục tiêu**: ${AppState.userData.goal_why || 'Học AI'}
• **Thời gian học**: ${AppState.userData.goal_time || 'N/A'}/tuần

Lộ trình học của bạn đã được tạo trong tab **Lộ trình học**. Hãy hỏi tôi bất cứ điều gì về lộ trình, tài nguyên học tập, hoặc các chủ đề AI bạn quan tâm! 🚀`;

    this._appendMessage('ai', welcome);
  },

  _appendMessage(role, content, skipState = false) {
    if (!this.messagesEl) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const isUser = (role === 'user');
    const avatar = isUser ? '👤' : '🤖';

    const el = document.createElement('div');
    el.className = `msg ${role}`;

    // Convert **bold** and *italic* markdown
    const formatted = this._formatContent(content);

    el.innerHTML = `
      <div class="msg-avatar" aria-hidden="true">${avatar}</div>
      <div>
        <div class="msg-bubble">${formatted}</div>
        <div class="msg-time">${now}</div>
      </div>
    `;

    this.messagesEl.appendChild(el);
    this.scrollToBottom();

    // Save to history
    if (!skipState) {
      AppState.chat.history.push({ role, content, time: new Date() });
    }

    return el;
  },

  _formatContent(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px">$1</code>')
      .replace(/\n/g, '<br>');
  },

  _showTyping() {
    const el = document.createElement('div');
    el.className = 'msg ai';
    el.id = 'typing-indicator';
    el.innerHTML = `
      <div class="msg-avatar" aria-hidden="true">🤖</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
    return el;
  },

  _removeTyping() {
    const el = $('typing-indicator');
    if (el) el.remove();
  },

  scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  },

  _updateRateLimit() {
    const rl = AppState.chat.rateLimit;
    const pct = (rl.remaining / rl.max) * 100;

    if (this.rlLabel) {
      this.rlLabel.textContent = `${rl.remaining} tin nhắn còn lại`;
    }
    if (this.rlFill) {
      this.rlFill.style.width = `${pct}%`;
      // Color shifts: green → yellow → red
      const hue = (pct / 100) * 120;
      this.rlFill.style.background = `hsl(${hue}, 80%, 55%)`;
    }
  },

  _startRateLimitCountdown() {
    const rl = AppState.chat.rateLimit;
    rl.resetAt = Date.now() + 60000; // 60s window

    if (this.rlTimer) this.rlTimer.classList.remove('hidden');
    if (this.rlLabel) this.rlLabel.textContent = 'Giới hạn đạt';

    rl.countdown = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
      if (this.rlCountdown) this.rlCountdown.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(rl.countdown);
        rl.remaining = rl.max;
        rl.resetAt   = null;
        if (this.rlTimer) this.rlTimer.classList.add('hidden');
        this._updateRateLimit();
        this.sendBtn.disabled  = false;
        this.inputEl.disabled  = false;
        Toast.info('Có thể gửi tiếp!', 'Giới hạn tin nhắn đã được làm mới.');
      }
    }, 1000);
  },

  async sendMessage() {
    const raw = this.inputEl.value.trim();
    if (!raw) return;

    const rl = AppState.chat.rateLimit;

    // Rate limit check
    if (rl.remaining <= 0) {
      Toast.warning('Đã đạt giới hạn', 'Bạn chỉ có thể gửi 5 tin nhắn/phút. Vui lòng chờ.');
      return;
    }

    if (AppState.chat.isLoading) return;

    // Sanitize
    const content = sanitizeInput(raw);
    if (!content) return;

    // Clear input
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';
    this._onInputChange();

    // Append user message
    this._appendMessage('user', content);

    // Decrement rate limit
    rl.remaining -= 1;
    this._updateRateLimit();

    if (rl.remaining <= 0) {
      this.sendBtn.disabled = true;
      this.inputEl.disabled = true;
      this._startRateLimitCountdown();
    }

    // Show typing indicator
    AppState.chat.isLoading = true;
    this.sendBtn.disabled   = true;
    const typingEl = this._showTyping();

    try {
      const response = await fetch(ENDPOINTS.chat, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:    content,
          history:    AppState.chat.history.slice(-10).map(h => ({ role: h.role, content: h.content })),
          user_data:  AppState.userData,
          quiz_score: AppState.results.score,
          level:      AppState.results.level,
          roadmap:    AppState.results.roadmap ? AppState.results.roadmap.title : null,
          session_id: AppState.results.sessionId,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this._removeTyping();
      this._appendMessage('ai', data.message || 'Xin lỗi, tôi không thể trả lời lúc này.');

      // Update cost
      if (data.usage) {
        CostDisplay.update(data.usage.total_tokens || 0, data.usage.cost_usd || 0);
      }

    } catch (err) {
      console.warn('[Chat API] Error:', err.message);
      this._removeTyping();

      // Fallback response
      const fallbackMsg = this._generateFallbackResponse(content);
      this._appendMessage('ai', fallbackMsg);

      Toast.warning('Chế độ offline', 'Không kết nối được API. Đang dùng phản hồi cục bộ.');
    } finally {
      AppState.chat.isLoading = false;
      // Re-enable send if rate limit allows
      if (rl.remaining > 0) {
        this.sendBtn.disabled = false;
        this.inputEl.disabled = false;
      }
    }
  },

  /**
   * Fallback AI response when API is unavailable.
   * Keyword-based simple response generator (Vietnamese).
   */
  _generateFallbackResponse(userMsg) {
    const msg = userMsg.toLowerCase();

    if (msg.includes('neural') || msg.includes('deep learning') || msg.includes('dl')) {
      return `Deep Learning là tập con của Machine Learning sử dụng nhiều lớp mạng nơ-ron. Trong lộ trình của bạn, phần này nằm ở **Giai đoạn 3**.

Tài nguyên gợi ý:
• 📖 "Deep Learning" - Goodfellow et al. (miễn phí online)
• 🎥 fast.ai - Practical Deep Learning for Coders
• 🔗 PyTorch hoặc TensorFlow 2.x`;
    }

    if (msg.includes('python') || msg.includes('lập trình')) {
      return `Để học Python cho AI/ML, bạn nên bắt đầu với:

1. **Python cơ bản**: Variables, loops, functions, OOP
2. **NumPy**: Tính toán ma trận hiệu quả
3. **Pandas**: Xử lý dữ liệu dạng bảng
4. **Matplotlib/Seaborn**: Trực quan hóa dữ liệu

Tài nguyên: Kaggle Learn (miễn phí), CS50P của Harvard`;
    }

    if (msg.includes('bao lâu') || msg.includes('thời gian') || msg.includes('how long')) {
      const time = AppState.userData.goal_time || '4-7 giờ';
      return `Với lịch học **${time}/tuần**, dự kiến bạn cần khoảng:

• Giai đoạn 1 (Nền tảng): 4–6 tuần
• Giai đoạn 2 (ML cơ bản): 6–8 tuần  
• Giai đoạn 3 (Deep Learning): 8–10 tuần
• Giai đoạn 4 (Dự án thực tế): 4–6 tuần

**Tổng cộng: ~6–9 tháng** nếu học đều đặn.`;
    }

    if (msg.includes('tài liệu') || msg.includes('sách') || msg.includes('course') || msg.includes('khóa')) {
      return `📚 **Tài nguyên học AI được khuyến nghị:**

**Miễn phí:**
• Coursera - Machine Learning Specialization (Andrew Ng)
• fast.ai - Practical Deep Learning
• Google ML Crash Course
• Kaggle Learn

**Sách:**
• "Hands-On Machine Learning" - Aurélien Géron
• "Pattern Recognition and Machine Learning" - Bishop

**Cộng đồng Việt:**
• Forum AIViVN (aivietnam.ai)
• GDSC Vietnam các trường đại học`;
    }

    if (msg.includes('roadmap') || msg.includes('lộ trình') || msg.includes('bước')) {
      return `Lộ trình học AI của bạn đã được tạo trong tab **Lộ trình học** 🗺️

Lộ trình gồm 4 giai đoạn chính, từ nền tảng toán học đến triển khai dự án thực tế. Bạn có thể:
• Click vào các milestone để xem chi tiết
• Đánh dấu hoàn thành các bước đã học
• Xuất lộ trình ra file text

Bạn muốn tìm hiểu thêm về giai đoạn nào?`;
    }

    // Default response
    return `Cảm ơn câu hỏi của bạn! 🤔

Hiện tại tôi đang ở chế độ offline nên không thể tra cứu thông tin chi tiết. Tuy nhiên, dựa trên lộ trình học của bạn (Level: **${AppState.results.level}**), tôi khuyến nghị:

• Tập trung vào các milestone đang **active** trong lộ trình
• Thực hành coding mỗi ngày, dù chỉ 30 phút
• Tham gia cộng đồng AI Việt Nam để hỏi đáp

Hãy thử hỏi lại khi kết nối được API nhé! 🚀`;
  },
};

/* ─── FEEDBACK MODAL ─────────────────────────────────────────── */
const FeedbackModal = {
  init() {
    const modal = $('modal-feedback');
    const overlay = modal;

    // Open
    $('btn-feedback').addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    // Close
    $('modal-feedback-close').addEventListener('click', () => this.close());
    $('btn-feedback-cancel').addEventListener('click',  () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Stars
    const starBtns = $$('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        AppState.ui.feedbackRating = rating;

        // Update star appearances
        starBtns.forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.rating) <= rating);
        });

        $('star-label-text').textContent = STAR_LABELS[rating] || '';
        $('btn-feedback-submit').disabled = false;
      });
    });

    // Submit
    $('btn-feedback-submit').addEventListener('click', () => this.submit());
  },

  close() {
    $('modal-feedback').classList.add('hidden');
    document.body.style.overflow = '';
  },

  async submit() {
    const rating  = AppState.ui.feedbackRating;
    const comment = sanitizeInput($('feedback-comment').value);

    if (!rating) {
      Toast.warning('Chưa chọn sao', 'Vui lòng chọn số sao trước khi gửi.');
      return;
    }

    const payload = {
      session_id:  AppState.results.sessionId,
      rating,
      comment,
      quiz_score:  AppState.results.score,
      confidence:  AppState.results.confidence,
      user_data:   AppState.userData,
      roadmap_title: AppState.results.roadmap?.title || 'Default',
    };

    try {
      const response = await fetch(ENDPOINTS.feedback, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      Toast.success('Cảm ơn!', `Đánh giá ${rating}⭐ của bạn đã được ghi nhận. Phản hồi này giúp AI học tốt hơn!`);
      this.close();

    } catch (err) {
      console.warn('[Feedback API]', err.message);
      Toast.success('Cảm ơn!', `Đã ghi nhận đánh giá ${rating}⭐ của bạn. (Sẽ đồng bộ khi có kết nối)`);
      this.close();
    }
  },
};

/* ─── SUPPORT MODAL ──────────────────────────────────────────── */
const SupportModal = {
  init() {
    const modal = $('modal-support');

    // Open
    $('btn-support').addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    // Close
    ['modal-support-close', 'btn-support-close-main'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('click', () => this.close());
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Reset session
    $('btn-reset-session').addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xoá toàn bộ dữ liệu và bắt đầu lại?')) {
        this._resetSession();
      }
    });

    // Rollback to default roadmap
    $('btn-rollback').addEventListener('click', () => {
      AppState.results.roadmap   = DEFAULT_ROADMAP;
      AppState.results.isFallback = true;
      AppState.results.isFailure  = false;
      $('failure-alert').classList.add('hidden');
      $('fallback-alert').classList.remove('hidden');
      Roadmap.render(DEFAULT_ROADMAP);
      Toast.info('Đã khôi phục', 'Lộ trình mặc định đã được hiển thị.');
      this.close();
    });
  },

  close() {
    $('modal-support').classList.add('hidden');
    document.body.style.overflow = '';
  },

  _resetSession() {
    // Reset state
    AppState.userData          = { goal_why: '', goal_time: '', goal_job: '', goal_bg: '' };
    AppState.quiz              = { currentIndex: 0, answers: new Array(10).fill(null), startTime: null, endTime: null, timerInterval: null };
    AppState.results           = { score: 0, confidence: 0, level: '', roadmap: null, isFallback: false, isFailure: false, sessionId: null };
    AppState.chat              = { history: [], rateLimit: { remaining: 5, max: 5, resetAt: null, countdown: null }, totalTokens: 0, totalCostUSD: 0, isLoading: false };
    AppState.completedMilestones = new Set();
    AppState.ui                = { currentTab: 'chat', currentStep: 1, feedbackRating: 0 };

    // Reset cost display
    if ($('cost-label')) $('cost-label').textContent = '0 tokens · $0.000';

    // Show form, hide results
    $('form-section').classList.remove('hidden');
    $('results-section').classList.add('hidden');
    $('failure-alert').classList.add('hidden');
    $('fallback-alert').classList.add('hidden');

    // Reset step form
    $('goal-form').reset();
    StepForm.goToStep(1);

    // Clear chat messages
    if ($('chat-messages')) $('chat-messages').innerHTML = '';

    this.close();
    Toast.info('Đặt lại thành công', 'Phiên làm việc đã được xoá. Bắt đầu lại từ đầu!');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

/* ─── HERO CTA ───────────────────────────────────────────────── */
function initHeroCTA() {
  $('hero-start-btn').addEventListener('click', () => {
    const formSection = $('form-section');
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      $('goal-why').focus();
    }, 600);
  });
}

/* ─── ANIMATION OBSERVERS ────────────────────────────────────── */
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.form-card, .roadmap-phase, .milestone-card').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ─── KEYBOARD SHORTCUTS ─────────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      $('modal-feedback').classList.add('hidden');
      $('modal-support').classList.add('hidden');
      document.body.style.overflow = '';
    }

    // Alt+1 = Chat tab, Alt+2 = Roadmap tab
    if (e.altKey && e.key === '1') Tabs.switchTo('chat');
    if (e.altKey && e.key === '2') Tabs.switchTo('roadmap');
  });
}

/* ─── ACCESSIBILITY: Focus trap in modals ────────────────────── */
function trapFocus(modalEl) {
  const focusable = modalEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  modalEl.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}

/* ─── RESULTS SECTION: Hide initially ───────────────────────── */
function ensureResultsHidden() {
  $('results-section').classList.add('hidden');
}

/* ─── MAIN INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 AI Learning Path Personalizer — Initializing...');
  console.log('   VinUni Batch 02 | Day 05');

  // Core systems
  Toast.init();
  CostDisplay.init();

  // UI components
  StepForm.init();
  Quiz.init();
  Tabs.init();
  Roadmap.init();
  FeedbackModal.init();
  SupportModal.init();
  initHeroCTA();
  initKeyboardShortcuts();

  // Ensure results are hidden on load
  ensureResultsHidden();

  // Trap focus in modals
  trapFocus($('modal-feedback'));
  trapFocus($('modal-support'));

  // Rate limit UI init
  ChatUI._updateRateLimit = function() {
    const rl = AppState.chat.rateLimit;
    const pct = (rl.remaining / rl.max) * 100;
    const rlLabel = $('rate-limit-label');
    const rlFill  = $('rate-limit-fill');
    if (rlLabel) rlLabel.textContent = `${rl.remaining} tin nhắn còn lại`;
    if (rlFill) {
      rlFill.style.width = `${pct}%`;
      const hue = (pct / 100) * 120;
      rlFill.style.background = `hsl(${hue}, 80%, 55%)`;
    }
  };

  console.log('✅ All systems initialized.');
  Toast.info('Chào mừng!', 'Bắt đầu bằng cách điền thông tin mục tiêu học tập của bạn.');
});

/* ─── EXPOSE FOR DEBUGGING (dev only) ───────────────────────── */
if (typeof window !== 'undefined') {
  window.__APP__ = { AppState, Quiz, Roadmap, ChatUI, Toast, DEFAULT_ROADMAP, QUIZ_QUESTIONS };
}
