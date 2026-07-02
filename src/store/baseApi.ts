import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./services/baseUrl";
import { clearAuth } from "@/store/features/authSlice";

const allTags = [
  "Auth",
  "Users",
  "Suppliers",
  "SupplierRequests",
  "Hotels",
  "HotelViews",
  "HotelImages",
  "Rooms",
  "Prices",
  "Countries",
  "Cities",
  "SupplierTypes",
  "Currencies",
  "RoomTypes",
  "MealPlans",
  "Customers",
  "Tasks",
  "Quotations",
  "Bookings",
  "Notifications",
  "Languages",
  "Invoices",
  "PlatformTransactions",
];

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Globally handle 401 Unauthorized errors by logging out the user
  if (result.error && result.error.status === 401) {
    api.dispatch(clearAuth());
  }

  const method = typeof args === "string" ? "GET" : (args.method || "GET");
  const url = typeof args === "string" ? args : (args.url || "");
  
  if (method.toUpperCase() !== "GET" && !result.error) {
    // Do not invalidate all tags for login/logout to prevent race conditions during auth state transitions
    if (!url.includes("/login") && !url.includes("/logout")) {
      api.dispatch({
        type: "api/invalidateTags",
        payload: allTags,
      });
    }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
  tagTypes: allTags,
  endpoints: () => ({}),
});
