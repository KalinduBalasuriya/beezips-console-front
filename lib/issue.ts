import { INVENTORY } from "../data/mockData";
import type { BottleSize, InventoryItem } from "./types";

/**
 * Rules behind the Issue Stock form.
 *
 * Issuing bottles to a distributor is the sale record the rest of the app
 * already reads (`Sale` in types.ts): flavor line items at one price per
 * bottle size. Kept out of the component so the money arithmetic can be
 * exercised on its own, and reused later by a real save path.
 */

/** One flavor at one bottle size, as the form holds it while being edited. */
export interface IssueRowInput {
  flavor: string;
  bottleSize: BottleSize;
  bottles: string;
}

/** The issue as the form holds it: any mix of rows, one rate per size. */
export interface IssueInputs {
  rows: IssueRowInput[];
  largePrice: string | number;
  smallPrice: string | number;
}

export interface IssueTotals {
  largeBottles: number;
  smallBottles: number;
  totalBottles: number;
  largeAmount: number;
  smallAmount: number;
  totalAmount: number;
}

/** Bottles on one row, ignoring anything not yet typed. */
export function rowBottles(row: IssueRowInput): number {
  return Math.max(0, Math.floor(Number(row.bottles) || 0));
}

/** Bottles across the rows, or just the rows of one size. */
export function countBottles(rows: IssueRowInput[], size?: BottleSize): number {
  return rows.reduce(
    (sum, row) =>
      size && row.bottleSize !== size ? sum : sum + rowBottles(row),
    0,
  );
}

/** Whether any row is issuing a given size — what makes that size's rate
 *  relevant. An issue of small bottles alone never asks for a large rate. */
export function hasSize(rows: IssueRowInput[], size: BottleSize): boolean {
  return rows.some((row) => row.bottleSize === size);
}

/**
 * What the issue comes to, as the form stands now — the figure staff watch
 * while they type.
 *
 * The rate is per bottle size, not per flavor: 200 Tamarind and 500 Soursop
 * small bottles are 700 bottles at the one small rate. So each size is its own
 * quantity times its own rate, and the two amounts add up to the total.
 */
export function issueTotals(input: IssueInputs): IssueTotals {
  const largeBottles = countBottles(input.rows, "LARGE");
  const smallBottles = countBottles(input.rows, "SMALL");
  const largeRate = Math.max(0, Number(input.largePrice) || 0);
  const smallRate = Math.max(0, Number(input.smallPrice) || 0);
  const largeAmount = largeBottles * largeRate;
  const smallAmount = smallBottles * smallRate;

  return {
    largeBottles,
    smallBottles,
    totalBottles: largeBottles + smallBottles,
    largeAmount,
    smallAmount,
    totalAmount: largeAmount + smallAmount,
  };
}

/** Inventory name for a flavor's finished juice, e.g. `Mango` → `Mango juice`. */
export function finishedItemName(flavor: string): string {
  return `${flavor} juice`;
}

/** The finished-goods row a flavor is issued from — one per flavor per size. */
export function finishedStockFor(
  flavor: string,
  size: BottleSize,
): InventoryItem | undefined {
  const name = finishedItemName(flavor);
  return INVENTORY.find(
    (item) =>
      item.category === "Finished Goods" &&
      item.name === name &&
      item.bottleSize === size,
  );
}

/** Bottles of one size the issue would draw, per flavor. Two rows of the same
 *  flavor and size are summed, so the stock check sees the real demand. */
export function requiredBottles(
  rows: IssueRowInput[],
  size: BottleSize,
): Map<string, number> {
  const required = new Map<string, number>();
  for (const row of rows) {
    if (!row.flavor || row.bottleSize !== size) continue;
    required.set(row.flavor, (required.get(row.flavor) ?? 0) + rowBottles(row));
  }
  return required;
}
