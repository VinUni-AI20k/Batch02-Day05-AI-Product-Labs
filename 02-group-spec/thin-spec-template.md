# Tài liệu Vấn đề 1: Nhắc uống thuốc (Thiếu Auto-fill)

---

## PHẦN 1: EVIDENCE PACK 
*(Nộp kèm thin SPEC cuối Day 05)*

### 1. Nhóm và track
**Tên nhóm:** [Nhóm C3]

**Track:** [AI Product Management /Healthcare UX]

**Product/app đã chọn:** Nhà thuốc FPT Long Châu

**Build slice đang nghĩ:** User tải ảnh đơn thuốc -> AI trích xuất thông tin (Tên thuốc, Dạng thuốc, Liều lượng) -> Hệ thống Auto-fill (tự động điền) vào form -> User kiểm tra và bấm "Xác nhận" lưu lịch nhắc.

### 2. Self-use evidence
Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi chụp ảnh đơn thuốc vào tính năng nhắc thuốc, hệ thống chỉ nhận diện được chữ (OCR text) nhưng các ô "Dạng thuốc" (viên/gói) và "Liều lượng" (sáng/tối) vẫn trống. | `[Ảnh màn hình form bắt nhập tay sau OCR]` | Failure (Luồng tự động hóa bị gãy, chuyển thành thủ công) | Nhận diện chữ (OCR) là chưa đủ. Nếu không map được dữ liệu đó vào các trường thông tin của báo thức, tính năng này không tạo ra giá trị "tự động" thực sự. |
| Để setup xong 1 đơn thuốc gồm 4 loại, người dùng phải thực hiện thao tác chọn/gõ thủ công khoảng 15-20 lần chạm (clicks) trên màn hình. | `[Video màn hình thao tác mất >2 phút]` | Low-confidence / Failure | User đang ốm/mệt sẽ không đủ kiên nhẫn làm việc này. Thao tác tốn thời gian hơn việc dùng app Báo thức mặc định. |

### 3. User / review / social evidence

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "App quét được tên thuốc nhưng bắt nhập tay ngày uống mấy viên, sáng hay tối. Nhập xong 5 loại thuốc mất luôn thời gian, thà tôi dùng báo thức điện thoại cho nhanh." | Phỏng vấn nhanh (1-on-1) | Bệnh nhân trẻ (25-35 tuổi) mua thuốc theo đơn. | Quá tải thao tác nhập liệu, feature thất bại trong việc mang lại sự tiện lợi. |
| "Mẹ mình mắt kém, chụp ảnh xong app ra một đống chữ nhưng không tự lên lịch báo thức, cuối cùng vẫn nhờ mình đặt giờ hộ." | Bình luận App Store / Group FB | Người chăm sóc (Caregiver). | Trải nghiệm luồng gián đoạn, người lớn tuổi không thể tự sử dụng. |

### 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| **Apple Health (iOS 16+)** | Quét vỏ thuốc tự nhận diện tên, dạng bào chế và gợi ý lịch uống để user confirm. | Pattern: **Auto-fill + Human review**. Đừng bắt user gõ, hãy để user "xác nhận" (Confirm/Edit). | Có. Dùng API Vision LLM prompt trả về JSON map thẳng vào UI. |
| **Medisafe (App nhắc thuốc)** | Gõ 2-3 chữ cái đầu tự suggest tên thuốc chuẩn, liều dùng phổ biến. | Pattern: **Smart Suggestion & Default values**. Điền sẵn liều tiêu chuẩn. | Khả thi nếu kết hợp GenAI với database thuốc Long Châu. |

### 5. Evidence -> Insight
```text
Evidence nổi bật nhất:
Nhập tay thông tin cho một đơn thuốc 4-5 loại mất thời gian và số lượt chạm (clicks) nhiều hơn cả việc dùng app Báo thức gốc của điện thoại.

Insight:
User không chỉ gặp khó khăn trong việc đọc đơn thuốc (surface problem).
Thật ra họ cần sự giải phóng khỏi gánh nặng nhập liệu và thao tác kỹ thuật khi cơ thể đang mệt mỏi (deeper need).

Opportunity:
AI có thể giúp bằng cách trích xuất cấu trúc dữ liệu (structured data) từ ảnh đơn thuốc để tự động điền (Auto-fill) 100% form lịch nhắc, giảm số lượt chạm của user từ 20 xuống 1-2 click.