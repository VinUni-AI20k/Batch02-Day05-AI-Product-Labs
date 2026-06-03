import axios from "axios";
import { Message } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function sendMessage(messages: Message[]): Promise<string> {
  const payload = messages.map((m) => ({ role: m.role, content: m.content }));
  const { data } = await axios.post(`${API_BASE}/api/chat/`, { messages: payload });
  return data.reply as string;
}
