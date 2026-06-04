# Workshop — Mổ App AI Thật

**Thời gian:** 35-45 phút  
**Hình thức:** cá nhân trước, chia sẻ theo nhóm sau  
**Output:** finding note + sketch `as-is / to-be`

Mục tiêu không phải chấm "UI đẹp hay xấu". Mục tiêu là dùng sản phẩm thật như một bài needfinding: tìm chỗ product gãy trong workflow thật, rồi viết finding đó thành quyết định product.

## 1. Chọn một sản phẩm để dùng thử

| Sản phẩm | AI feature | Cách truy cập |
|---|---|---|
| MoMo — Moni | Trợ thủ tài chính, phân tích chi tiêu, chatbot | App MoMo |
| Vietnam Airlines — NEO | Chatbot hỗ trợ vé, hành lý, khiếu nại | Website/Zalo VNA |
| V-App — V-AI | Trợ lý voice/text, gợi ý theo ngữ cảnh | App V-App |

**Sản phẩm được chọn:** MoMo — Moni  
**Track:** D · Personal Finance  
**Flow dùng thử:** Hỏi Moni phân tích khoản chi tiêu lớn nhất trong tháng.

---

## 2. Dùng thử: promise vs reality

Ghi nhanh:

- **Product hứa gì?**  
  MoMo — Moni được đặt trong app MoMo như một trợ thủ AI tài chính. Product tạo kỳ vọng rằng Moni có thể giúp người dùng hiểu tình hình chi tiêu, phân tích dòng tiền, theo dõi các nhóm chi tiêu và đưa ra gợi ý quản lý tài chính cá nhân.

- **User nào được hứa sẽ được giúp?**  
  User là người dùng MoMo hằng ngày, có nhiều giao dịch nhỏ như ăn uống, mua sắm, chuyển tiền hoặc thanh toán dịch vụ. User không muốn tự mở từng giao dịch để cộng tay, mà kỳ vọng AI có thể đọc dữ liệu giao dịch và trả lời thành insight dễ hiểu.

- **Bạn kỳ vọng AI làm được task nào?**  
  Task kỳ vọng là trả lời câu hỏi:

  ```text
  Tháng 5 tôi tiêu nhiều nhất vào khoản nào?
  ```

  Với câu hỏi này, một trợ lý tài chính cá nhân nên có khả năng:

  - đọc dữ liệu giao dịch trong tháng 5;
  - gom giao dịch theo danh mục;
  - tính tổng tiền từng danh mục;
  - xếp hạng nhóm chi tiêu từ cao xuống thấp;
  - trả lời trực tiếp khoản nào tiêu nhiều nhất;
  - đưa ra bước tiếp theo để user hành động.

- **Khi dùng thật, điểm gãy xuất hiện ở đâu?**  
  Điểm gãy nằm ở bước **xếp hạng nhóm chi tiêu**. Moni lấy được tổng chi tiêu tháng 5, số lượng giao dịch và trung bình chi tiêu mỗi ngày. Tuy nhiên, khi user hỏi trực tiếp “tiêu nhiều nhất vào khoản nào”, Moni không trả lời ngay nhóm chi tiêu cao nhất. Thay vào đó, Moni hỏi user muốn xem nhóm nào trước như Ăn uống, Giải trí hoặc Mua sắm.

Evidence cần có:

- **Screenshot:** có screenshot test thực tế với MoMo Moni.

  Gợi ý đặt ảnh trong repo:

  ```text
  evidence/
  ├── momo-moni-1.jpg
  ├── momo-moni-2.jpg
  └── momo-moni-3.jpg
  ```

- **Quote từ app/web/review:**

  ```text
  Moni nói chưa thấy thông tin chi tiết về khoản nào là nhiều nhất, dù sau đó có thể trả dữ liệu nhóm Ăn uống là 473.000đ và Mua sắm là 0đ.
  ```

