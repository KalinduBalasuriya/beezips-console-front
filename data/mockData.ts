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
  { id: 1, name: "Kandy Beverages Co.", joined: "2024-02-14", balance: 0 },
  { id: 2, name: "Peradeniya Distributors", joined: "2024-06-03", balance: -4500 },
  { id: 3, name: "Digana Retail Hub", joined: "2025-01-20", balance: 0 },
  { id: 4, name: "Katugastota Traders", joined: "2025-08-11", balance: 1200 },
  { id: 5, name: "Gampola Agents", joined: "2026-03-02", balance: -6000 },
];

/* each sale is broken into flavor line items, each with large/small bottle
   quantities; largePrice/smallPrice are this sale's unit prices */
export const SALES: Sale[] = [
  { id: 1, date: "2026-09-01", distributor: "Kandy Beverages Co.", items: [{ flavor: "Mango", large: 80, small: 40 }, { flavor: "Tamarind", large: 60, small: 40 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 2, date: "2026-09-01", distributor: "Peradeniya Distributors", items: [{ flavor: "Soursop", large: 70, small: 50 }, { flavor: "Mixed fruit", large: 40, small: 20 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 4500 },
  { id: 3, date: "2026-08-31", distributor: "Digana Retail Hub", items: [{ flavor: "Mango", large: 120, small: 60 }, { flavor: "Passion fruit", large: 70, small: 30 }, { flavor: "Tamarind", large: 15, small: 5 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 4, date: "2026-08-31", distributor: "Katugastota Traders", items: [{ flavor: "Mixed fruit", large: 100, small: 50 }], largePrice: 175, smallPrice: 95, status: "Exceed", statusAmt: 1200 },
  { id: 5, date: "2026-08-30", distributor: "Gampola Agents", items: [{ flavor: "Soursop", large: 130, small: 50 }, { flavor: "Mango", large: 20, small: 10 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 6000 },
  { id: 6, date: "2026-08-29", distributor: "Kandy Beverages Co.", items: [{ flavor: "Soursop", large: 90, small: 30 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 7, date: "2026-08-28", distributor: "Peradeniya Distributors", items: [{ flavor: "Mango", large: 60, small: 40 }, { flavor: "Tamarind", large: 40, small: 20 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 8, date: "2026-08-27", distributor: "Digana Retail Hub", items: [{ flavor: "Mixed fruit", large: 80, small: 40 }], largePrice: 175, smallPrice: 95, status: "Due", statusAmt: 3000 },
  { id: 9, date: "2026-08-26", distributor: "Katugastota Traders", items: [{ flavor: "Passion fruit", large: 50, small: 20 }, { flavor: "Mango", large: 30, small: 10 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 10, date: "2026-08-25", distributor: "Gampola Agents", items: [{ flavor: "Tamarind", large: 70, small: 30 }], largePrice: 175, smallPrice: 95, status: "Exceed", statusAmt: 900 },
  /* large-only and small-only transactions — the dashboard renders the missing
     size as an em dash rather than a zero (spec §42) */
  { id: 11, date: "2026-08-24", distributor: "Kandy Beverages Co.", items: [{ flavor: "Mango", large: 140, small: 0 }], largePrice: 175, smallPrice: 95, status: "Paid" },
  { id: 12, date: "2026-08-22", distributor: "Digana Retail Hub", items: [{ flavor: "Passion fruit", large: 0, small: 180 }], largePrice: 175, smallPrice: 95, status: "Paid" },
];

/* full inventory register — raw materials and finished juice stock share one
   model so the category filter can span both (spec §19–22) */
export const INVENTORY: InventoryItem[] = [
  /* empty bottles are a different item per size — a batch draws on the stock
     matching the size it is bottling */
  { name: "Glass bottles (Large)", category: "Packaging", qty: 1800, unit: "pcs", reorder: 600, cap: 3000, price: 118, updated: "2026-09-01" },
  { name: "Glass bottles (Small)", category: "Packaging", qty: 1400, unit: "pcs", reorder: 400, cap: 2000, price: 95, updated: "2026-09-01" },
  { name: "Lids", category: "Packaging", qty: 4100, unit: "pcs", reorder: 1500, cap: 5000, price: 8, updated: "2026-08-31" },
  { name: "Cartons (24-pack)", category: "Packaging", qty: 620, unit: "pcs", reorder: 300, cap: 1200, price: 95, updated: "2026-08-24" },
  { name: "Labels", category: "Packaging", qty: 5200, unit: "pcs", reorder: 2000, cap: 8000, price: 3, updated: "2026-08-24" },
  { name: "Sugar", category: "Ingredients", qty: 85, unit: "kg", reorder: 200, cap: 500, price: 245, updated: "2026-08-29" },
  { name: "Citric acid", category: "Ingredients", qty: 18, unit: "kg", reorder: 20, cap: 60, price: 650, updated: "2026-08-23" },
  { name: "Mango", category: "Fruits", qty: 60, unit: "kg", reorder: 100, cap: 300, price: 220, updated: "2026-09-01" },
  { name: "Soursop", category: "Fruits", qty: 140, unit: "kg", reorder: 100, cap: 300, price: 310, updated: "2026-08-30" },
  { name: "Tamarind", category: "Fruits", qty: 95, unit: "kg", reorder: 100, cap: 300, price: 180, updated: "2026-08-28" },
  { name: "Mixed fruit blend", category: "Fruits", qty: 70, unit: "kg", reorder: 80, cap: 300, price: 260, updated: "2026-08-27" },
  { name: "Passion fruit", category: "Fruits", qty: 40, unit: "kg", reorder: 60, cap: 300, price: 340, updated: "2026-08-26" },
  { name: "LPG gas", category: "Utilities", qty: 3, unit: "cylinders", reorder: 2, cap: 10, price: 4800, updated: "2026-08-25" },
  /* finished juice is held per bottle size — one row per flavor per size, so
     stock can be reported the same way production and sales already are */
  { name: "Mango juice", category: "Finished Goods", bottleSize: "LARGE", qty: 260, unit: "bottles", reorder: 100, cap: 400, price: 175, updated: "2026-09-01" },
  { name: "Mango juice", category: "Finished Goods", bottleSize: "SMALL", qty: 160, unit: "bottles", reorder: 80, cap: 300, price: 95, updated: "2026-09-01" },
  { name: "Soursop juice", category: "Finished Goods", bottleSize: "LARGE", qty: 190, unit: "bottles", reorder: 100, cap: 400, price: 175, updated: "2026-09-01" },
  { name: "Soursop juice", category: "Finished Goods", bottleSize: "SMALL", qty: 120, unit: "bottles", reorder: 80, cap: 300, price: 95, updated: "2026-09-01" },
  { name: "Tamarind juice", category: "Finished Goods", bottleSize: "LARGE", qty: 150, unit: "bottles", reorder: 100, cap: 400, price: 175, updated: "2026-08-31" },
  { name: "Tamarind juice", category: "Finished Goods", bottleSize: "SMALL", qty: 110, unit: "bottles", reorder: 80, cap: 300, price: 95, updated: "2026-08-31" },
  { name: "Mixed fruit juice", category: "Finished Goods", bottleSize: "LARGE", qty: 110, unit: "bottles", reorder: 100, cap: 400, price: 175, updated: "2026-08-31" },
  { name: "Mixed fruit juice", category: "Finished Goods", bottleSize: "SMALL", qty: 70, unit: "bottles", reorder: 80, cap: 300, price: 95, updated: "2026-08-31" },
  { name: "Passion fruit juice", category: "Finished Goods", bottleSize: "LARGE", qty: 50, unit: "bottles", reorder: 100, cap: 400, price: 175, updated: "2026-08-30" },
  { name: "Passion fruit juice", category: "Finished Goods", bottleSize: "SMALL", qty: 40, unit: "bottles", reorder: 80, cap: 300, price: 95, updated: "2026-08-30" },
];

/* full production batch log, used by the "view all" page.
   Each row is one flavor, holding both bottle sizes; empty bottles, lids and
   labels always equal the bottles filled at that size (spec §48.4). */
export const PRODUCTION_LOG: ProductionDay[] = [
  {
    date: "2026-09-01",
    /* Mango is one row carrying both sizes — 600 large and 300 small off 135 kg
       of fruit, pulped once and split at the filler (spec §48.3). */
    batches: [
      { flavor: "Mango", kg: 135, large: 600, small: 300, emptyBottlesUsed: { large: 600, small: 300 }, lidsUsed: { large: 600, small: 300 }, labelsUsed: { large: 600, small: 300 } },
      { flavor: "Tamarind", kg: 60, large: 0, small: 400, emptyBottlesUsed: { large: 0, small: 400 }, lidsUsed: { large: 0, small: 400 }, labelsUsed: { large: 0, small: 400 } },
      { flavor: "Soursop", kg: 36, large: 240, small: 0, emptyBottlesUsed: { large: 240, small: 0 }, lidsUsed: { large: 240, small: 0 }, labelsUsed: { large: 240, small: 0 } },
    ],
    materialsUsed: [
      { material: "Sugar", quantityUsed: 60, unit: "kg" },
      { material: "Citric acid", quantityUsed: 4, unit: "kg" },
    ],
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-31",
    batches: [
      { flavor: "Mixed fruit", kg: 75, large: 500, small: 0, emptyBottlesUsed: { large: 500, small: 0 }, lidsUsed: { large: 500, small: 0 }, labelsUsed: { large: 500, small: 0 } },
      { flavor: "Mango", kg: 54, large: 0, small: 360, emptyBottlesUsed: { large: 0, small: 360 }, lidsUsed: { large: 0, small: 360 }, labelsUsed: { large: 0, small: 360 } },
    ],
    materialsUsed: [
      { material: "Sugar", quantityUsed: 34, unit: "kg" },
    ],
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-30",
    batches: [
      { flavor: "Soursop", kg: 66, large: 440, small: 0, emptyBottlesUsed: { large: 440, small: 0 }, lidsUsed: { large: 440, small: 0 }, labelsUsed: { large: 440, small: 0 } },
      { flavor: "Passion fruit", kg: 21, large: 0, small: 140, emptyBottlesUsed: { large: 0, small: 140 }, lidsUsed: { large: 0, small: 140 }, labelsUsed: { large: 0, small: 140 } },
    ],
    materialsUsed: [
      { material: "Sugar", quantityUsed: 23, unit: "kg" },
      { material: "Citric acid", quantityUsed: 2, unit: "kg" },
    ],
    manager: "N. Dilani",
  },
  {
    date: "2026-08-29",
    batches: [
      { flavor: "Tamarind", kg: 84, large: 560, small: 0, emptyBottlesUsed: { large: 560, small: 0 }, lidsUsed: { large: 560, small: 0 }, labelsUsed: { large: 560, small: 0 } },
    ],
    materialsUsed: [
      { material: "Sugar", quantityUsed: 22, unit: "kg" },
    ],
    manager: "K. Ruwan",
  },
  {
    date: "2026-08-28",
    batches: [
      { flavor: "Mango", kg: 105, large: 700, small: 0, emptyBottlesUsed: { large: 700, small: 0 }, lidsUsed: { large: 700, small: 0 }, labelsUsed: { large: 700, small: 0 } },
      { flavor: "Mixed fruit", kg: 30, large: 0, small: 200, emptyBottlesUsed: { large: 0, small: 200 }, lidsUsed: { large: 0, small: 200 }, labelsUsed: { large: 0, small: 200 } },
    ],
    materialsUsed: [
      { material: "Sugar", quantityUsed: 36, unit: "kg" },
      { material: "LPG gas", quantityUsed: 1, unit: "cylinders" },
    ],
    manager: "N. Dilani",
  },
  {
    date: "2026-08-27",
    batches: [
      { flavor: "Soursop", kg: 51, large: 0, small: 340, emptyBottlesUsed: { large: 0, small: 340 }, lidsUsed: { large: 0, small: 340 }, labelsUsed: { large: 0, small: 340 } },
    ],
    materialsUsed: [{ material: "Sugar", quantityUsed: 14, unit: "kg" }],
    manager: "K. Ruwan",
  },
  {
    /* previous month — excluded from every month-to-date figure */
    date: "2026-08-14",
    batches: [
      { flavor: "Mango", kg: 120, large: 800, small: 0, emptyBottlesUsed: { large: 800, small: 0 }, lidsUsed: { large: 800, small: 0 }, labelsUsed: { large: 800, small: 0 } },
    ],
    materialsUsed: [{ material: "Sugar", quantityUsed: 40, unit: "kg" }],
    manager: "K. Ruwan",
  },
];

/* operating costs — machinery/equipment purchases are tracked under Purchasing
   and deliberately excluded from this register */
export const EXPENSES: Expense[] = [
  { id: 1, date: "2026-09-01", category: "Electricity", description: "Factory power — August meter", amount: 18400, method: "Bank transfer" },
  { id: 2, date: "2026-09-01", category: "Labor", description: "Production floor wages", amount: 15750, method: "Cash" },
  { id: 3, date: "2026-08-31", category: "Fuel", description: "Delivery van diesel", amount: 8000, method: "Cash" },
  { id: 4, date: "2026-08-30", category: "Transport", description: "Fruit collection — Gampola route", amount: 6200, method: "Cash" },
  { id: 5, date: "2026-08-29", category: "Maintenance", description: "Bottling line servicing", amount: 12500, method: "Bank transfer" },
  { id: 6, date: "2026-08-27", category: "Water", description: "Municipal water bill", amount: 4300, method: "Bank transfer" },
  { id: 7, date: "2026-08-26", category: "Rent", description: "Factory unit rent", amount: 45000, method: "Bank transfer" },
  { id: 8, date: "2026-08-24", category: "Fuel", description: "Generator diesel", amount: 5400, method: "Cash" },
  { id: 9, date: "2026-08-20", category: "Other", description: "Packaging design revision", amount: 9000, method: "Cheque" },
  { id: 10, date: "2026-08-18", category: "Labor", description: "Casual loading crew", amount: 7600, method: "Cash" },
  { id: 11, date: "2026-08-13", category: "Electricity", description: "Factory power — July meter", amount: 17200, method: "Bank transfer" },
];

/* cash actually received from distributors — distinct from sales issued */
export const INCOME_PAYMENTS: IncomePayment[] = [
  { id: 1, date: "2026-09-01", distributor: "Kandy Beverages Co.", amount: 32100, method: "Cash", bottlesReturned: 120, reference: "RCP-0091" },
  { id: 2, date: "2026-08-31", distributor: "Digana Retail Hub", amount: 44900, method: "Bank transfer", bottlesReturned: 180, reference: "RCP-0090" },
  { id: 3, date: "2026-08-31", distributor: "Katugastota Traders", amount: 23450, method: "Cash", bottlesReturned: 90, reference: "RCP-0089" },
  { id: 4, date: "2026-08-30", distributor: "Peradeniya Distributors", amount: 21400, method: "Cash", bottlesReturned: 70, reference: "RCP-0088" },
  { id: 5, date: "2026-08-29", distributor: "Kandy Beverages Co.", amount: 18600, method: "Bank transfer", bottlesReturned: 110, reference: "RCP-0087" },
  { id: 6, date: "2026-08-28", distributor: "Peradeniya Distributors", amount: 23200, method: "Cash", bottlesReturned: 60, reference: "RCP-0086" },
  { id: 7, date: "2026-08-26", distributor: "Katugastota Traders", amount: 16850, method: "Cheque", bottlesReturned: 55, reference: "RCP-0085" },
  { id: 8, date: "2026-08-25", distributor: "Gampola Agents", amount: 16000, method: "Cash", bottlesReturned: 80, reference: "RCP-0084" },
  { id: 9, date: "2026-08-21", distributor: "Digana Retail Hub", amount: 14800, method: "Bank transfer", bottlesReturned: 40, reference: "RCP-0083" },
  { id: 10, date: "2026-08-15", distributor: "Kandy Beverages Co.", amount: 28500, method: "Cash", bottlesReturned: 95, reference: "RCP-0082" },
];

export const STATUS_STYLE: Record<SaleStatus, StatusStyleEntry> = {
  Paid: { bg: C.successBg, fg: C.success },
  Due: { bg: C.dangerBg, fg: C.danger },
  Exceed: { bg: C.infoBg, fg: C.info },
};
