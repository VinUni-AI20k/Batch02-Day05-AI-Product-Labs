# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** [Tên nhóm]

**Track:** Healthcare

**Product/app đã chọn:** Ada Health

**Build slice đang nghĩ:**

Conversational Symptom Assessment Assistant

Người dùng mô tả triệu chứng bằng ngôn ngữ tự nhiên thay vì chọn từ danh sách có sẵn.

AI sẽ:

* Trích xuất triệu chứng từ hội thoại.
* Suy luận các thông tin còn thiếu.
* Chủ động đặt câu hỏi tiếp theo.
* Xây dựng hồ sơ triệu chứng có cấu trúc.
* Đề xuất các bệnh lý có khả năng liên quan cùng mức độ tin cậy.

Khác biệt chính so với Ada Health:

* Ada: Questionnaire-first (người dùng trả lời chuỗi câu hỏi có cấu trúc).
* Prototype: Conversation-first (người dùng mô tả tự nhiên, AI dẫn dắt hội thoại để thu thập thông tin).

## 2. Self-use evidence

| Observation                           | Screenshot/link                                                                           | Path liên quan             | Điều học được                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Nhập triệu chứng sốt + đau họng | ![Ada Health screenshot](../Screenshot/z7896448348863_d28c4c4805b978972aa5969b2438a838.jpg) | Low-confidence / Correction | App hỏi thêm nhiều câu, một số câu không liên quan nhưng tổng thể dự đoán khá chính xác. |
| Kết quả gợi ý Flu và COVID-19    | ![Ada Health screenshot](../Screenshot/z7896448337313_ecb3ddb2dba72a62710363546399c88c.jpg) | Low-confidence / Failure    | Dự đoán gần đúng nhưng có thể tạo ra lo lắng với nhiều khả năng bệnh, cần rõ ràng hơn. |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
| ---------------------------- | ------ | ------------ | ----------------- |
|                              |        |              |                   |
|                              |        |              |                   |
|                              |        |              |                   |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng [cách] trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

Dùng cùng input trên mọi app:

- **Case A (rõ ràng):** Sốt + đau họng 2 ngày.
- **Case B (mơ hồ):** Mệt mỏi, hơi chóng mặt.
- **Case C (red flag):** Đau ngực lan ra tay trái + khó thở.

| App / mô hình                                  | Họ xử lý task triage thế nào? (User flow)                                                                                                                                                                                                            | Strength                                                                                                                                                  | Weakness                                                                                                                                                                                                                            | Pattern học được                                                                                                     | Áp dụng trong 1 ngày?                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Ada Health**                             | Nhập triệu chứng dạng free-text → AI hỏi loạt câu hỏi trắc nghiệm thích ứng (Bayesian, hỏi ít nhất có thể) → ra báo cáo: mức độ khẩn + danh sách "possible causes". Có**8 mức triage** từ Self-care → Gọi cấp cứu. | Hỏi thích ứng, ít gây mệt; có thang triage rất chi tiết (8 mức); luôn kèm disclaimer "không phải chẩn đoán"; triage tốt hơn diagnosis. | Top-1 diagnosis ~54–70%, vẫn kém bác sĩ; onboarding hỏi nhiều câu profile gây nản; phụ thuộc user mô tả đúng.                                                                                                       | **Adaptive questioning** + **thang triage rõ ràng nhiều mức** + disclaimer rõ.                          | Có — bắt chước được "hỏi 3 câu → phân 3 mức" ở dạng tối giản. |
| **WebMD Symptom Checker**                  | Chọn triệu chứng trên body-map + chọn vị trí, mức độ → ra danh sách bệnh khả dĩ. Tương tác kiểu form/click, không hội thoại.                                                                                                        | Phổ biến, nhiều người biết; nội dung y khoa phong phú để đọc thêm.                                                                           | Diagnosis chính xác chỉ**3–36%** tùy bệnh; rủi ro **false reassurance** (bỏ sót dấu hiệu nguy cấp) và **overtriage**; phụ thuộc nặng vào việc user chọn đúng vùng/mức độ.                | Né kiểu "ép user tự phân loại y khoa"; cần AI gánh phần suy luận thay vì bắt user chọn.                     | Một phần — học cái**nên tránh** hơn là cái nên copy.          |
| **MyVinmec (VN)**                          | App quản lý sức khỏe của Vinmec: hồ sơ y tế online, đặt lịch, Q&A hỏi bác sĩ, khám từ xa, QR check-in. AI hiện chủ yếu ở**chẩn đoán hình ảnh y khoa**, *không* phải symptom triage hội thoại.                        | Bối cảnh**Việt Nam thật**, có bác sĩ thật phía sau; tích hợp đặt lịch → hành động tiếp theo rõ.                                 | Không có triage triệu chứng tự động kiểu Ada; AI tập trung imaging; muốn hỏi phải qua người.                                                                                                                          | **Human-in-the-loop** + nối thẳng tới hành động (đặt lịch/hỏi bác sĩ).                                 | Học pattern "AI gợi ý → chuyển sang đặt lịch/bác sĩ thật".          |
| **Babylon Health (đã phá sản 2023)**   | Chatbot hội thoại triage: hỏi triệu chứng → khuyến nghị self-care / gặp GP / cấp cứu; nối với video GP.                                                                                                                                      | Ý tưởng hội thoại triage + telehealth liền mạch (mô hình tham vọng).                                                                            | Tuyên bố "ngang bác sĩ" bị bác bỏ; thực chất là**decision tree if/then**; **bỏ sót dấu hiệu đau tim**; chẩn đoán nhầm; rủi ro "gaming" để lấy lịch khám; lộ dữ liệu; cuối cùng phá sản. | Bài học**thất bại**: đừng overclaim, phải xử lý red-flag, đừng giả AI khi chỉ là rule.               | Không build lại — dùng làm cảnh báo về failure/trust.                  |
| **ChatGPT / Gemini (chatbot tổng quát)** | User gõ tự do mô tả triệu chứng → trả lời hội thoại, giải thích, gợi ý nên làm gì. Không có thang triage chuẩn.                                                                                                                      | Linh hoạt, hiểu mô tả tự nhiên; tốt để**chuẩn bị trước/sau khi gặp bác sĩ**.                                                        | Audit BMJ 2026: ~50% câu trả lời health có vấn đề;**undertriage 52% ca cấp cứu**; "nhận ra dấu hiệu nguy hiểm trong giải thích nhưng vẫn trấn an"; nguồn dẫn chỉ ~40% đầy đủ, nhiều citation bịa.  | Học**sức mạnh hội thoại tự nhiên** nhưng phải **bọc** bằng red-flag rule + dẫn nguồn ép buộc. | Có thể dùng LLM làm lõi, nhưng phải thêm guardrail.                    |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:

