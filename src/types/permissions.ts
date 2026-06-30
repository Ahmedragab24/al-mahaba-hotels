// System-wide permission types and constants
// This file defines the standard permission structure used across the entire system

export type PermissionKey =
  | "dashboard"
  | "hotels"
  | "rooms"
  | "suppliers"
  | "supplier_applications"
  | "rates"
  | "quotations"
  | "bookings"
  | "customers"
  | "invoices"
  | "transactions"
  | "room_types"
  | "currencies"
  | "contracts"
  | "users"
  | "settings"
  | "reports"
  | "tasks";

export type UserRole =
  | "super_admin"
  | "admin"
  | "sales_manager"
  | "sales_agent"
  | "operations_manager"
  | "operations_agent"
  | "finance_manager"
  | "finance_agent"
  | "viewer"
  | "employee"
  | "supplier";

export interface UserPermissions {
  [key: string]: boolean | string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  type: UserRole;
  image: string | null;
  fcm: string | null;
  country: any;
  city: any;
  permissions: UserPermissions;
}

// Default permissions for each role
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  super_admin: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "users", "settings", "reports", "tasks"
  ],
  admin: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "users", "settings", "reports", "tasks"
  ],
  sales_manager: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "room_types", "currencies",
    "reports", "tasks"
  ],
  sales_agent: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "room_types", "currencies",
    "reports", "tasks"
  ],
  operations_manager: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "reports", "tasks"
  ],
  operations_agent: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "reports", "tasks"
  ],
  finance_manager: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "reports", "tasks"
  ],
  finance_agent: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "reports", "tasks"
  ],
  viewer: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "invoices", "transactions",
    "room_types", "currencies",
    "contracts", "reports", "tasks"
  ],
  employee: [
    "dashboard", "hotels", "rooms", "suppliers", "supplier_applications",
    "rates", "quotations", "bookings", "customers", "room_types", "currencies",
    "reports", "tasks"
  ],
  supplier: [
    "rates", "contracts", "bookings", "quotations", "tasks"
  ]
};

// Helper function to get default permissions for a role
export function getDefaultPermissions(role: UserRole): PermissionKey[] {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
}

// Helper function to convert permissions object to array
export function permissionsToArray(permissions: UserPermissions): PermissionKey[] {
  return Object.keys(permissions).filter(
    key => permissions[key] === true || permissions[key] === "true"
  ) as PermissionKey[];
}

// Helper function to convert permissions array to object
export function permissionsFromArray(permissions: PermissionKey[]): UserPermissions {
  const result: UserPermissions = {};
  permissions.forEach(key => {
    result[key] = true;
  });
  return result;
}
