import {
  SALES,
  PRODUCTION_LOG,
  EXPENSES,
  INCOME_PAYMENTS,
  INVENTORY,
} from "../data/mockData";
import { isWithin, sumInPeriod } from "./period";
import type {
  DateRange,
  InventoryCategory,
  InventoryItem,
  ProductionDay,
  Sale,
} from "./types";

/**
 * Read model for the dashboard. Every month-to-date figure in the UI comes from
 * here so the period rule (spec §5) is defined once rather than re-derived in
 * each card.
 */

/** SUM(produced bottles) WHERE production date is within the period. */
export function bottlesProduced(range: DateRange): number {
  return sumInPeriod(PRODUCTION_LOG, range, (day) =>
    day.batches.reduce((sum, b) => sum + b.bottles, 0),
  );
}

/** SUM(cash actually received) WHERE payment date is within the period.
 *  Reads income/payment records, not sales issued — a sale of 100,000 against
 *  which 60,000 was received contributes 60,000. */
export function cashCollected(range: DateRange): number {
  return sumInPeriod(INCOME_PAYMENTS, range, (p) => p.amount);
}

/** SUM(expense amount) WHERE expense date is within the period. */
export function totalExpenses(range: DateRange): number {
  return sumInPeriod(EXPENSES, range, (e) => e.amount);
}

/** Value of sales issued in the period — the revenue side of profit & loss.
 *  Distinct from cashCollected, which only counts money actually received. */
export function salesIssued(range: DateRange): number {
  return sumInPeriod(SALES, range, (s) => saleTotalAmount(s));
}

export interface ProfitLoss {
  cashCollected: number;
  salesIssued: number;
  expenses: number;
  /** cash collected less expenses — the realised position for the period */
  net: number;
}

export function profitAndLoss(range: DateRange): ProfitLoss {
  const collected = cashCollected(range);
  const expenses = totalExpenses(range);
  return {
    cashCollected: collected,
    salesIssued: salesIssued(range),
    expenses,
    net: collected - expenses,
  };
}

/** Total value of one sale, used by both the sales pages and P&L. */
function saleTotalAmount(sale: Sale): number {
  const large = sale.items.reduce((s, i) => s + i.large, 0);
  const small = sale.items.reduce((s, i) => s + i.small, 0);
  return large * sale.largePrice + small * sale.smallPrice;
}

/** Most recent sales, newest first. One transaction stays one row (spec §15). */
export function recentSales(limit: number): Sale[] {
  return sortedSales().slice(0, limit);
}

/** All sales, newest first. */
export function sortedSales(): Sale[] {
  return [...SALES].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

export function expensesInPeriod(range: DateRange) {
  return EXPENSES.filter((e) => isWithin(e.date, range)).sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  );
}

export function incomeInPeriod(range: DateRange) {
  return INCOME_PAYMENTS.filter((p) => isWithin(p.date, range)).sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  );
}

