import { INVENTORY } from "../data/mockData";
import type { BottleSize, InventoryItem } from "./types";

/**
 * Rules behind the Add Production form (spec §48.3–§48.6).
 *
 * Kept out of the component so the auto-fill and shortage arithmetic can be
 * exercised on its own, and reused later by a real save path.
 */

/** One flavor at one bottle size, as the form holds it while being edited. */
export interface ProductionRowInput {
  flavor: string;
  bottleSize: BottleSize;
  kg: string;
  bottles: string;
}

/** One "Add material" row, as the form holds it while being edited. */
export interface MaterialRowInput {
  material: string;
  quantity: string;
}

/* Inventory items every batch draws on automatically. Empty bottles are
   size-specific — a small run cannot be filled from large-bottle stock. */
export const BOTTLE_ITEM: Record<BottleSize, string> = {
  LARGE: "Glass bottles (Large)",
  SMALL: "Glass bottles (Small)",
};
export const LID_ITEM = "Lids";
export const LABEL_ITEM = "Labels";

/** Items production never consumes, so they stay out of the material picker. */
const NOT_A_PRODUCTION_INPUT = ["Cartons (24-pack)"];

/**
 * A finished bottle always consumes exactly one empty bottle of its own size,
 * one lid and one label, so all three follow from Bottles produced and are
 * never keyed in (spec §48.4).
 */
export function autoFillConsumption(bottles: string | number): {
  emptyBottlesUsed: number;
  lidsUsed: number;
  labelsUsed: number;
} {
  const produced = Math.max(0, Math.floor(Number(bottles) || 0));
  return { emptyBottlesUsed: produced, lidsUsed: produced, labelsUsed: produced };
}

/** What the whole batch will consume automatically, as the rows stand now. */
export interface BatchConsumption {
  largeBottles: number;
  smallBottles: number;
  /** one per bottle, whatever the size */
  lids: number;
  labels: number;
  totalBottles: number;
}

/**
 * Running totals across every flavor row — the figure staff watch while they
 * type. Adding a third row of 100 small bottles takes the small count from
 * 100 to 200 without touching the large count.
 */
export function batchConsumption(rows: ProductionRowInput[]): BatchConsumption {
  let largeBottles = 0;
  let smallBottles = 0;
  for (const row of rows) {
    const { emptyBottlesUsed } = autoFillConsumption(row.bottles);
    if (row.bottleSize === "LARGE") largeBottles += emptyBottlesUsed;
    else smallBottles += emptyBottlesUsed;
  }
  const totalBottles = largeBottles + smallBottles;
  return { largeBottles, smallBottles, lids: totalBottles, labels: totalBottles, totalBottles };
}

/**
 * Items selectable in an "Add material" row: everything except fruit (captured
 * by the flavor rows), empty bottles, lids and labels (all auto-filled from
 * bottles produced), cartons (not a production input), and finished goods,
 * which production creates rather than consumes (spec §48.6).
 */
export function selectableMaterials(): InventoryItem[] {
  const automatic = [BOTTLE_ITEM.LARGE, BOTTLE_ITEM.SMALL, LID_ITEM, LABEL_ITEM];
  return INVENTORY.filter(
    (item) =>
      item.category !== "Fruits" &&
      item.category !== "Finished Goods" &&
      !automatic.includes(item.name) &&
      !NOT_A_PRODUCTION_INPUT.includes(item.name),
  );
}

export function findItem(name: string): InventoryItem | undefined {
  return INVENTORY.find((item) => item.name === name);
}

/** Total quantity the batch would consume, per inventory item name. */
export function requiredQuantities(
  rows: ProductionRowInput[],
  materials: MaterialRowInput[],
): Map<string, number> {
  const required = new Map<string, number>();
  const add = (name: string, qty: number) =>
    required.set(name, (required.get(name) ?? 0) + qty);

  for (const row of rows) add(row.flavor, Number(row.kg) || 0);

  const consumption = batchConsumption(rows);
  add(BOTTLE_ITEM.LARGE, consumption.largeBottles);
  add(BOTTLE_ITEM.SMALL, consumption.smallBottles);
  add(LID_ITEM, consumption.lids);
  add(LABEL_ITEM, consumption.labels);

  for (const m of materials) {
    if (m.material) add(m.material, Number(m.quantity) || 0);
  }
  return required;
}
