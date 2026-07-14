import type { AuthState } from "@/store/features/authSlice";
import type { AppRole } from "@/hooks/use-auth";
import type { PermissionKey, UserRole } from "@/types/permissions";
import { getDefaultPermissions, permissionsToArray } from "@/types/permissions";

export function hasRole(auth: AuthState, r: AppRole | string): boolean {
  return (
    auth.roles.includes(r) ||
    (auth.profile as any)?.type === r ||
    (auth.profile as any)?.role?.name_en === r ||
    (auth.profile as any)?.role?.name === r
  );
}

export function hasAnyRole(auth: AuthState, rs: (AppRole | string)[]): boolean {
  return rs.some(
    (r) =>
      auth.roles.includes(r) ||
      (auth.profile as any)?.type === r ||
      (auth.profile as any)?.role?.name_en === r ||
      (auth.profile as any)?.role?.name === r
  );
}

export function isAdmin(auth: AuthState): boolean {
  return hasAnyRole(auth, ["super_admin"]);
}

export function canAccessModule(auth: AuthState, key: string | null): boolean {
  if (!key) return true;
  if (hasRole(auth, "super_admin")) return true;

  // Check block list (user_module_blocks)
  if (auth.blockedModules?.includes(key)) return false;

  // Check allow list if present (custom API permissions list)
  const profilePermissions = (auth.profile as any)?.permissions;
  if (profilePermissions) {
    // Handle API format: object with "true"/"false" string values
    if (typeof profilePermissions === "object" && !Array.isArray(profilePermissions)) {
      const permissionValue = profilePermissions[key];
      return permissionValue === "true" || permissionValue === true;
    }

    // Handle array format
    if (Array.isArray(profilePermissions)) {
      return profilePermissions.includes(key as PermissionKey);
    }

    // Handle legacy object format using permissionsToArray
    const permissionKeys = permissionsToArray(profilePermissions);
    if (permissionKeys.length > 0) {
      return permissionKeys.includes(key as PermissionKey);
    }
  }

  // Fall back to role-based default permissions only if no explicit permissions object exists on the profile
  if (!profilePermissions) {
    const userType = ((auth.profile as any)?.role?.name || (auth.profile as any)?.type) as UserRole;
    if (userType) {
      const defaultPermissions = getDefaultPermissions(userType);
      return defaultPermissions.includes(key as PermissionKey);
    }
  }

  return false;
}

/**
 * Permission-based write check.
 * Any user who has access to the module can perform write/edit/delete operations.
 * Use this instead of hasAnyRole for all action buttons.
 */
export function canWriteModule(auth: AuthState, moduleKey: string): boolean {
  return canAccessModule(auth, moduleKey);
}

/**
 * Permission-based approve check.
 * User must have access to the module AND hold a manager/admin level role.
 * Approval represents a business authority level, not just module access.
 */
export function canApproveModule(auth: AuthState, moduleKey: string | null): boolean {
  if (!canAccessModule(auth, moduleKey)) return false;
  return hasAnyRole(auth, [
    "super_admin",
    "admin",
    "sales_manager",
    "operations_manager",
    "finance_manager",
  ]);
}

/**
 * Check if user has any of the specified permissions.
 * This is a helper for checking multiple permissions at once.
 */
export function hasAnyPermission(auth: AuthState, permissions: string[]): boolean {
  return permissions.some((perm) => canAccessModule(auth, perm));
}

/**
 * Check if user has all of the specified permissions.
 * This is a helper for strict permission checking.
 */
export function hasAllPermissions(auth: AuthState, permissions: string[]): boolean {
  return permissions.every((perm) => canAccessModule(auth, perm));
}

/**
 * Find the first allowed route for a user based on their permissions.
 */
export function getFirstAllowedRoute(auth: AuthState): string {
  if (canAccessModule(auth, "dashboard")) return "/";

  // If supplier or has rates access but no dashboard, redirect to supplier portal
  const userType = (auth.profile as any)?.type;
  if (
    userType === "supplier" ||
    (canAccessModule(auth, "rates") && !canAccessModule(auth, "dashboard"))
  ) {
    return "/supplier-portal";
  }

  const moduleRoutes: { module: string; path: string }[] = [
    { module: "hotels", path: "/hotels" },
    { module: "bookings", path: "/bookings" },
    { module: "quotations", path: "/quotations" },
    { module: "rates", path: "/rates" },
    { module: "suppliers", path: "/suppliers" },
    { module: "supplier_applications", path: "/supplier-applications" },
    { module: "invoices", path: "/invoices" },
    { module: "transactions", path: "/platform-transactions" },
    { module: "room_types", path: "/room-types" },
    { module: "currencies", path: "/currencies" },
    { module: "users", path: "/users" },
    { module: "settings", path: "/settings" },
    { module: "reports", path: "/reports" },
    { module: "tasks", path: "/tasks" },
  ];

  for (const item of moduleRoutes) {
    if (canAccessModule(auth, item.module)) {
      return item.path;
    }
  }

  return "/supplier-portal"; // fallback default
}


