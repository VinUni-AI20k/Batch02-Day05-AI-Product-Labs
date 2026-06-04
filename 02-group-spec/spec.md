# SPEC — Chatbot gợi ý món ăn cho ShopeeFood (MVP)

> **Trạng thái:** Draft v0.1 — cần xác thực Bước 1 bằng research thật trước khi đóng băng scope.
> **Bối cảnh giả định:** đồ án/portfolio, MVP một luồng. Mọi con số trong tài liệu là *giả thuyết* hoặc *mục tiêu*, không phải dữ liệu đã đo.
> **Cách đọc tài liệu:** phần nào là *giả thuyết* sẽ ghi rõ `[GIẢ THUYẾT]`; phần nào cần đi đo/đi hỏi sẽ ghi `[CẦN XÁC THỰC]`.

---

# GIAI ĐOẠN 1 — ĐỊNH HÌNH & XÁC THỰC BÀI TOÁN

## Bước 1 — Research Note / User Pain Points

### 1.1. Vấn đề lõi (phát biểu một câu)
> Người dùng mở app khi **đói nhưng chưa biết ăn gì**; danh sách "Gợi ý cho bạn" hiện tại không khớp với *ý định mơ hồ* của họ ("món gì nóng nóng, rẻ rẻ, gần đây"), nên họ lướt lâu, mệt mỏi rồi đôi khi thoát ra mà không đặt.

### 1.2. Pain point — dưới dạng giả thuyết cần kiểm chứng
Đừng coi đây là sự thật. Đây là 4 giả thuyết, mỗi cái đi kèm *bằng chứng cần tìm* và *metric chứng minh*.

| # | Giả thuyết pain point | Bằng chứng cần tìm | Metric chứng minh pain là THẬT |
|---|---|---|---|
| P1 | **Tê liệt vì quá nhiều lựa chọn** (choice paralysis) — đói thì càng khó quyết | Phỏng vấn: "lần gần nhất bạn mở app rồi không đặt là khi nào?"; quan sát thời gian từ mở app → đặt | Thời gian từ mở app đến đặt (time-to-order) dài; tỉ lệ session "lướt nhưng không đặt" cao |
| P2 | **Danh sách gợi ý tối nghĩa / như quảng cáo** — không hiểu vì sao món đó được gợi ý, không tin tưởng | Review app store/Google Play lọc theo từ khóa "gợi ý", "đề xuất", "không liên quan"; hỏi người dùng có bao giờ đặt từ mục gợi ý không | Tỉ lệ click vào mục "Gợi ý cho bạn" thấp; tỉ lệ đặt từ mục đó thấp |
| P3 | **Không có cách diễn đạt ý định mơ hồ** — search chỉ ăn theo keyword, không hiểu "dưới 50k, không cay, ăn nhẹ" | Quan sát người dùng gõ gì vào ô search; ghi lại các câu họ "ước gì gõ được" | Số lần search trả về 0/ít kết quả; số lần sửa lại từ khóa trong một session |
| P4 | **Không tận dụng ngữ cảnh** — giờ giấc, thời tiết, ngân sách, ăn một mình hay nhóm, lịch sử đơn | Phỏng vấn về thói quen đặt theo bữa/thời tiết | Định tính (chưa cần metric ở MVP) |

> **Quan trọng:** Nếu sau research P1 và P3 *không* đứng vững (ví dụ người dùng thực ra quyết rất nhanh), thì cả tính năng này có thể không đáng làm. Bước 1 chính là cái chốt chặn để không lao vào xây thứ không ai cần.

### 1.3. Kế hoạch research (việc bạn cần đi làm)
- **Phỏng vấn nhanh 5–7 người** dùng ShopeeFood/GrabFood thường xuyên. Câu hỏi mở, hỏi *hành vi gần nhất* chứ đừng hỏi ý kiến chung chung:
  - "Kể lại lần gần nhất bạn mở app mà cuối cùng không đặt gì."
  - "Bạn chọn món thế nào khi không biết ăn gì?"
  - "Bạn có để ý mục 'Gợi ý cho bạn' không? Có bao giờ đặt từ đó không?"
- **Đào review** trên App Store / CH Play của ShopeeFood, GrabFood, BeFood — lọc 1–3 sao, tìm than phiền liên quan tìm món/gợi ý.
- **Quan sát trực tiếp** 3–5 người đặt đồ ăn (think-aloud): bấm gì, lưỡng lự ở đâu, bỏ cuộc lúc nào.
- **Đầu ra:** dán screenshot review + quote phỏng vấn (ẩn danh) + bảng đối chiếu với P1–P4 ở trên. Mỗi pain point hoặc được *củng cố*, *bác bỏ*, hoặc *chỉnh lại*.

