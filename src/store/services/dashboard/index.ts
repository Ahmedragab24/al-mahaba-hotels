import { DashboardResponse } from "@/types/api/dashboard";
import { api } from "../../baseApi";

export const dashboardApi = api.injectEndpoints({
    endpoints: (build) => ({
        getDashboardData: build.query<DashboardResponse["data"], void>({
            query: () => ({ url: "/dashboard" }),
        }),
    }),
});

export const {
    useGetDashboardDataQuery
} = dashboardApi;
