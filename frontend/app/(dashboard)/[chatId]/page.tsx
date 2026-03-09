"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DynamicChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;

  // Currently only the General channel (/) is supported.
  // Redirect any other route back to the main chat.
  useEffect(() => {
    router.replace("/");
  }, [chatId, router]);

  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      Redirecting to General channel...
    </div>
  );
}
