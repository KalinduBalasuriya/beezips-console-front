import { createSelector } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import type {
  CreateProductionRequest,
  CreateProductionResponse,
  GetProductionsArgs,
  ProductionDayDto,
  RawMaterialUnit,
} from "../../lib/api/types";
import type {
  MaterialUsage,
  ProductionLogDay,
  ProductionLogFlavor,
} from "../../lib/types";

/** How each API unit reads next to a quantity in the UI. */
const UNIT_LABEL: Record<RawMaterialUnit, string> = {
  Kg: "kg",
  G: "g",
  L: "L",
  Ml: "ml",
  Pcs: "pcs",
  Cylinder: "cylinders",
};

/**
 * One API production day as the production log renders it.
 *
 * - The API lists every saved production, so a flavor run twice in a day
 *   appears twice; the log shows one line per flavor, so they are merged.
 * - The day's raw materials are only what staff keyed in. Empty bottles, lids
 *   and labels follow one-for-one from the bottles produced (spec §48.4), so
 *   they are derived here and listed first, as the log always has.
 */
function toProductionLogDay(dto: ProductionDayDto): ProductionLogDay {
  const byFlavor = new Map<number, ProductionLogFlavor>();
  for (const f of dto.flavors) {
    const entry = byFlavor.get(f.flavorId) ?? {
      flavor: f.flavorName,
      kg: 0,
      large: 0,
      small: 0,
    };
    entry.kg += f.fruitKg;
    entry.large += f.largeQty;
    entry.small += f.smallQty;
    byFlavor.set(f.flavorId, entry);
  }
  const flavors = [...byFlavor.values()].sort(
    (a, b) => b.large + b.small - (a.large + a.small),
  );

  const large = dto.largeQty;
  const small = dto.smallQty;
  const total = dto.totalBottles;

  const packaging: MaterialUsage[] = [
    { material: "Glass bottles (Large)", quantityUsed: large, unit: "pcs" },
    { material: "Glass bottles (Small)", quantityUsed: small, unit: "pcs" },
    { material: "Lids", quantityUsed: total, unit: "pcs" },
    { material: "Labels", quantityUsed: total, unit: "pcs" },
  ];
  const keyedIn: MaterialUsage[] = dto.rawMaterials.map((m) => ({
    material: m.name,
    quantityUsed: m.quantity,
    unit: UNIT_LABEL[m.unit] ?? m.unit,
  }));

  return {
    date: dto.date,
    fruitKg: dto.fruitKg,
    large,
    small,
    total,
    flavors,
    materials: [...packaging, ...keyedIn].filter((m) => m.quantityUsed > 0),
  };
}

export const productionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductions: build.query<ProductionLogDay[], GetProductionsArgs>({
      query: ({ from, to }) => ({ url: "/productions", params: { from, to } }),
      /* newest day first, whatever order the API returns them in */
      transformResponse: (response: ProductionDayDto[]) =>
        response
          .map(toProductionLogDay)
          .sort((a, b) => b.date.localeCompare(a.date)),
      providesTags: [{ type: "Production", id: "LIST" }],
    }),

    createProduction: build.mutation<
      CreateProductionResponse,
      CreateProductionRequest
    >({
      query: (body) => ({ url: "/productions", method: "POST", body }),
      /* a production draws raw stock down, so anything listing productions or
         stock levels is stale once it saves */
      invalidatesTags: [
        { type: "Production", id: "LIST" },
        { type: "RawMaterial", id: "SELECTABLE" },
      ],
    }),
  }),
});

export const { useGetProductionsQuery, useCreateProductionMutation } =
  productionsApi;

/* ---------- figures across a whole window of production days ---------- */

export interface ProductionWindowTotals {
  large: number;
  small: number;
  total: number;
  /** bottles per flavor across the window, biggest producer first */
  byFlavor: ProductionLogFlavor[];
}

/** Bottle totals for the days a getProductions query returned. Memoised on the
 *  days array, which RTK Query keeps stable until the data actually changes. */
export const selectProductionWindowTotals = createSelector(
  [(days: ProductionLogDay[] | undefined) => days],
  (days): ProductionWindowTotals => {
    let large = 0;
    let small = 0;
    const byFlavor = new Map<string, ProductionLogFlavor>();
    for (const day of days ?? []) {
      large += day.large;
      small += day.small;
      for (const f of day.flavors) {
        const entry = byFlavor.get(f.flavor) ?? {
          flavor: f.flavor,
          kg: 0,
          large: 0,
          small: 0,
        };
        entry.kg += f.kg;
        entry.large += f.large;
        entry.small += f.small;
        byFlavor.set(f.flavor, entry);
      }
    }
    return {
      large,
      small,
      total: large + small,
      byFlavor: [...byFlavor.values()].sort(
        (a, b) => b.large + b.small - (a.large + a.small),
      ),
    };
  },
);
