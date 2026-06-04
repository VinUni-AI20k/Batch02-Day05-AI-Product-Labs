# Workshop — Mổ App AI Thật

**Học viên:** Phung Văn Thạch — 2A202601004  
**Thời gian thực hiện:** 03/06/2026 (~14:54–15:02)  
**Sản phẩm đã chọn:** Vietnam Airlines — NEO (Trợ lý ảo)  
**Kênh dùng thử:** Website VNA — widget chat FPT AI LiveChat  
**Evidence folder:** `Evidence/` (11 screenshot self-use)

---

## 1. Chọn một sản phẩm để dùng thử

| Sản phẩm | AI feature | Cách truy cập |
|---|---|---|
| **Vietnam Airlines — NEO** ✓ | Chatbot tra cứu vé/chuyến bay, hành lý, gợi ý hành trình | Web VNA / Facebook / Zalo |
| MoMo — Moni | Trợ thủ tài chính, phân tích chi tiêu | App MoMo |
| V-App — V-AI | Trợ lý voice/text theo ngữ cảnh | App V-App |

**Lý do chọn NEO:** Dùng thử được ngay trên web; marketing hứa tra cứu vé/chuyến bay và chuyển tư vấn viên khi bot không giải quyết được — dễ kiểm chứng promise vs reality.

---

## 2. Dùng thử: promise vs reality

### Product hứa gì?

Theo trang NEO (`Screenshot 2026-06-03 at 15.01.57.png`):

- "Hãy hỏi câu hỏi ngắn, rõ ràng để NEO hiểu nội dung cần hỗ trợ."
- "Hành khách có thể tra cứu thông tin từ các mục nội dung có sẵn."
- "Với câu hỏi NEO chưa thể giải đáp, hành khách sẽ được **chuyển hướng gặp tư vấn viên**."
- Hero page hứa giải đáp 24/7 về **hành trình, mua vé, thanh toán**; có mục **"Tìm kiếm giá vé"**.

### User nào được hứa sẽ được giúp?

Hành khách đang lên kế hoạch chuyến bay — cụ thể trong session này: người muốn bay **Hà Nội → Đà Lạt**, tra cứu lịch bay, tìm giá rẻ, và hỏi thêm gợi ý du lịch.

### Kỳ vọng AI làm được task nào?

| # | Prompt user (verbatim) | Kỳ vọng | Evidence |
|---|---|---|---|
| 1 | *(bấm "Bắt đầu")* | Vào chat nhanh, bắt đầu hỏi ngay | `14.54.40.png` |
| 2 | "thông tin vé máy bay" | Hướng dẫn tra cứu / quản lý vé | `14.54.40.png` |
| 3 | "Chuyến bay đi đà lạt từ hà nội vào 5 ngày nữa có những chuyến bay nào" | **Liệt kê chuyến bay cụ thể** | `14.54.50.png` |
| 4 | "Sắp tới tôi sẽ đi du lịch đà lạt thì nên làm gì" | Gợi ý liên quan hành trình bay | `14.55.27.png` |
| 5 | "Nên đi chuyến bay tối hay sáng và book vé như nào" | So sánh khung giờ + hướng dẫn book | `14.56.09.png` |
| 6 | "Bạn có thể gợi ý đặt vé như nào cho rẻ không" | Gợi ý giá rẻ / tìm vé | `14.57.10.png` |
| 7 | "Tôi chưa đi, tôi đang tìm giá rẻ" | Bot hiểu intent linh hoạt ngày bay | `14.57.10.png` |
| 8 | "Điểm khởi hành là hà nội, ngày 15/6" | Thu thập slot → tìm giá | `14.58.28.png` |
| 9 | "xác nhận" | NEO trả kết quả chuyến/giá | `14.58.28.png`, `14.59.08.png` |
| 10 | "bạn chọn 1 ngày nào trong tháng 6 đi" | Bot đề xuất ngày + tìm giá | `14.58.28.png`, `14.59.08.png` |
| 11 | "Có lộ trình đi chơi 2 ngày 3 đêm tại đà lạt không" | Lịch trình ngắn | `15.01.17.png` |

### Khi dùng thật, điểm gãy xuất hiện ở đâu?

#### Điểm gãy 1 — Hứa "tìm chuyến/giá vé" nhưng không trả kết quả thật

- Câu hỏi cụ thể *"HN → Đà Lạt, 5 ngày nữa có chuyến nào?"* → NEO **không liệt kê chuyến**, chỉ redirect sang Website/App + hotline `1900 1100` + email `onlinesupport@vietnamairlines.com` (`14.54.50.png`).
- Luồng slot-filling sau đó thu đủ thông tin (HAN, DLI, 15/06/2026 rồi 20/06/2026, 1 adult, economy, one-way) → user **"xác nhận"** → NEO trả: **"Rất tiếc, hệ thống gặp lỗi khi tìm kiếm chuyến bay"** — lặp lại 2 lần (`14.58.28.png`, `14.59.08.png`).

