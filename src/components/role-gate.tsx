import { useAuth, type AppRole } from "@/hooks/use-auth";
import type { ReactNode } from "react";

export function RoleGate({ roles, children, fallback = null }: { roles: AppRole[]; children: ReactNode; fallback?: ReactNode }) {
  const { hasAnyRole, loading } = useAuth();
  if (loading) return null;
  return hasAnyRole(roles) ? <>{children}</> : <>{fallback}</>;
}
