import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Share",
  description: "Share images, videos, and stories with a dark creator feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-24">{children}</main>
      </body>
    </html>
  );
}
