"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { profitAndLoss, expensesByCategory } from "../../lib/selectors";
import { monthToDate, periodLabel } from "../../lib/period";
import { money } from "../../lib/format";
import { C, FONT_HEAD, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import { EmptyState } from "../ui/States";

export default function ProfitLossPage() {
  const range = useMemo(() => monthToDate(), []);
  const pl = profitAndLoss(range);
  const breakdown = expensesByCategory(range);

  const profitable = pl.net >= 0;
  /* outstanding = value issued to distributors that has not been collected yet */
  const outstanding = pl.salesIssued - pl.cashCollected;

  const rows: { label: string; value: number; tone?: "in" | "out"; note?: string }[] = [
    { label: "Cash collected", value: pl.cashCollected, tone: "in", note: "Payments received from distributors" },
    { label: "Operating expenses", value: -pl.expenses, tone: "out", note: "Recorded operating costs" },
  ];

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={TrendingUp}
        title="Profit & Loss"
        subtitle={`Month to date · ${periodLabel(range)}`}
      />

      {/* headline position */}
      <div
        className="rounded-xl p-4 mb-3 sm:rounded-2xl sm:p-5 sm:mb-5"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-wide sm:text-xs"
          style={{ fontFamily: FONT_BODY, color: C.ink600 }}
        >
          Net position
        </p>
        <p
          className="text-2xl font-semibold mt-1 sm:text-3xl"
          style={{ fontFamily: FONT_MONO, color: profitable ? C.success : C.danger }}
        >
          {money(pl.net)}
        </p>
        <p className="text-xs mt-1" style={{ fontFamily: FONT_BODY, color: C.ink600 }}>
          {/* the word carries the meaning, not just the colour (spec §31) */}
          {profitable ? "Profit" : "Loss"} · cash collected less operating expenses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        {/* statement */}
        <section
          aria-labelledby="pl-statement-heading"
          className="rounded-xl p-3 sm:rounded-2xl sm:p-5"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <h2
            id="pl-statement-heading"
            className="text-[13px] font-semibold mb-2.5 sm:text-sm sm:mb-4"
            style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
          >
            Statement
          </h2>
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} style={{ borderTop: `1px solid ${C.line}` }}>
                  <th scope="row" className="text-left py-2.5 pr-3 font-medium align-top">
                    <span className="text-[13px]" style={{ color: C.ink900 }}>
                      {r.label}
                    </span>
                    {r.note && (
                      <span className="block text-[11px] font-normal mt-0.5" style={{ color: C.ink400 }}>
                        {r.note}
                      </span>
                    )}
                  </th>
                  <td
                    className="py-2.5 text-right align-top whitespace-nowrap text-[13px]"
                    style={{ fontFamily: FONT_MONO, color: r.tone === "out" ? C.danger : C.success }}
                  >
                    {r.tone === "out" ? `(${money(Math.abs(r.value))})` : money(r.value)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.line}` }}>
                <th scope="row" className="text-left py-3 pr-3 text-[13px] font-semibold" style={{ color: C.ink900 }}>
                  Net {profitable ? "profit" : "loss"}
                </th>
                <td
                  className="py-3 text-right font-semibold whitespace-nowrap text-[13px]"
                  style={{ fontFamily: FONT_MONO, color: profitable ? C.success : C.danger }}
                >
                  {money(pl.net)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: C.ink600 }}>Sales issued this period</span>
              <span style={{ fontFamily: FONT_MONO, color: C.ink900 }}>{money(pl.salesIssued)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span style={{ color: C.ink600 }}>Awaiting collection</span>
              <span style={{ fontFamily: FONT_MONO, color: outstanding > 0 ? C.danger : C.ink900 }}>
                {money(outstanding)}
              </span>
            </div>
          </div>
        </section>

        {/* expense breakdown */}
        <section
          aria-labelledby="pl-breakdown-heading"
          className="rounded-xl p-3 sm:rounded-2xl sm:p-5"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <h2
            id="pl-breakdown-heading"
            className="text-[13px] font-semibold mb-2.5 sm:text-sm sm:mb-4"
            style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
          >
            Where the money went
          </h2>

          {breakdown.length === 0 ? (
            <EmptyState message="No expenses recorded for this period." />
          ) : (
            <ul className="space-y-2.5">
              {breakdown.map((b) => {
                const pct = pl.expenses === 0 ? 0 : (b.amount / pl.expenses) * 100;
                return (
                  <li key={b.category}>
                    <div className="flex items-center justify-between gap-3 text-xs mb-1">
                      <span className="truncate" style={{ color: C.ink700, fontWeight: 500 }}>
                        {b.category}
                      </span>
                      <span className="shrink-0" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                        {money(b.amount)} · {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: C.line }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: C.brand }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
