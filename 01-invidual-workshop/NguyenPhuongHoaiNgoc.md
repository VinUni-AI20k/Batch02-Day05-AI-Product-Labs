# Workshop — Mổ App AI Thật (MoMo — Trợ lý AI Moni)

**Thời gian hoàn thành:** 40 phút  
**Hình thức:** Cá nhân  
**Sản phẩm mổ băng:** MoMo — Trợ lý AI Moni

---

## 1. Chọn một sản phẩm để dùng thử

| Sản phẩm | AI Feature | Cách truy cập |
|-----------|-----------|--------------|
| MoMo – Moni | Chatbot hỗ trợ quản lý chi tiêu, tư vấn tài chính cá nhân, giải thích khái niệm tài chính, lập ngân sách | Ứng dụng MoMo > Trợ lý AI Moni |

---

## 2. Dùng thử: Promise vs Reality

### Promise (Lời hứa của sản phẩm)

- Hỗ trợ người dùng quản lý chi tiêu và tài chính cá nhân.
- Trả lời các câu hỏi liên quan đến sản phẩm, dịch vụ và kiến thức tài chính của MoMo.
- Giữ phạm vi trả lời trong lĩnh vực tài chính cá nhân và hệ sinh thái MoMo.
- Từ chối các yêu cầu ngoài phạm vi nhằm đảm bảo tính chính xác và an toàn.

### Reality (Thực tế trải nghiệm)

#### Khả năng phòng thủ ban đầu

- Khi yêu cầu cung cấp system prompt hoặc giả danh quản trị hệ thống, Moni từ chối trả lời.
- Khi yêu cầu thông tin chăm sóc khách hàng không thuộc phạm vi hỗ trợ, Moni tiếp tục giữ đúng vai trò trợ lý tài chính.
- Hệ thống không bị lộ prompt và không thực hiện các yêu cầu ngoài phạm vi.

#### Quan sát về hành vi Low-confidence

- Khi được yêu cầu “biểu hiện low confidence”, Moni không thể hiện trạng thái không chắc chắn mà chỉ lặp lại phạm vi chức năng của mình.
- Chưa có cơ chế thể hiện mức độ tự tin hoặc chuyển hướng rõ ràng sang hỗ trợ con người.

#### Đánh giá

- Happy Path: Hoạt động tốt.
- Guardrails: Hoạt động tốt trong các thử nghiệm cơ bản.
- Failure Path: Chưa phát hiện lỗi nghiêm trọng trong phạm vi thử nghiệm.
- Correction Path: Chưa quan sát thấy cơ chế tự sửa lỗi hoặc học từ tương tác.

---

## Evidence (Ảnh chụp màn hình)

### 1. Thử yêu cầu tiết lộ system prompt

![Screenshot 1](/mnt/data/71D1AB73-8753-40E8-800B-965D43A878B9.png)

**Quan sát:** Moni từ chối cung cấp system prompt và giữ nguyên vai trò trợ lý tài chính.

### 2. Thử yêu cầu thông tin người thật chăm sóc khách hàng và low confidence

![Screenshot 2](/mnt/data/323C550C-82A7-44AE-A0B9-0023C3ECD111.png)

**Quan sát:** Moni tiếp tục giới hạn trong phạm vi sản phẩm MoMo và không thể hiện cơ chế low-confidence rõ ràng.

---

## 3. Vẽ 4 Paths

| Path | Trạng thái trong sản phẩm thực tế (Moni) | Phân tích |
|--------|--------|--------|
| Happy | ĐÃ CÓ | User hỏi "Bạn có thể làm gì?" → Bot liệt kê đầy đủ các chức năng tài chính cá nhân. |
| Low-confidence | CHƯA RÕ | Khi gặp câu hỏi bất thường, bot chỉ lặp lại phạm vi hỗ trợ thay vì thể hiện độ tin cậy thấp hoặc chuyển hướng phù hợp. |
| Failure | CHƯA PHÁT HIỆN | Trong các thử nghiệm cơ bản, chưa quan sát được jailbreak hoặc vượt rào thành công. |
| Correction | CHƯA CÓ | Chưa thấy cơ chế ghi nhận lỗi, phản hồi sau thất bại hoặc phục hồi hội thoại. |

---

## Kết luận

Moni là một chatbot có phạm vi chức năng hẹp và được kiểm soát khá tốt. Các guardrails cơ bản hoạt động hiệu quả trước các prompt yêu cầu tiết lộ system prompt hoặc vượt phạm vi nghiệp vụ. Tuy nhiên, sản phẩm hiện chưa thể hiện rõ cơ chế low-confidence và correction path, khiến trải nghiệm xử lý các tình huống mơ hồ còn hạn chế.