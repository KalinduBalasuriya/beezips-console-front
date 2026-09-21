import Link from "next/link";
import { STATUS_STYLE } from "../../data/mockData";
import { saleTotals } from "../../lib/salesUtils";
import { distributorRoute } from "../../lib/routes";
import { money, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { EmptyState } from "../ui/States";
import SaleSizeCell from "./SaleSizeCell";
import type { Sale } from "../../lib/types";

interface SalesTableProps {
  sales: Sale[];
  /** the full page also carries payment status; the dashboard summary does not */
  showStatus?: boolean;
  /** distributor names link to their profile unless this is that distributor */
  linkDistributor?: boolean;
  emptyMessage: string;
  /** `md` for the sales page, `lg` for the narrower dashboard card */
  cardBreakpoint?: "md" | "lg";
}

/**
 * The canonical Sales & Distribution table: Date, Distributor, Qty (Large),
 * Qty (Small), Total Amount — shared by the dashboard's recent section and the
 * full page so both stay in step (spec §12, §17).
 *
 * There is no Flavors column: the flavors belong to a quantity, so each size's
 * figure reveals its own per-flavor breakdown on hover or tap instead of the
 * row repeating a list of names that says nothing about how many went out.
 *
 * One transaction is always one row, however many flavors or bottle sizes it
 * contains (spec §15).
 */
export default function SalesTable({
  sales,
  showStatus = false,
  linkDistributor = true,
  emptyMessage,
  cardBreakpoint = "md",
}: SalesTableProps) {
  if (sales.length === 0) return <EmptyState message={emptyMessage} />;

  const hide = cardBreakpoint === "md" ? "md:hidden" : "lg:hidden";
  const show = cardBreakpoint === "md" ? "hidden md:block" : "hidden lg:block";

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

  const headers = ["Date", "Distributor", "Qty (Large)", "Qty (Small)", "Total Amount"];
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

              <div className="mt-2 pt-2 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Qty (Large)
                  </p>
                  <div className="text-[13px] mt-0.5"><SaleSizeCell sale={s} size="LARGE" dense /></div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Qty (Small)
                  </p>
                  <div className="text-[13px] mt-0.5"><SaleSizeCell sale={s} size="SMALL" dense /></div>
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

      {/* desktop: the full table */}
      <div className={`${show} rounded-2xl`} style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {/* the scroller stays: the breakdown panel is positioned against the
            viewport, so it is not clipped by an ancestor that scrolls */}
        <div className="overflow-x-auto scroll-touch">
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
                    <td className="px-5 py-3 align-top">{distributorCell(s)}</td>
                    <td className="px-5 py-3 align-top"><SaleSizeCell sale={s} size="LARGE" /></td>
                    <td className="px-5 py-3 align-top"><SaleSizeCell sale={s} size="SMALL" /></td>
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
