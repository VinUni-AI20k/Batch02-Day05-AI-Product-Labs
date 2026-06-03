# Evidence Pack

## 1. Nhóm và track

**Tên nhóm:** [Điền tên nhóm]  
**Track:** Food & Local Delivery  
**Product/app đã chọn:** Tính năng gợi ý quán ăn theo vị trí (Location-based Food Recommendation)  
**Build slice đang nghĩ:** Cho khách du lịch đến địa điểm lạ đang tìm quán ăn, prototype dùng AI để hỏi 2-3 câu về nhu cầu cá nhân (ngân sách, khẩu vị, đi mấy người) và gợi ý 3 quán ăn phù hợp nhất gần vị trí của họ, đồng thời cho biết lý do tại sao lại gợi ý quán này.  

## 2. Self-use evidence

Nhóm tự đóng vai khách du lịch dùng các app hiện tại (Google Maps, ShopeeFood, GrabFood) tại một khu vực lạ và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi tìm "quán ăn ngon" trên app, kết quả ra rất nhiều và lẫn lộn, khó biết cái nào hợp với mình | [Chèn hình] | Failure | Tìm kiếm quá chung chung khiến user bị ngợp (choice overload). |
| Đọc review tốn nhiều thời gian, review khen chê lẫn lộn khó quyết định | [Chèn hình] | Low-confidence | User cần một sự tóm tắt nhanh chóng và đáng tin cậy hơn là tự đọc hàng chục review. |

## 3. User / review / social evidence

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Đến Đà Lạt không biết ăn gì, lên group hỏi thì mỗi người chỉ một quán, rối càng thêm rối." | Group review du lịch | Khách du lịch tự túc | Không xác định được quán ăn phù hợp nhu cầu cá nhân giữa quá nhiều luồng thông tin. |
| "Mở app lên tìm đồ ăn toàn ra quán quen ở nhà, không biết đặc sản địa phương ở đâu ngon." | App Store review | Khách du lịch | Thiếu tính năng cá nhân hóa theo địa điểm du lịch (context-aware). |

```text
Đây là giả định ban đầu dựa trên bài toán nhóm đặt ra. Nhóm sẽ kiểm chứng bằng việc phỏng vấn nhanh 3-5 khách du lịch hoặc xem review trên các group du lịch trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| Google Maps | Gợi ý dựa trên rating và category. | Cần có bộ lọc tốt nhưng AI chưa thực sự giao tiếp để hiểu ý định sâu của user. | Không (đòi hỏi data lớn). |
| Tripadvisor | Xếp hạng theo "Traveler's Choice". | Gắn mác uy tín để tăng trust. | Có (có thể cho AI gán nhãn lý do gợi ý). |

## 5. Evidence -> Insight

```text
Evidence nổi bật nhất:
User bị ngợp bởi thông tin (quá nhiều quán, quá nhiều review trái chiều) và tốn nhiều thời gian tìm hiểu khu vực lạ.

Insight:
Khách du lịch không chỉ cần [một danh sách các quán ăn xung quanh].
Thật ra họ cần [sự hỗ trợ ra quyết định nhanh chóng, cá nhân hóa theo khẩu vị/ngân sách và đáng tin cậy],
vì họ [không quen thuộc khu vực và sợ trải nghiệm tệ làm hỏng chuyến đi].

Opportunity:
AI có thể giúp bằng cách [augment hành động tìm kiếm: thay vì user tự lọc, AI chủ động hỏi nhu cầu và tóm tắt lý do chọn quán].
```

## 6. Evidence đổi SPEC như thế nào?

- [x] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [ ] Đổi Auto/Aug decision.
- [ ] Đổi 4 paths.
- [ ] Đổi failure mode.
- [ ] Đổi owner/test plan.

Ghi rõ 1-2 thay đổi quan trọng:

```text
Trước evidence, nhóm định: Xây dựng một tính năng search chung chung cho mọi user tìm quán ăn.
Sau evidence, nhóm đổi thành: Tập trung hẹp vào "Khách du lịch" (những người không rành đường) và dùng AI đóng vai trò Local Guide gợi ý cá nhân hóa.
Lý do: Để tính năng có giá trị và phân biệt được với Google Maps hay search thông thường.
```
