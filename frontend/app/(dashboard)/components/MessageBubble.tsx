"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface MessageBubbleProps {
    content: string;
    sender: string;
    timestamp: string;
    isMe: boolean;
    isAi?: boolean;
}

export function MessageBubble({ content, sender, timestamp, isMe, isAi }: MessageBubbleProps) {
    return (
        <div className={cn("flex w-full mb-4 gap-3", isMe ? "justify-end" : "justify-start")}>
            {!isMe && (
                <Avatar className="h-8 w-8 mt-1 border">
                    {isAi ? (
                        <div className="bg-purple-100 h-full w-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-purple-600" />
                        </div>
                    ) : (
                        <AvatarFallback className="text-[10px]">{sender[0]}</AvatarFallback>
                    )}
                </Avatar>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isMe ? "items-end" : "items-start")}>
                {!isMe && <span className="text-xs text-muted-foreground mb-1 ml-1">{sender}</span>}

                <div
                    className={cn(
                        "px-4 py-2 rounded-2xl text-sm shadow-sm",
                        isMe
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : isAi
                                ? "bg-purple-50 border border-purple-200 text-slate-900 rounded-tl-none"
                                : "bg-muted text-slate-900 rounded-tl-none"
                    )}
                >
                    {content}
                </div>

                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {timestamp}
                </span>
            </div>
        </div>
    );
}