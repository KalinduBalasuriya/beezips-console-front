import type { IncomePayment, Sale, SaleTotals } from "./types";

/** Sums a sale's flavor line items into large/small quantity + amount totals */
export function saleTotals(sale: Sale): SaleTotals {
  const large = sale.items.reduce((s, i) => s + i.large, 0);
  const small = sale.items.reduce((s, i) => s + i.small, 0);
  const largeAmt = large * sale.largePrice;
  const smallAmt = small * sale.smallPrice;
  return { large, small, qty: large + small, largeAmt, smallAmt, totalAmt: largeAmt + smallAmt };
}

/**
 * The same sums for the bottles a payment brought back, credited at the rates
 * the payment records.
 *
 * Deliberately the same shape as `saleTotals`: a return is an issue in reverse,
 * and the two are subtracted from each other all over the read model.
 */
export function returnTotals(payment: IncomePayment): SaleTotals {
  const large = payment.returns.reduce((s, i) => s + i.large, 0);
  const small = payment.returns.reduce((s, i) => s + i.small, 0);
  const largeAmt = large * payment.largePrice;
  const smallAmt = small * payment.smallPrice;
  return { large, small, qty: large + small, largeAmt, smallAmt, totalAmt: largeAmt + smallAmt };
}
