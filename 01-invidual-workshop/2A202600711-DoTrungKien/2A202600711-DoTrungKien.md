# App Teardown — Ada Health (Symptom Checker)

**Học viên:** Đỗ Trung Kiên — 2A202600711
**Vai trò nhóm:** Member 3 — Competitor / Analog Research
**App mổ:** Ada Health — AI symptom checker
**Thời gian:** 35–45 phút (cá nhân + chia sẻ nhóm)
**Output:** finding note + sketch as-is / to-be

> Mục tiêu không phải chấm UI đẹp/xấu, mà dùng app thật như một bài needfinding: tìm chỗ product gãy trong workflow thật rồi viết finding đó thành quyết định product.

---

## 1. Chọn một sản phẩm để dùng thử

| Sản phẩm | AI feature | Cách truy cập |
|---|---|---|
| **Ada Health** | Symptom checker hội thoại: hỏi triệu chứng thích ứng, gợi ý mức độ khẩn + possible causes | App Ada (iOS/Android), miễn phí |

**Vì sao chọn Ada:** đây là app dẫn đầu mảng symptom triage, đúng track của nhóm. Mổ Ada giúp nhóm học pattern triage tốt nhất và thấy chỗ nó gãy để né khi build prototype Day 06.

## 2. Dùng thử: promise vs reality

**Product hứa gì?**
"Hiểu triệu chứng của bạn và gợi ý nên làm gì tiếp theo" — như một bước sàng lọc trước khi đi khám.

**User nào được hứa sẽ được giúp?**
Người có triệu chứng nhưng chưa biết mức độ nghiêm trọng / chưa biết có nên đi khám hay tự chăm sóc.

**Kỳ vọng AI làm được task nào?**
Hỏi vài câu rồi đưa ra một kết luận rõ ràng, an tâm: nên ở nhà, đi khám, hay đi cấp cứu.

**Khi dùng thật — điểm gãy xuất hiện ở đâu?**

| Quan sát thực tế | Path | Điều học được |
|---|---|---|
| Nhập "sốt + đau họng 2 ngày" → app hỏi thêm khá nhiều câu, một số câu cảm giác không liên quan | Low-confidence / Correction | Adaptive questioning tốt nhưng dễ gây mệt; user không rõ vì sao bị hỏi câu đó. |
| Kết quả gợi ý đồng thời **Flu và COVID-19** kèm nhiều khả năng khác | Low-confidence / Failure | Dự đoán gần đúng nhưng "danh sách bệnh" làm user lo lắng hơn là an tâm; thiếu một câu kết luận rõ. |
| App luôn kèm disclaimer "không phải chẩn đoán" | Happy (trust) | Tạo niềm tin đúng mức, nhưng cũng khiến user vẫn phân vân "vậy giờ tôi làm gì". |

**Evidence:**
- ![Ada — nhập triệu chứng & hỏi follow-up](../Screenshot/z7896448348863_d28c4c4805b978972aa5969b2438a838.jpg)
- ![Ada — kết quả gợi ý Flu / COVID-19](../Screenshot/z7896448337313_ecb3ddb2dba72a62710363546399c88c.jpg)
- ![Ada — màn hình quá trình hỏi](../Screenshot/z7896448330483_d617c9d83f8b1e264a501364cdf03dbf.jpg)
- ![Ada — màn hình tổng quan](../Screenshot/z7896448324872_69bc86bcbafc8d660b49baec7c88a745.jpg)

## 3. Vẽ 4 paths

| Path | Quan sát trên Ada |
|---|---|
| **Happy** | Khi triệu chứng rõ, Ada hỏi 6–10 câu thích ứng rồi đưa mức triage (1 trong 8 mức) + possible causes. User thấy có hướng đi và có disclaimer rõ ràng. |
| **Low-confidence** | Khi triệu chứng mơ hồ, Ada **hỏi thêm** thay vì đoán bừa — điểm mạnh. Nhưng đôi khi hỏi câu user không hiểu liên quan gì, không giải thích "vì sao hỏi". |
| **Failure** | Khi output ra **nhiều bệnh khả dĩ cùng lúc** (Flu + COVID...), user khó biết cái nào đáng lo. App không nói "trường hợp này tôi không chắc" một cách thẳng thắn → rủi ro lo lắng quá mức hoặc xem nhẹ. |
| **Correction** | User có thể quay lại sửa câu trả lời, nhưng **correction không được "học lại"** cho lần sau; mỗi assessment là độc lập, không nhớ ngữ cảnh user. |

