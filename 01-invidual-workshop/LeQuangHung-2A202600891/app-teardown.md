# UX Workshop Cá Nhân — MoMo Moni

## 1. App được chọn

**App:** MoMo — Trợ thủ AI **Moni**  
**Nhóm app:** Personal Finance / ví điện tử / trợ lý tài chính cá nhân  
**Bài làm:** App teardown cá nhân — dùng thử app, vẽ as-is flow, tìm path yếu nhất và đề xuất to-be flow.

**Promise / kỳ vọng của app:**  
Moni được kỳ vọng là trợ thủ tài chính trong MoMo, giúp người dùng hiểu tình hình chi tiêu, theo dõi dòng tiền, xem các nhóm chi tiêu và nhận gợi ý quản lý tài chính cá nhân.



---

## 2. Mục tiêu kiểm thử

Mục tiêu test là kiểm tra xem Moni có thể trả lời một câu hỏi tài chính cá nhân rất cơ bản hay không:

> **“Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”**

Với một AI tài chính cá nhân, user thường kỳ vọng hệ thống có thể:

- đọc dữ liệu giao dịch trong tháng;
- gom nhóm giao dịch theo danh mục;
- tính tổng từng nhóm chi tiêu;
- xếp hạng nhóm chi tiêu từ cao xuống thấp;
- trả lời trực tiếp khoản nào tiêu nhiều nhất;
- đưa bước tiếp theo để user hành động, ví dụ xem giao dịch, so sánh tháng trước hoặc tạo ngân sách.

---

## 3. Kết quả test thực tế

### Query 1

**User:** “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”

**Moni trả lời:**

- Tổng chi tiêu tháng 5: **836.346đ**.
- Số giao dịch: **23**.
- Trung bình mỗi ngày: **26.978đ**.
- Tuy nhiên, Moni nói **chưa thấy thông tin chi tiết về khoản nào là nhiều nhất**.
- Moni hỏi user có muốn xem chi tiết từng nhóm như **Ăn uống, Giải trí, Mua sắm** hay không.

### Query 2

**User:** “Xem chi tiêu theo nhóm tháng trước”

**Moni trả lời:**

- Tổng chi tiêu tháng trước vẫn là **836.346đ**.
- Moni nói hiện tại chưa có phân tích chi tiêu theo từng nhóm cụ thể.
- Moni hỏi user muốn xem nhóm nào trước: **Ăn uống, Giải trí, hay Mua sắm**.

### Query 3

**User:** “Ăn uống”

**Moni trả lời:**

- Nhóm **Ăn uống** trong tháng 5 có tổng chi tiêu **473.000đ**.
- Có **16 giao dịch**.
- Trung bình mỗi ngày **15.258đ**.

### Query 4

**User:** “Xem chi tiêu nhóm Mua sắm”

**Moni trả lời:**

- Nhóm **Mua sắm** trong tháng 5 có tổng chi tiêu **0đ**.
- Có **0 giao dịch**.
- Trung bình mỗi ngày **0đ**.

### Query 5

**User:** “Vậy số tiền tiêu còn lại ở đâu?”

**Moni trả lời:**

- Tổng chi tiêu tháng 5: **836.346đ**.
- Ăn uống: **473.000đ**.
- Mua sắm: **0đ**.
- Các nhóm khác như **Giải trí, Di chuyển, Nhà cửa...** chiếm phần còn lại: **363.346đ**.

---

## 4. Screenshot evidence

Các ảnh dưới đây là bằng chứng test thực tế với MoMo Moni.

![Evidence 1 — Moni trả tổng chi tiêu nhưng chưa chỉ ra nhóm cao nhất](LeQuangHung-2A202600891/momo_moni_evidence_1.jpg)

**Evidence 1:** User hỏi khoản chi nhiều nhất. Moni trả tổng chi tiêu nhưng chưa chỉ ra ngay nhóm nào cao nhất.