- **Prompt/input đã thử:**

  | Lần thử | Prompt / input | Hành vi quan sát được |
  |---|---|---|
  | Query 1 | “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?” | Moni trả tổng chi tiêu **836.346đ**, có **23 giao dịch**, trung bình **26.978đ/ngày**, nhưng chưa trả lời trực tiếp khoản nào nhiều nhất. |
  | Query 2 | “Xem chi tiêu theo nhóm tháng trước” | Moni vẫn trả tổng **836.346đ**, nhưng nói chưa có phân tích chi tiêu theo từng nhóm cụ thể và hỏi user muốn xem nhóm nào trước. |
  | Query 3 | “ăn uống” | Moni trả nhóm **Ăn uống: 473.000đ**, có **16 giao dịch**, trung bình **15.258đ/ngày**. |
  | Query 4 | “Xem chi tiêu nhóm Mua sắm” | Moni trả nhóm **Mua sắm: 0đ**, có **0 giao dịch**. |
  | Query 5 | “vậy số tiền tiêu còn lại ở đâu” | Moni tính phần còn lại là **363.346đ**, thuộc các nhóm khác như Giải trí, Di chuyển, Nhà cửa... |

- **Hành vi quan sát được:**  
  Vấn đề không phải Moni hoàn toàn không có dữ liệu. Moni có thể lấy được tổng chi tiêu và có thể trả dữ liệu của từng nhóm nếu user hỏi riêng. Vấn đề là Moni chưa tự chuyển dữ liệu thành insight đúng với intent “khoản nào nhiều nhất”.

---

## 3. Vẽ 4 paths

| Path | Câu hỏi cần trả lời |
|---|---|
| Happy | Khi AI đúng và tự tin, user thấy gì? |
| Low-confidence | Khi AI không chắc, hệ thống có hỏi lại, show options hoặc chuyển người không? |
| Failure | Khi AI sai, user biết bằng cách nào và sửa thế nào? |
| Correction | Khi user sửa, correction có được lưu/log/học lại không hay biến mất? |

### Áp dụng vào MoMo — Moni

| Path | Quan sát trong Moni | Đánh giá |
|---|---|---|
| Happy | Khi user hỏi riêng “ăn uống”, Moni trả được số tiền **473.000đ**, số giao dịch **16**, trung bình/ngày **15.258đ**. | Moni có khả năng trả dữ liệu category nếu user chỉ định rõ nhóm. |
| Low-confidence | Moni hỏi user muốn xem nhóm nào trước: Ăn uống, Giải trí, Mua sắm. | Có hỏi lại, nhưng hỏi lại chưa đúng. User hỏi “khoản nào nhiều nhất”, không phải hỏi “tôi nên chọn nhóm nào”. |
| Failure | Moni không trả lời trực tiếp nhóm chi tiêu cao nhất. User phải hỏi tiếp từng nhóm và tự suy luận. | Đây là path yếu nhất: **category ranking failure**. |
| Correction | Trong flow test chưa thấy cơ chế sửa phân loại giao dịch hoặc lưu correction. | Product thiếu recovery path để user sửa nhóm chi tiêu nếu AI phân loại chưa đúng. |

### Path yếu nhất

**Category ranking failure path** — Moni không tự xếp hạng nhóm chi tiêu dù có một phần dữ liệu.

```text
User hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”
→ Moni trả tổng chi tiêu tháng 5
→ Moni không trả lời nhóm cao nhất
→ Moni yêu cầu user chọn từng nhóm
→ User hỏi “ăn uống”
→ Moni trả Ăn uống = 473.000đ
→ User hỏi “mua sắm”
→ Moni trả Mua sắm = 0đ
→ User hỏi “vậy số tiền còn lại ở đâu”
→ Moni mới giải thích phần còn lại = 363.346đ
→ User phải tự suy luận ranking
```

---

## 4. Viết finding thành quyết định

Không viết:

```text
Bot ngu, trả lời sai.
```

Viết:

