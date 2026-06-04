import { Download, Phone, Headphones, MapPin, ChevronRight } from "lucide-react";

export function TopUtilityBar() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #003399 0%, #0052D9 40%, #0A66FF 70%, #2979FF 100%)",
      }}
      className="w-full py-1.5 px-4"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/90 text-xs">
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
            MỚI
          </span>
          <span>Tải ứng dụng Long Châu – nhận ưu đãi đặc biệt lên đến</span>
          <span className="text-yellow-300 font-bold">200.000đ</span>
          <a href="#" className="flex items-center gap-1 text-white/80 hover:text-white underline underline-offset-2 transition-colors">
            <Download size={11} />
            Tải ngay
          </a>
        </div>

        <div className="flex items-center gap-5 text-white/85 text-xs">
          <a href="tel:18006928" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={11} />
            <span>1800 6928</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Headphones size={11} />
            <span>Hỗ trợ</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin size={11} />
            <span>Hệ thống nhà thuốc</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors group">
            <span>Theo dõi đơn hàng</span>
            <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
