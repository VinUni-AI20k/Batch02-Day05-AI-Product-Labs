# Thin SPEC - Location-based Food Recommendation

Dựa trên Insight và Opportunity từ Evidence Pack (theo hướng dẫn của bài Day 05), dưới đây là bản Thin SPEC để chuẩn bị build prototype trong Day 06.

---

## 1. Cơ hội (Opportunity Statement)

Cơ hội là dùng AI để augment quá trình tìm kiếm và lọc thông tin quán ăn, giúp khách du lịch chọn được quán ăn phù hợp với khẩu vị cá nhân tại địa điểm lạ một cách nhanh chóng, trong khi vẫn kiểm soát rủi ro gợi ý quán đóng cửa hoặc chất lượng quá tệ (AI hallucination/outdated data).

---

## 2. Quyết định AI (Auto/Aug decision)

**Phương pháp:** Augmentation (AI hỗ trợ gợi ý).

**AI làm gì:** AI đóng vai trò như một người dân địa phương (Local Guide), phân tích vị trí hiện tại và hỏi 2-3 câu hỏi để lọc nhu cầu (ví dụ: "Bạn muốn ăn món nước hay khô?", "Ngân sách khoảng bao nhiêu?", "Bạn có bị dị ứng gì không?"). Sau đó tổng hợp thông tin và đưa ra 3 lựa chọn tốt nhất.

**Human giữ quyền ở đâu:** User vẫn là người quyết định cuối cùng sẽ đi ăn ở quán nào, hoặc có thể yêu cầu AI "gợi ý các quán khác".

---

## 3. Build Slice

Cho khách du lịch đến một địa phương lạ đang không biết ăn gì và ở đâu, prototype dùng AI để hỏi nhu cầu cá nhân và gợi ý 3 quán ăn phù hợp gần đó, tạo ra danh sách 3 quán kèm theo lý do gợi ý ngắn gọn (tổng hợp từ review), và xử lý lỗi AI không tìm thấy quán phù hợp bằng cách mở rộng bán kính tìm kiếm hoặc gợi ý món ăn phổ thông an toàn.

---

## 4. Four Paths (4 Kịch bản)

### ✅ Happy Path

Người dùng cung cấp đủ thông tin cần thiết (số người ăn, loại món mong muốn, ngân sách, khoảng cách chấp nhận, các yêu cầu đặc biệt như ăn chay hoặc dị ứng thực phẩm). Nếu còn thiếu thông tin quan trọng, AI sẽ hỏi bổ sung ngắn gọn trước khi tìm kiếm.

AI tổng hợp nhu cầu, tìm các quán phù hợp gần vị trí hiện tại và trả về 3 gợi ý tốt nhất kèm:

- Tên quán
- Khoảng cách
- Mức giá phù hợp
- Lý do đề xuất ngắn gọn (tổng hợp từ review và thông tin công khai)

Người dùng chọn một quán và chuyển sang xem đường đi hoặc thông tin liên hệ.

---

### ⚠️ Low-Confidence Path

AI tìm được các quán tương đối phù hợp nhưng độ tin cậy của dữ liệu không cao, ví dụ:

- Review quá ít
- Review mâu thuẫn nhau
- Dữ liệu đã cũ
- Chỉ đáp ứng một phần tiêu chí của người dùng

Thay vì thể hiện sự chắc chắn quá mức, AI vẫn đưa ra gợi ý nhưng kèm cảnh báo về mức độ tin cậy.

> **Ví dụ:**
> "Quán này phù hợp với tiêu chí của bạn, tuy nhiên gần đây có một số review phản ánh thời gian lên món khá chậm."
>
> Hoặc:
>
> "Quán này có món bạn yêu cầu nhưng số lượng review gần đây còn hạn chế, bạn nên tham khảo thêm trước khi quyết định."

---

### ❌ Failure Path

Người dùng đưa ra các tiêu chí quá hẹp hoặc quá khó để hệ thống tìm được kết quả phù hợp.

> **Ví dụ:**
> Tìm quán hủ tiếu chay đang mở cửa lúc 2 giờ sáng, cách dưới 500m.

Sau khi tìm kiếm trong phạm vi hiện tại, hệ thống không tìm thấy quán nào đáp ứng đầy đủ các điều kiện. AI sẽ thông báo rõ ràng:

> "Hiện tại mình không tìm thấy quán nào đáp ứng đầy đủ các tiêu chí bạn yêu cầu."