/** Expense totals by category, largest first — drives the P&L breakdown. */
export function expensesByCategory(
  range: DateRange,
): { category: string; amount: number }[] {
  const totals = new Map<string, number>();
  for (const e of expensesInPeriod(range)) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Inventory filtered by category; `"All"` returns everything. */
export function inventoryByCategory(
  category: InventoryCategory | "All",
): InventoryItem[] {
  return category === "All"
    ? INVENTORY
    : INVENTORY.filter((i) => i.category === category);
}

/** An item is low when it has fallen to or below its reorder threshold. */
export function isLowStock(item: InventoryItem): boolean {
  return item.qty <= item.reorder;
}

/** Snapshot slice for the dashboard card: the most at-risk items first, so the
 *  compact view surfaces what needs attention rather than an arbitrary head. */
export function stockSnapshot(
  category: InventoryCategory | "All",
  limit: number,
): InventoryItem[] {
  return [...inventoryByCategory(category)]
    .sort((a, b) => a.qty / a.cap - b.qty / b.cap)
    .slice(0, limit);
}

/* ---------- bottles sold to distributors (spec §47) ---------- */

export interface BottlesSold {
  large: number;
  small: number;
  total: number;
}

/** Per-flavor split of the bottles issued in a period. */
export interface FlavorBottles {
  flavor: string;
  large: number;
  small: number;
}

/**
 * Finished-product bottles issued to distributors within the period, split by
 * size. Uses the same month-to-date rule as every other dashboard figure, so
 * sales from previous months and anything dated after today are excluded.
 */
export function bottlesSold(range: DateRange): BottlesSold {
  let large = 0;
  let small = 0;
  for (const sale of SALES) {
    if (!isWithin(sale.date, range)) continue;
    for (const item of sale.items) {
      large += item.large;
      small += item.small;
    }
  }
  return { large, small, total: large + small };
}

/**
 * The same quantities broken down by flavor, biggest seller first — the detail
 * behind the Large/Small figures. Derived from the sale line items, never a
 * fixed flavor list, so a new flavor appears here as soon as it is sold.
 */
export function bottlesSoldByFlavor(range: DateRange): FlavorBottles[] {
  const totals = new Map<string, FlavorBottles>();
  for (const sale of SALES) {
    if (!isWithin(sale.date, range)) continue;
    for (const item of sale.items) {
      const entry = totals.get(item.flavor) ?? {
        flavor: item.flavor,
        large: 0,
        small: 0,
      };
      entry.large += item.large;
      entry.small += item.small;
      totals.set(item.flavor, entry);
    }
  }
  return [...totals.values()].sort(
    (a, b) => b.large + b.small - (a.large + a.small),
  );
}

/* ---------- bottles produced, by size and flavor (spec §48.2) ---------- */

export interface BottlesProduced {
  large: number;
  small: number;
  total: number;
}

/** Per-flavor split of the bottles produced in a period. */
export interface FlavorProduction {
  flavor: string;
  large: number;
  small: number;
}

/**
 * Bottles produced within the period, split by bottle size.
 *
 * Derived entirely from PRODUCTION_LOG by grouping on `bottleSize` — there is
 * no precomputed summary to fall out of step with the rows (spec §48.2).
 */
export function bottlesProducedBySize(range: DateRange): BottlesProduced {
  let large = 0;
  let small = 0;
  for (const day of PRODUCTION_LOG) {
    if (!isWithin(day.date, range)) continue;
    for (const batch of day.batches) {
      if (batch.bottleSize === "LARGE") large += batch.bottles;
      else small += batch.bottles;
    }
  }
  return { large, small, total: large + small };
}

/**
 * The same quantities grouped by flavor then size, biggest producer first.
 * Built from the batch rows, so a newly produced flavor appears automatically.
 */
export function bottlesProducedByFlavor(range: DateRange): FlavorProduction[] {
  const totals = new Map<string, FlavorProduction>();
  for (const day of PRODUCTION_LOG) {
    if (!isWithin(day.date, range)) continue;
    for (const batch of day.batches) {
      const entry = totals.get(batch.flavor) ?? { flavor: batch.flavor, large: 0, small: 0 };
      if (batch.bottleSize === "LARGE") entry.large += batch.bottles;
      else entry.small += batch.bottles;
      totals.set(batch.flavor, entry);
    }
  }
  return [...totals.values()].sort((a, b) => b.large + b.small - (a.large + a.small));
}

/** Empty bottles, lids and labels a production day consumed — each always the
 *  sum of its bottles produced, never a separate entry (spec §48.4). */
export function dayConsumption(day: ProductionDay): {
  bottles: number;
  lids: number;
  labels: number;
} {
  const bottles = day.batches.reduce((sum, b) => sum + b.emptyBottlesUsed, 0);
  const lids = day.batches.reduce((sum, b) => sum + b.lidsUsed, 0);
  const labels = day.batches.reduce((sum, b) => sum + b.labelsUsed, 0);
  return { bottles, lids, labels };
}

/* ---------- finished juice in stock, by size and flavor ---------- */

export interface FinishedStock {
  large: number;
  small: number;
  total: number;
}

/** Per-flavor split of the finished bottles on hand. */
export interface FlavorStock {
  flavor: string;
  large: number;
  small: number;
}

/**
 * Finished bottles currently in stock, split by size.
 *
 * This is a stock level, not a period figure — it answers "what is on the
 * shelf right now", so unlike the produced and sold cards it takes no date
 * range. Read straight off the inventory rows, which hold one row per flavor
 * per size.
 */
export function finishedStock(): FinishedStock {
  let large = 0;
  let small = 0;
  for (const item of INVENTORY) {
    if (item.category !== "Finished Goods") continue;
    if (item.bottleSize === "LARGE") large += item.qty;
    else if (item.bottleSize === "SMALL") small += item.qty;
  }
  return { large, small, total: large + small };
}

/**
 * The same stock grouped by flavor, largest holding first. The juice name is
 * shown as-is, so "Mango juice" reads the way it does on the Inventory page.
 */
export function finishedStockByFlavor(): FlavorStock[] {
  const totals = new Map<string, FlavorStock>();
  for (const item of INVENTORY) {
    if (item.category !== "Finished Goods") continue;
    const entry = totals.get(item.name) ?? { flavor: item.name, large: 0, small: 0 };
    if (item.bottleSize === "LARGE") entry.large += item.qty;
    else if (item.bottleSize === "SMALL") entry.small += item.qty;
    totals.set(item.name, entry);
  }
  return [...totals.values()].sort((a, b) => b.large + b.small - (a.large + a.small));
}

/** Stable identity for an inventory row: the same juice exists at two sizes,
 *  so name and category alone are not unique. */
export function inventoryKey(item: InventoryItem): string {
  return `${item.category}-${item.name}-${item.bottleSize ?? "NA"}`;
}

/** Display name including the bottle size where one applies. */
export function inventoryLabel(item: InventoryItem): string {
  if (!item.bottleSize) return item.name;
  return `${item.name} (${item.bottleSize === "LARGE" ? "Large" : "Small"})`;
}
