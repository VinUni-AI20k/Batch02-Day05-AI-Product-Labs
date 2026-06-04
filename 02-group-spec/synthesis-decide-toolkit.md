# Toolkit — Từ Evidence Đến Build Slice (Long Châu Safety Bot)

Dùng sau khi nhóm đã có evidence. Mục tiêu: chốt build slice đủ nhỏ cho Day 06.

---

## 1. Gom evidence thành cụm

| Cụm workflow/pain | Evidence |
|---|---|
| **"Thuốc này có dùng được với tình trạng của tôi không?"** | Self-use mô phỏng; chưa có Safety Card trên app |
| **Chờ chat dược sĩ lâu / treo** | App Store: "xử lý chậm"; AppRecs: treo cả tiếng |
| **Thông tin Google/AI generic không tin cậy** | Competitor pattern: cần nguồn whitelist |
| **Bot hứa nhiều nhưng fail bước cuối** | Analog NEO — API lỗi sau confirm |
| **App đã disclaimer nhưng chưa gắn product flow** | Play Store: "chỉ tham khảo, không thay chẩn đoán" |

---

## 2. Viết insight

```text
User mua thuốc trên app Long Châu không chỉ cần "biết thuốc là gì".
Họ thật ra cần quyết định an toàn có cấu trúc: thuốc/hoạt chất ↔ tình trạng của mình,
vì review cho thấy chat dược sĩ không luôn phản hồi kịp và user không có self-serve có nguồn trước khi uống.
```

---

## 3. Viết opportunity

```text
Cơ hội là dùng AI để tra cứu hoạt chất từ nguồn whitelist và đối chiếu với tình trạng user khai báo,
giúp user nhận Safety Card có trích dẫn trong vài phút,
trong khi vẫn kiểm soát rủi ro bằng cờ Vàng/Đỏ, disclaimer, và handoff dược sĩ Long Châu khi không chắc.
```

---

## 4. Chọn build slice

| Câu hỏi | Đạt? | Ghi chú |
|---|---|---|
| User cụ thể chưa? | ✅ | Người cầm thuốc OTC / sắp mua trên Long Châu, có tình trạng cần đối chiếu |
| Task đủ hẹp chưa? | ✅ | 1 tình trạng + 1 thuốc/hoạt chất → 1 Safety Card — demo 3–5 phút |
| AI decision rõ chưa? | ✅ | AI tra cứu + draft card + phân loại cảnh báo; không auto đặt hàng/kê đơn |
| Failure path rõ chưa? | ✅ | DB miss, triệu chứng khẩn, nhập nhầm tên, API lỗi |
| Có evidence không? | ✅ | App review + app disclaimer + analog NEO + competitor pattern |

**Quyết định:** **Giữ hướng Long Châu Safety Bot**, không mở rộng thành "chatbot y tế đa năng".

---

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

| Tình huống | Quyết định nhóm |
|---|---|
| Ý tưởng ban đầu: chatbot tư vấn sức khỏe Long Châu | **Giảm scope** → Safety Bot hẹp |
| Rủi ro pháp lý cao | **Conditional automation** + disclaimer + dược sĩ |
| OCR ảnh thuốc / quét mã vạch | **Backlog Day 07+** — Day 06 chỉ nhập text |
| Tích hợp API Long Châu thật | **Backlog** — Day 06 dùng `drugs-demo.json` |
| Chat dược sĩ sẵn có | **Giữ** — bot prefill context handoff |

---

## 6. Câu chốt cuối

```text
Dựa trên review app Long Châu (chat chậm/treo), disclaimer "chỉ tham khảo",
và analog failure path từ NEO teardown,
nhóm sẽ build prototype Safety Bot chat,
cho người dùng app Long Châu đang cầm một thuốc và có một tình trạng sức khỏe,
để giải quyết pain "không biết thuốc có an toàn với tình trạng mình không",
bằng cách AI tra cứu nguồn whitelist + đối chiếu + xuất Safety Card,
và sẽ test failure path "nhập nhầm thuốc / triệu chứng khẩn / không có trong DB".
```

---

## 7. Backlog (không build Day 06)

- Quét mã vạch / OCR ảnh hộp thuốc → auto điền tên thuốc
- Tích hợp chat dược sĩ Long Châu thật (prefill API)
- Tương tác đa thuốc (polypharmacy)
- Gợi ý mua thuốc thay thế trên catalog Long Châu
- Đa ngôn ngữ / voice input
- Learning loop correction → cập nhật DB production

---

## 8. Sketch as-is / to-be (nhóm)

### As-is

```text
User có thuốc + lo lắng tình trạng sức khỏe
    → Mở app Long Châu
    → Chat dược sĩ (chờ / treo) HOẶC Google (không tin cậy)
    → Tự quyết định uống hay không — rủi ro cao
```

### To-be (prototype Day 06)

```text
User mở "Tra cứu an toàn thuốc"
    → Nhập tình trạng
    → Nhập thuốc/hoạt chất
    → Safety Card + cờ Xanh/Vàng/Đỏ + nguồn
    → [Vàng/Đỏ/Không chắc] → "Chat dược sĩ Long Châu" (prefill)
    → [Khẩn cấp] → 115 / CSYT — không tra cứu bình thường
```

---

*Synthesis toolkit — Batch 02 · Long Châu Safety Bot · Day 05*
