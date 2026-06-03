# Kế hoạch Brainstorming & Triển khai: Chatbot ShopeeFood (MVP)

Tài liệu này dùng để định hình kiến trúc kỹ thuật, luồng xử lý chi tiết, giải pháp deployment và phân chia công việc cho nhóm 3 người trong khuôn khổ Mini-Hackathon.

---

## 1. Làm rõ bài toán & Nguyên lý thiết kế (Problem-to-Solution)

### Nỗi đau chính (Pain Point)
Người dùng đang đói, có nhu cầu mơ hồ ("ăn gì nóng nóng, rẻ rẻ, gần đây") nhưng app ShopeeFood hiện tại chỉ cho tìm kiếm theo keyword cứng hoặc gợi ý mặc định giống quảng cáo. Họ lướt lâu, mệt mỏi rồi thoát app.

### Nguyên lý AI (Augmentation - Trợ lực quyết định)
* **Không làm tự động đặt đơn:** Đặt đơn cần tiền và lòng tin. AI chỉ đóng vai trò gợi ý tối đa **3 lựa chọn** và giải thích rõ ràng **vì sao gợi ý món này** (phá vỡ sự tê liệt lựa chọn - Choice Paralysis).
* **1-chạm kết nối:** Khi người dùng đồng ý, họ bấm vào thẻ và app mở luồng đặt đơn ShopeeFood gốc. AI bàn giao quyền kiểm soát hoàn toàn cho con người.

---

## 2. Kiến trúc kỹ thuật đề xuất (Technical Architecture)

```
        [ Trình duyệt / Điện thoại Người dùng ]
                           │
                           ▼ (Deploy: Vercel)
               ┌───────────────────────┐
               │    Next.js Frontend   │
               │   (Giao diện Chat UI) │
               └───────────────────────┘
                           │
                           ▼ (Gọi API qua HTTPS)
               ┌───────────────────────┐
               │    FastAPI Backend    │ (Deploy: Render / Hugging Face)
               │ (Logic lọc & AI Agent)│
               └───────────────────────┘
                 │                   │
                 ▼ (Truy vấn)        ▼ (SDK / API)
       ┌─────────────────┐   ┌───────────────┐
       │ Mock Database   │   │  LLM Service  │
       │ (JSON 20 Quán)  │   │(Gemini/OpenAI)│
       └─────────────────┘   └───────────────┘
```

### Hợp đồng API (API Contract) giữa Next.js và FastAPI
Để hai bên phát triển song song không bị nghẽn (block), cần chốt cấu trúc dữ liệu gửi-nhận ngay từ đầu.

#### Request (Next.js -> FastAPI)
```json
{
  "message": "món gì nóng nóng rẻ rẻ gần đây, không cay nha",
  "coords": {
    "hot": 0.8,
    "cheap": 0.9,
    "near": 0.7
  },
  "history": [
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "Chào bạn, bạn muốn ăn gì?"}
  ],
  "user_location": {
    "lat": 10.762622,
    "lng": 106.660172
  }
}
```

#### Response (FastAPI -> Next.js)
```json
{
  "action": "suggest", 
  "clarify_question": "", 
  "suggestions": [
    {
      "restaurant_id": "res_001",
      "restaurant_name": "Bún Bò Cô Ba",
      "dish_name": "Bún Bò Nạm Lớn",
      "price": 45000,
      "distance_km": 0.8,
      "eta_minutes": 15,
      "reason": "Món nước nóng hổi đúng ý bạn, giá 45k (< 50k) và chỉ cách 0.8km."
    },
    {
      "restaurant_id": "res_005",
      "restaurant_name": "Hủ Tiếu Nam Vang Thành Đạt",
      "dish_name": "Hủ tiếu nước đặc biệt",
      "price": 48000,
      "distance_km": 1.2,
      "eta_minutes": 18,
      "reason": "Hủ tiếu nước nóng, giá 48k nằm trong ngân sách dưới 50k của bạn."
    }
  ]
}
```
*Lưu ý:* Nếu `action` là `"clarify"`, danh sách `suggestions` sẽ trống và trường `clarify_question` chứa câu hỏi làm rõ của chatbot (ví dụ: *"Bạn muốn ăn món khô hay món nước nè?"*).

---

## 3. Các bước triển khai chi tiết (Step-by-Step)