![Evidence 2 — Moni phân tích nhóm Ăn uống](LeQuangHung-2A202600891/momo_moni_evidence_2.jpg)

**Evidence 2:** Khi user hỏi riêng “Ăn uống”, Moni trả được dữ liệu nhóm Ăn uống: **473.000đ**, **16 giao dịch**.

![Evidence 3 — Moni phân tích Mua sắm và số tiền còn lại](LeQuangHung-2A202600891/momo_moni_evidence_3.jpg)

**Evidence 3:** Khi hỏi thêm, Moni tính được **Mua sắm = 0đ** và phần còn lại thuộc các nhóm khác là **363.346đ**.

---

## 5. As-is flow hiện tại

```text
User mở MoMo
→ Vào Trợ thủ AI Moni
→ Hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”
→ Moni lấy được tổng chi tiêu tháng 5
→ Moni trả tổng tiền, số giao dịch, trung bình/ngày
→ Moni không chỉ ra ngay nhóm chi tiêu lớn nhất
→ Moni yêu cầu user chọn từng nhóm như Ăn uống, Giải trí, Mua sắm
→ User hỏi từng nhóm riêng lẻ
→ Moni trả số liệu từng nhóm
→ User phải tự suy luận nhóm nào tiêu nhiều nhất
```

---

## 6. User đang kẹt ở đâu?

User bị kẹt ở bước từ **dữ liệu tổng quan** sang **insight hành động**.

Moni có dữ liệu tổng chi tiêu, số giao dịch và có thể phân tích từng nhóm khi user hỏi tiếp. Tuy nhiên, Moni không tự động gom nhóm, xếp hạng category và chỉ ra nhóm chi tiêu cao nhất.

Vì vậy user phải tự hỏi từng nhóm một, ví dụ “Ăn uống”, “Mua sắm”, rồi tiếp tục hỏi “vậy số tiền còn lại ở đâu”. Điểm kẹt là user phải tự làm công việc phân tích mà AI đáng lẽ nên làm: so sánh các nhóm chi tiêu và rút ra insight chính.

Nói cách khác, Moni không fail ở việc lấy dữ liệu, mà fail ở bước **chuyển dữ liệu thành kết luận rõ ràng và hành động tiếp theo**.

---

## 7. Path yếu nhất

**Tên path yếu:**  
**Category ranking failure path** — path không tự xếp hạng nhóm chi tiêu.

### Mô tả vấn đề

Moni có dữ liệu chi tiêu, nhưng chưa tự động thực hiện bước quan trọng nhất:

```text
gom nhóm → tính tổng từng nhóm → xếp hạng → trả lời nhóm cao nhất
```

Khi user hỏi:

> “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”

Moni không trả lời trực tiếp rằng nhóm **Ăn uống** đang cao nhất, dù sau đó Moni có thể cung cấp dữ liệu:

- Ăn uống: **473.000đ**;
- Mua sắm: **0đ**;
- Các nhóm khác: **363.346đ**.

Điều này cho thấy vấn đề không phải là hoàn toàn thiếu dữ liệu, mà là **flow phân tích chưa tối ưu**.

---

## 8. Vì sao path này yếu?

| Vấn đề | Tác động đến người dùng |
|---|---|
| Không trả lời trực tiếp câu hỏi chính | User hỏi “khoản nào nhiều nhất” nhưng không nhận được câu trả lời ngay |
| Bắt user tự hỏi từng nhóm | User phải hỏi thêm “Ăn uống”, “Mua sắm”, rồi hỏi tiếp “số còn lại ở đâu” |
| Không có bảng xếp hạng category | User không thấy top nhóm chi tiêu theo thứ tự rõ ràng |
| Không có evidence đủ tốt ngay từ đầu | User khó hiểu vì sao Moni nói chưa có thông tin chi tiết |
| Không có action button | User không có bước tiếp theo như xem giao dịch, tạo ngân sách, hoặc so sánh tháng trước |

