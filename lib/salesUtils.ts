import type { Sale, SaleTotals } from "./types";

/** Sums a sale's flavor line items into large/small quantity + amount totals */
export function saleTotals(sale: Sale): SaleTotals {
  const large = sale.items.reduce((s, i) => s + i.large, 0);
  const small = sale.items.reduce((s, i) => s + i.small, 0);
  const largeAmt = large * sale.largePrice;
  const smallAmt = small * sale.smallPrice;
  return { large, small, qty: large + small, largeAmt, smallAmt, totalAmt: largeAmt + smallAmt };
}
