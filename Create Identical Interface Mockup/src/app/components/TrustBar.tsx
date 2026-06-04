import { Truck, ShieldCheck, Clock, Award, PhoneCall, RotateCcw } from "lucide-react";

const trustItems = [
  { icon: Truck, label: "Giao hàng 2 giờ", sub: "Toàn quốc", color: "#0052D9" },
  { icon: ShieldCheck, label: "Hàng chính hãng", sub: "100% cam kết", color: "#059669" },
  { icon: Clock, label: "Phục vụ 24/7", sub: "Kể cả ngày lễ", color: "#7c3aed" },
  { icon: Award, label: "50,000+ sản phẩm", sub: "Đa dạng lựa chọn", color: "#d97706" },
  { icon: PhoneCall, label: "Tư vấn miễn phí", sub: "1800 6928", color: "#0891b2" },
  { icon: RotateCcw, label: "Đổi trả 30 ngày", sub: "Dễ dàng - nhanh chóng", color: "#dc2626" },
];

export function TrustBar() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid rgba(0,82,217,0.1)",
        boxShadow: "0 4px 20px rgba(0,82,217,0.06)",
      }}
    >
      <div className="grid grid-cols-6 divide-x divide-border">
        {trustItems.map(({ icon: Icon, label, sub, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ background: `${color}15` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-foreground text-xs font-bold leading-tight">{label}</div>
              <div className="text-muted-foreground text-[11px] leading-tight mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
