# 📋 Evidence Pack
## 1. Nhóm và Track

| Mục | Nội dung |
|---|---|
| **Tên nhóm** | *C401-E6* |
| **Track** | Food, Local delivery |
| **Product/App đã chọn** | Shopeefood, Grabfood |
| **Build slice đang nghĩ** | Xây dựng tính năng duy nhất là gợi ý đúng **3 món ăn** dựa trên mô tả tự nhiên của người dùng, có giải thích lý do ngắn gọn vì sao phù hợp. |

## 2. Self-use Evidence

| Observation | Screenshot/Link | Path liên quan | Điều học được |
|---|---|---|---|
| Dùng app **GrabFood/ShopeeFood** gõ từ khóa: *"tôi muốn ăn đồ nước, thanh đạm, loanh quanh Quận 1"* | - | Failure | App trả về kết quả rỗng hoặc gợi ý các quán có tên chứa chính xác từ "thanh đạm". **Không có khả năng hiểu ngữ cảnh (context).** |
| Hỏi **ChatGPT**: *"Trưa nay ăn gì đồ nước, thanh đạm ở Quận 1"* | - | Low-confidence / Correction | LLM hiểu đúng ý định, phân tích tốt loại món và taste. Tuy nhiên, quán ăn được gợi ý **bị sai vị trí, quán ảo**, không nắm được dữ liệu khoảng cách thực tế. |

## 3. User / Review / Social Evidence

| Quote / Review / Observation | Nguồn | User là ai? | Pain / Failure mode |
|---|---|---|---|
| *"Trưa nào tôi và đồng nghiệp cũng mất 20–30 phút chỉ để chọn món, lướt app một hồi cuối cùng lại gọi lại món cũ vì mệt."* | Phỏng vấn nhanh | Nhân viên văn phòng | **Decision fatigue** — tốn quá nhiều thời gian ra quyết định, không biết mình muốn ăn gì. |
| *"Thường chỉ nghĩ ra được cảm giác thèm, ví dụ 'muốn đồ nước' nhưng gõ vào app thì phải tự suy ra tên món cụ thể (phở, bún) mới tìm được."* | Giả định | Nhân viên văn phòng | App hiện tại chỉ tìm theo keyword, **bắt ép user phải biết chính xác tên món.** |

> ⚠️ **Lưu ý:** Đây là giả định. Nhóm sẽ kiểm bằng phỏng vấn nhanh **3–5 nhân viên văn phòng** trước checkpoint M1 Day 06.

## 4. Competitor / Analog Evidence

| App / Mô hình | Họ xử lý task này thế nào? | Pattern học được | Có áp dụng trong 1 ngày không? |
|---|---|---|---|
| **GrabFood / ShopeeFood** | Tìm kiếm thuần túy bằng keyword tên quán, tên món. Lọc theo danh mục cứng (Đồ uống, Cơm, Bún/Phở). | Giao diện hiển thị món ăn rõ ràng, quen thuộc. Nhưng filter **không hiểu được "ý định".** | Không áp dụng logic tìm kiếm, nhưng có thể học cách **hiển thị kết quả.** |
| **ChatGPT / Claude** | Hiểu các mô tả tự nhiên (*thanh đạm, đồ nước*) và diễn giải logic rất tốt. | Khả năng **"extract intent"** và map (khớp) với nhu cầu của user. | ✅ Có. Dùng LLM làm core để hiểu mô tả tự nhiên của người dùng. |

## 5. Evidence → Insight

**Evidence nổi bật nhất:**
Người dùng mất **20–30 phút** chỉ để lướt app giao đồ ăn mà không chốt được món vì họ không có ý tưởng rõ ràng, trong khi các app lại bắt họ phải **gõ đúng keyword.**

**Insight:**
User không chỉ gặp khó khăn trong việc *tìm đồ ăn* (surface problem). Thật ra họ cần **hỗ trợ quyết định (decision support)** để giảm bớt áp lực suy nghĩ trong giờ nghỉ trưa ngắn ngủi.

**Opportunity:**
AI có thể giúp bằng cách tự động hóa (automate) việc chuyển đổi mô tả mơ hồ thành các **tags cụ thể** (loại món, taste, location) và **giới hạn sự lựa chọn xuống 3 món tốt nhất** từ một dataset nhỏ có sẵn.

## 6. Evidence Đổi SPEC như thế nào?

| # | Hạng mục | Thay đổi? |
|---|---|---|
| 1 | Đổi user chính | no |
| 2 | Đổi pain statement | no |
| 3 | Đổi build slice | yes |
| 4 | Đổi Auto/Aug decision | yes |
| 5 | Đổi 4 paths | no |
| 6 | Đổi failure mode | yes |
| 7 | Đổi owner/test plan | yes  |

### Thay đổi quan trọng

**Trước evidence, nhóm định:**
Để AI tự do tổng hợp và tìm kiếm ngẫu nhiên các món ăn trên mạng.

**Sau evidence, nhóm đổi thành:**

1. Áp dụng **dataset nhỏ (10–20 món ăn)** có gán tag chi tiết nội bộ.
2. Bổ sung **Hard filter theo bán kính (< 3km)** để tránh gợi ý quán quá xa.
3. Thêm **Checkbox bắt buộc kiểm tra dị ứng** (ví dụ: dị ứng đậu phộng) để AI loại bỏ trước khi gợi ý.

**Lý do:** Đảm bảo tính thực tế (khoảng cách) và tính an toàn tuyệt đối (dị ứng) — những điểm yếu chí mạng của các mô hình LLM nếu để chúng tự do sinh kết quả. Việc dùng dataset nhỏ (10–20 món) cũng giúp dự án dễ hoàn thành trong khuôn khổ Mini Hackathon.