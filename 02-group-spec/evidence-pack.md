# Evidence Pack — Chatbot gợi ý món ăn cho ShopeeFood

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** Naughty girls
**Track:** Food & Local Delivery
**Product/app đã chọn:** ShopeeFood  
**Build slice đang nghĩ:** Chatbot gợi ý món ăn / quán gần đây từ ý định mô tả bằng ngôn ngữ tự nhiên (vd: "đói, muốn món nóng dưới 50k gần đây"). AI trả về tối đa 3 gợi ý có thật kèm lý do ngắn; người dùng tự bấm 1-chạm để mở quán và đặt — AI gợi ý, người quyết (Augment).

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Danh sách "Gợi ý cho bạn" hiện tại không khớp với ý định mơ hồ của người dùng (ví dụ: muốn ăn món gì nóng, rẻ, gần đây). | <img width="725" height="367" alt="image" src="https://github.com/user-attachments/assets/b9d61623-d40d-4c67-b76a-063894ec2cdc" /> | Happy / Low-confidence | Đề xuất mặc định quá chung chung hoặc giống quảng cáo, làm người dùng mất lòng tin và mất thời gian lướt vô định. |
| Tính năng Search chỉ tìm theo keyword cứng, không hiểu ý định phức tạp/mơ hồ như "dưới 50k, không cay, ăn nhẹ". | <img width="712" height="315" alt="image" src="https://github.com/user-attachments/assets/ecce1fde-f721-448c-a03e-4f12169708c8" /> | Happy / Low-confidence | Cần cơ chế xử lý ngôn ngữ tự nhiên để hiểu ý định phi cấu trúc và kết hợp ngữ cảnh thực tế (vị trí, thời gian). |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Chạy quảng cáo ạ" (chấm độ tin cậy mục Gợi ý 1/5) | Khảo sát nhóm (Google Form, n=13) | NVVP, đặt 3–4 lần/tuần | P2 — Không tin mục gợi ý, coi là quảng cáo tài trợ |
| "Có khi gợi ý món thích ăn, có khi gợi ý món không thích" (tin cậy 3/5) | Khảo sát nhóm (n=13) | Sinh viên, đặt hằng ngày | P2 — Gợi ý thiếu nhất quán, không bám gu |
| "Vì gợi ý toàn quán ở xa" (tin cậy 4/5) | Khảo sát nhóm (n=13) | Sinh viên, đặt 3–4 lần/tuần | P2 — Gợi ý không tính bán kính giao |
| "Quán xa, nhiều món không hợp ý" | Khảo sát nhóm (n=13) | NVVP, đặt 1–2 lần/tuần | P2 — Gợi ý vừa xa vừa lệch gu |
| 10/13 người "thỉnh thoảng" đến "rất thường xuyên" mở app rồi thoát ra không đặt | Khảo sát nhóm, tổng hợp (n=13) | Hỗn hợp NVVP/SV | P1 — Bỏ giữa chừng do quá tải lựa chọn |
| 12/13 không thỏa mãn khi gõ câu mô tả tự nhiên (8 chưa thử vì nghĩ app không hiểu, 4 thử bị lỗi/lệch); chỉ 1 ra đúng | Khảo sát nhóm, tổng hợp (n=13) | Hỗn hợp NVVP/SV | P3 — Search keyword không xử lý được ý định mơ hồ |
| Lý do thoát app phổ biến nhất: "quán muốn ăn thì xa/ship cao, quán gần không có món ưng" và "quá nhiều quán, không biết chọn" | Khảo sát nhóm, tổng hợp (n=13) | Hỗn hợp NVVP/SV | P1 + ràng buộc khoảng cách/giá |

