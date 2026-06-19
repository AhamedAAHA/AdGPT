export type MotionType = {
  subject: "slow-zoom" | "3d-rotation" | "light-sweep" | "ken-burns";
  text: "word-reveal" | "bounce" | "typewriter" | "fade-up";
  background: "parallax" | "particles" | "blur-transition" | "static";
  transition: "cut" | "blur" | "glitch-cut" | "slide";
};

export type CaptionData = {
  lines: string[];
  emphasis: string[];
  emoji?: boolean;
  words?: TranscriptWord[];
};

export type TranscriptWord = {
  text: string;
  startMs: number;
  endMs: number;
};

export type VisualSource = "hero" | "broll" | "ai-video" | "typography";

export type BeatVisual = {
  source: VisualSource;
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  brollQuery?: string;
  /** Seconds into the stock clip where this beat should start */
  videoStartAt?: number;
  crop?: { x: number; y: number; width: number; height: number };
};

export type StockClip = {
  id: number;
  url: string;
  thumbnail: string;
  duration: number;
  query: string;
};

export type Beat = {
  id: string;
  role: "hook" | "problem" | "benefit" | "proof" | "cta";
  startMs: number;
  endMs: number;
  headline: string;
  caption: CaptionData;
  motion: MotionType;
  visual?: BeatVisual;
};

export type CreativeAnalysis = {
  product: string;
  audience: string;
  style: string;
  hookType: string;
  colors: string[];
  textRegions: Array<{ x: number; y: number; text: string }>;
  mainSubjectFound: boolean;
  brandColorsExtracted: boolean;
};

export type BrandDna = {
  primary: string;
  secondary: string;
  tone: string;
  voice: string;
  logoUrl?: string;
};

export type HookOption = {
  id: string;
  text: string;
  emoji: string;
  type: string;
};

export type AbVariant = {
  id: string;
  name: string;
  hook: string;
  engagementScore: number;
};

export type VersionStyle =
  | "aggressive-sales"
  | "storytelling"
  | "luxury"
  | "ugc"
  | "viral";

export type VersionOption = {
  id: VersionStyle;
  name: string;
  description: string;
};

export type AudioConfig = {
  voiceOver: {
    enabled: boolean;
    style: "energetic" | "professional" | "storytelling" | "luxury";
    voice: string;
    url?: string;
  };
  music: {
    enabled: boolean;
    mood: "trending" | "cinematic" | "corporate";
    trackId: string;
    volume: number;
    duckUnderVoice: boolean;
    url?: string;
  };
};

export type QualityScores = {
  hook: number;
  clarity: number;
  cta: number;
  brand: number;
  overall: number;
};

export type PlatformPreset =
  | "instagram-reel"
  | "tiktok"
  | "youtube-shorts"
  | "linkedin-ad"
  | "amazon-product";

export type StoryboardPackage = {
  id: string;
  projectId: string;
  durationMs: number;
  aspectRatio: "9:16" | "1:1" | "4:5";
  platform: PlatformPreset;
  analysis: CreativeAnalysis;
  brandDna: BrandDna;
  variant: VersionStyle;
  hook: { text: string; type: string };
  beats: Beat[];
  audio: AudioConfig;
  scores: QualityScores;
  suggestions: string[];
  abVariants: AbVariant[];
  imageUrl: string;
  script: string;
  transcriptWords?: TranscriptWord[];
  stockClips?: StockClip[];
};

export type Project = {
  id: string;
  name: string;
  imageUrl: string;
  script: string;
  storyboard?: StoryboardPackage;
  createdAt: string;
  updatedAt: string;
};

export type RenderJob = {
  id: string;
  projectId: string;
  platform: PlatformPreset;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  outputUrl?: string;
  error?: string;
};

export const PLATFORM_PRESETS: Record<
  PlatformPreset,
  { name: string; aspectRatio: "9:16" | "1:1" | "4:5"; captionSize: number }
> = {
  "instagram-reel": { name: "Instagram Reel", aspectRatio: "9:16", captionSize: 48 },
  tiktok: { name: "TikTok", aspectRatio: "9:16", captionSize: 44 },
  "youtube-shorts": { name: "YouTube Shorts", aspectRatio: "9:16", captionSize: 46 },
  "linkedin-ad": { name: "LinkedIn Ad", aspectRatio: "4:5", captionSize: 36 },
  "amazon-product": { name: "Amazon Product", aspectRatio: "1:1", captionSize: 40 },
};

export const VERSION_OPTIONS: VersionOption[] = [
  { id: "aggressive-sales", name: "Aggressive Sales", description: "Direct offer, urgency-driven" },
  { id: "storytelling", name: "Storytelling", description: "Narrative arc, emotional journey" },
  { id: "luxury", name: "Luxury", description: "Premium tone, aspirational" },
  { id: "ugc", name: "UGC Style", description: "Authentic, casual, relatable" },
  { id: "viral", name: "TikTok Viral", description: "Fast cuts, trend-aware hooks" },
];

export const VOICE_STYLES = [
  { id: "energetic", label: "Energetic", emoji: "🎙" },
  { id: "professional", label: "Professional", emoji: "🎙" },
  { id: "storytelling", label: "Storytelling", emoji: "🎙" },
  { id: "luxury", label: "Luxury", emoji: "🎙" },
] as const;

export const MUSIC_MOODS = [
  { id: "trending", label: "Trending", emoji: "⚡" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬" },
  { id: "corporate", label: "Corporate", emoji: "💼" },
] as const;

export const REMIX_STYLES: VersionStyle[] = [
  "viral",
  "luxury",
  "aggressive-sales",
  "storytelling",
  "ugc",
];
