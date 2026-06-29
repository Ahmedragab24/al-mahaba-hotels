import type { AuthState } from "@/store/features/authSlice";
import type { AppRole } from "@/hooks/use-auth";
import type { PermissionKey, UserRole } from "@/types/permissions";
import { getDefaultPermissions, permissionsToArray } from "@/types/permissions";

export function hasRole(auth: AuthState, r: AppRole | string): boolean {
  return auth.roles.includes(r) || (auth.profile as any)?.type === r;
}

export function hasAnyRole(auth: AuthState, rs: (AppRole | string)[]): boolean {
  return rs.some((r) => auth.roles.includes(r) || (auth.profile as any)?.type === r);
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
    console.log('[canAccessModule] Checking permission for key:', key, 'permissions:', profilePermissions);
    // Handle API format: object with "true"/"false" string values
    if (typeof profilePermissions === 'object' && !Array.isArray(profilePermissions)) {
      const permissionValue = profilePermissions[key];
      console.log('[canAccessModule] Permission value for', key, ':', permissionValue);
      // Check if permission is explicitly set to "true" or true
      const result = permissionValue === 'true' || permissionValue === true;
      console.log('[canAccessModule] Result:', result);
      return result;
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
  } else {
    console.log('[canAccessModule] No permissions found in profile');
  }

  // Fall back to role-based default permissions
  const userType = (auth.profile as any)?.type as UserRole;
  if (userType) {
    const defaultPermissions = getDefaultPermissions(userType);
    return defaultPermissions.includes(key as PermissionKey);
  }

  return true;
}