```text
Khi user hỏi “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”,
AI/product lấy được tổng chi tiêu và một số dữ liệu theo nhóm, nhưng không tự gom nhóm và xếp hạng để trả lời trực tiếp nhóm chi tiêu lớn nhất.
Hậu quả là user phải hỏi từng nhóm riêng lẻ như “ăn uống”, “mua sắm”, rồi hỏi tiếp “vậy số tiền còn lại ở đâu” để tự suy luận tiền của mình đi đâu.
Lỗi thuộc layer Intent + Data-tool + UX Recovery.
Nên sửa bằng requirement category ranking: khi user hỏi “tiêu nhiều nhất”, “khoản nào cao nhất”, “top chi tiêu”, Moni phải tự xếp hạng nhóm chi tiêu, trả top category, hiển thị phần chưa phân loại và đưa action để xem hoặc sửa giao dịch.
```

### Product decision

**Product decision:**  
Moni cần ưu tiên sửa flow **category ranking** cho các câu hỏi dạng “tiêu nhiều nhất vào khoản nào” trước khi mở rộng thêm tính năng mới.

Với một trợ lý tài chính cá nhân, câu trả lời không nên dừng ở tổng chi tiêu và số giao dịch. Moni cần chuyển dữ liệu giao dịch thành insight có thể hành động:

```text
Dữ liệu giao dịch
→ nhóm chi tiêu
→ xếp hạng
→ giải thích phần chưa rõ
→ đưa hành động tiếp theo
```

### Requirement đề xuất

- Nếu user hỏi “tiêu nhiều nhất”, “khoản nào cao nhất”, “top chi tiêu”, hệ thống phải kích hoạt intent **category ranking**.
- Trả lời trực tiếp nhóm chi tiêu cao nhất.
- Hiển thị số tiền và tỷ lệ phần trăm so với tổng chi tiêu.
- Hiển thị top 3 nhóm chi tiêu.
- Tách rõ phần **Khác / chưa phân loại**.
- Có action button:
  - Xem giao dịch nhóm này;
  - So sánh với tháng trước;
  - Tạo ngân sách cho nhóm này;
  - Sửa phân loại giao dịch.

### Câu trả lời to-be mong muốn

```text
Trong tháng 5, khoản bạn tiêu nhiều nhất là Ăn uống: 473.000đ, chiếm khoảng 56,5% tổng chi tiêu tháng.

Tổng chi tiêu tháng 5: 836.346đ

Top nhóm chi tiêu:
1. Ăn uống: 473.000đ
2. Khác / chưa phân loại: 363.346đ
3. Mua sắm: 0đ

Mình thấy còn 363.346đ đang nằm trong nhóm Khác hoặc chưa phân loại rõ. Bạn muốn xem các giao dịch này, sửa phân loại, hay tạo ngân sách cho nhóm Ăn uống?
```

---

## 5. Sketch as-is / to-be

Vẽ 2 cột:

- **As-is:** flow hiện tại, đánh dấu điểm gãy.
- **To-be:** flow đề xuất, đánh dấu path đã sửa.

Không cần đẹp. Cần nhìn vào là hiểu:

- user làm gì,
- AI làm gì,
- lúc AI không chắc thì sao,
- lúc AI sai user recover thế nào.

| As-is: flow hiện tại | To-be: flow đề xuất |
|---|---|
| User mở MoMo và vào Trợ thủ AI Moni. | User mở MoMo và vào Trợ thủ AI Moni. |
| User hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?” | User hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?” |
| Moni lấy được tổng chi tiêu tháng 5. | Moni nhận diện intent: **category ranking / top spending**. |
| Moni trả tổng tiền, số giao dịch, trung bình/ngày. | Moni lấy dữ liệu giao dịch tháng 5. |
| **Điểm gãy:** Moni không chỉ ra nhóm chi tiêu cao nhất. | Moni gom giao dịch theo category. |
| Moni hỏi user muốn xem nhóm Ăn uống, Giải trí hay Mua sắm. | Moni tính tổng từng category. |
| User phải hỏi từng nhóm riêng lẻ. | Moni xếp hạng category từ cao xuống thấp. |
| Moni trả từng mảnh dữ liệu. | Moni trả lời trực tiếp nhóm cao nhất. |
| User tự suy luận nhóm nào nhiều nhất. | Moni hiển thị top 3 nhóm và phần Khác / chưa phân loại. |
| Không có action để sửa phân loại hoặc xem giao dịch liên quan. | Moni đưa action: xem giao dịch, so sánh tháng trước, tạo ngân sách, sửa phân loại. |

