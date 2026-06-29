// KPI Engine — currency-aware aggregation helpers for Reports & Dashboards (BR-RPT-001 → BR-RPT-006)
import type { AppRole } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api/api-client";

export const BASE_CURRENCY = "SAR";
export type FxMap = Record<string, number>;

// Permission groups for report visibility (BR-RPT financial access restrictions)
export const FINANCE_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "finance_manager",
  "finance_agent",
];
export const EXEC_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "sales_manager",
  "operations_manager",
  "finance_manager",
];
export const SALES_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "sales_manager",
  "sales_agent",
  "finance_manager",
];
export const BOOKING_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "sales_manager",
  "sales_agent",
  "operations_manager",
  "operations_agent",
  "finance_manager",
  "finance_agent",
  "viewer",
];
export const SUPPLIER_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "operations_manager",
  "operations_agent",
  "finance_manager",
  "finance_agent",
];

export async function fetchFxRates(): Promise<FxMap> {
  try {
    const rows = await apiClient.exchangeRates.getAll() as any[];
    const fx: FxMap = { [BASE_CURRENCY]: 1 };
    for (const row of rows ?? []) {
      const code = row.currency ?? row.currency_code ?? row.code;
      const rate = Number(row.rate ?? row.exchange_rate ?? row.to_base_rate);
      if (code && Number.isFinite(rate) && rate > 0) {
        fx[String(code)] = rate;
      }
    }
    return fx;
  } catch {
    return { [BASE_CURRENCY]: 1 };
  }
}

export function toBase(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  fx: FxMap,
  explicitRate?: number | string | null,
): number {
  const n = Number(amount ?? 0);
  if (!n) return 0;
  if (!currency || currency === BASE_CURRENCY) return n;
  const r =
    explicitRate != null && Number(explicitRate) > 0 ? Number(explicitRate) : (fx[currency] ?? 1);
  return n * r;
}

/** "YYYY-MM" key for monthly grouping. */
export function monthKey(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Last n month keys, oldest first, ending with the current month. */
export function lastMonths(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

export type AgingBucket = "current" | "b30" | "b60" | "b90" | "b90p";

/** Receivables aging bucket from a due date. */
export function agingBucket(due: string | null | undefined): AgingBucket {
  if (!due) return "current";
  const days = Math.floor((Date.now() - new Date(due).getTime()) / 86400000);
  if (days <= 0) return "current";
  if (days <= 30) return "b30";
  if (days <= 60) return "b60";
  if (days <= 90) return "b90";
  return "b90p";
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
