import { api } from "../../../baseApi";
import type { MealPlan } from "@/types/api";

export const mealPlansApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMealPlans: build.query<
      MealPlan[],
      {
        lang?: string;
        search?: string;
        status?: number;
        per_page?: number | string;
        all?: number | string;
      } | void
    >({
      query: (params) => ({ url: "/meal-plans", params: params || undefined }),
      providesTags: ["MealPlans"],
    }),
    getMealPlanById: build.query<MealPlan, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/meal-plans/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "MealPlans", id }],
    }),
    createMealPlan: build.mutation<MealPlan, Partial<MealPlan>>({
      query: (body) => ({ url: "/meal-plans", method: "POST", body }),
      invalidatesTags: ["MealPlans"],
    }),
    updateMealPlan: build.mutation<MealPlan, { id: string | number; body: Partial<MealPlan> }>({
      query: ({ id, body }) => ({ url: `/meal-plans/${id}`, method: "PUT", body }),
      invalidatesTags: ["MealPlans"],
    }),
    deleteMealPlan: build.mutation<void, string | number>({
      query: (id) => ({ url: `/meal-plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["MealPlans"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMealPlansQuery,
  useGetMealPlanByIdQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
} = mealPlansApi;
