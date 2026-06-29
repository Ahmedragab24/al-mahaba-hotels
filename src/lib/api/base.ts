export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )auth_user_id=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  
  // Fallback to localStorage
  return localStorage.getItem("auth_user_id");
}
