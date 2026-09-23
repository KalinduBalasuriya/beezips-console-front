"use client";

import { useMemo, useState } from "react";
import { Factory, Plus } from "lucide-react";
import { PRODUCTION_LOG } from "../../data/mockData";
import {
  bottlesProducedByFlavor,
  bottlesProducedBySize,
  dayBottlesByFlavor,
  dayBottlesBySize,
  dayFruitUsed,
  dayMaterials,
} from "../../lib/selectors";
import { monthToDate, isWithin } from "../../lib/period";
import { qty as fmtQty, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import DateRangeFilter from "../ui/DateRangeFilter";
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
  /* opens on month-to-date, the rule the dashboard's Bottles Produced card
     uses, so the "View all" landing reproduces the figure that was tapped */
  const monthRange = useMemo(() => monthToDate(), []);
  const [range, setRange] = useState(monthRange);

  const days = useMemo(
    () => PRODUCTION_LOG.filter((d) => isWithin(d.date, range)),
    [range],
  );
  /* the same selectors the stat card reads, so the two cannot disagree */
  const totals = bottlesProducedBySize(range);
  const byFlavor = bottlesProducedByFlavor(range);

  /** A size's figure for the window, opening its flavors on hover or tap. */
  const sizeFigure = (size: BottleSize) => {
    const key = size === "LARGE" ? "large" : "small";
    const label = size === "LARGE" ? "Large" : "Small";
    const value = totals[key];

    if (value === 0) {
      return <span style={{ fontFamily: FONT_MONO, color: C.ink400 }}>0</span>;
    }

    const rows: BreakdownRow[] = byFlavor
      .filter((f) => f[key] > 0)
      .map((f) => ({ label: f.flavor, value: fmtQty(f[key]) }));

    return (
      <HoverBreakdown
        trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(value)}</span>}
        title={`${label} bottles produced by flavor`}
        rows={rows}
        total={fmtQty(value)}
        ariaLabel={`${fmtQty(value)} ${label.toLowerCase()} bottles produced. Show breakdown by flavor`}
        triggerClassName="min-h-11 inline-flex items-center text-[15px] font-semibold sm:text-lg"
      />
    );
  };

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
        subtitle={`${days.length} ${days.length === 1 ? "batch" : "batches"} in this window`}
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

      <DateRangeFilter
        range={range}
        onChange={setRange}
        onReset={() => setRange(monthRange)}
      />

      {/* the same figure the dashboard's Bottles Produced card reports for this
          window, broken out by size */}
      <dl
        className="rounded-xl px-3 py-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:mb-4 lg:grid-cols-3"
        style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
      >
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Large bottles produced
          </dt>
          <dd className="mt-0.5" style={{ color: C.ink900 }}>
            {sizeFigure("LARGE")}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Small bottles produced
          </dt>
          <dd className="mt-0.5" style={{ color: C.ink900 }}>
            {sizeFigure("SMALL")}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Bottles in total
          </dt>
          <dd
            className="text-[15px] font-semibold mt-0.5 sm:text-lg"
            style={{ fontFamily: FONT_MONO, color: C.ink900 }}
          >
            {fmtQty(totals.total)}
          </dd>
        </div>
      </dl>

      {/* mobile / tablet: one card per production day, the same four
          breakdowns stacked instead of spread across columns */}
      <div className="lg:hidden space-y-2.5">
        {days.length === 0 && (
          <p
            className="rounded-xl px-4 py-6 text-center text-[13px]"
            style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink400 }}
          >
            No production batches in this date range.
          </p>
        )}
        {days.map((d, i) => {
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
              {days.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-8 text-center text-sm"
                    style={{ color: C.ink400 }}
                  >
                    No production batches in this date range.
                  </td>
                </tr>
              )}
              {days.map((d, i) => {
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
