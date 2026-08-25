import type { CSSProperties } from "react";
import { C, FONT_BODY } from "./theme";

export const inputStyle: CSSProperties = {
  fontFamily: FONT_BODY,
  border: `1px solid ${C.line}`,
  color: C.ink900,
  background: C.surface,
};

/* `text-base` on mobile is deliberate: iOS Safari zooms the page in when a
   focused input renders below 16px. It drops to `text-sm` from `sm:` up.
   `min-h-10` keeps controls comfortably tappable without the extra vertical
   bulk a 44px minimum adds to every field in a long form (spec §29–30). */
export const inputClass =
  "w-full rounded-lg px-3 py-2 text-xs sm:text-sm min-h-10 outline-none transition-colors focus:border-transparent";
