"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Upload", desc: "Static ad + script" },
  { num: "02", title: "Analyze", desc: "AI scans creative" },
  { num: "03", title: "Storyboard", desc: "Timed beats + motion" },
  { num: "04", title: "Audio", desc: "Voice + music mix" },
  { num: "05", title: "Export", desc: "Platform-ready MP4" },
];

const platforms = [
  "Instagram Reels",
  "TikTok",
  "YouTube Shorts",
  "LinkedIn",
  "Amazon",
];

export function PipelineSection() {
  return (
    <section id="pipeline" className="relative py-28 px-6 md:px-10 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-hero-accent mb-3">
            Pipeline
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-hero-primary">
            Static to motion in{" "}
            <span className="text-gradient-hero">five steps</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-5 rounded-2xl landing-card border border-white/8"
            >
              <span className="text-3xl font-black text-gradient-hero opacity-40 block mb-2">
                {step.num}
              </span>
              <h3 className="text-sm font-bold text-hero-primary mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-hero-muted">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        <div id="platforms">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-hero-muted mb-6">
            Export presets
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 bg-white/4 text-hero-secondary hover:text-hero-accent hover:border-cyan-500/30 transition-colors"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
