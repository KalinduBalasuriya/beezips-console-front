"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";

export interface BreakdownRow {
  label: string;
  /** already formatted — the caller owns units and separators */
  value: string;
}

interface HoverBreakdownProps {
  /** what the cell itself shows: a figure, or a "View" affordance */
  trigger: ReactNode;
  /** heading above the rows, e.g. "Large bottles by flavor" */
  title: string;
  rows: BreakdownRow[];
  /** optional footer line, shown as a Total row */
  total?: string;
  /** label for the total row; ignored when `total` is absent */
  totalLabel?: string;
  /** describes the trigger for screen readers */
  ariaLabel: string;
  /** which edge the panel is pinned to — `right` keeps trailing columns on screen */
  align?: "left" | "right";
  /** styling hook for the trigger button */
  triggerClassName?: string;
}

/**
 * A figure (or button) in a table cell that reveals a small breakdown table.
 *
 * Opens on hover only where the pointer really supports it and on tap
 * everywhere — touch devices never fire mouseenter/mouseleave reliably, so
 * hover alone would put this content out of reach on a phone. Dismisses on an
 * outside tap or Escape. Once open the panel is nudged back inside the
 * viewport, because a trigger near the right edge of a narrow screen — the
 * bottle columns in the production cards — would otherwise push it off-screen.
 * Same interaction as FlavorHoverCell and the dashboard stat cards, kept in one
 * place because the production log needs four of them in a single row.
 */
export default function HoverBreakdown({
  trigger,
  title,
  rows,
  total,
  totalLabel = "Total",
  ariaLabel,
  align = "left",
  triggerClassName = "",
}: HoverBreakdownProps) {
  const [show, setShow] = useState(false);
  /** viewport coordinates for the panel; null until it has been measured */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /** breathing room kept between the panel and the edges of the viewport */
  const EDGE = 8;
  /** distance between the trigger and the panel */
  const GAP = 8;

  const place = useCallback(() => {
    const wrap = wrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;
    const t = wrap.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = panel;
    /* clientWidth, not innerWidth, so a desktop scrollbar is not counted */
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    /* where the requested alignment puts it, then pulled back inside */
    let left = align === "right" ? t.right - w : t.left;
    left = Math.max(EDGE, Math.min(left, vw - EDGE - w));

    /* below the trigger, unless that runs off the bottom and there is room above */
    let top = t.bottom + GAP;
    if (top + h > vh - EDGE && t.top - GAP - h > EDGE) top = t.top - GAP - h;

    setPos({ top, left });
  }, [align]);

  /* a ref callback rather than an effect: it runs before paint, so the panel
     is placed in the same frame it appears in */
  const attachPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (node) place();
    },
    [place],
  );

  /* a fixed panel does not travel with the page, so follow the trigger while
     it is open; capture picks up scrolling containers, not just the window */
  useEffect(() => {
    if (!show) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [show, place]);

  useEffect(() => {
    if (!show) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShow(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  const hoverCapable = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  return (
    <div
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => hoverCapable() && setShow(true)}
      onMouseLeave={() => hoverCapable() && setShow(false)}
    >
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-expanded={show}
        aria-controls={show ? panelId : undefined}
        aria-label={ariaLabel}
        className={`text-left border-b border-dotted py-1.5 -my-1 ${triggerClassName}`}
        style={{ color: C.ink600, borderColor: C.ink400 }}
      >
        {trigger}
      </button>

      {show && (
        <div
          id={panelId}
          ref={attachPanel}
          /* fixed, not absolute: `body` clips horizontal overflow, so a panel
             anchored inside the card is cut off at the edge of a phone screen */
          className="fixed z-50 rounded-xl p-3 min-w-[220px] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-1rem)] overflow-auto scroll-touch"
          style={{
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            /* hidden for the measuring pass only; it is placed before paint */
            visibility: pos ? "visible" : "hidden",
            background: C.card,
            border: `1px solid ${C.line}`,
            boxShadow: "0 8px 24px rgba(28,27,23,0.12)",
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wide mb-1.5"
            style={{ fontFamily: FONT_BODY, color: C.ink600 }}
          >
            {title}
          </p>

          {rows.length === 0 ? (
            <p className="text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
              No breakdown available.
            </p>
          ) : (
            <table className="w-full text-xs" style={{ fontFamily: FONT_BODY }}>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td
                      className="py-1.5 pr-4 font-medium whitespace-nowrap"
                      style={{ color: C.ink900 }}
                    >
                      {r.label}
                    </td>
                    <td
                      className="py-1.5 text-right whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: C.ink700 }}
                    >
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
              {total !== undefined && (
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="py-1.5 pr-4 font-semibold" style={{ color: C.ink900 }}>
                      {totalLabel}
                    </td>
                    <td
                      className="py-1.5 text-right font-semibold whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {total}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      )}
    </div>
  );
}