---

## Bước 2 — Product Scope / Feature Definition (Lát cắt)

### 2.1. Lát cắt theo mẫu `1 User → 1 Task → 1 AI Decision → 1 Output`

| Thành phần | Định nghĩa |
|---|---|
| **1 User** | Người dùng đang mở app, đói, **chưa có món cụ thể trong đầu** |
| **1 Task** | Diễn đạt ý định bằng ngôn ngữ tự nhiên (1–vài câu) thay vì gõ keyword |
| **1 AI Decision** | Từ ý định + ngữ cảnh tối thiểu (vị trí, giờ), chọn ra **tối đa 3 món/quán** và **giải thích vì sao** |
| **1 Output** | 3 thẻ gợi ý, mỗi thẻ: tên món/quán, giá, khoảng cách/ETA, **1 dòng lý do**, nút 1-chạm mở quán |

### 2.2. TRONG phạm vi (In scope)
- Nhập ý định bằng chat (text). Có thể gợi ý sẵn vài "chip" mẫu ("Ăn nhẹ < 50k", "Món nước nóng", "No bụng chắc dạ").
- Hỏi lại **đúng 1 câu** khi ý định quá mơ hồ.
- Trả 3 gợi ý kèm lý do, từ dữ liệu quán **có thật, đang mở, trong bán kính giao**.
- Cho phép refine 1 lần: "rẻ hơn", "khác đi", "gần hơn".

### 2.3. NGOÀI phạm vi (Out of scope — MVP không làm)
- Tự động đặt đơn / thanh toán.
- Tối ưu giỏ hàng nhiều quán, đặt nhóm, chia tiền.
- Gợi ý dinh dưỡng/y tế ("ăn gì để giảm cân", chế độ bệnh lý).
- Trí nhớ hội thoại xuyên nhiều phiên / hồ sơ khẩu vị dài hạn.
- Giọng nói, ảnh, đa ngôn ngữ.

> Giữ scope nhỏ thế này là cố ý: đủ để chứng minh giá trị của AI mà không phải đụng vào thanh toán (rủi ro cao) hay cá nhân hóa dài hạn (tốn dữ liệu/thời gian).

### 2.4. Tiêu chí thành công của MVP `[CẦN XÁC THỰC sau khi có baseline]`
- **North-star (định tính):** "AI có giúp người chưa biết ăn gì chốt được món nhanh hơn và thấy gợi ý *có lý* không?"
- Proxy đo được: tỉ lệ phiên có ít nhất 1 lần chạm vào thẻ gợi ý; tỉ lệ chấp nhận (chọn) trong 3 gợi ý đầu; số lần refine trung bình (càng ít càng tốt nếu chốt được).

---

## Bước 3 — AI Interaction Spec (Augment hay Automate)

### 3.1. Quyết định: **AUGMENT** (AI gợi ý — Người quyết định)
**Không** làm Automate (AI tự đặt đơn) ở MVP.

**Lý do:**
- Đặt đồ ăn gắn với **khẩu vị, tiền bạc, và niềm tin** — sai một lần là mất tiền thật và mất lòng tin.
- Khẩu vị biến thiên rất lớn giữa người với người và theo tâm trạng → AI khó đúng 100%.
- Người dùng cần cảm giác **kiểm soát**; tự động đặt làm họ lo lắng nhiều hơn là tiện.
- Về kỹ thuật, Augment cho phép sai số: AI chỉ cần *gợi ý đủ tốt*, không cần *đúng tuyệt đối*.

### 3.2. Con người giữ quyền kiểm soát ở đâu
- AI **chỉ đề xuất**, không bao giờ tự thêm vào giỏ hay đặt đơn.
- Mọi gợi ý đều cần **1 cú chạm xác nhận** của người dùng để mở quán.
- Người dùng luôn refine được hoặc bỏ qua toàn bộ gợi ý.
- AI **luôn nêu lý do** cho mỗi gợi ý → người dùng tự thẩm định, không bị "hộp đen".

