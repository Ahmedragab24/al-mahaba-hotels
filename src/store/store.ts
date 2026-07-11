import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/store/api";
import queryBridgeReducer from "@/store/features/queryBridgeSlice";
import authReducer from "@/store/features/authSlice";
import roomNamesReducer from "@/store/features/roomNamesSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    queryBridge: queryBridgeReducer,
    auth: authReducer,
    roomNames: roomNamesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
