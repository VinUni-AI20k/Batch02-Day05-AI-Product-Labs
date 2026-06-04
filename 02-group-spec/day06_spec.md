# SPEC sản phẩm — Long Châu Safety Bot

> Bản Day 6 update từ `02-group-spec/thin-spec-template.md` của Day 5.

---

## 0. Tóm tắt sản phẩm

**Tên sản phẩm:** Long Châu Safety Bot  
**Track:** Healthcare / Pharmacy  
**App tham chiếu:** Long Châu — Chuyên gia thuốc  
**Prototype Day 6:** Chat tra cứu thuốc + Safety Card  
**Lát cắt build:** User nhập **tình trạng sức khỏe + tuổi + giới tính + tên thuốc/hoạt chất** → bot tra **DB local / fuzzy / API fallback** → trả **Safety Card** có mức cảnh báo, nguồn, disclaimer và CTA hỏi dược sĩ.

Long Châu Safety Bot không phải AI bác sĩ, không kê đơn, không thay thế dược sĩ/bác sĩ. Prototype chỉ giải một câu hỏi hẹp:

> Với tình trạng, tuổi và giới tính của tôi, thuốc/hoạt chất này có điểm gì cần lưu ý không?

Bot trả lời bằng Safety Card có cấu trúc, có disclaimer, có nguồn và có đường fallback khi không chắc.

---

## 1. Bằng chứng

### 1.1. Trải nghiệm trực tiếp của nhóm

Nhóm quan sát workflow mua/tra thuốc trên Long Châu và thấy app đã có chat dược sĩ, nhưng chưa có một luồng self-serve chuẩn hóa để user tra nhanh:

```text
1 thuốc/hoạt chất + 1 tình trạng sức khỏe
→ Safety Card
→ cảnh báo Xanh/Vàng/Đỏ
→ hỏi dược sĩ nếu cần
```

Trong flow hiện tại, user thường đi theo một trong hai hướng:

```text
Mở app Long Châu
→ tìm thuốc hoặc chat dược sĩ
→ chờ dược sĩ / tự Google / hỏi nguồn ngoài
→ tự quyết định có nên dùng thuốc hay không
```

Điểm gãy là user cần thông tin an toàn nhanh, có nguồn và có giới hạn rõ, nhưng sản phẩm không nên để AI tự kết luận y tế tuyệt đối.

---

### 1.2. Bằng chứng ngoài nhóm

| Evidence | Nguồn | User / pain nói lên điều gì? |
|---|---|---|
| “Tư vấn rất dễ thương, ứng dụng rất tiện lợi” | Review app Long Châu | Chat dược sĩ có giá trị khi có người phản hồi. |
| “Xử lý cực kỳ chậm” | Review app Long Châu | User có nhu cầu được hỗ trợ nhanh hơn trong vài tình huống. |
| “2h chiều mà bị treo cả tiếng đồng hồ. App ko cho thấy có ai đang hỗ trợ hay không” | Review / AppRecs | User không biết đang chờ ai, trong bao lâu, và nên làm gì tiếp. |
| App có disclaimer: thông tin chỉ tham khảo, không thay thế tư vấn/chẩn đoán/điều trị y tế chuyên nghiệp | Mô tả app Long Châu | Bot phải giữ giới hạn an toàn, không được đóng vai bác sĩ. |

---

### 1.3. Bằng chứng từ prototype hiện tại

Repo Day 6 hiện có prototype trong:

```text
03-prototype/
```

Prototype hiện có:

```text
- Express server
- UI mô phỏng Long Châu
- DB thuốc demo
- Fuzzy matching tên thuốc
- API fallback OpenAI / DeepSeek / Gemini
- Google CSE optional
- OCR endpoint
- Chat endpoint
- Safety Card từ database
```