## 4. Viết finding thành quyết định

```text
Khi user nhập triệu chứng phổ biến nhưng mơ hồ (sốt + đau họng),
Ada trả về một danh sách nhiều bệnh khả dĩ (Flu, COVID-19, ...) mà không có một câu kết luận rõ,
hậu quả là user lo lắng hơn và vẫn không biết nên làm gì tiếp theo.
Lỗi thuộc layer Intent + UX Recovery.
Nên sửa bằng low-confidence path: rút gọn còn 3 mức hành động rõ ràng
(Tự chăm sóc / Đi khám / Cấp cứu) + 1 câu vì sao, thay vì liệt kê danh sách bệnh.
```

**Finding phụ:**
```text
Khi user gặp triệu chứng red-flag (đau ngực + khó thở),
một symptom checker có thể vẫn tiếp tục hỏi nhiều câu thay vì cảnh báo ngay,
hậu quả là chậm trễ trong tình huống nguy cấp.
Lỗi thuộc layer Safety.
Nên sửa bằng red-flag rule cứng: phát hiện từ khóa nguy cấp -> chuyển thẳng "Gọi cấp cứu", bỏ qua hỏi thêm.
```

## 5. Sketch as-is / to-be

```text
AS-IS (Ada hiện tại)                         TO-BE (prototype nhóm Day 06)
─────────────────────────────               ─────────────────────────────
User nhập triệu chứng                        User nhập triệu chứng
        │                                            │
6–10 câu hỏi thích ứng                       Kiểm red-flag NGAY ◄── [SỬA: Safety]
        │                                            │ (đau ngực/khó thở → Cấp cứu)
        ▼                                            ▼ nếu không red-flag
Danh sách NHIỀU bệnh khả dĩ                  Hỏi tối đa 3 câu trọng tâm
(Flu + COVID + ...) ◄── [GÃY]                        │
        │                                            ▼
Disclaimer, nhưng user vẫn                   1 KẾT LUẬN rõ + lý do ◄── [SỬA: UX Recovery]
phân vân "giờ làm gì?"                       Tự chăm sóc / Đi khám / Cấp cứu
                                                     │
                                             Nút hành động: đặt lịch / gọi cấp cứu
                                             + "Tôi không chắc, hỏi thêm" (Correction)
```

**Điểm gãy đánh dấu (as-is):** output là danh sách bệnh, không phải hành động; không có red-flag gate ở đầu.
**Path đã sửa (to-be):** red-flag gate trước; 3 câu hỏi; 1 kết luận hành động rõ; correction có lối thoát.

## 6. Tự kiểm trước khi nộp

- [x] Có ít nhất 1 screenshot / observation cụ thể (4 screenshot Ada thật).
- [x] Có đủ 4 paths (Happy / Low-confidence / Failure / Correction).
- [x] Finding viết thành product decision, không chỉ nhận xét.
- [x] Sketch có as-is và to-be.
- [x] Có câu nói rõ finding đổi gì trong SPEC (xem dưới).

**Finding này đổi gì trong SPEC:**
```text
Trước teardown, nhóm định để AI trả về "possible causes" giống Ada.
Sau teardown, nhóm đổi sang: AI chỉ trả 1 trong 3 mức hành động rõ ràng
(Tự chăm sóc / Đi khám / Cấp cứu) + lý do + red-flag gate ở đầu,
vì danh sách bệnh khả dĩ làm user lo lắng và không hỗ trợ ra quyết định.
```

---

*App Teardown — Đỗ Trung Kiên (2A202600711) · Day 05 Batch 02 · AI Product Kickoff Sprint*
