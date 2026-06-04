# Reflection — Phần Cá Nhân Day 05

**Học viên:** Phung Văn Thạch — 2A202601004  
**Ngày:** 03/06/2026  
**Sản phẩm đã mổ:** Vietnam Airlines — NEO  
**Session self-use:** ~14:54–15:02, 9 screenshot chat + 1 screenshot landing page

---

## Vai trò của tôi trong nhóm

| Vai trò | Việc cụ thể |
|---|---|
| **Research / evidence cá nhân** | Dùng thử NEO trên web, ghi transcript, chụp 9 màn hình hội thoại |
| **Needfinding → insight** | Chuyển observation thành 4 finding + đề xuất build slice cho nhóm |
| **Chưa phụ trách (Day 06)** | Prototype code, demo script, test automation |

---

## Việc đã làm (theo timeline evidence)

1. **14:54** — Bấm "Bắt đầu", hỏi "thông tin vé máy bay" → nhận FAQ có cấu trúc (`14.54.40.png`).
2. **14:54** — Hỏi lịch bay HN → Đà Lạt "5 ngày nữa" → bị redirect, không có danh sách chuyến (`14.54.50.png`).
3. **14:55–14:56** — Hỏi gợi ý du lịch Đà Lạt + bay sáng/tối + cách book → bot trả guide dài và link đặt vé (`14.55.27.png`, `14.56.09.png`).
4. **14:57–14:59** — Thử luồng "gợi ý đặt vé rẻ": slot-filling → loop khi nói "tìm giá rẻ" → confirm 2 lần → **lỗi hệ thống** cả 2 lần (`14.57.10.png` → `14.59.08.png`).
5. **15:01** — Hỏi lộ trình 2N3Đ → bot từ chối honest vì data chỉ có 3N2Đ (`15.01.17.png`).
6. Chụp landing page promise NEO (`15.01.57.png`).
7. Viết lại `app-teardown.md` bám 100% transcript screenshot — **không dùng giả định** về hành lý thất lạc hay vali.

---

## AI hỗ trợ phần nào

| Việc | AI (Cursor) làm | Tôi làm |
|---|---|---|
| Đọc & mô tả 11 file trong `Evidence/` | Phân tích nội dung từng screenshot | Chụp screenshot, chạy session chat thật |
| Draft teardown + transcript table | Soạn cấu trúc, map file → finding | Xác nhận quote bot/user khớp ảnh |
| Phát hiện file không liên quan | Flag `10.29.14.png`, `Figure_1.png` không thuộc NEO | Có thể xóa hoặc chuyển folder khác |

**Điều chỉnh quan trọng:** Bản teardown trước mô tả case "vali thất lạc" — **không có trong evidence**. Đã viết lại theo luồng HN→Đà Lạt thực tế.

---

## Bài học sau self-use

1. **FAQ giỏi ≠ task completion.** NEO trả lời dài, có link, có travel guide — nhưng **task quan trọng nhất** (xem chuyến/giá) fail ở bước cuối. Product metric nên đo *task done*, không đo *message length*.

2. **Slot-filling cần nhánh "flexible intent".** "Tìm giá rẻ" khác "tôi bay ngày 15/6" — bot cần detect và đổi chiến lược, không loop.

3. **Failure path phải cụ thể.** "Hệ thống gặp lỗi" + "thử lại sau" là dead-end sau 8 phút chat. Cần fallback có giá trị (deep link prefill, handoff có context).

4. **CSAT timing matters.** Hỏi rating sau redirect — trước khi user được help — làm sai signal và làm user khó chịu thêm.

5. **Evidence-first teardown.** Mỗi finding gắn filename screenshot → dễ defend trước nhóm và mentor; tránh viết finding "đẹp" nhưng không có self-use.

---

## Finding đóng góp cho nhóm (tóm tắt)

| # | Finding | File evidence |
|---|---|---|
| 1 | API search fail sau confirm slot đủ | `14.58.28.png`, `14.59.08.png` |
| 2 | Hỏi lịch chuyến cụ thể → redirect thay vì kết quả | `14.54.50.png` |
| 3 | Loop slot khi user "tìm giá rẻ" chưa chốt ngày | `14.57.10.png` |
| 4 | CSAT sớm trước khi resolve | `14.54.50.png` |

**Build slice đề xuất:** AI thu slot + detect flexible date + fallback deep link khi API lỗi (không build lại toàn bộ NEO).

---

## Việc còn lại

- [ ] Chia sẻ finding với nhóm, map vào `02-group-spec/evidence-pack-template.md`
- [ ] Thử nút **"Gặp tư vấn viên"** (`14.54.50.png`) để xem handoff có giữ context không
- [ ] Dọn folder `Evidence/`: xóa hoặc tách `10.29.14.png`, `Figure_1.png` (không liên quan NEO)

---

*Reflection cá nhân — Day 05 · Phung Văn Thạch · 2A202601004*