### As-is flow

```text
User mở MoMo
→ Vào Trợ thủ AI - Moni
→ Hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”
→ Moni lấy được tổng chi tiêu tháng 5
→ Moni trả tổng tiền, số giao dịch, trung bình/ngày
→ Moni không chỉ ra ngay nhóm chi tiêu lớn nhất
→ Moni yêu cầu user chọn từng nhóm như Ăn uống, Giải trí, Mua sắm
→ User hỏi từng nhóm riêng lẻ
→ Moni trả số liệu từng nhóm
→ User hỏi tiếp “vậy số tiền còn lại ở đâu”
→ Moni giải thích phần còn lại
→ User phải tự suy luận nhóm nào tiêu nhiều nhất
```

### To-be flow

```text
User hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”
→ Moni nhận diện intent: category ranking / top spending
→ Moni lấy dữ liệu giao dịch tháng 5
→ Moni gom nhóm giao dịch theo category
→ Moni tính tổng tiền từng nhóm
→ Moni sắp xếp từ cao xuống thấp
→ Moni trả lời trực tiếp:
   “Ăn uống là nhóm cao nhất: 473.000đ”
→ Moni hiển thị top 3 nhóm chi tiêu
→ Moni tách phần “Khác / chưa phân loại”
→ Moni đưa action buttons:
   - Xem giao dịch nhóm này
   - So sánh với tháng trước
   - Tạo ngân sách cho nhóm này
   - Sửa phân loại giao dịch
```

### Lúc AI không chắc thì sao?

Nếu Moni không đủ dữ liệu hoặc nhiều giao dịch chưa được phân loại rõ, Moni không nên chỉ hỏi user muốn xem nhóm nào. Moni nên nói rõ trạng thái dữ liệu:

```text
Mình thấy tổng chi tiêu tháng 5 là 836.346đ.
Trong các giao dịch đã phân loại, nhóm cao nhất là Ăn uống: 473.000đ.
Tuy nhiên còn 363.346đ đang nằm trong nhóm Khác / chưa phân loại, nên ranking có thể thay đổi nếu bạn sửa phân loại.

Bạn muốn mình mở các giao dịch chưa phân loại để kiểm tra không?
```

### Lúc AI sai user recover thế nào?

Cần thêm correction path:

```text
User chọn “Sửa phân loại giao dịch”
→ Moni hiển thị các giao dịch trong nhóm Khác / chưa phân loại
→ User chọn một giao dịch
→ User đổi category, ví dụ từ “Khác” sang “Ăn uống”
→ Moni cập nhật lại ranking
→ Moni ghi correction log để lần sau phân loại tốt hơn
```

Ví dụ sau khi user sửa:

```text
Đã chuyển giao dịch “Highlands Coffee - 55.000đ” từ Khác sang Ăn uống.

Ranking mới:
1. Ăn uống: 528.000đ
2. Khác / chưa phân loại: 308.346đ
3. Mua sắm: 0đ

Mình sẽ dùng correction này để gợi ý phân loại tốt hơn cho các giao dịch tương tự.
```

---

## 6. Tự kiểm trước khi nộp

- [x] Có ít nhất 1 screenshot hoặc observation cụ thể.
- [x] Có đủ 4 paths hoặc nói rõ path nào chưa có trong product.
- [x] Finding được viết thành product decision, không chỉ là nhận xét.
- [x] Sketch có as-is và to-be.
- [x] Có một câu nói rõ finding này sẽ đổi gì trong SPEC.

### Câu nói rõ finding này sẽ đổi gì trong SPEC

Finding này sẽ đổi SPEC của Moni bằng cách thêm requirement:

```text
Mọi câu hỏi dạng “tiêu nhiều nhất”, “top chi tiêu”, “khoản nào cao nhất” phải kích hoạt category ranking flow. Moni phải trả top category kèm số tiền, tỷ lệ phần trăm, top 3 nhóm, phần Khác / chưa phân loại và action để user xem hoặc sửa giao dịch.
```
