import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMs(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)}s`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function isPlaceholderApiKey(key: string | undefined): boolean {
  if (!key) return true;
  return (
    key.includes("your-openai") ||
    key === "sk-your-openai-api-key" ||
    key.length < 20
  );
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 120000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export async function compressImageForApi(
  file: File,
  maxWidth = 1024
): Promise<{ base64: string; mimeType: string }> {
  if (!file.type.startsWith("image/")) {
    const base64 = await fileToBase64(file);
    return { base64, mimeType: file.type };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve({
        base64: dataUrl.split(",")[1] ?? "",
        mimeType: "image/jpeg",
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      fileToBase64(file).then((base64) =>
        resolve({ base64, mimeType: file.type })
      );
    };

    img.src = url;
  });
}

export function parseApiError(message: string): string {
  if (message.includes("ENOTFOUND") || message.includes("Connection error")) {
    return "Cannot reach OpenAI API. Check your internet connection or VPN/firewall.";
  }
  if (message.includes("abort") || message.includes("timed out")) {
    return "Request timed out. OpenAI took too long — try a smaller image or check your connection.";
  }
  if (message.includes("401") || message.includes("Incorrect API key")) {
    return "Invalid OpenAI API key. Update OPENAI_API_KEY in .env.local and restart the dev server.";
  }
  if (message.includes("not configured")) {
    return "OpenAI API key missing. Add OPENAI_API_KEY to .env.local and restart npm run dev.";
  }
  return message;
}
