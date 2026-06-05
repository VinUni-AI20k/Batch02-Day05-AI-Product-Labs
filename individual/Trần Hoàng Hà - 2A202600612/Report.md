# Workshop AI Product Review

# Moni - AI Financial Assistant (MoMo)

## Reviewer

- **Student Name**: Trần Hoàng Hà
- **Student ID**: 2A202600612
- **Date**: 03-06-2026
- **Product**: Moni AI Assistant
- **Platform**: MoMo

---

1. Promise của Moni: "Tôi có thể giúp bạn nhiều việc liên quan đến ví điện tử Momo như tư vấn các chương trình khuyến mãi, hỗ trợ quản lý chi tiêu và tài chính cá nhân, cung cấp thông tin về các dịch vụ trong Momo như thành toán hóa đơn, chuyển tiền, mua vé xem phim, đặt vé xe, gói cước mạng di động và nhiều hơn nữa. Bạn cần tôi giúp gì hôm nay?"

# Executive Summary

Moni hiện không còn là một chatbot FAQ đơn thuần.

Qua các bài kiểm thử thực tế, Moni có khả năng:

- Truy cập dữ liệu giao dịch người dùng
- Tổng hợp dữ liệu tài chính
- So sánh dữ liệu giữa các khoảng thời gian
- Phân loại danh mục chi tiêu
- Đưa ra nhận xét tài chính cơ bản

Tuy nhiên Moni vẫn chưa đạt đến vai trò một Financial Coach thực thụ.

Giá trị hiện tại:

```text
Financial Data Assistant
```

Giá trị kỳ vọng:

```text
Financial Coach
```

---

# Product Promise

Moni giới thiệu khả năng:

- Theo dõi và phân tích chi tiêu
- Lập ngân sách
- Báo cáo tài chính cá nhân
- Tư vấn tiết kiệm và đầu tư
- Nhắc nhở hóa đơn và khoản phải trả

Ngoài ra còn hỗ trợ:

- Thanh toán
- Chuyển tiền
- Dịch vụ trong hệ sinh thái MoMo

---

# Test Scenarios

## Scenario 1 - Phân tích chi tiêu ăn uống

### Query

```text
Tháng này tôi đã chi bao nhiêu tiền ăn uống?
```

### Result

```text
0đ - 0 giao dịch
```

### Assessment

✅ Truy cập dữ liệu giao dịch

✅ Phân loại danh mục chi tiêu

✅ Trả lời chính xác

⚠️ Chưa đưa ra insight hoặc khuyến nghị

---

## Scenario 2 - Phân tích tình hình tài chính

### Query

```text
Thử phân tích tình hình tài chính, thói quen chi tiêu của tôi
```

### Result

```text
Chưa có dữ liệu giao dịch để phân tích
```

### Assessment

✅ Trung thực

✅ Không hallucination

❌ Chưa gợi ý hướng hành động cụ thể

---

## Scenario 3 - Tư vấn đầu tư 3 năm

### Query

```text
Tôi nên đầu tư gì trong 3 năm tới?
```

### Result

Đưa ra lời khuyên chung về:

- Tiết kiệm
- Chứng chỉ quỹ
- Cổ phiếu
- Trái phiếu

### Assessment

✅ An toàn pháp lý

✅ Không đưa khuyến nghị sai

❌ Không cá nhân hóa

❌ Không tận dụng hồ sơ tài chính người dùng

---

## Scenario 4 - Hỏi về vàng

### Query

```text
Tôi muốn tìm hiểu về vàng, giúp tôi đưa ra nhận định.
```

### Result

Mô tả đặc điểm đầu tư vàng.

### Assessment

✅ Kiến thức cơ bản chính xác

❌ Không có dữ liệu thị trường

❌ Không có góc nhìn cá nhân hóa

❌ Không có recommendation

---

## Scenario 5 - Điều tra giao dịch bất thường

### Query

```text
Tại sao giao dịch của tôi lúc 1h đêm qua bị trừ tiền?
```

### Result

```text
Mình chỉ hỗ trợ các thông tin liên quan đến tài chính và sản phẩm của MoMo.
```

### Assessment

❌ Không truy cập giao dịch liên quan

❌ Không điều tra được giao dịch

❌ Không tạo ticket

❌ Không chuyển CSKH

---

## Scenario 6 - So sánh chi tiêu theo thời gian

### Query

```text
Tháng trước tôi chi tiêu nhiều hơn hay ít hơn tháng này?
```

### Result

```text
05/2026: 92.222đ
06/2026: 0đ

Kết luận:
Tháng trước chi tiêu nhiều hơn.
```

### Assessment

✅ So sánh dữ liệu

✅ Tổng hợp dữ liệu lịch sử

✅ Tạo kết luận

### Nhận xét

Moni đã có khả năng:

```text
Data Retrieval
+
Basic Reasoning
```

---

## Scenario 7 - Đánh giá mức độ chi tiêu

### Query

```text
Tôi có đang chi quá nhiều cho ăn uống không?
```

### Result

```text
Không có dấu hiệu chi quá nhiều.
```

### Assessment