### Bước 1: Chuẩn bị Mock Database (JSON)
Backend cần tạo một file JSON chứa khoảng 15-20 quán ăn thật/giả định với các trường dữ liệu:
* `id`, `name`, `dishes` (danh sách món kèm giá), `lat`, `lng` (tọa độ để tính khoảng cách), `is_open` (trạng thái mở cửa), `tags` (nóng, lạnh, chay, mặn, nước, khô, ăn nhẹ, no bụng).

### Bước 2: Viết thuật toán tiền lọc (Pre-filtering) trên FastAPI
Không ném toàn bộ 20 quán vào LLM vì tốn Token và dễ làm LLM bị loạn thông tin.
* Sử dụng code Python thông thường lọc trước:
  1. Chỉ lấy những quán có `is_open = True`.
  2. Tính khoảng cách Haversine từ tọa độ `user_location` đến quán, loại bỏ quán > 3km.
  3. Lọc sơ bộ khoảng giá (ví dụ nếu user nhập "dưới 50k" thì lọc các món có giá <= 50k).
* Chọn ra top 8-10 quán phù hợp nhất để gửi kèm vào Prompt cho LLM chọn ra 3 quán tốt nhất.

### Bước 3: Thiết lập AI Agent & Prompting
* Sử dụng Gemini API (hoặc OpenAI) với kỹ thuật **Structured Outputs** (JSON Mode hoặc Pydantic) để đảm bảo đầu ra luôn khớp với API Contract.
* System Prompt cần ghi rõ quy tắc:
  * Tuyệt đối không bịa tên quán (chống ảo tưởng - Hallucination).
  * Viết lý do ngắn gọn (< 12 từ) nhấn mạnh đúng từ khóa của user.
  * Nếu input của user không liên quan đến ăn uống, trả về `action: "clarify"` kèm thông báo từ chối nhẹ nhàng.

### Bước 4: Xây dựng giao diện Next.js (Phong cách Neo-Brutalism độc bản)
* Thiết kế giao diện không sử dụng sidebar hay bong bóng chat bo tròn cổ điển. Sử dụng bảng màu đậm Mustard Yellow (`#FED049`), Chili Red (`#FF4B2B`) và nét viền đen dày `border-4 border-black`.
* Phát triển **Hunger Joystick (Cần gạt Cơn đói)**: Tam giác SVG cho phép kéo nút 😋 giữa 3 góc: Nóng Sốt, Siêu Rẻ, Ăn Liền.
* Đồng bộ hóa tương tác hai chiều: Kéo cần gạt tự động sinh câu ý định đổ vào **Brutalist Input Bar** (ô gõ chat), đồng thời cho phép gõ thêm chữ (ví dụ: *"không cay"*, *"ăn chay"*).
* Tích hợp tính năng **Speak to Text (Giọng nói thành chữ)** bằng native Web Speech API của trình duyệt ngay bên cạnh ô input chat để tối giản công sức nhập liệu.
* Hiển thị kết quả dạng **3 Đĩa Thức Ăn Xoay Tròn (Trio-Plate Carousel)**: dạng thẻ tròn, lật thẻ 3D (Flip Card) khi click để xem lý do lựa chọn của AI.

---

## 4. Giải pháp Deployment cho FastAPI (Nhanh & Miễn phí)

Trong khuôn khổ Hackathon, bạn có 2 giải pháp deploy backend Python cực kỳ tối ưu:

### Lựa chọn 1: Render.com (Khuyên dùng vì dễ nhất)
* **Cách hoạt động:** Render liên kết trực tiếp với GitHub repo của backend. Mỗi khi bạn git push, Render tự động build và deploy lại.
* **Các bước thực hiện:**
    1. Tạo file `requirements.txt` (gồm `fastapi`, `uvicorn`, `google-generativeai` hoặc `openai`, `pydantic`).
    2. Viết file khởi chạy hoặc để Render chạy lệnh: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
    3. Lên website Render.com, tạo một **Web Service** mới, chọn repo Github của bạn.
    4. Cấu hình các biến môi trường (Environment Variables) như `GEMINI_API_KEY` hoặc `OPENAI_API_KEY` trên dashboard của Render.
* *Nhược điểm:* Bản miễn phí (Free tier) của Render sẽ bị ngủ đông sau 15 phút không có traffic. Khi gọi API lần đầu sẽ mất khoảng 30 - 50 giây để khởi động lại. (Nhớ ping trước khi demo!).

