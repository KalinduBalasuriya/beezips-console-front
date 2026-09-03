"use client";

import { useMemo } from "react";
import { Factory, Plus } from "lucide-react";
import { PRODUCTION_LOG } from "../../data/mockData";
import { bottlesProduced, dayConsumption } from "../../lib/selectors";
import { monthToDate, periodLabel } from "../../lib/period";
import { qty as fmtQty, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import { useModals } from "../layout/AppShell";

export default function ProductionLogPage() {
  const { open } = useModals();
  const range = useMemo(() => monthToDate(), []);
  /* month-to-date, matching the dashboard's Bottles Produced card so the
     "View all" landing reconciles with the figure the user tapped */
  const monthBottles = bottlesProduced(range);

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Factory}
        title="Production"
        subtitle={`${PRODUCTION_LOG.length} batches logged · ${fmtQty(monthBottles)} bottles produced ${periodLabel(range)}`}
        action={
          <button
            onClick={() => open("production")}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY, color: C.ink900, background: C.brand }}
          >
            <Plus size={15} aria-hidden /> Add production
          </button>
        }
      />

      {/* mobile / tablet: one card per production day, with the per-flavor
          batches listed as rows instead of comma-joined columns */}
      <div className="lg:hidden space-y-2.5">
        {PRODUCTION_LOG.map((d, i) => {
          const dayTotal = d.batches.reduce((a, b) => a + b.bottles, 0);
          const used = dayConsumption(d);
          return (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: C.ink900 }}>
                    {shortDate(d.date)}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                    {d.manager}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Total bottles
                  </p>
                  <p className="text-[13px] font-semibold" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                    {dayTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-2 space-y-1 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                {d.batches.map((b) => (
                  <div
                    key={`${b.flavor}-${b.bottleSize}`}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span style={{ color: C.ink700, fontWeight: 500 }}>
                      {b.flavor}{" "}
                      <span style={{ color: C.ink400, fontWeight: 400 }}>
                        {b.bottleSize === "LARGE" ? "Large" : "Small"}
                      </span>
                    </span>
                    <span className="shrink-0" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {b.kg}kg → {b.bottles.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Bottles / lids / labels
                </span>
                <span className="text-xs" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                  {used.bottles.toLocaleString()} / {used.lids.toLocaleString()} / {used.labels.toLocaleString()}
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
                {["Date", "Flavors produced", "Fruit used", "Bottles produced", "Total bottles", "Bottles / lids / labels", "Manager"].map((h) => (
                  <th key={h} className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTION_LOG.map((d, i) => {
                const dayTotal = d.batches.reduce((a, b) => a + b.bottles, 0);
                const used = dayConsumption(d);
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="px-5 py-3 align-top font-medium whitespace-nowrap" style={{ color: C.ink900 }}>
                      {shortDate(d.date)}
                    </td>
                    <td className="px-5 py-3 align-top" style={{ color: C.ink600 }}>
                      {d.batches
                        .map((b) => `${b.flavor} (${b.bottleSize === "LARGE" ? "Large" : "Small"})`)
                        .join(", ")}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {d.batches.map((b) => `${b.kg}kg`).join(", ")}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {d.batches.map((b) => b.bottles.toLocaleString()).join(", ")}
                    </td>
                    <td className="px-5 py-3 align-top font-medium" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                      {dayTotal.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                      {used.bottles.toLocaleString()} / {used.lids.toLocaleString()} / {used.labels.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap" style={{ color: C.ink600 }}>
                      {d.manager}
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
