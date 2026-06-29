import { Link, Navigate, type LinkProps } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hotel, Truck, Tags, ClipboardCheck, Activity, TrendingUp, TrendingDown, Percent, FileText, Hourglass, CheckCircle2, ThumbsUp, XCircle, Clock, Banknote } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default function DashboardOrRedirect() {
  const auth = useSelector(selectAuth);
  if (hasRole(auth, "viewer") && !hasAnyRole(auth, ["super_admin", "sales_manager", "financial_manager", "employee", "viewer"])) {
    return <Navigate to="/supplier-portal" replace />;
  }
  return <Dashboard />;
}

function StatCard({ icon: Icon, label, value, to }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; to?: LinkProps["to"] }) {
  const card = (
    <Card className={to ? "h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" : "h-full"}>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="break-words text-2xl font-bold leading-tight tabular-nums xl:text-3xl">{value}</div>
      </CardContent>
    </Card>
  );
  if (to) return <Link to={to} className="block h-full">{card}</Link>;
  return card;
}

/** Helper: safely get array length from API response (handles {data:[...]}, [...], or wrapped objects) */
function extractList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

function Dashboard() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Fetch counts from available API endpoints
      const [suppliersRes, hotelsRes] = await Promise.allSettled([
        apiClient.suppliers.getAll(),
        apiClient.hotels.getAll(),
      ]);

      const suppliers = suppliersRes.status === "fulfilled" ? extractList(suppliersRes.value).length : 0;
      const hotels = hotelsRes.status === "fulfilled" ? extractList(hotelsRes.value).length : 0;

      return {
        customers: "—",  // No endpoint yet
        hotels,
        suppliers,
        rates: "—",       // No endpoint yet
        pending: "—",     // No endpoint yet
      };
    },
  });

  const pricing = useQuery({
    queryKey: ["dashboard-pricing"],
    queryFn: async () => {
      // No dedicated pricing stats endpoint yet — return placeholder
      return {
        avgCost: "—",
        avgSelling: "—",
        avgMargin: "—",
      };
    },
  });

  const quotes = useQuery({
    queryKey: ["dashboard-quotes"],
    queryFn: async () => {
      // No dedicated quotations stats endpoint yet — return placeholder
      return {
        total: "—",
        pending: "—",
        approved: "—",
        accepted: "—",
        rejected: "—",
        expired: "—",
        value: "—",
      };
    },
  });

  const activity = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      // No dedicated audit logs endpoint yet — return empty list
      return [] as any[];
    },
  });

  const greet = (auth.profile as any)?.name || (auth.profile as any)?.full_name_en || (auth.profile as any)?.full_name_ar || auth.user?.email;

  return (
    <>
      <PageHeader title={`${t("dash.welcome")}, ${greet ?? ""}`} />
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Users} label={t("dash.customers_count")} value={stats.data?.customers ?? "—"} to="/customers" />
          <StatCard icon={Hotel} label={t("dash.hotels_count")} value={stats.data?.hotels ?? "—"} to="/hotels" />
          <StatCard icon={Truck} label={t("dash.suppliers_count")} value={stats.data?.suppliers ?? "—"} to="/suppliers" />
          <StatCard icon={Tags} label={t("dash.rates_count")} value={stats.data?.rates ?? "—"} to="/rates" />
          <StatCard icon={ClipboardCheck} label={t("dash.pending_approvals")} value={stats.data?.pending ?? "—"} to="/rates" />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("dash.quotes_metrics")}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FileText} label={t("dash.quotes_total")} value={quotes.data?.total ?? "—"} to="/quotations" />
            <StatCard icon={Hourglass} label={t("dash.quotes_pending")} value={quotes.data?.pending ?? "—"} to="/quotations" />
            <StatCard icon={CheckCircle2} label={t("dash.quotes_approved")} value={quotes.data?.approved ?? "—"} to="/quotations" />
            <StatCard icon={ThumbsUp} label={t("dash.quotes_accepted")} value={quotes.data?.accepted ?? "—"} to="/quotations" />
            <StatCard icon={XCircle} label={t("dash.quotes_rejected")} value={quotes.data?.rejected ?? "—"} to="/quotations" />
            <StatCard icon={Clock} label={t("dash.quotes_expired")} value={quotes.data?.expired ?? "—"} to="/quotations" />
            <StatCard icon={Banknote} label={t("dash.quotes_value")} value={quotes.data?.value ?? "—"} to="/quotations" />
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("dash.pricing_metrics")}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard icon={TrendingDown} label={t("dash.avg_cost")} value={pricing.data?.avgCost ?? "—"} to="/rates" />
            <StatCard icon={TrendingUp} label={t("dash.avg_selling")} value={pricing.data?.avgSelling ?? "—"} to="/rates" />
            <StatCard icon={Percent} label={t("dash.avg_margin")} value={pricing.data?.avgMargin ?? "—"} to="/rates" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" /> {t("dash.recent_activity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("label.loading")}</p>
            ) : (activity.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">{t("label.no_results")}</p>
            ) : (
              <ul className="divide-y">
                {activity.data!.map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">{a.action}</span>
                    <span className="text-muted-foreground">{a.entity_type}</span>
                    <span className="text-sm text-muted-foreground">{a.user_email}</span>
                    <span className="text-sm text-muted-foreground">{formatDateTime(a.created_at, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export { DashboardOrRedirect as Component };
