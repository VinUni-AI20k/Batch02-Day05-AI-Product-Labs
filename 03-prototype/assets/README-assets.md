# Ảnh cần cung cấp — Giao diện Long Châu (prototype)

Đặt file vào thư mục: **`03-prototype/assets/`** (đúng tên file bên dưới).

**Định dạng ưu tiên:** PNG nền trong (logo, icon) · JPG/WebP cho banner (dung lượng nhẹ).

---

## Bắt buộc (làm giống ảnh mẫu nhất)

| # | Tên file gợi ý | Kích thước gợi ý | Dùng ở đâu |
|---|----------------|------------------|------------|
| 1 | `logo-longchau.png` hoặc `.svg` | Cao **40–48px** (SVG tốt nhất) | Header — logo trắng + cam FPT |
| 2 | `banner-hero-01.jpg` | **1920×400** px (hoặc 1440×360) | Banner lớn trên cùng (PRE-ORDER / campaign) |
| 3 | `banner-carousel-meiji.jpg` | **800×320** px | Slider trái (Meiji / sữa) |
| 4 | `banner-side-cancer.jpg` | **380×150** px | Banner phải trên — Ung thư A-Z |
| 5 | `banner-side-address.jpg` | **380×150** px | Banner phải dưới — Cập nhật địa chỉ |
| 6 | `avatar-pharmacist.png` | **112×112** px (vuông) | Nút **Tư vấn** góc phải dưới |

---

## Icon quick actions (6 thẻ dưới banner)

Có thể gửi **1 file sprite** hoặc **6 file riêng**, nền trong, kích thước **48×48** hoặc **64×64** px.

| Tên file | Nội dung icon |
|----------|----------------|
| `icon-buy-medicine.png` | Cần mua thuốc (chai/lọ thuốc) |
| `icon-pharmacist.png` | Tư vấn với Dược sĩ |
| `icon-my-order.png` | Đơn của tôi |
| `icon-find-store.png` | Tìm nhà thuốc |
| `icon-vaccine.png` | Tiêm vắc xin |
| `icon-check-drug.png` | Tra thuốc chính hãng |

---

## Icon header / search (nếu có file từ Long Châu)

| Tên file | Kích thước | Dùng ở đâu |
|----------|------------|------------|
| `icon-search.svg` | 24×24 | Nút tìm trong ô search |
| `icon-mic.svg` | 24×24 | Micro trong ô search |
| `icon-camera.svg` | 24×24 | Camera / quét trong ô search |
| `icon-user.svg` | 24×24 | Đăng nhập |
| `icon-cart.svg` | 24×24 | Giỏ hàng |
| `icon-chevron-down.svg` | 12×12 | Mũi tên menu danh mục |

*Nếu không có: code dùng SVG đơn giản — không bắt buộc gửi.*

---

## Tùy chọn (đẹp hơn, không bắt buộc)

| Tên file | Kích thước | Ghi chú |
|----------|------------|---------|
| `banner-hero-02.jpg` | 1920×400 | Slide hero thứ 2 (carousel) |
| `banner-carousel-02.jpg` | 800×320 | Slide Meiji thứ 2 |
| `favicon.ico` | 32×32 | Tab trình duyệt |
| `mascot-longchau.png` | ~80×80 | Nhân vật banner “địa chỉ” |

---

## Cấu trúc thư mục sau khi bạn gửi

```text
03-prototype/assets/
├── logo-longchau.svg          ← hoặc .png
├── banner-hero-01.jpg
├── banner-carousel-meiji.jpg
├── banner-side-cancer.jpg
├── banner-side-address.jpg
├── avatar-pharmacist.png
├── icons/
│   ├── icon-buy-medicine.png
│   ├── icon-pharmacist.png
│   ├── icon-my-order.png
│   ├── icon-find-store.png
│   ├── icon-vaccine.png
│   └── icon-check-drug.png
└── README-assets.md           ← file này
```

---

## Cách lấy ảnh nhanh (demo / học tập)

1. Mở https://nhathuoclongchau.com.vn → chụp màn hoặc **Save image** từng banner (chỉ dùng cho bài học, không commercial).
2. Logo: export từ app Long Châu hoặc ảnh logo trên header site.
3. Avatar tư vấn: crop từ nút **Tư vấn** góc phải (ảnh bạn đã gửi).

**Lưu ý bản quyền:** Prototype học tập — ghi chú “mock / demo” trong README; không deploy public như site thật.

---

## Không cần gửi (code tự làm)

- Màu nền gradient header/banner (CSS)
- Chữ menu danh mục, hotline, tag tìm kiếm (HTML/CSS)
- Panel chat Safety Bot (đã có trong prototype)
- Wireframe mockup (`mockup/wireframes.html`)

---

## Checklist gửi cho dev

Gửi message kiểu:

- [ ] Logo Long Châu  
- [ ] 1 banner hero (full width)  
- [ ] 1 banner carousel trái  
- [ ] 2 banner phải (cancer + địa chỉ)  
- [ ] Avatar dược sĩ (nút Tư vấn)  
- [ ] 6 icon quick action (hoặc chụp crop từ site)

Khi đủ file, báo lại để gắn vào `index.html`.
