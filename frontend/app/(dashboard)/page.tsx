"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, MessageSquare, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./components/MessageBubble";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api";

interface ChatMessage {
  id: number;
  content: string;
  sender: string;
  timestamp: string;
  isMe: boolean;
  isSystem?: boolean;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load message history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/messages?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(
            data.map(
              (msg: {
                id: number;
                sender: string;
                content: string;
                timestamp: string;
              }) => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender,
                timestamp: formatTime(msg.timestamp),
                isMe: msg.sender === username,
              }),
            ),
          );
        }
      } catch {
        // History load failed silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [token, username]);

  // WebSocket connection
  useEffect(() => {
    if (!token || !username) return;

    const ws = new WebSocket(`${WS_URL}/ws?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "system") {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              content: data.content,
              sender: "System",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: false,
              isSystem: true,
            },
          ]);
        } else if (data.type === "message") {
          setMessages((prev) => {
            // Avoid duplicating our own message if it was already added optimistically
            if (
              data.sender === username &&
              prev.some((m) => m.id === data.id)
            ) {
              return prev;
            }
            return [
              ...prev,
              {
                id: data.id,
                content: data.content,
                sender: data.sender,
                timestamp: formatTime(data.timestamp),
                isMe: data.sender === username,
              },
            ];
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

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (
      !input.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    )
      return;
    wsRef.current.send(input.trim());
    setInput("");
  }, [input]);

  return (
    <>
      <header className="h-16 border-b flex items-center px-6 justify-between bg-background/95 backdrop-blur">
        <div>
          <h3 className="font-semibold text-lg"># General</h3>
          <p className="text-xs text-muted-foreground">
            The main room for everyone
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-400"}`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">No messages yet</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Be the first to say hello in this channel!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {messages.map((msg) =>
            msg.isSystem ? (
              <div
                key={msg.id}
                className="text-center text-xs text-muted-foreground my-3"
              >
                {msg.content}
              </div>
            ) : (
              <MessageBubble key={msg.id} {...msg} />
            ),
          )}
          <div ref={scrollRef} />
        </div>
      )}

      <footer className="p-4 bg-background">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/50 rounded-lg p-2 border focus-within:ring-1 focus-within:ring-ring">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none p-2 text-sm max-h-32"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            disabled={!isConnected}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </>
  );
}
