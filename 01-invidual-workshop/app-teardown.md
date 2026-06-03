# Workshop — Mổ App AI Thật: MoMo — Moni

Họ và tên: Lương Thị Hồng Nhung Mã HV: 2A202600811


## 0. Mục tiêu

Mục tiêu không phải chấm UI đẹp hay xấu. Mục tiêu là dùng sản phẩm AI thật như một bài needfinding: tìm chỗ product gãy trong workflow thật, rồi viết finding đó thành quyết định product.

---

## 1. Chọn sản phẩm để dùng thử

| Sản phẩm | AI feature | Cách truy cập |
|---|---|---|
| MoMo — Moni | Trợ thủ tài chính, phân tích chi tiêu, chatbot tìm ưu đãi | App MoMo |

---

## 2. Promise vs Reality

### Product hứa gì?

Moni hứa sẽ là trợ thủ trong app MoMo: hỗ trợ quản lý chi tiêu, phân tích lịch sử giao dịch, gợi ý tiết kiệm và tìm ưu đãi/khuyến mãi phù hợp với nhu cầu của người dùng.

### User nào được hứa sẽ được giúp?

Người dùng MoMo muốn hỏi nhanh về ưu đãi, ăn uống, giải trí, đi lại hoặc quản lý ngân sách cá nhân mà không phải tự tìm trong nhiều màn hình của app.

### Kỳ vọng AI làm được task nào?

Khi user hỏi:

- “Ưu đãi Highlands hiện có trên MoMo”
- “Mua vé trượt băng ở Royal vào thứ 7 có mã nào rẻ không”
- “Tôi có 800.000đ/tháng để chi tiêu ăn uống thì quản lý thế nào”
- “Tìm món ăn khoảng 30.000đ để mua luôn”
- “Dựa vào lịch sử chi tiêu tạo dashboard cho tôi xem”
- “Lịch sử dữ liệu chi tiêu cả năm 2026 từ đầu năm đến giờ tôi chi tiêu cho gì nhiều nhất”

AI cần hiểu đúng intent, kiểm tra dữ liệu thật trong app, trả lời có nguồn/thẻ liên quan, và nếu không có dữ liệu phù hợp thì nói rõ không có thay vì đưa kết quả lệch.

### Điểm gãy chính

Moni làm tốt khi query khớp kho ưu đãi rõ ràng như **Highlands**. Nhưng khi query mơ hồ, không có sản phẩm trực tiếp, hoặc cần phân tích sâu như **chi tiêu nhiều nhất theo nhóm**, AI dễ trả lời tự tin nhưng chưa giải quyết đúng nhu cầu chính.

---

## 3. Evidence

| ID | Input / Prompt đã thử | Hành vi quan sát được | Nhận xét |
|---|---|---|---|
| E01 | “Ưu đãi Highlands hiện có trên MoMo” | Moni trả danh sách ưu đãi Highlands: 25K, 15K, 20K và hiển thị thẻ ưu đãi. | Happy path hoạt động tốt vì brand rõ và có dữ liệu ưu đãi. |
| E02 | “Tôi muốn mua vé trượt băng ở Royal vào thứ 7 có mã hay cách nào rẻ không” | Moni nói sẽ tìm ưu đãi liên quan nhưng không trả kết quả cụ thể. | Low-confidence chưa rõ, AI không nói có/không có deal trực tiếp. |
| E03 | “Trượt băng ở Royal bạn có không” | Moni hiển thị thẻ giảm giá vé xe khách 50K. | Card lệch intent: user hỏi trượt băng, AI đưa vé xe khách. |
| E04 | “Tháng này tôi có 800.000đ để chi tiêu ăn uống các thứ phải làm sao để quản lý chi tiêu” | Moni gợi ý chia ngân sách theo tuần, theo nhóm chi tiêu, ghi chép hằng ngày. | Câu trả lời hữu ích nhưng còn generic, chưa dựa nhiều vào dữ liệu cá nhân. |
| E05 | Sau phần quản lý chi tiêu | Moni gợi ý ưu đãi Phúc Long. | Deal đồ uống không trực tiếp giải quyết bài toán lập ngân sách ăn uống. |
| E06 | “Bạn không có cách nào tìm cho tôi món ăn 30k để mua luôn à” | Moni hiểu nhu cầu món ăn khoảng 30K nhưng vẫn đưa ưu đãi Phúc Long. | AI hiểu text nhưng card chưa khớp: đồ uống không phải món ăn mua ngay. |
| E07 | “Tôi muốn ăn cơm” | Moni nói sẽ tìm deal cơm nhưng hiển thị ưu đãi The Pizza Company, đơn từ 500K. | Lệch category và lệch ngân sách. |
| E08 | “Dựa vào lịch sử chi tiêu tạo dashboard cho tôi xem” | Moni tạo bảng giao dịch gần nhất: tổng giao dịch 1, tổng chi tiêu 8.172đ, giao dịch nổi bật là Quyên góp Trái tim MoMo. | Gọi là dashboard nhưng chủ yếu là bảng tóm tắt, chưa có biểu đồ, nhóm chi tiêu, xu hướng hoặc insight. |
| E09 | “Lịch sử dữ liệu chi tiêu cả năm 2026 từ đầu năm đến giờ tôi chi tiêu cho gì nhiều nhất” | Moni trả tổng tiền 7.273.733đ, tổng giao dịch 63, trung bình mỗi ngày 47.232đ, rồi hỏi user có muốn phân tích theo nhóm không. | User hỏi “chi tiêu cho gì nhiều nhất”, nhưng AI chưa trả top danh mục/top merchant. Đây là failure về intent phân tích dữ liệu. |

