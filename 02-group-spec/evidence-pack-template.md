# Evidence Pack - MoMo Moni

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:**  
**Track:** Fintech / Tài chính cá nhân  
**Product/app đã chọn:** MoMo - Moni  
**Build slice đang nghĩ:** Quản lý chi tiêu MoMo bằng mục tiêu chi tiêu tối đa, cảnh báo khi user sắp vượt hoặc đã vượt ngân sách, và dự báo khả năng vượt mức dựa trên tốc độ chi tiêu hiện tại.

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| User đã ghi thêm khoản chi `ăn tối 80k` vào danh mục **Ăn uống**. Theo context test, danh mục Ăn uống đã vượt ngân sách, nhưng trong chat Moni chỉ xác nhận đã ghi nhận chi tiêu và hỏi user có muốn xem lại khoản chi gần đây hoặc đặt ngân sách không. Moni không cảnh báo ngay rằng danh mục Ăn uống đã vượt ngân sách. | [Ảnh self-use: Moni ghi nhận ăn tối 80k](../screenshots/selfuse2.jpg) | Failure | Moni đang phản ứng theo kiểu ghi nhận giao dịch đơn lẻ, chưa chủ động kiểm tra trạng thái ngân sách sau giao dịch. Với use case budget, sau mỗi khoản chi mới Moni nên so sánh số đã chi với ngân sách và cảnh báo nếu đã vượt hoặc sắp vượt. |
| Moni có nhận diện đúng giao dịch `ăn tối 80k`, gắn danh mục **Ăn uống** và hiển thị card giao dịch nguồn. | [Ảnh self-use: Moni ghi nhận ăn tối 80k](../screenshots/selfuse2.jpg) | Happy | Moni có khả năng ghi nhận giao dịch và phân loại danh mục. Đây là nền tốt để build tính năng dự báo ngân sách, nhưng cần thêm logic kiểm tra budget, tốc độ chi tiêu và cảnh báo. |
| Từ phần app teardown cá nhân, Moni trả lời tốt câu hỏi `Hôm nay tôi đã chi những khoản nào?`, truy xuất đúng các khoản chi trong ngày và hiển thị bảng giao dịch. | [App teardown cá nhân](../01-invidual-workshop/moni-app-teardown.md) | Happy | Moni làm tốt với câu hỏi rõ, phạm vi thời gian nhỏ và dữ liệu đơn giản. Có thể tận dụng năng lực truy vấn giao dịch để làm budget forecast. |
| Từ phần app teardown cá nhân, khi hỏi tổng hợp phức tạp hơn, Moni có lúc thiếu source giao dịch hoặc trả lời không nhất quán với lịch giao dịch thực tế. | [App teardown cá nhân](../01-invidual-workshop/moni-app-teardown.md) | Low-confidence / Failure / Correction | Với dữ liệu tài chính, mọi cảnh báo hoặc dự báo phải có filter, công thức tính và source transactions để user kiểm chứng. |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Phần quản lý chi tiêu hơi kém, dù đã vượt mức ngân sách vẫn không có cảnh báo." | [Ảnh review Google Play](../screenshots/image.png) | Người dùng MoMo có sử dụng phần quản lý chi tiêu/ngân sách. Review 2 sao ngày 03/06/2026. | User kỳ vọng app phải cảnh báo khi vượt ngân sách. Failure mode là hệ thống có dữ liệu ngân sách và giao dịch nhưng không phát hiện/cảnh báo đúng lúc, làm user chỉ biết vấn đề sau khi tự kiểm tra. |
| Review cho thấy pain không chỉ là "xem lại đã chi bao nhiêu", mà là thiếu cảnh báo chủ động khi hành vi chi tiêu đã đi chệch ngân sách. | [Ảnh review Google Play](../screenshots/image.png) | User quản lý chi tiêu cá nhân, có nhu cầu kiểm soát ngân sách theo danh mục. | Cảnh báo ngân sách hiện tại chưa đủ chủ động. Đây là bằng chứng trực tiếp ủng hộ build slice: Moni dự báo/ngăn vượt ngân sách trước cuối tháng. |
| Self-use và review bên ngoài cùng chỉ ra một pattern: sau khi phát sinh giao dịch làm ngân sách xấu đi, Moni chưa biến dữ liệu đó thành cảnh báo hoặc next action. | [Self-use](../screenshots/selfuse2.jpg), [Google Play review](../screenshots/image.png) | User đang dùng MoMo để theo dõi chi tiêu và kỳ vọng app hỗ trợ kiểm soát ngân sách. | Failure mode chính: budget overrun is silent. User vượt hoặc sắp vượt ngân sách nhưng không được cảnh báo kịp thời, không có dự báo hoặc kế hoạch giảm chi cụ thể. |

