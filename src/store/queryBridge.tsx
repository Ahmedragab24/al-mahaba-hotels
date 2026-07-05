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
import { getApiBaseUrl, getAuthToken } from "@/store/services/baseUrl";

// ==========================================
// 1. apiClient Proxy & Request Setup
// ==========================================

async function request(url: string, method = "GET", body?: any, params?: any) {
  const baseUrl = getApiBaseUrl();
  let fullUrl = `${baseUrl}${url}`;
  
  if (params) {
    const qParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        qParams.append(k, String(v));
      }
    });
    const qStr = qParams.toString();
    if (qStr) {
      fullUrl += `?${qStr}`;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(fullUrl, options);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }
  return data;
}

const postUpdateServices = ["users", "hotels", "rooms"];
const kebabCase = (str: string) => 
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const apiClient = new Proxy({} as any, {
  get(target, propKey) {
    if (typeof propKey !== "string") return undefined;
    
    const serviceName = kebabCase(propKey);
    const serviceUrl = `/${serviceName}`;

    return {
      getAll: (params?: any) => request(serviceUrl, "GET", undefined, params),
      getById: (id: string | number, params?: any) => request(`${serviceUrl}/${id}`, "GET", undefined, params),
      create: (body: any) => request(serviceUrl, "POST", body),
      update: (id: string | number, body: any) => {
        const method = postUpdateServices.includes(propKey) ? "POST" : "PUT";
        return request(`${serviceUrl}/${id}`, method, body);
      },
      delete: (id: string | number) => request(`${serviceUrl}/${id}`, "DELETE"),
      updateStatus: (id: string | number, body: any) => {
        return request(`${serviceUrl}/${id}/status`, "PUT", body);
      },
      // Special handler for createFromQuotation custom calls
      createFromQuotation: (body: any) => request(`${serviceUrl}/create-from-quotation`, "POST", body),
    };
  }
});

// ==========================================
// 1.5. Mock Supabase DB Client -> REST API
// ==========================================

const TABLE_TO_SERVICE: Record<string, string> = {
  hotel_taxes: "hotelTaxes",
  room_types: "roomTypes",
  bookings: "bookings",
  hotels: "hotels",
  taxes: "taxes",
  suppliers: "suppliers",
  supplier_applications: "supplierRequests",
  supplier_requests: "supplierRequests",
  users: "users",
  profiles: "users",
  user_roles: "userRoles",
  user_module_blocks: "userModuleBlocks",
  rooms: "rooms",
  quotations: "quotations",
  pricing: "pricing",
  rates: "prices",
  seasons: "seasons",
  contracts: "contracts",
  invoices: "invoices",
  payments: "payments",
  receipts: "receipts",
  receivables: "receivables",
  payables: "payables",
  countries: "countries",
  cities: "cities",
  currencies: "currencies",
  meal_plans: "mealPlans",
};

function snakeToCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

class QueryBuilder {
  private table: string;
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;
  private filters: Record<string, any> = {};
  private searchVal: string = "";
  private page: number = 1;
  private perPage: number = 1000;
  private isSingle: boolean = false;
  private orderBy: string = "";
  private orderDir: "asc" | "desc" = "asc";

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: any) {
    this.action = "select";
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.filters[`${column}_neq`] = value;
    return this;
  }

  gt(column: string, value: any) {
    this.filters[`${column}_gt`] = value;
    return this;
  }

  lt(column: string, value: any) {
    this.filters[`${column}_lt`] = value;
    return this;
  }

  gte(column: string, value: any) {
    this.filters[`${column}_gte`] = value;
    return this;
  }

  lte(column: string, value: any) {
    this.filters[`${column}_lte`] = value;
    return this;
  }

  ilike(column: string, value: any) {
    this.filters[`${column}_ilike`] = value;
    if (typeof value === "string") {
      const cleanVal = value.replace(/%/g, "");
      if (cleanVal) this.searchVal = cleanVal;
    }
    return this;
  }

  in(column: string, values: any[]) {
    this.filters[`${column}_in`] = values.join(",");
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters[`${column}_not_${operator}`] = value;
    if (operator === "eq") {
      this.filters[`${column}_neq`] = value;
    }
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  is(column: string, value: any) {
    if (column === "deleted_at" && value === null) {
      this.filters["show_archived"] = 0;
    } else {
      this.filters[column] = value;
    }
    return this;
  }

  or(filterStr: string) {
    const match = filterStr.match(/ilike\.%([^%]+)%/);
    if (match) {
      this.searchVal = match[1];
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = column;
    this.orderDir = options?.ascending === false ? "desc" : "asc";
    return this;
  }

  range(from: number, to: number) {
    this.perPage = to - from + 1;
    this.page = Math.floor(from / this.perPage) + 1;
    return this;
  }

  limit(l: number) {
    this.perPage = l;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any) {
    this.action = "insert";
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.action = "update";
    this.payload = data;
    return this;
  }

  upsert(data: any, options?: any) {
    this.action = "upsert";
    this.payload = data;
    return this;
  }

  delete(options?: any) {
    this.action = "delete";
    return this;
  }

  async execute() {
    const serviceName = TABLE_TO_SERVICE[this.table] || snakeToCamel(this.table);
    const service = apiClient[serviceName];

    if (!service) {
      console.warn(`[Supabase Mock Bridge] No REST service found for table "${this.table}" (inferred: "${serviceName}")`);
      return { data: this.isSingle ? null : [], error: null, count: 0 };
    }

    try {
      let result: any;
      const id = this.filters.id || this.payload?.id;

      if (this.action === "select") {
        const params: Record<string, any> = {
          page: this.page,
          per_page: this.perPage,
          ...this.filters,
        };
        if (this.searchVal) {
          params.search = this.searchVal;
        }
        if (this.orderBy) {
          params.order_by = this.orderBy;
          params.order_dir = this.orderDir;
        }

        if (this.isSingle && id) {
          result = await service.getById(id, params);
        } else {
          result = await service.getAll(params);
        }

        if (this.isSingle) {
          const data = Array.isArray(result) ? result[0] : (result?.data ? (Array.isArray(result.data) ? result.data[0] : result.data) : result);
          return { data: data || null, error: null, count: data ? 1 : 0 };
        } else {
          const rows = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []);
          const total = result?.total ?? result?.meta?.total ?? rows.length;
          return { data: rows, error: null, count: total };
        }
      } else if (this.action === "insert") {
        result = await service.create(this.payload);
        const data = Array.isArray(result) ? result[0] : result;
        return { data: data || null, error: null };
      } else if (this.action === "update") {
        if (!id) {
          throw new Error("Cannot update without an id filter");
        }
        result = await service.update(id, this.payload);
        return { data: result || null, error: null };
      } else if (this.action === "delete") {
        if (!id) {
          throw new Error("Cannot delete without an id filter");
        }
        result = await service.delete(id);
        return { data: result || null, error: null };
      } else if (this.action === "upsert") {
        if (id) {
          result = await service.update(id, this.payload);
        } else {
          result = await service.create(this.payload);
        }
        return { data: result || null, error: null };
      }
    } catch (err: any) {
      console.error(`[Supabase Mock Bridge] Error executing ${this.action} on ${this.table}:`, err);
      return { data: null, error: err, count: 0 };
    }
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }
}

