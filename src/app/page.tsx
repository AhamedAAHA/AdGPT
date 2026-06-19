"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Scan,
  Network,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  Play,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroDemoModal } from "@/components/hero/HeroDemoModal";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);

  return (
    <span className="font-mono text-2xl md:text-3xl font-bold text-cyber-cyan">
      {count}
      {suffix}
    </span>
  );
}

const modules = [
  {
    icon: Scan,
    title: "Creative Vision AI",
    desc: "Neural scan of static ads — product, audience, colors, text regions.",
    tag: "VISION",
  },
  {
    icon: Brain,
    title: "Storyboard Intelligence",
    desc: "GPT-4o generates timed beats, hooks, and kinetic caption systems.",
    tag: "NLP",
  },
  {
    icon: Network,
    title: "Motion Neural Engine",
    desc: "Per-scene motion graphs — zoom, parallax, typewriter, particle fields.",
    tag: "MOTION",
  },
  {
    icon: BarChart3,
    title: "Engagement Scoring",
    desc: "AI rubric scores hook, clarity, CTA, and brand alignment in real-time.",
    tag: "ANALYTICS",
  },
  {
    icon: Zap,
    title: "A/B Variant Matrix",
    desc: "One image → emotional, discount, and curiosity ad variants.",
    tag: "OPTIMIZE",
  },
  {
    icon: Globe,
    title: "Platform Intelligence",
    desc: "Reels, TikTok, Shorts, LinkedIn, Amazon — auto safe zones.",
    tag: "EXPORT",
  },
];

const pipeline = [
  { step: "INGEST", label: "Upload creative + script" },
  { step: "ANALYZE", label: "Vision + brand DNA extraction" },
  { step: "GENERATE", label: "AI storyboard + motion graph" },
  { step: "SYNTHESIZE", label: "Voice, music, captions" },
  { step: "DEPLOY", label: "Platform-ready MP4 export" },
];

const tickerItems = [
  "CREATIVE_ANALYSIS :: COMPLETE",
  "HOOK_SCORE :: 91.2%",
  "BRAND_DNA :: EXTRACTED",
  "STORYBOARD :: 5 BEATS",
  "MOTION_GRAPH :: RENDERING",
  "A/B_VARIANT :: CURIOSITY +87%",
  "EXPORT :: REELS_9:16",
  "NEURAL_PIPELINE :: ACTIVE",
];

