"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import { DISTRIBUTORS } from "../../data/mockData";
import {
  distributorMovements,
  distributorPayments,
  distributorTrade,
} from "../../lib/selectors";
import { monthToDate, periodLabel, isWithin } from "../../lib/period";
import { money, shortDate, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import BalancePill from "../ui/BalancePill";
import SaleSizeCell from "./SaleSizeCell";
import DistributorPaymentsTable from "./DistributorPaymentsTable";
import { ROUTES, distributorRoute } from "../../lib/routes";
import type { DistributorMovement } from "../../lib/selectors";

interface DistributorSalesPageProps {
  distributorName: string | null;
}

/** Green going out, red coming back — and never colour alone: each row also
 *  says which way it went, for anyone who cannot tell the two hues apart. */
const TONE = {
  ISSUE: { fg: C.success, label: "Issued", Icon: ArrowUpRight },
  RETURN: { fg: C.danger, label: "Returned", Icon: ArrowDownLeft },
} as const;

/**
 * One distributor's account, in two registers.
 *
 * Stock leaves the factory unpaid: an issue puts bottles worth so much in the
 * distributor's hands, he sells them over the following days, and only then
 * comes back with money and whatever did not sell. So the two sides are kept
 * apart rather than netted into a single table.
 *
 * **Bottles** is the stock ledger — every issue and every return, the flavors
 * behind each quantity, and the stock value less returned bottle value stated
 * above it. That difference is what he owes for.
 *
 * **Payments** is the cash ledger — what he has actually handed over, with no
 * bottle figures in it at all. Issue 40,000, take 6,000 of bottles back and
 * receive 30,000, and the account stands 4,000 Due; that arithmetic is stated
 * at the top of both registers.
 */
export default function DistributorSalesPage({
  distributorName,
}: DistributorSalesPageProps) {
  const [view, setView] = useState<"bottles" | "payments">("bottles");
  const range = useMemo(() => monthToDate(), []);

  const dist = DISTRIBUTORS.find((d) => d.name === distributorName);
  const rows = distributorName ? distributorMovements(distributorName) : [];
  const payments = distributorName ? distributorPayments(distributorName) : [];
  const trade = dist ? distributorTrade(dist.name) : null;

  /* what has come in this month, beside the lifetime figure the balance is
     worked out from */
  const receivedThisMonth = payments
    .filter((p) => isWithin(p.date, range))
    .reduce((sum, p) => sum + p.amount, 0);

  const issues = rows.filter((r) => r.kind === "ISSUE").length;
  const returns = rows.length - issues;
  const emptyMessage = "Nothing has moved for this distributor yet.";

  const views: { value: typeof view; label: string }[] = [
    { value: "bottles", label: `Bottles (${rows.length})` },
    { value: "payments", label: `Payments (${payments.length})` },
  ];

  /** which way the bottles went, said in words as well as in colour */
  const kindLabel = (m: DistributorMovement) => {
    const { fg, label, Icon } = TONE[m.kind];
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap"
        style={{ color: fg }}
      >
        <Icon size={11} aria-hidden /> {label}
      </span>
    );
  };

  /** the value of the movement, in the column that belongs to its direction */
  const valueCell = (
    m: DistributorMovement,
    kind: DistributorMovement["kind"],
  ) => {
    if (m.kind !== kind) {
      return (
        <span style={{ fontFamily: FONT_MONO, color: C.ink400 }}>
          {EMPTY_VALUE}
        </span>
      );
    }
    return (
      <span
        style={{ fontFamily: FONT_MONO, color: TONE[kind].fg, fontWeight: 600 }}
      >
        {money(m.amount)}
      </span>
    );
  };

  /** A figures panel above a register: labelled amounts, and where the account
   *  stands once they are all counted. */
  const summary = (
    figures: {
      label: string;
      value: string;
      tone?: string;
      strong?: boolean;
      note?: string;
    }[],
  ) => (
    <div
      className="rounded-xl px-3 py-3 mb-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:mb-4"
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        fontFamily: FONT_BODY,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 min-w-0 lg:grid-cols-3 lg:gap-x-8">
          {figures.map(({ label, value, tone, strong, note }) => (
            <div key={label} className="min-w-0">
              <dt
                className="text-[10px] uppercase tracking-wide"
                style={{ color: C.ink400 }}
              >
                {label}
              </dt>
              <dd
                className={`mt-0.5 font-semibold ${strong ? "text-[15px] sm:text-lg" : "text-[13px] sm:text-base"}`}
                style={{ fontFamily: FONT_MONO, color: tone ?? C.ink900 }}
              >
                {value}
              </dd>
              {note && (
                <dd className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                  {note}
                </dd>
              )}
            </div>
          ))}
        </dl>
        <BalancePill
          balance={trade?.balance ?? 0}
          className="px-3 py-1.5 text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title={distributorName ?? "Distributor"}
        subtitle={`${issues} ${issues === 1 ? "issue" : "issues"} · ${returns} ${returns === 1 ? "return" : "returns"} · ${payments.length} ${payments.length === 1 ? "payment" : "payments"}`}
        backHref={
          distributorName
            ? distributorRoute(distributorName)
            : ROUTES.distributors
        }
        backLabel="Back to distributor"
        action={
          <BalancePill
            balance={trade?.balance ?? 0}
            className="self-start px-3 py-1.5 text-xs"
          />
        }
      />

      {/* which register is on show — the same switch shape the finance pages
          use for their period filter */}
      <div
        role="group"
        aria-label="Choose a register"
        className="flex items-center gap-1.5 mb-3 sm:mb-5"
      >
        {views.map((o) => {
          const active = view === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setView(o.value)}
              aria-pressed={active}
              className="rounded-full px-3 py-1.5 min-h-9 text-[11px] font-semibold shrink-0 whitespace-nowrap transition-colors sm:px-3.5 sm:py-2 sm:text-xs"
              style={{
                fontFamily: FONT_BODY,
                background: active ? C.brand : C.card,
                color: active ? C.ink900 : C.ink600,
                border: `1px solid ${active ? C.brand : C.line}`,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {view === "bottles" && (
        <>
          {/* stock out, bottles back, and the difference — what he owes for,
              before a rupee of it has been paid */}
          {summary([
            {
              label: "Stock value issued",
              value: money(trade?.issuedAmount ?? 0),
            },
            {
              label: "Returned bottle value",
              value: money(trade?.returnedAmount ?? 0),
              tone: C.danger,
            },
            {
              label: "Stock value after returns",
              value: money(trade?.netAmount ?? 0),
              strong: true,
            },
          ])}

          {/* mobile / tablet: one card per movement */}
          <div className="lg:hidden space-y-2.5">
            {rows.length === 0 && (
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
            {rows.map((m) => (
              <div
                key={m.id}
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
                    style={{ color: TONE[m.kind].fg }}
                  >
                    {shortDate(m.date)}
                  </span>
                  {kindLabel(m)}
                </div>

                <div
                  className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2"
                  style={{ borderTop: `1px solid ${C.line}` }}
                >
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: C.ink400 }}
                    >
                      Large
                    </p>
                    <div className="mt-0.5">
                      <SaleSizeCell
                        record={m}
                        size="LARGE"
                        noun={
                          m.kind === "RETURN" ? "bottles returned" : "bottles"
                        }
                        dense
                      />
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: C.ink400 }}
                    >
                      Small
                    </p>
                    <div className="mt-0.5">
                      <SaleSizeCell
                        record={m}
                        size="SMALL"
                        noun={
                          m.kind === "RETURN" ? "bottles returned" : "bottles"
                        }
                        dense
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="mt-2 flex items-center justify-between gap-2 pt-2"
                  style={{ borderTop: `1px solid ${C.line}` }}
                >
                  <span
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: C.ink400 }}
                  >
                    {m.kind === "ISSUE"
                      ? "Stock value"
                      : "Returned bottle value"}
                  </span>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ fontFamily: FONT_MONO, color: TONE[m.kind].fg }}
                  >
                    {money(m.amount)}
                  </span>
                </div>
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
              <table
                className="w-full text-sm"
                style={{ fontFamily: FONT_BODY }}
              >
                <thead>
                  <tr style={{ color: C.ink400 }}>
                    {[
                      "Date",
                      "Large",
                      "Small",
                      "Stock value",
                      "Returned bottle value",
                    ].map((h) => (
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
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-sm"
                        style={{ color: C.ink400 }}
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                  {rows.map((m) => (
                    <tr key={m.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td
                        className="px-5 py-3 whitespace-nowrap align-top font-medium"
                        style={{ color: TONE[m.kind].fg }}
                      >
                        {shortDate(m.date)}
                        <span className="block mt-1">{kindLabel(m)}</span>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <SaleSizeCell
                          record={m}
                          size="LARGE"
                          noun={
                            m.kind === "RETURN" ? "bottles returned" : "bottles"
                          }
                        />
                      </td>
                      <td className="px-5 py-3 align-top">
                        <SaleSizeCell
                          record={m}
                          size="SMALL"
                          noun={
                            m.kind === "RETURN" ? "bottles returned" : "bottles"
                          }
                        />
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap align-top">
                        {valueCell(m, "ISSUE")}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap align-top">
                        {valueCell(m, "RETURN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.line}` }}>
                    <td
                      colSpan={3}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: C.ink600 }}
                    >
                      Stock value after returns
                    </td>
                    <td
                      colSpan={2}
                      className="px-5 py-3 font-semibold whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {money(trade?.netAmount ?? 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {view === "payments" && (
        <>
          {/* what he owes for, and what has come in against it */}
          {summary([
            {
              label: "Stock value after returns",
              value: money(trade?.netAmount ?? 0),
              strong: true,
            },
            {
              label: "Received this month",
              value: money(receivedThisMonth),
              tone: C.success,
              note: periodLabel(range),
            },
            {
              label: "Received in total",
              value: money(trade?.received ?? 0),
              tone: C.success,
            },
          ])}

          <DistributorPaymentsTable
            payments={payments}
            emptyMessage="No payments recorded for this distributor yet."
          />
        </>
      )}
    </div>
  );
}
