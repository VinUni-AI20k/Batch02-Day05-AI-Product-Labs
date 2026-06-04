"""# Project: Chatbot AI Tra Cứu Thuốc

## 1. Tổng quan dự án

**Chatbot AI Tra Cứu Thuốc** là một tính năng hỗ trợ người dùng tra cứu nhanh các thông tin cơ bản về thuốc, bao gồm tên thuốc, hoạt chất, công dụng, cách dùng tham khảo, tác dụng phụ, chống chỉ định và tương tác thuốc.

Tính năng này tập trung vào việc cung cấp thông tin tham khảo từ nguồn dữ liệu đã được kiểm duyệt. Chatbot không thay thế bác sĩ hoặc dược sĩ, không kê đơn, không chẩn đoán bệnh và không tự ý hướng dẫn thay đổi liều thuốc cho người dùng.

---

## 2. Vấn đề cần giải quyết

Người dùng thường gặp khó khăn khi muốn tra cứu thông tin thuốc vì:

- Không biết thuốc dùng để làm gì.
- Không hiểu rõ hoạt chất trong thuốc.
- Không biết cách dùng thuốc ở mức tham khảo.
- Muốn kiểm tra nhanh tác dụng phụ hoặc chống chỉ định.
- Muốn biết thuốc có thể tương tác với thuốc khác hay không.
- Thông tin trên Internet phân tán, khó kiểm chứng và dễ gây hiểu nhầm.

Vì vậy, cần một chatbot có khả năng tra cứu thuốc nhanh, trình bày thông tin dễ hiểu và có cơ chế cảnh báo an toàn.

---

## 3. Mục tiêu sản phẩm

Mục tiêu của chatbot là giúp người dùng:

- Tra cứu thông tin thuốc nhanh chóng.
- Hiểu thuốc theo ngôn ngữ đơn giản, dễ đọc.
- Biết các lưu ý cơ bản khi sử dụng thuốc.
- Nhận diện các trường hợp không nên tự xử lý.
- Được khuyến nghị gặp bác sĩ hoặc dược sĩ khi câu hỏi vượt quá phạm vi tra cứu thông tin.

---

## 4. Đối tượng người dùng

### 4.1. Người dùng chính

- Người đang muốn tìm hiểu thông tin về một loại thuốc.
- Người mua thuốc cần kiểm tra nhanh công dụng hoặc cách dùng.
- Người chăm sóc người thân cần tra cứu thông tin thuốc cơ bản.
- Người dùng phổ thông muốn hiểu rõ hơn về thuốc mình đang sử dụng.

### 4.2. Người dùng phụ

- Dược sĩ hoặc nhân viên chăm sóc khách hàng cần công cụ hỗ trợ tra cứu nhanh.
- Nhân viên vận hành cần kiểm tra lại nội dung tư vấn tự động.
- Đội phát triển sản phẩm cần xây dựng một tính năng AI an toàn trong lĩnh vực y tế.

---

## 5. Phạm vi tính năng MVP

Trong phiên bản MVP, chatbot tập trung vào **tra cứu thuốc**, chưa thực hiện tư vấn điều trị cá nhân hóa.

### 5.1. Có trong phạm vi MVP

- Nhập tên thuốc hoặc hoạt chất.
- Nhập câu hỏi tự nhiên liên quan đến thuốc.
- Nhận diện mục tiêu tra cứu của người dùng.
- Hỏi bổ sung nếu thiếu thông tin.
- Tra cứu từ cơ sở dữ liệu thuốc đã kiểm duyệt.
- Trả về thông tin thuốc theo cấu trúc rõ ràng.
- Hiển thị cảnh báo an toàn.
- Gợi ý gặp bác sĩ hoặc dược sĩ nếu câu hỏi vượt phạm vi.

### 5.2. Không nằm trong phạm vi MVP

- Không kê đơn thuốc.
- Không tự động đổi liều thuốc.
- Không chẩn đoán bệnh.
- Không thay thế tư vấn y tế trực tiếp.
- Không xử lý các tình huống cấp cứu.
- Không đưa ra phác đồ điều trị cá nhân hóa.

---

## 6. Phân công công việc nhóm

| Thành viên        | Vai trò                         | Công việc phụ trách                                                                                                                        |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Hoàng Phương Thảo | Product Spec / Business Analyst | Phân tích yêu cầu, viết tài liệu spec, xác định phạm vi MVP, mô tả user flow, business rules và acceptance criteria                        |
| Lương Quốc Đoàn   | Frontend Developer              | Xây dựng giao diện frontend cho chatbot, tạo màn hình nhập câu hỏi, hiển thị câu trả lời, card thông tin thuốc và trạng thái loading       |
| Phùng Văn Thạch   | AI Model / NLP                  | Xây dựng phần xử lý AI, bao gồm phân loại intent, trích xuất tên thuốc/hoạt chất, chuẩn hóa câu hỏi và sinh câu trả lời từ dữ liệu tra cứu |
| Trịnh Vũ Anh Tuấn | Backend Developer               | Thiết kế API backend, xử lý request từ frontend, kết nối với cơ sở dữ liệu thuốc, gọi model AI và trả kết quả về frontend                  |
| Thái Thị Yến Nhi  | UI/UX Designer                  | Thiết kế giao diện người dùng, bố cục màn hình chatbot, flow tương tác, màu sắc, icon và trải nghiệm người dùng tổng thể                   |

---

## 7. Cách phối hợp giữa các thành viên

Quy trình làm việc của nhóm được chia theo các bước sau:

1. **Spec & Flow**  
   Hoàng Phương Thảo xây dựng tài liệu yêu cầu, xác định chức năng chính, phạm vi MVP và flow tra cứu thuốc.

2. **UI/UX Design**  
   Thái Thị Yến Nhi thiết kế giao diện chatbot dựa trên spec, bao gồm màn hình nhập câu hỏi, kết quả tra cứu và cảnh báo an toàn.

3. **Frontend Development**  
   Lương Quốc Đoàn phát triển giao diện người dùng theo thiết kế UI/UX, kết nối với API backend và hiển thị kết quả trả về.

4. **Backend Development**  
   Trịnh Vũ Anh Tuấn xây dựng API để nhận câu hỏi từ frontend, gọi model AI, truy vấn cơ sở dữ liệu thuốc và trả kết quả.

5. **AI Model Development**  
   Phùng Văn Thạch xây dựng logic AI để hiểu câu hỏi, phân loại intent, trích xuất thông tin thuốc và hỗ trợ tổng hợp câu trả lời.

6. **Integration & Testing**  
   Cả nhóm cùng kiểm thử luồng hoàn chỉnh từ lúc người dùng nhập câu hỏi đến khi chatbot trả kết quả tra cứu thuốc.

---

## 8. Kết quả mong đợi của từng vai trò

| Vai trò            | Output cần hoàn thành                                                             |
| ------------------ | --------------------------------------------------------------------------------- |
| Product Spec / BA  | File report, flow xử lý, danh sách chức năng, business rules, acceptance criteria |
| UI/UX Designer     | Mockup giao diện chatbot, flow màn hình, bố cục card kết quả tra cứu              |
| Frontend Developer | Giao diện web/app có thể nhập câu hỏi và hiển thị kết quả                         |
| Backend Developer  | API xử lý câu hỏi, kết nối model và cơ sở dữ liệu thuốc                           |
| AI Model / NLP     | Module nhận diện intent, trích xuất entity và sinh câu trả lời an toàn            |

---

## 9. Flow tra cứu thuốc

### Bước 1: Người dùng nhập câu hỏi

Người dùng có thể nhập:

- Tên thuốc.
- Tên hoạt chất.
- Câu hỏi tự nhiên về thuốc.

Ví dụ:

```text
Paracetamol dùng để làm gì?
Thuốc Augmentin có tác dụng phụ gì?
Tôi muốn tra cứu thuốc Cetirizine.
```
