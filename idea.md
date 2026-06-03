# Day 05 Work Breakdown (5 người)

## Mục tiêu cuối ngày

Hoàn thành:

* Evidence Pack
* Thin SPEC v1
* Chốt build slice cho Day 06
* Chốt 4 paths
* Chốt failure modes

---

## Member 1 – Self-use Research Lead

### Nhiệm vụ

Dùng Ada Health hoặc các symptom checker tương tự.

Chạy tối thiểu 10 test cases:

1. Sốt + đau họng
2. Ho + sốt
3. Đau đầu
4. Đau bụng
5. Đau ngực
6. Khó thở
7. Chóng mặt
8. Mệt mỏi
9. Mô tả triệu chứng mơ hồ
10. Nhiều triệu chứng cùng lúc

### Deliverable

Bảng:

* Input
* Follow-up questions
* Output
* Observation
* Failure mode

### Mục tiêu

Hiểu:

* Viết theo bảng của evidence-pack-template.md: Self-use evidence

---

## Member 2 – User Evidence Research

### Nhiệm vụ

Thu thập review thực tế.

Nguồn:

* Google Play
* App Store
* Reddit
* Quora
* Healthcare forums

Thu tối thiểu:

* 15 review tích cực
* 15 review tiêu cực

### Deliverable

Bảng:

* Quote
* User type
* Pain point
* Link

### Mục tiêu

Tìm:

* Trust issue
* Too many questions
* Wrong recommendation
* Confusing output
* Decision support needs
* Viết theo bảng trong  3. User / review / social evidence

---

## Member 3 – Competitor Research

### Nhiệm vụ

Nghiên cứu (Ví dụ) Tối thiểu 3 app:

* Ada Health
* WebMD Symptom Checker
* MyVinmec
* Babylon Health (nếu còn tài liệu)
* ChatGPT, Gemini, ... (General Chatbot - Health Use Cases)
* Tìm thêm app khác nếu có

### Deliverable

Bảng:

* User flow
* Strength
* Weakness
* Pattern học được

### Mục tiêu

Viết theo bảng trong 4. Competitor / analog evidence

---

## Member 4 – Product Slice

### Nhiệm vụ

Từ evidence của cả nhóm:

* Gom pain points
* Gom failure modes
* Viết insight
* Viết opportunity
* Chọn build slice cuối cùng

Thiết kế:

* User segment
* User journey
* AI decision
* 4 paths
* Failure path

### Deliverable

Product Decision Document

Ví dụ:

User:
Người có triệu chứng nhẹ nhưng chưa biết có nên đi khám.

Pain:
Không biết mức độ nghiêm trọng của triệu chứng.

Build Slice:
Symptom Triage Assistant.

AI Decision:
Phân loại:

* Emergency
* See Doctor
* Self Care

Failure Mode:
Triệu chứng quá mơ hồ.

### Mục tiêu

Biến evidence thành một sản phẩm đủ nhỏ để build trong Day 06. Như synthesis-decide-toolkit.md

## Member 5 – SPEC

### Nhiệm vụ

Chịu trách nhiệm toàn bộ tài liệu cuối ngày.

Viết:

* Thin SPEC v1
* Evidence Pack
* Changelog SPEC
* Scope / Non-scope
* Test Plan
* Success Metrics

Tổng hợp input từ:

* Self-use research
* Review research
* Competitor research
* Product Slice Owner

### Deliverable

1. Evidence Pack hoàn chỉnh
2. Thin SPEC v1 hoàn chỉnh

Bao gồm:

* User
* Pain Statement
* Build Slice
* AI Role
* 4 Paths
* Failure Modes
* Test Cases
* Backlog

### Mục tiêu

Đảm bảo mọi quyết định trong SPEC đều có evidence hỗ trợ và tài liệu đủ để Day 06 bắt đầu build ngay. Như thin-spec-template.md
