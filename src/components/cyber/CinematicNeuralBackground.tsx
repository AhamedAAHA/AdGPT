"use client";

import { NeuralCanvas } from "./NeuralCanvas";

export function CinematicNeuralBackground() {
  return (
    <div className="cyber-bg" aria-hidden="true">
      <div className="cyber-mesh" />
      <NeuralCanvas />
      <div className="cyber-grid" />
      <div className="cyber-overlay" />
      <div className="cyber-grain" />
      <div className="cyber-vignette" />
      <div className="cyber-scanline" />
    </div>
  );
}
