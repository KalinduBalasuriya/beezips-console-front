import type { LucideIcon } from "lucide-react";
import { C, hexClip } from "../../lib/theme";

interface HexBadgeProps {
  icon: LucideIcon;
  bg?: string;
  fg?: string;
  size?: number;
  /** Tailwind sizing (e.g. `w-8 h-8 sm:w-10 sm:h-10`) for badges that need to
   *  shrink on mobile. When given it replaces the fixed `size` px box. */
  className?: string;
}

export default function HexBadge({ icon: Icon, bg = C.brand, fg = C.ink900, size = 40, className }: HexBadgeProps) {
  const responsive = Boolean(className);
  return (
    <div
      style={{ ...hexClip, background: bg, ...(responsive ? {} : { width: size, height: size }) }}
      className={`flex items-center justify-center shrink-0 ${className ?? ""}`}
    >
      <Icon
        {...(responsive
          ? { className: "w-[45%] h-[45%]" }
          : { size: Math.round(size * 0.45) })}
        color={fg}
        strokeWidth={2.2}
      />
    </div>
  );
}
