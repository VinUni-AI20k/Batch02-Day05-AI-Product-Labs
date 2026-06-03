# Product Decision Analysis

## Case 1: Dữ liệu ít, AI bị kẹt hoặc yêu cầu thử lại

### Ghi nhận từ người dùng
- User mong muốn có một lộ trình xử lý rõ ràng để tích lũy kết quả thay vì phải thử lại nhiều lần.
- Thực tế đã xảy ra trường hợp Momo bị kẹt do dữ liệu không đủ hoặc quá ít.
- Người dùng phải thực hiện thao tác thử lại (retry) để có kết quả.
- Khi chuyển sang danh sách chat khác, thông báo lỗi bị mất, khiến người dùng không hiểu nguyên nhân và phải lặp lại thao tác.

### Product Decision

**Khi user**
- Gửi yêu cầu phân tích hoặc tổng hợp dữ liệu.

**AI/Product**
- Không đủ dữ liệu để hoàn thành tác vụ.
- Hệ thống bị kẹt hoặc yêu cầu người dùng thử lại.

**Hậu quả là**
- Người dùng không hiểu nguyên nhân thất bại.
- Phải thực hiện nhiều lần cùng một thao tác.
- Mất ngữ cảnh khi chuyển sang màn hình hoặc cuộc trò chuyện khác.
- Trải nghiệm thiếu tin cậy và khó dự đoán.

**Lỗi thuộc layer**
- UX
- Data Handling
- Failure Recovery

**Nên sửa bằng**
- UX:
  - Hiển thị trạng thái rõ ràng khi dữ liệu không đủ.
  - Giữ lại thông báo lỗi ngay cả khi người dùng chuyển màn hình.
- Requirement:
  - Định nghĩa rõ hành vi khi dữ liệu dưới ngưỡng tối thiểu.
- Automation:
  - Tự động đánh giá chất lượng và số lượng dữ liệu trước khi chạy.
- Data:
  - Xây dựng ngưỡng tối thiểu (minimum data threshold).

**Đo bằng**
- Retry Rate (% người dùng phải thử lại).
- Failure Recovery Success Rate.
- Task Completion Rate.
- User Satisfaction Score.

---

## Đề xuất luồng xử lý mới

### Bước 1: Tìm kiếm và phân tích dữ liệu
- Thu thập dữ liệu liên quan.
- Phân tích độ đầy đủ và chất lượng dữ liệu.
- Cô đọng thông tin trước khi sinh kết quả.

### Bước 2: Kiểm tra mức độ dữ liệu

#### Trường hợp 1: Dữ liệu đủ
- Tiếp tục xử lý bình thường.
- Trả về kết quả cho người dùng.

#### Trường hợp 2: Dữ liệu ít nhưng vẫn có thể xử lý
- AI tự đưa ra kết quả tốt nhất có thể.
- Kèm chú thích:

> Kết quả được tạo từ lượng dữ liệu hạn chế nên độ tin cậy có thể thấp hơn bình thường.

- Không yêu cầu người dùng thử lại.

#### Trường hợp 3: Không có dữ liệu
- Không chạy phân tích.
- AI chủ động đặt câu hỏi làm rõ hoặc yêu cầu người dùng bổ sung dữ liệu trước khi tiếp tục.