Nếu chưa có thêm nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng phỏng vấn nhanh 3 người dùng MoMo có theo dõi chi tiêu cá nhân trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| Money Lover | Cho phép user đặt ngân sách theo danh mục hoặc theo tháng; theo dõi mức đã chi so với ngân sách. | Budget tracking cần cho user thấy đã dùng bao nhiêu % ngân sách, còn lại bao nhiêu và trạng thái an toàn/nguy cơ. | Có. Prototype có thể làm ngân sách tháng 10.000.000đ và tính số đã chi, % ngân sách, mức còn lại. |
| YNAB | Tập trung vào việc mỗi khoản tiền có mục đích; khi chi vượt kế hoạch, user cần điều chỉnh lại ngân sách hoặc hành vi. | App tài chính tốt không chỉ báo cáo quá khứ, mà giúp user ra quyết định tiếp theo. | Có một phần. Prototype có thể đề xuất mức nên chi mỗi ngày/tuần để quay lại kế hoạch. |
| Mint / Rocket Money | Theo dõi chi tiêu theo danh mục, phát hiện xu hướng hoặc khoản chi bất thường, gửi cảnh báo khi gần vượt ngân sách. | Cảnh báo nên đến trước khi user vượt ngân sách, không phải sau khi đã vượt. Khoản chi bất thường cần được xử lý riêng. | Có. Prototype có thể dự báo cuối tháng dựa trên tốc độ chi hiện tại và hỏi user đánh dấu khoản chi bất thường. |
| MoMo Moni hiện tại | Có thể ghi nhận/truy vấn giao dịch, nhưng chưa cảnh báo ngay khi khoản chi làm ngân sách vượt mức. | Với dữ liệu tài chính, mọi dự báo/cảnh báo cần có filter, công thức tính và giao dịch nguồn để user tin. | Có. Prototype cần hiển thị: ngân sách, đã chi, tốc độ chi, dự báo cuối tháng, mức nên chi/ngày và source transactions. |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:

Từ self-use với Moni, AI có thể ghi nhận giao dịch và phân loại đúng danh mục. Tuy nhiên, ngay cả khi khoản chi mới làm ngân sách xấu đi, Moni chỉ xác nhận giao dịch chứ không cảnh báo. Review Google Play cũng nêu pain tương tự: phần quản lý chi tiêu kém vì dù đã vượt mức ngân sách vẫn không có cảnh báo.

Insight:
User không chỉ cần xem lại mình đã chi bao nhiêu.
Thật ra họ cần biết sớm tốc độ chi hiện tại có làm vượt ngân sách tháng hay không,
vì nếu chỉ phát hiện khi đã tiêu quá nhiều thì rất khó điều chỉnh phần còn lại của tháng.

Opportunity:
AI có thể giúp bằng cách tính tốc độ chi tiêu hiện tại,
dự báo tổng chi cuối tháng,
cảnh báo khi sắp vượt hoặc đã vượt ngân sách,
và đề xuất mức nên chi mỗi ngày/tuần để user quay lại kế hoạch.
```

## 6. Evidence đổi SPEC như thế nào?

- [x] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [x] Đổi Auto/Aug decision.
- [x] Đổi 4 paths.
- [x] Đổi failure mode.
- [x] Đổi owner/test plan.

Ghi rõ 1-2 thay đổi quan trọng:

```text
Trước evidence, nhóm định:
Build một tính năng quản lý chi tiêu chung hoặc chỉ phân tích user chi nhiều nhất vào đâu.

Sau evidence, nhóm đổi thành:
Chỉ build một lát cắt nhỏ: user đặt mức chi tiêu tối đa 10.000.000đ/tháng; Moni tính tốc độ chi tiêu, dự báo nguy cơ vượt ngân sách, cảnh báo số tiền có thể vượt và gợi ý mức nên chi mỗi ngày/tuần.

Lý do:
Evidence cho thấy pain mạnh không nằm ở việc xem lại biểu đồ/category, mà ở việc user không được cảnh báo đủ sớm khi tốc độ chi tiêu vượt kế hoạch.
```

```text
Trước evidence, nhóm định:
AI chỉ báo cáo hoặc nhắc chung chung rằng user nên tiết kiệm hơn.

Sau evidence, nhóm đổi thành:
AI phải đưa cảnh báo có số liệu cụ thể: ngân sách tháng, đã chi, tốc độ hiện tại, dự báo cuối tháng, số tiền có thể vượt và mức nên chi/ngày trong phần còn lại của tháng.

Lý do:
Nếu AI chỉ nói "hãy tiết kiệm hơn", user không biết cần làm gì tiếp. SPEC cần biến cảnh báo thành decision support có thể hành động.
```

## 7. Ghi chú từ draft evidence khác: voice input + preview transcript

Một draft evidence khác của nhóm đề xuất build slice:

```text
Voice input có bước xác nhận trước khi gửi:
user nói -> AI hiện transcript để xem lại -> user sửa / huỷ / gửi.
```

Evidence chính của draft này:

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi gõ/hỏi chatbot, lỡ ấn nút gửi là prompt đi luôn, không có nút dừng/huỷ/thu hồi để chặn câu vừa gửi nhầm. | Cần bổ sung screenshot ô chat khi gửi. | Failure / Correction | User không có cách recover khi gửi nhầm; với app tài chính, gửi nhầm câu hỏi/ngữ cảnh sai gây khó chịu và mất niềm tin. |
| App không có speech-to-text, không thể nói nội dung, bắt buộc phải gõ tay từng chữ. | Cần bổ sung screenshot thanh nhập liệu không có icon mic. | Happy / Input friction | Chỉ riêng việc gõ đã đủ làm user lười và bỏ cuộc. Voice + preview transcript có thể giảm ma sát nhập liệu. |

Finding của draft này:

```text
Khi user muốn hỏi nhanh nhưng đang bận tay,
product bắt buộc gõ tay và không có nút dừng/sửa khi lỡ gửi,
hậu quả là user ngại nhập, gõ sai phải làm lại, hoặc bỏ luôn ý định hỏi.
Lỗi thuộc layer UX / Input + UX Recovery.
Nên sửa bằng voice-to-text + bước preview transcript cho phép sửa/huỷ trước khi gửi.
```

Ghi chú quyết định:

```text
Draft voice input có evidence riêng và có thể trở thành build slice khác.
Tuy nhiên, nếu nhóm chốt build slice "giới hạn chi tiêu", phần voice input nên để backlog hoặc proposal phụ,
vì nó giải quyết pain ở khâu nhập liệu, không trực tiếp giải quyết pain cảnh báo ngân sách.
```
