# Toolkit — Từ Evidence Đến Build Slice (Đã hoàn thiện)

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm

Gom theo **workflow/pain**, không gom theo tên feature.

- **Cụm 1: Tê liệt vì quá nhiều gợi ý không liên quan** (Choice paralysis do danh sách đề xuất mặc định của app giống quảng cáo hoặc không trúng nhu cầu).
- **Cụm 2: Không có cách diễn đạt ý định mơ hồ** (Không thể tìm kiếm các từ khóa mang tính cảm xúc/ngữ cảnh như "nóng nóng", "nhẹ bụng", "rẻ rẻ" trên thanh tìm kiếm thông thường).
- **Cụm 3: Sợ mất tiền/mất kiểm soát khi tự động đặt đơn** (Người dùng muốn tự mình kiểm tra và đặt hàng thay vì để AI quyết định hoàn toàn).

## 2. Viết insight

```text
User [người dùng mở ShopeeFood khi đang đói] không chỉ cần [thêm các danh sách gợi ý ngẫu nhiên hay quảng cáo].
Họ thật ra cần [sự hỗ trợ thu hẹp lựa chọn nhanh chóng và cung cấp lý do thuyết phục dựa trên ý định mơ hồ của họ],
vì [họ dễ bị tê liệt lựa chọn trước hàng trăm quán ăn và mất lòng tin khi danh sách gợi ý mặc định không hiểu ý họ].
```

## 3. Viết opportunity

```text
Cơ hội là dùng AI để [augment hành động lọc và chọn quán bằng cách chat tự nhiên],
giúp user [nhanh chóng có được 3 gợi ý món/quán kèm lý do ngắn gọn và mở trang đặt đơn chỉ bằng một chạm],
trong khi vẫn kiểm soát [rủi ro ảo tưởng thông tin hoặc đề xuất quán đóng cửa bằng cách xác thực lại danh sách ở tầng code].
```

## 4. Chọn build slice

Build slice tốt phải qua 5 câu hỏi:

| Câu hỏi | Đạt khi | Đánh giá cho ShopeeFood Chatbot MVP |
|---|---|---|
| **User cụ thể chưa?** | Nói được ai dùng, trong bối cảnh nào. | **Đạt:** Người dùng đang đói, chưa biết ăn gì, đang mở ShopeeFood. |
| **Task đủ hẹp chưa?** | Demo được trong 3-5 phút. | **Đạt:** Chỉ thực hiện 1 luồng: Nhập ý định mơ hồ -> Nhận 3 gợi ý kèm lý do -> Bấm 1-chạm để mở quán. |
| **AI decision rõ chưa?** | AI gợi ý/tự làm một việc cụ thể. | **Đạt:** AI lựa chọn ra tối đa 3 món/quán phù hợp nhất từ danh sách quán thực tế và viết dòng lý do. |
| **Failure path rõ chưa?** | Có một case AI không chắc hoặc sai để test. | **Đạt:** Có kịch bản xử lý low-confidence (TC-03) và ảo tưởng thông tin (TC-07). |
| **Có evidence không?** | Có bằng chứng từ self-use/review/user/competitor. | **Đạt:** Đang ở dạng giả thuyết (Draft v0.1), cần bổ sung kết quả phỏng vấn và review thực tế. |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Quyết định | Phân tích dự án ShopeeFood Chatbot MVP |
|---|---|---|
| Evidence yếu, user mơ hồ | Dừng build sâu; quay lại research 20 phút. | Nhóm cần phỏng vấn 5-7 người để củng cố giả thuyết trước Day 06. |
| Ý tưởng quá rộng | Giữ domain, cắt xuống một flow. | Giữ scope ở mức tối giản (Augment chọn quán, không can thiệp đặt đơn/thanh toán). |
| AI không cần thiết | Dùng rule/manual prototype; ghi rõ vì sao không dùng AI sâu. | AI là cần thiết để hiểu ngôn ngữ tự nhiên phi cấu trúc (ví dụ: "nóng nóng, rẻ rẻ"). |
| Rủi ro cao | Chọn augmentation hoặc conditional automation. | Chọn **Augmentation** vì đặt món ăn liên quan đến tiền bạc và khẩu vị cá nhân. |
| Không demo được trong 1 ngày | Đưa phần lớn vào backlog, giữ một path nhỏ. | Thiết kế tối giản, bỏ qua thanh toán/profile dài hạn giúp đảm bảo demo được trong 1 ngày. |

## 6. Câu chốt cuối

Điền câu này trước khi rời lớp:

```text
Dựa trên [giả thuyết người dùng bị tê liệt lựa chọn và thiếu cách tìm kiếm theo ý định mơ hồ],
nhóm sẽ build [chatbot gợi ý món ăn (MVP 3 thẻ gợi ý + 1-chạm mở quán)],
cho [người dùng ShopeeFood chưa biết ăn gì cụ thể],
để giải quyết [sự mệt mỏi khi lướt tìm kiếm vô định rồi thoát app không đặt hàng],
bằng cách AI [augment việc ra quyết định chọn món qua việc gợi ý kèm lý do thuyết phục],
và sẽ test failure path [AI ảo tưởng đề xuất món không có trong danh sách được xử lý bằng code kiểm tra].
```

## 7. Backlog

Những thứ **không build trong Day 06**:

- Tự động đặt đơn / thanh toán đơn hàng (Automate order).
- Chức năng đặt đơn nhóm, chia tiền.
- Gợi ý dinh dưỡng/y tế chuyên sâu.
- Lưu trữ lịch sử khẩu vị dài hạn (trí nhớ đa phiên).
- Tìm kiếm bằng giọng nói, hình ảnh hoặc đa ngôn ngữ.
