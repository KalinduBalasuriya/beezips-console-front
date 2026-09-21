import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { C, FONT_HEAD, FONT_BODY } from "../../lib/theme";
import HexBadge from "./HexBadge";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  sub: string;
  onClick: () => void;
  /** grid placement hook, e.g. spanning both columns on a phone */
  className?: string;
}

export default function QuickAction({
  icon,
  label,
  sub,
  onClick,
  className = "",
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl p-3 min-h-11 text-left transition-shadow hover:shadow-sm w-full sm:gap-3 sm:rounded-2xl sm:p-4 sm:min-h-16 ${className}`}
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <HexBadge icon={icon} className="w-8 h-8 sm:w-9 sm:h-9" />
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold leading-tight sm:text-sm"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          {label}
        </p>
        {/* the description is nice-to-have context, not the action itself —
            dropped on phones so four actions fit in two short rows */}
        <p
          className="hidden sm:block text-xs mt-0.5"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          {sub}
        </p>
      </div>
      <Plus size={15} color={C.ink400} className="hidden sm:block shrink-0" />
    </button>
  );
}
