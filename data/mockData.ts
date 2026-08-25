import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Truck,
  Boxes,
  Users,
  FileBarChart,
  Wallet,
  Receipt,
  HandCoins,
  TrendingUp,
} from "lucide-react";
import { C } from "../lib/theme";
import { ROUTES } from "../lib/routes";
import type {
  NavItem,
  Distributor,
  Sale,
  InventoryItem,
  ProductionDay,
  Expense,
  IncomePayment,
  InventoryCategory,
  StatusStyleEntry,
  SaleStatus,
} from "../lib/types";

/* Finance is a collapsible group; its children are the only place Expenses,
   Income and Profit & Loss appear in the nav (spec §4). */
export const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.dashboard },
  { label: "Purchasing", icon: ShoppingCart, href: ROUTES.purchasing },
  { label: "Production", icon: Factory, href: ROUTES.production },
  { label: "Sales & distribution", icon: Truck, href: ROUTES.sales },
  { label: "Inventory", icon: Boxes, href: ROUTES.inventory },
  { label: "Distributors", icon: Users, href: ROUTES.distributors },
  {
    label: "Finance",
    icon: Wallet,
    children: [
      { label: "Expenses", icon: Receipt, href: ROUTES.financeExpenses },
      { label: "Income", icon: HandCoins, href: ROUTES.financeIncome },
      { label: "Profit & Loss", icon: TrendingUp, href: ROUTES.financeProfitLoss },
    ],
  },
  { label: "Reports", icon: FileBarChart, href: ROUTES.reports },
];

export const FLAVORS: string[] = ["Mango", "Soursop", "Tamarind", "Mixed fruit", "Passion fruit"];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  "Packaging",
  "Ingredients",
  "Fruits",
  "Utilities",
  "Finished Goods",
];

export const DISTRIBUTORS: Distributor[] = [
  { id: 1, name: "Kandy Beverages Co.", balance: 0 },
  { id: 2, name: "Peradeniya Distributors", balance: -4500 },
  { id: 3, name: "Digana Retail Hub", balance: 0 },
  { id: 4, name: "Katugastota Traders", balance: 1200 },
  { id: 5, name: "Gampola Agents", balance: -6000 },
];

/* each sale is broken into flavor line items, each with large/small bottle
   quantities; largePrice/smallPrice are this sale's unit prices */
