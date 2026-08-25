import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox } from "lucide-react";
import { C, FONT_BODY } from "../../lib/theme";

/** Shimmer placeholder used while a section's data resolves. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded animate-pulse ${className}`}
      style={{ background: C.line }}
    />
  );
}

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  /** shown under the message, e.g. how to add the first record */
  hint?: string;
}

/** Neutral "nothing here yet" panel — never an empty broken table (spec §34). */
export function EmptyState({ message, icon: Icon = Inbox, hint }: EmptyStateProps) {
  return (
    <div
      className="rounded-xl px-4 py-6 text-center sm:rounded-2xl sm:py-8"
      style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
    >
      <Icon size={20} color={C.ink400} className="mx-auto mb-2" aria-hidden />
      <p className="text-[13px] font-medium" style={{ color: C.ink700 }}>
        {message}
      </p>
      {hint && (
        <p className="text-xs mt-1" style={{ color: C.ink400 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Failure panel with a retry affordance (spec §35). */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl px-4 py-5 text-center sm:rounded-2xl sm:py-6"
      style={{ background: C.dangerBg, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
    >
      <AlertTriangle size={20} color={C.danger} className="mx-auto mb-2" aria-hidden />
      <p className="text-[13px] font-medium" style={{ color: C.danger }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg px-3 py-2 min-h-11 text-xs font-semibold sm:min-h-0 sm:py-1.5"
          style={{ background: C.card, color: C.ink900, border: `1px solid ${C.line}` }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
