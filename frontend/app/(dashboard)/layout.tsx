"use client";

import { ReactNode, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/guards/AuthGuard";
import { ChatProvider, useChatContext } from "./ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface UserInfo {
  id: number;
  username: string;
  email: string;
}

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { onlineUsers } = useChatContext();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [currentUsername] = useState<string>(
    () =>
      (typeof window !== "undefined"
        ? localStorage.getItem("username")
        : null) || "",
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch {
        // Failed to load users
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    router.replace("/login");
  };

  const otherUsers = users.filter((u) => u.username !== currentUsername);

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col hidden md:flex">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Chatify</h2>
        <MessageCircle className="h-5 w-5 text-blue-600" />
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
            Messages
          </p>
          {otherUsers.map((user) => {
            const isOnline = onlineUsers.includes(user.username);
            const isSelected = pathname === `/${user.username}`;
            return (
              <Link key={user.id} href={`/${user.username}`}>
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 mb-1 h-10",
                    isSelected && "bg-secondary font-medium",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">
                        {user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                        isOnline ? "bg-green-500" : "bg-gray-300",
                      )}
                    />
                  </div>
                  <span className="truncate text-sm">{user.username}</span>
                </Button>
              </Link>
            );
          })}
          {otherUsers.length === 0 && (
            <p className="text-xs text-muted-foreground px-2">
              No other users yet
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="relative shrink-0">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback>
                {currentUsername ? currentUsername[0]?.toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none">
              {currentUsername || "Loading..."}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ChatProvider>
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-background relative">
            {children}
          </main>
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}
