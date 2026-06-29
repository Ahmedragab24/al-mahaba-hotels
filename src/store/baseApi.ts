import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./services/baseUrl";

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
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
  ],
  endpoints: () => ({}),
});
