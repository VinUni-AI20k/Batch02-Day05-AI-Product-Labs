# Toolkit - Từ Evidence Đến Build Slice

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm

Gom theo **workflow/pain**, không gom theo tên feature.

Cụm evidence nhóm đang theo:

- "Vượt hoặc sắp vượt ngân sách nhưng không được cảnh báo"
- "Chỉ biết vấn đề khi đã tiêu quá nhiều"
- "Không biết cần giảm chi bao nhiêu để quay lại kế hoạch"
- "Khoản chi bất thường làm dự báo sai"

Cụm evidence khác từ draft voice input:

- "Không có speech-to-text, phải gõ tay"
- "Lỡ gửi prompt thì không có nút dừng/huỷ/sửa"
- "User cần cảm giác kiểm soát trước khi gửi câu hỏi cho AI tài chính"

Ghi chú:

```text
Nếu nhóm chọn build slice giới hạn chi tiêu, cụm voice input nên để backlog/proposal phụ.
Nếu nhóm chọn build slice voice input, cần đổi lại pain statement, build slice và four paths.
```

## 2. Viết insight

Insight chính cho build slice giới hạn chi tiêu:

```text
Người dùng MoMo không chỉ cần xem lại mình đã chi bao nhiêu.
Họ thật ra cần biết sớm tốc độ chi hiện tại có làm vượt ngân sách tháng hay không,
vì nếu chỉ phát hiện khi đã tiêu quá nhiều thì rất khó điều chỉnh phần còn lại của tháng.
```

Insight phụ từ draft voice input:

```text
User không chỉ gặp khó khi gõ chữ.
Họ cần một cách nhập liệu ít ma sát và có cảm giác kiểm soát trước khi gửi cho AI,
vì đây là app tài chính nên gửi nhầm câu hỏi/ngữ cảnh sai có thể làm mất niềm tin.
```

## 3. Viết opportunity

Opportunity chính:

```text
Cơ hội là dùng AI để tính tốc độ chi tiêu hiện tại,
dự báo tổng chi cuối tháng,
cảnh báo khi sắp vượt hoặc đã vượt ngân sách,
và gợi ý mức nên chi mỗi ngày/tuần để user quay lại kế hoạch.
```

Opportunity phụ nếu nhóm đổi sang voice input:

```text
Cơ hội là dùng AI để chuyển giọng nói thành text,
hiện transcript cho user xem lại,
và cho user sửa/huỷ/gửi trước khi câu hỏi được gửi vào chatbot.
```

## 4. Chọn build slice

Build slice chính:

```text
Cho người dùng MoMo đặt mức chi tiêu tối đa 10.000.000đ/tháng,
prototype dùng AI để tính tốc độ chi tiêu, dự báo nguy cơ vượt ngân sách,
tạo ra cảnh báo kèm số tiền dự báo cuối tháng và mức nên chi mỗi ngày/tuần,
và xử lý khoản chi bất thường bằng flow cho user đánh dấu ngoại lệ để AI tính lại dự báo.
```

Build slice này qua 5 câu hỏi:

| Câu hỏi | Trả lời |
|---|---|
| User cụ thể chưa? | Có. Người dùng MoMo có thu nhập cố định hằng tháng, dùng ví thanh toán hằng ngày. |
| Task đủ hẹp chưa? | Có. Chỉ dự báo/cảnh báo ngân sách tháng dựa trên tốc độ chi hiện tại. |
| AI decision rõ chưa? | Có. AI tính tốc độ chi, dự báo cuối tháng, cảnh báo nguy cơ vượt và gợi ý mức nên chi/ngày. |
| Failure path rõ chưa? | Có. Khoản chi bất thường có thể làm AI dự báo sai. |
| Có evidence không? | Có self-use screenshot và review Google Play về việc vượt ngân sách không được cảnh báo. |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Quyết định |
|---|---|
| Ý tưởng rộng: quản lý toàn bộ chi tiêu cá nhân | Giảm scope xuống một flow: ngân sách tháng 10.000.000đ, tính tốc độ chi, dự báo cuối tháng. |
| Ý tưởng chỉ phân tích user chi nhiều nhất vào đâu | Không chọn làm slice chính vì pain chưa đủ mạnh; nhiều app đã có biểu đồ/category. |
| Có khoản chi bất thường như học phí/trả nợ | Không tự chốt dự báo; hỏi user xác nhận có loại khỏi dự báo không. |
| Draft voice input có evidence riêng | Để backlog/proposal phụ nếu nhóm chốt giới hạn chi tiêu là slice chính. |

## 6. Câu chốt cuối

```text
Dựa trên evidence Moni chưa cảnh báo khi user vượt hoặc sắp vượt ngân sách,
nhóm sẽ build prototype cảnh báo nguy cơ vượt ngân sách tháng,
cho người dùng MoMo có thu nhập cố định và dùng ví để thanh toán hằng ngày,
để giải quyết pain user chỉ phát hiện vấn đề khi đã tiêu quá nhiều,
bằng cách AI tính tốc độ chi tiêu, dự báo tổng chi cuối tháng,
gợi ý mức nên chi mỗi ngày/tuần,
và sẽ test failure path khoản chi bất thường làm dự báo sai.
```

## 7. Backlog

Những thứ **không build trong Day 06**:

- Kết nối dữ liệu MoMo thật.
- Tự động chặn giao dịch.
- Tự động điều chỉnh ngân sách thay user.
- Phân tích toàn bộ lịch sử giao dịch dài hạn.
- Học lâu dài từ tất cả correction của user.
- Voice input + preview transcript nếu nhóm không chọn build slice nhập liệu.
