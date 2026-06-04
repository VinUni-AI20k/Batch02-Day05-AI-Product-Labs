# Toolkit — Từ Evidence Đến Build Slice

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm

Gom theo **failure mode** — cùng 1 tiêu chí cho tất cả cụm.

### Cụm 1: "Input mismatch — User không biết chính xác mình muốn gì"
- **Evidence:** Nhân viên văn phòng mất 20–30 phút lướt app mà không chốt được món vì không có ý tưởng rõ ràng (phỏng vấn nhanh).
- **Evidence:** User chỉ nghĩ ra được cảm giác thèm ("muốn đồ nước") nhưng app bắt phải gõ đúng tên món cụ thể (phở, bún) mới tìm được.
- **Path:** Failure — app yêu cầu user phải biết trước điều mà user chưa biết.

### Cụm 2: "Intent misunderstanding — App chỉ tìm theo keyword"
- **Evidence:** Dùng GrabFood/ShopeeFood gõ "tôi muốn ăn đồ nước, thanh đạm, loanh quanh Quận 1" → kết quả rỗng hoặc sai lệch, chỉ tìm theo keyword (self-use).
- **Evidence:** V-AI (V-App) cũng gặp điểm gãy tương tự: không hiểu intent "gần đây", tự gán location mặc định sai (Nguyễn Quang Minh, Nguyễn Tuấn Dũng — bài cá nhân).
- **Path:** Failure — app truyền thống không hiểu "ý định" và "context" của user.

### Cụm 3: "Data staleness — AI hiểu ý nhưng data sai thực tế"
- **Evidence:** Hỏi ChatGPT "Trưa nay ăn gì đồ nước, thanh đạm ở Quận 1" → LLM hiểu đúng ý định, phân tích tốt loại món và taste. Nhưng quán ăn được gợi ý bị sai vị trí, quán ảo (self-use).
- **Evidence:** V-AI trả dữ liệu tĩnh lỗi thời, không có nhãn thời gian (Nguyễn Tuấn Dũng — bài cá nhân).
- **Path:** Low-confidence / Correction — LLM giỏi hiểu intent nhưng yếu ở data thực tế (location, allergen).

### Cụm 4: "Safety risk — Gợi ý gây hại cho sức khỏe"
- **Evidence:** Nếu AI gợi ý món chứa thành phần dị ứng (ví dụ: đậu phộng), hậu quả nghiêm trọng về sức khỏe (Topic.md — Failure Modes).
- **Path:** Failure — failure mode nguy hiểm nhất cần mitigation bắt buộc.

## 2. Viết insight

Viết theo reasoning chain: Evidence → vì sao → Root cause.

```text
Evidence A: Nhân viên VP mất 20-30 phút lướt app không chốt được món (phỏng vấn).
Evidence B: User chỉ biết "muốn đồ nước" nhưng app bắt gõ tên cụ thể (self-use).
Evidence C: GrabFood/ShopeeFood trả kết quả rỗng khi gõ mô tả mơ hồ (self-use).

→ Root cause KHÔNG phải "app search yếu".
→ Root cause là "app yêu cầu user phải biết trước điều mà user chưa biết" (input mismatch).
→ "Decision support" là interpretation hợp lý, nhưng cần validate thêm với user thật.
```

## 3. Viết opportunity

Trước khi viết opportunity, trả lời 3 câu validation:

```
1. Root cause là gì? (không phải symptom)
   → App yêu cầu user phải biết trước điều user chưa biết (input mismatch).

2. Automating action X có solve root cause không?
   → Automate "chuyển mô tả → tags" GIẢI QUYẾT input mismatch vì user không cần biết tên món cụ thể.

3. Nếu KHÔNG automate — có cần change UX/process trước không?
   → Không cần. UX hiện tại đã cho nhập tự nhiên, nhưng backend chỉ tìm keyword. Automation ở backend là đủ.
```

Sau khi trả lời, viết opportunity:

```text
Cơ hội là dùng AI để tự động chuyển đổi
mô tả mơ hồ của user thành các tags cụ thể (loại món, taste,
location) — giải quyết input mismatch — và giới hạn sự lựa chọn
xuống 3 món tốt nhất, giúp user chốt quyết định ăn trưa trong
dưới 1 phút, trong khi vẫn kiểm soát rủi ro dị ứng thực phẩm
bằng hard filter bắt buộc và giới hạn khoảng cách (< 3km).
```

## 4. Chọn build slice

Build slice tốt phải qua 6 câu hỏi:

| Câu hỏi | Đạt khi | ✅ Nhóm đáp ứng |
|---|---|---|
| User cụ thể chưa? | Nói được ai dùng, trong bối cảnh nào. | ✅ Nhân viên văn phòng, đang muốn đặt đồ ăn trưa nhưng không có ý tưởng rõ ràng. |
| Task đủ hẹp chưa? | Demo được trong 3-5 phút. | ✅ Nhập mô tả tự nhiên → nhận 3 gợi ý món ăn kèm lý do. Demo trong 2–3 phút. |
| AI decision rõ chưa? | AI gợi ý/tự làm một việc cụ thể. | ✅ AI parse mô tả tự nhiên → extract intent (loại món, taste, location) → filter dataset → trả 3 kết quả + giải thích. |
| Failure path rõ chưa? | Có một case AI không chắc hoặc sai để test. | ✅ Case 1: Gợi ý món chứa thành phần dị ứng. Case 2: Gợi ý quán quá xa (> 3km). |
| Có evidence không? | Có bằng chứng từ self-use/review/user/competitor. | ✅ Self-use (GrabFood, ChatGPT), phỏng vấn nhanh, competitor analysis (3 nguồn). |
| **Non-goals rõ chưa?** | **Nói được cái gì KHÔNG build, tại sao.** | ❌ Chưa có — cần điền ở bên dưới. |

