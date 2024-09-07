import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "A real-time messenger app inspired by iMessage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white bg-black">{children}</body>
    </html>
  );
}
