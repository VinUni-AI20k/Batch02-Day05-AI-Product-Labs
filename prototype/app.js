const state = {
  month: 5,
  year: 2026,
  today: new Date(2026, 5, 15, 9, 32),
  monthlyBudget: 10000000,
  transactions: [
    tx("Cà phê sáng", 90000, "Food", 1),
    tx("Siêu thị", 420000, "Shopping", 1),
    tx("Ăn trưa", 160000, "Food", 2),
    tx("Taxi", 220000, "Transport", 2),
    tx("Ăn tối", 240000, "Food", 3),
    tx("Hóa đơn điện", 600000, "Bills", 3),
    tx("Mua đồ dùng", 470000, "Shopping", 4),
    tx("Ăn uống cuối tuần", 980000, "Food", 4),
    tx("Sách và học tập", 480000, "Education", 4),
    tx("Vé xem phim", 350000, "Entertainment", 4),
    tx("Chuyển khoản gia đình", 1190000, "Family", 4)
  ]
};

const categories = {
  Food: { label: "Ăn uống", icon: "🍲", colorClass: "", limit: 2000000 },
  Bills: { label: "Hóa đơn", icon: "▤", colorClass: "teal", limit: 600000 },
  Transport: { label: "Di chuyển", icon: "⇄", colorClass: "purple", limit: 1200000 },
  Shopping: { label: "Mua sắm", icon: "◈", colorClass: "purple", limit: 2000000 },
  Education: { label: "Học tập", icon: "◌", colorClass: "teal", limit: 1500000 },
  Entertainment: { label: "Giải trí", icon: "♪", colorClass: "", limit: 1200000 },
  Family: { label: "Gia đình", icon: "⌂", colorClass: "teal", limit: 1800000 },
  Debt: { label: "Trả nợ", icon: "✓", colorClass: "purple", limit: 1500000 },
  Other: { label: "Khác", icon: "•", colorClass: "", limit: 1000000 }
};

const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const tabs = document.querySelectorAll(".tab");
const screens = document.querySelectorAll(".app-screen");

function tx(label, amount, category, day, exceptional = false) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    amount,
    category,
    exceptional,
    date: new Date(2026, 5, day, 9, 32)
  };
}

function money(value) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function shortMoney(value) {
  return `${Math.round(value / 1000).toLocaleString("vi-VN")}k`;
}

function daysInMonth() {
  return new Date(state.year, state.month + 1, 0).getDate();
}

function daysElapsed() {
  return state.today.getDate();
}

function daysLeft() {
  return Math.max(daysInMonth() - daysElapsed(), 0);
}

function budgetSnapshot() {
  const spent = state.transactions.reduce((sum, item) => sum + item.amount, 0);
  const forecastBase = state.transactions
    .filter((item) => !item.exceptional)
    .reduce((sum, item) => sum + item.amount, 0);
  const dailyRate = forecastBase / daysElapsed();
  const forecast = dailyRate * daysInMonth();
  const remaining = state.monthlyBudget - spent;
  const recommendedDaily = Math.max(state.monthlyBudget - spent, 0) / Math.max(daysLeft(), 1);
  const overAmount = Math.max(forecast - state.monthlyBudget, 0);
  const risk = spent > state.monthlyBudget ? "danger" : forecast > state.monthlyBudget ? "warning" : "safe";

  return { spent, forecastBase, dailyRate, forecast, remaining, recommendedDaily, overAmount, risk };
}

function categoryLabel(category) {
  return categories[category]?.label || categories.Other.label;
}

function parseAmount(text) {
  const normalized = text.toLowerCase().replace(",", ".");
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!numberMatch) return null;
  const value = Number(numberMatch[1]);
  if (normalized.includes("triệu") || normalized.includes("trieu")) return value * 1000000;
  if (normalized.includes("k") || normalized.includes("nghìn") || normalized.includes("nghin")) return value * 1000;
  return value;
}

function parseCategory(text) {
  const lower = text.toLowerCase();
  if (/(ăn|an|cơm|com|tối|toi|trưa|trua|food|uống|uong)/.test(lower)) return "Food";
  if (/(hóa đơn|hoa don|điện|dien|nước|nuoc|bill)/.test(lower)) return "Bills";
  if (/(taxi|xe|di chuyển|di chuyen|bus|grab)/.test(lower)) return "Transport";
  if (/(học|hoc|học phí|hoc phi|sách|sach)/.test(lower)) return "Education";
  if (/(nợ|no|vay)/.test(lower)) return "Debt";
  if (/(mua|shopping|siêu thị|sieu thi)/.test(lower)) return "Shopping";
  return "Other";
}

