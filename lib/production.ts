import type { ProductionOutput } from "./schemas";
import type { CreateProductionRequest } from "./api/types";

/**
 * Rules behind the Add Production form (spec §48.3–§48.6).
 *
 * Kept out of the component so the auto-fill arithmetic and the mapping to the
 * API contract can be exercised on their own.
 */

/** One "Add material" row within a flavor, as the form holds it while being
 *  edited. The id is the select's value, so it is a string until parsed. */
export interface MaterialRowInput {
  rawMaterialId: string;
  quantity: string;
}

/** One flavor's run, as the form holds it while being edited. The fruit kg
 *  covers the whole run; either size may be left blank, but not both. Each run
 *  is saved as its own production, so the materials it used belong to it. */
export interface ProductionRowInput {
  flavorId: string;
  kg: string;
  largeBottles: string;
  smallBottles: string;
  materials: MaterialRowInput[];
}

/**
 * A finished bottle always consumes exactly one empty bottle of its own size,
 * one lid and one label, so all three follow from Bottles produced and are
 * never keyed in (spec §48.4). The API derives the same figures when it saves.
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
 * type. Adding a row with 100 small bottles takes the small count from 100
 * to 200 without touching the large count.
 */
export function batchConsumption(
  rows: Pick<ProductionRowInput, "largeBottles" | "smallBottles">[],
): BatchConsumption {
  let largeBottles = 0;
  let smallBottles = 0;
  for (const row of rows) {
    largeBottles += autoFillConsumption(row.largeBottles).emptyBottlesUsed;
    smallBottles += autoFillConsumption(row.smallBottles).emptyBottlesUsed;
  }
  const totalBottles = largeBottles + smallBottles;
  return { largeBottles, smallBottles, lids: totalBottles, labels: totalBottles, totalBottles };
}

/**
 * The validated form as the API's create request.
 *
 * The form takes one note for the whole day's run; the API keeps notes per
 * flavor batch, so the note is recorded against each of them.
 */
export function toCreateProductionRequest(form: ProductionOutput): CreateProductionRequest {
  const notes = form.notes?.trim() || null;
  return {
    productionDate: form.date,
    batches: form.rows.map((row) => ({
      flavorId: row.flavorId,
      usedFruitKg: row.kg,
      largeQty: row.largeBottles,
      smallQty: row.smallBottles,
      notes,
      rawMaterials: row.materials.map((m) => ({
        rawMaterialId: m.rawMaterialId,
        quantity: m.quantity,
      })),
    })),
  };
}
