# Toolkit — Từ Evidence Đến Build Slice

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm (Vũ Duy Bảo - 2A202600565)

Gom theo **workflow/pain**, không gom theo tên feature.

- **Cụm 1: Bối rối trước triệu chứng mơ hồ, chatbot/form đẩy gánh nặng chẩn đoán sơ bộ cho người dùng**
  - *BookingCare AI:* Nhập "hay mệt mỏi, đôi khi đau đầu" → AI liệt kê tràn lan 7 nhóm nguyên nhân thay vì đặt câu hỏi thu hẹp chuyên khoa, khiến user không biết chọn gì.
  - *Vinmec:* Bắt buộc user tự chọn Bệnh viện → Chuyên khoa → Bác sĩ trước khi thấy slot, không gợi ý triệu chứng (burden chẩn đoán đè lên user).
- **Cụm 2: Thiếu cảnh báo an toàn y tế và mâu thuẫn logic khi triệu chứng khẩn cấp (Red Flag handling)**
  - *BookingCare AI:* Nhập "đau ngực, khó thở, tay trái tê" → Vừa cảnh báo "đi cấp cứu ngay" vừa chào mời đặt lịch Tim mạch thường trong cùng một phản hồi.
  - *Vinmec:* Nhập "tôi đau đầu sắp ngất rồi" nhưng không có triage, không cảnh báo khẩn cấp, xử lý như booking thường.
- **Cụm 3: Đứt gãy kết nối On-to-Off (Hệ thống online và offline không đồng bộ)**
  - *App Store Review:* Đăng ký đóng tiền xong đến bệnh viện vẫn bắt bốc số lại, mã đặt chỗ bị vô hiệu hóa tại quầy.
  - *BookingCare Fanpage:* Phòng khám đổi lịch bác sĩ đột xuất nhưng tổng đài không báo trước, tới nơi mới ngã ngửa làm mất công xin nghỉ làm.
  - *Vinmec:* Sau khi submit form đầy đủ, hệ thống hiện thông báo đợi tổng đài viên gọi điện xác nhận lại thời gian khám.
- **Cụm 4: Rào cản lòng tin kỹ thuật số (Digital Trust) & Trải nghiệm kỹ thuật kém**
  - *VOZ:* Người dùng nghi ngờ độ uy tín của bên thứ 3 (BookingCare.vn), lo ngại lịch hẹn không được cơ sở y tế xác nhận chính thức.
  - *Google Play:* App lỗi hiệu năng trên thiết bị Android cũ, không load nổi form chọn ngày tháng.

## 2. Viết insight (Vũ Duy Bảo - 2A202600565)

Người bệnh có triệu chứng bất thường không chỉ cần [một chatbot AI gợi ý nhanh chuyên khoa hoặc trả lời thông tin y khoa chung chung].
Họ thật ra cần [sự định hướng y khoa an toàn và phân tầng nguy cơ chính xác để được hỗ trợ ra quyết định phù hợp (biết rõ nên đi cấp cứu ngay hay nên khám chuyên khoa nào) mà không bị hoang mang hay gặp rủi ro ảnh hưởng đến tính mạng],
vì [evidence thực tế cho thấy chatbot hiện tại bị mâu thuẫn logic nghiêm trọng khi xử lý ca cấp cứu (vừa khuyên đi cấp cứu vừa chào mời đặt lịch thường) và gây bối rối bằng cách đổ tràn lan 7 chuyên khoa khi triệu chứng mơ hồ thay vì tương tác hỏi thêm để thu hẹp].


## 3. Viết opportunity

Form:

```text
Cơ hội là dùng AI để [augment/automate hành động hẹp],
giúp user [kết quả],
trong khi vẫn kiểm soát [failure/risk].
```

## 4. Chọn build slice

Build slice tốt phải qua 5 câu hỏi:

| Câu hỏi | Đạt khi |
|---|---|
| User cụ thể chưa? | Nói được ai dùng, trong bối cảnh nào. |
| Task đủ hẹp chưa? | Demo được trong 3-5 phút. |
| AI decision rõ chưa? | AI gợi ý/tự làm một việc cụ thể. |
| Failure path rõ chưa? | Có một case AI không chắc hoặc sai để test. |
| Có evidence không? | Có bằng chứng từ self-use/review/user/competitor. |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Quyết định |
|---|---|
| Evidence yếu, user mơ hồ | Dừng build sâu; quay lại research 20 phút. |
| Ý tưởng quá rộng | Giữ domain, cắt xuống một flow. |
| AI không cần thiết | Dùng rule/manual prototype; ghi rõ vì sao không dùng AI sâu. |
| Rủi ro cao | Chọn augmentation hoặc conditional automation. |
| Không demo được trong 1 ngày | Đưa phần lớn vào backlog, giữ một path nhỏ. |

## 6. Câu chốt cuối

Điền câu này trước khi rời lớp:

```text
Dựa trên [evidence],
nhóm sẽ build [prototype slice],
cho [user],
để giải quyết [pain],
bằng cách AI [augment/automate task],
và sẽ test failure path [failure mode].
```

## 7. Backlog

Những thứ **không build trong Day 06**:

- 
- 
- 
