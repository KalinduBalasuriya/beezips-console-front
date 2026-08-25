import { useEffect } from "react";
import { X, Droplets } from "lucide-react";
import { shortDate } from "../../lib/format";
import { C, FONT_HEAD, FONT_BODY, FONT_MONO } from "../../lib/theme";
import HexBadge from "../ui/HexBadge";
import type { Sale } from "../../lib/types";

interface FlavorPopupProps {
  sale: Sale | null;
  onClose: () => void;
}

export default function FlavorPopup({ sale, onClose }: FlavorPopupProps) {
  /* Escape closes; the page behind stays put while the sheet is open.
     Declared before the early return so the hook order stays stable. */
  useEffect(() => {
    if (!sale) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sale, onClose]);

  if (!sale) return null;
  const totalLarge = sale.items.reduce((s, i) => s + i.large, 0);
  const totalSmall = sale.items.reduce((s, i) => s + i.small, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4"
      style={{ background: "rgba(28,27,23,0.45)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* full-screen sheet on a phone, centered dialog from `sm` up */}
      <div
        className="w-full h-full flex flex-col rounded-none sm:h-auto sm:max-w-120 sm:max-h-[80vh] sm:rounded-2xl"
        style={{ background: C.card }}
      >
        <div
          className="flex items-start justify-between gap-3 px-4 pt-4 pb-3.5 safe-t shrink-0 sm:px-6 sm:pt-6 sm:pb-4"
          style={{ borderBottom: `1px solid ${C.line}` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <HexBadge icon={Droplets} size={38} />
            <div className="min-w-0">
              <h2 className="text-base font-semibold" style={{ fontFamily: FONT_HEAD, color: C.ink900 }}>
                Flavors issued
              </h2>
              <p className="text-xs mt-0.5" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
                {sale.distributor} · {shortDate(sale.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full flex items-center justify-center h-11 w-11 -mr-2 -mt-1.5 shrink-0 hover:bg-black/5 transition-colors sm:h-9 sm:w-9 sm:mt-0"
            aria-label="Close"
          >
            <X size={18} color={C.ink600} />
          </button>
        </div>

        <div className="px-4 py-4 flex-1 overflow-y-auto scroll-touch safe-b sm:px-6 sm:py-5">
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                <th rowSpan={2} className="text-left font-medium pb-2 pr-2 text-xs uppercase tracking-wide align-bottom">
                  Flavor
                </th>
                <th colSpan={2} className="text-center font-medium pb-1 text-xs uppercase tracking-wide" style={{ borderBottom: `1px solid ${C.line}` }}>
                  Quantity
                </th>
              </tr>
              <tr style={{ color: C.ink400 }}>
                <th className="text-right font-medium pb-2 pt-1 pl-2 text-xs uppercase tracking-wide">Large</th>
                <th className="text-right font-medium pb-2 pt-1 pl-2 text-xs uppercase tracking-wide">Small</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it) => (
                <tr key={it.flavor} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-2.5 pr-2 font-medium" style={{ color: C.ink900 }}>
                    {it.flavor}
                  </td>
                  <td className="py-2.5 pl-2 text-right" style={{ fontFamily: FONT_MONO, color: C.ink700 }}>
                    {it.large}
                  </td>
                  <td className="py-2.5 pl-2 text-right" style={{ fontFamily: FONT_MONO, color: C.ink700 }}>
                    {it.small}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-2.5 pr-2 font-semibold" style={{ color: C.ink900 }}>
                  Total
                </td>
                <td className="py-2.5 pl-2 text-right font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                  {totalLarge}
                </td>
                <td className="py-2.5 pl-2 text-right font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                  {totalSmall}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
