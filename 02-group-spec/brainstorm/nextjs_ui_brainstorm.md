# Brainstorming UI Next.js: ShopeeFood AI Food Suggester (MVP)

Tài liệu này định hình thiết kế UI/UX độc bản, loại bỏ các khuôn mẫu SaaS nhàm chán (chat-bot bong bóng, gradient màu tím, font Inter, sidebar). Thay vào đó, chúng ta sẽ xây dựng một giao diện **Neo-Brutalism (Tân thô giản)** với mô hình tương tác độc đáo dành riêng cho người dùng đang đói và bị mệt mỏi nhận thức (Cognitive Overload).

---

## 1. Thiết kế Thẩm mỹ Độc bản (Neo-Brutalism Food Identity)

Để sản phẩm **có thể nhận diện ngay lập tức qua ảnh chụp màn hình (screenshot)**, chúng ta sẽ áp dụng phong cách thiết kế thô giản hiện đại:

* **Bảng màu tương phản cực cao (High-Contrast Palette):**
  * **Mustard Yellow (Nền chính):** `#FED049` — tạo cảm giác thèm ăn, trẻ trung.
  * **Chili Red (Nổi bật/CTA):** `#FF4B2B` — màu cam đỏ kích thích hành động nhanh.
  * **Caviar Black (Đường nét & Bóng):** `#0C0C0C` — toàn bộ chữ, khung viền dày và đổ bóng phẳng đều dùng màu đen đặc này.
  * **Parchment Cream (Nền thẻ gợi ý):** `#FAF6F0` — màu kem sữa cổ điển để hiển thị thông tin món ăn rõ ràng mà không bị chói.
* **Đường nét & Đổ bóng đặc trưng (Brutalist Borders & Shadows):**
  * Viền đen dày: `border-4 border-black`.
  * Bóng phẳng đổ lệch (Flat Retro Drop-Shadows): `shadow-[6px_6px_0px_0px_#0C0C0C]`. Khi hover nút bấm, bóng sẽ thụt vào thành `shadow-[2px_2px_0px_0px_#0C0C0C]` để mô phỏng tương tác cơ học vật lý.
* **Typography (Phông chữ):**
  * Tiêu đề chính: **Space Grotesk** (Font chữ đậm chất hình học, sắc sảo) hoặc **Clash Display**.
  * Chữ nội dung: **Space Mono** hoặc font hệ thống Monospace để hiển thị rõ thông tin giá tiền/khoảng cách dạng số liệu.

---

## 2. Mô hình Tương tác Độc đáo: "Hunger Joystick" (Cần gạt Cơn đói)

Người đói không muốn gõ phím nhiều. Chúng ta thiết kế một giao diện **Zero-Chat (Không cần Chat)** làm màn hình chính. Luồng tương tác cực gọn: **Kéo cần gạt -> 3 chiếc đĩa xuất hiện -> Đặt món.**

