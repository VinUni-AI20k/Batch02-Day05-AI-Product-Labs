
## 1. Track, product/app và user

*   **Track:** Food/local derivery
*   **Product/app thật:**  ShopeeFood
*   **User cụ thể:** Nhân viên văn phòng, Sinh viên
*   **Nhóm có phải user thật không? Nếu không, khác ở đâu?** Có 

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
|---|---|---|---|
| Gõ từ khóa ngữ cảnh (ví dụ: "đồ nước, thanh đạm") vào app GrabFood/ShopeeFood thì trả về kết quả rỗng hoặc gợi ý theo keyword cứng. | Self-use | App hiện tại bắt ép user phải biết chính xác tên món, không có khả năng hiểu ngữ cảnh. | Dùng LLM làm core để extract intent và khớp (map) với nhu cầu người dùng. |
| Hỏi ChatGPT về món ăn, AI hiểu đúng ý định nhưng gợi ý sai vị trí, quán ảo do không nắm được dữ liệu khoảng cách. | Self-use | LLM thiếu dữ liệu thực tế, gây ra ảo giác về địa điểm. | Áp dụng dataset nhỏ (10-20 món) và bổ sung Hard filter theo bán kính (< 3km). |
| Lướt app 20-30 phút không chọn được món, mệt mỏi nên gọi lại món cũ. | Phỏng vấn nhanh | User bị Decision fatigue (tốn quá nhiều thời gian ra quyết định). | Giới hạn sự lựa chọn xuống đúng 3 món tốt nhất kèm giải thích lý do ngắn gọn. |

## 3. Pain statement

User **nhân viên văn phòng, sinh viên** đang gặp khó ở **bước chọn món ăn trưa**,
vì **họ chỉ nghĩ ra cảm giác thèm nhưng các app lại bắt ép phải gõ chính xác tên món (keyword)**,
dẫn tới **tốn 20-30 phút lướt app, mệt mỏi ra quyết định (decision fatigue)**.
Bằng chứng chính là **quote phỏng vấn: "Trưa nào tôi và đồng nghiệp cũng mất 20–30 phút chỉ để chọn món, lướt app một hồi cuối cùng lại gọi lại món cũ vì mệt."**.

## 4. Build slice

Cho **nhân viên văn phòng, sinh viên** đang **cần tìm đồ ăn nhưng chỉ có mô tả tự nhiên hoặc cảm giác thèm**,
prototype sẽ dùng AI để **automate việc chuyển đổi mô tả mơ hồ thành các tags cụ thể (loại món, taste, location) và khớp với dataset có sẵn**,
tạo ra **gợi ý đúng 3 món ăn từ dataset nhỏ kèm giải thích lý do ngắn gọn vì sao phù hợp**,
và xử lý **lỗi gợi ý sai vị trí hoặc sai thành phần dị ứng** bằng **Hard filter bán kính (< 3km) và Checkbox bắt buộc kiểm tra dị ứng**.

## 5. Auto/Aug decision

Chọn một:

- [x] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [ ] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** Thật ra người dùng cần hỗ trợ quyết định (decision support) để giảm bớt áp lực suy nghĩ. AI chỉ đóng vai trò giới hạn sự lựa chọn xuống 3 món tốt nhất, quyền quyết định ăn món nào cuối cùng vẫn thuộc về user.
**Human role:** decider.

## 6. Four paths

| Path | Prototype phải thể hiện gì? |
|---|---|
| **Happy** | User nhập mô tả nhu cầu ăn uống (ví dụ: đồ nước, thanh đạm). AI trả về đúng 3 món ăn phù hợp nhất từ dataset nội bộ (10-20 món), thỏa mãn khoảng cách < 3km, không vi phạm điều kiện dị ứng và có giải thích ngắn gọn. |
| **Low-confidence** | User nhập mô tả quá phức tạp hoặc mâu thuẫn. AI vẫn cố gắng khớp các tags nhưng hiển thị cảnh báo để user đánh giá lại các lựa chọn. |
| **Failure** | Dataset (10-20 món) không có kết quả nào phù hợp với bộ lọc bán kính (<3km) hoặc bộ lọc dị ứng của người dùng. |
| **Correction** | Hệ thống yêu cầu người dùng thay đổi câu lệnh mô tả hoặc nới lỏng yêu cầu về khoảng cách, loại bỏ một số điều kiện dị ứng không cần thiết. |

## 7. Failure mode nguy hiểm nhất

Nếu user **có tình trạng dị ứng (ví dụ: dị ứng đậu phộng)**,
AI có thể **sinh kết quả ảo giác, gợi ý các món ăn có chứa thành phần gây dị ứng**,
hậu quả là **không đảm bảo tính an toàn tuyệt đối cho người dùng**.
Prototype sẽ xử lý bằng **Checkbox bắt buộc kiểm tra dị ứng để AI loại bỏ trước khi gợi ý**.
Owner kiểm thử path này là **[Điền tên thành viên nhóm phụ trách]**.

## 8. Owner plan cho sáng Day 06
*(Bảng này không có dữ liệu chi tiết trong Evidence Pack, nhóm cần tự phân công và điền tên)*

| Thành viên | Việc phụ trách | Bằng chứng cần có trong repo |
|---|---|---|
| [NguyenThaiHoc] | Research / evidence | Cập nhật đủ quote phỏng vấn 3-5 user. |
| [NguyenQuangMinh] | SPEC | File Thin SPEC hoàn thiện. |
| [NguyenQuangMinh, NguyenTuanDung] | Prototype | File dataset nhỏ (10-20 món) + Script/Prompt. |
| [NguyenDinhTienManh] | Test / failure path | Bằng chứng test chặn hard filter <3km và filter dị ứng. |
| [NguyenMinhChien] | Demo script / repo | LThư mục repo chuẩn hóa. |