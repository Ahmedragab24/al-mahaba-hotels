import { api } from "../../../baseApi";
import type { Currency } from "@/types/api";

export const currenciesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCurrencies: build.query<
      Currency[],
      { lang?: string; search?: string; per_page?: number | string; all?: number } | void
    >({
      query: (params) => ({ url: "/currencies", params: params || undefined }),
      providesTags: ["Currencies"], 
    }),
    getCurrencyById: build.query<Currency, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/currencies/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Currencies", id }],
    }),
    createCurrency: build.mutation<Currency, Partial<Currency>>({
      query: (body) => ({ url: "/currencies", method: "POST", body }),
      invalidatesTags: ["Currencies"],
    }),
    updateCurrency: build.mutation<Currency, { id: string | number; body: Partial<Currency> }>({
      query: ({ id, body }) => ({ url: `/currencies/${id}`, method: "PUT", body }),
      invalidatesTags: ["Currencies"],
    }),
    deleteCurrency: build.mutation<void, string | number>({
      query: (id) => ({ url: `/currencies/${id}`, method: "DELETE" }),
      invalidatesTags: ["Currencies"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrenciesQuery,
  useGetCurrencyByIdQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} = currenciesApi;