```
+------------------------------------------------------------------+
| ✨ SHOPEEFOOD AI SUGGESTER                                       |
| ──────────────────────────────────────────────────────────────── |
|                                                                  |
|   [!] BẠN ĐANG MUỐN ĂN GÌ? DỊCH CHUYỂN NÚT 😋 ĐỂ CHỌN KHẨU VỊ    |
|                                                                  |
|                         🔥 NÓNG SỐT                              |
|                            /\                                    |
|                           /  \                                   |
|                          /    \                                  |
|                         /   😋 \   <-- Kéo thả icon 😋 bên trong |
|                        /________\      tam giác để thay đổi thông số |
|            💸 SIÊU RẺ            ⚡ ĂN LIỀN                      |
|                                                                  |
|   ┌──────────────────────────────────────────────────────────┐   |
|   │ 💬 Ý ĐỊNH: "Tôi muốn món nước ấm bụng, giá hạt dẻ, gần sạt │   |
|   │  bên để giao nhanh trong 15 phút."                       │   |
|   └──────────────────────────────────────────────────────────┘   |
|                                                                  |
|                 [ ✨ GỢI Ý MÓN NGAY CHO TÔI ]                    |
|                                                                  |
+------------------------------------------------------------------+
                                 │
                 (3 Đĩa Thức Ăn Xoay Tròn Xuất Hiện)
                                 ▼
+------------------------------------------------------------------+
| 🤖 AI ĐÃ CHỌN CHO BẠN 3 MÓN PHÙ HỢP NHẤT:                        |
|                                                                  |
|      ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ |
|      │   ĐĨA SỐ 01     │ │   ĐĨA SỐ 02     │ │   ĐĨA SỐ 03     │ |
|      │    (Bún Bò)     │ │     (Phở)       │ │   (Hủ Tiếu)     │ |
|      │                 │ │                 │ │                 │ |
|      │  [ 45.000đ ]    │ │  [ 48.000đ ]    │ │  [ 38.000đ ]    │ |
|      │  [ 0.8 km ]     │ │  [ 1.2 km ]     │ │  [ 1.5 km ]     │ |
|      └─────────────────┘ └─────────────────┘ └─────────────────┘ |
|                                                                  |
|   *Nhấp vào mỗi đĩa để LẬT (Flip Card 3D) xem LÝ DO CỦA AI*       |
|                                                                  |
|   [ 🎲 ĐỔI MÓN KHÁC ]                             [ 💸 RẺ HƠN NỮA ] |
+------------------------------------------------------------------+
```

### Chi tiết Mô hình Tương tác Surprising (Gây bất ngờ & Ghi nhớ):
1. **Tam giác cảm giác (Sensory Triangle Pad):**
   * Là một khu vực SVG hình tam giác đại diện cho 3 trạng thái mong muốn cực đoan nhất của người đói: **Nóng Sốt (Top)** vs **Siêu Rẻ (Bottom-Left)** vs **Ăn Liền/Gần (Bottom-Right)**.
   * Người dùng kéo nút icon emoji 😋 xung quanh tam giác.
   * Tọa độ của icon sẽ được dịch tức thời (Real-time) thành văn bản diễn đạt ý định tự nhiên hiển thị bên dưới. Điều này giúp loại bỏ hoàn toàn việc suy nghĩ từ khóa gõ vào ô chat!
2. **Đồng tồn tại giữa Cần gạt (Joystick) và Ô nhập chat (Text Input):**
   * Bên dưới khu vực Joystick là một **Thanh nhập chat thô ráp (Brutalist Input Bar)**. Người dùng có thể gõ bất kỳ yêu cầu cụ thể nào (ví dụ: *"không cay"*, *"ăn chay"*, *"thèm bún bò"*).
   * **Tương tác hai chiều:** Khi kéo cần gạt, nội dung chữ trong ô nhập sẽ tự động cập nhật câu mô tả khẩu vị tương ứng (người dùng có thể gõ thêm chữ nối vào cuối). Ngược lại, nếu người dùng tự gõ chat, cần gạt có thể tự động chuyển dời về phía các đỉnh tương thích (hoặc mờ đi để nhường toàn quyền ưu tiên cho tin nhắn văn bản).
3. **3 Đĩa Thức Ăn Xoay Tròn (Trio-Plate Carousel):**
   * 3 gợi ý không xuất hiện dưới dạng danh sách dọc. Chúng xuất hiện như **3 chiếc đĩa tròn** đặt trên bàn ăn ảo.
   * Khi nhấp vào một chiếc đĩa, nó sẽ thực hiện hiệu ứng **lật thẻ 3D (3D Flip)** để lộ mặt sau:
     * Mặt trước: Ảnh món ăn (thiết kế bo tròn như lòng đĩa), tên món, tên quán, giá cả và khoảng cách.
     * Mặt sau: Bong bóng ý kiến của AI với tiêu đề font Monospace cực lớn: **`[ TẠI SAO AI CHỌN? ]`** và nút bấm đỏ chói **`[ CHỐT MÓN NÀY ]`** để đưa người dùng ra thẳng trang quán.

---

## 3. Cấu trúc Component Next.js (Không dùng CSS Thư viện ăn sẵn)

