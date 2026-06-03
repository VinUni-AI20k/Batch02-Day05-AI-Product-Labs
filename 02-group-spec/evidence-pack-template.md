# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** AI Food Recommendation Team  
**Track:** AI Augmentation for Food Choice  
**Product/app đã chọn:** AI Food Recommendation (Mini Hackathon Project)  
**Build slice đang nghĩ:** Gợi ý món ăn dựa trên mô tả tự nhiên của người dùng  

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi người dùng nhập mô tả mơ hồ, hệ thống không hiểu ngữ cảnh và trả về kết quả không phù hợp. | [link-placeholder](https://example.com/screenshot1) | `Topic.md` – Problem Statement | Cần cải thiện khả năng hiểu ngữ cảnh (context) và mood. |
| Khi đề xuất món ăn, một số đề xuất vượt quá bán kính 3km, gây thất vọng. | [link-placeholder](https://example.com/screenshot2) | `Topic.md` – Failure Modes | Áp dụng hard filter theo bán kính để tránh đề xuất quá xa. |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Không biết ăn gì, app luôn đưa ra những món không phù hợp với vị trí." | App Store Review | Văn phòng nhân viên tại Quận 1 | Gợi ý món quá xa / không hiểu context |
| "Mô tả "thanh đạm" nhưng nhận được món cay." | Người dùng phỏng vấn | Nhân viên văn phòng | Không hiểu intent và mood |

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| Google Maps "Nearby" suggestions | Dùng vị trí GPS + filter khoảng cách | Hard distance filter, location based suggestions | ✅ |
| Yelp "Food Recommendations" | Kết hợp review, rating, thuật toán lọc | Use of rating & review to refine suggestions | ✅ |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:
- Người dùng muốn đề xuất nhanh gắn với ngữ cảnh (vị trí, mood) nhưng hiện tại hệ thống thiếu contextual awareness.
Insight:
- Cần thêm mô-đun phân tích context (weather, location, mood) và áp dụng rule‑based conflict checking (ví dụ: fasting khi khám y tế).
Opportunity:
- AI có thể giúp bằng cách augment việc lọc và sắp xếp đề xuất dựa trên context và các ràng buộc thực tế.
```

## 6. Evidence đổi SPEC như thế nào?

- [ ] Đổi user chính.
- [ ] Đổi pain statement.
- [ ] Đổi build slice.
- [ ] Đổi Auto/Aug decision.
- [ ] Đổi 4 paths.
- [ ] Đổi failure mode.
- [ ] Đổi owner/test plan.

Ghi rõ 1-2 thay đổi quan trọng:

```text
Trước evidence, nhóm định tập trung vào chỉ đề xuất món ăn dựa trên từ khóa.
Sau evidence, nhóm đổi thành sử dụng context (location, mood, thời gian) để tạo ra đề xuất có tính cá nhân hoá cao hơn.
Lý do: Đáp ứng được pain point "không biết ăn gì" và giảm thất vọng khi đề xuất quá xa.
```
