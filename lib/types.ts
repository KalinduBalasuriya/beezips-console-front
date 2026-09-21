import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** route this item links to; omitted for group parents, which only expand */
  href?: string;
  /** collapsible submenu (Finance → Expenses / Income / Profit & Loss) */
  children?: NavItem[];
}

export interface Distributor {
  id: number;
  name: string;
  /** ISO business date this distributor was taken on, yyyy-mm-dd */
  joined: string;
  /** negative = distributor owes us (Due), positive = they overpaid (Exceed), 0 = settled */
  balance: number;
}

export interface SaleItem {
  flavor: string;
  large: number;
  small: number;
}

export type SaleStatus = "Paid" | "Due" | "Exceed";

export interface Sale {
  id: number;
  /** ISO business date, yyyy-mm-dd — the sortable/filterable source of truth */
  date: string;
  distributor: string;
  items: SaleItem[];
  largePrice: number;
  smallPrice: number;
  status: SaleStatus;
  statusAmt?: number;
}

export interface SaleTotals {
  large: number;
  small: number;
  qty: number;
  largeAmt: number;
  smallAmt: number;
  totalAmt: number;
}

export type InventoryCategory =
  | "Packaging"
  | "Ingredients"
  | "Fruits"
  | "Utilities"
  | "Finished Goods";

/** One stock line. Finished juice products live here too, under the
 *  "Finished Goods" category, so inventory has a single source of truth. */
export interface InventoryItem {
  name: string;
  category: InventoryCategory;
  /** finished juice is stocked per bottle size, so the same flavor holds one
   *  row per size; undefined for everything else */
  bottleSize?: BottleSize;
  qty: number;
  unit: string;
  /** reorder threshold; qty at or below this is "low stock" */
  reorder: number;
  /** nominal full-stock level, used for the snapshot progress bar */
  cap: number;
  price: number;
  /** ISO business date, yyyy-mm-dd */
  updated: string;
}

export type BottleSize = "LARGE" | "SMALL";

/** A figure held per bottle size — the shape every per-size count on a
 *  production batch takes. */
export interface SizeCounts {
  large: number;
  small: number;
}

/**
 * One flavor within a production batch, carrying both bottle sizes (spec §48.3).
 *
 * A run that bottles the same juice at both sizes is a single row: the fruit is
 * pulped before it is split across sizes, so `kg` is one figure for the flavor
 * while the bottles are counted per size.
 */
export interface ProductionBatch {
  flavor: string;
  /** fruit pulped for this flavor, across both sizes */
  kg: number;
  /** large bottles filled; 0 when the run bottled small only */
  large: number;
  /** small bottles filled; 0 when the run bottled large only */
  small: number;
  /** each mirrors `large`/`small` — a finished bottle consumes exactly one
   *  empty bottle of its own size, one lid and one label, so all three are
   *  auto-filled at save time and never keyed in (spec §48.4) */
  emptyBottlesUsed: SizeCounts;
  lidsUsed: SizeCounts;
  labelsUsed: SizeCounts;
}

/** A raw material consumed by a batch beyond fruit, bottles and lids (§48.6). */
export interface MaterialUsage {
  /** matches InventoryItem.name */
  material: string;
  quantityUsed: number;
  /** denormalised from the inventory item so the row can render standalone */
  unit: string;
}

export interface ProductionDay {
  /** ISO business date, yyyy-mm-dd */
  date: string;
  batches: ProductionBatch[];
  /** consumed by the batch as a whole, not per flavor (spec §48.6) */
  materialsUsed: MaterialUsage[];
  manager: string;
}

export type ExpenseCategory =
  | "Electricity"
  | "Water"
  | "Fuel"
  | "Transport"
  | "Labor"
  | "Rent"
  | "Maintenance"
  | "Other";

export type PaymentMethod = "Cash" | "Bank transfer" | "Cheque";

export interface Expense {
  id: number;
  /** ISO business date, yyyy-mm-dd */
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  method: PaymentMethod;
}

/** Cash actually received from a distributor — distinct from sales issued. */
export interface IncomePayment {
  id: number;
  /** ISO business date, yyyy-mm-dd */
  date: string;
  distributor: string;
  amount: number;
  method: PaymentMethod;
  /** empty bottles returned with the payment */
  bottlesReturned: number;
  reference?: string;
}

export interface StatusStyleEntry {
  bg: string;
  fg: string;
}

export type ModalType =
  | "purchase"
  | "production"
  | "issue"
  | "expense"
  | "income"
  | null;

/** Inclusive ISO date range, e.g. month-to-date. */
export interface DateRange {
  /** ISO yyyy-mm-dd, inclusive */
  start: string;
  /** ISO yyyy-mm-dd, inclusive */
  end: string;
}

/** Async status for dashboard sections (see lib/useDashboardData.ts). */
export type LoadState = "loading" | "ready" | "error";
