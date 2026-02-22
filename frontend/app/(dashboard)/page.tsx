"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./components/MessageBubble";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hey! How is the FastAPI backend coming along?",
      sender: "John",
      timestamp: "10:30 PM",
      isMe: false,
    },
    {
      id: 2,
      content:
        "It's going great! Just finished the WebSocket integration with Neon.",
      sender: "Asad",
      timestamp: "10:31 PM",
      isMe: true,
    },
    {
      id: 3,
      content: "I can help you optimize those queries if you need.",
      sender: "AI Assistant",
      timestamp: "10:31 PM",
      isMe: false,
      isAi: true,
    },
  ]);
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // For now, we manually add to the local state to test the UI
    const newMessage = {
      id: Date.now(),
      content: input,
      sender: "Asad",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    setInput(""); // Clear input
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Function to scroll to bottom
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 2. Trigger scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
          <Button variant="outline" size="sm">
            View Members
          </Button>
        </div>
      </header>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <MessageSquare className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">No messages yet</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Be the first to say hello in this channel or invite an AI agent!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} {...msg} />
          ))}
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
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </>
  );
}
