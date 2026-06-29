import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QueryState {
  data: any;
  error: any;
  status: "pending" | "success" | "error";
  lastFetched: number;
  invalidated: boolean;
}

interface QueryBridgeState {
  queries: Record<string, QueryState>;
  invalidatedKeys: Record<string, number>; // serialized key prefix -> timestamp
}

const initialState: QueryBridgeState = {
  queries: {},
  invalidatedKeys: {},
};

export const queryBridgeSlice = createSlice({
  name: "queryBridge",
  initialState,
  reducers: {
    setQueryLoading(state, action: PayloadAction<{ key: string }>) {
      const { key } = action.payload;
      if (!state.queries[key]) {
        state.queries[key] = {
          data: undefined,
          error: null,
          status: "pending",
          lastFetched: 0,
          invalidated: false,
        };
      } else {
        state.queries[key].status = "pending";
      }
    },
    setQuerySuccess(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      state.queries[key] = {
        data,
        error: null,
        status: "success",
        lastFetched: Date.now(),
        invalidated: false,
      };
    },
    setQueryError(state, action: PayloadAction<{ key: string; error: any }>) {
      const { key, error } = action.payload;
      state.queries[key] = {
        data: state.queries[key]?.data, // keep stale data on error if any
        error,
        status: "error",
        lastFetched: Date.now(),
        invalidated: false,
      };
    },
    invalidateQueryKey(state, action: PayloadAction<{ keyPrefix: string }>) {
      const { keyPrefix } = action.payload;
      state.invalidatedKeys[keyPrefix] = Date.now();
      
      // Mark matching queries in the cache as invalidated
      Object.keys(state.queries).forEach((k) => {
        // If the key is equal to prefix, or starts with prefix followed by a comma or bracket
        // since serialized array is e.g. ["hotels",{"search":""}] -> starts with ["hotels"
        // Let's do a loose prefix match
        if (k === keyPrefix || k.startsWith(keyPrefix.slice(0, -1))) {
          state.queries[k].invalidated = true;
        }
      });
    },
    setQueryDataDirect(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      if (!state.queries[key]) {
        state.queries[key] = {
          data,
          error: null,
          status: "success",
          lastFetched: Date.now(),
          invalidated: false,
        };
      } else {
        state.queries[key].data = data;
        state.queries[key].status = "success";
        state.queries[key].lastFetched = Date.now();
      }
    },
    removeQueryData(state, action: PayloadAction<{ keyPrefix: string }>) {
      const { keyPrefix } = action.payload;
      Object.keys(state.queries).forEach((k) => {
        if (k === keyPrefix || k.startsWith(keyPrefix.slice(0, -1))) {
          delete state.queries[k];
        }
      });
    },
  },
});

export const {
  setQueryLoading,
  setQuerySuccess,
  setQueryError,
  invalidateQueryKey,
  setQueryDataDirect,
  removeQueryData,
} = queryBridgeSlice.actions;

export default queryBridgeSlice.reducer;
