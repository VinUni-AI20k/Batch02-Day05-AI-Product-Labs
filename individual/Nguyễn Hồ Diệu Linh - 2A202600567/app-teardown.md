# Workshop — Mổ App AI Thật

**Thời gian:** 35-45 phút  
**Hình thức:** cá nhân trước, chia sẻ theo nhóm sau  
**Output:** finding note + sketch as-is / to-be

Mục tiêu không phải chấm "UI đẹp hay xấu". Mục tiêu là dùng sản phẩm thật như một bài needfinding: tìm chỗ product gãy trong workflow thật, rồi viết finding đó thành quyết định product.

## 1. Chọn một sản phẩm để dùng thử

| Sản phẩm | AI feature | Cách truy cập |
|---|---|---|
| **MoMo — Moni & Mo247** | Trợ thủ tài chính, phân tích chi tiêu, chatbot hỗ trợ CSKH 24/7 | Khung chat trực tuyến trên App MoMo |
| Vietnam Airlines — NEO | Chatbot hỗ trợ vé, hành lý, khiếu nại | Website/Zalo VNA |
| V-App — V-AI | Trợ lý voice/text, gợi ý theo ngữ cảnh | App V-App |
| App theo track nhóm | App thật nhóm đang chọn cho hackathon | Cần screenshot/link |

## 2. Dùng thử: promise vs reality

Ghi nhanh:

*   **Product hứa gì?** 
    *   **Moni:** Quản lý chi tiêu thảnh thơi, kiểm soát dòng tiền thông minh, tự động hóa theo dõi giao dịch (cả trong và ngoài MoMo), phân tích báo cáo trực quan theo yêu cầu riêng.
    *   **Mo247:** Luôn luôn có mặt 24/7 để giải đáp kỹ thuật, xử lý sự cố tức thì, chính xác và an toàn, giải quyết FAQ và tra cứu trạng thái giao dịch real-time không cần chờ tổng đài viên.
*   **User nào được hứa sẽ được giúp?** Người dùng đại chúng của hệ sinh thái MoMo, những người cần tối ưu hóa cách dùng tiền hàng ngày và cần một điểm chạm dịch vụ an toàn, thông suốt khi gặp sự cố giao dịch.
*   **Bạn kỳ vọng AI làm được task nào?**
    1.  Moni bóc tách được các khoản chi tự do do user nhập thủ công từ bên ngoài (tiền mặt, bank ngoài).
    2.  Moni phân tích sâu được hành vi chi tiêu theo các danh mục con (Sub-category) phức tạp (Ví dụ: Ăn uống $\rightarrow$ Nhà hàng vs Tự nấu).
    3.  Mo247 chủ động kiểm tra và xử lý lỗi giao dịch khi user báo bị trừ tiền mà người nhận chưa nhận được.
    4.  Mo247 nhận diện được luồng đính chính (Correction) khi user thay đổi ý định giữa chừng.
*   **Khi dùng thật, điểm gãy xuất hiện ở đâu?**
    *   **Điểm gãy 1 (Moni - Dữ liệu rỗng):** Khi user yêu cầu bóc tách chi tiêu ăn uống thành "nhà hàng" và "tự nấu", Moni trả về $0đ$ (do chưa có dữ liệu đầu tháng) nhưng đứng hình tại đó, trải nghiệm bị "cụt" và không có gợi ý/hướng dẫn nào tiếp theo để user xử lý luồng dữ liệu trống này.
    *   **Điểm gãy 2 (Mo247 - Ép nhập mã giao dịch):** Khi user báo lỗi chuyển tiền ngân hàng, Mo247 máy móc chặn đứng cuộc hội thoại bằng câu lệnh yêu cầu mã TID (11 ký tự) và tuyên bố *"Em không thể hỗ trợ nếu không có TID"*. Hệ thống bắt user làm thủ công (thoát chat $\rightarrow$ tìm lịch sử $\rightarrow$ copy mã) thay vì tự động truy vấn danh sách giao dịch gần nhất để user chọn.

Evidence cần có:

*   **Screenshot:** `image.png`, `image_2.png`, `image_3.png`, `image_4.png`
*   **Prompt/Input đã thử và hành vi quan sát được:**
    *   *Input 1:* "mình vừa đưa tiền mặt cho bạn 500k... sáng nay chuyển khoản ngân hàng ngoài Momo mất 120k tiền cafe..." $\rightarrow$ *Hành vi:* Moni nhận diện và bóc tách thực thể rất chính xác, tự động phân loại danh mục "Ăn uống" và "Người thân".
    *   *Input 2:* "tháng này mình chi tiêu cho ăn uống hết bao nhiêu rồi? trong số đó có bao nhiêu tiền là đi ăn nhà hàng, bao nhiêu tiền là mua đồ về tự nấu" $\rightarrow$ *Hành vi:* Moni báo $0đ$ cho cả danh mục tổng lẫn danh mục con từ ngày 01/06 đến 03/06 và kết thúc bằng một câu hỏi gợi ý xem tháng trước chung chung.
    *   *Input 3:* "Hôm qua mình có chuyển tuần ngân hàng qua Momo lúc 4h chiều nhưng người nhận bảo vẫn chưa nhận được... Kiểm tra hộ mình giao dịch đó..." $\rightarrow$ *Hành vi:* Mo247 từ chối xử lý và bắt buộc phải nhập mã TID.
    *   *Input 4:* "Mình muốn huỷ liên kết tài khoản ngân hàng VCB... à mà thôi huỷ cái ví trả góp cơ..." $\rightarrow$ *Hành vi:* Mo247 xử lý tốt luồng Correction, nhận diện được thực thể đúng ở cuối câu ("Ví Trả Góp/Ví Trả Sau") và đưa ra hướng dẫn chính xác.

