import { api } from "../../../baseApi";
import type { Language } from "@/types/api";

export const languagesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLanguages: build.query<Language[], { search?: string; all?: boolean | number | string; per_page?: number | string; lang?: string } | void>({
      query: (params) => ({ url: "/languages", params: params || undefined }),
      providesTags: ["Languages"],
    }),
    getLanguageById: build.query<Language, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/languages/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Languages", id }],
    }),
    createLanguage: build.mutation<Language, Partial<Language>>({
      query: (body) => ({ url: "/languages", method: "POST", body }),
      invalidatesTags: ["Languages"],
    }),
    updateLanguage: build.mutation<Language, { id: string | number; body: Partial<Language> }>({
      query: ({ id, body }) => ({ url: `/languages/${id}`, method: "PUT", body }),
      invalidatesTags: ["Languages"],
    }),
    deleteLanguage: build.mutation<void, string | number>({
      query: (id) => ({ url: `/languages/${id}`, method: "DELETE" }),
      invalidatesTags: ["Languages"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLanguagesQuery,
  useGetLanguageByIdQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
} = languagesApi;
