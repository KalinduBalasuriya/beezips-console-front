import {
  SALES,
  PRODUCTION_LOG,
  EXPENSES,
  INCOME_PAYMENTS,
  INVENTORY,
  DISTRIBUTORS,
} from "../data/mockData";
import { isWithin, sumInPeriod } from "./period";
import { returnTotals, saleTotals } from "./salesUtils";
import type {
  DateRange,
  IncomePayment,
  SaleItem,
  InventoryCategory,
  InventoryItem,
  MaterialUsage,
  ProductionBatch,
  ProductionDay,
  Sale,
  SizeCounts,
} from "./types";

/**
 * Read model for the dashboard. Every month-to-date figure in the UI comes from
 * here so the period rule (spec §5) is defined once rather than re-derived in
 * each card.
 */

/** Both sizes of a per-size count added together. */
function bothSizes(counts: SizeCounts): number {
  return counts.large + counts.small;
}

/** Bottles a batch row filled, across both sizes. */
function batchBottles(batch: ProductionBatch): number {
  return batch.large + batch.small;
}

/** A per-flavor map as a list: biggest holding first, zero rows left out. */
function ranked(map: Map<string, FlavorBottles>): FlavorBottles[] {
  return [...map.values()]
    .filter((f) => f.large !== 0 || f.small !== 0)
    .sort((a, b) => b.large + b.small - (a.large + a.small));
}

/** SUM(produced bottles) WHERE production date is within the period. */
export function bottlesProduced(range: DateRange): number {
  return sumInPeriod(PRODUCTION_LOG, range, (day) =>
    day.batches.reduce((sum, b) => sum + batchBottles(b), 0),
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

/* ---------- one distributor, issues net of returns ---------- */

/** A bottle count split by size. */
export interface TradeBottles {
  large: number;
  small: number;
  total: number;
}

/**
 * What a distributor has actually bought: bottles issued to them, less the
 * bottles they brought back with a payment.
 *
 * The two sides are separate records — an issue is a sale, a return rides on an
 * income payment — so "actually sold" exists only as this subtraction. 500 small
 * bottles taken across two visits, less 50 returned across two payments, is 450
 * sold; the flavor split nets off the same way. Lifetime figures, not
 * month-to-date: this answers "where does the account stand", which no
 * reporting period should narrow.
 */
export interface DistributorTrade {
  name: string;
  /** issues recorded against them */
  issues: number;
  /** payments that brought at least one bottle back */
  returnVisits: number;
  issued: TradeBottles;
  returned: TradeBottles;
  /** issued less returned — the quantity actually sold */
  net: TradeBottles;
  /** the quantity issued per flavor, biggest first */
  issuedByFlavor: FlavorBottles[];
  /** the quantity returned per flavor, biggest first */
  returnedByFlavor: FlavorBottles[];
  /** the net quantity per flavor, biggest first; flavors fully returned drop out */
  netByFlavor: FlavorBottles[];
  issuedAmount: number;
  /** credit for the bottles that came back, at the rates the payments record */
  returnedAmount: number;
  /** what they actually bought, after that credit — the value they owe for */
  netAmount: number;
  /** cash received from them across every payment */
  received: number;
  /**
   * Where the account stands: received less what they owe for. Negative means
   * they owe us (Due), positive that they have paid ahead (Exceed), zero
   * settled. Stock leaves unpaid, so this is the whole point of the ledger.
   *
   * Always the position today, across every record — a balance is not a period
   * figure, so narrowing the report to a month does not narrow what is owed.
   */
  balance: number;
  /** ISO date of the latest issue or payment, or null when neither exists */
  lastActivity: string | null;
}

export function distributorSales(name: string): Sale[] {
  return sortedSales().filter((s) => s.distributor === name);
}

/** Payments from one distributor, newest first. */
export function distributorPayments(name: string): IncomePayment[] {
  return INCOME_PAYMENTS.filter((p) => p.distributor === name).sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  );
}

/**
 * One movement of bottles between Beezips and a distributor.
 *
 * Stock going out is a sale; stock coming back rides on a payment. They are
 * separate records with separate shapes, but a distributor's history reads as
 * one sequence of "what moved, which way, and what it was worth", so both are
 * flattened into this.
 */
export interface DistributorMovement {
  /** unique across both sources, e.g. `issue-3` or `return-7` */
  id: string;
  kind: "ISSUE" | "RETURN";
  /** ISO business date, yyyy-mm-dd */
  date: string;
  /** whose movement it is — the dashboard lists every distributor's together */
  distributor: string;
  /** the flavors that moved, so the quantities can be opened up */
  items: SaleItem[];
  largePrice: number;
  smallPrice: number;
  large: number;
  small: number;
  /** what the movement was worth: charged on an issue, credited on a return */
  amount: number;
}

/** Every issue and return, newest first, whichever distributor they belong to. */
function allMovements(): DistributorMovement[] {
  const issues: DistributorMovement[] = SALES.map((sale) => {
    const t = saleTotals(sale);
    return {
      id: `issue-${sale.id}`,
      kind: "ISSUE" as const,
      date: sale.date,
      distributor: sale.distributor,
      items: sale.items,
      largePrice: sale.largePrice,
      smallPrice: sale.smallPrice,
      large: t.large,
      small: t.small,
      amount: t.totalAmt,
    };
  });

  const returns: DistributorMovement[] = INCOME_PAYMENTS.map((payment) => {
    const t = returnTotals(payment);
    return {
      id: `return-${payment.id}`,
      kind: "RETURN" as const,
      date: payment.date,
      distributor: payment.distributor,
      items: payment.returns,
      largePrice: payment.largePrice,
      smallPrice: payment.smallPrice,
      large: t.large,
      small: t.small,
      amount: t.totalAmt,
    };
    /* a payment that brought nothing back moved money, not bottles */
  }).filter((m) => m.large + m.small > 0);

  return [...issues, ...returns].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  );
}

