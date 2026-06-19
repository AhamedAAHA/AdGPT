"use client";

import { CinematicNeuralBackground } from "./CinematicNeuralBackground";
import { CyberNavbar } from "./CyberNavbar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  return (
    <>
      <CinematicNeuralBackground />
      {!isStudio && <CyberNavbar />}
      <div
        className={cn(
          "relative z-10",
          isStudio ? "h-dvh overflow-hidden" : "min-h-screen"
        )}
      >
        {children}
      </div>
    </>
  );
}