#### Điểm gãy 2 — Slot-filling loop khi user chưa chốt ngày

- User: *"Tôi chưa đi, tôi đang tìm giá rẻ"* (chưa có ngày cố định).
- NEO **lặp lại y nguyên** câu hỏi "Điểm khởi hành / Ngày đi" thay vì chuyển sang chế độ "tìm giá linh hoạt" hoặc gợi ý lịch tháng 6 (`14.57.10.png`).

#### Điểm gãy 3 — CSAT xuất hiện khi vấn đề chưa xong

- Sau câu redirect (không có danh sách chuyến), NEO hỏi đánh giá hài lòng 1–5 **trước khi** user được kết quả (`14.54.50.png`).

#### Điểm gãy 4 — Scope trôi sang travel blog

- Câu *"đi du lịch Đà Lạt nên làm gì"* → NEO trả **guide dài** (Quảng trường Lâm Viên, bánh căn, mùa khô/mùa mưa...) — hữu ích nhưng **không phải core task hàng không**, dễ tạo ấn tượng bot "biết mọi thứ" nhưng lại fail khi gọi API tìm vé (`14.55.27.png`).

#### Điểm gãy 5 — Low-confidence có chọn lọc

- **Tốt:** *"lộ trình 2 ngày 3 đêm"* → NEO thừa nhận data chỉ có 3N2Đ, không bịa (`15.01.17.png`).
- **Thiếu:** *"chuyến bay ngày cụ thể"* → redirect thay vì hỏi lại ngày chính xác hoặc show "NEO không truy cập được lịch realtime".

### Bảng evidence đầy đủ

| File | Thời điểm | Quan sát chính | Path liên quan |
|---|---|---|---|
| `Screenshot 2026-06-03 at 15.01.57.png` | Trước chat | Promise marketing: tra cứu, chuyển tư vấn viên, nút "Trải Nghiệm Ngay" | Promise |
| `Screenshot 2026-06-03 at 14.54.40.png` | ~14:54 | Onboarding "Bắt đầu" → chào hỏi; FAQ "thông tin vé máy bay" trả đủ 3 mục (PNR, hạng vé, đổi vé) | Happy |
| `Screenshot 2026-06-03 at 14.54.50.png` | ~14:54 | Hỏi lịch bay HN→DLI → redirect web/app; nút "Gặp tư vấn viên"; CSAT sớm | Failure / UX Recovery |
| `Screenshot 2026-06-03 at 14.55.27.png` | ~14:55 | Travel guide Đà Lạt dài, ngoài scope vé máy bay | Happy (misaligned) |
| `Screenshot 2026-06-03 at 14.56.09.png` | ~14:56 | Gợi ý bay sáng sớm/tối muộn + link đặt vé chính thức | Happy |
| `Screenshot 2026-06-03 at 14.57.10.png` | ~14:57 | Slot-filling DLI; user "tìm giá rẻ" → bot loop cùng câu hỏi | Low-confidence / Failure |
| `Screenshot 2026-06-03 at 14.58.28.png` | ~14:58 | Thu slot HAN 15/06 → confirm → **lỗi hệ thống**; bot tự chọn 20/06 | Failure |
| `Screenshot 2026-06-03 at 14.59.08.png` | ~14:59 | Confirm lần 2 → **lỗi hệ thống** lặp lại | Failure |
| `Screenshot 2026-06-03 at 15.01.17.png` | ~15:01 | Từ chối lịch trình 2N3Đ vì data chỉ có 3N2Đ — honest boundary | Low-confidence |
| `Screenshot 2026-06-03 at 10.29.14.png` | — | *(Không liên quan NEO — ảnh luận văn ML)* | — |
| `Figure_1.png` | — | *(Không liên quan NEO — pipeline U-Net defect detection)* | — |

---

## 3. Vẽ 4 paths