/**
 * A distributor's issues and returns, newest first.
 *
 * Payments that brought nothing back are left out — they moved money, not
 * bottles, and belong to the Income register rather than this ledger.
 */
export function distributorMovements(name: string): DistributorMovement[] {
  return allMovements().filter((m) => m.distributor === name);
}

/**
 * The latest bottle movements across every distributor — what the dashboard
 * shows. Issues and returns interleave, so six records may be four issues and
 * two returns rather than six sales.
 */
export function recentMovements(limit: number): DistributorMovement[] {
  return allMovements().slice(0, limit);
}

export function distributorTrade(name: string, range?: DateRange): DistributorTrade {
  const allSales = distributorSales(name);
  const allPayments = distributorPayments(name);
  /* the quantities and values answer for the period asked about; the balance
     below does not, because what is owed is owed whatever the report shows */
  const sales = range ? allSales.filter((s) => isWithin(s.date, range)) : allSales;
  const payments = range
    ? allPayments.filter((p) => isWithin(p.date, range))
    : allPayments;

  /* the two directions are kept apart as well as netted: the profile states
     the subtraction, so each side needs its own flavor split */
  const issuedFlavors = new Map<string, FlavorBottles>();
  const returnedFlavors = new Map<string, FlavorBottles>();
  const entry = (map: Map<string, FlavorBottles>, flavor: string) => {
    const found = map.get(flavor) ?? { flavor, large: 0, small: 0 };
    map.set(flavor, found);
    return found;
  };

  const issued = { large: 0, small: 0 };
  const returned = { large: 0, small: 0 };
  let issuedAmount = 0;
  let returnedAmount = 0;

  for (const sale of sales) {
    for (const item of sale.items) {
      issued.large += item.large;
      issued.small += item.small;
      const e = entry(issuedFlavors, item.flavor);
      e.large += item.large;
      e.small += item.small;
    }
    issuedAmount += saleTotalAmount(sale);
  }

  for (const payment of payments) {
    const t = returnTotals(payment);
    returned.large += t.large;
    returned.small += t.small;
    returnedAmount += t.totalAmt;
    for (const item of payment.returns) {
      const e = entry(returnedFlavors, item.flavor);
      e.large += item.large;
      e.small += item.small;
    }
  }

  const net = { large: issued.large - returned.large, small: issued.small - returned.small };
  const netAmount = issuedAmount - returnedAmount;
  /* every payment counts towards the balance, including ones that brought no
     bottles back — cash and stock are settled against the same account */
  const received = payments.reduce((sum, p) => sum + p.amount, 0);

  /* the account's standing position, from every record rather than the period */
  const owedFor =
    allSales.reduce((sum, s) => sum + saleTotalAmount(s), 0) -
    allPayments.reduce((sum, p) => sum + returnTotals(p).totalAmt, 0);
  const balance = allPayments.reduce((sum, p) => sum + p.amount, 0) - owedFor;

  /* net per flavor: every flavor issued, less whatever came back of it */
  const netFlavors = new Map<string, FlavorBottles>();
  for (const f of issuedFlavors.values()) {
    entry(netFlavors, f.flavor).large += f.large;
    entry(netFlavors, f.flavor).small += f.small;
  }
  for (const f of returnedFlavors.values()) {
    entry(netFlavors, f.flavor).large -= f.large;
    entry(netFlavors, f.flavor).small -= f.small;
  }
  const dates = [...sales.map((s) => s.date), ...payments.map((p) => p.date)].sort();

  return {
    name,
    issues: sales.length,
    returnVisits: payments.filter((p) => returnTotals(p).qty > 0).length,
    issued: { ...issued, total: issued.large + issued.small },
    returned: { ...returned, total: returned.large + returned.small },
    net: { ...net, total: net.large + net.small },
    issuedByFlavor: ranked(issuedFlavors),
    returnedByFlavor: ranked(returnedFlavors),
    netByFlavor: ranked(netFlavors),
    issuedAmount,
    returnedAmount,
    netAmount,
    received,
    balance,
    lastActivity: dates.length ? dates[dates.length - 1] : null,
  };
}