✅ Hiểu intent

✅ Kiểm tra danh mục chi tiêu

⚠️ Chưa có benchmark

### Nhận xét

Moni đánh giá dựa trên:

```text
Có dữ liệu hay không
```

Thay vì:

```text
Chi tiêu đó có hợp lý hay không
```

---

## Scenario 8 - Nhận xét thói quen chi tiêu

### Query

```text
Dựa trên lịch sử của tôi, hãy nhận xét thói quen chi tiêu
```

### Result

```text
Bạn có thói quen chi tiêu khá tiết kiệm.
```

### Assessment

✅ Có summary

✅ Có insight cơ bản

⚠️ Insight còn nông

### Nhận xét

Moni mới dừng ở:

```text
Observation
```

Chưa đạt:

```text
Recommendation
```

---

## Scenario 9 - Xác định danh mục chi tiêu chính

### Query

```text
Tôi thường chi tiêu nhiều nhất cho việc gì?
```

### Result

```text
Không xác định được.
```

### Follow-up

```text
Check lại lịch sử của tôi và trả lời,
tôi thường chi tiêu cho việc gì?
```

### Result

```text
Không xác định được.
```

### Assessment

❌ Không tận dụng dữ liệu lịch sử

❌ Không xử lý được follow-up context

❌ Không tự suy luận

### Nhận xét

Dấu hiệu:

```text
Context Loss
```

hoặc

```text
Tool Invocation Failure
```

---

# Capability Assessment

## Level 1 - FAQ Bot

Khả năng:

- Trả lời câu hỏi
- Tra cứu thông tin

Status:

✅ Pass

---

## Level 2 - Financial Data Assistant

Khả năng:

- Truy vấn dữ liệu
- Tổng hợp dữ liệu
- So sánh dữ liệu
- Nhận xét cơ bản

Status:

✅ Pass

Moni hiện đang ở level này.

---

## Level 3 - Financial Coach

Khả năng:

- Khuyến nghị cá nhân hóa
- Lập kế hoạch tài chính
- Đề xuất ngân sách
- Tối ưu chi tiêu

Status:

❌ Chưa đạt

---

## Level 4 - Financial Agent

Khả năng:

- Tạo ticket
- Điều tra giao dịch
- Thực hiện hành động
- Kết nối CSKH

Status:

❌ Chưa đạt

---

# As-Is Journey

## Financial Analysis

```text
User hỏi phân tích tài chính
        |
        v
Moni tổng hợp dữ liệu
        |
        v
Moni đưa ra nhận xét
        |
        v
Kết thúc
```

Vấn đề:

```text
Không có hành động tiếp theo
```

---

## Transaction Support

```text
User phát hiện giao dịch bất thường
        |
        v
Hỏi Moni
        |
        v
Moni từ chối hỗ trợ
        |
        v
Dead End
```

---

# Weakest Paths

## Path 1 - Transaction Support

Mức độ ảnh hưởng:

★★★★★

Tác động:

- Mất niềm tin
- Tăng ticket
- Tăng cuộc gọi hotline

---

## Path 2 - Financial Coaching

Mức độ ảnh hưởng:

★★★★☆

Tác động:

- Không tạo giá trị AI khác biệt
- Không tăng engagement
- Không tăng retention

---

# To-Be Design

## Financial Coach Flow

```text
User:
Nhận xét tài chính của tôi

        |
        v

Moni:
- Tổng hợp dữ liệu
- Phân tích hành vi
- Đánh giá sức khỏe tài chính

        |
        v

Đưa ra khuyến nghị

- Tiết kiệm
- Đầu tư
- Quản lý ngân sách

        |
        v

Tạo mục tiêu tài chính
```

---

## Transaction Support Flow

```text
User:
Tại sao tôi bị trừ tiền?

        |
        v

Transaction Detection

        |
        v

Tìm giao dịch liên quan

        |
   +----+----+
   |         |
   v         v

Có nguyên nhân   Không xác định

   |               |
   v               v

Trả lời      Tạo ticket

                   |
                   v

              Chuyển CSKH
```

---

# Product Decision

## Quyết định đề xuất

Ưu tiên nâng cấp:

```text
Financial Data Assistant
→
Financial Coach
```

Lý do:

- Tận dụng dữ liệu hiện có
- Chi phí triển khai thấp
- Không phụ thuộc backend phức tạp
- Tăng engagement nhanh

---

# Kết luận

Moni đã vượt xa một FAQ Bot thông thường.

Điểm mạnh:

- Data Retrieval
- Financial Summary
- Basic Reasoning

Điểm yếu:

- Thiếu Financial Coaching
- Thiếu Personalization
- Thiếu Actionable Recommendation
- Thiếu Transaction Support

Đánh giá hiện tại:

```text
FAQ Bot                     [██████████] 100%
Financial Data Assistant    [█████████░] 90%
Financial Coach             [████░░░░░░] 40%
Financial Agent             [██░░░░░░░░] 20%
```

Khuyến nghị:

> Chuyển trọng tâm từ "trả lời dữ liệu tài chính" sang "hướng dẫn người dùng ra quyết định tài chính".