---

## 4. Vẽ 4 paths

| Path | Câu hỏi cần trả lời | Quan sát với Moni | Product decision |
|---|---|---|---|
| Happy | Khi AI đúng và tự tin, user thấy gì? | Với query “Ưu đãi Highlands”, Moni hiểu đúng brand và trả thẻ ưu đãi liên quan. | Giữ behavior này: trả lời ngắn, có điều kiện dùng, có thẻ sản phẩm, có nguồn rõ. |
| Low-confidence | Khi AI không chắc, hệ thống có hỏi lại, show options hoặc chuyển người không? | Với “trượt băng Royal” hoặc “món ăn 30K”, Moni chưa hỏi lại mà đoán intent rồi đưa deal gần đúng hoặc lệch. | Cần hỏi lại bằng chip: “vé trượt băng”, “ăn uống ở Royal”, “di chuyển tới Royal”, “deal gần đó”. |
| Failure | Khi AI sai, user biết bằng cách nào và sửa thế nào? | User phải tự nhận ra card sai, ví dụ vé xe khách cho trượt băng, pizza 500K cho ăn cơm. | Nếu không có match trực tiếp, AI phải nói rõ “chưa tìm thấy ưu đãi phù hợp”, không show card lệch như kết quả chính. |
| Correction | Khi user sửa, correction có được lưu/log/học lại không? | User bấm “Không” hoặc hỏi lại, nhưng hệ thống vẫn có thể trả lời lệch tiếp. | Cần log correction: input gốc, intent dự đoán, card đã show, lý do user không hài lòng, intent đúng sau khi user sửa. |
| Analytics path | Khi user hỏi dữ liệu chi tiêu, AI có trả đúng insight không? | User hỏi “chi tiêu cho gì nhiều nhất”, Moni chỉ trả tổng tiền, số giao dịch, trung bình/ngày. | Cần phân tích top danh mục/top merchant/top giao dịch theo amount, percent, số lần, và có drill-down. |

---

## 5. Finding viết thành quyết định product

### Finding 1 — Query giải trí bị trả deal không liên quan

**Khi user** hỏi “trượt băng ở Royal bạn có không”,  
**AI/product** không xác nhận có hay không có ưu đãi trượt băng, rồi hiển thị thẻ giảm giá vé xe khách,  
**hậu quả là** user mất niềm tin vì kết quả không liên quan đến nhu cầu chính.  

**Lỗi thuộc layer:** Intent + Data/Tool + UX Recovery  

**Nên sửa bằng:**  
Nếu không có deal trực tiếp theo địa điểm/hoạt động, trả lời:

> “Hiện Moni chưa tìm thấy ưu đãi trượt băng Royal trên MoMo.”

Sau đó mới gợi ý các lựa chọn thay thế như ăn uống ở Royal, phương tiện đi đến Royal, hoặc ưu đãi giải trí gần đó.

**Metric / signal:**  
Irrelevant-card rate cho query giải trí/địa điểm; correction success rate sau khi user hỏi lại.

---

### Finding 2 — Query món ăn 30K bị trả ưu đãi không đúng nhu cầu

**Khi user** hỏi “món ăn khoảng 30.000đ để mua luôn”,  
**AI/product** hiểu đúng khoảng giá ở phần text nhưng thẻ ưu đãi lại là đồ uống hoặc không đảm bảo mua được món ăn 30K,  
**hậu quả là** user không thể hành động ngay.  

**Lỗi thuộc layer:** Data/Tool + Product Promise  

**Nên sửa bằng:**  
Tool tìm ưu đãi cần filter:

