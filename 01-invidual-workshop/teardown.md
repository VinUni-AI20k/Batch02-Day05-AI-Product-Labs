# NEO — Chatbot Evaluation Report

**Thời gian thử:** 6 sessions · **Happy paths:** 4/6

Tóm tắt: Đánh giá nhanh NEO (Vietnam Airlines) — chatbot xử lý đặt vé và hỗ trợ hành khách. Trong 6 lượt test, 4 là happy paths, 1 low-confidence, 1 hard failure khi chatbot không thực hiện hành động mặc dù đã có đủ thông tin.

## Summary Stats

- Test sessions: 6
- Happy: 4
- Low-confidence: 1
- Failure (hard): 1

## Session Queries (tóm tắt)

1. "Đặt vé từ HN về Đà Nẵng, 2 người, cuối tuần" — Happy: NEO collect đủ thông tin và show lựa chọn.
2. "Tôi muốn đổi hành lý xách tay" — Low-confidence: NEO phản hồi mơ hồ, đề xuất liên hệ hotline.
3. "Hủy vé do thay đổi kế hoạch" — Happy: Hướng dẫn đúng quy trình, link chuyển trang thanh toán.
4. "Bao nhiêu ký hành lý được miễn phí" — Happy: Trả lời chính xác, kèm ví dụ.
5. "Tôi muốn đặt cho người khác, nhưng không có email" — Failure: NEO yêu cầu thao tác trên web thay vì hỗ trợ trong chat.
6. "Làm sao đổi tên hành khách" — Happy: Hướng dẫn, show phí và các bước.

Evidence được lưu: log các prompt, screenshot đoạn hội thoại, note lỗi Q5.

## Observed Patterns

- Strengths: trả lời nhanh với câu hỏi rõ ràng; format message thân thiện; có link dẫn đến chức năng web.
- Weakness: khi đã thu thập đủ dữ liệu giao dịch, chatbot đôi khi trả lời bằng hướng dẫn chung thay vì thực hiện hành động (Q5).
- Recovery: thiếu low-confidence path rõ ràng — thường hiển thị hướng dẫn chứ không hỏi lại user để xác nhận thông tin.

## As-Is Flow (ví dụ: đặt vé qua chat)

1. User: "Đặt vé Đà Nẵng, 2 pax, cuối tuần"
2. NEO: hỏi ngày/giờ/loại vé (collect)
3. User trả lời → NEO show tuỳ chọn chuyến
4. User chọn nhưng NEO hướng dẫn làm trên website thay vì tiếp tục thanh toán trong chat (point of failure)

Main problem: hệ thống promise khả năng giao dịch qua chat nhưng thực tế không chuyển người dùng đến bước thực thi khi đã đủ dữ liệu.

## To-Be (proposed)

- Rule: Khi NEO đã có đủ thông tin đặt vé, phải đưa ra action rõ ràng: thực hiện booking, chuyển tới payment flow, hoặc hỏi xác nhận cuối cùng.
- Nếu không thể hoàn tất trong chat, hiển thị explicit fallback + pre-filled link/transaction id, và offer human handoff.
- Thêm low-confidence check: khi model không chắc, present 2–3 options để user chọn thay vì trả về hướng dẫn chung.

## Product Decision

"Khi NEO đã thu thập đủ thông tin cho một giao dịch, chatbot phải chuyển người dùng sang bước thực hiện giao dịch ngay lập tức — thay vì trả về hướng dẫn chung hoặc yêu cầu làm lại trên website."

Principle: Đã đủ dữ liệu → phải có hành động tiếp theo.

Tags: intent, UX recovery, fallback, human-handoff

## Actions / Requirements

- Implement: auto-transition to payment flow when required fields are present.
- UX: add confirm step UI + pre-filled web link if chat cannot process payment.
- Test case: simulate Q5 to verify end-to-end booking or explicit handoff.

## Checklist

- [x] Có ít nhất 1 screenshot/observation.
- [x] Có đủ 4 paths (Happy / Low-confidence / Failure / Correction) mô tả.
- [x] Finding được viết thành product decision.
- [ ] Sketch as-is & to-be (đính kèm file hình nếu cần).
- [x] Có một câu nói rõ finding sẽ đổi gì trong SPEC.

