"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Milk } from "lucide-react";
import { bottlesSold, bottlesSoldByFlavor } from "../../lib/selectors";
import { qty as fmtQty } from "../../lib/format";
import { ROUTES } from "../../lib/routes";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import HexBadge from "../ui/HexBadge";
import { Skeleton } from "../ui/States";
import type { DateRange, LoadState } from "../../lib/types";

type Size = "large" | "small";

interface BottlesSoldStatCardProps {
  range: DateRange | null;
  state: LoadState;
  sub?: string;
  className?: string;
}

/**
 * Total Bottles Sold stat card (spec §47).
 *
 * Finished-product bottles issued to distributors for the current month to
 * date, split into Large and Small; either figure opens a per-flavor breakdown.
 *
 * The card chrome deliberately mirrors ui/StatCard — same padding, badge,
 * label and "View all" treatment — so it sits in the same grid at the same
 * size. It is a separate component only because StatCard takes a single string
 * value, and this card needs two interactive figures.
 *
 * The drill-down copies FlavorHoverCell's interaction rather than that
 * component, which is bound to one sale: hover where the pointer really
 * supports it, tap everywhere, dismiss on outside tap or Escape.
 */
export default function BottlesSoldStatCard({
  range,
  state,
  sub,
  className = "",
}: BottlesSoldStatCardProps) {
  const [openSize, setOpenSize] = useState<Size | null>(null);
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

  const loading = state !== "ready" || !range;
  const totals = range ? bottlesSold(range) : null;
  const byFlavor = range ? bottlesSoldByFlavor(range) : [];

  const figure = (size: Size, label: string) => {
    const value = totals ? totals[size] : 0;
    const open = openSize === size;

    return (
      <span className="inline-flex items-baseline gap-1">
        <button
          type="button"
          onClick={() => setOpenSize(open ? null : size)}
          onMouseEnter={() => hoverCapable() && setOpenSize(size)}
          onMouseLeave={() => hoverCapable() && setOpenSize(null)}
          aria-expanded={open}
          aria-label={`${label} bottles sold, ${fmtQty(value)}. Show breakdown by flavor`}
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

  const breakdown = (size: Size, label: string) => {
    const value = totals ? totals[size] : 0;
    const rows = byFlavor.filter((f) => f[size] > 0);

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
          {label} bottles
        </p>
        {rows.length === 0 ? (
          <p className="text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            No sales data available for this period.
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
                    {fmtQty(f[size])}
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
        <HexBadge icon={Milk} className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      <p
        className="text-[10px] font-medium uppercase tracking-wide mt-2 leading-tight sm:text-xs sm:mt-4"
        style={{ fontFamily: FONT_BODY, color: C.ink600 }}
      >
        Total bottles sold
      </p>

      {loading ? (
        <Skeleton className="h-6 w-24 mt-1 sm:h-8 sm:w-32" />
      ) : (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mt-0.5 sm:mt-1">
          {figure("large", "Large")}
          {figure("small", "Small")}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
        {/* the sub-line is secondary detail — it costs a row of height on a
            phone, so it only appears once there's room for it */}
        {sub && !loading && (
          <p className="hidden sm:block text-xs" style={{ fontFamily: FONT_BODY, color: C.ink400 }}>
            {fmtQty(totals?.total ?? 0)} total · {sub}
          </p>
        )}
        <Link
          href={ROUTES.sales}
          aria-label="View all sales and distribution records"
          className="text-[11px] font-semibold shrink-0 ml-auto -mr-2 -my-2 px-2 py-2 sm:text-xs sm:py-1 sm:-my-1"
          style={{ color: C.brandInk, fontFamily: FONT_BODY }}
        >
          View all
        </Link>
      </div>

      {openSize && breakdown(openSize, openSize === "large" ? "Large" : "Small")}
    </div>
  );
}
