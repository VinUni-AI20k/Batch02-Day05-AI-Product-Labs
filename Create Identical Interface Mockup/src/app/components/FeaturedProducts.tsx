import { useState } from "react";
import { ShoppingCart, Star, Heart, ArrowRight, Zap, Tag } from "lucide-react";

const categories = ["Bán chạy nhất", "Vitamin & TPBS", "Chăm sóc da", "Thiết bị y tế", "Sức khỏe mẹ & bé"];

const products = [
  {
    id: 1,
    name: "Vitamin C 1000mg Blackmores",
    brand: "Blackmores",
    price: "285,000đ",
    originalPrice: "349,000đ",
    discount: "-18%",
    rating: 4.8,
    reviews: 2340,
    badge: "Bán chạy",
    badgeColor: "#f59e0b",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop&auto=format",
    isFavorite: false,
    isFlash: false,
  },
  {
    id: 2,
    name: "Omega-3 Fish Oil Nature Made",
    brand: "Nature Made",
    price: "420,000đ",
    originalPrice: "580,000đ",
    discount: "-28%",
    rating: 4.9,
    reviews: 1876,
    badge: "Flash Sale",
    badgeColor: "#e53e3e",
    image: "https://images.unsplash.com/photo-1597121870960-7b5391b88b84?w=300&h=300&fit=crop&auto=format",
    isFavorite: true,
    isFlash: true,
  },
  {
    id: 3,
    name: "Kem chống nắng La Roche-Posay SPF 50",
    brand: "La Roche-Posay",
    price: "365,000đ",
    originalPrice: "420,000đ",
    discount: "-13%",
    rating: 4.7,
    reviews: 3210,
    badge: "Chính hãng",
    badgeColor: "#059669",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=300&fit=crop&auto=format",
    isFavorite: false,
    isFlash: false,
  },
  {
    id: 4,
    name: "Máy đo huyết áp Omron HEM-7156T",
    brand: "Omron",
    price: "1,150,000đ",
    originalPrice: "1,450,000đ",
    discount: "-21%",
    rating: 4.9,
    reviews: 956,
    badge: "Top pick",
    badgeColor: "#7c3aed",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop&auto=format",
    isFavorite: false,
    isFlash: false,
  },
  {
    id: 5,
    name: "Men vi sinh Enterogermina 2 tỷ",
    brand: "Sanofi",
    price: "125,000đ",
    originalPrice: "155,000đ",
    discount: "-19%",
    rating: 4.6,
    reviews: 5420,
    badge: "Bán chạy",
    badgeColor: "#f59e0b",
    image: "https://images.unsplash.com/photo-1528272252360-5efd274e36fb?w=300&h=300&fit=crop&auto=format",
    isFavorite: false,
    isFlash: false,
  },
  {
    id: 6,
    name: "Sữa bột Nan Optipro 3 cho trẻ 1-3 tuổi",
    brand: "Nestlé",
    price: "485,000đ",
    originalPrice: "560,000đ",
    discount: "-13%",
    rating: 4.8,
    reviews: 1230,
    badge: "Mới về",
    badgeColor: "#0052D9",
    image: "https://images.unsplash.com/photo-1506836467174-27f1042aa48c?w=300&h=300&fit=crop&auto=format",
    isFavorite: true,
    isFlash: false,
  },
];

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(
    new Set(products.filter((p) => p.isFavorite).map((p) => p.id))
  );

  const toggleFav = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full"
            style={{ background: "linear-gradient(to bottom, #0052D9, #0A66FF)" }}
          />
          <h2 className="text-foreground" style={{ fontSize: 20, fontWeight: 700 }}>
            Sản phẩm nổi bật
          </h2>
        </div>
        <a
          href="#"
          className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
          style={{ color: "#0052D9" }}
        >
          Xem tất cả <ArrowRight size={14} />
        </a>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === i
                ? "text-white shadow-md"
                : "text-muted-foreground bg-white border border-border hover:border-primary hover:text-primary"
            }`}
            style={
              activeTab === i
                ? { background: "linear-gradient(135deg, #0052D9, #0A66FF)" }
                : {}
            }
          >
            {i === 1 && <Zap size={12} className="inline mr-1" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-6 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            style={{
              border: "1px solid rgba(0,82,217,0.08)",
              boxShadow: "0 2px 12px rgba(0,82,217,0.04)",
            }}
          >
            {/* Image */}
            <div className="relative overflow-hidden h-40 bg-secondary">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Badges */}
              <span
                className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: product.badgeColor }}
              >
                {product.badge}
              </span>
              <span
                className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: "#e53e3e" }}
              >
                {product.discount}
              </span>

              {/* Flash indicator */}
              {product.isFlash && (
                <div
                  className="absolute bottom-0 left-0 right-0 py-1 flex items-center justify-center gap-1 text-white text-[10px] font-bold"
                  style={{ background: "rgba(229,62,62,0.9)" }}
                >
                  <Zap size={10} className="fill-current" />
                  FLASH SALE
                </div>
              )}

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(product.id);
                }}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
              >
                <Heart
                  size={14}
                  className={favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                />
              </button>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="text-[10px] text-muted-foreground mb-1 font-medium">{product.brand}</div>
              <h3 className="text-foreground text-xs leading-snug mb-2 line-clamp-2" style={{ fontWeight: 600 }}>
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-foreground">{product.rating}</span>
                <span className="text-[10px] text-muted-foreground">({product.reviews.toLocaleString()})</span>
              </div>

              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground line-through">{product.originalPrice}</div>
                  <div style={{ color: "#0052D9", fontSize: 15, fontWeight: 800 }}>{product.price}</div>
                </div>
                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow hover:opacity-90 transition-opacity hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #0052D9, #0A66FF)" }}
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promotional banner below products */}
      <div
        className="mt-5 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #0052D9 0%, #0A66FF 50%, #2979FF 100%)",
        }}
      >
        <div
          className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: "white" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={14} className="text-white/80" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Đặc quyền thành viên</span>
          </div>
          <h3 className="text-white mb-1" style={{ fontSize: 20, fontWeight: 800 }}>
            Đăng ký thẻ Long Châu — nhận ngay 200.000đ
          </h3>
          <p className="text-white/75 text-sm">
            Tích điểm mỗi đơn hàng, hoàn tiền lên đến 5%, ưu tiên tư vấn dược sĩ 24/7
          </p>
        </div>
        <button
          className="flex-shrink-0 flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: "white", color: "#0052D9" }}
        >
          Đăng ký ngay <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
