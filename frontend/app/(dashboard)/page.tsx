"use client";

import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
      <div className="bg-blue-50 p-4 rounded-full mb-4">
        <MessageSquare className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold">Welcome to Chatify</h3>
      <p className="text-muted-foreground text-sm max-w-[250px]">
        Select a user from the sidebar to start a conversation
      </p>
    </div>
  );
}
