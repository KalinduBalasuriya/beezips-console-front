"use client";

import { Users } from "lucide-react";
import { DISTRIBUTORS, STATUS_STYLE } from "../../data/mockData";
import { saleTotals } from "../../lib/salesUtils";
import { distributorSales } from "../../lib/selectors";
import { money, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import SaleSizeCell from "./SaleSizeCell";
import { ROUTES, distributorRoute } from "../../lib/routes";

interface DistributorSalesPageProps {
  distributorName: string | null;
}

/**
 * One distributor's sales history: Date, Large, Small, Total amount, Status.
 *
 * No Flavors column and no per-size amount columns — the flavors belong to a
 * quantity, so each size's figure carries its own breakdown on hover or tap,
 * and the amounts follow from quantity × the unit price shown under it. The
 * distributor is the page, so no column repeats their name either.
 */
export default function DistributorSalesPage({ distributorName }: DistributorSalesPageProps) {
  const dist = DISTRIBUTORS.find((d) => d.name === distributorName);
  const rows = distributorName ? distributorSales(distributorName) : [];
  const balance = dist?.balance ?? 0;

  const balanceStyle = {
    background: balance < 0 ? C.dangerBg : balance > 0 ? C.infoBg : C.successBg,
    color: balance < 0 ? C.danger : balance > 0 ? C.info : C.success,
  };
  const balanceLabel =
    balance === 0 ? "Settled" : balance < 0 ? `Due ${money(-balance)}` : `Exceed ${money(balance)}`;

  const emptyMessage = "No sales recorded for this distributor yet.";

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title={distributorName ?? "Distributor"}
        subtitle={`${rows.length} ${rows.length === 1 ? "sales record" : "sales records"}`}
        backHref={distributorName ? distributorRoute(distributorName) : ROUTES.distributors}
        backLabel="Back to distributor"
        action={
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold self-start shrink-0"
            style={balanceStyle}
          >
            {balanceLabel}
          </span>
        }
      />

      {/* mobile / tablet: one card per sale */}
      <div className="lg:hidden space-y-2.5">
        {rows.length === 0 && (
          <p
            className="rounded-xl px-4 py-6 text-center text-[13px]"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink400 }}
          >
            {emptyMessage}
          </p>
        )}
        {rows.map((s) => {
          const t = saleTotals(s);
          const st = STATUS_STYLE[s.status];
          return (
            <div
              key={s.id}
              className="rounded-xl p-3"
              style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[13px] font-semibold" style={{ color: C.ink900 }}>
                  {shortDate(s.date)}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0 whitespace-nowrap"
                  style={{ background: st.bg, color: st.fg }}
                >
                  {s.status}{s.statusAmt ? ` ${money(s.statusAmt)}` : ""}
                </span>
              </div>

              <div
                className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Large
                  </p>
                  <div className="mt-0.5">
                    <SaleSizeCell sale={s} size="LARGE" dense />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Small
                  </p>
                  <div className="mt-0.5">
                    <SaleSizeCell sale={s} size="SMALL" dense />
                  </div>
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
                  {money(t.totalAmt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* desktop: full table */}
      <div
        className="hidden lg:block rounded-2xl"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        {/* the scroller stays: the breakdown panel is positioned against the
            viewport, so it is not clipped by an ancestor that scrolls */}
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                {["Date", "Large", "Small", "Total amount", "Status"].map((h) => (
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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: C.ink400 }}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {rows.map((s) => {
                const t = saleTotals(s);
                const st = STATUS_STYLE[s.status];
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td
                      className="px-5 py-3 whitespace-nowrap align-top"
                      style={{ color: C.ink600 }}
                    >
                      {shortDate(s.date)}
                    </td>
                    <td className="px-5 py-3 align-top">
                      <SaleSizeCell sale={s} size="LARGE" />
                    </td>
                    <td className="px-5 py-3 align-top">
                      <SaleSizeCell sale={s} size="SMALL" />
                    </td>
                    <td
                      className="px-5 py-3 font-medium whitespace-nowrap align-top"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {money(t.totalAmt)}
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
                        style={{ background: st.bg, color: st.fg }}
                      >
                        {s.status}{s.statusAmt ? ` ${money(s.statusAmt)}` : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
