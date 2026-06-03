# Toolkit — Từ Evidence Đến Build Slice

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm

Gom theo **workflow/pain**, không gom theo tên feature.

### Cụm 1: "Không biết ăn gì — Decision Fatigue"
- **Evidence:** Nhân viên văn phòng mất 20–30 phút lướt app mà không chốt được món vì không có ý tưởng rõ ràng (phỏng vấn nhanh).
- **Evidence:** User chỉ nghĩ ra được cảm giác thèm ("muốn đồ nước") nhưng app bắt phải gõ đúng tên món cụ thể (phở, bún) mới tìm được.
- **Path:** Failure — app hiện tại không giải quyết được nhu cầu mơ hồ.

### Cụm 2: "App tìm kiếm không hiểu ngữ cảnh"
- **Evidence:** Dùng GrabFood/ShopeeFood gõ "tôi muốn ăn đồ nước, thanh đạm, loanh quanh Quận 1" → kết quả rỗng hoặc sai lệch, chỉ tìm theo keyword (self-use).
- **Evidence:** V-AI (V-App) cũng gặp điểm gãy tương tự: không hiểu intent "gần đây", tự gán location mặc định sai (Nguyễn Quang Minh, Nguyễn Tuấn Dũng — bài cá nhân).
- **Path:** Failure — app truyền thống chỉ tìm theo keyword, không hiểu "ý định" và "context".

### Cụm 3: "LLM hiểu ý nhưng gợi ý không an toàn"
- **Evidence:** Hỏi ChatGPT "Trưa nay ăn gì đồ nước, thanh đạm ở Quận 1" → LLM hiểu đúng ý định, phân tích tốt loại món và taste. Nhưng quán ăn được gợi ý bị sai vị trí, quán ảo (self-use).
- **Evidence:** V-AI trả dữ liệu tĩnh lỗi thời, không có nhãn thời gian (Nguyễn Tuấn Dũng — bài cá nhân).
- **Path:** Low-confidence / Correction — LLM giỏi hiểu intent nhưng yếu ở data thực tế (location, allergen).

### Cụm 4: "Rủi ro sức khỏe — Dị ứng thực phẩm"
- **Evidence:** Nếu AI gợi ý món chứa thành phần dị ứng (ví dụ: đậu phộng), hậu quả nghiêm trọng về sức khỏe (Topic.md — Failure Modes).
- **Path:** Failure — failure mode nguy hiểm nhất cần mitigation bắt buộc.

## 2. Viết insight

```text
Nhân viên văn phòng bận rộn không chỉ cần tìm quán ăn.
Họ thật ra cần hỗ trợ ra quyết định nhanh (decision support)
để giảm bớt áp lực suy nghĩ trong giờ nghỉ trưa ngắn ngủi,
vì evidence cho thấy họ mất 20–30 phút lướt app mà vẫn
không chốt được món — nguyên nhân gốc là các app hiện tại
bắt ép user phải biết chính xác tên món, trong khi user
chỉ có mô tả mơ hồ như "đồ nước", "thanh đạm".
```

## 3. Viết opportunity

```text
Cơ hội là dùng AI để tự động hóa (automate) việc chuyển đổi
mô tả mơ hồ của user thành các tags cụ thể (loại món, taste,
location) và giới hạn sự lựa chọn xuống 3 món tốt nhất,
giúp user chốt quyết định ăn trưa trong dưới 1 phút,
trong khi vẫn kiểm soát rủi ro dị ứng thực phẩm bằng
hard filter bắt buộc và giới hạn khoảng cách (< 3km)
để đảm bảo tính thực tế của gợi ý.
```

## 4. Chọn build slice

Build slice tốt phải qua 5 câu hỏi:

