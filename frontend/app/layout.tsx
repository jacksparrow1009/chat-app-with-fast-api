import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chatify",
  description:
    "A simple and intuitive chat application built with Next.js and TypeScript. Chatify allows you to connect with friends and family in real-time, offering a seamless messaging experience. With its clean design and user-friendly interface, Chatify is the perfect platform for staying connected with your loved ones. It supports text messaging, emojis, and file sharing, making it easy to express yourself and share moments with others. Whether you're catching up with friends or collaborating on a project, Chatify has you covered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
