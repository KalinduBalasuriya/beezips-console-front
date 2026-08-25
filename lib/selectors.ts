import { SALES, PRODUCTION_LOG, EXPENSES, INCOME_PAYMENTS, INVENTORY } from "../data/mockData";
import { isWithin, sumInPeriod } from "./period";
import type { DateRange, InventoryCategory, InventoryItem, Sale } from "./types";

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
export function expensesByCategory(range: DateRange): { category: string; amount: number }[] {
  const totals = new Map<string, number>();
  for (const e of expensesInPeriod(range)) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Inventory filtered by category; `"All"` returns everything. */
export function inventoryByCategory(category: InventoryCategory | "All"): InventoryItem[] {
  return category === "All" ? INVENTORY : INVENTORY.filter((i) => i.category === category);
}

/** An item is low when it has fallen to or below its reorder threshold. */
export function isLowStock(item: InventoryItem): boolean {
  return item.qty <= item.reorder;
}

/** Snapshot slice for the dashboard card: the most at-risk items first, so the
 *  compact view surfaces what needs attention rather than an arbitrary head. */
export function stockSnapshot(category: InventoryCategory | "All", limit: number): InventoryItem[] {
  return [...inventoryByCategory(category)]
    .sort((a, b) => a.qty / a.cap - b.qty / b.cap)
    .slice(0, limit);
}