| Câu hỏi | Đạt khi | ✅ Nhóm đáp ứng |
|---|---|---|
| User cụ thể chưa? | Nói được ai dùng, trong bối cảnh nào. | ✅ Nhân viên văn phòng, đang muốn đặt đồ ăn trưa nhưng không có ý tưởng rõ ràng. |
| Task đủ hẹp chưa? | Demo được trong 3-5 phút. | ✅ Nhập mô tả tự nhiên → nhận 3 gợi ý món ăn kèm lý do. Demo trong 2–3 phút. |
| AI decision rõ chưa? | AI gợi ý/tự làm một việc cụ thể. | ✅ AI parse mô tả tự nhiên → extract intent (loại món, taste, location) → filter dataset → trả 3 kết quả + giải thích. |
| Failure path rõ chưa? | Có một case AI không chắc hoặc sai để test. | ✅ Case 1: Gợi ý món chứa thành phần dị ứng. Case 2: Gợi ý quán quá xa (> 3km). |
| Có evidence không? | Có bằng chứng từ self-use/review/user/competitor. | ✅ Self-use (GrabFood, ChatGPT), phỏng vấn nhanh, competitor analysis (3 nguồn). |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Quyết định | Áp dụng cho nhóm |
|---|---|---|
| Evidence yếu, user mơ hồ | Dừng build sâu; quay lại research 20 phút. | ❌ Không áp dụng — evidence đủ mạnh từ self-use + phỏng vấn. |
| Ý tưởng quá rộng | Giữ domain, cắt xuống một flow. | ✅ **Đã cắt:** Chỉ giữ flow "nhập mô tả → nhận 3 gợi ý". Bỏ các tính năng mở rộng (lịch sử, đánh giá, đặt hàng). |
| AI không cần thiết | Dùng rule/manual prototype; ghi rõ vì sao không dùng AI sâu. | ❌ Không áp dụng — AI cần thiết để hiểu mô tả tự nhiên (intent extraction), rule-based không làm được. |
| Rủi ro cao | Chọn augmentation hoặc conditional automation. | ✅ **Áp dụng:** Chọn **Conditional Automation** — AI tự gợi ý trong case rõ ràng, nhưng áp dụng hard filter bắt buộc cho dị ứng và khoảng cách trước khi xuất kết quả. |
| Không demo được trong 1 ngày | Đưa phần lớn vào backlog, giữ một path nhỏ. | ✅ **Áp dụng:** Dùng dataset nhỏ (10–20 món) thay vì crawl dữ liệu thực. Backlog: tích hợp API bản đồ, hệ thống review, mở rộng dataset. |

## 6. Câu chốt cuối

Điền câu này trước khi rời lớp:

```text
Dựa trên [self-use GrabFood/ShopeeFood + hỏi ChatGPT + phỏng vấn nhanh nhân viên VP],
nhóm sẽ build [prototype AI Food Recommendation: nhập mô tả tự nhiên → trả 3 gợi ý món ăn kèm lý do],
cho [nhân viên văn phòng đang muốn đặt đồ ăn trưa nhưng không có ý tưởng rõ ràng],
để giải quyết [decision fatigue — mất 20–30 phút chọn món vì app hiện tại không hiểu ngữ cảnh],
bằng cách AI [tự động parse mô tả tự nhiên → extract tags (loại món, taste, location) → filter dataset nhỏ (10–20 món) → trả 3 kết quả tốt nhất],
và sẽ test failure path [gợi ý món chứa thành phần dị ứng + gợi ý quán quá xa > 3km].
```

## 7. Backlog

Những thứ **không build trong Day 06**:

- Tích hợp API bản đồ thực (Google Maps / Mapbox) để tính khoảng cách chính xác thay vì filter tĩnh theo quận.
- Hệ thống đánh giá / feedback loop: user rate gợi ý → AI học từ phản hồi để cải thiện lần sau.
- Mở rộng dataset lên 100+ món ăn, bổ sung thêm thông tin dinh dưỡng, giá cả realtime, ảnh món ăn.
- Tính năng lịch sử gợi ý: ghi nhớ món đã chọn trước đó để tránh gợi ý trùng lặp.
- Tích hợp đặt hàng trực tiếp qua app giao đồ ăn (GrabFood/ShopeeFood deeplink).
- Hỗ trợ voice input — user nói "tôi thèm đồ nước" thay vì phải gõ.
