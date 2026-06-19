"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

const stats = [
  { icon: Clock, label: "15–30s", sub: "Clip length" },
  { icon: Layers, label: "5+", sub: "Platforms" },
  { icon: Zap, label: "AI", sub: "Powered" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.7, ease: "easeOut" as const },
  }),
};

interface LandingHeroProps {
  onWatchDemo: () => void;
}

export function LandingHero({ onWatchDemo }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/8 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-hero-accent">
              Static Ad → Video Generator
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-6"
          >
            <span className="text-hero-primary">Your static ad</span>
            <br />
            <span className="text-gradient-hero">already won.</span>
            <br />
            <span className="text-hero-primary/80">Make it move.</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg md:text-xl text-hero-secondary leading-relaxed max-w-xl mb-10"
          >
            Transform high-performing static creatives into platform-ready
            short videos with AI storyboards, cinematic motion, and voice.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link href="/studio">
              <Button size="lg" className="w-full sm:w-auto min-w-[180px] shadow-xl shadow-cyan-500/15">
                Start Creating
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-w-[180px] border border-white/10 bg-white/5 text-hero-primary hover:bg-white/10 hover:border-purple-500/30"
              onClick={onWatchDemo}
            >
              <Play size={16} className="text-hero-accent" style={{ fill: "currentColor" }} />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-wrap gap-8 md:gap-12"
          >
            {stats.map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon size={18} className="text-hero-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold text-hero-primary">{label}</p>
                  <p className="text-xs text-hero-muted uppercase tracking-wider">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-hero-muted">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cyan-500/60 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