Các endpoint chính:

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/drugs/health` | Kiểm tra DB, provider AI, Google CSE |
| GET | `/api/drugs/suggest?q=...` | Gợi ý tên thuốc khi user gõ sai |
| POST | `/api/drugs/lookup` | Tra thuốc/tình trạng và trả Safety Card |
| POST | `/api/drugs/chat` | Chat với AI nếu có provider |
| POST | `/api/drugs/ocr` | OCR ảnh thuốc / nhãn thuốc |
| POST | `/api/drugs/search-google` | Debug Google CSE |

---

### 1.4. Insight

User không chỉ cần biết “thuốc này là gì”. Họ cần một quyết định an toàn có cấu trúc:

```text
Thuốc / hoạt chất này có điểm gì cần lưu ý với tình trạng, tuổi và giới tính của tôi không?
```

Nếu chỉ chat dược sĩ, user có thể phải chờ.  
Nếu tự Google, thông tin rời rạc và khó tin.  
Nếu hỏi AI generic, rủi ro hallucination cao.

Vì vậy cơ hội sản phẩm là tạo một lớp **AI Safety Card** trước khi handoff dược sĩ:

```text
Tra nhanh
→ có nguồn
→ có cảnh báo
→ có disclaimer
→ có CTA hỏi dược sĩ nếu không chắc
```

---

## 2. Lát cắt để build

### 2.1. Build slice

```text
Cho người dùng Long Châu đang có một tình trạng sức khỏe và muốn tra một tên thuốc hoặc hoạt chất,
prototype dùng AI + DB demo để tìm thuốc, đối chiếu với tình trạng, tuổi và giới tính của user,
tạo Safety Card gồm hoạt chất, chỉ định, chống chỉ định, lưu ý, mức cảnh báo, nguồn và disclaimer,
đồng thời xử lý các failure mode như tên thuốc mơ hồ, gõ sai, DB miss, triệu chứng khẩn cấp hoặc AI/API lỗi bằng hỏi lại, gợi ý fuzzy hoặc chuyển dược sĩ.
```

---

### 2.2. Một user, một task, một AI decision, một output

| Thành phần | Nội dung |
|---|---|
| **Một user** | Người đang cầm thuốc OTC hoặc chuẩn bị mua thuốc trên Long Châu, có một tình trạng sức khỏe cụ thể. |
| **Một task** | Muốn biết thuốc/hoạt chất có điểm gì cần lưu ý với tình trạng, tuổi và giới tính của mình không. |
| **Một AI decision** | Bot chọn thuốc/hoạt chất đúng, đối chiếu rule an toàn và gắn mức cảnh báo. |
| **Một output** | Safety Card có nguồn, disclaimer, mức cảnh báo, lý do, CTA hỏi dược sĩ. |

---

### 2.3. Scope Day 6

#### Build trong Day 6

```text
- Chat UI mô phỏng Long Châu
- Form/flow nhập tình trạng, tuổi, giới tính, tên thuốc
- DB local 10 thuốc demo
- Fuzzy suggestion khi user gõ sai
- Safety Card từ DB local
- Rule đối chiếu tình trạng / tuổi / giới tính
- Urgent keyword detection
- API fallback nếu thuốc không có trong DB và có key
- Chat endpoint
- OCR endpoint cơ bản
- Demo happy / low-confidence / failure / correction
```

#### Không build trong Day 6

```text
- AI kê đơn
- AI chẩn đoán bệnh
- AI thay thế dược sĩ
- Tích hợp production API Long Châu
- Thanh toán / đặt thuốc tự động
- Tương tác nhiều thuốc phức tạp
- Drug interaction checker cấp chuyên môn
- Learning loop production
```

---

## 3. AI Product Canvas

### 3.1. Value — Giá trị

#### Sản phẩm dành cho ai?

Người dùng Long Châu đang có một thuốc/hoạt chất cần tra, đồng thời có một tình trạng sức khỏe cụ thể, ví dụ:

```text
- Sốt nhẹ
- Đau đầu
- Đau dạ dày
- Mang thai
- Bệnh gan
- Bệnh thận
- Tiểu đường
- Dị ứng penicillin
- Trẻ em / người cao tuổi
```

#### Họ đau ở đâu?

User không chắc thuốc có phù hợp với tình trạng của mình không. Nếu hỏi dược sĩ, họ có thể phải chờ. Nếu tự Google, kết quả rời rạc và khó biết nguồn nào đáng tin. Nếu hỏi AI generic, câu trả lời có thể nghe rất tự tin nhưng sai.

#### AI giải điều gì tốt hơn cách hiện tại?

AI tạo một bước trung gian an toàn:

```text
User nhập tình trạng + thuốc
→ bot tra DB local / fuzzy / API fallback
→ bot tạo Safety Card
→ bot cảnh báo Xanh / Vàng / Đỏ
→ bot chuyển dược sĩ nếu không chắc
```

Giá trị chính không phải là “AI trả lời thật nhiều”, mà là:

```text
Trả lời có cấu trúc, có nguồn, có disclaimer, có giới hạn và có đường phục hồi.
```

---

### 3.2. Trust — Niềm tin

#### Khi AI trả lời sai, user nhận ra bằng cách nào?

Prototype phải cho user thấy:

```text
- Bot đang tra thuốc nào
- Hoạt chất là gì
- Tình trạng user khai báo là gì
- Tuổi và giới tính đã được đối chiếu chưa
- Mức cảnh báo là gì
- Rule nào được match
- Nguồn từ đâu
- Disclaimer rõ ràng
```

#### User sửa, hoàn tác hoặc chuyển người thật ra sao?

User có thể:

```text
- Sửa tên thuốc
- Chọn thuốc đúng từ fuzzy suggestion
- Sửa tình trạng
- Sửa tuổi / giới tính
- Bấm hỏi dược sĩ Long Châu
- Dừng flow khi có cảnh báo khẩn
```

#### Trust requirement

```text
Bot không được nói “bạn uống được” hoặc “an toàn tuyệt đối”.
Bot chỉ được nói theo mức cảnh báo:
- Xanh: phù hợp chỉ định trong DB demo, vẫn đọc disclaimer
- Vàng: thận trọng, nên hỏi dược sĩ
- Đỏ: không nên tự ý, cần chuyên môn / cấp cứu
- Không chắc: không đủ dữ liệu, hỏi dược sĩ
```

---

### 3.3. Feasibility — Tính khả thi

#### Vì sao đáng build?

Lát cắt đủ nhỏ để demo:

```text
1 tình trạng + tuổi + giới tính + 1 thuốc/hoạt chất → 1 Safety Card.
```

Prototype hiện có server Express, DB local, fuzzy search, lookup API, AI provider fallback và UI mô phỏng Long Châu. Điều này đủ để demo trong 3–5 phút.

#### Chi phí / độ trễ

| Tình huống | Chi phí / độ trễ |
|---|---|
| Thuốc có trong DB local | Nhanh, không gọi AI |
| Gõ sai tên thuốc | Fuzzy match local, nhanh |
| Thuốc không có trong DB | Có thể gọi OpenAI / DeepSeek / Gemini nếu có key |
| Không có key hoặc API lỗi | Không bịa, chuyển dược sĩ |
| OCR ảnh thuốc | Có endpoint nhưng nên coi là demo phụ / optional |

#### Dữ liệu cần có

DB demo cần có:

```text
drug id
name
aliases
activeIngredient
indications
contraindications
warnings
conditionRules
ageRules
genderRules
source
urgentKeywords
disclaimer
```

Prototype hiện đã có các trường này trong `drugs-demo.json`.

#### Rủi ro lớn nhất

Rủi ro lớn nhất là bot đánh giá cảnh báo quá thấp hoặc nhận nhầm thuốc, khiến user tự ý dùng thuốc có chống chỉ định.

#### Ngưỡng dừng

Bot phải dừng hoặc handoff nếu:

```text
- Có urgent keyword
- Không có tuổi hợp lệ
- Không có giới tính
- Không có condition hoặc drugQuery
- Tên thuốc mơ hồ
- Fuzzy suggestion không đủ chắc
- DB/API lỗi
- Thuốc không có trong DB và không có nguồn đáng tin
```

---

### 3.4. Tín hiệu học

#### Khi user chỉnh sửa kết quả, dữ liệu đi về đâu?

Trong Day 6, correction chỉ cần lưu ở mức session log hoặc demo log. Không cần production learning.

Các tín hiệu nên log:

```text
oldDrugQuery
selectedDrugId
oldCondition
updatedCondition
age
gender
warningLevelBefore
warningLevelAfter
userAction
suggestionClicked
handoffClicked
urgentDetected
notFoundQuery
```

#### Tín hiệu nào giúp sản phẩm tốt hơn?

```text
- Tỷ lệ user chọn fuzzy suggestion
- Các tên thuốc hay bị gõ sai
- Các thuốc không có trong DB
- Các tình trạng hay bị hỏi lại
- Tỷ lệ cờ Vàng/Đỏ
- Tỷ lệ bấm hỏi dược sĩ
- Các case user sửa Safety Card
- Các failure case được thêm vào test set
```

#### Learning loop

```text
Correction log
→ cập nhật aliases trong DB
→ bổ sung conditionRules / ageRules / genderRules
→ thêm test case regression
→ cải thiện Safety Card lần sau
```

---

## 4. Tăng năng lực hay tự động hóa?

### 4.1. Quyết định

Chọn:

```text
Conditional automation
```

AI được tự động tra cứu và draft Safety Card trong phạm vi hẹp. Nhưng AI không tự đưa quyết định y tế cuối cùng.

---

### 4.2. AI được tự động làm gì?

AI / system được phép:

```text
- Chuẩn hóa tên thuốc
- Gợi ý thuốc gần đúng khi gõ sai
- Tra DB local
- Tra API fallback nếu thuốc không có trong DB
- Đối chiếu condition với rule
- Đối chiếu tuổi / giới tính với rule
- Gắn cảnh báo Xanh / Vàng / Đỏ
- Draft Safety Card
- Chuẩn bị context để hỏi dược sĩ
```

---

### 4.3. AI không được làm gì?

AI không được:

```text
- Chẩn đoán bệnh
- Kê đơn
- Nói chắc “được uống”
- Nói chắc “không sao”
- Bỏ qua red flag
- Bịa Safety Card khi thiếu nguồn
- Tự đặt thuốc / mua thuốc thay user
- Thay thế dược sĩ hoặc bác sĩ
```

---

### 4.4. Human giữ quyền ở đâu?

| Mức cảnh báo | Human role |
|---|---|
| Xanh | User đọc disclaimer và tự quyết bước tiếp theo. |
| Vàng | User nên hỏi dược sĩ trước khi dùng. |
| Đỏ | Dược sĩ/bác sĩ/cơ sở y tế phải là người xử lý. |
| Không chắc | Bot hỏi lại hoặc chuyển dược sĩ. |
| Khẩn cấp | Bot không xử lý bằng flow thường, hướng user gọi 115 / đến cơ sở y tế. |

---

### 4.5. Vì sao không full automation?

Vì đây là domain y tế/dược phẩm. Nếu AI sai, hậu quả có thể là user dùng sai thuốc, bỏ qua chống chỉ định hoặc chậm đi cấp cứu. Việc “undo” sau khi user uống thuốc là không đơn giản, thậm chí không thể. Vì vậy prototype chỉ automate phần tra cứu/draft Safety Card, không automate quyết định y tế cuối.

---

## 5. Bốn đường đi của trải nghiệm

### 5.1. Happy path

#### Input demo

```text
Tình trạng: sốt nhẹ
Tuổi: 25
Giới tính: nam
Thuốc: Paracetamol
```

#### Bot xử lý

```text
1. Validate đủ condition, age, gender, drugQuery.
2. Không phát hiện urgent keyword.
3. Tìm thấy Paracetamol trong DB.
4. Đối chiếu conditionRules, ageRules, genderRules.
5. Trả Safety Card từ DB local.
```

#### User thấy

```text
Safety Card — Paracetamol

