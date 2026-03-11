"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";

export interface ChatMessage {
  id: number;
  content: string;
  sender: string;
  receiver: string;
  timestamp: string;
  isMe: boolean;
}

interface ChatContextType {
  isConnected: boolean;
  onlineUsers: string[];
  messages: ChatMessage[];
  typingUsers: Set<string>;
  sendMessage: (receiver: string, content: string) => void;
  sendTyping: (receiver: string) => void;
  loadHistory: (chatPartner: string) => Promise<void>;
  isLoadingHistory: boolean;
}

const ChatContext = createContext<ChatContextType>({
  isConnected: false,
  onlineUsers: [],
  messages: [],
  typingUsers: new Set(),
  sendMessage: () => {},
  sendTyping: () => {},
  loadHistory: async () => {},
  isLoadingHistory: false,
});

export function useChatContext() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const wsRef = useRef<WebSocket | null>(null);
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token || !username) return;

    const ws = new WebSocket(`${WS_URL}/ws?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "online_users") {
          setOnlineUsers(data.users);
        } else if (data.type === "typing") {
          const sender = data.sender as string;
          setTypingUsers((prev) => new Set(prev).add(sender));
          // Clear existing timer for this sender
          const existing = typingTimersRef.current.get(sender);
          if (existing) clearTimeout(existing);
          // Auto-clear after 3 seconds
          typingTimersRef.current.set(
            sender,
            setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Set(prev);
                next.delete(sender);
                return next;
              });
              typingTimersRef.current.delete(sender);
            }, 3000),
          );
        } else if (data.type === "message") {
          const newMsg: ChatMessage = {
            id: data.id,
            content: data.content,
            sender: data.sender,
            receiver: data.receiver,
            timestamp: data.timestamp,
            isMe: data.sender === username,
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, newMsg];
          });
        }
      } catch {
        // Non-JSON message, ignore
      }
    };

    return () => {
      ws.close();
    };
  }, [token, username]);

  const loadHistory = useCallback(
    async (chatPartner: string) => {
      if (!token || !username) return;
      setIsLoadingHistory(true);
      try {
        const res = await fetch(
          `${API_URL}/messages/${encodeURIComponent(chatPartner)}?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          const historyMessages: ChatMessage[] = data.map(
            (msg: {
              id: number;
              sender: string;
              receiver: string;
              content: string;
              timestamp: string;
            }) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              receiver: msg.receiver ?? "",
              timestamp: msg.timestamp,
              isMe: msg.sender === username,
            }),
          );
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = historyMessages.filter(
              (m) => !existingIds.has(m.id),
            );
            return [...newMsgs, ...prev].sort((a, b) => a.id - b.id);
          });
        }
      } catch {
        // silent
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [token, username],
  );

  const sendTyping = useCallback((receiver: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "typing", receiver }));
  }, []);

  const sendMessage = useCallback((receiver: string, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ receiver, content }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        onlineUsers,
        messages,
        typingUsers,
        sendMessage,
        sendTyping,
        loadHistory,
        isLoadingHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