### 3.3. Quy tắc hành vi AI (AI behavior rules)
1. **Chỉ gợi ý món/quán có thật, đang mở, trong bán kính giao.** Tuyệt đối không bịa tên món/quán.
2. **Tối đa 3 gợi ý.** Nhiều hơn là quay lại bài toán choice paralysis.
3. **Mỗi gợi ý 1 dòng lý do** ngắn, dựa trên ý định người dùng ("nóng, dưới 50k, gần").
4. **Khi không đủ tự tin → hỏi đúng 1 câu**, không đoán bừa (xem ngưỡng ở Bước 5).
5. **Không tư vấn y tế/dinh dưỡng.** Nếu bị hỏi, từ chối nhẹ và quay về gợi ý món.
6. **Giọng điệu:** ngắn, thân thiện, không lan man, không "nịnh".

---

# GIAI ĐOẠN 2 — THIẾT KẾ PHƯƠNG ÁN & KỊCH BẢN KIỂM THỬ

## Bước 4 — Prototype Sketch + Draft Prompts

### 4.1. Luồng đi (4 màn hình lo-fi)
> Bản vẽ trực quan được render kèm trong chat. Mô tả text dưới đây để cả đội đọc và giải thích lại được.

```
[1] Điểm vào                [2] Nhập ý định            [3] 3 gợi ý                [4] Mở quán (ra khỏi AI)
+------------------+        +------------------+       +------------------+       +------------------+
|  Thanh tìm kiếm  |        |  Bạn đang muốn   |       |  Gợi ý cho bạn   |       |  [Trang quán      |
|  [Hôm nay ăn gì?]| --tap->|  ăn gì? (chat)   |--gửi->| 1. Bún bò Cô Ba  |--tap->|   ShopeeFood gốc] |
|                  |        |  > nóng,<50k,gần |       |    35k·0.8km·nóng |       |                  |
|  (chip gợi ý:    |        |  [chip: ăn nhẹ]  |       | 2. Phở Lý 40k... |       |  Người dùng đặt   |
|   ăn nhẹ / nước  |        |  [chip: no bụng] |       | 3. Mì Quảng 38k. |       |  như bình thường  |
|   nóng / no bụng)|        |                  |       | [Khác đi][Rẻ hơn]|       |                  |
+------------------+        +------------------+       +------------------+       +------------------+
```

**Điểm cần nhớ:** AI chỉ "sống" ở màn 2–3. Đến màn 4 là bàn giao về luồng đặt đơn gốc của ShopeeFood — AI không can thiệp thanh toán.

### 4.2. Draft System Prompt (cho LLM)
```
Bạn là trợ lý gợi ý món ăn trong app giao đồ ăn. Nhiệm vụ: từ ý định của
người dùng và DANH SÁCH QUÁN được cung cấp, chọn TỐI ĐA 3 món/quán phù hợp nhất.

QUY TẮC BẮT BUỘC:
- CHỈ chọn từ DANH SÁCH QUÁN được đưa vào. KHÔNG bịa tên món/quán không có trong danh sách.
- Mỗi gợi ý kèm 1 lý do ngắn (<= 12 từ) bám sát ý định người dùng.
- Nếu ý định quá mơ hồ để chọn (thiếu ít nhất 1 trong: loại món / ngân sách / khẩu vị),
  ĐỪNG đoán — đặt 1 câu hỏi làm rõ duy nhất.
- KHÔNG tư vấn y tế, dinh dưỡng, giảm cân.
- Trả về JSON đúng định dạng, không thêm chữ thừa.

ĐỊNH DẠNG TRẢ VỀ:
{
  "action": "suggest" | "clarify",
  "clarify_question": "string (chỉ khi action=clarify)",
  "suggestions": [
    {"restaurant_id": "...", "dish": "...", "price": 0, "reason": "..."}
  ]
}
```

### 4.3. Draft User Prompts (để demo hành vi)
- "đói quá mà không biết ăn gì, kiểu nóng nóng rẻ rẻ thôi"
- "trưa nắng nóng, muốn món nước thanh đạm dưới 50k"
- "ăn nhẹ buổi chiều, không cay"
- (mơ hồ) "đặt gì giờ" → kỳ vọng AI **hỏi lại**, không đoán
- (lạc đề) "thời tiết Hà Nội mai thế nào" → kỳ vọng AI từ chối nhẹ, kéo về món ăn

---

## Bước 5 — Testcase Document (gồm Fallback)

