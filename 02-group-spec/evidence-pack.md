# Evidence Pack — Chatbot gợi ý món ăn cho ShopeeFood

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** [Cần điền thủ công]  
**Track:** [Cần điền thủ công]  
**Product/app đã chọn:** ShopeeFood  
**Build slice đang nghĩ:** Chatbot gợi ý món ăn dựa trên ý định mơ hồ bằng ngôn ngữ tự nhiên (MVP trả về 3 gợi ý kèm lý do và nút 1-chạm mở quán).

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Danh sách "Gợi ý cho bạn" hiện tại không khớp với ý định mơ hồ của người dùng (ví dụ: muốn ăn món gì nóng, rẻ, gần đây). | [Cần điền thủ công] | Happy / Low-confidence | Đề xuất mặc định quá chung chung hoặc giống quảng cáo, làm người dùng mất lòng tin và mất thời gian lướt vô định. |
| Tính năng Search chỉ tìm theo keyword cứng, không hiểu ý định phức tạp/mơ hồ như "dưới 50k, không cay, ăn nhẹ". | [Cần điền thủ công] | Happy / Low-confidence | Cần cơ chế xử lý ngôn ngữ tự nhiên để hiểu ý định phi cấu trúc và kết hợp ngữ cảnh thực tế (vị trí, thời gian). |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] |
| [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] |
| [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng [phỏng vấn nhanh 5–7 người, đào review App Store/CH Play, và quan sát trực tiếp 3–5 người đặt đồ ăn] trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] | [Cần điền thủ công] |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:
[Không có sẵn trong spec.md - Cần bổ sung từ kết quả nghiên cứu thực tế]

Insight:
User không chỉ gặp [vấn đề lựa chọn món ăn quá tải (Choice paralysis)].
Thật ra họ cần [sự hỗ trợ ra quyết định nhanh chóng, đáng tin cậy và hiểu được nhu cầu mơ hồ bằng ngôn ngữ tự nhiên của họ].

Opportunity:
AI có thể giúp bằng cách [đọc hiểu ý định mơ hồ bằng ngôn ngữ tự nhiên + ngữ cảnh vị trí/thời gian để gợi ý tối đa 3 món/quán phù hợp nhất kèm dòng giải thích lý do thuyết phục].
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
