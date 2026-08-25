"use client";

import { useState } from "react";
import Link from "next/link";
import { INVENTORY_CATEGORIES } from "../../data/mockData";
import { stockSnapshot, isLowStock } from "../../lib/selectors";
import { qty as fmtQty } from "../../lib/format";
import { C, FONT_HEAD, FONT_BODY, FONT_MONO } from "../../lib/theme";
import { ROUTES } from "../../lib/routes";
import CategoryFilter from "./CategoryFilter";
import { EmptyState, Skeleton } from "../ui/States";
import type { InventoryCategory, LoadState } from "../../lib/types";

/** how many lines the compact snapshot shows per filter */
const SNAPSHOT_LIMIT = 6;

export default function StockSnapshotCard({ state }: { state: LoadState }) {
  const [category, setCategory] = useState<InventoryCategory | "All">("All");
  const items = stockSnapshot(category, SNAPSHOT_LIMIT);

  return (
    <section
      aria-labelledby="stock-snapshot-heading"
      className="rounded-xl p-3 sm:rounded-2xl sm:p-5"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
        <h3
          id="stock-snapshot-heading"
          className="text-[13px] font-semibold sm:text-sm"
          style={{ fontFamily: FONT_HEAD, color: C.ink900 }}
        >
          Stock snapshot
        </h3>
        <Link
          href={ROUTES.inventory}
          aria-label="View all inventory"
          className="text-[11px] font-semibold shrink-0 -mr-2 -my-2 px-2 py-2 sm:text-xs sm:-my-1"
          style={{ color: C.brandInk, fontFamily: FONT_BODY }}
        >
          View all
        </Link>
      </div>

      <CategoryFilter
        categories={INVENTORY_CATEGORIES}
        value={category}
        onChange={setCategory}
        className="mb-3"
        label="Filter stock snapshot by category"
      />

      {state === "loading" ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="No inventory in this category." />
      ) : (
        /* two columns once the card has the full content width to work with */
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 sm:gap-y-3">
          {items.map((item) => {
            const low = isLowStock(item);
            const pct = Math.max(0, Math.min(100, (item.qty / item.cap) * 100));
            return (
              <li key={`${item.category}-${item.name}`}>
                <div className="flex items-center justify-between gap-3 text-xs mb-1">
                  <span className="truncate" style={{ color: C.ink700, fontWeight: 500 }}>
                    {item.name}
                  </span>
                  <span
                    className="shrink-0"
                    style={{ fontFamily: FONT_MONO, color: low ? C.danger : C.ink600 }}
                  >
                    {fmtQty(item.qty)} {item.unit}
                    {/* colour alone must not carry the meaning (spec §31) */}
                    {low && <span className="ml-1 font-semibold">· Low</span>}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: C.line }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, background: low ? C.danger : C.brand }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
