import { useState } from "react";
import {
  Search, Mic, QrCode, ShoppingCart, User, Bell, ChevronDown,
  Pill, Heart, Baby, Eye, Stethoscope, Leaf, Sparkles, Dumbbell,
} from "lucide-react";

const quickCategories = [
  { icon: Pill, label: "Thuốc" },
  { icon: Leaf, label: "Vitamin & TPBS" },
  { icon: Sparkles, label: "Chăm sóc da" },
  { icon: Baby, label: "Mẹ & Bé" },
  { icon: Eye, label: "Chăm sóc mắt" },
  { icon: Stethoscope, label: "Thiết bị y tế" },
  { icon: Dumbbell, label: "Dinh dưỡng" },
  { icon: Heart, label: "Sức khỏe tim mạch" },
];

export function MainHeader() {
  const [query, setQuery] = useState("");
  const [cartCount] = useState(3);

  return (
    <div className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2.5 cursor-pointer select-none">
            <div
              style={{
                background: "linear-gradient(135deg, #0052D9 0%, #0A66FF 100%)",
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            >
              <Pill size={22} className="text-white" />
            </div>
            <div>
              <div className="text-[#0052D9] leading-tight" style={{ fontSize: 17, fontWeight: 700 }}>
                Long Châu
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">Nhà Thuốc Uy Tín</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-[700px]">
            <div
              className="flex items-center rounded-2xl border-2 overflow-hidden transition-all"
              style={{ borderColor: "#0052D9", background: "#f8faff" }}
            >
              <Search size={18} className="ml-4 flex-shrink-0" style={{ color: "#0052D9" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm thuốc, thực phẩm chức năng, sản phẩm chăm sóc sức khỏe..."
                className="flex-1 px-3 py-3 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-1 pr-2">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                  <Mic size={17} />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                  <QrCode size={17} />
                </button>
                <button
                  style={{ background: "linear-gradient(135deg, #0052D9 0%, #0A66FF 100%)" }}
                  className="ml-1 px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-secondary transition-colors group">
              <User size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                Đăng nhập
              </span>
            </button>

            <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-secondary transition-colors group relative">
              <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                Thông báo
              </span>
              <span
                style={{ background: "#e53e3e" }}
                className="absolute top-1 right-2 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
              >
                2
              </span>
            </button>

            <button
              style={{ background: "linear-gradient(135deg, #0052D9 0%, #2979FF 100%)" }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white shadow-md hover:shadow-lg hover:opacity-95 transition-all relative"
            >
              <ShoppingCart size={20} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-white/80 leading-tight">Giỏ hàng</span>
                <span className="text-sm font-bold leading-tight">{cartCount} sản phẩm</span>
              </div>
              <span
                style={{ background: "#f59e0b" }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow"
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Category Strip */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border">
          {quickCategories.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-primary hover:bg-secondary transition-all whitespace-nowrap group"
            >
              <Icon size={13} className="group-hover:text-primary" />
              {label}
            </button>
          ))}
          <button className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-xl text-xs text-primary hover:bg-secondary transition-colors">
            Xem tất cả <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
