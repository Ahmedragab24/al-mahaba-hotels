import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Handshake,
  Tags,
  ShieldCheck,
  Settings,
  Hotel,
  BedDouble,
  FileSpreadsheet,
  ReceiptText,
  CalendarCheck,
  BarChart3,
  ClipboardList,
  Landmark,
  DollarSign,
  Wallet,
} from "lucide-react";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import logoDarkUrl from "@/assets/daleel-logo-dark.png";
import { useI18n } from "@/lib/i18n";
import { type AppRole } from "@/hooks/use-auth";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { pathToModule } from "@/lib/modules";

type NavItem = {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  roles?: AppRole[];
  permission?: string;
};

const operational: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, permission: "dashboard" },
  {
    to: "/bookings",
    labelKey: "nav.bookings",
    icon: CalendarCheck,
    permission: "bookings",
  },
  {
    to: "/quotations",
    labelKey: "nav.quotations",
    icon: FileSpreadsheet,
    permission: "quotations",
  },
];

const master: NavItem[] = [
  {
    to: "/hotels",
    labelKey: "nav.hotels",
    icon: Hotel,
    permission: "hotels",
  },
  {
    to: "/room-types",
    labelKey: "nav.room_types",
    icon: BedDouble,
    permission: "room_types",
  },
  {
    to: "/suppliers",
    labelKey: "nav.suppliers",
    icon: Handshake,
    permission: "suppliers",
  },
  {
    to: "/supplier-applications",
    labelKey: "nav.supplier_applications",
    icon: Handshake,
    permission: "supplier_applications",
  },
  {
    to: "/rates",
    labelKey: "nav.rates",
    icon: Tags,
    permission: "rates",
  },
  {
    to: "/customers",
    labelKey: "nav.customers",
    icon: Users,
    permission: "customers",
  },
];

const finance: NavItem[] = [
  {
    to: "/invoices",
    labelKey: "nav.invoices",
    icon: ReceiptText,
  },
  {
    to: "/platform-transactions",
    labelKey: "nav.platform_transactions",
    icon: Wallet,
    permission: "transactions",
  },
  {
    to: "/currencies",
    labelKey: "nav.currencies",
    icon: DollarSign,
    permission: "currencies",
  },
];

const reports: NavItem[] = [
  {
    to: "/reports",
    labelKey: "nav.rpt_dashboards",
    icon: BarChart3,
    permission: "reports",
  },
];

const admin: NavItem[] = [
  { to: "/users", labelKey: "nav.users", icon: ShieldCheck },
  {
    to: "/tasks",
    labelKey: "nav.tasks",
    icon: ClipboardList,
    permission: "tasks",
  },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

const supplierNav: NavItem[] = [];

export function AppSidebar() {
  const { t, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const { pathname } = useLocation();
  const { open: isOpen } = useSidebar();

  const isSupplierOnly =
    hasRole(auth, "supplier") &&
    !hasAnyRole(auth, [
      "super_admin",
      "admin",
      "sales_manager",
      "sales_agent",
      "operations_manager",
      "operations_agent",
      "finance_manager",
      "finance_agent",
      "viewer",
    ]);

  const canSee = (item: NavItem) => {
    console.log('[canSee] Checking item:', item.to, 'permission:', item.permission);
    console.log('[canSee] Auth profile:', auth.profile);
    console.log('[canSee] Auth roles:', auth.roles);
    
    // Check permission if specified
    if (item.permission) {
      const permissions = (auth.profile as any)?.permissions;
      console.log('[canSee] Permissions:', permissions);
      if (permissions) {
        // Handle both object format (from API) and array format
        const hasPermission = typeof permissions === 'object' 
          ? permissions[item.permission] === 'true' || permissions[item.permission] === true
          : Array.isArray(permissions) && permissions.includes(item.permission);
        
        console.log('[canSee] Has permission for', item.permission, ':', hasPermission);
        if (!hasPermission) return false;
      }
    }

    // المنطق الافتراضي للمسارات
    const result = (
      hasRole(auth, "super_admin") ||
      ((!item.roles || item.roles.length === 0 || hasAnyRole(auth, item.roles)) &&
        canAccessModule(auth, pathToModule(item.to)))
    );
    console.log('[canSee] Final result for', item.to, ':', result);
    return result;
  };

  const visibleOperational = isSupplierOnly ? [] : operational.filter(canSee);
  const visibleAdmin = isSupplierOnly ? [] : admin.filter(canSee);
  const visibleMaster = isSupplierOnly ? [] : master.filter(canSee);
  const visibleFinance = isSupplierOnly ? [] : finance.filter(canSee);
  const visibleReports = isSupplierOnly ? [] : reports.filter(canSee);
  const visibleSupplier = supplierNav.filter(canSee);

  const renderItem = (item: NavItem) => {
    const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={active} tooltip={t(item.labelKey)} className="py-3">
          <Link to={item.to} className="flex items-center gap-3">
            <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span className="truncate text-sm">{t(item.labelKey)}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img
              src={logoUrl}
              alt={t("brand.name")}
              className="h-10 w-10 object-contain dark:hidden"
            />
            <img
              src={logoDarkUrl}
              alt={t("brand.name")}
              className="hidden h-10 w-10 object-contain dark:block"
            />
          </div>
          {isOpen && (
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-base font-semibold truncate">{t("brand.short")}</span>
              <span className="text-xs text-muted-foreground truncate">{t("brand.name")}</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {visibleSupplier.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.supplier_portal")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleSupplier.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleOperational.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.dashboard")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleOperational.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleMaster.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.master_data")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleMaster.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleFinance.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.finance")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleFinance.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleReports.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.reports")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleReports.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {t("nav.admin")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleAdmin.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1.0 · Phase 1
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}