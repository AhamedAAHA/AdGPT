import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { AppShell } from "@/components/cyber/AppShell";

export const metadata: Metadata = {
  title: "AdGPT — Creative Intelligence Platform",
  description:
    "AI-powered creative intelligence engine that transforms static ads into platform-ready short videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        <SmoothScroll>
          <AppShell>{children}</AppShell>
        </SmoothScroll>
      </body>
    </html>
  );
}
