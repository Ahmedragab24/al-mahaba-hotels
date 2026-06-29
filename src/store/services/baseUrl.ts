import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (API_BASE_URL?.startsWith("/")) {
      return window.location.origin + API_BASE_URL;
    }
  }
  return API_BASE_URL || "";
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.data && typeof result.data === "object" && "data" in result.data) {
    // Flatten Laravel response wrapper
    const unwrapped = (result.data as any).data;
    
    // Check if the unwrapped data is an auth response containing access_token
    if (unwrapped && unwrapped.access_token) {
      unwrapped.token = unwrapped.access_token;
    }
    
    return { data: unwrapped };
  }
  return result;
};
