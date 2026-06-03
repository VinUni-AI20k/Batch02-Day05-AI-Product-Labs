# Thin SPEC - Location-based Food Recommendation

Dựa trên Insight và Opportunity từ Evidence Pack (theo hướng dẫn của bài Day 05), dưới đây là bản Thin SPEC để chuẩn bị build prototype trong Day 06.

## 1. Cơ hội (Opportunity Statement)

Cơ hội là dùng AI để **augment quá trình tìm kiếm và lọc thông tin quán ăn**,
giúp khách du lịch **chọn được quán ăn phù hợp với khẩu vị cá nhân tại địa điểm lạ một cách nhanh chóng**,
trong khi vẫn kiểm soát **rủi ro gợi ý quán đóng cửa hoặc chất lượng quá tệ (AI hallucination/outdated data)**.

## 2. Quyết định AI (Auto/Aug decision)

- **Phương pháp:** Augmentation (AI hỗ trợ gợi ý).
- **AI làm gì:** AI đóng vai trò như một người dân địa phương (Local Guide), phân tích vị trí hiện tại và hỏi 2-3 câu hỏi để lọc nhu cầu (ví dụ: "Bạn muốn ăn món nước hay khô?", "Ngân sách khoảng bao nhiêu?", "Bạn có bị dị ứng gì không?"). Sau đó tổng hợp thông tin và đưa ra 3 lựa chọn tốt nhất.
- **Human giữ quyền ở đâu:** User vẫn là người quyết định cuối cùng sẽ đi ăn ở quán nào, hoặc có thể yêu cầu AI "gợi ý các quán khác".

## 3. Build Slice

Cho **khách du lịch đến một địa phương lạ** đang **không biết ăn gì và ở đâu**,
prototype dùng AI để **hỏi nhu cầu cá nhân và gợi ý 3 quán ăn phù hợp gần đó**,
tạo ra **danh sách 3 quán kèm theo lý do gợi ý ngắn gọn (tổng hợp từ review)**,
và xử lý **lỗi AI không tìm thấy quán phù hợp** bằng cách **mở rộng bán kính tìm kiếm hoặc gợi ý món ăn phổ thông an toàn**.

## 4. Four Paths (4 Kịch bản)

- **Happy path:** AI hỏi đúng trọng tâm -> User trả lời -> AI trả ra 3 quán ăn cực kỳ hợp ý kèm lý do thuyết phục -> User chọn 1 quán và xem đường đi.
- **Low-confidence path:** AI tìm được quán nhưng đánh giá không quá cao hoặc dữ liệu review lộn xộn. AI sẽ thêm cảnh báo: *"Quán này phù hợp tiêu chí của bạn nhưng dạo gần đây có vài review chê về thời gian lên món, bạn cân nhắc nhé."*
- **Failure path:** User đòi hỏi tiêu chí quá khó (VD: *"Tìm quán hủ tiếu chay mở cửa lúc 2h sáng ở gần đây"*). AI không tìm ra quán.
- **Correction path:** AI chủ động xin lỗi, giải thích lý do không tìm thấy và đề xuất: *"Hiện tại quanh đây không có quán hủ tiếu chay mở giờ này, mình có thể gợi ý cửa hàng tiện lợi gần nhất có đồ ăn chay hoặc mở rộng bán kính tìm kiếm ra 5km được không?"*

## 5. Failure Mode

- **Lỗi nguy hiểm nhất:** AI gợi ý một quán ăn đã đóng cửa vĩnh viễn hoặc chuyển địa điểm, khiến khách du lịch mất công đi tới, gây đói và có trải nghiệm rất tệ.
- **Cách prototype xử lý (Mitigation):** Giao diện gợi ý của AI luôn kèm theo disclaimer/cảnh báo: *"Giờ mở cửa có thể thay đổi, hãy nhấn vào link bản đồ để kiểm tra lại trước khi xuất phát nhé."*

## 6. Owner Plan (Phân công Day 06)

*(Nhóm điền tên các thành viên phụ trách)*

- **Research & Evidence (Kiểm chứng bằng chứng):** [Tên]
- **Prompt Engineering (Thiết kế prompt cho AI Local Guide):** [Tên]
- **Thiết kế UI/UX & Flow của Prototype:** [Tên]
- **Test 4 paths & Failure mode:** [Tên]
- **Làm slide & chuẩn bị Demo:** [Tên]

## 7. Backlog (Không build trong Day 06)

Những thứ **không build trong Day 06** để đảm bảo scope đủ nhỏ:
- Tính năng đặt bàn trực tiếp qua AI.
- Đặt đồ ăn giao tận nơi (chỉ tập trung gợi ý quán ăn gần đó để khách tự đi/book xe).
- Tích hợp thanh toán/ưu đãi voucher.
