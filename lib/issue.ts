import { INVENTORY } from "../data/mockData";
import type { BottleSize, InventoryItem } from "./types";

/**
 * Bottle lines as a form holds them, and the money they come to.
 *
 * Both directions of the distributor relationship are made of the same line:
 * so many bottles of one flavor at one size, valued at a rate that belongs to
 * the size rather than the flavor. Issue Stock writes them going out, Record
 * Payment writes them coming back. Kept out of the components so the
 * arithmetic can be exercised on its own, and reused later by a real save path.
 */

/** One flavor at one bottle size, as a form holds it while being edited. */
export interface BottleLineInput {
  flavor: string;
  bottleSize: BottleSize;
  bottles: string;
}

/** A set of lines with the rate for each size, as a form holds it. */
export interface BottleLineInputs {
  lines: BottleLineInput[];
  largePrice: string | number;
  smallPrice: string | number;
}

export interface LineTotals {
  largeBottles: number;
  smallBottles: number;
  totalBottles: number;
  largeAmount: number;
  smallAmount: number;
  totalAmount: number;
}

/** Bottles on one line, ignoring anything not yet typed. */
export function lineBottles(line: BottleLineInput): number {
  return Math.max(0, Math.floor(Number(line.bottles) || 0));
}

/** Bottles across the lines, or just the lines of one size. */
export function countBottles(lines: BottleLineInput[], size?: BottleSize): number {
  return lines.reduce(
    (sum, line) => (size && line.bottleSize !== size ? sum : sum + lineBottles(line)),
    0,
  );
}

/** Whether any line carries a given size — what makes that size's rate
 *  relevant. A set of small bottles alone never asks for a large rate. */
export function hasSize(lines: BottleLineInput[], size: BottleSize): boolean {
  return lines.some((line) => line.bottleSize === size);
}

/**
 * What the lines come to, as the form stands now — the figure staff watch
 * while they type.
 *
 * The rate is per bottle size, not per flavor: 200 Tamarind and 500 Soursop
 * small bottles are 700 bottles at the one small rate. So each size is its own
 * quantity times its own rate, and the two amounts add up to the total.
 */
export function lineTotals(input: BottleLineInputs): LineTotals {
  const largeBottles = countBottles(input.lines, "LARGE");
  const smallBottles = countBottles(input.lines, "SMALL");
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

/** Bottles of one size the lines would move, per flavor. Two lines of the same
 *  flavor and size are summed, so a stock or outstanding check sees the real
 *  demand. */
export function bottlesByFlavor(
  lines: BottleLineInput[],
  size: BottleSize,
): Map<string, number> {
  const required = new Map<string, number>();
  for (const line of lines) {
    if (!line.flavor || line.bottleSize !== size) continue;
    required.set(line.flavor, (required.get(line.flavor) ?? 0) + lineBottles(line));
  }
  return required;
}
