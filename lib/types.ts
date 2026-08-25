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

export interface ProductionBatch {
  flavor: string;
  kg: number;
  bottles: number;
}

export interface ProductionDay {
  /** ISO business date, yyyy-mm-dd */
  date: string;
  batches: ProductionBatch[];
  bottlesUsed: number;
  lidsUsed: number;
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

export type ModalType = "purchase" | "production" | "expense" | "income" | null;

/** Inclusive ISO date range, e.g. month-to-date. */
export interface DateRange {
  /** ISO yyyy-mm-dd, inclusive */
  start: string;
  /** ISO yyyy-mm-dd, inclusive */
  end: string;
}

/** Async status for dashboard sections (see lib/useDashboardData.ts). */
export type LoadState = "loading" | "ready" | "error";
