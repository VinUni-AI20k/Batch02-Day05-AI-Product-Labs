import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen, Bell, MapPin, Clock, Tag, Users } from "lucide-react";

const promoProducts = [
  {
    id: 1,
    name: "Bộ sản phẩm chăm sóc gia đình",
    description: "Vitamin tổng hợp, men vi sinh, canxi cho cả gia đình",
    originalPrice: "1,250,000đ",
    salePrice: "849,000đ",
    discount: "-32%",
    badge: "Bán chạy",
    image: "https://images.unsplash.com/photo-1528272252360-5efd274e36fb?w=280&h=200&fit=crop&auto=format",
    imageAlt: "Healthcare product set",
  },
  {
    id: 2,
    name: "Gói sức khỏe tim mạch",
    description: "Omega-3, Coenzyme Q10, Magie B6 — bảo vệ tim toàn diện",
    originalPrice: "980,000đ",
    salePrice: "680,000đ",
    discount: "-31%",
    badge: "Mới về",
    image: "https://images.unsplash.com/photo-1597121870960-7b5391b88b84?w=280&h=200&fit=crop&auto=format",
    imageAlt: "Heart health supplements",
  },
  {
    id: 3,
    name: "Combo chăm sóc da cao cấp",
    description: "Serum vitamin C, kem dưỡng ẩm, kem chống nắng SPF 50+",
    originalPrice: "760,000đ",
    salePrice: "520,000đ",
    discount: "-32%",
    badge: "Hot deal",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=280&h=200&fit=crop&auto=format",
    imageAlt: "Skincare products",
  },
];

const infoCards = [
  {
    id: 1,
    category: "Kiến thức sức khỏe",
    title: "5 dấu hiệu thiếu vitamin D bạn cần biết ngay hôm nay",
    excerpt: "Vitamin D đóng vai trò quan trọng trong hấp thụ canxi và miễn dịch. Nhận biết sớm để bổ sung kịp thời.",
    readTime: "5 phút đọc",
    date: "04/06/2026",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #0052D9 0%, #0A66FF 60%, #2979FF 100%)",
    stats: [{ icon: Users, value: "12,400 lượt đọc" }, { icon: Clock, value: "5 phút" }],
    image: "https://images.unsplash.com/photo-1588979355313-6711a095465f?w=400&h=120&fit=crop&auto=format",
  },
  {
    id: 2,
    category: "Tin tức nhà thuốc",
    title: "Long Châu khai trương thêm 50 chi nhánh mới tháng 6/2026",
    excerpt: "Mở rộng trên toàn quốc — hơn 4,000 nhà thuốc phục vụ 24/7. Đặt thuốc online, giao hàng trong 2 giờ.",
    readTime: "3 phút đọc",
    date: "03/06/2026",
    icon: Bell,
    gradient: "linear-gradient(135deg, #003a9e 0%, #0052D9 60%, #0A66FF 100%)",
    stats: [{ icon: MapPin, value: "4,000+ nhà thuốc" }, { icon: Clock, value: "24/7" }],
    image: "https://images.unsplash.com/photo-1506836467174-27f1042aa48c?w=400&h=120&fit=crop&auto=format",
  },
];

export function SecondaryPromo() {
  const [promoIndex, setPromoIndex] = useState(0);

  const prevPromo = () => setPromoIndex((i) => (i - 1 + promoProducts.length) % promoProducts.length);
  const nextPromo = () => setPromoIndex((i) => (i + 1) % promoProducts.length);

  const product = promoProducts[promoIndex];

  return (
    <div className="grid grid-cols-5 gap-5 mt-5">
      {/* Left: Large Promotional Card */}
      <div
        className="col-span-3 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 50%, #dde8fa 100%)",
          border: "1px solid rgba(0,82,217,0.12)",
        }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} style={{ color: "#0052D9" }} />
              <span className="text-xs font-bold tracking-wide" style={{ color: "#0052D9" }}>
                GÓI ƯU ĐÃI
              </span>
            </div>
            <h3 className="text-foreground" style={{ fontSize: 18, fontWeight: 700 }}>
              Combo tiết kiệm cho gia đình
            </h3>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: "#0052D9" }}
          >
            Xem tất cả <ArrowRight size={12} />
          </a>
        </div>

        {/* Product Card */}
        <div className="px-6 pb-5">
          <div
            className="rounded-2xl overflow-hidden bg-white shadow-sm"
            style={{ border: "1px solid rgba(0,82,217,0.08)" }}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={product.image}
                alt={product.imageAlt}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(0,82,217,0.4) 0%, transparent 60%)",
                }}
              />
              <span
                className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#f59e0b", color: "#fff" }}
              >
                {product.badge}
              </span>
              <span
                className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#e53e3e", color: "#fff" }}
              >
                {product.discount}
              </span>
            </div>
            <div className="p-4">
              <h4 className="text-foreground mb-1" style={{ fontSize: 15, fontWeight: 700 }}>
                {product.name}
              </h4>
              <p className="text-muted-foreground text-xs mb-3 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-muted-foreground text-xs line-through">{product.originalPrice}</div>
                  <div style={{ color: "#e53e3e", fontSize: 20, fontWeight: 800 }}>{product.salePrice}</div>
                </div>
                <button
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                  style={{ background: "linear-gradient(135deg, #0052D9, #0A66FF)" }}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {promoProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setPromoIndex(i)}
                className={`rounded-full transition-all ${
                  i === promoIndex ? "w-6 h-2" : "w-2 h-2"
                }`}
                style={{ background: i === promoIndex ? "#0052D9" : "#c8d8f0" }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPromo}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors border border-border"
            >
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={nextPromo}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors border border-border"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Two Info Cards */}
      <div className="col-span-2 flex flex-col gap-4">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="relative flex-1 rounded-2xl overflow-hidden group cursor-pointer"
              style={{ minHeight: 160 }}
            >
              {/* Background image */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: card.gradient, opacity: 0.88 }}
              />

              {/* Glassmorphism content */}
              <div className="relative p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <Icon size={12} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-white/80 tracking-wide uppercase">
                      {card.category}
                    </span>
                  </div>
                  <h4 className="text-white leading-snug mb-2" style={{ fontSize: 14, fontWeight: 700 }}>
                    {card.title}
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{card.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    {card.stats.map(({ icon: StatIcon, value }) => (
                      <div key={value} className="flex items-center gap-1">
                        <StatIcon size={10} className="text-white/60" />
                        <span className="text-white/70 text-[10px]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs text-white font-semibold hover:gap-2 transition-all"
                  >
                    Đọc thêm <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
