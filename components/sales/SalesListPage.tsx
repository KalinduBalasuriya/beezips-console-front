"use client";

import { useMemo, useState } from "react";
import { Search, Truck } from "lucide-react";
import { combineFlavorBottles, distributorTrades } from "../../lib/selectors";
import { monthToDate } from "../../lib/period";
import { money, qty as fmtQty, EMPTY_VALUE } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import Pagination from "../ui/Pagination";
import DateRangeFilter from "../ui/DateRangeFilter";
import HoverBreakdown, { type BreakdownRow } from "../ui/HoverBreakdown";
import DistributorTotalsTable from "./DistributorTotalsTable";
import type { BottleSize } from "../../lib/types";

/** distributors per page: each row carries two hoverable figures and a status,
 *  so a shorter page reads better than a long scroll */
const PAGE_SIZE = 4;

/**
 * Sales & Distribution: what each distributor bought in a chosen window.
 *
 * Stock goes out on one visit and unsold bottles come back with a payment on
 * another, so a single issue record never states what a distributor bought.
 * This page nets the two off and shows one line per distributor — 500 small
 * taken less 50 returned reads as 450.
 *
 * The window opens on month-to-date, the same rule the dashboard's Bottles Sold
 * card uses, and the totals above the table are that card's figure broken out by
 * distributor. Pick the 1st and today and the two agree exactly.
 */
export default function SalesListPage() {
  const monthRange = useMemo(() => monthToDate(), []);
  const [range, setRange] = useState(monthRange);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () =>
      distributorTrades(range).filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [range, query],
  );

  /* the figures above the table are the listed rows added up, so they always
     describe what is on screen — window, search and all */
  const totals = useMemo(() => {
    const large = rows.reduce((sum, t) => sum + t.net.large, 0);
    const small = rows.reduce((sum, t) => sum + t.net.small, 0);
    return {
      large,
      small,
      bottles: large + small,
      amount: rows.reduce((sum, t) => sum + t.netAmount, 0),
      byFlavor: combineFlavorBottles(rows.map((t) => t.netByFlavor)),
    };
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  /* a filter change can leave the user past the last page — clamp on read so
     the list never renders blank */
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE);

  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const pickRange = (next: typeof range) => {
    setRange(next);
    setPage(1);
  };

  /** A size's net figure, opening the flavors behind it on hover or tap. */
  const sizeFigure = (size: BottleSize) => {
    const key = size === "LARGE" ? "large" : "small";
    const label = size === "LARGE" ? "Large" : "Small";
    const value = totals[key];

    if (value === 0) {
      return <span style={{ fontFamily: FONT_MONO, color: C.ink400 }}>{EMPTY_VALUE}</span>;
    }

    const breakdown: BreakdownRow[] = totals.byFlavor
      .filter((f) => f[key] > 0)
      .map((f) => ({ label: f.flavor, value: fmtQty(f[key]) }));

    return (
      <HoverBreakdown
        trigger={<span style={{ fontFamily: FONT_MONO }}>{fmtQty(value)}</span>}
        title={`${label} bottles sold by flavor`}
        rows={breakdown}
        total={fmtQty(value)}
        ariaLabel={`${fmtQty(value)} ${label.toLowerCase()} bottles sold. Show breakdown by flavor`}
        triggerClassName="min-h-11 inline-flex items-center text-[15px] font-semibold sm:text-lg"
      />
    );
  };

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Truck}
        title="Sales & distribution"
        subtitle={`${rows.length} ${rows.length === 1 ? "distributor" : "distributors"} in this window`}
        action={
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 min-h-11 w-full sm:w-auto shrink-0"
            style={{ background: C.card, border: `1px solid ${C.line}` }}
          >
            <Search size={15} color={C.ink400} className="shrink-0" aria-hidden />
            <input
              placeholder="Search distributors..."
              aria-label="Search by distributor"
              value={query}
              onChange={(e) => search(e.target.value)}
              className="text-base sm:text-sm outline-none bg-transparent w-full sm:w-47.5 min-w-0"
              style={{ fontFamily: FONT_BODY, color: C.ink900 }}
            />
          </div>
        }
      />

      <DateRangeFilter
        range={range}
        onChange={pickRange}
        onReset={() => pickRange(monthRange)}
      />

      {/* the same figure the dashboard's Bottles Sold card reports for this
          window: issues less the bottles that came back inside it */}
      <dl
        className="rounded-xl px-3 py-3 mb-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:mb-4 lg:grid-cols-4"
        style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
      >
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Large bottles sold
          </dt>
          <dd className="mt-0.5" style={{ color: C.ink900 }}>
            {sizeFigure("LARGE")}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Small bottles sold
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
            {fmtQty(totals.bottles)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
            Value after returns
          </dt>
          <dd
            className="text-[15px] font-semibold mt-0.5 sm:text-lg"
            style={{ fontFamily: FONT_MONO, color: C.ink900 }}
          >
            {money(totals.amount)}
          </dd>
        </div>
      </dl>

      <DistributorTotalsTable
        trades={pageRows}
        emptyMessage={
          query
            ? "No distributors match your search."
            : "No stock was issued in this date range."
        }
      />

      <Pagination
        page={current}
        pageCount={pageCount}
        onPageChange={setPage}
        from={rows.length === 0 ? 0 : startIndex + 1}
        to={Math.min(startIndex + PAGE_SIZE, rows.length)}
        total={rows.length}
        noun="distributors"
      />
    </div>
  );
}
