import { HomeResponse } from "@/types/api/home";
import { api } from "../../baseApi";

export const homeApi = api.injectEndpoints({
    endpoints: (build) => ({
        getHomeData: build.query<HomeResponse["data"], void>({
            query: () => ({ url: "/home" }),
        }),
    }),
});

export const {
    useGetHomeDataQuery
} = homeApi;
