import { useEffect, useRef } from "react";
import { Message } from "../types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
}

export default function ChatWindow({ messages, loading, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Xin chào! Tôi là TravelBot
            </h2>
            <p className="text-gray-500 text-sm max-w-sm">
              Hỏi tôi về điểm đến, lịch trình du lịch, khách sạn, nhà hàng hay bất kỳ
              điều gì liên quan đến travel nhé! 🌍
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={loading} />
    </div>
  );
}
