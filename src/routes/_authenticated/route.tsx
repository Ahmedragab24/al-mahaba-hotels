import { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { selectAuth, clearAuth } from "@/store/features/authSlice";
import { useGetProfileQuery, useLogoutMutation } from "@/store/api";
import { canAccessModule } from "@/lib/auth-utils";
import { useI18n } from "@/lib/i18n";
import { LogOut, ShieldOff, Loader2 } from "lucide-react";
import { pathToModule } from "@/lib/modules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsPopover } from "@/components/notifications-popover";

export default function AuthenticatedLayout() {
  const { lang, t, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  // Auth guard: redirect to /auth if no token
  const cookieMatch = typeof window !== "undefined" ? document.cookie.match(new RegExp("(^| )auth_token=([^;]+)")) : null;
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[2]) : null;

  // Rehydrate Redux if cookie exists but Redux is empty (e.g. on page refresh)
  const { isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
    skip: !cookieToken || auth.isAuthenticated,
  });

  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    if (!cookieToken) {
      dispatch(clearAuth());
      navigate("/auth", { replace: true });
    } else if (!isProfileLoading && !auth.isAuthenticated) {
      dispatch(clearAuth());
      navigate("/auth", { replace: true });
    }
  }, [cookieToken, isProfileLoading, auth.isAuthenticated, dispatch, navigate]);

  if (!cookieToken || isProfileLoading || !auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-gold)" }} />
      </div>
    );
  }

  const currentModule = pathToModule(pathname);
  const blocked =
    auth.roles.length > 0 &&
    !canAccessModule(auth, currentModule);

  async function handleSignOut() {
    try {
      await logoutMutation().unwrap();
    } catch (e) {
      console.warn("Logout failed", e);
    }
    if (typeof window !== "undefined") {
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = "auth_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      localStorage.removeItem("user_profile");
      localStorage.removeItem("user_roles");
    }
    navigate("/auth", { replace: true });
  }

  const customDisplayEmail =
    typeof window !== "undefined" ? window.localStorage.getItem("custom_display_email") : null;
  const primaryRole = auth.roles[0];
  const displayName = String(
    customDisplayEmail ||
      (lang === "ar"
        ? auth.profile?.full_name_ar ||
          auth.profile?.full_name_en ||
          auth.user?.email ||
          (primaryRole ? (t(`role.${primaryRole}`) as string) : "—")
        : auth.profile?.full_name_en ||
          auth.profile?.full_name_ar ||
          auth.user?.email ||
          (primaryRole ? (t(`role.${primaryRole}`) as string) : "—"))
  );
  const initials = (displayName || "?")
    .toString()
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/30" dir={dir}>
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
            <NotificationsPopover />
            <LangSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-start sm:flex sm:flex-col sm:leading-tight">
                    <span className="text-xs font-medium">{displayName}</span>
                    {primaryRole && (
                      <span className="text-[10px] text-muted-foreground">
                        {t(`role.${primaryRole}`)}
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{auth.user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="me-2 h-4 w-4" />
                  {t("auth.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="min-w-0 flex-1 overflow-y-auto">
            {blocked ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
                <ShieldOff className="h-10 w-10 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{t("perm.denied_title")}</h2>
                <p className="max-w-sm text-sm text-muted-foreground">{t("perm.denied_desc")}</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                  {t("actions.back")}
                </Button>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
