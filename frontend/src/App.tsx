import { useState, useCallback } from "react";
import { Conversation, Message } from "./types";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { sendMessage } from "./api";

function newConversation(): Conversation {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Cuộc hội thoại mới",
    messages: [],
    createdAt: new Date(),
  };
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  function handleNew() {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
  }

  const handleSend = useCallback(
    async (text: string) => {
      let convId = activeId;

      // Auto-create conversation if none active
      if (!convId) {
        const c = newConversation();
        convId = c.id;
        setConversations((prev) => [c, ...prev]);
        setActiveId(convId);
      }

      const userMsg: Message = {
        id: makeId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const updated = { ...c, messages: [...c.messages, userMsg] };
          if (c.title === "Cuộc hội thoại mới") {
            updated.title = text.slice(0, 30) + (text.length > 30 ? "…" : "");
          }
          return updated;
        })
      );

      setLoading(true);

      try {
        const currentConv = conversations.find((c) => c.id === convId);
        const history = [...(currentConv?.messages ?? []), userMsg];
        const reply = await sendMessage(history);

        const botMsg: Message = {
          id: makeId(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, botMsg] } : c
          )
        );
      } catch {
        const errMsg: Message = {
          id: makeId(),
          role: "assistant",
          content: "⚠️ Không thể kết nối đến server. Vui lòng thử lại sau.",
          timestamp: new Date(),
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [activeId, conversations]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar toggle button (mobile) */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        className="absolute top-3 left-3 z-50 md:hidden bg-gray-800 text-white rounded-lg p-2"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "flex" : "hidden"
        } md:flex flex-shrink-0`}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="hidden md:flex text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">
              {activeConv ? activeConv.title : "TravelBot – AI Du Lịch"}
            </h2>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Đang hoạt động
            </p>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            messages={activeConv?.messages ?? []}
            loading={loading}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