export const dbAuth = {
  async signUp({ email, password, options }: any) {
    try {
      const displayName = options?.data?.display_name || "";
      const res = await apiClient.users.create({
        email,
        password,
        full_name_en: displayName,
        full_name_ar: displayName,
        is_active: true,
        type: "employee",
      });
      return { data: { user: { id: res.id, email: res.email } }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async signInWithPassword({ email, password }: any) {
    try {
      const res = await apiClient.login.create({
        email,
        password,
        type: "employee",
      });
      if (res && res.token) {
        document.cookie = `auth_token=${encodeURIComponent(res.token)}; path=/; max-age=86400; SameSite=Lax`;
      }
      return { data: { user: res.user || res, session: { access_token: res.token } }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async getSession() {
    const token = getAuthToken();
    if (token) {
      return { data: { session: { access_token: token } }, error: null };
    }
    return { data: { session: null }, error: null };
  }
};

export const db = {
  from: (tableName: string) => new QueryBuilder(tableName),
  auth: dbAuth,
  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: File, options?: any) {
          console.log(`[Supabase Mock Storage] Uploading file to ${bucket}/${path}`);
          return { data: { path }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `/mock-storage/${bucket}/${path}` } };
        },
        async createSignedUrl(path: string, expiresIn: number, options?: any) {
          return { data: { signedUrl: `/mock-storage/${bucket}/${path}?signed=true` }, error: null };
        }
      };
    }
  },
  rpc: async (fnName: string, args?: any) => {
    try {
      if (fnName === "finalize_supplier_application" && args?._app_id) {
        const res = await apiClient.supplierRequests.updateStatus(args._app_id, { status: "accepted" });
        return { data: res, error: null };
      }
      if (fnName === "reject_supplier_application" && args?._app_id) {
        const res = await apiClient.supplierRequests.updateStatus(args._app_id, {
          status: "rejected",
          rejection_reason: args._reason,
        });
        return { data: res, error: null };
      }
      if (fnName === "log_audit") {
        return { data: true, error: null };
      }
      const data = await request(`/rpc/${fnName}`, "POST", args);
      return { data, error: null };
    } catch (err: any) {
      console.error(`MockDb RPC error for ${fnName}:`, err);
      return { data: null, error: err };
    }
  },
  functions: {
    async invoke(fnName: string, options?: any) {
      return { data: { ok: true, message: `Mock function ${fnName} invoked` }, error: null };
    }
  }
};

export const supabase = db;

// ==========================================
// 2. Authentication and ID Helper
// ==========================================

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )auth_user_id=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return localStorage.getItem("auth_user_id");
}

// ==========================================
// 3. Error Handling Utility
// ==========================================

export function dbErrorMessage(error: unknown, _t?: unknown): string {
  if (!error) return "Unknown error";
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("duplicate key") || msg.includes("DUPLICATE") || msg.includes("23505")) {
    return "سجل مكرر — يوجد عنصر بنفس البيانات بالفعل";
  }
  if (msg.includes("foreign key") || msg.includes("23503")) {
    return "لا يمكن الحذف — يوجد بيانات مرتبطة";
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return "العنصر غير موجود";
  }
  if (msg.includes("Unauthorized") || msg.includes("401")) {
    return "غير مصرح — يرجى تسجيل الدخول";
  }
  if (msg.includes("Forbidden") || msg.includes("403")) {
    return "غير مسموح — ليس لديك صلاحية";
  }
  if (msg.includes("validation") || msg.includes("422")) {
    return "بيانات غير صالحة — يرجى مراجعة الحقول";
  }
  return msg;
}

// ==========================================
// 4. React Query Bridge (Redux Caching)
// ==========================================

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

  const queryState = useSelector((state: RootState) => state.queryBridge.queries[serializedKey]);
  const invalidatedKeys = useSelector((state: RootState) => state.queryBridge.invalidatedKeys);
  const [localFetching, setLocalFetching] = useState(false);

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
