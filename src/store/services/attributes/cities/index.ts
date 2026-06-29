import { api } from "../../../baseApi";
import type { City } from "@/types/api";

export const citiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCities: build.query<
      City[],
      {
        lang?: string;
        country_id?: number | string;
        search?: string;
        per_page?: number | string;
        all?: number | string;
      } | void
    >({
      query: (params) => ({ url: "/cities", params: params || undefined }),
      providesTags: ["Cities"],
    }),
    getCityById: build.query<City, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/cities/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Cities", id }],
    }),
    createCity: build.mutation<City, Partial<City>>({
      query: (body) => ({ url: "/cities", method: "POST", body }),
      invalidatesTags: ["Cities"],
    }),
    updateCity: build.mutation<City, { id: string | number; body: Partial<City> }>({
      query: ({ id, body }) => ({ url: `/cities/${id}`, method: "PUT", body }),
      invalidatesTags: ["Cities"],
    }),
    deleteCity: build.mutation<void, string | number>({
      query: (id) => ({ url: `/cities/${id}`, method: "DELETE" }),
      invalidatesTags: ["Cities"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCitiesQuery,
  useGetCityByIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi;
