import Link from "next/link";
import { distributorRoute } from "../../lib/routes";
import { money, qty as fmtQty, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { EmptyState } from "../ui/States";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import BalancePill from "../ui/BalancePill";
import type { BottleSize } from "../../lib/types";
import type { DistributorTrade } from "../../lib/selectors";

interface DistributorTotalsTableProps {
  trades: DistributorTrade[];
  emptyMessage: string;
}

/**
 * Where every distributor's account stands: bottles they have taken, less the
 * bottles they brought back, with the flavor split and what it came to.
 *
 * One row per distributor, not per visit. A distributor who took stock three
 * times and returned bottles twice is a single line here — the question this
 * page answers is "how much has each of them actually bought", and repeating a
 * name across five rows of individual issues buries it. Their own page keeps
 * the visit-by-visit history.
 */
export default function DistributorTotalsTable({
  trades,
  emptyMessage,
}: DistributorTotalsTableProps) {
  if (trades.length === 0) return <EmptyState message={emptyMessage} />;

  /**
   * Net quantity for one size, with the flavors behind it and the deduction
   * that produced it. `dense` is the card rendering: smaller type, but a full
   * 44px tap target, since on a phone the breakdown is only reachable by touch.
   */
  const sizeCell = (trade: DistributorTrade, size: BottleSize, dense = false) => {
    const key = size === "LARGE" ? "large" : "small";
    const label = size === "LARGE" ? "Large" : "Small";
    const net = trade.net[key];
    const returned = trade.returned[key];
    const issued = trade.issued[key];

    if (issued === 0) {
      return (
        <span
          style={{ fontFamily: FONT_MONO, color: C.ink400 }}
          aria-label={`No ${label.toLowerCase()} bottles issued`}
        >
          {EMPTY_VALUE}
        </span>
      );
    }

    const rows: BreakdownRow[] = trade.netByFlavor
      .filter((f) => f[key] > 0)
      .map((f) => ({ label: f.flavor, value: fmtQty(f[key]) }));

    return (
      <HoverBreakdown
        trigger={
          <span className="block">
            <span className="block" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
              {fmtQty(net)}
            </span>
            {/* the arithmetic behind the figure, so a netted number is never
                mistaken for the quantity that left the store */}
            <span
              className="block text-[11px]"
              style={{ fontFamily: FONT_MONO, color: C.ink400 }}
            >
              {returned > 0 ? `${fmtQty(issued)} − ${fmtQty(returned)}` : "none returned"}
            </span>
          </span>
        }
        title={`${label} bottles by flavor, net of returns`}
        rows={rows}
        total={fmtQty(net)}
        totalLabel="Net"
        ariaLabel={`${fmtQty(net)} ${label.toLowerCase()} bottles sold after returns. Show breakdown by flavor`}
        triggerClassName={dense ? "text-[13px] min-h-11" : ""}
      />
    );
  };

  const nameCell = (trade: DistributorTrade) => (
    <Link
      href={distributorRoute(trade.name)}
      className="font-medium hover:underline"
      style={{ color: C.brandInk }}
    >
      {trade.name}
    </Link>
  );

  const headers = ["Distributor", "Large", "Small", "Total bottles", "Total amount", "Status"];

  return (
    <>
      {/* mobile / tablet: one card per distributor */}
      <div className="md:hidden space-y-2.5">
        {trades.map((t) => (
          <div
            key={t.name}
            className="rounded-xl p-3"
            style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-semibold leading-tight">{nameCell(t)}</span>
              <BalancePill balance={t.balance} dense />
            </div>

            <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
              {t.issues} {t.issues === 1 ? "issue" : "issues"}
              {t.returnVisits > 0
                ? ` · ${t.returnVisits} ${t.returnVisits === 1 ? "return" : "returns"}`
                : ""}
            </p>

            <div
              className="mt-2 pt-2 grid grid-cols-3 gap-2"
              style={{ borderTop: `1px solid ${C.line}` }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Large
                </p>
                <div className="mt-0.5">{sizeCell(t, "LARGE", true)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Small
                </p>
                <div className="mt-0.5">{sizeCell(t, "SMALL", true)}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Bottles
                </p>
                <p
                  className="text-[13px] font-semibold mt-0.5"
                  style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                >
                  {fmtQty(t.net.total)}
                </p>
              </div>
            </div>

            <div
              className="mt-2 flex items-center justify-between gap-2 pt-2"
              style={{ borderTop: `1px solid ${C.line}` }}
            >
              <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                Total amount
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ fontFamily: FONT_MONO, color: C.ink900 }}
              >
                {money(t.netAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* desktop: the full table */}
      <div
        className="hidden md:block rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
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
              {trades.map((t) => (
                <tr key={t.name} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="px-5 py-3 align-top">
                    {nameCell(t)}
                    <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                      {t.issues} {t.issues === 1 ? "issue" : "issues"}
                      {t.returnVisits > 0
                        ? ` · ${t.returnVisits} ${t.returnVisits === 1 ? "return" : "returns"}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3 align-top">{sizeCell(t, "LARGE")}</td>
                  <td className="px-5 py-3 align-top">{sizeCell(t, "SMALL")}</td>
                  <td
                    className="px-5 py-3 align-top whitespace-nowrap"
                    style={{ fontFamily: FONT_MONO, color: C.ink600 }}
                  >
                    {fmtQty(t.net.total)}
                  </td>
                  <td
                    className="px-5 py-3 font-medium whitespace-nowrap align-top"
                    style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                  >
                    {money(t.netAmount)}
                  </td>
                  <td className="px-5 py-3 align-top">
                    <BalancePill balance={t.balance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
