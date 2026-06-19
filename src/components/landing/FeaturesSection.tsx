"use client";

import { motion } from "framer-motion";
import {
  Scan,
  Palette,
  Clapperboard,
  Mic,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Creative Analysis",
    description:
      "Vision scans your static ad — product, audience, colors, and text regions in seconds.",
    accent: "cyan",
  },
  {
    icon: Palette,
    title: "Brand DNA Engine",
    description:
      "Extracts tone, palette, and voice. Every output stays on-brand automatically.",
    accent: "purple",
  },
  {
    icon: Clapperboard,
    title: "Motion Storyboards",
    description:
      "Timed beats with kinetic captions, parallax, and per-scene AI motion presets.",
    accent: "pink",
  },
  {
    icon: Mic,
    title: "Voice & Music",
    description:
      "OpenAI voice-over with mood-matched music beds and automatic ducking.",
    accent: "cyan",
  },
  {
    icon: Smartphone,
    title: "Platform Optimizer",
    description:
      "One storyboard → Reels, TikTok, Shorts, LinkedIn, and Amazon exports.",
    accent: "purple",
  },
];

const accentMap = {
  cyan: "border-cyan-500/20 hover:border-cyan-500/40 group-hover:shadow-cyan-500/10",
  purple: "border-purple-500/20 hover:border-purple-500/40 group-hover:shadow-purple-500/10",
  pink: "border-pink-500/20 hover:border-pink-500/40 group-hover:shadow-pink-500/10",
};

const iconMap = {
  cyan: "text-cyan-400 bg-cyan-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  pink: "text-pink-400 bg-pink-500/10",
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-hero-accent mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-hero-primary mb-4">
            Mission control for{" "}
            <span className="text-gradient-hero">video ads</span>
          </h2>
          <p className="text-hero-secondary text-lg max-w-2xl">
            A broadcast-grade pipeline from static creative to motion deliverable
            — powered by OpenAI, Remotion, and Supabase.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group landing-card p-7 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                accentMap[feature.accent as keyof typeof accentMap]
              } ${i === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                  iconMap[feature.accent as keyof typeof iconMap]
                }`}
              >
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-hero-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-hero-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