function parseLabel(text, category) {
  const lower = text.toLowerCase();
  if (lower.includes("học phí") || lower.includes("hoc phi")) return "Học phí";
  if (lower.includes("ăn tối") || lower.includes("an toi")) return "Ăn tối";
  if (lower.includes("ăn trưa") || lower.includes("an trua")) return "Ăn trưa";
  return categoryLabel(category);
}

function addUserMessage(text) {
  const node = document.createElement("article");
  node.className = "message user";
  node.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  chatLog.append(node);
  scrollChat();
}

function addMoniMessage(html) {
  const node = document.createElement("article");
  node.className = "message moni";
  node.innerHTML = html;
  chatLog.append(node);
  scrollChat();
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function scrollChat() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addTransactionFromText(text) {
  const amount = parseAmount(text);
  const category = parseCategory(text);
  const label = parseLabel(text, category);

  if (!amount) {
    addMoniMessage(`<p>Mình chưa đọc được số tiền. Bạn gửi lại theo mẫu như <strong>thêm ăn tối 80k</strong> nhé.</p>`);
    return;
  }

  const item = tx(label, amount, category, state.today.getDate());
  state.transactions.unshift(item);
  renderAll();

  const abnormal = amount >= 2500000 || /học phí|hoc phi|trả nợ|tra no|nợ|no/.test(text.toLowerCase());
  addMoniMessage(`
    <p>Đã thêm khoản <strong>${label.toLowerCase()} ${money(amount)}</strong> vào danh mục <strong>${categoryLabel(category)}</strong>.</p>
    ${transactionCard(item)}
  `);

  if (abnormal) {
    addConfirmationCard(item);
  } else {
    addBudgetAdvice();
  }
}

function updateBudgetFromText(text) {
  const amount = parseAmount(text);
  if (!amount) {
    addMoniMessage(`<p>Mình chưa đọc được ngân sách mới. Bạn thử gửi: <strong>Tăng ngân sách tháng này lên 12 triệu</strong>.</p>`);
    return;
  }
  state.monthlyBudget = amount;
  renderAll();
  addMoniMessage(`
    <p>Đã cập nhật ngân sách tháng này thành <strong>${money(amount)}</strong>.</p>
    ${insightCard()}
  `);
}

function addBudgetAdvice() {
  const snap = budgetSnapshot();
  const safeText = `
    <p>Bạn đang trong mức an toàn.</p>
    <p>Bạn có thể chi khoảng <strong>${money(snap.recommendedDaily)}/ngày</strong> trong phần còn lại của tháng.</p>
  `;
  const warningText = `
    <p>Bạn có nguy cơ vượt ngân sách khoảng <strong>${money(snap.overAmount)}</strong>.</p>
    <p>Bạn chỉ nên chi khoảng <strong>${money(snap.recommendedDaily)}/ngày</strong> trong ${daysLeft()} ngày còn lại.</p>
  `;
  const dangerText = `
    <p>Bạn đã vượt ngân sách tháng này.</p>
    <p>Dự báo hiện tại là <strong>${money(snap.forecast)}</strong>. Moni khuyên bạn rà soát giao dịch bất thường trước khi tăng ngân sách.</p>
  `;
  const message = snap.risk === "safe" ? safeText : snap.risk === "warning" ? warningText : dangerText;
  addMoniMessage(`${message}${insightCard()}`);
}

function insightCard() {
  const snap = budgetSnapshot();
  const label = snap.risk === "safe" ? "An toàn" : snap.risk === "warning" ? "Cảnh báo" : "Đã vượt";
  const title = snap.risk === "safe" ? "Ngân sách khỏe" : snap.risk === "warning" ? "Nguy cơ vượt ngân sách" : "Vượt ngân sách";
  const actions = snap.risk === "safe"
    ? `<button type="button" data-nav="budgetScreen">Xem ngân sách</button>`
    : snap.risk === "warning"
      ? `<button type="button" data-nav="budgetScreen">Xem chi tiết</button><button type="button" data-prompt="Tăng ngân sách tháng này lên 12 triệu">Điều chỉnh ngân sách</button><button type="button" data-review="true">Rà soát giao dịch</button>`
      : `<button type="button" data-review="true">Rà soát giao dịch bất thường</button><button type="button" data-prompt="Tăng ngân sách tháng này lên 12 triệu">Tăng ngân sách</button><button type="button" data-nav="budgetScreen">Xem nhóm chi cao nhất</button>`;

  return `
    <section class="insight-card ${snap.risk === "safe" ? "" : snap.risk}">
      <div class="card-title">
        <strong>${title}</strong>
        <span class="status-chip ${snap.risk}">${label}</span>
      </div>
      <div class="budget-stats">
        <div><span>Budget</span><strong>${money(state.monthlyBudget)}</strong></div>
        <div><span>Spent</span><strong>${money(snap.spent)}</strong></div>
        <div><span>Remaining</span><strong>${money(snap.remaining)}</strong></div>
        <div><span>Forecast</span><strong>${money(snap.forecast)}</strong></div>
      </div>
      <div class="actions">${actions}</div>
    </section>
  `;
}

function transactionCard(item) {
  return `
    <section class="transaction-card">
      <h3>${escapeHtml(item.label)}</h3>
      <div class="transaction-row">
        <div>
          <p>Đã thêm • 09:32 - 04/06/2026</p>
          <span class="category-pill">${categories[item.category]?.icon || "•"} ${categoryLabel(item.category)}</span>
        </div>
        <strong class="amount-negative">-${money(item.amount)}</strong>
      </div>
    </section>
  `;
}

function addConfirmationCard(item) {
  addMoniMessage(`
    <section class="confirm-card">
      <h3>Khoản ${escapeHtml(item.label.toLowerCase())} ${money(item.amount)} có phải khoản chi một lần không?</h3>
      <div class="confirm-options">
        <button type="button" data-classify="${item.id}" data-kind="normal">Chi tiêu bình thường</button>
        <button type="button" data-classify="${item.id}" data-kind="exception">Khoản chi một lần</button>
        <button type="button" data-classify="${item.id}" data-kind="debt">Trả nợ</button>
      </div>
    </section>
  `);
}

function markTransaction(id, kind) {
  const item = state.transactions.find((entry) => entry.id === id);
  if (!item) return;
  const before = budgetSnapshot().forecast;
  if (kind === "normal") {
    renderAll();
    addMoniMessage(`
      <p>Đã giữ khoản <strong>${escapeHtml(item.label.toLowerCase())}</strong> là chi tiêu bình thường.</p>
      <p>Moni sẽ tiếp tục dùng khoản này trong mô hình dự báo chi tiêu thường xuyên.</p>
      ${insightCard()}
    `);
    return;
  }
  if (kind === "exception" || kind === "debt") {
    item.exceptional = true;
    if (kind === "debt") item.category = "Debt";
  }
  renderAll();
  const after = budgetSnapshot().forecast;
  addMoniMessage(`
    <p>Khoản <strong>${escapeHtml(item.label.toLowerCase())}</strong> đã được loại khỏi mô hình dự báo chi tiêu thường xuyên.</p>
    <p>Dự báo giảm từ <strong>${money(before)}</strong> xuống <strong>${money(after)}</strong> vì Moni chỉ dùng các khoản chi lặp lại để tính tốc độ chi tiêu.</p>
    ${insightCard()}
  `);
}

function handleMessage(text) {
  addUserMessage(text);
  const lower = text.toLowerCase();
  if (/(tăng|tang|đổi|doi|cập nhật|cap nhat|ngân sách|ngan sach)/.test(lower) && parseAmount(lower) && !/(thêm|them|khoản|khoan|chi)/.test(lower)) {
    updateBudgetFromText(text);
    return;
  }
  if (/(thêm|them|ghi|add|khoản|khoan|chi)/.test(lower)) {
    addTransactionFromText(text);
    return;
  }
  if (/(còn lại|con lai|dự báo|du bao|ngân sách|ngan sach)/.test(lower)) {
    addBudgetAdvice();
    return;
  }
  addMoniMessage(`<p>Mình có thể thêm khoản chi, cập nhật ngân sách tháng này, dự báo cuối tháng hoặc rà soát giao dịch bất thường cho bạn.</p>`);
}

function renderAll() {
  renderDashboard();
  renderCategories();
  renderTransactions();
  renderChart();
}

function renderDashboard() {
  const snap = budgetSnapshot();
  const progress = Math.min((snap.spent / state.monthlyBudget) * 100, 100);
  const riskLabel = snap.risk === "safe" ? "An toàn" : snap.risk === "warning" ? "Cảnh báo" : "Đã vượt";
  const progressColor = snap.risk === "safe" ? "var(--green)" : snap.risk === "warning" ? "var(--yellow)" : "var(--red)";

  document.querySelector("#daysLeftLabel").textContent = `Còn ${daysLeft()} ngày`;
  document.querySelector("#dashboardBudget").textContent = money(state.monthlyBudget);
  document.querySelector("#dashboardSpent").textContent = money(snap.spent);
  document.querySelector("#dashboardRemaining").textContent = money(snap.remaining);
  document.querySelector("#dashboardForecast").textContent = money(snap.forecast);
  document.querySelector("#dashboardDaily").textContent = money(snap.recommendedDaily);
  document.querySelector("#dashboardRisk").textContent = riskLabel;
  document.querySelector("#dashboardRisk").className = `status-chip ${snap.risk}`;
  document.querySelector("#budgetProgress").style.width = `${progress}%`;
  document.querySelector("#budgetProgress").style.background = progressColor;
}

function categoryTotals() {
  return state.transactions.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + item.amount;
    return map;
  }, {});
}

