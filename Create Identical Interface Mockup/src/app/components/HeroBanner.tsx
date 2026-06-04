import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowRight, Star, Shield, Zap } from "lucide-react";

const slides = [
  {
    id: 1,
    badge: "ƯU ĐÃI LỚN",
    title: "Sức khỏe toàn diện",
    subtitle: "cho cả gia đình",
    description: "Hơn 50,000 sản phẩm chính hãng với giá tốt nhất thị trường. Giao hàng siêu tốc trong 2 giờ.",
    cta: "Mua ngay",
    ctaSub: "Khám phá ưu đãi",
    date: "01/06 – 30/06/2026",
    discount: "Giảm đến 40%",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&h=400&fit=crop&auto=format",
    imageAlt: "Pharmacy products",
    gradient: "linear-gradient(135deg, #002fa7 0%, #0052D9 35%, #0A66FF 65%, #2979FF 100%)",
    accent: "#4A90FF",
    glowColor: "rgba(41, 121, 255, 0.4)",
    stats: [
      { value: "50,000+", label: "Sản phẩm" },
      { value: "2h", label: "Giao hàng" },
      { value: "98%", label: "Hài lòng" },
    ],
  },
  {
    id: 2,
    badge: "SẢN PHẨM MỚI",
    title: "Vitamin & Khoáng chất",
    subtitle: "cao cấp nhập khẩu",
    description: "Bổ sung đầy đủ dưỡng chất thiết yếu từ các thương hiệu hàng đầu thế giới. An toàn, hiệu quả.",
    cta: "Xem ngay",
    ctaSub: "Hàng chính hãng",
    date: "Cập nhật tháng 6/2026",
    discount: "Tặng quà đặc biệt",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop&auto=format",
    imageAlt: "Vitamins and supplements",
    gradient: "linear-gradient(135deg, #003399 0%, #0044cc 35%, #0055ff 65%, #1a6bff 100%)",
    accent: "#5599FF",
    glowColor: "rgba(85, 153, 255, 0.4)",
    stats: [
      { value: "200+", label: "Thương hiệu" },
      { value: "100%", label: "Chính hãng" },
      { value: "24/7", label: "Tư vấn" },
    ],
  },
  {
    id: 3,
    badge: "FLASH SALE",
    title: "Thiết bị y tế",
    subtitle: "thông minh tại nhà",
    description: "Máy đo huyết áp, đường huyết, nhiệt kế thông minh. Chăm sóc sức khỏe dễ dàng tại nhà.",
    cta: "Săn deal ngay",
    ctaSub: "Còn 12 giờ nữa",
    date: "Flash Sale 12:00 – 00:00",
    discount: "Giảm đến 55%",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop&auto=format",
    imageAlt: "Medical equipment",
    gradient: "linear-gradient(135deg, #001f7a 0%, #0036b3 35%, #0052D9 65%, #0a5fe0 100%)",
    accent: "#4A90FF",
    glowColor: "rgba(0, 82, 217, 0.5)",
    stats: [
      { value: "500+", label: "Thiết bị" },
      { value: "5★", label: "Đánh giá" },
      { value: "BH 2 năm", label: "Bảo hành" },
    ],
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goNext(), 5500);
    return () => clearInterval(timer);
  }, [current]);

  const goNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length);
        setIsAnimating(false);
      }, 200);
    }
  };

  const goPrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c - 1 + slides.length) % slides.length);
        setIsAnimating(false);
      }, 200);
    }
  };

  const slide = slides[current];

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-2xl mx-auto"
        style={{
          background: slide.gradient,
          transition: "background 0.6s ease",
          minHeight: 420,
        }}
      >
        {/* Background decorative circles */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />
          <div
            className="absolute right-32 bottom-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: "radial-gradient(circle, white 0%, transparent 60%)" }}
          />
        </div>

        <div
          className="relative flex items-center gap-8 px-12 py-10"
          style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.2s ease" }}
        >
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full tracking-widest"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                {slide.badge}
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}
              >
                {slide.discount}
              </span>
            </div>

            <h1
              className="text-white leading-tight mb-1"
              style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}
            >
              {slide.title}
            </h1>
            <h2
              style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5, color: "rgba(255,255,255,0.75)" }}
              className="leading-tight mb-4"
            >
              {slide.subtitle}
            </h2>

            <p className="text-white/75 text-sm leading-relaxed mb-2 max-w-md">
              {slide.description}
            </p>
            <div className="flex items-center gap-1.5 text-white/60 text-xs mb-6">
              <Shield size={12} />
              <span>{slide.date}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-7">
              {slide.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-white font-bold" style={{ fontSize: 22 }}>{stat.value}</div>
                  <div className="text-white/60 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: "#ffffff", color: "#0052D9" }}
              >
                <ShoppingCart size={17} />
                {slide.cta}
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {slide.ctaSub}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right: Product Image with glassmorphism cards */}
          <div className="relative flex-shrink-0 w-[520px] h-[340px]">
            {/* Main product image */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                boxShadow: `0 32px 80px ${slide.glowColor}`,
              }}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.85) saturate(1.2)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,82,217,0.35) 0%, transparent 50%)",
                }}
              />
            </div>

            {/* Glassmorphism overlay card - top right */}
            <div
              className="absolute top-4 right-4 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.25)" }}
              >
                <Star size={16} className="text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <div className="text-white text-xs font-bold">4.9 / 5</div>
                <div className="text-white/70 text-[10px]">18,000+ đánh giá</div>
              </div>
            </div>

            {/* Glassmorphism flash badge - bottom left */}
            <div
              className="absolute bottom-4 left-4 px-4 py-3 rounded-2xl flex items-center gap-2.5"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.8)" }}
              >
                <Zap size={14} className="text-white fill-white" />
              </div>
              <div>
                <div className="text-white text-xs font-bold">Giao hàng 2h</div>
                <div className="text-white/70 text-[10px]">Toàn TP. Hà Nội & HCM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-7 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
