import type { CSSProperties } from "react";

/* ---------- design tokens ---------- */
export const C = {
  brand: "#FFCD34",
  brandDark: "#E3B300",
  brandInk: "#4A3B00",
  ink900: "#1C1B17",
  ink700: "#3B372E",
  ink600: "#6B6558",
  ink400: "#A39C8C",
  ink200: "#DEDACE",
  surface: "#FAF9F5",
  card: "#FFFFFF",
  line: "#ECE7DC",
  success: "#2E7D4F",
  successBg: "#E7F3EA",
  danger: "#C4472B",
  dangerBg: "#FBEAE3",
  info: "#3A6EA5",
  infoBg: "#E7EFF7",
} as const;

export const FONT_HEAD = "'Sora', 'Segoe UI', sans-serif";
export const FONT_BODY = "'Inter', 'Segoe UI', sans-serif";
export const FONT_MONO = "'JetBrains Mono', 'Courier New', monospace";

/* honeycomb hexagon clip-path, used by HexBadge and small brand accents */
export const hexClip: CSSProperties = {
  clipPath: "polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)",
};
