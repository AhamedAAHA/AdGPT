import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  useRemotionEnvironment,
  Sequence,
} from "remotion";
import { Audio } from "@remotion/media";
import { PlaybackVideo } from "@/remotion/PlaybackVideo";
import { isBlockedStockVideoUrl } from "@/lib/pexels";
import { beatsAreAudioSynced, normalizeBeatsForPlayback } from "@/lib/playback-normalize";
import { buildCaptionPhrases } from "@/lib/caption-phrases";
import { resolveDisplayCaptions } from "@/lib/caption-sync";
import { MIN_BEAT_DURATION_MS } from "@/lib/pacing";
import { resolvePlaybackVideoUrl } from "@/lib/video-url";
import type { Beat, BrandDna, MotionType, TranscriptWord } from "@/types";

export type AdCompositionProps = {
  beats: Beat[];
  imageUrl: string;
  brandDna: BrandDna;
  captionSize?: number;
  voiceOverUrl?: string;
  musicVolume?: number;
  transcriptWords?: TranscriptWord[];
  script?: string;
  voiceOverDurationMs?: number;
};

function useSubjectTransform(
  motion: MotionType["subject"],
  frame: number,
  durationFrames: number
) {
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  switch (motion) {
    case "3d-rotation": {
      const rotateY = interpolate(progress, [0, 1], [-8, 8]);
      const scale = interpolate(progress, [0, 0.5, 1], [1, 1.08, 1.02]);
      return {
        transform: `perspective(800px) rotateY(${rotateY}deg) scale(${scale})`,
        filter: "none",
      };
    }
    case "light-sweep": {
      const scale = interpolate(progress, [0, 1], [1.05, 1.12]);
      return {
        transform: `scale(${scale})`,
        filter: `brightness(${interpolate(progress, [0, 0.5, 1], [0.85, 1.15, 0.95])})`,
      };
    }
    case "ken-burns": {
      const scale = interpolate(progress, [0, 1], [1, 1.2]);
      const x = interpolate(progress, [0, 1], [0, -4]);
      const y = interpolate(progress, [0, 1], [0, -3]);
      return {
        transform: `scale(${scale}) translate(${x}%, ${y}%)`,
        filter: "none",
      };
    }
    case "slow-zoom":
    default: {
      const scale = interpolate(progress, [0, 1], [1, 1.15]);
      return { transform: `scale(${scale})`, filter: "none" };
    }
  }
}

