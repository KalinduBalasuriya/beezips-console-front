import { baseApi } from "./baseApi";
import type {
  CreateProductionRequest,
  CreateProductionResponse,
} from "../../lib/api/types";

export const productionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProduction: build.mutation<CreateProductionResponse, CreateProductionRequest>({
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

export const { useCreateProductionMutation } = productionsApi;
