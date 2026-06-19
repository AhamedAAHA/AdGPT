"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="relative py-32 px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center landing-card border border-cyan-500/15 rounded-3xl p-12 md:p-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/8 pointer-events-none" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-hero-accent mb-4">
            Get started
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-hero-primary mb-5">
            Ready to transform your ads?
          </h2>
          <p className="text-hero-secondary text-lg mb-10 max-w-lg mx-auto">
            Upload a static creative and get a platform-ready video in under
            three minutes.
          </p>
          <Link href="/studio">
            <Button size="lg" className="shadow-xl shadow-purple-500/15">
              Launch Studio
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 py-10 px-6 text-center">
      <p className="text-xs text-hero-muted">
        AdGPT · International Hackathon · Next.js · OpenAI · Remotion · Supabase
      </p>
    </footer>
  );
}
