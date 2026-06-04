# Báo cáo Day 06 — Backend & Demo

- Họ tên: Trần Văn Khoa
- Mã số: 2A202600827

## Vai trò chính
- Phụ trách phần backend của prototype.
- Xây dựng API và luồng dữ liệu giữa frontend và mô hình AI.
- Đảm bảo dữ liệu menu / item / recommendation được trả về đúng định dạng.

## Những việc đã làm
- Thiết kế và triển khai router backend cho `chat` và `menu`.
- Kết nối logic recommendation với dữ liệu mock của ShopeeFood.
- Định nghĩa contract API để frontend dễ gọi và demo ổn định.
- Xử lý lỗi backend, trả fallback khi AI không đáp ứng đúng yêu cầu.

## Bài học sau demo
- Backend cần định nghĩa rõ ràng hợp đồng dữ liệu với frontend ngay từ đầu.
- Cần test các kịch bản lỗi của AI, vì phần demo phụ thuộc vào response ổn định.
- Phần backend không chỉ là code, mà còn là đảm bảo user flow và demo flow chạy trơn.
- Tích hợp sớm giữa frontend và backend giúp phát hiện nhanh các điểm sai khác nhau.

## Ghi chú
- File này tạo tách biệt với file momo cá nhân.
- Nếu cần bổ sung chi tiết thêm về endpoint hoặc workflow, tôi sẽ cập nhật tiếp.
