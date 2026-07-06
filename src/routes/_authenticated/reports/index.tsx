import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import type { PermissionKey } from "@/types/permissions";
import {
  BookingDashboard, QuotationDashboard, HotelDashboard, RoomDashboard, CustomerDashboard, SupplierDashboard, InvoiceDashboard, TaskDashboard,
} from "./-dashboards";

type DashTab = { key: string; labelKey: string; permission: PermissionKey; Comp: React.ComponentType };

const TABS: DashTab[] = [
  { key: "bookings", labelKey: "nav.bookings", permission: "reports", Comp: BookingDashboard },
  { key: "quotations", labelKey: "nav.quotations", permission: "reports", Comp: QuotationDashboard },
  { key: "hotels", labelKey: "nav.hotels", permission: "reports", Comp: HotelDashboard },
  { key: "rooms", labelKey: "nav.rooms", permission: "reports", Comp: RoomDashboard },
  { key: "customers", labelKey: "nav.customers", permission: "reports", Comp: CustomerDashboard },
  { key: "suppliers", labelKey: "nav.suppliers", permission: "reports", Comp: SupplierDashboard },
  { key: "invoices", labelKey: "nav.invoices", permission: "reports", Comp: InvoiceDashboard },
  { key: "tasks", labelKey: "nav.tasks", permission: "reports", Comp: TaskDashboard },
];

export default function ReportsHub() {
  const { t } = useI18n();
  const auth = useSelector(selectAuth);
  const visible = TABS.filter((tab) => canAccessModule(auth, tab.permission));

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

export { ReportsHub as Component };
