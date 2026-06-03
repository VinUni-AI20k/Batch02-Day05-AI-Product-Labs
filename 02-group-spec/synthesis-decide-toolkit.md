# Toolkit — Từ Evidence Đến Build Slice
**Tên nhóm:** [Nhóm C3]
**Track:** [AI Product Management /Healthcare UX]
**Product/app đã chọn:** Nhà thuốc FPT Long Châu

## 1. Gom evidence thành cụm
- "OCR nhận diện được chữ nhưng không hiểu ý nghĩa để tự động điền (mapping) vào các trường (dạng thuốc, liều lượng)."
- "Quá tải thao tác thủ công (15-20 clicks) khiến quy trình mất thời gian hơn cả báo thức điện thoại."
- "Người dùng ốm mệt hoặc lớn tuổi bị gián đoạn trải nghiệm, phải bỏ cuộc giữa chừng."

## 2. Viết insight
User **bệnh nhân đang ốm mệt và người chăm sóc (caregiver)** không chỉ cần **tính năng quét chữ (OCR) trên đơn thuốc**.
Họ thật ra cần **một trải nghiệm tạo lịch nhắc uống thuốc hoàn toàn tự động (zero-to-one click)**,
vì **các review và self-use cho thấy việc phải tự phân loại và nhập tay lại "liều lượng", "thời gian", "dạng thuốc" tốn quá nhiều thời gian và thao tác, khiến họ nản lòng và quay về dùng app báo thức mặc định.**

## 3. Viết opportunity
Cơ hội là dùng AI để **tự động hóa việc trích xuất và gán nhãn thông tin y tế (Tên thuốc, Dạng thuốc, Liều dùng) từ ảnh thẳng vào form**,
giúp user **tạo lịch nhắc thuốc của cả một đơn dài chỉ trong vài giây**,
trong khi vẫn kiểm soát **rủi ro nhận diện sai bằng cơ chế Human-in-the-loop (yêu cầu user kiểm tra và bấm xác nhận trước khi lưu).**

## 4. Chọn build slice
**Build slice:** User tải ảnh đơn thuốc -> AI trích xuất thông tin (Tên thuốc, Dạng thuốc, Liều lượng) -> Hệ thống Auto-fill (tự động điền) vào form -> User kiểm tra và bấm "Xác nhận" lưu lịch nhắc.

| Câu hỏi | Đạt khi | Đánh giá slice của nhóm |
| :--- | :--- | :--- |
| **User cụ thể chưa?** | Nói được ai dùng, trong bối cảnh nào. | **Đạt.** Bệnh nhân trẻ (25-35 tuổi) hoặc người nhà lớn tuổi mua thuốc theo đơn, cần lên lịch báo thức ngay sau khi nhận thuốc. |
| **Task đủ hẹp chưa?** | Demo được trong 3-5 phút. | **Đạt.** Slice chỉ tập trung vào một màn hình upload ảnh và màn hình hiển thị form đã auto-fill. |
| **AI decision rõ chưa?** | AI gợi ý/tự làm một việc cụ thể. | **Đạt.** AI quyết định chuỗi text nào tương ứng với trường thông tin nào (VD: "Sáng 1 viên" -> field: Morning, dạng: Viên). |
| **Failure path rõ chưa?** | Có một case AI không chắc hoặc sai để test. | **Đạt.** Case chữ bác sĩ quá mờ/viết tay ngoáy, AI đọc thiếu thuốc hoặc sai liều. |
| **Có evidence không?** | Có bằng chứng từ self-use/review/user/competitor. | **Đạt.** Có observation từ self-use (đếm số click) và giả định phỏng vấn người dùng thực tế. |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?
| Tình huống | Quyết định của nhóm |
| :--- | :--- |
| **Rủi ro cao / Ý tưởng hẹp** | **Chọn conditional automation (Tự động hóa có điều kiện).** AI sẽ tự động điền form thay user, nhưng bắt buộc phải có bước hiển thị lại giao diện thân thiện để user review (xác nhận) hoặc sửa tay nếu AI nhận diện nhầm do ảnh mờ, chữ viết tay xấu. |

## 6. Câu chốt cuối
Dựa trên **bằng chứng về việc người dùng bỏ cuộc vì tốn quá nhiều thao tác nhập tay (15-20 clicks) sau khi quét đơn thuốc**,
nhóm sẽ build prototype slice **"Tự động điền form nhắc thuốc từ ảnh"**,
cho **bệnh nhân và người chăm sóc**,
để giải quyết **nỗi đau tốn thời gian và quá tải nhận thức khi sử dụng tính năng**,
bằng cách AI **tự động hóa trích xuất và mapping các trường Tên/Dạng/Liều lượng vào thẳng UI form**,
và sẽ test failure path **khi đơn thuốc viết tay quá mờ/xấu khiến AI nhận diện sai hoặc để trống trường thông tin.**

## 7. Backlog
Những thứ **không build trong Day 06**:
- Tính năng quét mã vạch/QR code hộp thuốc.
- Tính năng AI cảnh báo tương tác thuốc (nếu các loại thuốc trong đơn kỵ nhau).
- Tính năng chia sẻ lịch nhắc thuốc cho điện thoại của người thân.
- Bot giải đáp thắc mắc về tác dụng phụ của thuốc trong đơn.
- Tính năng theo dõi tồn kho (đếm ngược số viên để nhắc đi mua đơn mới).