- `category = food / meal`
- `final_price <= 30000` hoặc gần 30K
- `purchasable_now = true`
- `merchant_available = true`

Nếu không có, AI phải nói rõ:

> “Hiện chưa có món ăn mua ngay khoảng 30K trên MoMo.”

**Metric / signal:**  
Deal-fit rate theo ngân sách; số lần user phải sửa prompt.

---

### Finding 3 — Query “ăn cơm” bị hiểu sai category

**Khi user** hỏi “tôi muốn ăn cơm”,  
**AI/product** nói sẽ tìm deal cơm nhưng lại hiển thị ưu đãi The Pizza Company đơn từ 500K,  
**hậu quả là** AI trông như chỉ keyword-match chứ không hiểu nhu cầu bữa ăn tiết kiệm.  

**Lỗi thuộc layer:** Intent + Data/Tool  

**Nên sửa bằng:**  
Xây taxonomy món ăn rõ hơn:

- `cơm`
- `suất ăn`
- `bữa chính`
- `đồ uống`
- `pizza`
- `ăn vặt`

Nếu không có deal cơm, không được show pizza như kết quả chính. Chỉ được show nếu gắn nhãn:

> “Không có deal cơm phù hợp, đây là gợi ý thay thế.”

**Metric / signal:**  
Category precision@card; tỷ lệ card đúng category sau query sửa.

---

### Finding 4 — Feedback “Không” chưa tạo recovery loop tốt

**Khi user** bấm “Không” hoặc hỏi lại vì câu trả lời chưa đúng,  
**AI/product** xin lỗi nhưng chưa hỏi lý do cụ thể, chưa lọc lại kết quả ngay trong phiên,  
**hậu quả là** correction của user bị lãng phí và lỗi có thể lặp lại.  

**Lỗi thuộc layer:** UX Recovery + Automation  

**Nên sửa bằng:**  
Sau dislike, hiển thị 3 lựa chọn:

- “Không liên quan”
- “Sai ngân sách”
- “Không mua được ngay”

Sau đó AI dùng lý do này để lọc lại kết quả và lưu correction log.

**Metric / signal:**  
Correction recovery rate; duplicate failure rate sau dislike.

---

### Finding 5 — Dashboard chi tiêu chưa trả đúng câu hỏi “chi tiêu cho gì nhiều nhất”

**Khi user** hỏi “lịch sử dữ liệu chi tiêu cả năm 2026 từ đầu năm đến giờ tôi chi tiêu cho gì nhiều nhất”,  
**AI/product** chỉ trả tổng tiền đã chi, tổng số giao dịch và chi tiêu trung bình mỗi ngày,  
**hậu quả là** user vẫn chưa biết nhóm chi tiêu/merchant/giao dịch nào chiếm nhiều tiền nhất, phải hỏi thêm một lượt nữa.  

**Lỗi thuộc layer:** Intent + Data/Tool + Analytics UX  

**Nên sửa bằng:**  
Khi detect intent `top_spending_analysis`, Moni phải trả ngay:

- Top 3 danh mục chi tiêu nhiều nhất
- Tổng tiền từng danh mục
- Tỷ trọng %
- Số giao dịch
- Giao dịch/merchant nổi bật
- Gợi ý hành động tiết kiệm nếu có

Ví dụ output nên là:

| Hạng | Danh mục | Tổng tiền | Tỷ trọng | Số giao dịch | Nhận xét |
|---|---:|---:|---:|---:|---|
| 1 | Ăn uống | 2.300.000đ | 31.6% | 22 | Chi nhiều nhất, nên đặt hạn mức tuần |
| 2 | Di chuyển | 1.100.000đ | 15.1% | 12 | Có thể tìm voucher xe/công nghệ |
| 3 | Mua sắm | 900.000đ | 12.3% | 5 | Nên cảnh báo khi vượt ngân sách |

Nếu dữ liệu thiếu hoặc không phân loại được, AI cần nói rõ:

> “Moni thấy 63 giao dịch nhưng một số giao dịch chưa có danh mục rõ. Mình sẽ nhóm theo dữ liệu hiện có trước.”

**Metric / signal:**  
Top-spending answer completion rate; số lần user phải hỏi lại để nhận được top category; tỷ lệ giao dịch phân loại được.

---

## 6. Sketch as-is / to-be

