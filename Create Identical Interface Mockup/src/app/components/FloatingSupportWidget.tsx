import { useState } from "react";
import { MessageCircle, X, Phone, Video, FileText, ChevronRight } from "lucide-react";

const supportOptions = [
  { icon: Phone, label: "Gọi điện tư vấn", sub: "1800 6928 • Miễn phí", color: "#22c55e" },
  { icon: Video, label: "Tư vấn video", sub: "Gặp dược sĩ ngay", color: "#0052D9" },
  { icon: FileText, label: "Chat với AI", sub: "Trả lời tức thì 24/7", color: "#8b5cf6" },
];

export function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Support Menu */}
      {isOpen && (
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "white",
            border: "1px solid rgba(0,82,217,0.12)",
            width: 280,
            boxShadow: "0 24px 60px rgba(0,82,217,0.18)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4"
            style={{ background: "linear-gradient(135deg, #0052D9 0%, #0A66FF 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&auto=format"
                  alt="Healthcare assistant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Dược sĩ Long Châu</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/80 text-xs">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            <p className="text-white/80 text-xs mt-3 leading-relaxed">
              Xin chào! Tôi có thể giúp gì cho bạn về sức khỏe và thuốc hôm nay?
            </p>
          </div>

          {/* Options */}
          <div className="p-3 flex flex-col gap-2">
            {supportOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-left group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${opt.color}15` }}
                  >
                    <Icon size={16} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-semibold">{opt.label}</div>
                    <div className="text-muted-foreground text-xs">{opt.sub}</div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4">
            <button
              className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
              style={{ background: "linear-gradient(135deg, #0052D9, #2979FF)" }}
            >
              Bắt đầu tư vấn ngay
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform"
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #e53e3e, #f56565)"
            : "linear-gradient(135deg, #0052D9 0%, #0A66FF 100%)",
          boxShadow: "0 8px 32px rgba(0,82,217,0.45)",
        }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {/* Online pulse ring */}
        {!isOpen && (
          <>
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: "#0052D9" }}
            />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white flex items-center justify-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
