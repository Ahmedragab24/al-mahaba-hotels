// Reports & Dashboards hub — role-gated dashboard tabs (Section 17).
import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { BOOKING_ROLES, EXEC_ROLES, FINANCE_ROLES, SALES_ROLES, SUPPLIER_ROLES } from "@/lib/kpi";
import type { AppRole } from "@/hooks/use-auth";
import {
  BookingDashboard, ExecutiveDashboard, ProfitDashboard, ReceivablesDashboard, SalesDashboard, SupplierDashboard,
} from "./-dashboards";

export const Route = createFileRoute("/_authenticated/reports/")({
  component: ReportsHub,
});

type DashTab = { key: string; labelKey: string; roles: AppRole[]; Comp: React.ComponentType };

const TABS: DashTab[] = [
  { key: "executive", labelKey: "rpt.tab_executive", roles: EXEC_ROLES, Comp: ExecutiveDashboard },
  { key: "sales", labelKey: "rpt.tab_sales", roles: SALES_ROLES, Comp: SalesDashboard },
  { key: "bookings", labelKey: "rpt.tab_bookings", roles: BOOKING_ROLES, Comp: BookingDashboard },
  { key: "suppliers", labelKey: "rpt.tab_suppliers", roles: SUPPLIER_ROLES, Comp: SupplierDashboard },
  { key: "receivables", labelKey: "rpt.tab_receivables", roles: FINANCE_ROLES, Comp: ReceivablesDashboard },
  { key: "profit", labelKey: "rpt.tab_profit", roles: FINANCE_ROLES, Comp: ProfitDashboard },
];

function ReportsHub() {
  const { t } = useI18n();
  const auth = useAuth();
  const visible = TABS.filter((tab) => auth.hasAnyRole(tab.roles));

  return (
    <>
      <PageHeader title={t("rpt.title")} subtitle={t("rpt.subtitle_dash")} />
      <div className="p-6">
        {visible.length === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <ShieldAlert className="h-5 w-5" /> {t("rpt.no_access")}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={visible[0].key}>
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
              {visible.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="px-4 py-2">
                  {t(tab.labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
            {visible.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                <tab.Comp />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </>
  );
}
