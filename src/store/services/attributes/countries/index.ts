import { api } from "../../../baseApi";
import type { Country } from "@/types/api";

export const countriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query<Country[], { lang?: string; all?: number | string } | void>({
      query: (params) => ({ url: "/countries", params: params || undefined }),
      providesTags: ["Countries"],
    }),
    getCountryById: build.query<Country, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/countries/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Countries", id }],
    }),
    createCountry: build.mutation<Country, Partial<Country>>({
      query: (body) => ({ url: "/countries", method: "POST", body }),
      invalidatesTags: ["Countries"],
    }),
    updateCountry: build.mutation<Country, { id: string | number; body: Partial<Country> }>({
      query: ({ id, body }) => ({ url: `/countries/${id}`, method: "PUT", body }),
      invalidatesTags: ["Countries"],
    }),
    deleteCountry: build.mutation<void, string | number>({
      query: (id) => ({ url: `/countries/${id}`, method: "DELETE" }),
      invalidatesTags: ["Countries"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
} = countriesApi;