* Khi nhập triệu chứng sốt và đau họng, Ada Health đặt thêm nhiều câu hỏi để thu thập thông tin trước khi đưa ra kết quả.
* Kết quả cuối cùng dự đoán Flu và COVID-19 tương đối hợp lý, tuy nhiên người dùng khó hiểu vì sao hệ thống lại đưa ra các khả năng đó và mức độ khác nhau giữa chúng.

Insight:

User không chỉ gặp khó ở việc biết mình có thể mắc bệnh gì.

Thật ra họ cần một quá trình trao đổi tự nhiên để mô tả tình trạng của mình và hiểu được lý do đằng sau các đánh giá của hệ thống, vì việc phải trả lời nhiều câu hỏi có cấu trúc và nhận về nhiều khả năng bệnh cùng lúc có thể gây bối rối hoặc thiếu tin tưởng vào kết quả.

Opportunity:

AI có thể giúp bằng cách tự động phân tích triệu chứng từ hội thoại tự nhiên, chủ động hỏi bổ sung các thông tin còn thiếu và giải thích rõ các triệu chứng nào dẫn tới từng nhận định bệnh lý thay vì chỉ hiển thị danh sách kết quả cuối cùng.

```

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [X] Đổi pain statement.
- [ ] Đổi build slice.
- [X] Đổi Auto/Aug decision.
- [X] Đổi 4 paths.
- [X] Đổi failure mode.
- [ ] Đổi owner/test plan.

Ghi rõ 1-2 thay đổi quan trọng:

```text
- Trước evidence, nhóm định xây dựng một AI Health Assistant tập trung vào việc phân loại mức độ nghiêm trọng của triệu chứng (Self-care / See Doctor / Emergency) để hỗ trợ người dùng quyết định có nên đi khám hay không.

Sau evidence, nhóm đổi thành một Conversational Symptom Assessment Assistant, tập trung vào việc thu thập triệu chứng bằng ngôn ngữ tự nhiên, tự động suy luận các thông tin còn thiếu, và đề xuất các bệnh lý có khả năng liên quan cùng mức độ tin cậy.

Lý do:

Trong quá trình self-use với Ada Health, nhóm nhận thấy chất lượng đánh giá của hệ thống khá tốt nhưng trải nghiệm tương tác còn cứng nhắc do phải trả lời nhiều câu hỏi dạng lựa chọn. Các review và observation cũng cho thấy người dùng dễ mất kiên nhẫn với questionnaire dài. Nhóm nhận thấy cơ hội nằm ở việc cải thiện quá trình thu thập triệu chứng thông qua hội thoại tự nhiên thay vì chỉ cải thiện kết quả phân loại cuối cùng.

- Trước evidence, nhóm định sử dụng mô hình Augmentation, trong đó AI chỉ đóng vai trò gợi ý mức độ rủi ro và người dùng tự diễn giải kết quả.

Sau evidence, nhóm chuyển sang Conditional Automation cho bước thu thập triệu chứng, trong đó AI chủ động trích xuất triệu chứng từ hội thoại, xác định thông tin còn thiếu và quyết định câu hỏi tiếp theo cần hỏi.

Lý do:

Qua phân tích các symptom checker hiện tại, phần khó khăn nhất không nằm ở việc hiển thị kết quả mà nằm ở việc thu thập đủ dữ liệu đầu vào để đánh giá. Vì vậy AI cần chủ động điều hướng hội thoại và tự động hóa quá trình khai thác triệu chứng, đồng thời vẫn yêu cầu xác nhận lại các triệu chứng quan trọng nhằm giảm rủi ro hiểu sai.

```