| As-is: flow hiện tại | To-be: flow đề xuất |
|---|---|
| User hỏi nhu cầu cụ thể. | User hỏi nhu cầu cụ thể. |
| Moni phân tích câu hỏi và sinh câu trả lời khá tự tin. | Moni detect intent + category + budget + location + time range. |
| Nếu query khớp dữ liệu rõ như Highlands, Moni trả đúng thẻ ưu đãi. | Nếu có match tốt, Moni trả thẻ đúng với điều kiện dùng và nút mua/lưu. |
| Nếu query không có dữ liệu trực tiếp, Moni vẫn cố trả card gần đúng. | Nếu không có match, Moni nói rõ “chưa tìm thấy ưu đãi phù hợp”. |
| Điểm gãy: card lệch intent, ví dụ vé xe khách cho trượt băng, pizza cho ăn cơm. | Deal thay thế phải được gắn nhãn “gợi ý thay thế”, không được trình bày như kết quả chính. |
| Với dashboard, Moni trả tổng quan nhưng chưa trả insight user hỏi: “chi tiêu cho gì nhiều nhất”. | Với câu hỏi phân tích chi tiêu, Moni trả top danh mục/top merchant/top giao dịch ngay trong câu đầu. |
| User bấm “Không” hoặc hỏi lại, nhưng correction chưa được tận dụng tốt. | Sau dislike, Moni hỏi lý do, lọc lại kết quả và lưu correction log. |

---

## 7. SPEC fields đề xuất

| ID | Requirement |
|---|---|
| REQ01 | Không show thẻ ưu đãi nếu category/location/budget không khớp với intent chính, trừ khi gắn nhãn rõ là “gợi ý thay thế”. |
| REQ02 | Với query không có sản phẩm trong kho, trả lời rõ “chưa tìm thấy trên MoMo” và đề xuất bước tiếp theo. |
| REQ03 | Với query mơ hồ, phải vào low-confidence path: hỏi lại hoặc đưa options, không đoán quá tự tin. |
| REQ04 | Sau feedback “Không”, phải thu lý do và retry bằng filter mới trong cùng phiên. |
| REQ05 | Log correction gồm: input, intent dự đoán, card đã show, feedback, lý do, intent đúng sau khi user sửa. |
| REQ06 | Với câu hỏi dashboard/chi tiêu, phải phân biệt intent: tổng quan, top spending, so sánh theo tháng, cảnh báo ngân sách. |
| REQ07 | Với intent `top_spending_analysis`, phải trả top danh mục/top merchant thay vì chỉ trả tổng tiền và số giao dịch. |

---

## 8. Test cases

| ID | Input | Expected behavior |
|---|---|---|
| T01 | “Ưu đãi Highlands hiện có trên MoMo” | Trả card Highlands; không trả thương hiệu khác. |
| T02 | “Trượt băng ở Royal bạn có không” | Nếu không có deal trực tiếp, nói rõ không có; không trả vé xe khách như kết quả chính. |
| T03 | “Tôi muốn món ăn 30k để mua luôn” | Chỉ trả món ăn có final price gần hoặc dưới 30K và mua được ngay; nếu không có thì nói không có. |
| T04 | “Tôi muốn ăn cơm” | Ưu tiên cơm/suất ăn/bữa chính; không trả pizza/đồ uống nếu không ghi rõ là thay thế. |
| T05 | User bấm “Không” sau một card lệch | Hỏi lý do hoặc lọc lại theo intent đã sửa; không lặp lại cùng loại card sai. |
| T06 | “Dựa vào lịch sử chi tiêu tạo dashboard cho tôi xem” | Trả dashboard đúng nghĩa: tổng chi, số giao dịch, biểu đồ/tỷ trọng theo danh mục, top giao dịch, xu hướng theo thời gian. Nếu chỉ có 1 giao dịch gần nhất, phải nói rõ giới hạn dữ liệu. |
| T07 | “Lịch sử dữ liệu chi tiêu cả năm 2026 từ đầu năm đến giờ tôi chi tiêu cho gì nhiều nhất” | Trả ngay top danh mục/top merchant/top giao dịch chi nhiều nhất, kèm số tiền, tỷ trọng %, số giao dịch. Không chỉ trả tổng tiền, tổng giao dịch, trung bình/ngày rồi hỏi lại. |

---

## 9. Kết luận ngắn

Moni có nền tảng tốt khi truy vấn rõ và có dữ liệu trực tiếp, ví dụ ưu đãi Highlands. Nhưng ở các luồng cần hiểu sâu hơn như tìm deal theo bối cảnh, ngân sách, món ăn cụ thể hoặc phân tích chi tiêu, sản phẩm đang thiếu low-confidence path và recovery loop.

Product decision quan trọng nhất: **đừng để AI trả lời tự tin khi dữ liệu không khớp**. Cần có SPEC rõ cho intent, data filter, fallback, correction log và test case chống trả card lệch.
