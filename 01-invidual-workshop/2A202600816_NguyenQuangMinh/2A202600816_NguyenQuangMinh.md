

# Báo Cáo Mổ App AI: Case Study "Điểm Gãy Tìm Kiếm Định Vị"

## 1. Chọn sản phẩm để dùng thử
* **Sản phẩm:** AI Chatbot tích hợp V-app.
* **AI feature:** Trợ lý ảo trả lời câu hỏi và gợi ý địa điểm (có tích hợp Search nguồn dữ liệu web).

## 2. Dùng thử: Promise vs Reality
* **Product hứa gì?** AI đóng vai trò như một trợ lý cá nhân am hiểu địa phương, cung cấp câu trả lời tức thì, chính xác theo ngữ cảnh và vị trí của người dùng.
* **User nào được hứa?** Người dùng đang di chuyển, có nhu cầu tìm kiếm dịch vụ tiện ích tức thời (hyper-local search).
* **Kỳ vọng:** Khi hỏi "gần đây", AI sẽ trả về danh sách 3-5 quán trà sữa cụ thể xung quanh vị trí đứng (ví dụ bán kính 1-2km), kèm thông tin để ra quyết định nhanh như khoảng cách, đánh giá, hoặc bản đồ.
* **Điểm gãy xuất hiện ở đâu?** Ở bước **Xử lý thiếu hụt Context (Missing Context Handling)**. Khi AI phát hiện không có quyền truy cập định vị GPS (UI hiện nút "Bật định vị"), thay vì dừng lại để xin thông tin vị trí từ người dùng, AI lại tự động dùng định vị IP diện rộng (Hà Nội) để "cố" sinh ra câu trả lời. Kết quả là một bài văn mẫu chuẩn SEO dài dòng về toàn bộ "Hệ thống quán trà sữa tại Hà Nội" thay vì các quán "gần đây".
* **Evidence:**
    * *Screenshot:* `evidence.png`
    * *Prompt:* "quán trà sữa ngon gần đây"
    * *Hành vi quan sát được:* AI trả lời lạc đề từ intent "gần đây" thành tổng hợp "toàn thành phố Hà Nội", liệt kê một loạt các quận rộng lớn (Hoàn Kiếm, Đống Đa, Ba Đình...) không giúp ích gì cho nhu cầu đi mua tức thì.

## 3. Vẽ 4 paths
* **Happy Path:** AI có sẵn quyền định vị -> Nhận diện intent "gần đây" -> Quét dữ liệu bản đồ -> Trả về danh sách Card UI gồm 3 quán trà sữa ngon nhất trong bán kính 2km (có thông tin khoảng cách, giờ mở cửa).
* **Low-confidence (Đáng lẽ phải có):** AI nhận diện từ khóa "gần đây" nhưng hệ thống ghi nhận thiếu GPS. Trợ lý dừng lại và hỏi: *"Bạn cho mình xin quyền định vị hoặc gõ tên khu vực bạn đang đứng để mình tìm quán gần nhất nhé!"* kèm các lựa chọn tương tác nhanh.
* **Failure (Đang xảy ra):** AI thiếu GPS nhưng mắc lỗi "Over-generation" (Cố sinh chữ để khỏa lấp). Nó tự fallback về cấp độ Tỉnh/Thành phố và phun ra một bài văn dài dòng tổng hợp từ 16 nguồn web. Người dùng đang thèm trà sữa phải đọc một đoạn lịch sử/tổng quan vô dụng.
* **Correction:** Người dùng bực mình, bỏ qua bài văn, tự phải gõ lại prompt chi tiết hơn bằng sức người: *"Quán trà sữa ngon ở phố X, quận Y"*.

## 4. Viết finding thành quyết định

> **Khi user** [hỏi tìm địa điểm kèm từ khóa "gần đây"],
> **AI/product** [phát hiện thiếu quyền định vị nhưng vẫn dùng vị trí mặc định để cố generate ra một bài tổng hợp theo cấp độ thành phố],
> **hậu quả là** [trả về một khối văn bản dài dòng (wall of text), không giải quyết được nhu cầu tìm kiếm tức thời, khiến người dùng ức chế và làm lu mờ nút "Bật định vị"].
> **Lỗi thuộc layer** [Intent Validation (Xác thực ý định) + UX Fallback (Xử lý dự phòng khi thiếu dữ kiện)].
> **Nên sửa bằng** [Data-missing Path]: Chặn luồng generate văn bản rườm rà. Nếu intent là tìm địa điểm cụ thể nhưng thiếu Location Context, AI phải trả lời ngắn gọn thừa nhận thiếu thông tin và hiển thị Call-to-Action yêu cầu cung cấp vị trí.

## 5. Sketch as-is / to-be

**[As-is Flow] - Luồng hiện tại:**
1. User: "quán trà sữa ngon gần đây"
2. System: Check GPS -> `Null`. Chuyển sang lấy location diện rộng -> `Hà Nội`.
3. 🛑 **[Điểm gãy]** AI: Bắt đầu quét 16 nguồn web và generate bài văn tổng hợp với keyword "Trà sữa Hà Nội".
4. UI: Hiện nút "Bật định vị" ở góc nhỏ, bên dưới là một sớ văn bản dài như Wikipedia.
5. User: Lướt mỏi tay không thấy quán nào gần mình -> Đóng app sang Google Maps.

**[To-be Flow] - Luồng đề xuất:**
1. User: "quán trà sữa ngon gần đây"
2. System: Check GPS -> `Null`.
3. 🟢 **[Path sửa]** AI phát hiện Intent là "Local Search" nhưng thiếu Context. Dừng ngay việc Search Web tổng hợp.
4. AI Chat: *"Để gợi ý quán gần bạn nhất, AI cần biết bạn đang ở đâu nhé!"*
5. 🟢 **[Path sửa]** UX Fallback: Hiển thị 2 nút to, rõ ràng: `[📍 Bật định vị để tìm]` và `[⌨️ Nhập tên đường/khu vực]`.
6. User: Bấm "Bật định vị".
7. AI: Load lại kết quả nhanh -> Trả về 3 Card UI (VD: Mixue - 500m, Phê La - 800m).
AI_Workshop_Report.md
Đang hiển thị AI_Workshop_Report.md.