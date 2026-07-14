import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { selectAuth, clearAuth } from "@/store/features/authSlice";
import { useGetProfileQuery, useLogoutMutation, useUpdateUserMutation } from "@/store/api";
import { canAccessModule } from "@/lib/auth-utils";
import { useI18n } from "@/lib/i18n";
import { LogOut, ShieldOff, Loader2, TriangleAlertIcon, X } from "lucide-react";
import { requestPermission } from "@/lib/firebaseMessaging";
import { pathToModule } from "@/lib/modules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsPopover } from "@/components/notifications-popover";
import { cn } from "@/lib/utils";

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

  const [activeAlert, setActiveAlert] = useState<{ title: string; body: string } | null>(null);
  const [updateUser] = useUpdateUserMutation();

  // Setup real-time notifications and register FCM token globally for all authenticated users
  useEffect(() => {
    if (auth.isAuthenticated) {
      requestPermission((title, body) => {
        setActiveAlert({ title, body });
      }).then((token) => {
        if (token) {
          console.log("FCM Token obtained globally:", token);
          const profile = auth.profile as any;
          const user = auth.user as any;
          const userId = user?.id || profile?.id;
          const currentFcm = profile?.fcm || user?.fcm;
          
          if (userId && token !== currentFcm) {
            const name = user?.name || profile?.name || "";
            const email = user?.email || profile?.email || "";
            const phone = user?.phone || profile?.phone || "";
            const status = String(user?.status ?? profile?.status ?? "1");
            const type = user?.role?.name_en || profile?.role?.name_en || user?.type || profile?.type || "";
            const roleId = user?.role?.id || profile?.role?.id || user?.role_id || profile?.role_id;

            const body: any = {
              _method: "PUT",
              name,
              email,
              phone,
              status,
              type,
              fcm: token
            };

            if (roleId) {
              body.role_id = String(roleId);
            }

            updateUser({ id: userId, body })
              .unwrap()
              .then(() => {
                console.log("FCM Token updated globally on backend.");
              })
              .catch((err) => {
                console.error("Failed to update FCM token globally:", err);
              });
          }
        }
      }).catch((err) => {
        console.warn("Global FCM requestPermission failed:", err);
      });
    }
  }, [auth.isAuthenticated, auth.profile, auth.user, updateUser]);

  // Auto-dismiss custom alert after 6 seconds
  useEffect(() => {
    if (activeAlert) {
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  if (!cookieToken || isProfileLoading || !auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-gold)" }} />
      </div>
    );
  }

  const currentModule = pathToModule(pathname);
  const blocked =
    pathname !== "/" &&
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
    auth.profile?.name ||
    auth.user?.email ||
    (primaryRole ? (t(`role.${primaryRole}`) as string) : "—")
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
                  <Avatar className="h-7 w-7 bg-orange-900 dark:bg-accent">
                    <AvatarImage src={(auth.profile?.image as string) || undefined} />
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

      {activeAlert && (
        <div
          className={cn(
            "fixed z-[9999] bottom-4 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300",
            lang === "ar" ? "right-4" : "left-4"
          )}
          dir={dir}
        >
          <div className="relative w-full rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 shadow-lg p-4 flex gap-3 items-start">
            <TriangleAlertIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h5 className="font-bold text-sm leading-none">{activeAlert.title}</h5>
              <div className="text-xs opacity-90 leading-normal">{activeAlert.body}</div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-amber-600/60 hover:text-amber-600 dark:text-amber-400/60 dark:hover:text-amber-400 shrink-0 -mt-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
