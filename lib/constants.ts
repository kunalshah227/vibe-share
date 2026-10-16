export const CATEGORIES = ["Gaming", "Anime", "Lifestyle", "Tech"] as const;

export type Category = (typeof CATEGORIES)[number];

export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export const ACCEPTED_MIME = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "video/mp4": [".mp4"],
} as const;

export const ACCEPTED_TYPES = Object.keys(ACCEPTED_MIME);
