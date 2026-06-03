# Template — Evidence Pack

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** Nhóm C3

**Track:** AI Product Management /Healthcare UX

**Product/app đã chọn:** Nhà thuốc FPT Long Châu

**Build slice đang nghĩ:** User tải ảnh đơn thuốc -> AI trích xuất thông tin (Tên thuốc, Dạng thuốc, Liều lượng) -> Hệ thống Auto-fill (tự động điền) vào form -> User kiểm tra và bấm "Xác nhận" lưu lịch nhắc.
## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| Khi chụp ảnh đơn thuốc vào tính năng nhắc thuốc, hệ thống chỉ nhận diện được chữ (OCR text) nhưng các ô "Dạng thuốc" (viên/gói) và "Liều lượng" (sáng/tối) vẫn trống. | `[Giả định: Ảnh chụp màn hình form app Long Châu bắt nhập tay sau bước OCR]` | Failure (Luồng tự động hóa bị gãy, chuyển thành thủ công) | Nhận diện chữ (OCR) là chưa đủ. Nếu không map (gắn) được dữ liệu đó vào các trường thông tin của báo thức, tính năng này không tạo ra giá trị "tự động" thực sự. |
| Để setup xong 1 đơn thuốc gồm 4 loại, người dùng phải thực hiện thao tác chọn/gõ thủ công khoảng 15-20 lần chạm (clicks) trên màn hình. | `[Giả định: Video quay lại màn hình thao tác mất hơn 2 phút]` | Low-confidence / Failure | User đang ốm/mệt sẽ không đủ kiên nhẫn làm việc này. Thao tác tốn thời gian hơn việc dùng app Báo thức mặc định của điện thoại. |

## 3. User / review / social evidence

Nguồn có thể là review App Store/Play, group, comment, phỏng vấn nhanh, hoặc nguồn public khác.

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "App quét được tên thuốc nhưng bắt nhập tay ngày uống mấy viên, sáng hay tối. Nhập xong 5 loại thuốc mất luôn thời gian, thà tôi dùng báo thức điện thoại cho nhanh." | Phỏng vấn nhanh (1-on-1) | Bệnh nhân trẻ (25-35 tuổi) mua thuốc theo đơn. | Quá tải thao tác nhập liệu, feature thất bại trong việc mang lại sự tiện lợi. |
| "Mẹ mình mắt kém, chụp ảnh xong app ra một đống chữ nhưng không tự lên lịch báo thức, cuối cùng vẫn nhờ mình đặt giờ hộ." | Bình luận trên App Store / Group FB | Người dùng chăm sóc người thân (Caregiver). | Trải nghiệm luồng gián đoạn, người lớn tuổi không thể tự sử dụng. |

```text
Lưu ý: Một số quote trên là giả định dựa trên hành vi (self-use insight). Nhóm sẽ kiểm chứng bằng [Phỏng vấn nhanh 5 người dùng mua thuốc theo đơn] trước checkpoint M1 Day 06.