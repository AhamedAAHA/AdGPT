import { getOpenAI } from "./openai";
import { prepareScriptForTts } from "@/lib/transcript-reconcile";
import { TTS_SPEECH_SPEED } from "@/lib/pacing";
import type {
  CreativeAnalysis,
  BrandDna,
  HookOption,
  StoryboardPackage,
  VersionStyle,
  QualityScores,
  AbVariant,
  Beat,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

const ANALYSIS_PROMPT = `You are an expert ad creative analyst. Analyze the uploaded static advertisement image and return a JSON object with:
{
  "product": "detected product or service name",
  "audience": "target audience description",
  "style": "recommended style e.g. Energetic / Premium",
  "hookType": "recommended hook type e.g. Problem → Solution",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "textRegions": [{"x": 0.1, "y": 0.8, "text": "detected text"}],
  "mainSubjectFound": true,
  "brandColorsExtracted": true
}
Return ONLY valid JSON, no markdown.`;

const HOOKS_PROMPT = `Generate 3 compelling video ad hooks for a short-form vertical video (15-30s).
Return JSON array:
[{"id": "hook-1", "text": "hook text", "emoji": "🔥", "type": "problem-solution"}]
Make hooks scroll-stopping for Reels/Shorts. Return ONLY valid JSON.`;

const STORYBOARD_PROMPT = `Create a video storyboard for a vertical ad (9:16). Match the script length — use 5-6 beats, each at least 5 seconds. Do NOT compress into 20 seconds if the script is longer.
Return JSON:
{
  "beats": [
    {
      "id": "hook",
      "role": "hook",
      "startMs": 0,
      "endMs": 3000,
      "headline": "text",
      "caption": {"lines": ["LINE1", "LINE2"], "emphasis": ["WORD"], "emoji": false},
      "motion": {"subject": "slow-zoom", "text": "word-reveal", "background": "parallax", "transition": "blur"}
    }
  ],
  "suggestions": ["AI tip about timing"],
  "abVariants": [
    {"id": "emotional", "name": "Emotional", "hook": "text", "engagementScore": 87},
    {"id": "discount", "name": "Discount", "hook": "text", "engagementScore": 79},
    {"id": "curiosity", "name": "Curiosity", "hook": "text", "engagementScore": 91}
  ]
}
Roles: hook, problem, benefit, proof, cta. Spread beats evenly; each beat 5000-15000ms depending on script.
Motion options - subject: slow-zoom|3d-rotation|light-sweep|ken-burns, text: word-reveal|bounce|typewriter|fade-up, background: parallax|particles|blur-transition|static
Return ONLY valid JSON.`;

const SCORE_PROMPT = `Score this video storyboard for short-form ad quality (0-100 each).
Return JSON: {"hook": 90, "clarity": 82, "cta": 88, "brand": 95, "overall": 89}
Return ONLY valid JSON.`;

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function analyzeCreative(
  imageBase64: string,
  mimeType: string
): Promise<CreativeAnalysis> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: ANALYSIS_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return parseJSON<CreativeAnalysis>(content);
}

export async function extractBrandDna(
  imageBase64: string,
  mimeType: string,
  analysis: CreativeAnalysis
): Promise<BrandDna> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract brand DNA from this ad. Analysis: ${JSON.stringify(analysis)}. Return JSON: {"primary": "#hex", "secondary": "#hex", "tone": "luxury|playful|corporate|energetic", "voice": "confident|friendly|authoritative|casual"}. Return ONLY valid JSON.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return parseJSON<BrandDna>(content);
}

export async function generateHooks(
  analysis: CreativeAnalysis,
  script: string
): Promise<HookOption[]> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `${HOOKS_PROMPT}\n\nProduct: ${analysis.product}\nAudience: ${analysis.audience}\nScript: ${script}\nHook type: ${analysis.hookType}`,
      },
    ],
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? '{"hooks":[]}';
  const parsed = parseJSON<{ hooks?: HookOption[] } | HookOption[]>(content);
  if (Array.isArray(parsed)) return parsed;
  return parsed.hooks ?? [];
}

export async function generateStoryboard(
  analysis: CreativeAnalysis,
  brandDna: BrandDna,
  script: string,
  hook: HookOption,
  variant: VersionStyle,
  imageUrl: string
): Promise<StoryboardPackage> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `${STORYBOARD_PROMPT}\n\nProduct: ${analysis.product}\nAudience: ${analysis.audience}\nStyle: ${analysis.style}\nBrand tone: ${brandDna.tone}\nBrand voice: ${brandDna.voice}\nPrimary color: ${brandDna.primary}\nScript: ${script}\nSelected hook: ${hook.text}\nVersion style: ${variant}`,
      },
    ],
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = parseJSON<{
    beats: Beat[];
    suggestions: string[];
    abVariants: AbVariant[];
  }>(content);

  const scores = await scoreStoryboard(parsed.beats, analysis);

  return {
    id: uuidv4(),
    projectId: "",
    durationMs: parsed.beats[parsed.beats.length - 1]?.endMs ?? 20000,
    aspectRatio: "9:16",
    platform: "instagram-reel",
    analysis,
    brandDna,
    variant,
    hook: { text: hook.text, type: hook.type },
    beats: parsed.beats,
    audio: {
      voiceOver: {
        enabled: true,
        style: "energetic",
        voice: "nova",
      },
      music: {
        enabled: true,
        mood: "trending",
        trackId: "upbeat-01",
        volume: 0.25,
        duckUnderVoice: true,
      },
    },
    scores,
    suggestions: parsed.suggestions ?? [],
    abVariants: parsed.abVariants ?? [],
    imageUrl,
    script,
  };
}

async function scoreStoryboard(
  beats: Beat[],
  analysis: CreativeAnalysis
): Promise<QualityScores> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `${SCORE_PROMPT}\n\nBeats: ${JSON.stringify(beats)}\nProduct: ${analysis.product}`,
      },
    ],
    max_tokens: 200,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return parseJSON<QualityScores>(content);
}

export async function generateVoiceOver(
  text: string,
  voice: string = "nova"
): Promise<Buffer> {
  const openai = getOpenAI();

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: voice as "nova" | "alloy" | "echo" | "fable" | "onyx" | "shimmer",
    input: prepareScriptForTts(text),
    speed: TTS_SPEECH_SPEED,
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getTimelineSuggestion(
  beats: Beat[],
  platform: string
): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Review this video timeline for ${platform}. Beats: ${JSON.stringify(beats.map((b) => ({ role: b.role, start: b.startMs, end: b.endMs })))}. Give ONE actionable suggestion in under 20 words. Return JSON: {"suggestion": "text"}`,
      },
    ],
    max_tokens: 100,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = parseJSON<{ suggestion: string }>(content);
  return parsed.suggestion;
}
