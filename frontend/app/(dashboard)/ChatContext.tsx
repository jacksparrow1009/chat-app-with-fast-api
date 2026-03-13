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

function getWsUrl() {
  // NEXT_PUBLIC_WS_URL is the full endpoint URL (e.g. ws://host/api/ws)
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;

  if (/^https?:\/\//.test(API_URL)) {
    return API_URL.replace(/^http/, "ws").replace(/\/$/, "") + "/ws";
  }

  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/api/ws`;
}

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
  const [credentials, setCredentials] = useState<{
    username: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    if (token && username) setCredentials({ token, username });
  }, []);

  const username = credentials?.username ?? null;
  const token = credentials?.token ?? null;

  useEffect(() => {
    if (!token || !username) return;

    const wsUrl = getWsUrl();
    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
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
      if (!credentials?.token || !credentials?.username) return;
      setIsLoadingHistory(true);
      try {
        const res = await fetch(
          `${API_URL}/messages/${encodeURIComponent(chatPartner)}?limit=100`,
          { headers: { Authorization: `Bearer ${credentials!.token}` } },
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
              isMe: msg.sender === credentials!.username,
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