### 5.1. Định nghĩa "độ tin cậy thấp" (low-confidence)
AI coi là low-confidence khi xảy ra **một trong các điều kiện**:
- Ý định thiếu cả 3 yếu tố: loại món, ngân sách, khẩu vị/ràng buộc.
- Dữ liệu trả về < 3 quán phù hợp trong bán kính.
- Câu nhập không liên quan đến ăn uống.
→ Khi low-confidence: **không gợi ý bừa**, chuyển sang `clarify` hoặc fallback tương ứng dưới đây.

### 5.2. Bảng testcase

| ID | Loại | Input / Tình huống | Kỳ vọng hành vi AI | Fallback |
|----|------|--------------------|--------------------|----------|
| TC-01 | Happy | "nóng, dưới 50k, gần đây" | 3 gợi ý hợp lệ + lý do | — |
| TC-02 | Happy + refine | TC-01 rồi bấm "Rẻ hơn" | 3 gợi ý mới rẻ hơn | Nếu không còn rẻ hơn → báo "đây đã là rẻ nhất quanh bạn" + giữ list cũ |
| TC-03 | Low-confidence | "đặt gì giờ" (quá mơ hồ) | Hỏi đúng 1 câu làm rõ | Nếu user vẫn mơ hồ lần 2 → đưa 3 gợi ý phổ biến nhất quanh đó + ghi rõ "gợi ý chung" |
| TC-04 | Failure: ít dữ liệu | Khu vực chỉ có 1–2 quán mở | Đưa số gợi ý có thật (1–2), không độn cho đủ 3 | Báo "ít quán đang mở quanh bạn" + nút mở danh sách đầy đủ |
| TC-05 | Failure: không có quán | Ngoài giờ / ngoài vùng giao | Không gợi ý | Thông báo rõ lý do + gợi ý đổi địa chỉ/đợi giờ mở |
| TC-06 | Failure: ngân sách bất khả thi | "món gì dưới 5k" | Không bịa | Báo "quanh bạn chưa có món trong tầm giá này", gợi ý nới giá |
| TC-07 | Risk: hallucination | LLM định trả món không có trong danh sách | Hệ thống **chặn ở tầng code**: lọc bỏ mọi `restaurant_id` không tồn tại | Nếu sau lọc < 1 gợi ý → coi như TC-04 |
| TC-08 | Lạc đề | "thời tiết mai thế nào" | Từ chối nhẹ, kéo về ăn uống | "Mình chỉ giúp chọn món thôi nha — bạn đang muốn ăn gì?" |
| TC-09 | Ràng buộc xung đột | "đồ chay nhưng phải có thịt bò" | Hỏi lại / nêu mâu thuẫn | Chọn 1 nhánh ưu tiên rồi hỏi xác nhận |
| TC-10 | Out of scope | "đặt giúp mình luôn đi" | Không tự đặt | Giải thích AI chỉ gợi ý, hướng dẫn bấm vào quán để tự đặt |
| TC-11 | Y tế/dinh dưỡng | "ăn gì để chữa đau dạ dày" | Không tư vấn y tế | Từ chối nhẹ, gợi ý món nhẹ bụng *chung chung* + khuyên hỏi bác sĩ |
| TC-12 | User từ chối tất cả | Bấm "Khác đi" nhiều lần | Đổi gợi ý mỗi lần | Sau 3 lần đổi → đề nghị nhập lại ý định cụ thể hơn |

### 5.3. Nguyên tắc Fallback chung
1. **Thà nói "không có" còn hơn bịa.** Mọi gợi ý phải truy được về dữ liệu thật.
2. **Lọc ở tầng code, không tin LLM tuyệt đối** (TC-07): sau khi LLM trả JSON, code kiểm tra mọi `restaurant_id`/món có thật + đang mở mới hiển thị.
3. **Low-confidence thì hỏi, không đoán** — nhưng hỏi tối đa 1–2 lần rồi rơi về gợi ý chung, tránh vòng lặp khó chịu.
4. **Mọi fallback đều có lối ra về luồng app gốc** (danh sách đầy đủ), không để người dùng cụt đường.

---

## Phụ lục — Việc cần làm tiếp (checklist)
- [ ] Đi research Bước 1, xác thực/bác bỏ P1–P4 (đây là cái chốt chặn quan trọng nhất).
- [ ] Chốt lại scope Bước 2 dựa trên kết quả research.
- [ ] Vẽ lại sketch trên Figma từ bản lo-fi.
- [ ] Viết thật prompt + test với danh sách quán mẫu (10–20 quán giả lập).
- [ ] Chạy 12 testcase, ghi lại fallback nào hoạt động / chưa.
