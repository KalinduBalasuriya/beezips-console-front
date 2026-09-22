import { money, shortDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import type { IncomePayment } from "../../lib/types";

interface DistributorPaymentsTableProps {
  payments: IncomePayment[];
  emptyMessage: string;
}

/**
 * What one distributor has paid: date, method, reference, amount.
 *
 * Cash only. The bottles that came back with a payment are stock, not money,
 * and they are already a row of their own in the bottles ledger — repeating
 * them here would invite adding them to the cash. The same records the Income
 * register lists, narrowed to this account, so no column repeats their name.
 */
export default function DistributorPaymentsTable({
  payments,
  emptyMessage,
}: DistributorPaymentsTableProps) {
  const headers = ["Date", "Method", "Reference", "Amount received"];

  return (
    <>
      {/* mobile / tablet: one card per payment */}
      <div className="lg:hidden space-y-2.5">
        {payments.length === 0 && (
          <p
            className="rounded-xl px-4 py-6 text-center text-[13px]"
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              color: C.ink400,
            }}
          >
            {emptyMessage}
          </p>
        )}
        {payments.map((p) => (
          <div
            key={p.id}
            className="rounded-xl p-3"
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              fontFamily: FONT_BODY,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="text-[13px] font-semibold"
                style={{ color: C.ink900 }}
              >
                {shortDate(p.date)}
              </span>
              <span
                className="text-[13px] font-semibold shrink-0"
                style={{ fontFamily: FONT_MONO, color: C.success }}
              >
                {money(p.amount)}
              </span>
            </div>

            <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
              {p.method}
              {p.reference ? ` · ${p.reference}` : ""}
            </p>
          </div>
        ))}
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
                {headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={`font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap ${
                      h === "Amount received" ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-5 py-8 text-center text-sm"
                    style={{ color: C.ink400 }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td
                    className="px-5 py-3 whitespace-nowrap align-top"
                    style={{ color: C.ink600 }}
                  >
                    {shortDate(p.date)}
                  </td>
                  <td
                    className="px-5 py-3 align-top"
                    style={{ color: C.ink600 }}
                  >
                    {p.method}
                  </td>
                  <td
                    className="px-5 py-3 align-top"
                    style={{ fontFamily: FONT_MONO, color: C.ink600 }}
                  >
                    {p.reference ?? EMPTY_VALUE}
                  </td>
                  <td
                    className="px-5 py-3 text-right font-semibold whitespace-nowrap align-top"
                    style={{ fontFamily: FONT_MONO, color: C.success }}
                  >
                    {money(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `1px solid ${C.line}` }}>
                <td
                  colSpan={headers.length - 1}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: C.ink600 }}
                >
                  Received in total
                </td>
                <td
                  className="px-5 py-3 text-right font-semibold whitespace-nowrap"
                  style={{ fontFamily: FONT_MONO, color: C.success }}
                >
                  {money(payments.reduce((sum, p) => sum + p.amount, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
