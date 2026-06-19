"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEMO_STEPS = [
  { label: "Upload static ad", detail: "Product creative detected" },
  { label: "AI creative analysis", detail: "Audience · Colors · Hook type" },
  { label: "Generate storyboard", detail: "Hook → Benefit → Proof → CTA" },
  { label: "Add voice + captions", detail: "Kinetic text · Music bed" },
  { label: "Export for Reels", detail: "9:16 · Ready to upload" },
];

interface HeroDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeroDemoModal({ isOpen, onClose }: HeroDemoModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((s) => (s < DEMO_STEPS.length - 1 ? s + 1 : s));
    }, 1400);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="landing-card border border-cyan-500/20 rounded-3xl p-8 max-w-lg w-full space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-cyan-400" size={20} />
                <h2 className="text-lg font-bold">How AdGPT Works</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close demo"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-[9/14] max-h-[280px] mx-auto rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#0a0a0f]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/60" />

              <div className="absolute inset-0 flex flex-col justify-end p-4 space-y-1">
                {activeStep >= 2 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-black uppercase tracking-wide text-cyan-400"
                  >
                    RUN FASTER.
                  </motion.p>
                )}
                {activeStep >= 2 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg font-black uppercase tracking-wide text-white"
                  >
                    FEEL LIGHTER.
                  </motion.p>
                )}
                {activeStep >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 inline-flex self-start px-3 py-1 rounded-lg neon-gradient text-xs font-bold"
                  >
                    SHOP NOW
                  </motion.div>
                )}
              </div>

              {activeStep < 2 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {DEMO_STEPS.map((step, i) => {
                const done = i <= activeStep;
                const current = i === activeStep;

                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      current ? "bg-cyan-500/10 border border-cyan-500/20" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        done
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-white/5 text-muted"
                      }`}
                    >
                      {done ? <Check size={12} /> : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.label}</p>
                      {current && (
                        <p className="text-xs text-muted">{step.detail}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Link href="/studio" onClick={onClose}>
              <Button className="w-full" size="lg">
                Try it yourself
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
