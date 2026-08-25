"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { DISTRIBUTORS, STATUS_STYLE } from "../../data/mockData";
import { saleTotals } from "../../lib/salesUtils";
import { sortedSales } from "../../lib/selectors";
import { money, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import FlavorPopup from "../modals/FlavorPopup";
import { ROUTES } from "../../lib/routes";
import type { Sale } from "../../lib/types";

interface DistributorSalesPageProps {
  distributorName: string | null;
}

export default function DistributorSalesPage({ distributorName }: DistributorSalesPageProps) {
  const [flavorSale, setFlavorSale] = useState<Sale | null>(null);
  const dist = DISTRIBUTORS.find((d) => d.name === distributorName);
  const rows = sortedSales().filter((s) => s.distributor === distributorName);
  const balance = dist?.balance ?? 0;

  const balanceStyle = {
    background: balance < 0 ? C.dangerBg : balance > 0 ? C.infoBg : C.successBg,
    color: balance < 0 ? C.danger : balance > 0 ? C.info : C.success,
  };
  const balanceLabel =
    balance === 0 ? "Settled" : balance < 0 ? `Due ${money(-balance)}` : `Exceed ${money(balance)}`;

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Users}
        title={distributorName ?? "Distributor"}
        subtitle={`${rows.length} ${rows.length === 1 ? "sales record" : "sales records"}`}
        backHref={ROUTES.distributors}
        backLabel="Back to distributors"
        action={
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold self-start shrink-0"
            style={balanceStyle}
          >
            {balanceLabel}
          </span>
        }
      />

      {/* mobile / tablet: one card per sale — this table has a two-tier header
          and 8 columns, which can't be made to work at phone widths */}
      <div className="lg:hidden space-y-2.5">
        {rows.length === 0 && (
          <p
            className="rounded-xl px-4 py-6 text-center text-[13px]"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink400 }}
          >
            No sales recorded for this distributor yet.
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

              <button
                onClick={() => setFlavorSale(s)}
                className="mt-0.5 text-[13px] text-left underline underline-offset-2 decoration-dotted py-1.5"
                style={{ color: C.ink600 }}
              >
                {s.items.map((i) => i.flavor).join(", ")}
              </button>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Large
                  </p>
                  <p className="text-[13px]" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                    {t.large} <span style={{ color: C.ink600 }}>· {money(t.largeAmt)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Small
                  </p>
                  <p className="text-[13px]" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                    {t.small} <span style={{ color: C.ink600 }}>· {money(t.smallAmt)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Total amount
                </span>
                <span className="text-[13px] font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                  {money(t.totalAmt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* desktop: full table */}
      <div className="hidden lg:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="overflow-x-auto scroll-touch">
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                <th rowSpan={2} className="text-left font-medium px-5 pb-2 text-xs uppercase tracking-wide align-bottom">
                  Date
                </th>
                <th rowSpan={2} className="text-left font-medium px-5 pb-2 text-xs uppercase tracking-wide align-bottom">
                  Flavors
                </th>
                <th colSpan={2} className="text-center font-medium px-5 pb-1 text-xs uppercase tracking-wide" style={{ borderBottom: `1px solid ${C.line}` }}>
                  Quantity
                </th>
                <th colSpan={2} className="text-center font-medium px-5 pb-1 text-xs uppercase tracking-wide" style={{ borderBottom: `1px solid ${C.line}` }}>
                  Amount
                </th>
                <th rowSpan={2} className="text-left font-medium px-5 pb-2 text-xs uppercase tracking-wide align-bottom whitespace-nowrap">
                  Total amount
                </th>
                <th rowSpan={2} className="text-left font-medium px-5 pb-2 text-xs uppercase tracking-wide align-bottom">
                  Status
                </th>
              </tr>
              <tr style={{ color: C.ink400 }}>
                <th className="text-right font-medium px-5 pb-2 pt-1 text-xs uppercase tracking-wide">Large</th>
                <th className="text-right font-medium px-5 pb-2 pt-1 text-xs uppercase tracking-wide">Small</th>
                <th className="text-right font-medium px-5 pb-2 pt-1 text-xs uppercase tracking-wide">Large</th>
                <th className="text-right font-medium px-5 pb-2 pt-1 text-xs uppercase tracking-wide">Small</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm" style={{ color: C.ink400 }}>
                    No sales recorded for this distributor yet.
                  </td>
                </tr>
              )}
              {rows.map((s) => {
                const t = saleTotals(s);
                const st = STATUS_STYLE[s.status];
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="px-5 py-3 whitespace-nowrap" style={{ color: C.ink600 }}>
                      {shortDate(s.date)}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setFlavorSale(s)} className="hover:underline text-left" style={{ color: C.ink600 }}>
                        {s.items.map((i) => i.flavor).join(", ")}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                      {t.large}
                    </td>
                    <td className="px-5 py-3 text-right" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                      {t.small}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {money(t.largeAmt)}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {money(t.smallAmt)}
                    </td>
                    <td className="px-5 py-3 font-medium whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                      {money(t.totalAmt)}
                    </td>
                    <td className="px-5 py-3">
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

      {flavorSale && <FlavorPopup sale={flavorSale} onClose={() => setFlavorSale(null)} />}
    </div>
  );
}