function renderCategories() {
  const totals = categoryTotals();
  const items = Object.entries(categories)
    .filter(([key]) => totals[key])
    .sort((a, b) => a[1].label.localeCompare(b[1].label, "vi"));
  document.querySelector("#categoryList").innerHTML = items.map(([key, meta]) => {
    const total = totals[key];
    const remaining = meta.limit - total;
    const status = remaining < 0 ? "danger" : total / meta.limit > 0.8 ? "warning" : "safe";
    const label = remaining < 0 ? `Vượt ${money(Math.abs(remaining))}` : `Còn lại ${money(remaining)}`;
    const chip = remaining < 0 ? "Đã vượt" : status === "warning" ? "Gần hết" : "Ổn định";
    return `
      <article class="category-card">
        <span class="cat-icon ${meta.colorClass}">${meta.icon}</span>
        <div>
          <h3>${meta.label}</h3>
          <p>Hạn mức: ${money(meta.limit)}</p>
          <strong class="${status === "danger" ? "danger-text" : ""}">${label}</strong>
        </div>
        <span class="status-chip ${status} cat-state">${chip}</span>
      </article>
    `;
  }).join("");
}

function renderTransactions() {
  document.querySelector("#transactionList").innerHTML = state.transactions.slice(0, 5).map((item) => `
    <article class="transaction-mini">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <span>${categoryLabel(item.category)}${item.exceptional ? " • ngoại lệ" : ""}</span>
      </div>
      <strong>-${money(item.amount)}</strong>
    </article>
  `).join("");
}

