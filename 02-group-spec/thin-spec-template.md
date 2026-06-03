# Thin SPEC Cuối Day 05 - Giới Hạn Chi Tiêu MoMo Moni

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

## 1. Track, product/app và user

**Track:** Personal Finance
**Product/app thật:** MoMo - Moni  
**User cụ thể:** Người dùng MoMo có thu nhập cố định hằng tháng, dùng ví để thanh toán hằng ngày, và muốn đặt ngân sách chi tiêu tối đa để không tiêu quá khả năng tài chính.  
**Nhóm có phải user thật không? Nếu không, khác ở đâu?** Nhóm có thể là user thật ở mức dùng MoMo/ví điện tử hằng ngày, nhưng cần kiểm chứng thêm với user có đặt ngân sách tháng hoặc từng gặp vấn đề vượt ngân sách.

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
|---|---|---|---|
| User ghi thêm khoản `ăn tối 80k` vào danh mục Ăn uống; Moni ghi nhận giao dịch nhưng không cảnh báo dù context test là ngân sách đã vượt. | [Self-use screenshot](../screenshots/selfuse2.jpg) | Hệ thống có dữ liệu giao dịch nhưng chưa biến giao dịch mới thành cảnh báo ngân sách. | Prototype phải cảnh báo khi user sắp vượt hoặc đã vượt ngân sách. |
| Review Google Play: "Phần quản lý chi tiêu hơi kém, dù đã vượt mức ngân sách vẫn không có cảnh báo." | [Review screenshot](../screenshots/image.png) | Pain cảnh báo ngân sách không chủ động xuất hiện ở user thật. | SPEC tập trung vào cảnh báo sớm và dự báo cuối tháng, không chỉ báo cáo lại quá khứ. |
| App teardown cá nhân cho thấy Moni có thể truy vấn giao dịch đơn giản nhưng có rủi ro thiếu source hoặc trả lời không nhất quán ở query phức tạp. | [App teardown cá nhân](../01-invidual-workshop/moni-app-teardown.md) | User cần tin được số liệu tài chính trước khi thay đổi hành vi. | Output phải có công thức/filter/source hoặc ít nhất số liệu tính toán rõ ràng. |

## 3. Pain statement

```text
User dùng MoMo để quản lý chi tiêu cá nhân đang gặp khó ở bước theo dõi ngân sách tháng,
vì hệ thống chưa cảnh báo đủ sớm khi tốc độ chi tiêu vượt kế hoạch,
dẫn tới user chỉ phát hiện vấn đề khi đã tiêu quá nhiều
và khó điều chỉnh phần còn lại của tháng.
Bằng chứng chính là self-use Moni không cảnh báo sau khoản chi mới và review Google Play nói vượt ngân sách vẫn không có cảnh báo.
```

## 4. Build slice

```text
Cho người dùng MoMo đặt mức chi tiêu tối đa 10.000.000đ/tháng,
prototype sẽ dùng AI để tính tốc độ chi tiêu, dự báo nguy cơ vượt ngân sách,
tạo ra cảnh báo kèm số tiền dự báo cuối tháng và mức nên chi mỗi ngày/tuần,
và xử lý khoản chi bất thường bằng flow cho user đánh dấu ngoại lệ để AI tính lại dự báo.
```

## 5. Auto/Aug decision

Chọn một:

- [ ] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [x] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** AI có thể tự động tính toán trạng thái ngân sách và cảnh báo trong case hẹp vì đây là phép tính dựa trên số liệu đã có. Khi có khoản chi bất thường hoặc dữ liệu mơ hồ, AI phải hỏi user xác nhận trước khi chốt dự báo. User vẫn là người quyết định điều chỉnh ngân sách, giảm chi tiêu, hoặc đánh dấu khoản chi là ngoại lệ.  
**Human role:** User = decider; AI = forecaster/advisor; user cũng là người sửa dữ liệu khi có khoản chi bất thường.

## 6. Four paths

| Path | Prototype phải thể hiện gì? |
|---|---|
| Happy | User đặt ngân sách 10.000.000đ/tháng, sau 15 ngày mới chi 4.500.000đ. AI báo đang an toàn, còn 5.500.000đ và có thể chi khoảng 366.000đ/ngày trong 15 ngày còn lại. |
| Low-confidence | User đã chi 7.200.000đ sau 15 ngày, trong đó có khoản học phí 3.000.000đ. AI hỏi đây có phải khoản chi bất thường cần loại khỏi dự báo không. |
| Failure | User đã chi hơn 10.000.000đ sau 2 tuần. Nếu AI chỉ nói "hãy tiết kiệm hơn" mà không cảnh báo rõ đã vượt ngân sách và không đưa dự báo, user không biết cần làm gì tiếp. |
| Correction | User đánh dấu khoản học phí/trả nợ là bất thường hoặc chỉnh ngân sách. AI tính lại dự báo và cập nhật mức nên chi cho những ngày còn lại. |

## 7. Failure mode nguy hiểm nhất

```text
Nếu user có một khoản chi lớn bất thường như học phí, trả nợ hoặc mua đồ một lần,
AI có thể hiểu đó là xu hướng chi tiêu thường xuyên
và dự báo user sẽ vượt ngân sách rất nặng.

Hậu quả là user nhận cảnh báo sai, lo lắng không cần thiết
và mất tin tưởng vào Moni.

Prototype xử lý bằng cách hỏi lại:
"Khoản này có phải chi bất thường không?"

Sau khi user đánh dấu ngoại lệ,
AI tính lại dự báo và cập nhật cảnh báo.
Owner kiểm thử path này là thành viên phụ trách Test / Demo.
```

## 8. Owner plan cho sáng Day 06

| Thành viên | Việc phụ trách | Bằng chứng cần có trong repo |
|---|---|---|
| Cả nhóm (cả 4 thành viên) | Research / evidence | Screenshot self-use, review Google Play, ghi chú pain ngân sách. |
| Trương Hải Quân — 2A202600898 | SPEC + tổng hợp repo | Thin SPEC, evidence pack, README, gom assets của nhóm vào repo. |
| Bùi Minh Hiếu — 2A202600876 | Prototype — UI | Màn hình cảnh báo ngân sách, thông báo, mock data, flow đánh dấu ngoại lệ trên giao diện. |
| Nguyễn Sĩ Việt — 2A202600658 | Prototype — logic dự báo | Hàm tính tốc độ chi tiêu, dự báo cuối tháng, mức nên chi/ngày; tính lại sau khi đánh dấu ngoại lệ. |
| Trần Quang Huy — 2A202601010 | Test 4 paths + demo | Test happy/low-confidence/failure/correction, kịch bản demo, video/script trình bày. |

## 9. Ví dụ cảnh báo trong prototype

```text
Cảnh báo: Bạn có nguy cơ vượt ngân sách tháng này.

Ngân sách tháng: 10.000.000đ
Đã chi: 7.200.000đ sau 15 ngày
Tốc độ hiện tại: khoảng 480.000đ/ngày
Dự báo cuối tháng: khoảng 14.400.000đ

Bạn có thể vượt ngân sách khoảng 4.400.000đ.
Để giữ trong mức 10.000.000đ,
bạn chỉ nên chi khoảng 186.000đ/ngày trong 15 ngày còn lại.
```

## 10. Backlog không build trong Day 06

- Kết nối dữ liệu MoMo thật.
- Tự động chặn giao dịch.
- Tự động điều chỉnh ngân sách thay user.
- Phân tích toàn bộ lịch sử giao dịch dài hạn.
- Học lâu dài từ tất cả correction của user.
- Voice input + preview transcript nếu nhóm không chọn build slice nhập liệu.
