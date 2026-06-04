import { useState } from "react";
import {
  ChevronDown, Leaf, Sparkles, Pill, Heart, Stethoscope,
  Syringe, BookOpen, MapPin, Grid3X3,
} from "lucide-react";

const navItems = [
  {
    label: "Thực phẩm chức năng",
    icon: Leaf,
    sub: ["Vitamin & Khoáng chất", "Hỗ trợ tiêu hóa", "Tăng cường miễn dịch", "Bổ não & Trí nhớ", "Hỗ trợ tim mạch"],
  },
  {
    label: "Mỹ phẩm",
    icon: Sparkles,
    sub: ["Chăm sóc da mặt", "Chăm sóc cơ thể", "Chống nắng", "Tẩy trang", "Serum & Tinh chất"],
  },
  {
    label: "Thuốc",
    icon: Pill,
    sub: ["Thuốc kê đơn", "Thuốc không kê đơn", "Kháng sinh", "Giảm đau hạ sốt", "Thuốc dạ dày"],
  },
  {
    label: "Chăm sóc cá nhân",
    icon: Heart,
    sub: ["Vệ sinh răng miệng", "Chăm sóc tóc", "Khử mùi", "Băng vệ sinh", "Chăm sóc mắt"],
  },
  {
    label: "Thiết bị y tế",
    icon: Stethoscope,
    sub: ["Máy đo huyết áp", "Máy đo đường huyết", "Nhiệt kế", "Khẩu trang", "Dụng cụ y tế"],
  },
  {
    label: "Tiêm chủng",
    icon: Syringe,
    sub: ["Vaccine viêm gan", "Vaccine cúm mùa", "Vaccine COVID-19", "Lịch tiêm chủng", "Đặt lịch tiêm"],
  },
  {
    label: "Kiến thức sức khỏe",
    icon: BookOpen,
    sub: ["Bệnh thường gặp", "Dinh dưỡng & Ăn uống", "Lối sống lành mạnh", "Tin tức y tế", "Video hướng dẫn"],
  },
  {
    label: "Hệ thống nhà thuốc",
    icon: MapPin,
    sub: ["Tìm nhà thuốc gần nhất", "Nhà thuốc 24/7", "Đặt thuốc online", "Giao hàng tận nhà", "Tra cứu thuốc"],
  },
];

export function MegaNav() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <nav className="bg-white border-b border-border relative z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center">
          {/* All Categories Button */}
          <button
            style={{ background: "linear-gradient(135deg, #0052D9 0%, #0A66FF 100%)" }}
            className="flex items-center gap-2 px-5 py-3 text-white text-sm font-semibold mr-2 hover:opacity-90 transition-opacity"
          >
            <Grid3X3 size={16} />
            Tất cả danh mục
            <ChevronDown size={14} />
          </button>

          {/* Nav Items */}
          {navItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <button
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeIndex === i
                      ? "text-primary border-primary"
                      : "text-foreground border-transparent hover:text-primary hover:border-primary"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${activeIndex === i ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {activeIndex === i && (
                  <div
                    className="absolute top-full left-0 bg-white rounded-b-2xl shadow-2xl border border-border p-4 min-w-[220px] z-50"
                    style={{ boxShadow: "0 20px 60px rgba(0,82,217,0.12)" }}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                      <div
                        style={{ background: "linear-gradient(135deg, #0052D9, #0A66FF)" }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                      >
                        <Icon size={13} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.label}</span>
                    </div>
                    {item.sub.map((sub) => (
                      <a
                        key={sub}
                        href="#"
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-all group"
                      >
                        <span
                          className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors"
                        />
                        {sub}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
