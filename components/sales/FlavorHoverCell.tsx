import { useEffect, useRef, useState } from "react";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { money } from "../../lib/format";
import type { Sale } from "../../lib/types";

interface FlavorHoverCellProps {
  sale: Sale;
}

/**
 * Shows the flavor names in the cell; a tooltip lists each flavor with its
 * quantity | unit price for both the Small and Large bottle sizes.
 *
 * Opens on hover where the device actually has a hover-capable pointer, and on
 * tap everywhere — touch devices never fire mouseenter/mouseleave reliably, so
 * hover alone would make this content unreachable on a phone.
 */
export default function FlavorHoverCell({ sale }: FlavorHoverCellProps) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* tapping anywhere else (or Escape) dismisses the tooltip */
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
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

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
        className="text-left border-b border-dotted py-1.5 -my-1"
        style={{ color: C.ink600, borderColor: C.ink400 }}
      >
        {sale.items.map((i) => i.flavor).join(", ")}
      </button>
      {show && (
        <div
          className="absolute z-50 top-full left-0 mt-2 rounded-xl p-3 min-w-[240px] max-w-[calc(100vw-2.5rem)] overflow-x-auto scroll-touch"
          style={{
            background: C.card,
            border: `1px solid ${C.line}`,
            boxShadow: "0 8px 24px rgba(28,27,23,0.12)",
          }}
        >
          <table className="w-full text-xs" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                <th className="text-left font-medium pb-1.5 pr-3">Flavor</th>
                <th className="text-right font-medium pb-1.5 px-2">Small</th>
                <th className="text-right font-medium pb-1.5 pl-2">Large</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it) => (
                <tr
                  key={it.flavor}
                  style={{ borderTop: `1px solid ${C.line}` }}
                >
                  <td
                    className="py-1.5 pr-3 font-medium whitespace-nowrap"
                    style={{ color: C.ink900 }}
                  >
                    {it.flavor}
                  </td>
                  <td
                    className="py-1.5 px-2 text-right whitespace-nowrap"
                    style={{ fontFamily: FONT_MONO, color: C.ink700 }}
                  >
                    {it.small} |{money(sale.smallPrice)}
                  </td>
                  <td
                    className="py-1.5 pl-2 text-right whitespace-nowrap"
                    style={{ fontFamily: FONT_MONO, color: C.ink700 }}
                  >
                    {it.large} |{money(sale.largePrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
