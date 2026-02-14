"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip } from "lucide-react";

export default function ChatPage() {
    return (
        <>
            {/* Chat Header */}
            <header className="h-16 border-b flex items-center px-6 justify-between bg-background/95 backdrop-blur">
                <div>
                    <h3 className="font-semibold text-lg"># General</h3>
                    <p className="text-xs text-muted-foreground">The main room for everyone</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Members</Button>
                </div>
            </header>

            {/* Messages Window */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* We will map our Message bubbles here */}
                <div className="flex justify-center italic text-muted-foreground text-sm py-10">
                    Start of your conversation in #General
                </div>
            </div>

            {/* Message Input Bar */}
            <footer className="p-4 bg-background">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/50 rounded-lg p-2 border focus-within:ring-1 focus-within:ring-ring">
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <textarea
                        rows={1}
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none resize-none p-2 text-sm max-h-32"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <Smile className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </footer>
        </>
    );
}