function renderChart() {
  const totals = categoryTotals();
  const max = Math.max(...Object.values(totals), 1);
  document.querySelector("#categoryChart").innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => `
      <div class="chart-row">
        <strong>${categoryLabel(key)}</strong>
        <span class="chart-track"><span style="width: ${(value / max) * 100}%"></span></span>
        <span>${shortMoney(value)}</span>
      </div>
    `).join("");
}

function switchScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === id));
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  handleMessage(text);
});

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav]");
  if (nav) switchScreen(nav.dataset.nav);

  const promptButton = event.target.closest("[data-prompt]");
  if (promptButton) {
    chatInput.value = promptButton.dataset.prompt;
    chatInput.focus();
  }

  const review = event.target.closest("[data-review]");
  if (review) switchScreen("budgetScreen");

  const classify = event.target.closest("[data-classify]");
  if (classify) markTransaction(classify.dataset.classify, classify.dataset.kind);
});

tabs.forEach((tab) => tab.addEventListener("click", () => switchScreen(tab.dataset.target)));
document.querySelector("#backToChat").addEventListener("click", () => switchScreen("chatScreen"));
document.querySelector("#reviewTransactions").addEventListener("click", () => switchScreen("chatScreen"));
document.querySelector("#seedWarning").addEventListener("click", () => {
  switchScreen("chatScreen");
  chatInput.value = "Thêm học phí 3 triệu";
  chatInput.focus();
});

function seedChat() {
  chatLog.innerHTML = `<div class="date-stamp">15/06/2026, 09:32</div>`;
  addUserMessage("Thêm khoản ăn tối 80k");
  addTransactionFromText("Thêm khoản ăn tối 80k");
  addUserMessage("Tăng ngân sách tháng này lên 12 triệu");
  updateBudgetFromText("Tăng ngân sách tháng này lên 12 triệu");
}

renderAll();
seedChat();
