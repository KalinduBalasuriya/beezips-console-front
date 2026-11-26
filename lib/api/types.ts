/**
 * Wire contracts of the Beezips ERP API.
 *
 * These mirror the backend DTOs exactly (camelCase, as ASP.NET serialises them)
 * and are kept apart from the UI's domain types in lib/types.ts, so a change on
 * either side is a deliberate mapping change rather than a silent drift.
 */

/** RawMaterialUnit — serialised as its name by JsonStringEnumConverter. */
export type RawMaterialUnit = "Kg" | "G" | "L" | "Ml" | "Pcs" | "Cylinder";

/** GET /flavors */
export interface FlavorDto {
  id: number;
  name: string;
}

/** GET /raw-materials/selectable — materials staff may add to a batch by hand.
 *  Fruit, empty bottles, lids and labels are excluded by the API, since it
 *  derives those from the batch itself. */
export interface RawMaterialDto {
  id: number;
  name: string;
  unit: RawMaterialUnit;
}

export interface ProductionRawMaterialRequest {
  rawMaterialId: number;
  quantity: number;
}

/** One flavor run within a production. */
export interface CreateProductionBatchRequest {
  flavorId: number;
  smallQty: number;
  largeQty: number;
  usedFruitKg: number;
  notes?: string | null;
  rawMaterials: ProductionRawMaterialRequest[];
}

/** POST /productions */
export interface CreateProductionRequest {
  /** ISO date, yyyy-mm-dd (DateOnly) */
  productionDate: string;
  batches: CreateProductionBatchRequest[];
}

/** 201 response of POST /productions — one production id per batch. */
export interface CreateProductionResponse {
  productionIds: number[];
}

/** A raw material drawn by a production, as GET /productions reports it. */
export interface ProductionRawMaterialDto {
  rawMaterialId: number;
  name: string;
  unit: RawMaterialUnit;
  quantity: number;
}

/** One saved production (a single flavor run) within a day. */
export interface ProductionFlavorDto {
  productionId: number;
  flavorId: number;
  flavorName: string;
  fruitKg: number;
  largeQty: number;
  smallQty: number;
  rawMaterials: ProductionRawMaterialDto[];
}

/** GET /productions?from=yyyy-mm-dd&to=yyyy-mm-dd — one entry per production
 *  day; `rawMaterials` is the day's total, `flavors` lists each production. */
export interface ProductionDayDto {
  /** ISO date, yyyy-mm-dd (DateOnly) */
  date: string;
  fruitKg: number;
  largeQty: number;
  smallQty: number;
  totalBottles: number;
  rawMaterials: ProductionRawMaterialDto[];
  flavors: ProductionFlavorDto[];
}

/** Query arguments of GET /productions, both ends inclusive. */
export interface GetProductionsArgs {
  from: string;
  to: string;
}

/** RFC 7807 problem details, as returned by the API's exception handler.
 *  `errors` is a list of messages for a validation failure (400). */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: string[] | Record<string, string[]>;
}
