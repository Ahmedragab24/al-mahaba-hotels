import { apiClient } from "@/lib/api/api-client";

class ServerQueryBuilder {
  private table: string;
  private action: "select" | "insert" | "update" | "upsert" = "select";
  private payload: any = null;
  private filters: Record<string, any> = {};

  constructor(table: string) {
    this.table = table;
  }

  from(table: string) {
    return new ServerQueryBuilder(table);
  }

  select(columns?: string) {
    this.action = "select";
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  upsert(data: any, options?: any) {
    this.action = "upsert";
    this.payload = data;
    return this;
  }

  async execute() {
    const serviceName = this.table === "profiles" ? "users" : (this.table === "user_roles" ? "userRoles" : this.table);
    const service = apiClient[serviceName];

    if (!service) {
      console.warn(`[Supabase Admin Mock] No service found for table ${this.table}`);
      return { data: null, error: null };
    }

    try {
      let result: any;
      const id = this.filters.id || this.payload?.id || this.payload?.user_id;

      if (this.action === "upsert") {
        if (id) {
          result = await service.update(id, this.payload);
        } else {
          result = await service.create(this.payload);
        }
        return { data: result || null, error: null };
      }
      return { data: null, error: null };
    } catch (err: any) {
      console.error(`[Supabase Admin Mock] Error on ${this.table}:`, err);
      return { data: null, error: err };
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

export const supabaseAdmin = {
  from(table: string) {
    return new ServerQueryBuilder(table);
  },

  auth: {
    admin: {
      async listUsers(options?: any) {
        try {
          const res = await apiClient.users.getAll();
          const users = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          return { data: { users: users.map((u: any) => ({ id: u.id, email: u.email })) }, error: null };
        } catch (err: any) {
          return { data: { users: [] }, error: err };
        }
      },

      async createUser(payload: any) {
        try {
          const res = await apiClient.users.create({
            email: payload.email,
            password: payload.password,
            full_name_en: payload.user_metadata?.display_name || "",
            full_name_ar: payload.user_metadata?.display_name || "",
            type: "employee",
            is_active: true,
          });
          return { data: { user: { id: res.id, email: res.email } }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      async updateUserById(id: string, payload: any) {
        try {
          const res = await apiClient.users.update(id, {
            password: payload.password,
          });
          return { data: { user: { id, email: res?.email } }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      }
    }
  }
};
