# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:**  Zone 1 - nhóm 2
**Track:**  Healcare
**Product/app đã chọn:**  Đặt lịch
**Build slice đang nghĩ:**   Từ triệu chứng gợi ý phòng khám và lịch khám
## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Nhập "đau mắt đỏ, chảy nước mắt 2 ngày" → AI gợi ý đúng Chuyên khoa Mắt, offer đặt lịch ngay | [Tự chụp] bookingcare.vn/tro-ly-ai/dat-lich-i1 | Happy | Happy path hoạt động tốt khi triệu chứng rõ ràng, 1 khoa |
| Nhập "hay mệt mỏi, đôi khi đau đầu" → AI liệt kê 7 nhóm nguyên nhân, không gợi ý được 1 khoa cụ thể, hỏi chung "tìm bác sĩ phù hợp không?" | [Tự chụp] bookingcare.vn/tro-ly-ai/dat-lich-i1 | Low-confidence | AI dump thông tin thay vì hỏi thêm để thu hẹp → user đọc xong vẫn không biết đi đâu |
| Nhập "đau ngực, khó thở, tay trái tê" → AI cảnh báo "đến cấp cứu ngay" nhưng ngay sau vẫn hỏi "bạn có muốn đặt lịch Tim mạch không?" | [Tự chụp] bookingcare.vn/tro-ly-ai/dat-lich-i1 | Failure | Mâu thuẫn logic: cảnh báo cấp cứu + offer đặt lịch thường trong cùng 1 response — failure mode nguy hiểm nhất |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng [cách] trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| BookingCare AI — Trợ lý AI đặt lịch (bookingcare.vn/tro-ly-ai/dat-lich-i1) | Happy path: gợi ý đúng khoa khi triệu chứng rõ. Low-confidence: dump 7 nhóm nguyên nhân, không thu hẹp, không hỏi thêm. Red flag: cảnh báo cấp cứu nhưng vẫn offer đặt lịch thường trong cùng response | Gap rõ ở low-confidence (không dẫn đến quyết định) và red flag (logic mâu thuẫn). Happy path đã ổn — không cần làm lại | ✅ Fix 2 gap này đủ differentiation trong 1 ngày |
| August AI chatbot — AI triage quốc tế (arxiv.org/pdf/2412.12538) | Hỏi ít câu hơn (47% fewer questions), đạt 95.8% accuracy gợi ý chuyên khoa, có confidence score rõ ràng | Conversational triage: hỏi thêm 1–2 câu để thu hẹp thay vì dump thông tin | ✅ Reuse prompt approach, đơn giản hóa thành 1 LLM call |
| Symptomate / Ada Health — symptom checker quốc tế | Hỏi triệu chứng tuần tự → gợi ý condition → gợi ý care level (tự theo dõi / đặt lịch / cấp cứu) | Tách rõ 3 care level output — không bao giờ offer đặt lịch khi output là cấp cứu | ✅ Pattern red flag handling áp dụng được ngay |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:

Insight:
User không chỉ gặp [surface problem].
Thật ra họ cần [deeper need / decision support / trust / recovery].

Opportunity:
AI có thể giúp bằng cách [augment/automate hành động hẹp].
```

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [ ] Đổi Auto/Aug decision.
- [x] Đổi failure mode.
- [ ] Đổi 4 paths.
- [ ] Đổi owner/test plan.

Trước evidence, nhóm định build app đặt lịch khám với AI gợi ý
chuyên khoa từ triệu chứng — giả định không có competitor làm việc này.

Sau evidence, nhóm xác nhận BookingCare đã có AI triage.
Đổi focus sang 2 gap cụ thể: (1) low-confidence path — 
BookingCare dump thông tin, không dẫn đến quyết định; 
(2) red flag path — BookingCare mâu thuẫn logic khi vừa 
cảnh báo cấp cứu vừa offer đặt lịch thường.

Lý do: evidence từ self-test 3 case thật trên BookingCare AI,
ngày 03/06/2026.
