# AI Food Recommendation (Mini Hackathon Project)

## 1. Overview
Hệ thống AI sẽ **hỗ trợ quyết định (AI augmentation)** bằng cách hiểu nhu cầu mơ hồ của người dùng và đưa ra gợi ý phù hợp.

## 2. Problem Statement (Vấn đề chính)

Người dùng (đặc biệt là dân văn phòng) thường gặp tình huống:

- Không biết ăn gì
- Chỉ có mô tả mơ hồ như:
  - “ăn gì đó thanh đạm”
  - “muốn đồ nước”
  - “ăn gần chỗ làm”
- Các app hiện tại:
  - Chỉ tìm theo keyword
  - Không hiểu “context” (tâm trạng, thời tiết, nhu cầu)

Kết quả: mất 20–30 phút chỉ để chọn món.

---

## 3. Solution (Giải pháp)

Xây dựng một **prototype AI Food Recommendation** có khả năng:

- Hiểu mô tả tự nhiên của người dùng
- Phân tích nhu cầu (context)
- Gợi ý món ăn phù hợp

---

## 4. Build Slice (Phạm vi dự án)

### Chúng tôi chỉ build **một tính năng duy nhất**:

> Gợi ý món ăn dựa trên mô tả tự nhiên của người dùng

Cho:
> Một nhân viên văn phòng đang muốn đặt đồ ăn trưa nhưng không có ý tưởng rõ ràng

Khi họ nhập:
> “tôi muốn ăn đồ nước, thanh đạm, loanh quanh Quận 1”

---

Hệ thống sẽ:

✅ Phân tích:
- Loại món: đồ nước  
- Taste: thanh đạm  
- Location: Quận 1  

✅ Sau đó trả về:
- 3 gợi ý món ăn

✅ Kèm theo:
- Lý do ngắn gọn vì sao phù hợp

---

## 5. Core Idea (Ý tưởng cốt lõi)

Điểm khác biệt của hệ thống:

> Không tìm theo keyword  
> Mà hiểu “ý định” (intent) và “context”

---

Ví dụ:

| Input | App truyền thống | Hệ thống AI |
|------|----------------|-------------|
| “ăn thanh đạm” | Không hiểu | Hiểu và filter |
| “đồ nước” | Phải search tay | Gợi ý tự động |

---

## 6. Failure Modes (Trường hợp lỗi)

### 1. Gợi ý quán quá xa
- Ví dụ: user ở Quận 1, nhưng gợi ý tận Quận 7

👉 Giải pháp:
- Áp dụng hard filter theo bán kính (ví dụ: < 3km)

---

### 2. Gợi ý món chứa thành phần dị ứng
- Ví dụ: user dị ứng đậu phộng

👉 Giải pháp:
- Checkbox bắt buộc:
  > “Tôi bị dị ứng với: ______”

- Hệ thống sẽ loại bỏ món không phù hợp

---

## 8. Data Strategy (Dữ liệu)

- Sử dụng dataset nhỏ (10–20 món ăn)
- Có các thuộc tính:
  - name
  - price
  - location
  - tags (nước, khô, cay, thanh đạm)
  - phù hợp với mood / weather

---