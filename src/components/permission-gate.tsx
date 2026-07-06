import { useAuth } from "@/hooks/use-auth";
import type { PermissionKey } from "@/types/permissions";
import type { ReactNode } from "react";

/**
 * PermissionGate - مكون للتحكم في عرض المحتوى بناءً على الصلاحيات
 * يستخدم للتحكم في الصفحات والأزرار والإجراءات بناءً على الصلاحيات المحددة
 * 
 * @param permissions - مصفوفة من الصلاحيات المطلوبة (واحدة منها كافية)
 * @param requireAll - إذا كان true، يجب أن يمتلك المستخدم جميع الصلاحيات المحددة
 * @param requireWrite - إذا كان true، يتحقق من صلاحية الكتابة/التعديل
 * @param requireApprove - إذا كان true، يتحقق من صلاحية الموافقة
 * @param children - المحتوى الذي سيتم عرضه إذا كانت الصلاحيات متوفرة
 * @param fallback - المحتوى البديل الذي سيتم عرضه إذا لم تكن الصلاحيات متوفرة
 */
export function PermissionGate({
  permissions,
  requireAll = false,
  requireWrite = false,
  requireApprove = false,
  children,
  fallback = null,
}: {
  permissions: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  requireWrite?: boolean;
  requireApprove?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, canWrite, canApprove, loading } = useAuth();

  if (loading) return null;

  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  // التحقق من الصلاحيات الأساسية
  const hasAccess = requireAll
    ? permArray.every((perm) => hasPermission(perm))
    : permArray.some((perm) => hasPermission(perm));

  if (!hasAccess) return <>{fallback}</>;

  // التحقق من صلاحية الكتابة إذا مطلوبة
  if (requireWrite) {
    const canWriteAccess = requireAll
      ? permArray.every((perm) => canWrite(perm))
      : permArray.some((perm) => canWrite(perm));
    if (!canWriteAccess) return <>{fallback}</>;
  }

  // التحقق من صلاحية الموافقة إذا مطلوبة
  if (requireApprove) {
    const canApproveAccess = requireAll
      ? permArray.every((perm) => canApprove(perm))
      : permArray.some((perm) => canApprove(perm));
    if (!canApproveAccess) return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * WriteGate - مكون مختصر للتحقق من صلاحية الكتابة/التعديل
 */
export function WriteGate({
  permissions,
  children,
  fallback = null,
}: {
  permissions: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate
      permissions={permissions}
      requireWrite={true}
      children={children}
      fallback={fallback}
    />
  );
}

/**
 * ApproveGate - مكون مختصر للتحقق من صلاحية الموافقة
 */
export function ApproveGate({
  permissions,
  children,
  fallback = null,
}: {
  permissions: PermissionKey | PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate
      permissions={permissions}
      requireApprove={true}
      children={children}
      fallback={fallback}
    />
  );
}
