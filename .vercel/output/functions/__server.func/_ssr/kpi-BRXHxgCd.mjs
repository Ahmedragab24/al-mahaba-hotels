import { s as supabase } from "./client-BdL2Ylqo.mjs";
const BASE_CURRENCY = "SAR";
const FINANCE_ROLES = ["super_admin", "admin", "finance_manager", "finance_agent"];
const EXEC_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager", "finance_manager"];
const SALES_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "finance_manager"];
const BOOKING_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"];
const SUPPLIER_ROLES = ["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent"];
async function fetchFxRates() {
  const { data, error } = await supabase.from("exchange_rates").select("currency, rate, rate_date").order("rate_date", { ascending: false });
  if (error) throw error;
  const fx = { [BASE_CURRENCY]: 1 };
  for (const r of data ?? []) {
    if (fx[r.currency] == null) fx[r.currency] = Number(r.rate);
  }
  return fx;
}
function toBase(amount, currency, fx, explicitRate) {
  const n = Number(amount ?? 0);
  if (!n) return 0;
  if (!currency || currency === BASE_CURRENCY) return n;
  const r = explicitRate != null && Number(explicitRate) > 0 ? Number(explicitRate) : fx[currency] ?? 1;
  return n * r;
}
function monthKey(value) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function lastMonths(n) {
  const out = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}
function agingBucket(due) {
  if (!due) return "current";
  const days = Math.floor((Date.now() - new Date(due).getTime()) / 864e5);
  if (days <= 0) return "current";
  if (days <= 30) return "b30";
  if (days <= 60) return "b60";
  if (days <= 90) return "b90";
  return "b90p";
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
export {
  BOOKING_ROLES as B,
  EXEC_ROLES as E,
  FINANCE_ROLES as F,
  SALES_ROLES as S,
  SUPPLIER_ROLES as a,
  BASE_CURRENCY as b,
  agingBucket as c,
  fetchFxRates as f,
  lastMonths as l,
  monthKey as m,
  round2 as r,
  toBase as t
};
