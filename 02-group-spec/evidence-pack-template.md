# Evidence Pack — Long Châu Safety Bot

Nộp kèm thin SPEC cuối Day 05.

## 1. Nhóm và track

**Tên nhóm:** Batch 02 — Long Châu Safety Bot  
**Track:** Healthcare / Pharmacy — app nhà thuốc thật 
**Mã Thành Viên Nhóm:** 2A202601004, 2A202600951, 2A202600847, 2A202600783
**Product/app đã chọn:** **Long Châu — Chuyên gia thuốc** (FPT Long Châu, `vn.frt.longchau.app`)  
**Build slice đang nghĩ:** Chatbot tra cứu **1 thuốc/hoạt chất + 1 tình trạng user khai báo** → trả **Safety Card** có nguồn → cảnh báo an toàn → CTA **Hỏi dược sĩ Long Châu**

---

## 2. Self-use evidence

Nhóm tự dùng app/workflow và ghi lại điểm gãy.

| Observation | Screenshot/link | Path liên quan | Điều học được |
|---|---|---|---|
| App Long Châu có **chat dược sĩ** và disclaimer *"chỉ mang tính tham khảo, không thay thế chẩn đoán"* — chưa có luồng **tra cứu nhanh + Safety Card** trước khi chat | App Store / Play Store mô tả app | Happy (baseline) | Cơ hội: thêm lớp AI **chuẩn bị context** trước handoff dược sĩ |
| User muốn biết *"thuốc X có uống được khi đang Y không"* thường phải **chờ dược sĩ online** hoặc tự Google — không có output chuẩn hóa | Self-use mô phỏng workflow: mở app → tìm thuốc → muốn hỏi tương tác | Failure / Low-confidence | Pain: thiếu **self-serve an toàn** ngoài giờ / trước khi mua |
| Flow đề xuất: nhập tình trạng → nhập thuốc → Safety Card → đối chiếu → cảnh báo — **demo được trong 3–5 phút** | Flow draft nhóm (chat user) | Happy | Build slice đủ hẹp cho Day 06 |
| Analog từ teardown **NEO (VNA)**: bot thu slot xong nhưng **API lỗi ở bước cuối** → user mất trust | `01-invidual-workshop/Evidence/14.58.28.png` | Failure | Safety Bot **không được** trả kết luận tuyệt đối khi tra cứu lỗi — phải fallback dược sĩ |
| Analog NEO: hỏi CSAT **trước khi** user được kết quả | `01-invidual-workshop/Evidence/14.54.50.png` | UX Recovery | Safety Bot chỉ hỏi feedback **sau** Safety Card hoặc sau handoff |

---

## 3. User / review / social evidence

| Quote / review / observation | Nguồn | User là ai? | Pain/failure mode |
|---|---|---|---|
| "Tư vấn rất dễ thương, ứng dụng rất tiện lợi" | App Store — Long Châu | Người mua thuốc online | Happy — chat dược sĩ có giá trị khi có người |
| "Xử lý cực kỳ chậm" | App Store — Long Châu | Người cần hỗ trợ gấp | Failure — chờ dược sĩ không đáp ứng case cần tra nhanh |
| "2h chiều mà bị treo cả tiếng đồng hồ. App ko cho thấy có ai đang hỗ trợ hay không" | AppRecs / review iOS | User chat dược sĩ | Failure — không biết trạng thái queue; cần **bot self-serve** trước |
| "Chat với Dược sĩ: Chụp hình đơn hàng hoặc sản phẩm gửi ngay cho Dược sĩ" | Google Play / APK mô tả app | Người có ảnh sản phẩm | Happy — điểm vào tốt; Safety Bot có thể nhận **tên từ ảnh/OCR** (backlog) |
| "Thông tin trong ứng dụng chỉ mang tính tham khảo, không thay thế lời khuyên, chẩn đoán hay điều trị y tế chuyên nghiệp" | Mô tả app Long Châu (Play Store) | Mọi user | Safety — disclaimer sẵn có; Safety Card **phải lặp lại** disclaimer |

**Giả định cần kiểm thêm (chưa có phỏng vấn user):**

```text
Giả định: Người mua thuốc OTC tại Long Châu thường không biết thuốc có chống chỉ định với bệnh nền (tiểu đường, mang thai, dị ứng...) hay không.
Nhóm sẽ kiểm bằng: 2 phỏng vấn nhanh 5 phút (bạn bè/người nhà đã từng mua thuốc app) trước checkpoint M1 Day 06.
```

---

## 4. Competitor / analog evidence

| App / mô hình tham khảo | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| **Long Châu (hiện tại)** | Chat dược sĩ human; chụp đơn gửi tư vấn | Human-in-the-loop mạnh | ✅ Giữ — bot **prefill context** cho dược sĩ |
| **WebMD / Drugs.com** | Tra hoạt chất, tương tác, chống chỉ định — web | **Safety Card + nguồn** | ✅ Demo với 5–10 hoạt chất trong JSON/CSV |
| **NEO (VNA)** — analog từ individual | FAQ tốt nhưng **tool fail** ở bước cuối | Tránh hứa quá rộng; failure path rõ | ✅ Bắt buộc fallback khi DB/AI không chắc |
| **Medscape / epocrates** (B2B) | Drug interaction checker chuyên sâu | Rule + database, không chat tự do | ⚠️ Chỉ học structure Safety Card — không copy scope B2B |
| **ChatGPT generic** | Trả lời mọi câu hỏi y tế, dễ hallucinate | **Không tin** nguồn không cite | ✅ Whitelist nguồn + "không chắc → dược sĩ" |

---

## 5. Evidence → Insight

```text
Evidence nổi bật nhất:
- Long Châu đã có chat dược sĩ được khen nhưng cũng bị phàn nàn chờ lâu / treo chat.
- App disclaimer rõ: thông tin chỉ tham khảo — chưa có product surface cho "tra an toàn thuốc + tình trạng" trước khi hỏi người.
- Analog NEO: bot fail ở bước cuối làm mất trust — với thuốc, hậu quả nghiêm trọng hơn vé máy bay.

Insight:
User không chỉ gặp "không biết thuốc là gì".
Họ thật ra cần quyết định an toàn: "Tình trạng của tôi có được dùng thuốc này không?" — kèm bằng chứng để tin, và lối thoát rõ nếu không chắc.

Opportunity:
AI có thể giúp bằng cách tra cứu hoạt chất từ nguồn whitelist, đối chiếu với tình trạng user khai báo,
draft Safety Card có trích dẫn — trong khi dược sĩ Long Châu giữ quyền quyết định cuối.
```

---

## 6. Evidence đổi SPEC như thế nào?

- [x] Đổi user chính.
- [x] Đổi pain statement.
- [x] Đổi build slice.
- [x] Đổi Auto/Aug decision.
- [x] Đổi 4 paths.
- [x] Đổi failure mode.
- [x] Đổi owner/test plan.

```text
Trước evidence, nhóm định: "Chatbot tư vấn sức khỏe / mua thuốc cho Long Châu" — quá rộng, rủi ro pháp lý cao.

Sau evidence, nhóm đổi thành: "Safety Bot — 1 tình trạng + 1 thuốc/hoạt chất → Safety Card + cảnh báo + CTA dược sĩ" — augmentation, không kê đơn.

Lý do: App đã có dược sĩ human; review cho thấy pain là chờ/treo chat; disclaimer app yêu cầu không thay thế chuyên môn; analog NEO dạy failure path cuối flow là critical.
```
