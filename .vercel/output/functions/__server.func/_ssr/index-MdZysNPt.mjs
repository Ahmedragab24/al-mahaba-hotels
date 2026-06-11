import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { B as Badge, u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import "../_libs/sonner.mjs";
import { Z as Plus, a8 as Mailbox, x as Hourglass, a9 as PackageCheck, C as CircleCheck, z as CircleX, aa as Timer, $ as Search, X, ab as MapPin, U as Users, a0 as Eye } from "../_libs/lucide-react.mjs";
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
const PAGE_SIZE = 20;
function RStatusBadge({
  status,
  t
}) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive" : status === "draft" || status === "expired" ? "outline" : "default";
  const cls = status === "approved" || status === "completed" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: cls, children: t(`rstatus.${status}`) });
}
function RfqList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const dSearch = useDebounce(search, 300);
  const filtersActive = !!(dSearch || status !== "all" || from || to);
  const resetAll = () => {
    setSearch("");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(1);
  };
  const setStatusAndReset = (s) => {
    setStatus(s);
    setPage(1);
  };
  const metrics = useQuery({
    queryKey: ["rfq-metrics"],
    queryFn: async () => {
      const [{
        data: rows
      }, {
        data: resp
      }] = await Promise.all([supabase.from("rfqs").select("status").is("deleted_at", null), supabase.from("rfq_supplier_responses").select("responded_at, request:rfq_supplier_requests(sent_at)")]);
      const all = rows ?? [];
      const by = (...s) => all.filter((r) => s.includes(r.status)).length;
      const times = (resp ?? []).filter((r) => r.request?.sent_at).map((r) => (new Date(r.responded_at).getTime() - new Date(r.request.sent_at).getTime()) / 864e5);
      const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : "—";
      return {
        total: all.length,
        draft: by("draft"),
        sent: by("sent"),
        partial: by("partial"),
        waiting: by("sent", "partial"),
        completed: by("completed"),
        approved: by("approved"),
        rejected: by("rejected", "cancelled"),
        expired: by("expired"),
        avgDays: avg
      };
    }
  });
  const list = useQuery({
    queryKey: ["rfqs", {
      dSearch,
      status,
      from,
      to,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("rfqs").select("id,rfq_no,status,currency,destination,travel_start,travel_end,created_at,customer:customers(name_en,name_ar),supplier_requests:rfq_supplier_requests(supplier:suppliers(name_en,name_ar))", {
        count: "exact"
      }).is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("travel_start", from);
      if (to) q = q.lte("travel_end", to);
      if (dSearch.trim()) q = q.or(`rfq_no.ilike.%${dSearch.trim()}%,destination.ilike.%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", {
        ascending: false
      }).range(f, f + PAGE_SIZE - 1);
      const {
        data,
        error,
        count
      } = await q;
      if (error) throw error;
      return {
        rows: data ?? [],
        count: count ?? 0
      };
    }
  });
  const total = list.data?.count ?? 0;
  const actions = reactExports.useMemo(() => canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
    to: "/rfqs/new"
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
    " ",
    t("rfq.new")
  ] }), [canWrite, navigate, t]);
  const quickFilters = [{
    key: "all",
    label: t("filter.all"),
    count: metrics.data?.total,
    tone: "primary"
  }, {
    key: "draft",
    label: t("rstatus.draft"),
    count: metrics.data?.draft,
    tone: "muted"
  }, {
    key: "sent",
    label: t("rstatus.sent"),
    count: metrics.data?.sent,
    tone: "info"
  }, {
    key: "partial",
    label: t("rstatus.partial"),
    count: metrics.data?.partial,
    tone: "warning"
  }, {
    key: "completed",
    label: t("rstatus.completed"),
    count: metrics.data?.completed,
    tone: "success"
  }, {
    key: "approved",
    label: t("rstatus.approved"),
    count: metrics.data?.approved,
    tone: "success"
  }, {
    key: "rejected",
    label: t("rstatus.rejected"),
    count: metrics.data?.rejected,
    tone: "destructive"
  }, {
    key: "expired",
    label: t("rstatus.expired"),
    count: metrics.data?.expired,
    tone: "muted"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rfq.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Mailbox, tone: "primary", label: t("dash.rfq_total"), value: metrics.data?.total, active: status === "all", onClick: () => setStatusAndReset("all") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Hourglass, tone: "warning", label: t("dash.rfq_waiting"), value: metrics.data?.waiting, active: status === "sent", onClick: () => setStatusAndReset("sent") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: PackageCheck, tone: "success", label: t("dash.rfq_completed"), value: metrics.data?.completed, active: status === "completed", onClick: () => setStatusAndReset("completed") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "success", label: t("dash.rfq_approved"), value: metrics.data?.approved, active: status === "approved", onClick: () => setStatusAndReset("approved") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleX, tone: "muted", label: t("dash.rfq_expired"), value: metrics.data?.expired, active: status === "expired", onClick: () => setStatusAndReset("expired") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Timer, tone: "info", label: t("dash.rfq_avg_response"), value: metrics.data?.avgDays })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
          t("bk.filter.quick"),
          ":"
        ] }),
        quickFilters.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: q.label, count: q.count, tone: q.tone, active: status === q.key, onClick: () => setStatusAndReset(q.key) }, q.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: `${t("rfq.number")} / ${t("rfq.destination")}`, className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => {
            setFrom(e.target.value);
            setPage(1);
          }, className: "w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => {
            setTo(e.target.value);
            setPage(1);
          }, className: "w-full" })
        ] }),
        filtersActive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end sm:col-span-2 xl:col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: resetAll, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          " ",
          t("actions.reset")
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap bg-muted/40 hover:bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.customer", "العميل") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.destination") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.travel_start") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.travel_end") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.suppliers", "الموردون") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-sm flex-col items-center gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mailbox, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("label.no_results") }),
              filtersActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: resetAll, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                " ",
                t("actions.reset")
              ] }) : canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
                to: "/rfqs/new"
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                " ",
                t("rfq.new")
              ] })
            ] }) }) }),
            list.data?.rows.map((r) => {
              const supplierNames = (r.supplier_requests ?? []).map((sr) => sr.supplier ? lang === "ar" ? sr.supplier.name_ar || sr.supplier.name_en : sr.supplier.name_en || sr.supplier.name_ar : null).filter((x) => typeof x === "string" && x.length > 0);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap cursor-pointer hover:bg-muted/50", onClick: () => navigate({
                to: "/rfqs/$id",
                params: {
                  id: r.id
                }
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rfqs/$id", params: {
                  id: r.id
                }, className: "text-primary hover:underline", onClick: (e) => e.stopPropagation(), children: r.rfq_no }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: r.customer ? lang === "ar" ? r.customer.name_ar || r.customer.name_en : r.customer.name_en || r.customer.name_ar : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.destination ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  r.destination
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.travel_start, lang) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.travel_end, lang) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs max-w-[240px]", children: supplierNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", title: supplierNames.join("، "), children: [
                    supplierNames[0],
                    supplierNames.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ms-1 inline-flex items-center rounded-full bg-muted px-1.5 py-0 text-[10px] font-bold tabular-nums text-muted-foreground", children: [
                      "+",
                      supplierNames.length - 1
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RStatusBadge, { status: r.status, t }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rfqs/$id", params: {
                  id: r.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }) })
              ] }, r.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] })
  ] });
}
export {
  RStatusBadge,
  RfqList as component
};
