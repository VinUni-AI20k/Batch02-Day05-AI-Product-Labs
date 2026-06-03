# Evidence Pack — Huỳnh

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** Huỳnh
**Track:** Symptom Triage
**Product/app đã chọn:** Ada Health
**Build slice đang nghĩ:** Hướng dẫn nhanh cho người sốt + đau họng

## 2. Self-use evidence

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Nhập "Tôi bị sốt và đau họng" | ![Ada Health screenshot](../Screenshot/z7896448348863_d28c4c4805b978972aa5969b2438a838.jpg) | Low-confidence / Correction | App hỏi nhiều câu phụ, một số không tập trung vào triệu chứng chính, nhưng vẫn đoán được Flu/COVID. |
| Kết quả hiển thị Flu và COVID-19 | ![Ada Health screenshot](../Screenshot/z7896448337313_ecb3ddb2dba72a62710363546399c88c.jpg) | Low-confidence / Failure | Gợi ý nhiều bệnh cùng lúc khiến user bối rối; cần rõ hành động tiếp theo. |

## 3. User / review / social evidence

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "App hỏi quá nhiều và kết quả vẫn mơ hồ." | Review App Store | Người dùng tìm giải pháp nhanh | Failure: mất niềm tin khi flow quá dài và không có giải pháp cụ thể. |
| "Tôi chỉ cần biết có nên đi khám hay nghỉ ở nhà." | Review Play Store | Người dùng triệu chứng nhẹ | Pain: thiếu decision support rõ ràng. |
|  |  |  |  |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng bộ test user interview trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| Ada Health | Hỏi nhiều, trả nhiều khả năng | Thăm dò sâu nhưng dễ gây lo lắng | Có, nếu rút gọn thành triage action. |
| WebMD Symptom Checker | Hiển thị khả năng với mức độ ưu tiên | Giảm mơ hồ bằng ranking và next step | Có, dùng template action priorities. |
| ChatGPT | Giải thích và hướng dẫn care | Tốt ở giải thích nhưng thiếu chắc chắn y tế | Có, nếu dùng làm giải thích bổ trợ. |

## 5. Evidence -> Insight

Evidence nổi bật nhất:

Insight:
Người dùng không cần chỉ "biết bệnh gì"; họ cần biết "nên làm gì" khi triệu chứng như sốt + đau họng.

Opportunity:
AI có thể giúp bằng cách tập trung vào triage hành động: emergency / xem bác sĩ / tự chăm sóc, kèm lý do rõ ràng.

## 6. Evidence đổi SPEC như thế nào?

- [x] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [x] Đổi Auto/Aug decision.
- [ ] Đổi 4 paths.
- [ ] Đổi failure mode.
- [ ] Đổi owner/test plan.

Trước evidence, nhóm định làm symptom checker chung.
Sau evidence, nhóm định làm symptom triage nhanh cho user sốt + đau họng, ưu tiên action rõ ràng.
Lý do: câu trả lời nhiều khả năng khiến người dùng bối rối và mất niềm tin.