Hoạt chất: Paracetamol
Tình trạng: sốt nhẹ
Tuổi: 25
Giới tính: Nam

Mức cảnh báo: Xanh / An toàn có điều kiện

Lý do:
Phù hợp chỉ định hạ sốt/giảm đau nếu không có chống chỉ định khác.

Lưu ý:
Không vượt quá liều khuyến nghị. Tránh rượu bia nếu dùng liên tục.

Nguồn:
Demo DB — tham chiếu tờ hướng dẫn Paracetamol OTC

Disclaimer:
Thông tin chỉ mang tính tham khảo, không thay thế tư vấn dược sĩ/bác sĩ.

CTA:
[Hỏi dược sĩ Long Châu]
```

---

### 5.2. Low-confidence path

#### Case A — Gõ sai tên thuốc

Input:

```text
Tình trạng: sốt nhẹ
Tuổi: 25
Giới tính: nam
Thuốc: Panadl
```

Bot xử lý:

```text
Không tìm thấy chính xác “Panadl”.
Có thể bạn muốn:
1. Panadol / Paracetamol
2. Paracetamol
3. Efferalgan

Vui lòng chọn một thuốc trước khi mình tạo Safety Card.
```

#### Case B — Tên biệt dược mơ hồ

Input:

```text
Tình trạng: đau đầu
Tuổi: 25
Giới tính: nữ
Thuốc: Panadol
```

Bot xử lý:

```text
Mình tìm thấy nhiều khả năng liên quan đến Panadol.
Bạn muốn tra hoạt chất nào?

