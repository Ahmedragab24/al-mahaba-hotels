import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { N as Navigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { e as useAuth, u as useI18n } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
import "../_libs/sonner.mjs";
import { U as Users, k as Hotel, u as Truck, T as Tags, v as ClipboardCheck, w as FileText, x as Hourglass, C as CircleCheck, y as ThumbsUp, z as CircleX, D as Clock, E as Banknote, G as TrendingDown, o as TrendingUp, P as Percent, i as Activity } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "./simulation-engine.server-CqcvilV1.mjs";
function DashboardOrRedirect() {
  const auth = useAuth();
  if (!auth.loading && auth.hasRole("supplier") && !auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"])) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/supplier-portal", replace: true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {});
}
function StatCard({
  icon: Icon,
  label,
  value,
  to
}) {
  const card = /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: to ? "h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" : "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 text-sm text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words text-2xl font-bold leading-tight tabular-nums xl:text-3xl", children: value })
  ] }) });
  if (to) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "block h-full", children: card });
  return card;
}
function Dashboard() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [c, h, s, r, p] = await Promise.all([supabase.from("customers").select("*", {
        count: "exact",
        head: true
      }).is("deleted_at", null), supabase.from("hotels").select("*", {
        count: "exact",
        head: true
      }).is("deleted_at", null), supabase.from("suppliers").select("*", {
        count: "exact",
        head: true
      }).is("deleted_at", null), supabase.from("rates").select("*", {
        count: "exact",
        head: true
      }).is("deleted_at", null), supabase.from("rates").select("*", {
        count: "exact",
        head: true
      }).eq("status", "pending_approval")]);
      return {
        customers: c.count ?? 0,
        hotels: h.count ?? 0,
        suppliers: s.count ?? 0,
        rates: r.count ?? 0,
        pending: p.count ?? 0
      };
    }
  });
  const pricing = useQuery({
    queryKey: ["dashboard-pricing"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_occupancy_prices").select("cost_price, selling_price").eq("active", true);
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) return null;
      const avg = (ns) => ns.reduce((a, b) => a + b, 0) / ns.length;
      const costs = rows.map((r) => Number(r.cost_price));
      const sells = rows.filter((r) => r.selling_price != null).map((r) => Number(r.selling_price));
      const margins = rows.filter((r) => r.selling_price != null && Number(r.cost_price) > 0).map((r) => (Number(r.selling_price) - Number(r.cost_price)) / Number(r.cost_price) * 100);
      return {
        avgCost: costs.length ? avg(costs).toFixed(2) : "—",
        avgSelling: sells.length ? avg(sells).toFixed(2) : "—",
        avgMargin: margins.length ? avg(margins).toFixed(2) + " %" : "—"
      };
    }
  });
  const quotes = useQuery({
    queryKey: ["dashboard-quotes"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("quotations").select("status, items:quotation_items(total_selling)").is("deleted_at", null);
      if (error) throw error;
      const rows = data ?? [];
      const by = (s) => rows.filter((r) => r.status === s).length;
      const value = rows.reduce((a, r) => a + (r.items ?? []).reduce((x, i) => x + Number(i.total_selling), 0), 0);
      return {
        total: rows.length,
        pending: by("pending_approval"),
        approved: by("approved"),
        accepted: by("accepted"),
        rejected: by("rejected"),
        expired: by("expired"),
        value: value.toLocaleString("en-US", {
          maximumFractionDigits: 0
        })
      };
    }
  });
  const activity = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("audit_logs").select("id, action, entity_type, entity_id, user_email, created_at").order("created_at", {
        ascending: false
      }).limit(10);
      return data ?? [];
    }
  });
  const greet = lang === "ar" ? auth.profile?.full_name_ar || auth.profile?.full_name_en || auth.user?.email : auth.profile?.full_name_en || auth.profile?.full_name_ar || auth.user?.email;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: `${t("dash.welcome")}, ${greet ?? ""}`, subtitle: t("dash.summary") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Users, label: t("dash.customers_count"), value: stats.data?.customers ?? "—", to: "/customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Hotel, label: t("dash.hotels_count"), value: stats.data?.hotels ?? "—", to: "/hotels" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Truck, label: t("dash.suppliers_count"), value: stats.data?.suppliers ?? "—", to: "/suppliers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Tags, label: t("dash.rates_count"), value: stats.data?.rates ?? "—", to: "/rates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ClipboardCheck, label: t("dash.pending_approvals"), value: stats.data?.pending ?? "—", to: "/rates" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-medium text-muted-foreground", children: t("dash.quotes_metrics") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FileText, label: t("dash.quotes_total"), value: quotes.data?.total ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Hourglass, label: t("dash.quotes_pending"), value: quotes.data?.pending ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: t("dash.quotes_approved"), value: quotes.data?.approved ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ThumbsUp, label: t("dash.quotes_accepted"), value: quotes.data?.accepted ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleX, label: t("dash.quotes_rejected"), value: quotes.data?.rejected ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Clock, label: t("dash.quotes_expired"), value: quotes.data?.expired ?? "—", to: "/quotations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Banknote, label: t("dash.quotes_value"), value: quotes.data?.value ?? "—", to: "/quotations" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-medium text-muted-foreground", children: t("dash.pricing_metrics") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingDown, label: t("dash.avg_cost"), value: pricing.data?.avgCost ?? "—", to: "/rates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingUp, label: t("dash.avg_selling"), value: pricing.data?.avgSelling ?? "—", to: "/rates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Percent, label: t("dash.avg_margin"), value: pricing.data?.avgMargin ?? "—", to: "/rates" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5" }),
          " ",
          t("dash.recent_activity")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: activity.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("label.loading") }) : (activity.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("label.no_results") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: activity.data.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: a.action }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: a.entity_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: a.user_email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: formatDateTime(a.created_at, lang) })
        ] }, a.id)) }) })
      ] })
    ] })
  ] });
}
export {
  DashboardOrRedirect as component
};
