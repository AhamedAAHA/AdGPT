const VOICE_MAP: Record<string, string> = {
  energetic: "nova",
  professional: "onyx",
  storytelling: "shimmer",
  luxury: "alloy",
};

export function voiceStyleToOpenAI(style: string): string {
  return VOICE_MAP[style] ?? "nova";
}