1. Paracetamol
2. Paracetamol + caffeine
3. Dạng khác

Mình cần bạn xác nhận để tránh tạo Safety Card cho nhầm thuốc.
```

#### Case C — Tình trạng quá mơ hồ

Input:

```text
Tình trạng: đau
Tuổi: 30
Giới tính: nam
Thuốc: Ibuprofen
```

Bot xử lý:

```text
Tình trạng “đau” chưa đủ rõ để đối chiếu an toàn.
Bạn đang đau ở đâu và có bệnh dạ dày, bệnh thận, đang dùng thuốc chống đông, hoặc triệu chứng nặng không?
```

---

### 5.3. Failure path

#### Case A — Thuốc không có trong DB và không có API/key

Input:

```text
Tình trạng: sốt nhẹ
Tuổi: 25
Giới tính: nam
Thuốc: thuốc lạ ABCXYZ
```

Bot xử lý:

```text
Mình chưa tìm thấy thuốc này trong dữ liệu demo.
Để tránh trả lời sai, mình sẽ không tạo Safety Card.
Bạn có thể kiểm tra lại tên thuốc hoặc hỏi dược sĩ Long Châu.
```

CTA:

```text
[Nhập lại tên thuốc]
[Hỏi dược sĩ Long Châu]
```

#### Case B — Triệu chứng khẩn cấp

Input:

```text
Tình trạng: khó thở, sưng mặt sau khi uống thuốc
Tuổi: 30
Giới tính: nữ
Thuốc: Ibuprofen
```

Bot xử lý:

```text
Các dấu hiệu bạn mô tả có thể cần hỗ trợ y tế khẩn cấp.
Mình không tiếp tục flow tra cứu thông thường trong trường hợp này.

