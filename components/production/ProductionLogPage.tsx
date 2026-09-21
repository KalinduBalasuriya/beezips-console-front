"use client";

import { useMemo } from "react";
import { Factory, Plus } from "lucide-react";
import { PRODUCTION_LOG } from "../../data/mockData";
import {
  bottlesProduced,
  dayBottlesByFlavor,
  dayBottlesBySize,
  dayFruitUsed,
  dayMaterials,
} from "../../lib/selectors";
import { monthToDate, periodLabel } from "../../lib/period";
import { qty as fmtQty, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import { useModals } from "../layout/AppShell";
import type { BottleSize, ProductionDay } from "../../lib/types";

const COLUMNS = [
  "Date",
  "Fruit used",
  "Large bottles",
  "Small bottles",
  "Total bottles",
  "Raw materials used",
  "Manager",
];

export default function ProductionLogPage() {
  const { open } = useModals();
  const range = useMemo(() => monthToDate(), []);
  /* month-to-date, matching the dashboard's Bottles Produced card so the
     "View all" landing reconciles with the figure the user tapped */
  const monthBottles = bottlesProduced(range);

  /* ---------- the four breakdown cells, shared by card and table ----------

     `dense` is the card rendering: smaller type, but a full 44px-tall tap
     target, since on a phone these triggers are only reachable by touch. */

  const tap = (dense: boolean) =>
    dense ? "inline-flex items-center min-h-11 text-[13px]" : "";

  const fruitCell = (day: ProductionDay, dense = false) => {
    const fruit = dayFruitUsed(day);
    const rows: BreakdownRow[] = fruit.byFlavor.map((f) => ({
      label: f.flavor,
      value: `${fmtQty(f.kg)} kg`,
    }));
    return (
      <HoverBreakdown
        trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(fruit.total)} kg</span>}
        title="Fruit used by flavor"
        rows={rows}
        total={`${fmtQty(fruit.total)} kg`}
        ariaLabel={`${fmtQty(fruit.total)} kilograms of fruit used. Show breakdown by flavor`}
        triggerClassName={tap(dense)}
      />
    );
  };

  const bottlesCell = (day: ProductionDay, size: BottleSize, dense = false) => {
    const key = size === "LARGE" ? "large" : "small";
    const label = size === "LARGE" ? "Large" : "Small";
    const value = dayBottlesBySize(day)[key];
    const rows: BreakdownRow[] = dayBottlesByFlavor(day)
      .filter((f) => f[key] > 0)
      .map((f) => ({ label: f.flavor, value: fmtQty(f[key]) }));
    return (
      <HoverBreakdown
        trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(value)}</span>}
        title={`${label} bottles by flavor`}
        rows={rows}
        total={fmtQty(value)}
        ariaLabel={`${fmtQty(value)} ${label.toLowerCase()} bottles produced. Show breakdown by flavor`}
        triggerClassName={tap(dense)}
      />
    );
  };

  const materialsCell = (day: ProductionDay, dense = false) => {
    const rows: BreakdownRow[] = dayMaterials(day).map((m) => ({
      label: m.material,
      value: `${fmtQty(m.quantityUsed)} ${m.unit}`,
    }));
    return (
      <HoverBreakdown
        trigger={<span className="font-semibold" style={{ color: C.brandInk }}>View</span>}
        title="Raw materials used"
        rows={rows}
        ariaLabel={`Show the ${rows.length} raw materials used on ${shortDate(day.date)}`}
        align="right"
        triggerClassName={tap(dense)}
      />
    );
  };

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

      {/* mobile / tablet: one card per production day, the same four
          breakdowns stacked instead of spread across columns */}
      <div className="lg:hidden space-y-2.5">
        {PRODUCTION_LOG.map((d, i) => {
          const sizes = dayBottlesBySize(d);
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
                    {fmtQty(sizes.total)}
                  </p>
                </div>
              </div>

              <div
                className="mt-2 grid grid-cols-3 gap-2 pt-2"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Fruit used
                  </p>
                  <div className="mt-0.5">{fruitCell(d, true)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Large
                  </p>
                  <div className="mt-0.5">{bottlesCell(d, "LARGE", true)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                    Small
                  </p>
                  <div className="mt-0.5">{bottlesCell(d, "SMALL", true)}</div>
                </div>
              </div>

              <div
                className="mt-2 flex items-center justify-between gap-2 pt-2"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <span className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                  Raw materials used
                </span>
                {materialsCell(d, true)}
              </div>
            </div>
          );
        })}
      </div>

      {/* desktop: full table */}
      <div className="hidden lg:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        {/* `overflow-visible` keeps the breakdown panels from being clipped —
            the seven columns fit at `lg` without a scroller */}
        <div className="overflow-visible">
          <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ color: C.ink400 }}>
                {COLUMNS.map((h) => (
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
              {PRODUCTION_LOG.map((d, i) => {
                const sizes = dayBottlesBySize(d);
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="px-5 py-3 align-top font-medium whitespace-nowrap" style={{ color: C.ink900 }}>
                      {shortDate(d.date)}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap">{fruitCell(d)}</td>
                    <td className="px-5 py-3 align-top whitespace-nowrap">{bottlesCell(d, "LARGE")}</td>
                    <td className="px-5 py-3 align-top whitespace-nowrap">{bottlesCell(d, "SMALL")}</td>
                    <td
                      className="px-5 py-3 align-top font-medium whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                    >
                      {fmtQty(sizes.total)}
                    </td>
                    <td className="px-5 py-3 align-top whitespace-nowrap">{materialsCell(d)}</td>
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