export const SALES: Sale[] = [
  { id: 1, date: "2026-08-17", distributor: "Kandy Beverages Co.", items: [{ flavor: "Mango", large: 80, small: 40 }, { flavor: "Tamarind", large: 60, small: 40 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 2, date: "2026-08-17", distributor: "Peradeniya Distributors", items: [{ flavor: "Soursop", large: 70, small: 50 }, { flavor: "Mixed fruit", large: 40, small: 20 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 4500 },
  { id: 3, date: "2026-08-16", distributor: "Digana Retail Hub", items: [{ flavor: "Mango", large: 120, small: 60 }, { flavor: "Passion fruit", large: 70, small: 30 }, { flavor: "Tamarind", large: 15, small: 5 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 4, date: "2026-08-16", distributor: "Katugastota Traders", items: [{ flavor: "Mixed fruit", large: 100, small: 50 }], largePrice: 175, smallPrice: 95, status: "Exceed", statusAmt: 1200 },
  { id: 5, date: "2026-08-15", distributor: "Gampola Agents", items: [{ flavor: "Soursop", large: 130, small: 50 }, { flavor: "Mango", large: 20, small: 10 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 6000 },
  { id: 6, date: "2026-08-14", distributor: "Kandy Beverages Co.", items: [{ flavor: "Soursop", large: 90, small: 30 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 7, date: "2026-08-13", distributor: "Peradeniya Distributors", items: [{ flavor: "Mango", large: 60, small: 40 }, { flavor: "Tamarind", large: 40, small: 20 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 8, date: "2026-08-12", distributor: "Digana Retail Hub", items: [{ flavor: "Mixed fruit", large: 80, small: 40 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 3000 },
  { id: 9, date: "2026-08-11", distributor: "Katugastota Traders", items: [{ flavor: "Passion fruit", large: 50, small: 20 }, { flavor: "Mango", large: 30, small: 10 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 10, date: "2026-08-10", distributor: "Gampola Agents", items: [{ flavor: "Tamarind", large: 70, small: 30 }], largePrice: 175, smallPrice: 95, status: "Exceed", statusAmt: 900 },
  /* large-only and small-only transactions — the dashboard renders the missing
     size as an em dash rather than a zero (spec §42) */
  { id: 11, date: "2026-08-09", distributor: "Kandy Beverages Co.", items: [{ flavor: "Mango", large: 140, small: 0 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 12, date: "2026-08-07", distributor: "Digana Retail Hub", items: [{ flavor: "Passion fruit", large: 0, small: 180 }], largePrice: 175, smallPrice: 95, status: "Paid" },
];

/* full inventory register — raw materials and finished juice stock share one
   model so the category filter can span both (spec §19–22) */
export const INVENTORY: InventoryItem[] = [
  { name: "Glass bottles", category: "Packaging", qty: 3200, unit: "pcs", reorder: 1000, cap: 5000, price: 118, updated: "2026-08-17" },
  { name: "Lids", category: "Packaging", qty: 4100, unit: "pcs", reorder: 1500, cap: 5000, price: 8, updated: "2026-08-16" },
  { name: "Cartons (24-pack)", category: "Packaging", qty: 620, unit: "pcs", reorder: 300, cap: 1200, price: 95, updated: "2026-08-09" },
  { name: "Labels", category: "Packaging", qty: 5200, unit: "pcs", reorder: 2000, cap: 8000, price: 3, updated: "2026-08-09" },
  { name: "Sugar", category: "Ingredients", qty: 85, unit: "kg", reorder: 200, cap: 500, price: 245, updated: "2026-08-14" },
  { name: "Citric acid", category: "Ingredients", qty: 18, unit: "kg", reorder: 20, cap: 60, price: 650, updated: "2026-08-08" },
  { name: "Mango", category: "Fruits", qty: 60, unit: "kg", reorder: 100, cap: 300, price: 220, updated: "2026-08-17" },
  { name: "Soursop", category: "Fruits", qty: 140, unit: "kg", reorder: 100, cap: 300, price: 310, updated: "2026-08-15" },
  { name: "Tamarind", category: "Fruits", qty: 95, unit: "kg", reorder: 100, cap: 300, price: 180, updated: "2026-08-13" },
  { name: "Mixed fruit blend", category: "Fruits", qty: 70, unit: "kg", reorder: 80, cap: 300, price: 260, updated: "2026-08-12" },
  { name: "Passion fruit", category: "Fruits", qty: 40, unit: "kg", reorder: 60, cap: 300, price: 340, updated: "2026-08-11" },
  { name: "LPG gas", category: "Utilities", qty: 3, unit: "cylinders", reorder: 2, cap: 10, price: 4800, updated: "2026-08-10" },
  { name: "Mango juice", category: "Finished Goods", qty: 420, unit: "bottles", reorder: 150, cap: 600, price: 175, updated: "2026-08-17" },
  { name: "Soursop juice", category: "Finished Goods", qty: 310, unit: "bottles", reorder: 150, cap: 600, price: 175, updated: "2026-08-17" },
  { name: "Tamarind juice", category: "Finished Goods", qty: 260, unit: "bottles", reorder: 150, cap: 600, price: 175, updated: "2026-08-16" },
  { name: "Mixed fruit juice", category: "Finished Goods", qty: 180, unit: "bottles", reorder: 150, cap: 600, price: 175, updated: "2026-08-16" },
  { name: "Passion fruit juice", category: "Finished Goods", qty: 90, unit: "bottles", reorder: 150, cap: 600, price: 175, updated: "2026-08-15" },
];

/* full production batch log, used by the "view all" page */
export const PRODUCTION_LOG: ProductionDay[] = [
  {
    date: "2026-08-17",
    batches: [
      { flavor: "Mango", kg: 90, bottles: 600 },
      { flavor: "Tamarind", kg: 60, bottles: 400 },
      { flavor: "Soursop", kg: 36, bottles: 240 },
    ],
    bottlesUsed: 1240,
    lidsUsed: 1240,
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-16",
    batches: [
      { flavor: "Mixed fruit", kg: 75, bottles: 500 },
      { flavor: "Mango", kg: 54, bottles: 360 },
    ],
    bottlesUsed: 860,
    lidsUsed: 860,
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-15",
    batches: [
      { flavor: "Soursop", kg: 66, bottles: 440 },
      { flavor: "Passion fruit", kg: 21, bottles: 140 },
    ],
    bottlesUsed: 580,
    lidsUsed: 580,
    manager: "N. Dilani",
  },
  {
    date: "2026-08-14",
    batches: [{ flavor: "Tamarind", kg: 84, bottles: 560 }],
    bottlesUsed: 560,
    lidsUsed: 560,
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-13",
    batches: [
      { flavor: "Mango", kg: 105, bottles: 700 },
      { flavor: "Mixed fruit", kg: 30, bottles: 200 },
    ],
    bottlesUsed: 900,
    lidsUsed: 900,
    manager: "N. Dilani",
  },
  {
    date: "2026-08-12",
    batches: [{ flavor: "Soursop", kg: 51, bottles: 340 }],
    bottlesUsed: 340,
    lidsUsed: 340,
    manager: "K. Ruwan",
  },
  {
    date: "2026-07-30",
    batches: [{ flavor: "Mango", kg: 120, bottles: 800 }],
    bottlesUsed: 800,
    lidsUsed: 800,
    manager: "K. Ruwan",
  },
];

/* operating costs — machinery/equipment purchases are tracked under Purchasing
   and deliberately excluded from this register */
export const EXPENSES: Expense[] = [
  { id: 1, date: "2026-08-17", category: "Electricity", description: "Factory power — August meter", amount: 18400, method: "Bank transfer" },
  { id: 2, date: "2026-08-17", category: "Labor", description: "Production floor wages", amount: 15750, method: "Cash" },
  { id: 3, date: "2026-08-16", category: "Fuel", description: "Delivery van diesel", amount: 8000, method: "Cash" },
  { id: 4, date: "2026-08-15", category: "Transport", description: "Fruit collection — Gampola route", amount: 6200, method: "Cash" },
  { id: 5, date: "2026-08-14", category: "Maintenance", description: "Bottling line servicing", amount: 12500, method: "Bank transfer" },
  { id: 6, date: "2026-08-12", category: "Water", description: "Municipal water bill", amount: 4300, method: "Bank transfer" },
  { id: 7, date: "2026-08-11", category: "Rent", description: "Factory unit rent", amount: 45000, method: "Bank transfer" },
  { id: 8, date: "2026-08-09", category: "Fuel", description: "Generator diesel", amount: 5400, method: "Cash" },
  { id: 9, date: "2026-08-05", category: "Other", description: "Packaging design revision", amount: 9000, method: "Cheque" },
  { id: 10, date: "2026-08-03", category: "Labor", description: "Casual loading crew", amount: 7600, method: "Cash" },
  { id: 11, date: "2026-07-29", category: "Electricity", description: "Factory power — July meter", amount: 17200, method: "Bank transfer" },
];

/* cash actually received from distributors — distinct from sales issued */
export const INCOME_PAYMENTS: IncomePayment[] = [
  { id: 1, date: "2026-08-17", distributor: "Kandy Beverages Co.", amount: 32100, method: "Cash", bottlesReturned: 120, reference: "RCP-0091" },
  { id: 2, date: "2026-08-16", distributor: "Digana Retail Hub", amount: 44900, method: "Bank transfer", bottlesReturned: 180, reference: "RCP-0090" },
  { id: 3, date: "2026-08-16", distributor: "Katugastota Traders", amount: 23450, method: "Cash", bottlesReturned: 90, reference: "RCP-0089" },
  { id: 4, date: "2026-08-15", distributor: "Peradeniya Distributors", amount: 21400, method: "Cash", bottlesReturned: 70, reference: "RCP-0088" },
  { id: 5, date: "2026-08-14", distributor: "Kandy Beverages Co.", amount: 18600, method: "Bank transfer", bottlesReturned: 110, reference: "RCP-0087" },
  { id: 6, date: "2026-08-13", distributor: "Peradeniya Distributors", amount: 23200, method: "Cash", bottlesReturned: 60, reference: "RCP-0086" },
  { id: 7, date: "2026-08-11", distributor: "Katugastota Traders", amount: 16850, method: "Cheque", bottlesReturned: 55, reference: "RCP-0085" },
  { id: 8, date: "2026-08-10", distributor: "Gampola Agents", amount: 16000, method: "Cash", bottlesReturned: 80, reference: "RCP-0084" },
  { id: 9, date: "2026-08-06", distributor: "Digana Retail Hub", amount: 14800, method: "Bank transfer", bottlesReturned: 40, reference: "RCP-0083" },
  { id: 10, date: "2026-07-31", distributor: "Kandy Beverages Co.", amount: 28500, method: "Cash", bottlesReturned: 95, reference: "RCP-0082" },
];

export const STATUS_STYLE: Record<SaleStatus, StatusStyleEntry> = {
  Paid: { bg: C.successBg, fg: C.success },
  Due: { bg: C.dangerBg, fg: C.danger },
  Exceed: { bg: C.infoBg, fg: C.info },
};
