import { Conversation } from "../types";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function Sidebar({ conversations, activeId, onSelect, onNew }: Props) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h1 className="font-bold text-sm leading-tight">Travel Chatbot</h1>
            <p className="text-xs text-gray-400">Day5-6 Hackathon</p>
          </div>
        </div>
        <button
          onClick={onNew}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg py-2 px-3 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Cuộc hội thoại mới
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-500 text-center mt-4 px-2">
            Chưa có cuộc hội thoại nào.
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left rounded-lg px-3 py-2 mb-1 text-sm transition-colors truncate ${
                activeId === c.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <p className="truncate font-medium">{c.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {c.messages.length} tin nhắn
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
        🌏 Powered by TravelBot AI
      </div>
    </div>
  );
}
