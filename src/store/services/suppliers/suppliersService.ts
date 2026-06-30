import { api } from "../../baseApi";
import type { Supplier, SuppliersListResponse, ApiResponse } from "@/types/api";

export const suppliersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSuppliers: build.query<SuppliersListResponse, { lang?: string; search?: string; supplier_type_id?: number | string; status?: number; country_id?: number | string; all?: number | string; is_archived?: boolean; hotel_id?: number | string } | void>({
      query: (params) => ({ url: "/suppliers", params: params || undefined }),
      providesTags: ["Suppliers"],
    }),
    getSupplierById: build.query<Supplier, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/suppliers/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Suppliers", id }],
    }),
    createSupplier: build.mutation<Supplier, Partial<Supplier>>({
      query: (body) => ({ url: "/suppliers", method: "POST", body }),
      invalidatesTags: ["Suppliers"],
    }),
    updateSupplier: build.mutation<Supplier, { id: string | number; body: Partial<Supplier> }>({
      query: ({ id, body }) => ({ url: `/suppliers/${id}`, method: "PUT", body }),
      invalidatesTags: ["Suppliers"],
    }),
    deleteSupplier: build.mutation<void, string | number>({
      query: (id) => ({ url: `/suppliers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Suppliers"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
