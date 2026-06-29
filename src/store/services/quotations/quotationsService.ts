import { api } from "../../baseApi";
import type { Quotation } from "@/types/api";

export const quotationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getQuotations: build.query<Quotation[], { lang?: string; all?: boolean | string; status?: string; hotel_id?: string | number; customer_id?: string | number } | void>({
      query: (params) => ({ url: "/quotations", params: params || undefined }),
      providesTags: ["Quotations"],
    }),
    getQuotationById: build.query<Quotation, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/quotations/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Quotations", id }],
    }),
    createQuotation: build.mutation<Quotation, Partial<Quotation> & { lang?: string }>({
      query: ({ lang, ...body }) => ({ url: "/quotations", method: "POST", body, params: lang ? { lang } : undefined }),
      invalidatesTags: ["Quotations"],
    }),
    updateQuotation: build.mutation<Quotation, { id: string | number; body: Partial<Quotation>; lang?: string }>({
      query: ({ id, body, lang }) => ({ url: `/quotations/${id}`, method: "PUT", body, params: lang ? { lang } : undefined }),
      invalidatesTags: ["Quotations"],
    }),
    deleteQuotation: build.mutation<void, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/quotations/${id}`, method: "DELETE", params: lang ? { lang } : undefined }),
      invalidatesTags: ["Quotations"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationsApi;
