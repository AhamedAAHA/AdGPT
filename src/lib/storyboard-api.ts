import type { StoryboardPackage } from "@/types";

/** Strip large base64 image payloads from API requests */
export function slimStoryboardForApi<T extends Partial<StoryboardPackage>>(
  storyboard: T
): Omit<T, "imageUrl"> {
  const { imageUrl: _imageUrl, ...rest } = storyboard;
  return rest;
}
