"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { finishedStock, finishedStockByFlavor } from "../../lib/selectors";
import { qty as fmtQty } from "../../lib/format";
import { ROUTES } from "../../lib/routes";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import HexBadge from "../ui/HexBadge";
import { Skeleton } from "../ui/States";
import type { BottleSize, LoadState } from "../../lib/types";

interface FinishedStockStatCardProps {
  state: LoadState;
  sub?: string;
  className?: string;
}

/**
 * Finished bottles currently in stock, split into Large and Small, with a
 * per-flavor breakdown behind either figure.
 *
 * Unlike the produced and sold cards this one takes no date range: stock is a
 * level, not a flow — it is what sits on the shelf now, whatever month it is.
 * The interaction copies those cards so the three read as one family.
 */
export default function FinishedStockStatCard({
  state,
  sub,
  className = "",
}: FinishedStockStatCardProps) {
  const [openSize, setOpenSize] = useState<BottleSize | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openSize) return;
    const onDown = (e: PointerEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setOpenSize(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSize(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openSize]);

  const hoverCapable = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const loading = state !== "ready";
  const totals = finishedStock();
  const byFlavor = finishedStockByFlavor();

  const key = (size: BottleSize) => (size === "LARGE" ? "large" : "small") as "large" | "small";

  const figure = (size: BottleSize, label: string) => {
    const value = totals[key(size)];
    const open = openSize === size;

    return (
      <span className="inline-flex items-baseline gap-1">
        <button
          type="button"
          onClick={() => setOpenSize(open ? null : size)}
          onMouseEnter={() => hoverCapable() && setOpenSize(size)}
          onMouseLeave={() => hoverCapable() && setOpenSize(null)}
          aria-expanded={open}
          aria-label={`${label} bottles in stock, ${fmtQty(value)}. Show breakdown by flavor`}
          className="text-lg font-semibold border-b border-dotted -mb-px sm:text-2xl"
          style={{ fontFamily: FONT_MONO, color: C.ink900, borderColor: C.ink400 }}
        >
          {fmtQty(value)}
        </button>
        <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
          {label}
        </span>
      </span>
    );
  };

  const breakdown = (size: BottleSize, label: string) => {
    const value = totals[key(size)];
    const rows = byFlavor.filter((f) => f[key(size)] > 0);

    return (
      /* spans the card's own width, so the panel can never push past the
         viewport on a narrow two-up phone grid */
      <div
        className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl p-3"
        style={{
          background: C.card,
          border: `1px solid ${C.line}`,
          boxShadow: "0 8px 24px rgba(28,27,23,0.12)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-wide mb-1.5"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          {label} bottles in stock
        </p>
        {rows.length === 0 ? (
          <p className="text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            No finished stock available.
          </p>
        ) : (
          <table className="w-full text-xs" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                <th scope="col" className="text-left font-medium pb-1.5 pr-3">
                  Flavor
                </th>
                <th scope="col" className="text-right font-medium pb-1.5">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.flavor} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-1.5 pr-3 font-medium" style={{ color: C.ink900 }}>
                    {f.flavor}
                  </td>
                  <td
                    className="py-1.5 text-right whitespace-nowrap"
                    style={{ fontFamily: FONT_MONO, color: C.ink700 }}
                  >
                    {fmtQty(f[key(size)])}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-1.5 pr-3 font-semibold" style={{ color: C.ink900 }}>
                  Total
                </td>
                <td
                  className="py-1.5 text-right font-semibold whitespace-nowrap"
                  style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                >
                  {fmtQty(value)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-xl p-3 sm:rounded-2xl sm:p-5 ${className}`}
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <HexBadge icon={Boxes} className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <p
        className="text-[10px] font-medium uppercase tracking-wide mt-2 leading-tight sm:text-xs sm:mt-4"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        Finished bottles in stock
      </p>

      {loading ? (
        <Skeleton className="h-6 w-24 mt-1 sm:h-8 sm:w-32" />
      ) : (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mt-0.5 sm:mt-1">
          {figure("LARGE", "Large")}
          {figure("SMALL", "Small")}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
        {/* the sub-line is secondary detail — it costs a row of height on a
            phone, so it only appears once there's room for it */}
        {sub && !loading && (
          <p className="hidden sm:block text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            {fmtQty(totals.total)} total · available now
          </p>
        )}
        <Link
          href={ROUTES.inventory}
          aria-label="View all finished stock"
          className="text-[11px] font-semibold shrink-0 ml-auto -mr-2 -my-2 px-2 py-2 sm:text-xs sm:py-1 sm:-my-1"
          style={{ color: C.brandInk, fontFamily: FONT_BODY }}
        >
          View all
        </Link>
      </div>

      {openSize && breakdown(openSize, openSize === "LARGE" ? "Large" : "Small")}
    </div>
  );
}