### Lựa chọn 2: Hugging Face Spaces (Chạy mượt, không lo ngủ đông nhanh)
* **Cách hoạt động:** Tạo một Space chạy Docker hoặc Streamlit/Gradio. Chúng ta có thể cấu hình chạy Docker chứa FastAPI.
* **Các bước thực hiện:**
    1. Tạo một Space mới trên Hugging Face, chọn SDK là **Docker** và template **Blank**.
    2. Viết một `Dockerfile` đơn giản để chạy FastAPI app.
    3. Push code lên Git của Hugging Face.
    4. Cấu hình API Key trong mục Settings -> Variables and Secrets.
* *Ưu điểm:* Hoàn toàn miễn phí, tài nguyên khỏe, ít bị delay khởi động hơn Render.

---

## 5. Phân chia công việc (Nhóm 3 người)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BẢN PHÂN CHIA NHIỆM VỤ                        │
├───────────────────┬─────────────────────────────────────────────────────┤
│  Thành viên       │ Vai trò & Nhiệm vụ chi tiết                         │
├───────────────────┼─────────────────────────────────────────────────────┤
│  Bùi Minh         │ FRONTEND & INTEGRATION (Next.js & Vercel)           │
│  (Next.js Lead)   │ 1. Khởi tạo Next.js App, cài đặt Tailwind CSS.      │
│                   │ 2. Cấu hình Typography với font Space Grotesk/Mono. │
│                   │ 3. Tạo Component HungerTriangle (SVG kéo thả nút 😋).│
│                   │ 4. Tạo Brutalist Input Bar tích hợp Web Speech API   │
│                   │    (React hook useSpeechToText cho micro 🎤).       │
│                   │ 5. Thiết kế PlateCard lật 3D (mặt sau có lý do AI). │
│                   │ 6. Kết nối API gửi cả `{ coords, message }`.        │
│                   │ 7. Deploy frontend lên Vercel.                      │
├───────────────────┼─────────────────────────────────────────────────────┤
│  Thành viên B     │ BACKEND CORE & MOCK DB (FastAPI Infrastructure)     │
│  (FastAPI Dev 1)  │ 1. Cài đặt boilerplate FastAPI, cấu hình CORS.      │
│                   │ 2. Xây dựng Mock Database (file JSON 20 quán ăn).   │
│                   │ 3. Viết thuật toán tiền lọc (Pre-filtering) tính    │
│                   │    khoảng cách & giá dựa trên tham số `coords`.     │
│                   │ 4. Thiết lập Endpoint `/api/recommend` nhận JSON    │
│                   │    chứa đồng thời `{ coords, message }`.            │
│                   │ 5. Cấu hình deploy backend lên Render / Hugging Face.│
├───────────────────┼─────────────────────────────────────────────────────┤
│  Thành viên C     │ AI AGENT & PROMPT ENGINEER (LLM Specialist)         │
│  (FastAPI Dev 2)  │ 1. Thiết lập kết nối API với LLM (Gemini/OpenAI).   │
│                   │ 2. Thiết kế System Prompt nhận danh sách quán đã lọc│
│                   │    và chuỗi `message` bổ sung (chay, không cay...). │
│                   │ 3. Cấu hình Structured Output (Pydantic) để đảm bảo │
│                   │    kết quả trả về định dạng JSON ổn định.           │
│                   │ 4. Xây dựng kịch bản xử lý các case lỗi hoặc lạc đề  │
│                   │    (TC-03, TC-08, TC-11).                           │
└───────────────────┴─────────────────────────────────────────────────────┘
```

---

## 6. Kế hoạch phối hợp và tích hợp nhanh (Hackathon Tip)

1. **Giờ thứ 1:** Thống nhất API Contract (cấu trúc JSON ở mục 2) và danh sách Mock Database JSON.
2. **Giờ thứ 2-4:** Phát triển độc lập. 
   * Frontend dùng dữ liệu cứng (Mock Response) để code UI và kiểm tra giao diện hiển thị.
   * Backend Core dựng API FastAPI trả về Mock Response.
   * Prompt Engineer thử nghiệm các prompt trên Colab hoặc AI Studio để chốt prompt có tỷ lệ chính xác cao nhất.
3. **Giờ thứ 5:** Tích hợp AI SDK vào FastAPI Backend. Chạy thử backend tại local.
4. **Giờ thứ 6:** Kết nối Frontend (Next.js) và Backend (FastAPI) tại local. Sửa lỗi CORS (nếu có).
5. **Giờ thứ 7:** Deploy đồng thời lên Vercel và Render/Hugging Face. Kiểm thử môi trường production.
6. **Giờ thứ 8:** Chạy thử 12 kịch bản testcase để đảm bảo các lối thoát fallback hoạt động chuẩn trước khi đem đi demo thuyết trình.