Để đạt được phong cách Brutalism nguyên bản và tốc độ phản hồi nhanh, bạn Bùi Minh nên viết mã CSS bằng Tailwind kết hợp các class Border & Shadow thủ công:

* **`HungerTriangle.tsx`**: Component vẽ SVG tam giác có thể tương tác kéo thả đầu mút (Joystick Node) bằng Pointer Events (chuột hoặc cảm ứng điện thoại), tính toán khoảng cách tương đối đến 3 đỉnh.
* **`PlateCard.tsx`**: Thẻ tròn mô phỏng đĩa thức ăn với CSS animation lật mặt `perspective-[1000px]`, `transform-style-preserve-3d`, và `rotate-y-180` khi được click.
* **`IntentBillboard.tsx`**: Hộp văn bản thô ráp màu trắng với viền đen dày, chứa câu mô tả ý định tự động sinh ra khi di chuyển Joystick, kèm hiệu ứng gõ chữ (Typewriter effect) nhẹ.

---

## 4. Chiến lược Mocking độc lập (mockApi.ts cập nhật theo Joystick)

Thay vì nhận một đoạn chat tự do, mock API sẽ tiếp nhận dữ liệu là tọa độ hoặc mức độ ưu tiên của 3 đỉnh tam giác (ví dụ từ `0.0` đến `1.0` cho mỗi thuộc tính `hot`, `cheap`, `near`):

```typescript
export interface Suggestion {
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  price: number;
  distance_km: number;
  eta_minutes: number;
  reason: string;
  image_url: string;
}

export interface JoystickCoords {
  hot: number;    // 0.0 -> 1.0
  cheap: number;  // 0.0 -> 1.0
  near: number;   // 0.0 -> 1.0
}

const mockRestaurants: Suggestion[] = [
  {
    restaurant_id: "res_1",
    restaurant_name: "Phở Lý Quốc Sư",
    dish_name: "Phở Bò Tái Nạm",
    price: 45000,
    distance_km: 0.6,
    eta_minutes: 12,
    reason: "PHÒ NÓNG BỎNG TAY: Đạt điểm tối đa về độ ấm nóng, giá 45k nằm dưới hạn mức 50k của bạn và cực gần chỉ 600m.",
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80"
  },
  {
    restaurant_id: "res_2",
    restaurant_name: "Bún Bò Cô Ba",
    dish_name: "Bún Bò Nạm Giò",
    price: 48000,
    distance_km: 0.8,
    eta_minutes: 15,
    reason: "NO BỤNG + ẤM LÒNG: Bát bún to sục sôi, giá 48k vừa khít túi tiền eo hẹp, chỉ mất 15 phút giao tới.",
    image_url: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&q=80"
  },
  {
    restaurant_id: "res_3",
    restaurant_name: "Kem Tràng Tiền",
    dish_name: "Kem Ốc Quế Sữa Dừa",
    price: 15000,
    distance_km: 1.5,
    eta_minutes: 18,
    reason: "MÁT LẠNH SIÊU RẺ: Chỉ 15k giải nhiệt cực đỉnh, đánh bay cái nóng tức thì.",
    image_url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80"
  },
  {
    restaurant_id: "res_4",
    restaurant_name: "Cơm Tấm Bụi Sài Gòn",
    dish_name: "Cơm Sườn Trứng Ốp",
    price: 35000,
    distance_km: 0.4,
    eta_minutes: 9,
    reason: "ĂN LIỀN + GIÁ HỜ: Cơm tấm siêu tốc giao trong 9 phút, sườn nướng thơm phức giá bình dân.",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
  }
];

export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  // Giả lập thời gian suy nghĩ của AI (1.2 giây)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Phân tích tin nhắn văn bản phụ trợ (nếu người dùng gõ thêm từ khóa cụ thể)
  const text = message.toLowerCase();

  const scored = mockRestaurants.map(r => {
    let score = 0;
    
    // Thuộc tính Nóng (hot):
    const isHotDish = ["Phở Bò Tái Nạm", "Bún Bò Nạm Giò"].includes(r.dish_name);
    score += coords.hot * (isHotDish ? 1.0 : -0.5);

    // Thuộc tính Rẻ (cheap):
    const cheapScore = (50000 - r.price) / (50000 - 15000);
    score += coords.cheap * cheapScore;

    // Thuộc tính Gần (near):
    const nearScore = Math.max(0, (2.0 - r.distance_km) / (2.0 - 0.4));
    score += coords.near * nearScore;

    // TĂNG ĐIỂM CỘNG NẾU KHỚP TEXT CHAT: Ví dụ người dùng gõ "không cay" hoặc tên món cụ thể
    if (text.includes("chay") && r.dish_name.toLowerCase().includes("chay")) {
      score += 2.0;
    }
    if (text.includes("kem") && r.dish_name.toLowerCase().includes("kem")) {
      score += 2.0;
    }
    if (text.includes("phở") && r.dish_name.toLowerCase().includes("phở")) {
      score += 2.0;
    }
    if (text.includes("bún") && r.dish_name.toLowerCase().includes("bún")) {
      score += 2.0;
    }

    return { restaurant: r, score };
  });

  // Sắp xếp các món ăn theo điểm số giảm dần và lấy top 3
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(item => item.restaurant);
};
```

