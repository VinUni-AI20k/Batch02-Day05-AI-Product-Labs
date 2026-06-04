# Thin SPEC — Chatbot gợi ý món ăn cho ShopeeFood (MVP)

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

## 1. Track, product/app và user

**Track:** [Cần điền thủ công]  
**Product/app thật:** ShopeeFood  
**User cụ thể:** Người dùng mở app khi đói, chưa có món cụ thể trong đầu, có ý định mơ hồ (ví dụ: "món gì nóng nóng, rẻ rẻ, gần đây").  
**Nhóm có phải user thật không? Nếu không, khác ở đâu?** [Cần điền thủ công]  

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
|---|---|---|---|
| **P1:** Tê liệt vì quá nhiều lựa chọn | Phỏng vấn & quan sát trực tiếp | Thời gian từ mở app đến đặt (time-to-order) dài, tỉ lệ lướt rồi thoát app cao. | Giới hạn kết quả gợi ý tối đa 3 món/quán phù hợp nhất để giảm choice paralysis. |
| **P2:** Gợi ý tối nghĩa / như quảng cáo | Review App Store & Phỏng vấn | Người dùng không tin tưởng gợi ý mặc định vì không hiểu lý do món đó được đề xuất. | Mỗi gợi ý phải có thêm 1 dòng lý do thuyết phục bám sát ý định. |
| **P3:** Không có cách diễn đạt ý định mơ hồ | Ghi nhận hành vi nhập/search | Việc tìm kiếm bằng từ khóa thông thường không giải quyết được các mong muốn tự nhiên phi cấu trúc. | Cung cấp giao diện chat để người dùng nhập ý định tự do và dùng AI diễn giải. |

## 3. Pain statement

```text
User [người dùng ShopeeFood chưa biết ăn gì] đang gặp khó ở [bước tìm kiếm và quyết định chọn món khi đang đói],
vì [danh sách "Gợi ý cho bạn" thiếu ngữ cảnh/không liên quan và ô search chỉ nhận keyword cứng],
dẫn tới [họ tốn nhiều thời gian lướt mỏi mắt và đôi khi bỏ cuộc không đặt hàng nữa].
Bằng chứng chính là [các giả thuyết P1-P3 trong spec.md - cần điền quote/screenshot phỏng vấn thực tế sau khi có].
```

## 4. Build slice

```text
Cho [người dùng đang mở ShopeeFood nhưng chưa biết ăn gì] đang [muốn tìm món ăn nhanh chóng phù hợp nhu cầu mơ hồ],
prototype sẽ dùng AI để [augment việc chọn món/quán],
tạo ra [3 thẻ gợi ý quán/món thực tế đang mở cửa kèm giá, khoảng cách và 1 dòng giải thích lý do ngắn gọn],
và xử lý [các lỗi rủi ro như low-confidence, lạc đề, hoặc không có quán] bằng [yêu cầu làm rõ (clarify), từ chối lịch sự và fallback về gợi ý chung hoặc luồng gốc của app].
```

## 5. Auto/Aug decision

Chọn một:

- [x] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [ ] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:**
- Đặt đồ ăn gắn liền với khẩu vị cá nhân, chi tiêu tiền nong và lòng tin. Nếu AI tự đặt (Automate) sai sẽ làm mất lòng tin nghiêm trọng của người dùng.
- Khẩu vị cá nhân rất đa dạng và thay đổi liên tục theo tâm trạng/ngữ cảnh mà AI khó đoán định chính xác hoàn toàn.
- Phương án Augmentation cho phép sai số nhất định: AI chỉ cần gợi ý đủ tốt để hỗ trợ người dùng đưa ra quyết định cuối cùng một cách nhanh chóng và tự tin nhất.

**Human role:** decider

## 6. Four paths

| Path | Prototype phải thể hiện gì? |
|---|---|
| **Happy** | Người dùng nhập ý định rõ ràng (ví dụ: "nóng, dưới 50k, gần đây"). Hệ thống trả về tối đa 3 gợi ý quán thực tế kèm lý do ngắn gọn (<= 12 từ) và nút bấm 1-chạm mở quán. Cho phép refine 1 lần ("Rẻ hơn", "Khác đi"). |
| **Low-confidence** | Người dùng nhập câu quá mơ hồ (ví dụ: "đặt gì giờ"). AI không đoán bừa mà hỏi lại đúng 1 câu làm rõ. Nếu người dùng vẫn mơ hồ lần 2, đưa ra 3 gợi ý phổ biến nhất quanh đó kèm ghi chú "gợi ý chung". |
| **Failure** | Gồm các case lỗi hệ thống/dữ liệu: <br>1. Thiếu dữ liệu/quán đóng cửa (TC-04, TC-05): Báo rõ lý do, gợi ý đổi địa chỉ/đợi giờ mở, hoặc hiển thị nút mở danh sách đầy đủ. <br>2. Ngân sách bất khả thi (TC-06): Báo "quanh bạn chưa có món trong tầm giá này", gợi ý nới giá. <br>3. LLM ảo tưởng (TC-07): Lọc bỏ `restaurant_id` không tồn tại ở tầng code. |
| **Correction** | Xử lý khi user sửa đổi hoặc lạc đề:<br>1. Bấm refine "Khác đi" nhiều lần: Đổi gợi ý mỗi lần, sau 3 lần đề nghị nhập lại ý định.<br>2. Lạc đề (TC-08): Từ chối nhẹ, kéo về ăn uống ("Mình chỉ giúp chọn món thôi nha — bạn đang muốn ăn gì?").<br>3. Hỏi y tế (TC-11): Từ chối khéo, đề xuất món nhẹ bụng chung chung + khuyên hỏi bác sĩ. |

## 7. Failure mode nguy hiểm nhất

```text
Nếu user [gửi ý định và kích hoạt AI gợi ý quán],
AI có thể [ảo tưởng (hallucination) ra các món ăn hoặc restaurant_id không có thật trong cơ sở dữ liệu],
hậu quả là [người dùng bấm vào thẻ gợi ý bị lỗi hệ thống (link hỏng, lỗi 404) hoặc dẫn tới quán đã đóng cửa/ngoài phạm vi giao, gây mất uy tín dịch vụ].
Prototype sẽ xử lý bằng [lọc ở tầng code: sau khi nhận JSON từ LLM, đối chiếu chéo danh sách thực tế của hệ thống; loại bỏ ngay các ID ảo; nếu danh sách sau lọc trống thì kích hoạt fallback ít dữ liệu (TC-04)].
Owner kiểm thử path này là [Cần điền thủ công].
```

## 8. Owner plan cho sáng Day 06

| Thành viên | Việc phụ trách | Bằng chứng cần có trong repo |
|---|---|---|
| [Cần điền thủ công] | Research / evidence | Bảng kết quả phỏng vấn + tổng hợp review thực tế. |
| [Cần điền thủ công] | SPEC | Hoàn thiện file `thin-spec.md` và `evidence-pack.md`. |
| [Cần điền thủ công] | Prototype | Source code giao diện chat gợi ý, prompt system và danh sách quán mẫu giả lập (10-20 quán). |
| [Cần điền thủ công] | Test / failure path | Bảng chạy 12 testcase và code xử lý các kịch bản fallback. |
| [Cần điền thủ công] | Demo script / repo | Tài liệu kịch bản demo và video quay thử các luồng. |
