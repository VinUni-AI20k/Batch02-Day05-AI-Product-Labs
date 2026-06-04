# Thin SPEC — Long Châu Safety Bot (Cuối Day 05)

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

---

## 1. Track, product/app và user

**Track:** Healthcare / Pharmacy — app nhà thuốc thật  

**Product/app thật:** **Long Châu — Chuyên gia thuốc** (FPT Long Châu)  
- iOS: https://apps.apple.com/vn/app/long-châu-chuyên-gia-thuốc/id1586071844  
- Android: `vn.frt.longchau.app`  
- Hotline: 1800 6928 (08:00–22:00)

**User cụ thể:** Người **đã mua hoặc đang cầm thuốc/OTC** trên app Long Châu (hoặc chuẩn bị mua), có **tình trạng sức khỏe / triệu chứng / bệnh nền** (vd: đau đầu, sốt, tiểu đường, mang thai, dị ứng penicillin), muốn biết **thuốc/hoạt chất có an toàn để cân nhắc dùng không** trước khi tự ý uống hoặc trước khi chat dược sĩ.

**Nhóm có phải user thật không?** Có một phần — thành viên đã/đang dùng app mua thuốc gia đình. Khác biệt: nhóm không phải dược sĩ; prototype **không thay** tư vấn chuyên môn, chỉ mô phỏng luồng tra cứu + handoff.

---

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
|---|---|---|---|
| Chat dược sĩ có sẵn nhưng review "xử lý chậm", "treo chat cả tiếng" | App Store / AppRecs | Cần tra nhanh / biết đang chờ gì | Bot self-serve Safety Card **trước** queue dược sĩ |
| Disclaimer app: chỉ tham khảo, không thay chẩn đoán | Google Play mô tả Long Châu | User cần biết giới hạn AI | Mọi Safety Card có disclaimer + CTA dược sĩ |
| NEO: slot đủ → API lỗi bước cuối | Individual teardown VNA | Tool fail = mất trust | Không kết luận "được uống" khi tra cứu lỗi |
| Long Châu có "Chat dược sĩ + chụp ảnh sản phẩm" | Play Store | Entry point sản phẩm rõ | Prototype nhận **tên thuốc/hoạt chất** (OCR backlog Day 07+) |
| User flow đề xuất (tình trạng → thuốc → Safety Card) | Workshop nhóm | Task hẹp, demo được | Giữ đúng flow; bỏ scope "tư vấn mọi bệnh" |

---

## 3. Pain statement

```text
User đang cầm thuốc hoặc chuẩn bị mua trên app Long Châu
đang gặp khó ở bước "không biết thuốc/hoạt chất này có phù hợp với tình trạng của mình không",
vì app chủ yếu đưa vào chat dược sĩ (chờ/treo) hoặc user phải tự Google — không có Safety Card chuẩn có nguồn,
dẫn tới tự ý uống sai, bỏ qua chống chỉ định, hoặc lo lắng không cần thiết.
Bằng chứng chính là review App Store/AppRecs về chat chậm/treo + disclaimer app "chỉ tham khảo" chưa gắn với luồng tra cứu tự phục vụ.
```

---

## 4. Build slice

```text
Cho người dùng app Long Châu đang có một tình trạng/triệu chứng đã khai báo và muốn tra một tên thuốc hoặc hoạt chất,
prototype sẽ dùng AI để tra cứu thông tin từ nguồn whitelist (JSON/DB demo) + đối chiếu chống chỉ định/tương tác cơ bản với tình trạng đó,
tạo ra Safety Card (hoạt chất, chỉ định, chống chỉ định, lưu ý, mức cảnh báo, nguồn trích dẫn),
và xử lý failure mode "không tìm thấy thuốc / tình trạng mơ hồ / triệu chứng khẩn cấp"
bằng low-confidence hỏi lại + cờ đỏ chuyển "Chat dược sĩ Long Châu" kèm prefill (tình trạng + thuốc + transcript).
```

### Flow prototype (Day 06)

```text
1. User nhập tình trạng gặp phải (bắt buộc) — tùy chọn tên để cá nhân hóa lời chào
2. Hệ thống chào + xác nhận đã hiểu ngữ cảnh
3. Hỏi: tra theo tên thuốc hay hoạt chất?
4. User nhập tên thuốc/hoạt chất
5. AI tra cứu nguồn đáng tin (DB demo)
6. Trả Safety Card
7. Đối chiếu thuốc ↔ tình trạng → cảnh báo (Xanh / Vàng / Đỏ)
8. Khuyến nghị hỏi dược sĩ/bác sĩ nếu Vàng/Đỏ hoặc user không chắc
```

