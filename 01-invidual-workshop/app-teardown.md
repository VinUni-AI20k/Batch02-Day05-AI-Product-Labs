# Workshop — Mổ App AI Thật

**Người thực hiện:** Huỳnh
**App thử:** Ada Health
**Thời gian:** 35-45 phút  
**Hình thức:** cá nhân trước, chia sẻ theo nhóm sau  
**Output:** finding note + sketch `as-is / to-be`

Mục tiêu không phải chấm "UI đẹp hay xấu". Mục tiêu là dùng sản phẩm thật như một bài needfinding: tìm chỗ product gãy trong workflow thật, rồi viết finding đó thành quyết định product.

## 1. Product hứa gì?
Ada Health hứa giúp user hiểu triệu chứng và đưa ra hướng xử lý y tế phù hợp.

## 2. User nào được hứa giúp?
Người có triệu chứng như sốt, đau họng, muốn biết: có nên nghỉ ngơi, test COVID hay đi khám.

## 3. Kỳ vọng AI làm được task nào?
- Nhận ra triệu chứng chính ngay từ câu nhập.
- Hỏi lại đúng điểm quan trọng.
- Trả kết quả với lời khuyên rõ ràng và action tiếp theo.

## 4. Dùng thật, điểm gãy xuất hiện ở đâu?
- Input: "Tôi bị sốt và đau họng"
- App hỏi nhiều câu thăm dò, một số không liên quan trực tiếp, khiến flow kéo dài.
- Kết quả trả về Flu và COVID-19 cùng lúc, không có mức độ ưu tiên.
- User bị buộc phải tự đánh giá tiếp hành động nên làm gì.

## 5. Evidence
- Screenshot: phản hồi của Ada Health khi nhập triệu chứng.
- Prompt: "Tôi bị sốt và đau họng".
- Hành vi quan sát: app vẫn đoán đúng, nhưng thiếu triage rõ ràng.

## 6. 4 paths
| Path | Nội dung |
|---|---|
| Happy | AI xác định đúng triệu chứng, gợi ý "có thể tự chăm sóc" hoặc "hãy test COVID" rõ ràng. |
| Low-confidence | AI chưa chắc, hỏi thêm 1-2 câu cần thiết như thời gian sốt và khó thở. |
| Failure | AI đưa ra quá nhiều lựa chọn bệnh, user không biết đâu là hành động ưu tiên. |
| Correction | User sửa lại triệu chứng hoặc chọn "tôi không chắc", app cần giữ lịch sử và điều chỉnh câu hỏi. |

## 7. Finding thành quyết định
Khi user nhập "Tôi bị sốt và đau họng",
AI/product hỏi nhiều câu phụ và trả về cả Flu và COVID-19,
hậu quả là user dễ lo lắng và không biết nên làm gì ngay.
Lỗi thuộc layer Intent + UX Recovery.
Nên sửa bằng yêu cầu low-confidence path: hỏi ít nhưng đúng, rồi trả action cụ thể (test, khám, nghỉ ngơi).

## 8. Sketch as-is / to-be
- As-is: user nhập triệu chứng → app hỏi lan man → result show nhiều bệnh → user hoang mang.
- To-be: user nhập triệu chứng → app xác nhận yếu tố quan trọng → result show 1 hành động chính + lý do.

## 9. Điều này đổi gì trong SPEC?
- Chuyển mục tiêu từ "dự đoán bệnh" sang "triage hành động".
- Thêm requirement: low-confidence path phải rõ ràng và không gây bối rối.
- Huỳnh là người kiểm thử phần này.
