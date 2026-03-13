"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile, Paperclip, MessageSquare, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MessageBubble } from "../components/MessageBubble";
import { useChatContext } from "../ChatContext";
import { cn } from "@/lib/utils";

export default function DmChatPage() {
  const params = useParams();
  const chatPartner = params.chatId as string;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
    loadHistory,
    isLoadingHistory,
  } = useChatContext();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPartnerTyping = typingUsers.has(chatPartner);

  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);
  const isPartnerOnline = onlineUsers.includes(chatPartner);

  // Load message history when chat partner changes
  useEffect(() => {
    loadHistory(chatPartner);
  }, [chatPartner, loadHistory]);

  // Filter messages for this conversation
  const conversationMessages = useMemo(() => {
    return messages.filter(
      (m) =>
        (m.sender === username && m.receiver === chatPartner) ||
        (m.sender === chatPartner && m.receiver === username),
    );
  }, [messages, username, chatPartner]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) return; // Already sent recently
    sendTyping(chatPartner);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [chatPartner, sendTyping]);

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(chatPartner, input.trim());
    setInput("");
  }, [input, chatPartner, sendMessage]);

  return (
    <>
      <header className="h-16 border-b flex items-center px-6 justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-sm">
                {chatPartner[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                isPartnerOnline ? "bg-green-500" : "bg-gray-300",
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{chatPartner}</h3>
            <p className="text-xs text-muted-foreground">
              {isPartnerTyping
                ? "Typing..."
                : isPartnerOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
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

      {isLoadingHistory ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversationMessages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">No messages yet</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Say hello to {chatPartner}!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {conversationMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              sender={msg.sender}
              timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              isMe={msg.isMe}
            />
          ))}
          {isPartnerTyping && (
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="text-[10px]">
                  {chatPartner[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
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
            placeholder={`Message ${chatPartner}...`}
            className="flex-1 bg-transparent border-none focus:outline-none resize-none p-2 text-sm max-h-32"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) handleTyping();
            }}
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
