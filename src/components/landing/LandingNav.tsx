"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0f]/90 border-white/8 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center text-xs font-black text-white shadow-lg shadow-cyan-500/20">
            A
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-hero-primary">Ad</span>
            <span className="text-hero-accent">GPT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Pipeline", "Platforms"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-hero-secondary hover:text-hero-accent transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <Link href="/studio">
          <Button
            variant="outline"
            size="sm"
            className="border-cyan-500/40 text-hero-accent hover:bg-cyan-500/10"
          >
            Open Studio
          </Button>
        </Link>
      </div>
    </header>
  );
}
