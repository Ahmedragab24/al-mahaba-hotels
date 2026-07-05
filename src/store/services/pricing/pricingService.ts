import { api } from "../../baseApi";

export interface Price {
  id?: number;
  code?: string;
  is_direct: boolean;
  supplier_id?: number | null;
  hotel_id: number;
  room_id: number;
  hotel_view_id?: number | null;
  currency_id: number;
  valid_from: string;
  valid_to: string;
  meal_plan_type: "inclusive" | "exclusive";
  meal_plan_details?: Array<{ id: number; key: string; label: string; price: number }>;
  meal_plan_inclusive_details?: number[];
  meal_plan_exclusive_prices?: Record<number, number>;
  cost_per_night: number;
  selling_price: number;
  profit_margin?: number;
  tax_type: "inclusive_tax" | "exclusive_tax";
  tax_rate: number;
  notes?: string;
  notes_ar?: string;
  notes_en?: string;
  cancellation_policy?: string;
  cancellation_policy_ar?: string;
  cancellation_policy_en?: string;
  status: "draft" | "pending" | "approved" | "rejected" | "expired" | "valid";
  status_text?: string;
  is_weekend_weekday?: boolean;
  price_type?: string;
  days?: string[];
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
  entered_by?: { id: number; name: string };
  hotel?: any;
  room?: any;
  supplier?: any;
  hotel_view?: any;
  currency?: any;
}

export interface PriceListResponse {
  data: Price[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  statistics: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    this_month: number;
  };
}

export const pricingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPrices: build.query<PriceListResponse, { lang?: string; search?: string; hotel_id?: number | string; room_id?: number | string; supplier_id?: number | string; is_direct?: boolean; status?: string; all?: string; per_page?: string; is_archived?: string; meal_plan_type?: string; valid_from?: string; valid_to?: string } | void>({
      query: (params) => ({ url: "/prices", params: params || undefined }),
      providesTags: ["Prices"],
    }),
    getPriceById: build.query<Price, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/prices/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Prices", id }],
    }),
    createPrice: build.mutation<Price, Partial<Price> & { lang?: string }>({
      query: ({ lang, ...body }) => ({ url: "/prices", method: "POST", body, params: lang ? { lang } : undefined }),
      invalidatesTags: ["Prices"],
    }),
    updatePrice: build.mutation<Price, { id: string | number; body: Partial<Price>; lang?: string }>({
      query: ({ id, body, lang }) => ({ url: `/prices/${id}`, method: "PUT", body, params: lang ? { lang } : undefined }),
      invalidatesTags: ["Prices"],
    }),
    deletePrice: build.mutation<void, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/prices/${id}`, method: "DELETE", params: lang ? { lang } : undefined }),
      invalidatesTags: ["Prices"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPricesQuery,
  useGetPriceByIdQuery,
  useCreatePriceMutation,
  useUpdatePriceMutation,
  useDeletePriceMutation,
} = pricingApi;
