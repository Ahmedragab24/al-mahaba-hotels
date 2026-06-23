import type { AppRole } from "@/hooks/use-auth";

const ALL: AppRole[] = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"];
const OPS: AppRole[] = ["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"];
const FIN: AppRole[] = ["super_admin", "admin", "finance_manager", "finance_agent"];
const FIN_SALES: AppRole[] = ["super_admin", "admin", "finance_manager", "finance_agent", "sales_manager"];
const ADMIN: AppRole[] = ["super_admin", "admin"];

// Central list of app modules: which roles may see each module (mirrors the sidebar),
// and modules can additionally be hidden per-employee by the super admin.
// module key = first URL path segment.
export const MODULES: { key: string; labelKey: string; roles: AppRole[] }[] = [
  { key: "bookings", labelKey: "nav.bookings", roles: ALL },
  { key: "rfqs", labelKey: "nav.rfqs", roles: ALL },
  { key: "quotations", labelKey: "nav.quotations", roles: ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "finance_manager", "finance_agent", "viewer"] },
  { key: "customers", labelKey: "nav.customers", roles: ALL },
  { key: "hotels", labelKey: "nav.hotels", roles: ALL },
  { key: "suppliers", labelKey: "nav.suppliers", roles: OPS },
  { key: "rates", labelKey: "nav.rates", roles: ALL },
  { key: "room-types", labelKey: "nav.room_types", roles: ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "viewer"] },
  { key: "contracts", labelKey: "nav.contracts", roles: OPS },
  { key: "seasons", labelKey: "nav.seasons", roles: ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "viewer"] },
  { key: "taxes", labelKey: "nav.taxes", roles: OPS },
  { key: "invoices", labelKey: "nav.invoices", roles: FIN },
  { key: "receipts", labelKey: "nav.receipts", roles: FIN },
  { key: "receivables", labelKey: "nav.receivables", roles: FIN_SALES },
  { key: "payments", labelKey: "nav.payments", roles: FIN_SALES },
  { key: "payables", labelKey: "nav.payables", roles: FIN },
  { key: "reports", labelKey: "nav.reports", roles: ALL },
  { key: "tasks", labelKey: "nav.tasks", roles: ALL },
  { key: "users", labelKey: "nav.users", roles: ADMIN },
  { key: "supplier-applications", labelKey: "nav.supplier_applications", roles: ADMIN },
  { key: "supplier-portal", labelKey: "nav.supplier_portal", roles: ["supplier"] },
  { key: "approval-thresholds", labelKey: "nav.approval_thresholds", roles: ["super_admin", "admin", "finance_manager"] },
  { key: "audit", labelKey: "nav.audit", roles: ADMIN },
  { key: "simulation", labelKey: "nav.simulation", roles: ADMIN },
  { key: "settings", labelKey: "nav.settings", roles: ADMIN },
];

export function pathToModule(path: string): string | null {
  const seg = path.replace(/^\/+/, "").split("/")[0];
  if (!seg) return null; // dashboard is always visible
  return MODULES.some((m) => m.key === seg) ? seg : null;
}

export function moduleRoles(key: string | null): AppRole[] | null {
  if (!key) return null;
  return MODULES.find((m) => m.key === key)?.roles ?? null;
}