import { apiClient } from "@/lib/api/api-client";
import { getAuthToken } from "@/store/services/baseUrl";

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
  rates: "rates",
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
  private perPage: number = 20;
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

  in(column: string, values: any[]) {
    this.filters[column] = values;
    return this;
  }

  gte(column: string, value: any) {
    this.filters[`${column}_gte`] = value;
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
    // Extract search query from OR filter (e.g. code.ilike.%abc%)
    const match = filterStr.match(/ilike\.%([^%]+)%/);
    if (match) {
      this.searchVal = match[1];
    }
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderBy = column;
    this.orderDir = ascending ? "asc" : "desc";
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

  // Thenable implementation to support await/promise flows
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

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },

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

  async rpc(fnName: string, args?: any) {
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
      console.warn(`[Supabase Mock Bridge] Unmapped RPC call: "${fnName}" with args:`, args);
      return { data: null, error: null };
    } catch (err: any) {
      console.error(`[Supabase Mock Bridge] RPC "${fnName}" failed:`, err);
      return { data: null, error: err };
    }
  },

  functions: {
    async invoke(fnName: string, options?: any) {
      return { data: { ok: true, message: `Mock function ${fnName} invoked` }, error: null };
    }
  }
};
