export function isReplicateConfigured(): boolean {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  return Boolean(token && !token.includes("your-"));
}

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
};

async function pollPrediction(
  id: string,
  token: string,
  maxAttempts = 60
): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as ReplicatePrediction;
    if (data.status === "succeeded") {
      if (typeof data.output === "string") return data.output;
      if (Array.isArray(data.output)) return data.output[0] ?? null;
      return null;
    }
    if (data.status === "failed" || data.status === "canceled") return null;

    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

/** Image-to-video via Replicate (Stable Video Diffusion). Returns null if unavailable. */
export async function generateImageToVideo(
  imageUrl: string,
  prompt?: string
): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!isReplicateConfigured() || !token) return null;

  try {
    const createRes = await fetch(
      "https://api.replicate.com/v1/models/stability-ai/stable-video-diffusion/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            input_image: imageUrl,
            video_length: "25_frames_with_svd_xt",
            sizing_strategy: "maintain_aspect_ratio",
            frames_per_second: 6,
            motion_bucket_id: 127,
            cond_aug: 0.02,
          },
        }),
      }
    );

    if (!createRes.ok) return null;

    const prediction = (await createRes.json()) as ReplicatePrediction;
    if (prediction.status === "succeeded" && prediction.output) {
      return typeof prediction.output === "string"
        ? prediction.output
        : prediction.output[0] ?? null;
    }

    if (prediction.id) {
      return pollPrediction(prediction.id, token);
    }
  } catch (e) {
    console.warn("Image-to-video failed:", e);
  }

  return null;
}
