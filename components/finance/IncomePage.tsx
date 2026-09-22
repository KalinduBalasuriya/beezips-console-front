"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HandCoins, Plus } from "lucide-react";
import { INCOME_PAYMENTS } from "../../data/mockData";
import { cashCollected } from "../../lib/selectors";
import { monthToDate, periodLabel, isWithin } from "../../lib/period";
import { money, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import Pagination from "../ui/Pagination";
import { EmptyState } from "../ui/States";
import ReturnedBottlesCell from "../sales/ReturnedBottlesCell";
import PeriodToggle from "./PeriodToggle";
import { useModals } from "../layout/AppShell";
import { distributorRoute } from "../../lib/routes";

const PAGE_SIZE = 8;

/** Cash actually received from distributors — the source of the dashboard's
 *  Cash Collected figure. */
export default function IncomePage() {
  const { open } = useModals();
  const [monthOnly, setMonthOnly] = useState(true);
  const [page, setPage] = useState(1);
  const range = useMemo(() => monthToDate(), []);

  const rows = useMemo(() => {
    const all = [...INCOME_PAYMENTS].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    return monthOnly ? all.filter((p) => isWithin(p.date, range)) : all;
  }, [monthOnly, range]);

  const total = monthOnly ? cashCollected(range) : rows.reduce((s, p) => s + p.amount, 0);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={HandCoins}
        title="Income"
        subtitle={
          <>
            {money(total)} collected across {rows.length} {rows.length === 1 ? "payment" : "payments"}
            {monthOnly ? ` · ${periodLabel(range)}` : " · all time"}
          </>
        }
        action={
          <button
            onClick={() => open("income")}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY, color: C.ink900, background: C.brand }}
          >
            <Plus size={15} aria-hidden /> Record payment
          </button>
        }
      />

      <PeriodToggle
        monthOnly={monthOnly}
        onChange={(v) => {
          setMonthOnly(v);
          setPage(1);
        }}
        range={range}
      />

      {rows.length === 0 ? (
        <EmptyState
          message="No payments received for this period."
          hint="Use Record payment to log cash received."
        />
      ) : (
        <>
          {/* mobile: one card per payment */}
          <div className="md:hidden space-y-2.5">
            {pageRows.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-3"
                style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={distributorRoute(p.distributor)}
                    className="text-[13px] font-semibold text-left leading-tight py-1.5 -my-1.5"
                    style={{ color: C.brandInk }}
                  >
                    {p.distributor}
                  </Link>
                  <span
                    className="text-[13px] font-semibold shrink-0"
                    style={{ fontFamily: FONT_MONO, color: C.success }}
                  >
                    {money(p.amount)}
                  </span>
                </div>
                <p className="text-[11px] mt-1" style={{ color: C.ink400 }}>
                  {shortDate(p.date)} · {p.method}
                  {p.reference ? ` · ${p.reference}` : ""}
                </p>
                {/* a div, not a p: the breakdown trigger renders a block
                    element, which no paragraph may contain */}
                <div
                  className="text-[11px] mt-1 flex items-center gap-1.5"
                  style={{ color: C.ink600 }}
                >
                  Bottles returned <ReturnedBottlesCell payment={p} dense />
                </div>
              </div>
            ))}
          </div>

          {/* desktop: table */}
          <div className="hidden md:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="overflow-x-auto scroll-touch">
              <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
                <thead>
                  <tr style={{ color: C.ink400 }}>
                    {["Date", "Distributor", "Method", "Reference", "Bottles returned", "Amount"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className={`font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap ${
                          h === "Amount" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((p) => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: C.ink600 }}>
                        {shortDate(p.date)}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={distributorRoute(p.distributor)}
                          className="font-medium hover:underline"
                          style={{ color: C.brandInk }}
                        >
                          {p.distributor}
                        </Link>
                      </td>
                      <td className="px-5 py-3" style={{ color: C.ink600 }}>
                        {p.method}
                      </td>
                      <td className="px-5 py-3" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                        {p.reference ?? "—"}
                      </td>
                      <td className="px-5 py-3" style={{ color: C.ink600 }}>
                        <ReturnedBottlesCell payment={p} />
                      </td>
                      <td
                        className="px-5 py-3 text-right font-medium whitespace-nowrap"
                        style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                      >
                        {money(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.line}` }}>
                    <td colSpan={5} className="px-5 py-3 font-semibold" style={{ color: C.ink900 }}>
                      Total collected
                    </td>
                    <td
                      className="px-5 py-3 text-right font-semibold whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {money(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <Pagination
            page={current}
            pageCount={pageCount}
            onPageChange={setPage}
            from={startIndex + 1}
            to={Math.min(startIndex + PAGE_SIZE, rows.length)}
            total={rows.length}
            noun="payments"
          />
        </>
      )}
    </div>
  );
}