Vui lòng gọi 115 hoặc đến cơ sở y tế gần nhất.
Nếu có thể, liên hệ dược sĩ/bác sĩ ngay và mang theo thuốc đã dùng.
```

CTA:

```text
[Gọi 115]
[Hỏi dược sĩ Long Châu]
[Đến cơ sở y tế]
```

#### Case C — API/DB lỗi

Bot xử lý:

```text
Mình không truy xuất được nguồn dữ liệu đủ tin cậy lúc này.
Để tránh bịa thông tin, mình sẽ không tạo Safety Card.
Bạn có thể thử lại hoặc hỏi dược sĩ Long Châu.
```

---

### 5.4. Correction path

#### Input ban đầu

```text
Tình trạng: đau đầu
Tuổi: 25
Giới tính: nữ
Thuốc: Ibuprofen
```

Bot tạo Safety Card Ibuprofen.

User sửa:

```text
Không phải Ibuprofen, mình muốn tra Paracetamol.
```

Bot xử lý:

```text
Đã cập nhật thuốc từ Ibuprofen sang Paracetamol.
Mình sẽ tạo lại Safety Card theo thuốc mới và bỏ kết quả cũ.
```

System action:

```text
- Hủy Safety Card cũ
- Tạo Safety Card mới
- Log correction trong session
- Không dùng kết luận cũ để tư vấn tiếp
```

---

## 6. Những kiểu lỗi đáng lo nhất

### 6.1. Lỗi 1 — Bỏ sót red flag

#### Khi nào xảy ra?

User nhập triệu chứng nguy hiểm bằng ngôn ngữ tự nhiên:

```text
khó thở
đau ngực
ngất
co giật
phản vệ
sưng mặt
sốc phản vệ
chảy máu không cầm
```

#### Ai chịu thiệt?

User chịu thiệt trực tiếp. Đây là lỗi nghiêm trọng vì user có thể chậm đi cấp cứu hoặc tiếp tục dùng thuốc trong tình huống nguy hiểm.

#### Prototype xử lý

```text
- detectUrgent() kiểm tra urgentKeywords
- Nếu match, trả status urgent
- Không tạo Safety Card bình thường
- Hiện hướng dẫn gọi 115 / đến cơ sở y tế / hỏi dược sĩ ngay
```

---

### 6.2. Lỗi 2 — Nhận nhầm tên thuốc

#### Khi nào xảy ra?

```text
- User gõ sai tên thuốc
- Tên biệt dược gần giống nhau
- Một brand có nhiều biến thể
- User nhập hoạt chất không đầy đủ
```

#### Ai chịu thiệt?

User có thể đọc Safety Card cho thuốc sai và áp dụng sai vào tình trạng của mình.

#### Prototype xử lý

```text
- Fuzzy match bằng Fuse.js
- Nếu nhiều candidates thì trả status disambiguate
- Nếu chỉ có suggestion thì show danh sách, không tự chọn im lặng
- Bắt user chọn thuốc trước khi tạo Safety Card
```

---

### 6.3. Lỗi 3 — Không có dữ liệu nhưng bot vẫn nói như thật

#### Khi nào xảy ra?

```text
- Thuốc không có trong DB
- AI provider lỗi
- Google CSE chưa cấu hình
- API timeout
- Nguồn không đủ tin
```

#### Ai chịu thiệt?

User có thể tin vào thông tin bịa hoặc không được kiểm chứng.

#### Prototype xử lý

```text
- Nếu DB không có và không có API: status not_found
- Nếu AI lỗi: status error
- Không bịa Safety Card
- Chuyển user sang hỏi dược sĩ Long Châu
```

---

## 7. Kế hoạch kiểm thử và bằng chứng demo

### 7.1. Test 1 — Happy path

#### Input

```text
condition: sốt nhẹ
age: 25
gender: nam
drugQuery: Paracetamol
```

#### Kỳ vọng

```text
- status ok
- mode database
- dataSource database
- Safety Card Paracetamol
- safetyLevel green hoặc yellow tùy rule
- có indications, contraindications, warnings
- có source
- có disclaimer
- có CTA hỏi dược sĩ
```

---

### 7.2. Test 2 — Low-confidence / typo

#### Input

```text
condition: sốt nhẹ
age: 25
gender: nam
drugQuery: Panadl
```

#### Kỳ vọng

```text
- không tạo Safety Card ngay
- trả status suggest
- show 2-5 gợi ý gần đúng
- user chọn Paracetamol / Panadol trước khi lookup tiếp
```

---

### 7.3. Test 3 — Disambiguation

#### Input

```text
condition: đau đầu
age: 25
gender: nữ
drugQuery: Panadol
```

#### Kỳ vọng

```text
- nếu match nhiều loại thì status disambiguate
- show candidates
- bắt user xác nhận thuốc/hoạt chất
```

---

### 7.4. Test 4 — Failure / not found

#### Input

```text
condition: sốt nhẹ
age: 25
gender: nam
drugQuery: ABCXYZ
```

#### Kỳ vọng

```text
- nếu không có DB/API: status not_found
- không bịa Safety Card
- CTA hỏi dược sĩ
```

---

### 7.5. Test 5 — Urgent path

#### Input

```text
condition: khó thở, sưng mặt sau khi uống thuốc
age: 30
gender: nữ
drugQuery: Ibuprofen
```

#### Kỳ vọng

```text
- status urgent
- không tạo Safety Card bình thường
- message khẩn cấp
- CTA gọi 115 / đến cơ sở y tế / hỏi dược sĩ
```

---

### 7.6. Test 6 — Correction path

#### Input ban đầu

```text
condition: đau đầu
age: 25
gender: nữ
drugQuery: Ibuprofen
```

User sửa:

```text
Không phải Ibuprofen, đổi sang Paracetamol.
```

#### Kỳ vọng

```text
- Safety Card cũ không còn là kết quả chính
- tạo lại Safety Card mới
- log correction trong session
```

---

### 7.7. Bằng chứng demo cần giữ

```text
- Screenshot happy path
- Screenshot fuzzy suggestion
- Screenshot not_found
- Screenshot urgent
- Screenshot correction
- API health screenshot
- Prompt log / request body
- Ghi chú trade-off
```

---

## 8. Phân công

| Thành viên | Vai trò | Việc cần làm | Khi demo cần giải thích được |
|---|---|---|---|
| **Phung Văn Thạch** | Research / SPEC / demo script | Update spec, demo script, evidence | Vì sao chọn Safety Bot, vì sao không làm AI bác sĩ |
| **Hoàng Phương Thảo** | Prototype UI | Chat UI, Safety Card, Long Châu-style interface | User flow và UI thể hiện trust như thế nào |
| **Thái Thị Yến Nhi** | Failure testing | Test typo, DB miss, urgent, correction | Bot phục hồi ra sao khi AI không chắc hoặc có nguy cơ |
| **Trịnh Vũ Anh Tuấn** | DB demo / rules | `drugs-demo.json`, conditionRules, ageRules, genderRules | Rule nào quyết định Xanh/Vàng/Đỏ |
| **Phung Văn Thạch** | Repo / README | Hướng dẫn chạy, provider config, demo note | Cách chạy prototype và giới hạn hiện tại |

---

## 9. Demo script ngắn

### 9.1. Mở đầu

```text
Nhóm em không build AI bác sĩ. Nhóm build Long Châu Safety Bot — một lớp tra cứu an toàn thuốc trước khi hỏi dược sĩ.

