# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:**  
**Track:**  
**Product/app đã chọn:**  
**Build slice đang nghĩ:**  

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
|  |  | Happy / Low-confidence / Failure / Correction |  |
|  |  | Happy / Low-confidence / Failure / Correction |  |

## 3. User / review / social evidence (Vũ Duy Bảo - 2A202600565)

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Em đăng ký đóng tiền xong tới bệnh viện người ta bắt bốc số lại nè. Không xài được đâu mọi người đừng đăng ký phí tiền." | App Store Customer Reviews | Bệnh nhân đặt khám tại tuyến viện công lớn. | Lỗi đứt gãy kết nối On-to-Off: Hệ thống app và bệnh viện không đồng bộ diện rộng, mã đặt chỗ bị vô hiệu hóa tại quầy tiếp đón trực tiếp. |
| "Có thím nào đặt hẹn khám bệnh qua web Bookingcare.vn chưa cho em chút kinh nghiệm với. Liệu có uy tín lắm không?" | Diễn đàn VOZ - Thread #87515 | Người dùng mới đang khảo sát mức độ uy tín của bên thứ ba. | Rào cản lòng tin kỹ thuật số (Digital Trust): Người bệnh lo ngại lịch hẹn không được cơ sở y tế xác nhận chính thức. |
| "App lỗi, vô đăng kí không load nổi form chọn ngày tháng..." và các phàn nàn về hiệu năng thiết bị. | Google Play Store Reviews | Người dùng thiết bị Android (hệ điều hành cũ). | Lỗi tối ưu hóa ứng dụng (App Optimization): Tốc độ tải trang (UI/UX) chậm, gây treo máy hoặc gián đoạn luồng đặt lịch/thanh toán. |
| "Phòng khám đổi lịch bác sĩ đột xuất nhưng tổng đài không báo trước, đến nơi mới ngã ngửa làm mất công xin nghỉ làm." | BookingCare Official Fanpage | Bệnh nhân đặt lịch đích danh chuyên gia/bác sĩ giỏi. | Thiếu hệ thống cập nhật thời gian thực (Real-time Sync): Lịch trực của bác sĩ tại viện thay đổi nhưng không được tự động đồng bộ sang nền tảng BookingCare. |

Nếu chưa có nguồn ngoài nhóm, ghi rõ:

```text
Đây là giả định. Nhóm sẽ kiểm bằng [cách] trước checkpoint M1 Day 06.
```

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
|  |  |  |  |

## 5. Evidence -> Insight (Vũ Duy Bảo - 2A202600565)

Evidence nổi bật nhất:
AI của BookingCare bị mâu thuẫn logic nghiêm trọng khi xử lý triệu chứng nguy hiểm ("đau ngực, khó thở, tay trái tê"): vừa cảnh báo người dùng đi cấp cứu ngay, vừa chào mời đặt lịch khám Tim mạch thường trong cùng một câu trả lời. Ngoài ra, AI đổ tràn lan thông tin (7 nhóm nguyên nhân) khi gặp triệu chứng mơ hồ thay vì hỏi thêm để thu hẹp chuyên khoa

Insight:
User không chỉ gặp [lỗi mâu thuẫn logic và tràn dữ liệu của chatbot].
Thật ra họ cần [sự định hướng y khoa an toàn, phân tầng nguy cơ chính xác để hỗ trợ ra quyết định mà không gây hoang mang hay nguy hiểm tính mạng].

Opportunity:
AI có thể giúp bằng cách [thiết lập rào chắn an toàn (Guardrails) để chặn đặt lịch thường khi có dấu hiệu cấp cứu, đồng thời tự động kích hoạt bộ câu hỏi trắc nghiệm lâm sàng để thu hẹp chuyên khoa khi triệu chứng mơ hồ].

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
Trước evidence, nhóm định...
Sau evidence, nhóm đổi thành...
Lý do:
```
