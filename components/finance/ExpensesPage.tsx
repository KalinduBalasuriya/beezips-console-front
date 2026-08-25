"use client";

import { useMemo, useState } from "react";
import { Receipt, Plus } from "lucide-react";
import { EXPENSES } from "../../data/mockData";
import { totalExpenses } from "../../lib/selectors";
import { monthToDate, periodLabel, isWithin } from "../../lib/period";
import { money, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import Pagination from "../ui/Pagination";
import { EmptyState } from "../ui/States";
import PeriodToggle from "./PeriodToggle";
import { useModals } from "../layout/AppShell";

const PAGE_SIZE = 8;

export default function ExpensesPage() {
  const { open } = useModals();
  const [monthOnly, setMonthOnly] = useState(true);
  const [page, setPage] = useState(1);
  const range = useMemo(() => monthToDate(), []);

  const rows = useMemo(() => {
    const all = [...EXPENSES].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    return monthOnly ? all.filter((e) => isWithin(e.date, range)) : all;
  }, [monthOnly, range]);

  const total = monthOnly
    ? totalExpenses(range)
    : rows.reduce((sum, e) => sum + e.amount, 0);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Receipt}
        title="Expenses"
        subtitle={
          <>
            {money(total)} across {rows.length} {rows.length === 1 ? "record" : "records"}
            {monthOnly ? ` · ${periodLabel(range)}` : " · all time"}
          </>
        }
        action={
          <button
            onClick={() => open("expense")}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY, color: C.ink900, background: C.brand }}
          >
            <Plus size={15} aria-hidden /> Add expense
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
          message="No expenses recorded for this period."
          hint="Use Add expense to log an operating cost."
        />
      ) : (
        <>
          {/* mobile: one card per expense */}
          <div className="md:hidden space-y-2.5">
            {pageRows.map((e) => (
              <div
                key={e.id}
                className="rounded-xl p-3"
                style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: C.ink900 }}>
                      {e.category}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                      {shortDate(e.date)} · {e.method}
                    </p>
                  </div>
                  <span
                    className="text-[13px] font-semibold shrink-0"
                    style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                  >
                    {money(e.amount)}
                  </span>
                </div>
                <p className="text-[12px] mt-1.5" style={{ color: C.ink600 }}>
                  {e.description}
                </p>
              </div>
            ))}
          </div>

          {/* desktop: table */}
          <div className="hidden md:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="overflow-x-auto scroll-touch">
              <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
                <thead>
                  <tr style={{ color: C.ink400 }}>
                    {["Date", "Category", "Description", "Method", "Amount"].map((h) => (
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
                  {pageRows.map((e) => (
                    <tr key={e.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td className="px-5 py-3 whitespace-nowrap" style={{ color: C.ink600 }}>
                        {shortDate(e.date)}
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: C.ink900 }}>
                        {e.category}
                      </td>
                      <td className="px-5 py-3" style={{ color: C.ink600 }}>
                        {e.description}
                      </td>
                      <td className="px-5 py-3" style={{ color: C.ink600 }}>
                        {e.method}
                      </td>
                      <td
                        className="px-5 py-3 text-right font-medium whitespace-nowrap"
                        style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                      >
                        {money(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.line}` }}>
                    <td colSpan={4} className="px-5 py-3 font-semibold" style={{ color: C.ink900 }}>
                      Total
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
            noun="expenses"
          />
        </>
      )}
    </div>
  );
}
