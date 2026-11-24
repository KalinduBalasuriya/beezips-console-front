import { baseApi } from "./baseApi";
import type { RawMaterialDto } from "../../lib/api/types";

export const rawMaterialsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Materials staff can add to a batch by hand (the API leaves out fruit
     *  and the packaging it derives from the bottle counts). */
    getSelectableRawMaterials: build.query<RawMaterialDto[], void>({
      query: () => "/raw-materials/selectable",
      providesTags: (result) => [
        { type: "RawMaterial", id: "SELECTABLE" },
        ...(result ?? []).map(({ id }) => ({ type: "RawMaterial" as const, id })),
      ],
    }),
  }),
});

export const { useGetSelectableRawMaterialsQuery } = rawMaterialsApi;
