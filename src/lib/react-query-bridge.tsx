import React, { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  setQueryLoading,
  setQuerySuccess,
  setQueryError,
  invalidateQueryKey,
  setQueryDataDirect,
  removeQueryData,
} from "@/store/features/queryBridgeSlice";

// Helper to serialize key
function serializeKey(key: any): string {
  if (typeof key === "string") return key;
  return JSON.stringify(key);
}

export interface UseQueryOptions<T = any> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  retry?: boolean | number;
}

export function useQuery<T = any>(options: UseQueryOptions<T>) {
  const dispatch = useDispatch();
  const { queryKey, queryFn, enabled = true, refetchInterval } = options;
  const serializedKey = serializeKey(queryKey);

  // Get state from redux store
  const queryState = useSelector((state: RootState) => state.queryBridge.queries[serializedKey]);
  const invalidatedKeys = useSelector((state: RootState) => state.queryBridge.invalidatedKeys);

  // Track local loading/fetching state
  const [localFetching, setLocalFetching] = useState(false);

  // To check invalidation: check if any prefix of the serialized key was invalidated recently
  const isInvalidated = useCallback(() => {
    if (queryState?.invalidated) return true;
    
    const lastFetched = queryState?.lastFetched || 0;
    for (let i = 1; i <= queryKey.length; i++) {
      const subKey = serializeKey(queryKey.slice(0, i));
      const invalidTime = invalidatedKeys[subKey] || 0;
      if (invalidTime > lastFetched) {
        return true;
      }
    }
    return false;
  }, [queryKey, queryState, invalidatedKeys]);

  const queryFnRef = useRef(queryFn);
  useEffect(() => {
    queryFnRef.current = queryFn;
  });

  const fetchData = useCallback(async (force = false) => {
    if (!enabled && !force) return;
    
    setLocalFetching(true);
    dispatch(setQueryLoading({ key: serializedKey }));
    
    try {
      const res = await queryFnRef.current();
      dispatch(setQuerySuccess({ key: serializedKey, data: res }));
    } catch (err: any) {
      console.error("useQuery fetch error for key", serializedKey, err);
      dispatch(setQueryError({ key: serializedKey, error: err }));
    } finally {
      setLocalFetching(false);
    }
  }, [serializedKey, enabled, dispatch]);

  const prevKey = useRef(serializedKey);

  const shouldFetch = enabled && (
    !queryState || 
    serializedKey !== prevKey.current || 
    isInvalidated()
  );

  useEffect(() => {
    if (serializedKey !== prevKey.current) {
      prevKey.current = serializedKey;
    }
    if (shouldFetch && !localFetching) {
      fetchData();
    }
  }, [serializedKey, shouldFetch, localFetching, fetchData]);

  // Handle refetchInterval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    const timer = setInterval(() => {
      fetchData(true);
    }, refetchInterval);
    return () => clearInterval(timer);
  }, [refetchInterval, enabled, fetchData]);

  const data = queryState?.data;
  const status = queryState?.status || "pending";
  const error = queryState?.error || null;

  return {
    data,
    status,
    error,
    isLoading: status === "pending" && data === undefined,
    isPending: status === "pending" && data === undefined,
    isFetching: localFetching || status === "pending",
    isError: status === "error",
    isSuccess: status === "success",
    refetch: useCallback(() => fetchData(true), [fetchData]),
  };
}

export interface UseMutationOptions<TData = any, TError = any, TVariables = any> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, context: any) => any;
  onError?: (error: TError, variables: TVariables, context: any) => any;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: any) => any;
}

export function useMutation<TData = any, TError = any, TVariables = any>(
  options: UseMutationOptions<TData, TError, TVariables>
) {
  const { mutationFn, onSuccess, onError, onSettled } = options;
  const [state, setState] = useState({
    data: undefined as TData | undefined,
    error: null as TError | null,
    status: "idle" as "idle" | "pending" | "success" | "error",
  });

  const mutationFnRef = useRef(mutationFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    mutationFnRef.current = mutationFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onSettledRef.current = onSettled;
  });

  const mutateAsync = useCallback(async (variables?: TVariables) => {
    setState({ data: undefined, error: null, status: "pending" });
    try {
      const res = await mutationFnRef.current(variables as TVariables);
      setState({ data: res, error: null, status: "success" });
      if (onSuccessRef.current) {
        await onSuccessRef.current(res, variables as TVariables, undefined);
      }
      if (onSettledRef.current) {
        await onSettledRef.current(res, null, variables as TVariables, undefined);
      }
      return res;
    } catch (err: any) {
      setState({ data: undefined, error: err, status: "error" });
      if (onErrorRef.current) {
        await onErrorRef.current(err, variables as TVariables, undefined);
      }
      if (onSettledRef.current) {
        await onSettledRef.current(undefined, err, variables as TVariables, undefined);
      }
      throw err;
    }
  }, []);

  const mutate = useCallback((variables?: TVariables) => {
    mutateAsync(variables).catch(() => {});
  }, [mutateAsync]);

  return {
    mutate,
    mutateAsync,
    data: state.data,
    error: state.error,
    status: state.status,
    isPending: state.status === "pending",
    isLoading: state.status === "pending",
    isError: state.status === "error",
    isSuccess: state.status === "success",
    reset: useCallback(() => setState({ data: undefined, error: null, status: "idle" }), []),
  };
}

export function useQueryClient() {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.queryBridge);

  return {
    invalidateQueries: useCallback(({ queryKey }: { queryKey: any[] }) => {
      const serializedPrefix = serializeKey(queryKey);
      dispatch(invalidateQueryKey({ keyPrefix: serializedPrefix }));
    }, [dispatch]),
    
    setQueryData: useCallback((queryKey: any[], data: any) => {
      const serialized = serializeKey(queryKey);
      dispatch(setQueryDataDirect({ key: serialized, data }));
    }, [dispatch]),

    getQueryData: useCallback((queryKey: any[]) => {
      const serialized = serializeKey(queryKey);
      return state.queries[serialized]?.data;
    }, [state.queries]),

    removeQueries: useCallback(({ queryKey }: { queryKey: any[] }) => {
      const serializedPrefix = serializeKey(queryKey);
      dispatch(removeQueryData({ keyPrefix: serializedPrefix }));
    }, [dispatch]),
  };
}

export class QueryClient {
  constructor(options?: any) {}
  invalidateQueries() {}
  setQueryData() {}
  getQueryData() {}
}

export function QueryClientProvider({ children }: { children: React.ReactNode; client?: any }) {
  return <>{children}</>;
}