Với một AI tài chính cá nhân, đây là vấn đề quan trọng vì user cần **độ tin cậy, số liệu rõ ràng và hướng hành động cụ thể**.

---

## 9. To-be flow đề xuất

```text
User hỏi: “Tháng 5 tôi tiêu nhiều nhất vào khoản nào?”
→ Moni lấy dữ liệu giao dịch tháng 5
→ Moni gom nhóm giao dịch theo category
→ Moni tính tổng tiền từng nhóm
→ Moni sắp xếp từ cao xuống thấp
→ Moni trả lời trực tiếp nhóm chi tiêu cao nhất
→ Moni hiển thị top 3 nhóm chi tiêu
→ Moni đưa action buttons:
   - Xem giao dịch nhóm này
   - So sánh với tháng trước
   - Tạo ngân sách cho nhóm này
   - Sửa phân loại giao dịch
```

---

## 10. Câu trả lời mong muốn của Moni

Thay vì trả lời rằng chưa thấy thông tin chi tiết, Moni nên trả lời theo hướng:

> Trong tháng 5, khoản bạn tiêu nhiều nhất là **Ăn uống: 473.000đ**, chiếm khoảng **56,5%** tổng chi tiêu tháng.
>
> Tổng chi tiêu tháng 5: **836.346đ**  
> Top nhóm chi tiêu:
>
> 1. **Ăn uống:** 473.000đ  
> 2. **Các nhóm khác:** 363.346đ  
> 3. **Mua sắm:** 0đ  
>
> Bạn muốn xem chi tiết các giao dịch ăn uống, so sánh với tháng trước, hay đặt ngân sách ăn uống cho tháng sau?

---

## 11. Sketch UI đề xuất

```text
Moni:
Trong tháng 5, bạn tiêu nhiều nhất vào Ăn uống.

Tổng chi tiêu tháng 5: 836.346đ
23 giao dịch · trung bình 26.978đ/ngày

Top nhóm chi tiêu:
1. Ăn uống       473.000đ   56,5%   16 giao dịch
2. Các nhóm khác 363.346đ   43,5%
3. Mua sắm       0đ         0%

[ Xem giao dịch Ăn uống ]
[ So sánh với tháng trước ]
[ Tạo ngân sách Ăn uống ]
[ Sửa phân loại giao dịch ]
```

---

## 12. Product decision

**Product decision:**  
Ưu tiên sửa path xếp hạng nhóm chi tiêu trước khi mở rộng thêm tính năng mới. Với trợ lý tài chính cá nhân, Moni cần trả lời trực tiếp bằng số liệu, category breakdown và hành động tiếp theo, thay vì để user tự hỏi từng nhóm và tự suy luận.

Cụ thể, nên bổ sung:

- tự động xếp hạng top category khi user hỏi “tiêu nhiều nhất vào khoản nào”;
- hiển thị số tiền và tỷ lệ phần trăm của từng nhóm;
- cho phép mở chi tiết giao dịch liên quan;
- thêm nút tạo ngân sách hoặc đặt nhắc nhở chi tiêu;
- thêm lựa chọn sửa phân loại giao dịch nếu category chưa đúng.

---

## 13. Kết luận

Moni đã có nền tảng tốt vì có thể đọc được tổng chi tiêu, số giao dịch và một số nhóm chi tiêu. Tuy nhiên, path hiện tại còn yếu ở bước **ranking category**. AI chưa chuyển dữ liệu thành insight trực tiếp cho người dùng.

Điểm cần sửa không phải là thêm nhiều tính năng mới, mà là cải thiện flow phân tích cơ bản:

```text
Dữ liệu giao dịch → nhóm chi tiêu → xếp hạng → insight → action
```

Nếu sửa được path này, Moni sẽ giống một trợ thủ tài chính thật hơn: không chỉ trả lời từng mảnh dữ liệu, mà giúp user hiểu ngay tiền của mình đang đi đâu và nên làm gì tiếp theo.
