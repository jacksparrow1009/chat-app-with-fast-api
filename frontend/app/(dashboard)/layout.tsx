"use client";

import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Settings, LogOut, Plus, Hash } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <aside className="w-64 border-r bg-muted/30 flex flex-col hidden md:flex">
                <div className="p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">ChatIx</h2>
                    <Button variant="ghost" size="icon">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
                            Channels
                        </p>
                        {["General", "AI-Agents", "Random"].map((channel) => {
                            const href = `/${channel.toLowerCase()}`;
                            return (
                                <Link key={channel} href={href} passHref>
                                    <Button
                                        variant={isActive(href) ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start gap-2 mb-1",
                                            isActive(href) && "bg-secondary font-medium"
                                        )}
                                    >
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        {channel}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
                            Direct Messages
                        </p>
                        {["Asad", "AI-Assistant", "John-Doe"].map((user) => {
                            const href = `/${user.toLowerCase()}`;
                            return (
                                <Link key={user} href={href} passHref>
                                    <Button
                                        variant={isActive(href) ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start gap-2 mb-1",
                                            isActive(href) && "bg-secondary font-medium"
                                        )}
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]">{user[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{user.replace('-', ' ')}</span>
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Avatar className="h-9 w-9 border">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium leading-none">Asad Dev</p>
                            <p className="text-xs text-muted-foreground truncate">asad@example.com</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="flex-1" asChild>
                            <Link href="/settings">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                {children}
            </main>
        </div>
    );
}