Lát cắt rất hẹp: user nhập tình trạng, tuổi, giới tính và một thuốc/hoạt chất. Bot trả Safety Card có nguồn, cảnh báo và disclaimer. Nếu không chắc hoặc có nguy cơ, bot không đoán bừa mà hỏi lại hoặc chuyển dược sĩ.
```

---

### 9.2. Demo happy path

```text
Em nhập: sốt nhẹ, 25 tuổi, nam, Paracetamol.

Bot tìm thấy thuốc trong DB local, không cần gọi API.
Bot trả Safety Card: hoạt chất, chỉ định, chống chỉ định, cảnh báo, source và disclaimer.
```

Điểm cần nói:

```text
Đây là automation trong phạm vi hẹp: tra DB và draft Safety Card.
Nhưng quyết định y tế cuối vẫn thuộc user/dược sĩ.
```

---

### 9.3. Demo low-confidence

```text
Em nhập sai tên thuốc: Panadl.

Bot không đoán bừa. Bot show gợi ý fuzzy như Panadol / Paracetamol và yêu cầu user xác nhận trước khi tạo Safety Card.
```

Điểm cần nói:

```text
Đây là low-confidence path. Nếu AI không chắc thuốc nào, nó không tạo card ngay.
```

---

### 9.4. Demo failure / urgent

```text
Em nhập: khó thở, sưng mặt sau khi uống thuốc.

