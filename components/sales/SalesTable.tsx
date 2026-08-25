import Link from "next/link";
import { STATUS_STYLE } from "../../data/mockData";
import { saleTotals } from "../../lib/salesUtils";
import { distributorRoute } from "../../lib/routes";
import { money, qty as fmtQty, shortDate, fullDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { EmptyState } from "../ui/States";
import FlavorHoverCell from "./FlavorHoverCell";
import type { Sale } from "../../lib/types";

interface SalesTableProps {
  sales: Sale[];
  /** opens the per-flavor breakdown modal; when omitted the flavors cell uses
   *  the inline hover/tap tooltip instead */
  onViewFlavors?: (sale: Sale) => void;
  /** the full page also carries payment status; the dashboard summary does not */
  showStatus?: boolean;
  /** distributor names link to their detail page unless this is that page */
  linkDistributor?: boolean;
  emptyMessage: string;
  /** `md` for the sales page, `lg` for the narrower dashboard card */
  cardBreakpoint?: "md" | "lg";
}

/**
 * The canonical Sales & Distribution table: Date, Flavors, Distributor,
 * Qty (Large), Qty (Small), Total Amount — shared by the dashboard's recent
 * section and the full page so both stay in step (spec §12, §17).
 *
 * One transaction is always one row, however many flavors or bottle sizes it
 * contains (spec §15).
 */
export default function SalesTable({
  sales,
  onViewFlavors,
  showStatus = false,
  linkDistributor = true,
  emptyMessage,
  cardBreakpoint = "md",
}: SalesTableProps) {
  if (sales.length === 0) return <EmptyState message={emptyMessage} />;

  const hide = cardBreakpoint === "md" ? "md:hidden" : "lg:hidden";
  const show = cardBreakpoint === "md" ? "hidden md:block" : "hidden lg:block";

  const flavorNames = (s: Sale) => s.items.map((i) => i.flavor).join(", ");

  const flavorsCell = (s: Sale) =>
    onViewFlavors ? (
      <button
        onClick={() => onViewFlavors(s)}
        className="text-left underline underline-offset-2 decoration-dotted"
        style={{ color: C.ink600 }}
        aria-label={`View flavor breakdown for ${s.distributor} on ${fullDate(s.date)}`}
      >
        {flavorNames(s)}
      </button>
    ) : (
      <FlavorHoverCell sale={s} />
    );

  const distributorCell = (s: Sale) =>
    linkDistributor ? (
      <Link
        href={distributorRoute(s.distributor)}
        className="font-medium hover:underline"
        style={{ color: C.brandInk }}
      >
        {s.distributor}
      </Link>
    ) : (
      <span className="font-medium" style={{ color: C.ink900 }}>
        {s.distributor}
      </span>
    );

  /** Quantity over its unit price — two clearly separate values (spec §13). */
  const sizeCell = (quantity: number, unitPrice: number) => {
    if (quantity === 0) {
      return (
        <span style={{ fontFamily: FONT_MONO, color: C.ink400 }} aria-label="Not included in this sale">
          {EMPTY_VALUE}
        </span>
      );
    }
    return (
      <span className="block">
        <span className="block" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
          {fmtQty(quantity)}
        </span>
        <span className="block text-[11px]" style={{ fontFamily: FONT_MONO, color: C.ink400 }}>
          @ {money(unitPrice)}
        </span>
      </span>
    );
  };

  const statusPill = (s: Sale) => {
    const st = STATUS_STYLE[s.status];
    return (
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
        style={{ background: st.bg, color: st.fg }}
      >
        {s.status}
        {s.statusAmt ? ` ${money(s.statusAmt)}` : ""}
      </span>
    );
  };

  const headers = ["Date", "Flavors", "Distributor", "Qty (Large)", "Qty (Small)", "Total Amount"];
  if (showStatus) headers.push("Status");

  return (
    <>
      {/* mobile / tablet: one card per transaction */}
      <div className={`${hide} space-y-2.5`}>
        {sales.map((s) => {
          const t = saleTotals(s);
          return (
            <div
              key={s.id}
              className="rounded-xl p-3"
              style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold leading-tight">{distributorCell(s)}</span>
                {showStatus ? (
                  statusPill(s)
                ) : (
                  <span className="text-[11px] shrink-0" style={{ color: C.ink400 }}>
                    {shortDate(s.date)}
                  </span>
                )}
              </div>

              {showStatus && (
                <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                  {shortDate(s.date)}
                </p>
              )}

              <div className="mt-1 text-[13px]">{flavorsCell(s)}</div>

              <div className="mt-2 pt-2 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Qty (Large)
                  </p>
                  <div className="text-[13px]">{sizeCell(t.large, s.largePrice)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Qty (Small)
                  </p>
                  <div className="text-[13px]">{sizeCell(t.small, s.smallPrice)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Total
                  </p>
                  <p className="text-[13px] font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                    {money(t.totalAmt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* desktop: the full six-column table */}
      <div className={`${show} rounded-2xl`} style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {/* `overflow-visible` keeps FlavorHoverCell's tooltip from being clipped */}
        <div className={onViewFlavors ? "overflow-x-auto scroll-touch" : "overflow-visible"}>
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                {headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const t = saleTotals(s);
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="px-5 py-3 whitespace-nowrap align-top" style={{ color: C.ink600 }}>
                      {shortDate(s.date)}
                    </td>
                    <td className="px-5 py-3 align-top">{flavorsCell(s)}</td>
                    <td className="px-5 py-3 align-top">{distributorCell(s)}</td>
                    <td className="px-5 py-3 align-top">{sizeCell(t.large, s.largePrice)}</td>
                    <td className="px-5 py-3 align-top">{sizeCell(t.small, s.smallPrice)}</td>
                    <td
                      className="px-5 py-3 font-medium whitespace-nowrap align-top"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {money(t.totalAmt)}
                    </td>
                    {showStatus && <td className="px-5 py-3 align-top">{statusPill(s)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
