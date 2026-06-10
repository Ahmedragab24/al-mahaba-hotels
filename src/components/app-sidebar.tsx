import { Link, useRouterState } from "@tanstack/react-router";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Handshake,
  Tags,
  ShieldCheck,
  History,
  Settings,
  Hotel,
  BedDouble,
  FileSignature,
  FileSpreadsheet,
  CalendarRange,
  Percent,
  ReceiptText,
  MailQuestion,
  CalendarCheck,
  BarChart3,
  ClipboardList,
  Wallet,
  Landmark,
  LayoutTemplate,
  TrendingUp,
  Scale,
} from "lucide-react";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import logoDarkUrl from "@/assets/daleel-logo-dark.png";
import { useI18n } from "@/lib/i18n";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { pathToModule } from "@/lib/modules";

type NavItem = { to: string; labelKey: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; roles?: AppRole[] };

const operational: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/bookings", labelKey: "nav.bookings", icon: CalendarCheck,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/rfqs", labelKey: "nav.rfqs", icon: MailQuestion,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/quotations", labelKey: "nav.quotations", icon: FileSpreadsheet,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","finance_manager","finance_agent","viewer"] },
];
const master: NavItem[] = [
  { to: "/customers", labelKey: "nav.customers", icon: Users,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/hotels", labelKey: "nav.hotels", icon: Hotel,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/suppliers", labelKey: "nav.suppliers", icon: Handshake,
    roles: ["super_admin","admin","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/rates", labelKey: "nav.rates", icon: Tags,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/rates/compare", labelKey: "rates.compare", icon: Tags,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
];
const contracting: NavItem[] = [
  { to: "/room-types", labelKey: "nav.room_types", icon: BedDouble,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","viewer"] },
  { to: "/contracts", labelKey: "nav.contracts", icon: FileSignature,
    roles: ["super_admin","admin","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/seasons", labelKey: "nav.seasons", icon: CalendarRange,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","viewer"] },
  { to: "/taxes", labelKey: "nav.taxes", icon: Percent,
    roles: ["super_admin","admin","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
];
const finance: NavItem[] = [
  { to: "/invoices", labelKey: "nav.invoices", icon: ReceiptText,
    roles: ["super_admin","admin","finance_manager","finance_agent"] },
  { to: "/receipts", labelKey: "nav.receipts", icon: Wallet,
    roles: ["super_admin","admin","finance_manager","finance_agent"] },
  { to: "/payables", labelKey: "nav.payables", icon: Landmark,
    roles: ["super_admin","admin","finance_manager","finance_agent"] },
];
const reports: NavItem[] = [
  { to: "/reports", labelKey: "nav.rpt_dashboards", icon: BarChart3,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/reports/operational", labelKey: "nav.rpt_operational", icon: ClipboardList,
    roles: ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"] },
  { to: "/reports/financial", labelKey: "nav.rpt_financial", icon: TrendingUp,
    roles: ["super_admin","admin","finance_manager","finance_agent"] },
  { to: "/reports/tax", labelKey: "nav.rpt_tax", icon: Scale,
    roles: ["super_admin","admin","finance_manager","finance_agent"] },
  { to: "/reports/templates", labelKey: "nav.rpt_templates", icon: LayoutTemplate,
    roles: ["super_admin","admin","sales_manager","operations_manager","finance_manager","finance_agent"] },
];
const admin: NavItem[] = [
  { to: "/users", labelKey: "nav.users", icon: ShieldCheck, roles: ["super_admin","admin"] },
  { to: "/supplier-applications", labelKey: "nav.supplier_applications", icon: Handshake, roles: ["super_admin","admin"] },
  { to: "/approval-thresholds", labelKey: "nav.approval_thresholds", icon: Scale, roles: ["super_admin","admin","finance_manager"] },
  { to: "/audit", labelKey: "nav.audit", icon: History, roles: ["super_admin","admin"] },
  { to: "/settings", labelKey: "nav.settings", icon: Settings, roles: ["super_admin","admin"] },
];
const supplierNav: NavItem[] = [
  { to: "/supplier-portal", labelKey: "nav.supplier_portal", icon: LayoutDashboard, roles: ["supplier"] },
];

export function AppSidebar() {
  const { t, dir } = useI18n();
  const auth = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isSupplierOnly = auth.hasRole("supplier") && !auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"]);

  const canSee = (item: NavItem) =>
    (!item.roles || item.roles.length === 0 || auth.hasAnyRole(item.roles)) &&
    auth.canAccessModule(pathToModule(item.to));
  const visibleOperational = isSupplierOnly ? [] : operational.filter(canSee);
  const visibleContracting = isSupplierOnly ? [] : contracting.filter(canSee);
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
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src={logoUrl} alt={t("brand.name")} className="h-10 w-10 object-contain dark:hidden" />
            <img src={logoDarkUrl} alt={t("brand.name")} className="hidden h-10 w-10 object-contain dark:block" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-base font-semibold truncate">{t("brand.short")}</span>
            <span className="text-xs text-muted-foreground truncate">{t("brand.name")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{visibleOperational.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {visibleContracting.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.contracting")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleContracting.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleMaster.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.master_data")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleMaster.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleFinance.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.finance")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleFinance.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleReports.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.reports")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{visibleReports.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {visibleAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">{t("nav.admin")}</SidebarGroupLabel>
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
