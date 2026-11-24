import { baseApi } from "./baseApi";
import type { FlavorDto } from "../../lib/api/types";

export const flavorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFlavors: build.query<FlavorDto[], void>({
      query: () => "/flavors",
      providesTags: (result) => [
        { type: "Flavor", id: "LIST" },
        ...(result ?? []).map(({ id }) => ({ type: "Flavor" as const, id })),
      ],
    }),
  }),
});

export const { useGetFlavorsQuery } = flavorsApi;