## 3. Vẽ 4 paths

| Path | Câu hỏi cần trả lời | Trạng thái thực tế trên App MoMo |
|---|---|---|
| **Happy** | Khi AI đúng và tự tin, user thấy gì? | User thấy Moni bóc tách text tự do thành các thẻ chi phí (Card UI) hiển thị tường minh số tiền, phân loại danh mục tự động và cập nhật ngay vào báo cáo tổng (`image.png`). |
| **Low-confidence** | Khi AI không chắc, hệ thống có hỏi lại, show options hoặc chuyển người không? | Chưa tốt ở luồng tra cứu giao dịch lỗi (`image_4.png`). Thay vì đưa ra các options giao dịch gần nhất để user chọn (khi độ tự tin thấp/chưa có mã), hệ thống từ chối xử lý luôn cho đến khi user nhập đúng mã TID. |
| **Failure** | Khi AI sai, user biết bằng cách nào và sửa thế nào? | Khi Moni gặp tình trạng dữ liệu rỗng ($0đ$ ở `image_2.png`), hệ thống không đưa ra giải pháp/nút bấm để user tạo nhanh giao dịch hoặc hướng dẫn user cách gắn tag "nhà hàng/tự nấu" để phục vụ cho việc bóc tách dữ liệu tương lai. |
| **Correction** | Khi user sửa, correction có được lưu/log/học lại không hay biến mất? | Xử lý tốt trong câu thoại (`image_4.png`). Khi user sửa ý định từ hủy VCB sang hủy Ví trả góp, AI nhận biết được thực thể cuối cùng và bẻ lái flow hướng dẫn thành công. Tuy nhiên, chưa có nút bấm "Undo" (Hoàn tác) trên UI tổng thể nếu user lỡ bấm nhầm nút. |

## 4. Viết finding thành quyết định

### Finding 1: Điểm gãy tại Luồng Tra cứu Giao dịch Lỗi của Mo247 (`image_4.png`)
*   **Khi user:** Gặp sự cố chuyển tiền bị trừ tiền nhưng người nhận chưa nhận được và yêu cầu Mo247 kiểm tra,
*   **AI/product:** Bị gãy flow (Failure) do máy móc yêu cầu user phải cung cấp chính xác mã giao dịch TID 11 ký tự thì mới chịu xử lý,
*   **Hậu quả là:** User bị kẹt, buộc phải thực hiện một chuỗi thao tác thủ công phức tạp (thoát chat $\rightarrow$ vào Lịch sử giao dịch $\rightarrow$ tìm kiếm $\rightarrow$ copy mã $\rightarrow$ quay lại chat), gây ức chế cao trong tình huống đang lo lắng về tiền bạc.
*   **Lỗi thuộc layer:** `Data-tool` (Chưa tích hợp API truy vấn ngược lịch sử giao dịch vào chatbot) + `UX Recovery` (Thiếu phần hiển thị danh sách trực quan).
*   **Nên sửa bằng:** `Fallback + UX`. Khi nhận diện intent "giao dịch lỗi/chưa nhận được tiền", chatbot sẽ tự động gọi API lịch sử giao dịch để hiển thị danh sách 3 giao dịch gần nhất hoặc giao dịch đang bị treo/chờ xử lý dưới dạng các Thẻ bấm chọn (Clickable Cards). User chỉ cần bấm vào giao dịch hiển thị sẵn thay vì phải đi tìm mã TID thủ công.

### Finding 2: Điểm gãy tại Luồng Phân tích Chi tiêu Rỗng của Moni (`image_2.png`)
*   **Khi user:** Hỏi phân tích sâu về các danh mục con chi tiêu (Ví dụ: Nhà hàng vs Tự nấu) vào thời điểm đầu tháng khi chưa phát sinh dữ liệu,
*   **AI/product:** Trả về kết quả $0đ$ (True nhưng không hữu ích) và kết thúc hội thoại bằng câu hỏi gợi ý dạng text tĩnh,
*   **Hậu quả là:** User nhận được một trải nghiệm "cụt", không biết làm thế nào để kích hoạt hoặc sử dụng tính năng phân tách danh mục này cho các giao dịch sắp tới.
*   **Lỗi thuộc layer:** `UX Recovery`.
*   **Nên sửa bằng:** `UX / Requirement`. Bổ sung các Nút bấm hành động (Action Buttons) kèm theo như: `[Xem phân tích tháng trước]`, `[Hướng dẫn gắn tag Nhà hàng / Tự nấu]`, hoặc `[Tạo nhanh mục chi tiêu mới]`.

## 5. Sketch as-is / to-be

Chúng ta sẽ tập trung sửa **Path yếu nhất và gây nghẽn nghiêm trọng nhất**: Luồng tra cứu lỗi giao dịch của Mo247 (`image_4.png`).

### Cột 1: As-is Flow (Hiện tại - Bị kẹt ở bước đòi mã TID)

```mermaid
graph TD
    A([User: Báo lỗi giao dịch chuyển tiền]) --> B[Mo247: Nhận diện Intent Lỗi Giao Dịch]
    B --> C{Có mã TID trong câu lệnh?}
    C -- Không --> D[Mo247: Từ chối xử lý + Đòi mã TID 11 ký tự]
    D --> E[X USER BỊ KẸT X]
    E --> F[User phải thoát chat thủ công]
    F --> G[Vào Lịch sử GD -> Tìm mã -> Copy]
    G --> H[Quay lại chat -> Paste mã TID]
    H --> I[Mo247: Tiến hành kiểm tra]
    C -- Có --> I