| Path | Trong session self-use này | Product hiện có / thiếu |
|---|---|---|
| **Happy** | "thông tin vé máy bay" → FAQ có cấu trúc (PNR, hạng vé, giấy tờ, hotline đổi vé). "Bay sáng hay tối + book vé" → gợi ý khung giờ + deep link website/app. | ✅ FAQ path ổn cho câu hỏi chung |
| **Low-confidence** | "2N3Đ Đà Lạt" → thừa nhận không có data. **Thiếu:** "5 ngày nữa có chuyến nào" không hỏi lại ngày cụ thể (08/06?) mà redirect luôn. "Tìm giá rẻ" không chuyển sang flexible search. | ⚠️ Một phần — honest khi hết data, nhưng không clarify intent mơ hồ |
| **Failure** | Slot đủ → confirm → **"hệ thống gặp lỗi khi tìm kiếm chuyến bay"** (2 lần). User không nhận được giá/chuyến dù đã làm đúng flow. Recovery = "thử lại sau / liên hệ trung tâm" — không có retry, không prefill sang form đặt vé. | ❌ Tool/API failure path yếu |
| **Correction** | CSAT 1–5 xuất hiện sau redirect (`14.54.50.png`) — **trước khi** user có kết quả. Không thấy nút "câu trả lời sai" trên từng message. Correction không gắn với lỗi search cụ thể. | ❌ CSAT sớm; không log failure để học |

---

## 4. Viết finding thành quyết định

### Finding 1 — Tool failure sau slot-filling hoàn chỉnh

```text
Khi user hoàn tất slot-filling (HAN → DLI, 15/06/2026, 1 adult, economy, one-way) và bấm "xác nhận",
AI/product gọi search API thất bại với message chung "hệ thống gặp lỗi",
hậu quả là user đã dành ~8 phút chat nhưng không nhận được giá/chuyến — trust sụp ngay trước bước quyết định mua vé.
Lỗi thuộc layer Data-tool + UX Recovery.
Nên sửa bằng failure path: retry 1 lần + fallback deep link đặt vé prefill (origin, dest, date, pax) + nút "Gặp tư vấn viên" kèm transcript + slots đã thu.
Evidence: 14.58.28.png, 14.59.08.png
```

### Finding 2 — Promise "tìm chuyến bay" vs redirect

```text
Khi user hỏi trực tiếp "HN → Đà Lạt, 5 ngày nữa có chuyến nào",
AI/product không trả lịch chuyến mà redirect sang Website/App,
hậu quả là user phải nhập lại thông tin đã nói trong chat — duplicate effort.
Lỗi thuộc layer Promise + Data-tool.
Nên sửa bằng requirement: hoặc (a) tích hợp realtime schedule API, hoặc (b) scope banner đầu chat "NEO không xem lịch chuyến realtime — chỉ hướng dẫn đặt vé" + one-click mở app với params.
Evidence: 14.54.50.png, 15.01.57.png
```

### Finding 3 — Slot loop khi intent "flexible price"

```text
Khi user nói "Tôi chưa đi, tôi đang tìm giá rẻ" (chưa chốt ngày),
AI/product lặp lại cùng câu hỏi slot "Ngày đi" thay vì đổi chiến lược,
hậu quả là user cảm giác bot không nghe — dù sau đó user phải tự đưa ngày.
Lỗi thuộc layer Intent + UX Recovery.
Nên sửa bằng low-confidence path: detect "flexible date" → hỏi "Quý khách linh hoạt ngày nào trong tháng 6?" hoặc offer "NEO gợi ý ngày rẻ nhất tuần tới".
Evidence: 14.57.10.png
```

### Finding 4 — CSAT trước khi resolve

```text
Khi user chưa nhận được danh sách chuyến (chỉ bị redirect),
AI/product vẫn hỏi đánh giá hài lòng 1–5,
hậu quả là CSAT metric nhiễu — user chưa được help nhưng đã bị hỏi feedback.
Lỗi thuộc layer UX Recovery.
Nên sửa bằng rule: chỉ trigger CSAT sau happy path hoặc sau khi user bấm "Gặp tư vấn viên" / "Không cần hỗ trợ thêm".
Evidence: 14.54.50.png
```

---

## 5. Sketch as-is / to-be

### As-is — luồng thực tế từ screenshot (❌ = điểm gãy)

```text
User: "HN → Đà Lạt, 5 ngày nữa có chuyến nào?"
    │
    ▼
❌ Redirect Website/App + hotline (không có chuyến cụ thể)
    │
    ▼
❌ CSAT 1–5 (vấn đề chưa xong)
    │
    ▼
User thử luồng "gợi ý đặt vé rẻ"
    │
    ▼
NEO slot-filling: điểm đi, ngày, hạng, pax...
    │
    ▼
❌ User "tìm giá rẻ" → bot loop cùng câu hỏi
    │
    ▼
User cung cấp HAN + 15/06 → "xác nhận"
    │
    ▼
❌ "Hệ thống gặp lỗi khi tìm kiếm chuyến bay"
    │
    ▼
User nhờ bot chọn ngày → 20/06 → "xác nhận"
    │
    ▼
❌ Lỗi hệ thống lần 2 → user bỏ cuộc hoặc gọi hotline
```

