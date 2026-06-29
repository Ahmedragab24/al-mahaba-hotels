import { api } from "../../../baseApi";
import type { SupplierType } from "@/types/api";

export const supplierTypesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSupplierTypes: build.query<
      SupplierType[],
      { lang?: string; search?: string; per_page?: number | string } | void
    >({
      query: (params) => ({ url: "/supplier-types", params: params || undefined }),
      providesTags: ["SupplierTypes"],
    }),
    getSupplierTypeById: build.query<SupplierType, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/supplier-types/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "SupplierTypes", id }],
    }),
    createSupplierType: build.mutation<SupplierType, Partial<SupplierType>>({
      query: (body) => ({ url: "/supplier-types", method: "POST", body }),
      invalidatesTags: ["SupplierTypes"],
    }),
    updateSupplierType: build.mutation<
      SupplierType,
      { id: string | number; body: Partial<SupplierType> }
    >({
      query: ({ id, body }) => ({ url: `/supplier-types/${id}`, method: "PUT", body }),
      invalidatesTags: ["SupplierTypes"],
    }),
    deleteSupplierType: build.mutation<void, string | number>({
      query: (id) => ({ url: `/supplier-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["SupplierTypes"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupplierTypesQuery,
  useGetSupplierTypeByIdQuery,
  useCreateSupplierTypeMutation,
  useUpdateSupplierTypeMutation,
  useDeleteSupplierTypeMutation,
} = supplierTypesApi;
