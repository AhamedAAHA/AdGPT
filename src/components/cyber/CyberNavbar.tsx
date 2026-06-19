"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Menu, X, Cpu } from "lucide-react";

const NAV_LINKS = [
  { href: "/#intelligence", label: "Intelligence" },
  { href: "/#pipeline", label: "Pipeline" },
  { href: "/#metrics", label: "Metrics" },
  { href: "/studio", label: "Studio" },
];

export function CyberNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "cyber-nav cyber-nav--scrolled"
          : "cyber-nav"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg cyber-logo-box flex items-center justify-center">
            <Cpu size={18} className="text-cyber-cyan relative z-10" />
            <div className="absolute inset-0 rounded-lg cyber-logo-glow" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              <span className="text-cyber-white">Ad</span>
              <span className="text-cyber-cyan">GPT</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-cyber-muted mt-0.5">
              Creative Intel
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isStudio = link.href === "/studio";
            const active = isStudio
              ? pathname === "/studio"
              : pathname === "/" && link.href.startsWith("/#");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "text-cyber-cyan bg-cyan-500/10 border border-cyan-500/20"
                    : "text-cyber-gray hover:text-cyber-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
              Live
            </span>
          </div>
          <Link href="/studio">
            <Button size="sm" className="shadow-lg shadow-cyan-500/15">
              Launch Studio
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-cyber-gray hover:text-cyber-white cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden cyber-nav-mobile border-t border-white/8">
          <div className="px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-lg text-sm text-cyber-gray hover:text-cyber-white hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/studio" className="mt-2">
              <Button className="w-full">Launch Studio</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