export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((o) => o - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="overflow-hidden">
      {/* ── DATA TICKER (top, below navbar) ── */}
      <div className="fixed top-[5.5rem] left-0 right-0 z-40 border-b border-cyan-500/10 bg-black/50 backdrop-blur-md overflow-hidden py-2.5">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="text-[11px] font-mono text-cyber-muted uppercase tracking-wider"
            >
              <span className="text-cyber-cyan mr-2">◆</span>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-[9.5rem] pb-16 px-5 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full cyber-badge mb-8"
              >
                <Activity size={14} className="text-cyber-cyan" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-cyber-cyan">
                  Creative Intelligence Platform
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-6"
              >
                <span className="text-cyber-white">Turn static ads into</span>
                <br />
                <span className="text-cyber-gradient">intelligent video.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-cyber-gray leading-relaxed max-w-lg mb-8"
              >
                AdGPT is an AI-powered creative intelligence engine that
                transforms high-performing static creatives into platform-ready
                15–30s videos — with neural storyboards, motion, and voice.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/studio">
                  <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                    Start Creating
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] cyber-btn-ghost"
                  onClick={() => setDemoOpen(true)}
                >
                  <Play size={16} className="text-cyber-cyan" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Intelligence Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="cyber-panel p-1 rounded-2xl"
            >
              <div className="cyber-panel-inner rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-cyber-muted font-mono">
                    NEURAL_DASHBOARD
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Hook Score", value: "91.2", unit: "%" },
                    { label: "Beats", value: "5", unit: "" },
                    { label: "Platforms", value: "5", unit: "+" },
                  ].map((m) => (
                    <div key={m.label} className="cyber-stat-box rounded-lg p-3">
                      <p className="text-[9px] uppercase tracking-wider text-cyber-muted mb-1">
                        {m.label}
                      </p>
                      <p className="font-mono text-xl font-bold text-cyber-cyan">
                        {m.value}
                        <span className="text-sm text-cyber-purple">{m.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {["Creative Analysis", "Brand DNA", "Storyboard", "Export"].map(
                    (step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="w-16 text-[9px] font-mono text-cyber-muted">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(i + 1) * 25}%` }}
                            transition={{ delay: 0.8 + i * 0.3, duration: 1 }}
                            className="h-full rounded-full cyber-progress-bar"
                          />
                        </div>
                        <span className="text-[10px] text-cyber-gray w-24 text-right">
                          {step}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="cyber-terminal rounded-lg p-3 font-mono text-[10px] text-cyber-cyan/80 leading-relaxed overflow-hidden h-16">
                  <motion.div animate={{ y: tickerOffset % 60 }}>
                    {tickerItems.map((item, i) => (
                      <div key={i} className="py-0.5">
                        <span className="text-cyber-purple">&gt;</span> {item}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section id="metrics" className="py-20 px-5 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 15, suffix: "s+", label: "Min clip length" },
            { value: 5, suffix: "", label: "Platform presets" },
            { value: 13, suffix: "", label: "AI modules" },
            { value: 99, suffix: "%", label: "Uptime target" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-panel rounded-xl p-6 text-center"
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-xs text-cyber-muted mt-2 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INTELLIGENCE MODULES ── */}
      <section id="intelligence" className="py-24 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyber-cyan mb-3 font-mono">
              Intelligence_Modules
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-cyber-white mb-4">
              Neural creative{" "}
              <span className="text-cyber-gradient">intelligence stack</span>
            </h2>
            <p className="text-cyber-gray max-w-2xl">
              Thirteen AI modules orchestrated through a single creative
              intelligence pipeline — from vision analysis to platform export.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => (
              <motion.article
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="cyber-panel rounded-xl p-6 group hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <mod.icon size={18} className="text-cyber-cyan" />
                  </div>
                  <span className="text-[9px] font-mono px-2 py-1 rounded bg-purple-500/10 text-cyber-purple border border-purple-500/20">
                    {mod.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-cyber-white mb-2">
                  {mod.title}
                </h3>
                <p className="text-sm text-cyber-gray leading-relaxed">
                  {mod.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section id="pipeline" className="py-24 px-5 md:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyber-cyan mb-3 font-mono">
              Neural_Pipeline
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-cyber-white">
              Static → Motion in{" "}
              <span className="text-cyber-gradient">five stages</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pipeline.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="cyber-panel rounded-xl p-5 text-center relative"
                >
                  <div className="w-8 h-8 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center mx-auto mb-3 text-[10px] font-mono text-cyber-cyan font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-xs font-mono font-bold text-cyber-cyan mb-1">
                    {step.step}
                  </p>
                  <p className="text-[11px] text-cyber-muted">{step.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto cyber-panel rounded-2xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/8 pointer-events-none" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyber-cyan mb-4 font-mono">
              Deploy_Now
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-cyber-white mb-5">
              Ready for the hackathon stage?
            </h2>
            <p className="text-cyber-gray text-lg mb-10 max-w-lg mx-auto">
              Upload a static creative. Get a platform-ready video in under
              three minutes.
            </p>
            <Link href="/studio">
              <Button size="lg" className="shadow-xl shadow-cyan-500/20">
                Launch Studio
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-[11px] font-mono text-cyber-muted">
          AdGPT · Creative Intelligence Platform · Next.js · OpenAI · Remotion ·
          Supabase
        </p>
      </footer>

      <HeroDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </main>
  );
}