---

## 5. Kết nối API Thật khi FastAPI sẵn sàng

Khi FastAPI Backend sẵn sàng, bạn chỉ cần thay thế hàm mock bằng yêu cầu gửi dữ liệu lên:

```typescript
export const getAIRecommendations = async (
  coords: JoystickCoords,
  message: string
): Promise<Suggestion[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coords, message }),
  });
  return response.json();
};
```

Mô hình này giúp ứng dụng của bạn không bị lẫn lộn giữa hàng ngàn chatbot AI dạng SaaS thông thường, tạo độ phủ nhận diện cực lớn (Highly Identifiable) chỉ qua một góc chụp giao diện!

---

## 6. Tích hợp Tính Năng Giọng Nói (Speak to Text)

Trong bối cảnh Hackathon 1 ngày, phương án tối ưu nhất là sử dụng **Web Speech API** (có sẵn của trình duyệt).
* **Ưu điểm:** Hoàn toàn miễn phí, không cần cài đặt thư viện bên thứ ba, không cần API Key và nhận diện tiếng Việt cực kỳ chính xác (Chrome/Safari sử dụng trực tiếp engine nhận diện giọng nói của Google/Apple).
* **Nguyên lý hoạt động:** Người dùng bấm nút 🎤 -> Nói khẩu vị (ví dụ: "kiếm giùm phở bò tái gầy dưới năm chục ngàn") -> Browser tự động dịch thành chữ -> Đổ thẳng vào ô nhập chat thô ráp (Brutalist Input Bar).

### Cách triển khai React Hook `useSpeechToText.ts`

Tạo file `src/hooks/useSpeechToText.ts` ở Frontend:

```typescript
import { useState, useEffect, useRef } from "react";

export const useSpeechToText = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Khởi tạo SpeechRecognition của trình duyệt
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Tự động dừng khi người dùng ngừng nói
      recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng
      recognition.lang = "vi-VN"; // Thiết lập nhận diện Tiếng Việt

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Lỗi nhận diện giọng nói: ", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
  };
};
```

### Cách hiển thị trên UI (Brutalist Microphone Button)
1. **Vị trí đặt nút:** Đặt một nút tròn nhỏ có icon micro 🎤 ngay sát cạnh phải của **Brutalist Input Bar** (ô gõ chat).
2. **Hiệu ứng thô ráp khi thu âm (Active State):** 
   * Khi `isListening` là `true`, chuyển nền nút sang màu đỏ ớt chói `bg-[#FF4B2B]`, đổi viền sang nét đứt `border-dashed` và áp dụng hiệu ứng nhấp nháy `animate-pulse` để người dùng biết micro đang ghi âm.
   * Khi hoàn thành thu âm, chuyển chữ nhận diện được vào ô gõ chat và sẵn sàng bấm gửi.