### To-be — flow đề xuất (✅ = path đã sửa)

```text
User: "HN → Đà Lạt, 5 ngày nữa có chuyến nào?"
    │
    ▼
✅ NEO clarify: "Quý khách muốn ngày 08/06/2026?" (tính từ hôm nay)
    │
    ├── [API OK] ──► ✅ Trả 2–3 chuyến + giá + nút "Đặt vé"
    │
    └── [API fail] ──► ✅ Deep link prefill + "Gặp tư vấn viên (giữ transcript)"
    │
    ▼
User: "Tôi đang tìm giá rẻ, chưa chốt ngày"
    │
    ▼
✅ "Quý khách linh hoạt tháng 6?" → gợi ý 2–3 ngày + giá ước lượng
    │
    ▼
✅ CSAT chỉ khi user bấm "Xong" / sau khi có kết quả hoặc handoff
```

---

## 6. Transcript rút gọn (self-use)

| Thời gian | Ai | Nội dung |
|---|---|---|
| 14:54 | User | Bấm **Bắt đầu** |
| 14:54 | NEO | "Xin chào... NEO hỗ trợ về vấn đề gì ạ?" |
| 14:54 | User | "thông tin vé máy bay" |
| 14:54 | NEO | FAQ 3 phần: kiểm tra PNR, tra cứu vé mới, đổi/cập nhật vé |
| 14:54 | User | "Chuyến bay đi đà lạt từ hà nội vào 5 ngày nữa có những chuyến bay nào" |
| 14:54 | NEO | Redirect Website/App; hotline; nút **Gặp tư vấn viên**; hỏi CSAT |
| 14:55 | User | "Sắp tới tôi sẽ đi du lịch đà lạt thì nên làm gì" |
| 14:55 | NEO | Travel guide Đà Lạt (địa điểm, ẩm thực, trang phục, mùa) |
| 14:56 | User | "Nên đi chuyến bay tối hay sáng và book vé như nào" |
| 14:56 | NEO | Gợi ý bay sáng sớm/tối muộn + link đặt vé |
| 14:57 | User | "Bạn có thể gợi ý đặt vé như nào cho rẻ không" |
| 14:57 | NEO | Slot: 1 chiều, phổ thông, 1 NL, đến DLI — thiếu điểm đi + ngày |
| 14:57 | User | "Tôi chưa đi, tôi đang tìm giá rẻ" |
| 14:57 | NEO | *(Lặp lại)* yêu cầu điểm khởi hành + ngày đi |
| 14:58 | User | "Điểm khởi hành là hà nội, ngày 15/6" |
| 14:58 | NEO | Tóm tắt slot → "xác nhận để tìm giá tốt nhất" |
| 14:58 | User | "xác nhận" |
| 14:58 | NEO | **"Rất tiếc, hệ thống gặp lỗi khi tìm kiếm chuyến bay"** |
| 14:58 | User | "bạn chọn 1 ngày nào trong tháng 6 đi" |
| 14:58 | NEO | Slot mới: HAN → DLI, **20/06/2026** |
| 14:59 | User | "Xác nhận" |
| 14:59 | NEO | **Lỗi hệ thống lần 2** |
| 15:01 | User | "Có lộ trình đi chơi 2 ngày 3 đêm tại đà lạt không" |
| 15:01 | NEO | "Data chỉ có 3N2Đ, chưa có 2N3Đ" |

---

## 7. Tự kiểm trước khi nộp

- [x] Có ít nhất 1 screenshot hoặc observation cụ thể → **9 screenshot NEO + transcript**
- [x] Có đủ 4 paths (nêu rõ path nào yếu: Failure tool, Correction/CSAT)
- [x] Finding viết thành product decision, có evidence gắn file
- [x] Sketch as-is / to-be bám luồng screenshot thật
- [x] Có câu nói rõ finding đổi SPEC thế nào

### Impact lên SPEC nhóm

Finding từ evidence thật đẩy SPEC khỏi "chatbot trả lời mọi thứ" sang **build slice có thể demo**:

> Cho hành khách đang tìm vé **Hà Nội → Đà Lạt** với ngày bay **chưa chốt hoặc linh hoạt**, prototype dùng AI để **thu 3 slot (điểm đi, điểm đến, khoảng ngày) + detect intent "tìm giá rẻ"**, tạo ra **deep link đặt vé prefill hoặc 2–3 gợi ý ngày**, và xử lý failure mode **"API search lỗi sau confirm"** bằng **retry + handoff tư vấn viên có transcript**.

---

*Bài teardown cá nhân — Day 05 · Phung Văn Thạch · 2A202601004*
