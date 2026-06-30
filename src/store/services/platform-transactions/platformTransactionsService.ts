import { api } from "../../baseApi";
import type { PlatformTransaction, PlatformTransactionsStatistics } from "@/types/api";

export const platformTransactionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlatformTransactions: build.query<
      PlatformTransaction[] | { data: PlatformTransaction[]; total?: number; count?: number },
      {
        type?: string;
        category?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
        per_page?: number;
        all?: number | boolean | string;
        page?: number;
      } | void
    >({
      query: (params) => ({ url: "/platform-transactions", params: params || undefined }),
      providesTags: ["PlatformTransactions"],
    }),
    getPlatformTransactionById: build.query<PlatformTransaction, string | number>({
      query: (id) => ({ url: `/platform-transactions/${id}` }),
      providesTags: (result, error, id) => [{ type: "PlatformTransactions", id }],
    }),
    createPlatformTransaction: build.mutation<PlatformTransaction, FormData | Partial<PlatformTransaction>>({
      query: (body) => ({ url: "/platform-transactions", method: "POST", body }),
      invalidatesTags: ["PlatformTransactions"],
    }),
    updatePlatformTransaction: build.mutation<
      PlatformTransaction,
      { id: string | number; body: FormData | Partial<PlatformTransaction> }
    >({
      query: ({ id, body }) => {
        let finalBody: any = body;
        if (body instanceof FormData) {
          if (!body.has("_method")) {
            body.append("_method", "PUT");
          }
        } else if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/platform-transactions/${id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: (result, error, { id }) => ["PlatformTransactions", { type: "PlatformTransactions", id }],
    }),
    deletePlatformTransaction: build.mutation<void, string | number>({
      query: (id) => ({ url: `/platform-transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["PlatformTransactions"],
    }),
    getPlatformTransactionsStatistics: build.query<PlatformTransactionsStatistics, { year?: string | number } | void>({
      query: (params) => ({ url: "/platform-transactions/statistics", params: params || undefined }),
      providesTags: ["PlatformTransactions"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlatformTransactionsQuery,
  useGetPlatformTransactionByIdQuery,
  useCreatePlatformTransactionMutation,
  useUpdatePlatformTransactionMutation,
  useDeletePlatformTransactionMutation,
  useGetPlatformTransactionsStatisticsQuery,
} = platformTransactionsApi;