function CaptionLines({
  beat,
  brandDna,
  captionSize,
  frame,
  fps,
  durationFrames,
}: {
  beat: Beat;
  brandDna: BrandDna;
  captionSize: number;
  frame: number;
  fps: number;
  durationFrames: number;
}) {
  const textMotion = beat.motion.text;
  const lines = beat.caption.lines;

  if (textMotion === "typewriter") {
    const fullText = lines.join(" ");
    const charsToShow = Math.floor(
      interpolate(frame, [0, durationFrames * 0.7], [0, fullText.length], {
        extrapolateRight: "clamp",
      })
    );
    return (
      <div
        style={{
          fontSize: captionSize,
          fontWeight: 800,
          color: "#f0f0f5",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {fullText.slice(0, charsToShow)}
        <span style={{ opacity: frame % 15 < 8 ? 1 : 0 }}>|</span>
      </div>
    );
  }

  if (textMotion === "bounce") {
    return (
      <>
        {lines.map((line, i) => {
          const delay = i * 5;
          const bounce = spring({
            frame: frame - delay,
            fps,
            config: { damping: 8, stiffness: 200 },
          });
          const y = interpolate(bounce, [0, 1], [60, 0]);
          return (
            <div
              key={i}
              style={{
                fontSize: captionSize,
                fontWeight: 800,
                color: beat.caption.emphasis.some((e) =>
                  line.toUpperCase().includes(e.toUpperCase())
                )
                  ? brandDna.primary
                  : "#f0f0f5",
                textAlign: "center",
                transform: `translateY(${y}px)`,
                opacity: bounce,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {line}
            </div>
          );
        })}
      </>
    );
  }

  if (textMotion === "word-reveal" && beat.caption.words?.length) {
    const beatStartMs = beat.startMs;
    const currentMs = beatStartMs + (frame / fps) * 1000;
    const visible = beat.caption.words.filter((w) => w.startMs <= currentMs + 200);
    const windowStart = Math.max(0, visible.length - 6);

    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", maxWidth: "90%" }}>
        {beat.caption.words.slice(windowStart, windowStart + 8).map((word, wordIdx) => {
          const isActive = currentMs >= word.startMs && currentMs < word.endMs;
          const isPast = currentMs >= word.endMs;
          return (
            <span
              key={`${word.text}-${word.startMs}-${wordIdx}`}
              style={{
                fontSize: captionSize,
                fontWeight: 800,
                color: isActive ? brandDna.primary : isPast ? "#f0f0f5" : "rgba(240,240,245,0.35)",
                transform: isActive ? "scale(1.08)" : "scale(1)",
                fontFamily: "system-ui, sans-serif",
                transition: "color 0.05s",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  }

  if (textMotion === "word-reveal") {
    return (
      <>
        {lines.map((line, lineIdx) => (
          <div key={lineIdx} style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {line.split(" ").map((word, wordIdx) => {
              const delay = lineIdx * 8 + wordIdx * 4;
              const reveal = spring({
                frame: frame - delay,
                fps,
                config: { damping: 20, stiffness: 120 },
              });
              return (
                <span
                  key={wordIdx}
                  style={{
                    fontSize: captionSize,
                    fontWeight: 800,
                    color: beat.caption.emphasis.some((e) =>
                      word.toUpperCase().includes(e.toUpperCase())
                    )
                      ? brandDna.primary
                      : "#f0f0f5",
                    opacity: reveal,
                    transform: `translateY(${interpolate(reveal, [0, 1], [20, 0])}px)`,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </>
    );
  }

  // fade-up (default)
  const textOpacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const textY = interpolate(textOpacity, [0, 1], [40, 0]);

  return (
    <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: captionSize,
            fontWeight: 800,
            color: beat.caption.emphasis.some((e) =>
              line.toUpperCase().includes(e.toUpperCase())
            )
              ? brandDna.primary
              : "#f0f0f5",
            textAlign: "center",
            lineHeight: 1.2,
            textTransform: "uppercase",
            letterSpacing: 2,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function TypographyScene({
  beat,
  brandDna,
  frame,
  fps,
  durationFrames,
}: {
  beat: Beat;
  brandDna: BrandDna;
  frame: number;
  fps: number;
  durationFrames: number;
}) {
  const progress = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 1.03, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${brandDna.primary}33 0%, #0a0a0f 70%)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          opacity: progress,
          transform: `scale(${progress * pulse})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${brandDna.primary}, #a855f7)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {beat.headline}
        </div>
        {beat.caption.lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#f0f0f5",
              opacity: interpolate(frame, [10 + i * 8, 20 + i * 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function MotionFallbackBackground({
  frame,
  durationFrames,
  accentColor,
}: {
  frame: number;
  durationFrames: number;
  accentColor: string;
}) {
  const drift = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${120 + drift * 60}deg, #0a0a0f 0%, ${accentColor}33 45%, #0a0a0f 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at ${20 + drift * 50}% ${25 + (frame % 40)}%, ${accentColor}55 0%, transparent 45%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at ${70 - drift * 30}% ${65 + (frame % 30)}%, rgba(168,85,247,0.35) 0%, transparent 40%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function AmbientBackground({ accentColor }: { accentColor: string }) {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, #0a0a0f 0%, ${accentColor}22 45%, #12121a 100%)`,
      }}
    />
  );
}

function BrollClip({
  beat,
  beatIndex,
  accentColor,
  fps,
}: {
  beat: Beat;
  beatIndex: number;
  accentColor: string;
  fps: number;
}) {
  const frame = useCurrentFrame();
  const durationFrames = Math.max(
    1,
    Math.round(((beat.endMs - beat.startMs) / 1000) * fps)
  );

  const subjectStyle = useSubjectTransform(
    beat.motion.subject,
    frame,
    durationFrames
  );

  const parallaxOffset =
    beat.motion.background === "parallax"
      ? interpolate(frame, [0, durationFrames], [0, -30])
      : 0;

  const visual = beat.visual;
  const env = useRemotionEnvironment();
  const rawUrl =
    visual?.videoUrl && !isBlockedStockVideoUrl(visual.videoUrl)
      ? visual.videoUrl
      : null;
  const videoUrl = rawUrl
    ? resolvePlaybackVideoUrl(rawUrl, {
        forExport: env.isClientSideRendering,
        beatIndex,
        exportOrigin:
          typeof window !== "undefined" ? window.location.origin : undefined,
      })
    : null;
  const trimBeforeFrames = Math.round((visual?.videoStartAt ?? 0) * fps);

  return (
    <AbsoluteFill
      style={{
        transform: `${subjectStyle.transform} translateY(${parallaxOffset * 0.3}px)`,
        transformOrigin: "center center",
        filter: subjectStyle.filter,
        overflow: "hidden",
      }}
    >
      <MotionFallbackBackground
        frame={frame}
        durationFrames={durationFrames}
        accentColor={accentColor}
      />

      {videoUrl ? (
        <PlaybackVideo
          src={videoUrl}
          trimBefore={trimBeforeFrames}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          zIndex: 2,
          pointerEvents: "none",
          background:
            beat.motion.background === "blur-transition"
              ? "linear-gradient(to bottom, transparent 55%, rgba(10,10,15,0.5) 100%)"
              : "linear-gradient(to bottom, transparent 60%, rgba(10,10,15,0.35) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

function BeatOverlay({
  beat,
  brandDna,
  captionSize = 48,
  hideCaptions = false,
}: {
  beat: Beat;
  brandDna: BrandDna;
  captionSize?: number;
  hideCaptions?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = Math.max(
    1,
    Math.round(((beat.endMs - beat.startMs) / 1000) * fps)
  );

  const badgeOpacity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const isTypography = beat.visual?.source === "typography";

  if (isTypography) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
        <TypographyScene
          beat={beat}
          brandDna={brandDna}
          frame={frame}
          fps={fps}
          durationFrames={durationFrames}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {beat.motion.background === "particles" && (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(circle at ${20 + (frame % 60)}% ${30 + (frame % 40)}%, rgba(0,245,255,0.15) 0%, transparent 50%)`,
          }}
        />
      )}

      {beat.motion.subject === "light-sweep" && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(105deg, transparent ${interpolate(frame, [0, durationFrames], [30, 70])}%, rgba(255,255,255,0.12) ${interpolate(frame, [0, durationFrames], [35, 75])}%, transparent ${interpolate(frame, [0, durationFrames], [40, 80])}%)`,
            pointerEvents: "none",
          }}
        />
      )}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 120,
        }}
      >
        {!hideCaptions && (
          <CaptionLines
            beat={beat}
            brandDna={brandDna}
            captionSize={captionSize}
            frame={frame}
            fps={fps}
            durationFrames={durationFrames}
          />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: 24,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${brandDna.primary}, #a855f7)`,
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: 1,
            opacity: badgeOpacity,
          }}
        >
          {beat.role}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function PhraseCaptionsOverlay({
  words,
  brandDna,
  captionSize,
}: {
  words: TranscriptWord[];
  brandDna: BrandDna;
  captionSize: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const phrases = useMemo(() => buildCaptionPhrases(words, 4), [words]);

  const activePhraseIndex = useMemo(() => {
    for (let i = phrases.length - 1; i >= 0; i--) {
      if (currentMs >= phrases[i].startMs - 120) return i;
    }
    return -1;
  }, [phrases, currentMs]);

  if (activePhraseIndex < 0) return null;

  const activePhrase = phrases[activePhraseIndex];
  const phraseProgress = interpolate(
    currentMs,
    [activePhrase.startMs, activePhrase.endMs],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        paddingLeft: 40,
        paddingRight: 40,
        pointerEvents: "none",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            gap: "12px 16px",
            padding: "24px 32px",
            borderRadius: 20,
            background: "rgba(8, 8, 14, 0.82)",
            border: `2px solid ${brandDna.primary}55`,
            boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px ${brandDna.primary}22 inset`,
          }}
        >
          {activePhrase.words.map((word, i) => {
            const isActive =
              currentMs >= word.startMs - 40 && currentMs < word.endMs + 60;
            const isPast = currentMs >= word.endMs + 60;
            const scale = isActive ? 1.12 : 1;

            return (
              <span
                key={`${word.text}-${word.startMs}-${i}`}
                style={{
                  display: "inline-block",
                  transform: `scale(${scale})`,
                  transformOrigin: "center bottom",
                  fontSize: isActive
                    ? Math.round(captionSize * 1.05)
                    : Math.round(captionSize * 0.88),
                  fontWeight: isActive ? 900 : 600,
                  color: isActive
                    ? "#ffffff"
                    : isPast
                      ? "rgba(255,255,255,0.92)"
                      : "rgba(255,255,255,0.38)",
                  textShadow: isActive
                    ? `0 0 24px ${brandDna.primary}, 0 2px 8px rgba(0,0,0,0.9)`
                    : "0 2px 10px rgba(0,0,0,0.85)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  letterSpacing: isActive ? 0.5 : 0.2,
                  transition: "color 0.05s linear",
                  background: isActive
                    ? `linear-gradient(180deg, ${brandDna.primary}44, ${brandDna.primary}22)`
                    : "transparent",
                  padding: isActive ? "2px 10px" : "2px 4px",
                  borderRadius: isActive ? 8 : 0,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 10,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${phraseProgress * 100}%`,
              background: `linear-gradient(90deg, ${brandDna.primary}, #a855f7)`,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const AdComposition: React.FC<AdCompositionProps> = ({
  beats,
  imageUrl,
  brandDna,
  captionSize = 48,
  voiceOverUrl,
  musicVolume = 0,
  transcriptWords = [],
  script,
  voiceOverDurationMs,
}) => {
  const { fps } = useVideoConfig();
  const phraseWords = useMemo(
    () =>
      resolveDisplayCaptions(
        script,
        transcriptWords,
        beats,
        voiceOverDurationMs ?? 0
      ),
    [script, transcriptWords, beats, voiceOverDurationMs]
  );
  const showPhraseCaptions = phraseWords.length > 0;
  const lockTimeline =
    showPhraseCaptions || beatsAreAudioSynced(beats);
  const playbackBeats = normalizeBeatsForPlayback(beats, { lockTimeline });
  const premountFrames = fps * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      <AmbientBackground accentColor={brandDna.primary} />
      {voiceOverUrl && <Audio src={voiceOverUrl} volume={1} />}
      {playbackBeats.map((beat, beatIndex) => {
        if (beat.visual?.source === "typography") return null;

        const startFrame = Math.round((beat.startMs / 1000) * fps);
        const durationFrames = Math.max(
          1,
          Math.round(((beat.endMs - beat.startMs) / 1000) * fps)
        );

        return (
          <Sequence
            key={`broll-${beat.id}`}
            from={startFrame}
            durationInFrames={durationFrames}
            premountFor={premountFrames}
          >
            <BrollClip
              beat={beat}
              beatIndex={beatIndex}
              accentColor={brandDna.primary}
              fps={fps}
            />
          </Sequence>
        );
      })}
      {playbackBeats.map((beat) => {
        const startFrame = Math.round((beat.startMs / 1000) * fps);
        const durationFrames = Math.max(
          1,
          Math.round(((beat.endMs - beat.startMs) / 1000) * fps)
        );

        return (
          <Sequence
            key={`overlay-${beat.id}`}
            from={startFrame}
            durationInFrames={durationFrames}
            premountFor={fps}
          >
            <BeatOverlay
              beat={beat}
              brandDna={brandDna}
              captionSize={captionSize}
              hideCaptions={showPhraseCaptions}
            />
          </Sequence>
        );
      })}
      {showPhraseCaptions && (
        <PhraseCaptionsOverlay
          words={phraseWords}
          brandDna={brandDna}
          captionSize={captionSize}
        />
      )}
    </AbsoluteFill>
  );
};

export const AD_COMPOSITION_ID = "AdComposition";
