import type { AppRole } from "@/hooks/use-auth";

const ALL: AppRole[] = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer", "employee"];
const OPS: AppRole[] = ["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer", "employee"];
const FIN: AppRole[] = ["super_admin", "admin", "finance_manager", "finance_agent"];
const ADMIN: AppRole[] = ["super_admin", "admin"];

export const MODULES: { key: string; labelKey: string; roles: AppRole[] }[] = [
  { key: "dashboard", labelKey: "nav.dashboard", roles: ALL },
  { key: "hotels", labelKey: "nav.hotels", roles: ALL },
  { key: "rooms", labelKey: "nav.rooms", roles: ALL },
  { key: "suppliers", labelKey: "nav.suppliers", roles: OPS },
  { key: "supplier_applications", labelKey: "nav.supplier_applications", roles: ALL },
  { key: "rates", labelKey: "nav.rates", roles: ALL },
  { key: "quotations", labelKey: "nav.quotations", roles: ALL },
  { key: "bookings", labelKey: "nav.bookings", roles: ALL },
  { key: "customers", labelKey: "nav.customers", roles: ALL },
  { key: "invoices", labelKey: "nav.invoices", roles: FIN },
  { key: "transactions", labelKey: "nav.transactions", roles: FIN },
  { key: "room_types", labelKey: "nav.room_types", roles: ALL },
  { key: "currencies", labelKey: "nav.currencies", roles: ALL },
  { key: "users", labelKey: "nav.users", roles: ADMIN },
  { key: "settings", labelKey: "nav.settings", roles: ADMIN },
  { key: "reports", labelKey: "nav.reports", roles: ALL },
  { key: "tasks", labelKey: "nav.tasks", roles: ALL },
];

const PATH_MAP: Record<string, string | null> = {
  "/": "dashboard",
  "/hotels": "hotels",
  "/rooms": "rooms",
  "/suppliers": "suppliers",
  "/supplier-applications": "supplier_applications",
  "/rates": "rates",
  "/quotations": "quotations",
  "/bookings": "bookings",
  "/customers": "customers",
  "/invoices": "invoices",
  "/platform-transactions": "transactions",
  "/room-types": "room_types",
  "/currencies": "currencies",
  "/users": "users",
  "/settings": "settings",
  "/reports": "reports",
  "/tasks": "tasks",
};

export function pathToModule(pathname: string): string | null {
  // Try exact match first
  if (PATH_MAP[pathname] !== undefined) return PATH_MAP[pathname];
  // Try prefix match (e.g. /hotels/123 → hotels)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const prefix = "/" + segments[0];
    if (PATH_MAP[prefix] !== undefined) return PATH_MAP[prefix];
  }
  return null;
}

export function moduleRoles(moduleKey: string | null): AppRole[] | null {
  if (!moduleKey) return null;
  return MODULES.find((m) => m.key === moduleKey)?.roles ?? null;
}