```text
Nguồn: khảo sát của nhóm (Google Form, n=13, mẫu thuận tiện, dữ liệu pilot — đang tiếp tục thu). Đây là phản hồi từ người dùng thật ngoài nhóm, không phải giả định. Trước M1 Day 06 sẽ bổ sung review App Store/CH Play, comment group Facebook và phỏng vấn sâu 5–7 người.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| **Spotify "Made For You" / Netflix "Because you watched"** — analog đề xuất | Đề xuất số lượng giới hạn, kèm lý do ("vì bạn đã nghe/xem X") | Curated top-N + giải thích lý do → tăng niềm tin, bớt cảm giác quảng cáo (đúng pain P2) | CÓ — bắt LLM trả tối đa 3 gợi ý + 1 dòng lý do là việc của prompt |
| **Domino's "Dom" / Starbucks "My Starbucks Barista"** — analog bot đặt món | Bot nhận order bằng ngôn ngữ tự nhiên/giọng nói qua Messenger hoặc trong app ([Botpress](https://botpress.com/blog/chatbot-for-restaurants)), nhớ "món quen" | Hội thoại thay menu; "đặt món quen" = predictive reorder. Lưu ý: họ là 1 thương hiệu, đơn giản hơn marketplace nhiều quán | Một phần — luồng chat nhận intent: CÓ; tự đặt/thanh toán: KHÔNG (mình giữ Augment) |
| **ChatGPT / trợ lý LLM tổng quát** — chính là "động cơ" | Mô tả mơ hồ → LLM gợi ý + lý do, hỏi lại khi thiếu thông tin | Cơ chế clarify khi low-confidence (đúng SPEC). Nhược điểm: không biết quán nào CÓ THẬT quanh bạn | CÓ — đây chính là cách dựng MVP: LLM + feed danh sách quán thật + ràng buộc chỉ chọn trong danh sách |
| **ShopeeFood "Gợi ý cho bạn" hiện tại** — baseline cần vượt | Danh mục gợi ý tĩnh ở trang chủ, không nhận mô tả tự nhiên, không nêu lý do | (Phản diện) Bị xem như quảng cáo, ít tin — khảo sát: 10/13 chấm tin cậy ≤3/5 → khoảng trống để khác biệt | N/A (mốc so sánh) |
## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:
- 12/13 người KHÔNG tìm được món khi gõ ý định mô tả tự nhiên: 8 người "chưa từng thử vì biết app sẽ không hiểu", 4 người "thử nhưng app báo lỗi / ra quán không liên quan", chỉ 1 người ra đúng. (P3)
- 10/13 người "thỉnh thoảng" đến "rất thường xuyên" mở app rồi thoát ra không đặt. (P1)
- 10/13 chấm độ tin cậy mục "Gợi ý cho bạn" ≤3/5; quote: "Chạy quảng cáo ạ", "gợi ý toàn quán ở xa". (P2)
- Lý do bỏ đơn lặp nhiều nhất: "quán muốn ăn thì xa/ship cao, quán gần thì không có món ưng ý".
(Nguồn: khảo sát nhóm, Google Form, n=13 — dữ liệu pilot, mẫu thuận tiện.)

Insight:
User không chỉ gặp vấn đề lựa chọn món ăn quá tải (Choice paralysis - P1).
Rào cản lớn nhất thực ra là họ không có cách diễn đạt nhu cầu MƠ HỒ với nhiều ràng buộc cùng lúc ("gần + rẻ + hợp gu") — search keyword không hiểu, nên phần lớn bỏ cuộc hoặc nhận kết quả lệch. Họ cần nói bằng ngôn ngữ tự nhiên và nhận lại gợi ý CÓ GIẢI THÍCH để đủ tin mà quyết.

Opportunity:
AI có thể giúp bằng cách đọc hiểu ý định mơ hồ bằng ngôn ngữ tự nhiên + ngữ cảnh vị trí/thời gian, ưu tiên đúng bán kính giao và tầm giá, để gợi ý tối đa 3 món/quán phù hợp nhất kèm dòng giải thích lý do thuyết phục (chống cảm giác "quảng cáo").
```

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [ ] Đổi pain statement.
- [ ] Đổi build slice.
- [ ] Đổi Auto/Aug decision.
- [ ] Đổi 4 paths.
- [ ] Đổi failure mode.
- [ ] Đổi owner/test plan.

*(Lưu ý: Đánh dấu [x] vào các mục tương ứng sau khi có kết quả research thực tế)*

Ghi rõ 1-2 thay đổi quan trọng:

```text
Trước evidence, nhóm định... [Xây dựng chatbot gợi ý món ăn dựa trên giả thuyết người dùng bị tê liệt lựa chọn và không tìm được món theo ý định mơ hồ]
Sau evidence, nhóm đổi thành... [Giữ nguyên theo spec.md hiện tại hoặc cần cập nhật sau khi có kết quả research thực tế]
Lý do: [Chưa tiến hành research thực tế để đối chiếu, hiện tại spec.md đang ở dạng Draft v0.1]
```