**Lưu ý:** AI không được tự bịa dữ liệu hoặc gợi ý các quán không đáp ứng điều kiện chỉ để có kết quả.

---

### 🔄 Correction Path

Sau khi xảy ra Failure hoặc khi người dùng không hài lòng với các gợi ý hiện tại, AI chủ động đề xuất các phương án thay thế nhằm tiếp tục hỗ trợ thay vì kết thúc cuộc hội thoại.

> **Ví dụ:**
> "Hiện tại quanh đây không có quán hủ tiếu chay mở giờ này."
>
> Mình có thể:
> - Mở rộng bán kính tìm kiếm lên 5km
> - Gợi ý các quán chay khác vẫn đang mở
> - Gợi ý cửa hàng tiện lợi gần nhất có đồ ăn chay
>
> Hoặc:
>
> "Mình chưa tìm được quán đáp ứng 100% tiêu chí của bạn. Bạn muốn ưu tiên giữ nguyên món ăn hay giữ nguyên khoảng cách để mình tìm phương án gần nhất?"

**Mục tiêu của Correction Path** là không để người dùng rơi vào ngõ cụt và luôn có hướng xử lý tiếp theo.

---

## 5. Failure Mode

### Failure Mode: Recommendation Mismatch Due to Unreliable Data

**Tình huống**

Người dùng có một yêu cầu quan trọng ảnh hưởng trực tiếp đến quyết định ăn uống, ví dụ:

- Ăn chay
- Dị ứng thực phẩm
- Không ăn hải sản
- Yêu cầu thực đơn Halal
- Đi theo nhóm đông người

AI dựa trên dữ liệu địa điểm và review công khai để đưa ra gợi ý. Tuy nhiên, menu, giờ mở cửa hoặc cách phục vụ của quán có thể đã thay đổi và không được cập nhật kịp thời. Kết quả là AI có thể đề xuất một quán tưởng như phù hợp nhưng thực tế không đáp ứng được yêu cầu của người dùng.

**Tác động**

- Người dùng mất thời gian di chuyển.
- Trải nghiệm du lịch bị gián đoạn.
- Người dùng mất niềm tin vào hệ thống.
- Trong trường hợp dị ứng thực phẩm, có thể gây rủi ro nghiêm trọng.

**Cách Prototype Xử Lý**

1. AI đánh dấu các yêu cầu như dị ứng, ăn chay hoặc yêu cầu đặc biệt là **Critical Constraints**.
2. Với các ràng buộc quan trọng này, AI chỉ đưa ra gợi ý khi tìm thấy đủ bằng chứng từ dữ liệu hiện có.
3. Nếu độ tin cậy thấp hoặc dữ liệu không rõ ràng, AI sẽ hiển thị cảnh báo thay vì khẳng định chắc chắn.

> **Ví dụ:**
> "Review gần đây cho thấy quán có phục vụ món chay, tuy nhiên thông tin menu có thể đã thay đổi. Bạn nên liên hệ trực tiếp với quán để xác nhận trước khi đến."

Mọi kết quả gợi ý đều kèm thông báo:

> "Các đề xuất được tổng hợp từ dữ liệu và review công khai hiện có. Thông tin có thể thay đổi theo thời gian. Đối với các yêu cầu quan trọng, vui lòng xác nhận trực tiếp với cơ sở kinh doanh trước khi ghé thăm."

**Nguyên tắc thiết kế:** AI hỗ trợ người dùng ra quyết định, nhưng không thay thế việc xác nhận cuối cùng với cơ sở kinh doanh khi có các yêu cầu đặc biệt hoặc liên quan đến an toàn thực phẩm.

---

## 6. Owner Plan (Phân công Day 06)

*(Nhóm điền tên các thành viên phụ trách)*

| Nhiệm vụ | Người phụ trách |
|---|---|
| Research & Evidence (Kiểm chứng bằng chứng) | [Tên] |
| Prompt Engineering (Thiết kế prompt cho AI Local Guide) | [Tên] |
| Thiết kế UI/UX & Flow của Prototype | [Tên] |
| Test 4 paths & Failure mode | [Tên] |
| Làm slide & chuẩn bị Demo | [Tên] |

---

## 7. Backlog (Không build trong Day 06)

Những thứ không build trong Day 06 để đảm bảo scope đủ nhỏ:

- Tính năng đặt bàn trực tiếp qua AI.
- Đặt đồ ăn giao tận nơi (chỉ tập trung gợi ý quán ăn gần đó để khách tự đi/book xe).
- Tích hợp thanh toán/ưu đãi voucher.
