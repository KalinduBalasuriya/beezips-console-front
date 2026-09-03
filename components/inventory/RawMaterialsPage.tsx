"use client";

import { useMemo, useState } from "react";
import { Boxes, Plus, Search, PackageSearch } from "lucide-react";
import { INVENTORY_CATEGORIES } from "../../data/mockData";
import { inventoryByCategory, inventoryKey, inventoryLabel, isLowStock } from "../../lib/selectors";
import { money, qty as fmtQty, shortDate } from "../../lib/format";
import { C, FONT_BODY, FONT_MONO } from "../../lib/theme";
import PageHeader from "../ui/PageHeader";
import CategoryFilter from "./CategoryFilter";
import { useModals } from "../layout/AppShell";
import { EmptyState } from "../ui/States";
import type { InventoryCategory } from "../../lib/types";

/** The full Inventory register — raw materials and finished goods. */
export default function InventoryPage() {
  const { open } = useModals();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "All">("All");

  const rows = useMemo(
    () =>
      inventoryByCategory(category).filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const lowCount = rows.filter(isLowStock).length;

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      <PageHeader
        icon={Boxes}
        title="Inventory"
        subtitle={`${rows.length} items tracked · ${lowCount} below reorder level`}
        action={
          <button
            onClick={() => open("purchase")}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 min-h-11 text-[13px] sm:text-sm font-semibold w-full sm:w-auto shrink-0 transition-transform active:scale-[0.98]"
            style={{ fontFamily: FONT_BODY, color: C.ink900, background: C.brand }}
          >
            <Plus size={15} aria-hidden /> Add purchase
          </button>
        }
      />

      <div className="flex flex-col gap-2.5 mb-3 sm:flex-row sm:items-center sm:gap-3 sm:mb-5">
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-1.5 min-h-11 w-full sm:w-auto shrink-0"
          style={{ background: C.card, border: `1px solid ${C.line}` }}
        >
          <Search size={15} color={C.ink400} className="shrink-0" aria-hidden />
          <input
            placeholder="Search inventory..."
            aria-label="Search inventory by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base sm:text-sm outline-none bg-transparent w-full sm:w-47.5 min-w-0"
            style={{ fontFamily: FONT_BODY, color: C.ink900 }}
          />
        </div>
        <CategoryFilter
          categories={INVENTORY_CATEGORIES}
          value={category}
          onChange={setCategory}
          label="Filter inventory by category"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No inventory matches your search." />
      ) : (
        <>
          {/* mobile / tablet: one card per item */}
          <div className="md:hidden space-y-2.5">
            {rows.map((m) => {
              const low = isLowStock(m);
              return (
                <div
                  key={inventoryKey(m)}
                  className="rounded-xl p-3"
                  style={{ background: C.card, border: `1px solid ${C.line}`, fontFamily: FONT_BODY }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PackageSearch size={15} color={C.ink400} className="shrink-0" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate" style={{ color: C.ink900 }}>
                          {inventoryLabel(m)}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: C.ink400 }}>
                          {m.category} · updated {shortDate(m.updated)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0 whitespace-nowrap"
                      style={{
                        background: low ? C.dangerBg : C.successBg,
                        color: low ? C.danger : C.success,
                      }}
                    >
                      {low ? "Low stock" : "In stock"}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                        In stock
                      </p>
                      <p className="text-[13px]" style={{ fontFamily: FONT_MONO, color: low ? C.danger : C.ink900 }}>
                        {fmtQty(m.qty)} {m.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                        Reorder at
                      </p>
                      <p className="text-[13px]" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                        {fmtQty(m.reorder)} {m.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: C.ink400 }}>
                        Unit price
                      </p>
                      <p className="text-[13px] font-medium" style={{ fontFamily: FONT_MONO, color: C.ink900 }}>
                        {money(m.price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* desktop: full table */}
          <div className="hidden md:block rounded-2xl" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="overflow-x-auto scroll-touch">
              <table className="w-full text-sm" style={{ fontFamily: FONT_BODY }}>
                <thead>
                  <tr style={{ color: C.ink400 }}>
                    {["Item", "Category", "Current stock", "Reorder level", "Last unit price", "Updated", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          scope="col"
                          className="text-left font-medium px-5 py-2.5 text-xs uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => {
                    const low = isLowStock(m);
                    return (
                      <tr key={inventoryKey(m)} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td className="px-5 py-3 font-medium whitespace-nowrap" style={{ color: C.ink900 }}>
                          <span className="flex items-center gap-2.5">
                            <PackageSearch size={14} color={C.ink400} className="shrink-0" aria-hidden />
                            {inventoryLabel(m)}
                          </span>
                        </td>
                        <td className="px-5 py-3" style={{ color: C.ink600 }}>
                          {m.category}
                        </td>
                        <td
                          className="px-5 py-3 whitespace-nowrap"
                          style={{ fontFamily: FONT_MONO, color: low ? C.danger : C.ink900 }}
                        >
                          {fmtQty(m.qty)} {m.unit}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap" style={{ fontFamily: FONT_MONO, color: C.ink600 }}>
                          {fmtQty(m.reorder)} {m.unit}
                        </td>
                        <td
                          className="px-5 py-3 font-medium whitespace-nowrap"
                          style={{ fontFamily: FONT_MONO, color: C.ink900 }}
                        >
                          {money(m.price)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap" style={{ color: C.ink600 }}>
                          {shortDate(m.updated)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
                            style={{
                              background: low ? C.dangerBg : C.successBg,
                              color: low ? C.danger : C.success,
                            }}
                          >
                            {low ? "Low stock" : "In stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
