import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { C, FONT_HEAD, FONT_BODY } from "../../lib/theme";
import HexBadge from "../ui/HexBadge";

interface ModalProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  children: ReactNode;
}

/**
 * Quick Action dialog.
 *
 * On mobile this is a bottom sheet that takes only the height its content
 * needs, capped at 85vh with the body scrolling inside (spec §26–27) — not an
 * automatic full-screen takeover. The header and primary action stay pinned
 * outside the scroll area so both remain reachable on a long form.
 */
export default function Modal({
  title,
  subtitle,
  icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    /* move focus into the dialog so the keyboard and screen reader follow it */
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // return focus to whatever opened the dialog (spec §31)
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(28,27,23,0.45)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="
          w-full flex flex-col outline-none
          max-h-[85vh] rounded-t-2xl
          sm:max-h-[88vh] sm:max-w-140 sm:rounded-2xl
        "
        style={{ background: C.card }}
      >
        {/* grab handle: signals the sheet is dismissible, mobile only */}
        <div
          className="flex justify-center pt-2 pb-1 shrink-0 sm:hidden"
          aria-hidden
        >
          <span
            className="block h-1 w-9 rounded-full"
            style={{ background: C.ink200 }}
          />
        </div>

        <div
          className="flex items-start justify-between gap-3 px-4 pt-2 pb-3 shrink-0 sm:px-6 sm:pt-6 sm:pb-4"
          style={{ borderBottom: `1px solid ${C.line}` }}
        >
          <div className="flex items-center gap-2.5 min-w-0 sm:gap-3">
            <HexBadge icon={icon} className="w-8 h-8 sm:w-[38px] sm:h-[38px]" />
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[15px] font-semibold leading-tight sm:text-base"
                style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
              >
                {title}
              </h2>
              <p
                className="text-[11px] mt-0.5 sm:text-xs"
                style={{ fontFamily: FONT_BODY, color: C.ink600 }}
              >
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full flex items-center justify-center h-9 w-9 -mr-1.5 -mt-1 shrink-0 hover:bg-black/5 transition-colors sm:mt-0"
            aria-label="Close"
          >
            <X size={18} color={C.ink600} />
          </button>
        </div>

        <div className="px-4 py-3 flex-1 overflow-y-auto scroll-touch sm:px-6 sm:py-5">
          {children}
        </div>

        {/* the bottom padding is written out rather than using `py-3` + `safe-b`:
            that utility sets `padding-bottom` outright, so it replaced the
            padding instead of adding to it and collapsed to 0 wherever there is
            no home-indicator inset. Adding the inset to the base spacing keeps
            the buttons clear of the edge on every device.
            The underscores are required: Tailwind turns them into the spaces
            CSS calc() needs around `+`. Removing them yields invalid CSS and
            the rule is silently dropped. */}
        <div
          className="flex items-center justify-end gap-2 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] shrink-0 sm:px-6 sm:pt-4 sm:pb-[calc(1rem_+_env(safe-area-inset-bottom))]"
          style={{ borderTop: `1px solid ${C.line}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 min-h-10 rounded-lg text-[13px] font-medium transition-colors hover:bg-black/5 sm:min-h-11 sm:text-sm"
            style={{
              fontFamily: FONT_BODY,
              color: C.ink700,
              border: `1px solid ${C.line}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 sm:flex-none px-4 py-2 min-h-10 rounded-lg text-[13px] font-semibold transition-transform active:scale-[0.98] sm:min-h-11 sm:text-sm"
            style={{
              fontFamily: FONT_BODY,
              color: C.ink900,
              background: C.brand,
            }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