/**
 * Every distributor who traded in the period, biggest net purchase first.
 *
 * One row per distributor, however many times they took stock — the Sales &
 * Distribution list reports what each account bought, not each visit.
 * Distributors with nothing in the period are left out rather than listed as
 * zeroes; the Distributors page is the register of who exists.
 */
export function distributorTrades(range?: DateRange): DistributorTrade[] {
  return DISTRIBUTORS.map((d) => distributorTrade(d.name, range))
    .filter((t) => t.issues > 0 || t.returned.total > 0)
    .sort((a, b) => b.netAmount - a.netAmount);
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
 * Bottles sold within the period, split by size.
 *
 * Net of returns: a distributor who took 500 small bottles and brought 50 back
 * inside the period sold 450 of them, so issues add and returns subtract. That
 * is the same arithmetic the Sales & Distribution table performs, which is why
 * the stat card and that table agree for any one period.
 *
 * Uses the same date rule as every other figure, so records outside the period
 * are excluded at both ends.
 */
export function bottlesSold(range: DateRange): BottlesSold {
  let large = 0;
  let small = 0;
  for (const m of allMovements()) {
    if (!isWithin(m.date, range)) continue;
    const sign = m.kind === "ISSUE" ? 1 : -1;
    large += sign * m.large;
    small += sign * m.small;
  }
  return { large, small, total: large + small };
}

/** The same figure split by flavor, biggest seller first. */
export function bottlesSoldByFlavor(range: DateRange): FlavorBottles[] {
  const totals = new Map<string, FlavorBottles>();
  for (const m of allMovements()) {
    if (!isWithin(m.date, range)) continue;
    const sign = m.kind === "ISSUE" ? 1 : -1;
    for (const item of m.items) {
      const entry = totals.get(item.flavor) ?? { flavor: item.flavor, large: 0, small: 0 };
      entry.large += sign * item.large;
      entry.small += sign * item.small;
      totals.set(item.flavor, entry);
    }
  }
  return ranked(totals);
}

/** Per-flavor lists added together, biggest holding first. */
export function combineFlavorBottles(lists: FlavorBottles[][]): FlavorBottles[] {
  const totals = new Map<string, FlavorBottles>();
  for (const list of lists) {
    for (const f of list) {
      const entry = totals.get(f.flavor) ?? { flavor: f.flavor, large: 0, small: 0 };
      entry.large += f.large;
      entry.small += f.small;
      totals.set(f.flavor, entry);
    }
  }
  return ranked(totals);
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
 * Derived entirely from PRODUCTION_LOG by reading each row's two size counts —
 * there is no precomputed summary to fall out of step with the rows (spec §48.2).
 */
export function bottlesProducedBySize(range: DateRange): BottlesProduced {
  let large = 0;
  let small = 0;
  for (const day of PRODUCTION_LOG) {
    if (!isWithin(day.date, range)) continue;
    for (const batch of day.batches) {
      large += batch.large;
      small += batch.small;
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
      entry.large += batch.large;
      entry.small += batch.small;
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
  const bottles = day.batches.reduce((sum, b) => sum + bothSizes(b.emptyBottlesUsed), 0);
  const lids = day.batches.reduce((sum, b) => sum + bothSizes(b.lidsUsed), 0);
  const labels = day.batches.reduce((sum, b) => sum + bothSizes(b.labelsUsed), 0);
  return { bottles, lids, labels };
}

/* ---------- one production day, broken down (production log table) ---------- */

/** Fruit taken into one production day, grouped by flavor. */
export interface DayFruitUsed {
  /** kilograms across every flavor and size */
  total: number;
  byFlavor: { flavor: string; kg: number }[];
}

/**
 * Fruit consumed by a single day's batches. A flavor bottled at both sizes is
 * one row and so one entry, the fruit having been pulped before it was split
 * across bottle sizes; the map still groups, in case a day lists a flavor twice.
 */
export function dayFruitUsed(day: ProductionDay): DayFruitUsed {
  const totals = new Map<string, number>();
  for (const batch of day.batches) {
    totals.set(batch.flavor, (totals.get(batch.flavor) ?? 0) + batch.kg);
  }
  const byFlavor = [...totals.entries()]
    .map(([flavor, kg]) => ({ flavor, kg }))
    .sort((a, b) => b.kg - a.kg);
  return { total: byFlavor.reduce((sum, f) => sum + f.kg, 0), byFlavor };
}

/** Bottles a single day produced, split by size. */
export function dayBottlesBySize(day: ProductionDay): BottlesProduced {
  let large = 0;
  let small = 0;
  for (const batch of day.batches) {
    large += batch.large;
    small += batch.small;
  }
  return { large, small, total: large + small };
}

/** The same day's bottles grouped by flavor then size, biggest run first. */
export function dayBottlesByFlavor(day: ProductionDay): FlavorProduction[] {
  const totals = new Map<string, FlavorProduction>();
  for (const batch of day.batches) {
    const entry = totals.get(batch.flavor) ?? { flavor: batch.flavor, large: 0, small: 0 };
    entry.large += batch.large;
    entry.small += batch.small;
    totals.set(batch.flavor, entry);
  }
  return [...totals.values()].sort((a, b) => b.large + b.small - (a.large + a.small));
}

/**
 * Everything other than fruit that a production day drew from stock: the
 * packaging implied by the bottles produced (spec §48.4) followed by the
 * materials keyed in against the batch (spec §48.6).
 *
 * Empty bottles are two lines because they are two inventory items — a batch
 * draws on the stock matching the size it is bottling — while lids and labels
 * are one item each. Names match InventoryItem.name so a reader can take this
 * list straight to the Raw materials page. Lines that came to zero are left
 * out rather than shown as an empty draw.
 */
export function dayMaterials(day: ProductionDay): MaterialUsage[] {
  let largeBottles = 0;
  let smallBottles = 0;
  for (const batch of day.batches) {
    largeBottles += batch.emptyBottlesUsed.large;
    smallBottles += batch.emptyBottlesUsed.small;
  }
  const { lids, labels } = dayConsumption(day);

  const packaging: MaterialUsage[] = [
    { material: "Glass bottles (Large)", quantityUsed: largeBottles, unit: "pcs" },
    { material: "Glass bottles (Small)", quantityUsed: smallBottles, unit: "pcs" },
    { material: "Lids", quantityUsed: lids, unit: "pcs" },
    { material: "Labels", quantityUsed: labels, unit: "pcs" },
  ];

  return [...packaging, ...day.materialsUsed].filter((m) => m.quantityUsed > 0);
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
