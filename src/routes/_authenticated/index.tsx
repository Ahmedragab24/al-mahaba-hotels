import { createFileRoute, Link, Navigate, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hotel, Truck, Tags, ClipboardCheck, Activity, TrendingUp, TrendingDown, Percent, FileText, Hourglass, CheckCircle2, ThumbsUp, XCircle, Clock, Banknote } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardOrRedirect,
});

function DashboardOrRedirect() {
  const auth = useAuth();
  if (!auth.loading && auth.hasRole("supplier") && !auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent","finance_manager","finance_agent","viewer"])) {
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

function Dashboard() {
  const { t, lang } = useI18n();
  const auth = useAuth();

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [c, h, s, r, p] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("hotels").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("suppliers").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("rates").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("rates").select("*", { count: "exact", head: true }).eq("status", "pending_approval"),
      ]);
      return {
        customers: c.count ?? 0,
        hotels: h.count ?? 0,
        suppliers: s.count ?? 0,
        rates: r.count ?? 0,
        pending: p.count ?? 0,
      };
    },
  });

  const pricing = useQuery({
    queryKey: ["dashboard-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_occupancy_prices")
        .select("cost_price, selling_price")
        .eq("active", true);
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) return null;
      const avg = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;
      const costs = rows.map((r) => Number(r.cost_price));
      const sells = rows.filter((r) => r.selling_price != null).map((r) => Number(r.selling_price));
      const margins = rows
        .filter((r) => r.selling_price != null && Number(r.cost_price) > 0)
        .map((r) => ((Number(r.selling_price) - Number(r.cost_price)) / Number(r.cost_price)) * 100);
      return {
        avgCost: costs.length ? avg(costs).toFixed(2) : "—",
        avgSelling: sells.length ? avg(sells).toFixed(2) : "—",
        avgMargin: margins.length ? avg(margins).toFixed(2) + " %" : "—",
      };
    },
  });

  const quotes = useQuery({
    queryKey: ["dashboard-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("status, items:quotation_items(total_selling)")
        .is("deleted_at", null);
      if (error) throw error;
      const rows = data ?? [];
      const by = (s: string) => rows.filter((r: any) => r.status === s).length;
      const value = rows.reduce((a, r: any) => a + (r.items ?? []).reduce((x: number, i: any) => x + Number(i.total_selling), 0), 0);
      return {
        total: rows.length,
        pending: by("pending_approval"),
        approved: by("approved"),
        accepted: by("accepted"),
        rejected: by("rejected"),
        expired: by("expired"),
        value: value.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      };
    },
  });

  const activity = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, user_email, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const greet = lang === "ar"
    ? (auth.profile?.full_name_ar || auth.profile?.full_name_en || auth.user?.email)
    : (auth.profile?.full_name_en || auth.profile?.full_name_ar || auth.user?.email);

  return (
    <>
      <PageHeader title={`${t("dash.welcome")}, ${greet ?? ""}`} subtitle={t("dash.summary")} />
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
                {activity.data!.map((a) => (
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