---

## 5. Auto/Aug decision

Chọn một:

- [ ] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [x] **Conditional automation:** AI tự tra cứu + draft Safety Card trong case hẹp; case mơ hồ/rủi ro chuyển dược sĩ.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** Tra cứu hoạt chất + tóm tắt từ DB có thể tự động trong scope hẹp; **mọi quyết định "có uống được không"** ở mức Vàng/Đỏ **bắt buộc** human (dược sĩ) hoặc user tự chịu trách nhiệm sau khi đọc disclaimer — không auto kê đơn/đặt hàng.

**Human role:** **Dược sĩ Long Châu** = decider + rescuer khi cờ Vàng/Đỏ; **User** = decider cuối với cờ Xanh (vẫn có disclaimer).

---

## 6. Four paths

| Path | Prototype phải thể hiện gì? |
|---|---|
| **Happy** | User nhập "sốt nhẹ" + "Paracetamol" → Safety Card đầy đủ, nguồn, cờ Xanh hoặc Vàng phù hợp, disclaimer, nút "Hỏi dược sĩ" (optional). |
| **Low-confidence** | Tên thuốc mơ hồ ("Panadol" — nhiều biệt dược) → bot hỏi lại hoặc show 2–3 lựa chọn hoạt chất; tình trạng mơ hồ ("đau" không rõ) → hỏi clarifying question. |
| **Failure** | Thuốc không có trong DB; hoặc triệu chứng khẩn (đau ngực, khó thở, phản vệ) → **không** tra cứu bình thường; message khẩn + "Gọi 115 / đến CSYT" + "Chat dược sĩ ngay". Tra cứu API/DB lỗi → không bịa Safety Card; chuyển dược sĩ với prefill. |
| **Correction** | User sửa "không phải Ibuprofen mà Paracetamol" → Safety Card cập nhật; trong demo ghi log correction trong session (backlog: gửi feedback cho team content). |

---

## 7. Failure mode nguy hiểm nhất

```text
Nếu user khai báo mơ hồ ("đau đầu") và nhập nhầm tên thuốc/hoạt chất,
AI có thể trả Safety Card với mức cảnh báo sai (quá thấp),
hậu quả là user tự ý uống thuốc có chống chỉ định hoặc bỏ qua tương tác nguy hiểm.
Prototype sẽ xử lý bằng: bắt buộc xác nhận hoạt chất (low-confidence),
mọi Safety Card có nguồn + disclaimer,
cờ Vàng/Đỏ luôn kèm CTA "Chat dược sĩ Long Châu" (prefill context),
và không dùng câu tuyệt đối "được uống / không được uống" — chỉ "thận trọng / cần hỏi chuyên môn".
Owner kiểm thử path này là Phung Văn Thạch.
```

---

## 8. Owner plan cho sáng Day 06

| Thành viên | Việc phụ trách | Bằng chứng cần có trong repo |
|---|---|---|
| **Phung Văn Thạch** | Research / evidence, SPEC, demo script | `evidence-pack-template.md`, `thin-spec-template.md`, script demo 3 phút |
| **Hoàng Phương Thảo** | Prototype (chat UI + Safety Card) | Screenshot happy path + repo code Day 06 |
| **Thái Thị Yến Nhi** | Test failure path (DB miss, triệu chứng khẩn, nhập nhầm thuốc) | Screen recording hoặc screenshot 3 failure case |
| **Trịnh Vũ Anh Tuấn** | DB demo 5–10 hoạt chất (JSON) + rule đối chiếu tình trạng | File `data/drugs-demo.json` trong repo prototype |
| **Phung Văn Thạch** | Repo README + link demo | URL deploy hoặc hướng dẫn chạy local |

---

## Phụ lục — Safety Card (output mẫu prototype)

| Trường | Nội dung |
|---|---|
| Hoạt chất / Tên thuốc | Paracetamol 500mg |
| Tình trạng user khai báo | Sốt nhẹ, không bệnh gan |
| Chỉ định (tóm tắt) | Hạ sốt, giảm đau |
| Chống chỉ định liên quan | Suy gan nặng, dị ứng paracetamol |
| Đối chiếu với tình trạng | **Vàng** — cần lưu ý liều lượng, không quá ngưỡng |
| Nguồn | DB demo + tờ hướng dẫn sử dụng (link mẫu) |
| Disclaimer | Không thay thế tư vấn dược sĩ/bác sĩ |
| CTA | [Hỏi dược sĩ Long Châu] — prefill tình trạng + thuốc |

---

*Thin SPEC — Batch 02 Long Châu Safety Bot · Day 05*
