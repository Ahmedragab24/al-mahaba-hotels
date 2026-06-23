import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { LogOut, ShieldOff } from "lucide-react";
import { pathToModule, moduleRoles } from "@/lib/modules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Demo mode removed: a real authenticated session is always required.
    if (typeof window !== "undefined") window.localStorage.removeItem("demo_role");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { lang, t, dir } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentModule = pathToModule(pathname);
  const requiredRoles = moduleRoles(currentModule);
  const blocked = !auth.loading && auth.roles.length > 0 && (
    !auth.canAccessModule(currentModule) ||
    (requiredRoles !== null && !auth.hasAnyRole(requiredRoles))
  );

  async function handleSignOut() {
    await auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const customDisplayEmail = typeof window !== "undefined" ? window.localStorage.getItem("custom_display_email") : null;
  const primaryRole = auth.roles[0];
  const displayName = customDisplayEmail || (lang === "ar"
    ? (auth.profile?.full_name_ar || auth.profile?.full_name_en || auth.user?.email || (primaryRole ? t(`role.${primaryRole}`) : "—"))
    : (auth.profile?.full_name_en || auth.profile?.full_name_ar || auth.user?.email || (primaryRole ? t(`role.${primaryRole}`) : "—")));
  const initials = (displayName || "?").toString().split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/30" dir={dir}>
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
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
                      <span className="text-[10px] text-muted-foreground">{t(`role.${primaryRole}`)}</span>
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
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
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
                <Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })}>{t("actions.back")}</Button>
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
