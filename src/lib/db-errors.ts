/**
 * Convert API/database error codes into user-friendly messages.
 */
export function dbErrorMessage(error: unknown, _t?: unknown): string {
  if (!error) return "Unknown error";

  const msg = error instanceof Error ? error.message : String(error);

  // Common PostgreSQL / REST API error patterns
  if (msg.includes("duplicate key") || msg.includes("DUPLICATE") || msg.includes("23505")) {
    return "سجل مكرر — يوجد عنصر بنفس البيانات بالفعل";
  }
  if (msg.includes("foreign key") || msg.includes("23503")) {
    return "لا يمكن الحذف — يوجد بيانات مرتبطة";
  }
  if (msg.includes("not found") || msg.includes("404")) {
    return "العنصر غير موجود";
  }
  if (msg.includes("Unauthorized") || msg.includes("401")) {
    return "غير مصرح — يرجى تسجيل الدخول";
  }
  if (msg.includes("Forbidden") || msg.includes("403")) {
    return "غير مسموح — ليس لديك صلاحية";
  }
  if (msg.includes("validation") || msg.includes("422")) {
    return "بيانات غير صالحة — يرجى مراجعة الحقول";
  }

  return msg;
}
