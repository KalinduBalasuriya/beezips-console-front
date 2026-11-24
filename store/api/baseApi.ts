import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../lib/config";

/** Cache tags shared by every feature slice, so a mutation in one feature can
 *  refresh a query in another (e.g. a production changing inventory). */
export const TAG_TYPES = ["Flavor", "RawMaterial", "Production"] as const;

/**
 * The single RTK Query API for the Beezips ERP backend.
 *
 * Features add their endpoints with `baseApi.injectEndpoints` in their own
 * file rather than growing this one, which keeps one cache, one middleware and
 * one place to add auth headers when the API gains authentication.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 15_000,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
