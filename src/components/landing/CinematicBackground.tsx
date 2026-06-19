"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SOURCES = [
  "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_25fps.mp4",
];

export function CinematicBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoActive, setVideoActive] = useState(false);
  const sourceIndex = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
        setVideoActive(true);
      } catch {
        setVideoActive(false);
      }
    };

    const onCanPlay = () => tryPlay();
    const onError = () => {
      sourceIndex.current += 1;
      if (sourceIndex.current < VIDEO_SOURCES.length) {
        video.src = VIDEO_SOURCES[sourceIndex.current];
        video.load();
      } else {
        setVideoActive(false);
      }
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    tryPlay();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="cinematic-bg" aria-hidden="true">
      {/* CSS fallback — always visible, animates when video unavailable */}
      <div className={`cinematic-fallback ${videoActive ? "cinematic-fallback--dim" : ""}`} />

      <video
        ref={videoRef}
        className={`cinematic-video ${videoActive ? "cinematic-video--ready" : ""}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={VIDEO_SOURCES[0]}
      />

      <div className="cinematic-overlay" />
      <div className="cinematic-grain" />
      <div className="cinematic-glow cinematic-glow--cyan" />
      <div className="cinematic-glow cinematic-glow--purple" />
      <div className="cinematic-scanline" />
    </div>
  );
}
