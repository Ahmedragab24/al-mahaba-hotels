import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasAnyRole, hasRole, isAdmin, canAccessModule, canWriteModule, canApproveModule } from "@/lib/auth-utils";
import type { PermissionKey } from "@/types/permissions";

export type AppRole =
  | "super_admin"
  | "admin"
  | "sales_manager"
  | "sales_agent"
  | "operations_manager"
  | "operations_agent"
  | "finance_manager"
  | "finance_agent"
  | "viewer"
  | "employee";

export function useAuth() {
  const auth = useSelector(selectAuth);

  return {
    ...auth,
    hasAnyRole: (roles: AppRole[]) => hasAnyRole(auth, roles),
    hasRole: (role: AppRole) => hasRole(auth, role),
    isAdmin: () => isAdmin(auth),
    // Permission-based checks
    hasPermission: (permission: PermissionKey) => canAccessModule(auth, permission),
    canAccess: (permission: PermissionKey) => canAccessModule(auth, permission),
    canWrite: (permission: PermissionKey) => canWriteModule(auth, permission),
    canApprove: (permission: PermissionKey) => canApproveModule(auth, permission),
    loading: false,
  };
}