Bot phát hiện urgent keyword và dừng flow tra cứu thông thường. Bot hướng user gọi 115 hoặc đến cơ sở y tế.
```

Điểm cần nói:

```text
Trong y tế, failure path quan trọng hơn happy path. Bot phải biết khi nào không nên trả lời.
```

---

### 9.5. Demo correction

```text
Em nhập Ibuprofen nhưng sau đó sửa thành Paracetamol.

Bot bỏ kết quả cũ, tạo lại Safety Card mới và log correction trong session.
```

Điểm cần nói:

```text
Correction không chỉ là sửa UI, mà là tín hiệu học để bổ sung alias, rule và test case sau này.
```

---

## 10. Trade-off

| Quyết định | Vì sao |
|---|---|
| Dùng DB demo trước | Giảm hallucination, demo ổn định. |
| Có API fallback | Mở rộng khi DB thiếu, nhưng không phụ thuộc vào API. |
| Bắt nhập tuổi + giới tính | Rule an toàn thuốc phụ thuộc vào độ tuổi/giới tính. |
| Có urgent detection trước lookup | Tránh bot tiếp tục flow bình thường trong case khẩn cấp. |
| Không kê đơn / không kết luận tuyệt đối | Giảm rủi ro y tế và pháp lý. |
| OCR là optional | Có endpoint nhưng không phải path chính Day 6. |

---

## 11. Câu chốt sản phẩm

```text
Long Châu Safety Bot không cố trở thành AI bác sĩ. Prototype chỉ giải một lát cắt hẹp: khi user có một tình trạng sức khỏe, tuổi, giới tính và một thuốc/hoạt chất cần tra, bot tạo Safety Card có nguồn, cảnh báo an toàn và CTA hỏi dược sĩ. Giá trị chính là trả lời có giới hạn, có căn cứ và biết dừng khi không chắc.
```
