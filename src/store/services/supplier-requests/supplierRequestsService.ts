import { api } from "../../baseApi";
import type { SupplierRequest } from "@/types/api";

export const supplierRequestsApi = api.injectEndpoints({
  endpoints: (build) => ({
    submitJoinRequest: build.mutation<SupplierRequest, any>({
      query: (body) => ({ url: "/supplier-requests", method: "POST", body }),
      invalidatesTags: ["SupplierRequests"],
    }),
    getSupplierRequests: build.query<SupplierRequest[], { lang?: string; status?: string; search?: string } | void>({
      query: (params) => ({ url: "/supplier-requests", params: params || undefined }),
      providesTags: ["SupplierRequests"],
    }),
    getSupplierRequestById: build.query<SupplierRequest, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/supplier-requests/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "SupplierRequests", id }],
    }),
    updateSupplierRequestStatus: build.mutation<SupplierRequest, { id: string | number; body: { status: "accepted" | "rejected"; rejection_reason?: string } }>({
      query: ({ id, body }) => ({ url: `/supplier-requests/${id}/status`, method: "PUT", body }),
      invalidatesTags: ["SupplierRequests"],
    }),
    deleteSupplierRequest: build.mutation<void, string | number>({
      query: (id) => ({ url: `/supplier-requests/${id}`, method: "DELETE" }),
      invalidatesTags: ["SupplierRequests"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSubmitJoinRequestMutation,
  useGetSupplierRequestsQuery,
  useGetSupplierRequestByIdQuery,
  useUpdateSupplierRequestStatusMutation,
  useDeleteSupplierRequestMutation,
} = supplierRequestsApi;