### Non-goals (KHÔNG build trong Day 06)

| Không build | Lý do | Cần gì để build? |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |

## 5. Định nghĩa 4 Paths

Mỗi path cần có: **trigger criteria** (khi nào vào path này) và **recovery flow** (xử lý thế nào).

| Path | Trigger criteria | Recovery flow |
|---|---|---|
| **Happy** | Confidence ≥ 0.8, data đầy đủ, không có conflict. | Hiển thị kết quả + lý do. Không cần hỏi thêm. |
| **Low-confidence** | Confidence 0.5–0.8, hoặc thiếu 1 input quan trọng (location, taste). | Hỏi lại 1 câu cụ thể + hiển thị 2-3 options để user chọn. |
| **Failure** | Confidence < 0.5, hoặc data invalid ( quán ảo, khoảng cách > 3km, dị ứng conflict). | Fallback: "Mình chưa chắc chắn về gợi ý này" → hiển thị nguồn + link verify → human review nếu cần. |
| **Correction** | User sửa kết quả (chọn món khác, reject gợi ý). | Log correction → check: nếu ≥ 3 lần sửa cùng pattern → update rule/flag để cải thiện. Nếu < 3 lần → ghi nhận nhưng chưa đổi. |

### Apply cho nhóm:

| Path | Nhóm sẽ test thế nào? |
|---|---|
| Happy | Input rõ ràng: "Phở bò ở Quận 1, 50k đổ lại" → restaurant search + filter → trả 3 kết quả. |
| Low-confidence | Input mơ hồ: "Muốn đồ ăn thanh đạm" → hỏi lại "Bạn muốn ở khu vực nào?" + chips [Quận 1], [Quận 3], [Gần đây]. |
| Failure | Input chứa dị ứng: "Món có đậu phộng" → chặn + cảnh báo "Món này có chứa đậu phộng. Bạn có chắc không?" |
| Correction | User reject kết quả → hỏi "Tại sao gợi ý này không phù hợp?" → log response. |

## 6. Quyết định: giữ, giảm scope, hay đổi hướng?

**Priority order** — khi nhiều tình huống xảy ra đồng thời, xử lý theo thứ tự:

```
1. Evidence yếu → DỪNG build, quay lại research (không build trên assumption)
2. Rủi ro cao → Conditional automation (không tự làm)
3. Scope rộng → CẮT (giữ 1 flow)
4. AI không cần → Rule-based (ghi rõ)
5. Không demo được → Backlog (giữ path nhỏ nhất)
```

| Tình huống | Quyết định | Áp dụng cho nhóm |
|---|---|---|
| Evidence yếu, user mơ hồ | Dừng build sâu; quay lại research 20 phút. | ❌ Không áp dụng — evidence đủ mạnh từ self-use + phỏng vấn. |
| Ý tưởng quá rộng | Giữ domain, cắt xuống một flow. | ✅ **Đã cắt:** Chỉ giữ flow "nhập mô tả → nhận 3 gợi ý". Bỏ các tính năng mở rộng (lịch sử, đánh giá, đặt hàng). |
| AI không cần thiết | Dùng rule/manual prototype; ghi rõ vì sao không dùng AI sâu. | ❌ Không áp dụng — AI cần thiết để hiểu mô tả tự nhiên (intent extraction), rule-based không làm được. |
| Rủi ro cao | Chọn augmentation hoặc conditional automation. | ✅ **Áp dụng:** Chọn **Conditional Automation** — AI tự gợi ý trong case rõ ràng, nhưng áp dụng hard filter bắt buộc cho dị ứng và khoảng cách trước khi xuất kết quả. |
| Không demo được trong 1 ngày | Đưa phần lớn vào backlog, giữ một path nhỏ. | ✅ **Áp dụng:** Dùng dataset nhỏ (10–20 món) thay vì crawl dữ liệu thực. Backlog: tích hợp API bản đồ, hệ thống review, mở rộng dataset. |

## 7. Câu chốt cuối

Viết 4 dòng, mỗi dòng 1 ý. Không gộp thành 1 câu dài.

```text
Problem: Nhân viên VP mất 20-30 phút chọn món vì app không hiểu mô tả mơ hồ.

Solution: Prototype AI parse mô tả tự nhiên → trả 3 gợi ý + lý do.

Failure test: Gợi ý chứa dị ứng + gợi ý quán > 3km.

Evidence: Self-use GrabFood/ShopeeFood + ChatGPT + phỏng vấn nhanh.
```

## 8. Backlog

Phân loại rõ ràng — không phải tất cả đều như nhau:

| Backlog item | Category | Cần gì để build? | Priority sau Day 06 |
|---|---|---|---|
| API bản đồ (Google Maps / Mapbox) | Infra | API key + integration | High — cần cho location accuracy |
| Feedback loop | Feature | Data từ user interactions | Medium — cần data trước |
| Dataset 100+ món | Data | Manual work + nutrition data | Medium — cần cho coverage |
| Lịch sử gợi ý | Feature | Storage + dedup logic | Low — UX improvement |
| Đặt hàng trực tiếp | Integration | Partner API (Grab/Shopee) | Low — cần business deal |
| Voice input | Feature | ASR model + infra | Low — cần infra riêng |
