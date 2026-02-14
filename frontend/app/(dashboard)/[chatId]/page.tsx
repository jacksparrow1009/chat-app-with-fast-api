"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Hash, User } from "lucide-react";
import { MessageBubble } from "../components/MessageBubble";

export default function DynamicChatPage() {
  const params = useParams();
  const chatId = params.chatId as string; // This will be "general", "asad", etc.
  
  // Format the display name (e.g., "ai-assistant" -> "AI Assistant")
  const displayName = chatId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const isChannel = !["asad", "john-doe", "ai-assistant"].includes(chatId);

  const [messages, setMessages] = useState([
    { id: 1, content: `Welcome to the ${displayName} chat!`, sender: "System", timestamp: "Now", isMe: false }
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Dynamic Header */}
      <header className="h-16 border-b flex items-center px-6 justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          {isChannel ? <Hash className="h-5 w-5 text-muted-foreground" /> : <User className="h-5 w-5 text-muted-foreground" />}
          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-xs text-muted-foreground">
              {isChannel ? "Public Channel" : "Direct Message"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} {...msg} />
        ))}
      </div>

      {/* Input Bar */}
      <footer className="p-4 bg-background border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input 
            placeholder={`Message ${isChannel ? '#' : ''}${displayName}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-muted/50"
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}