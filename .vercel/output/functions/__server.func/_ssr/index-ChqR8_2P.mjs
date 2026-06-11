import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { B as Badge, u as useI18n, e as useAuth, c as cn } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { a as formatDate, f as formatDateTime } from "./format-CMnhdgFc.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import "../_libs/sonner.mjs";
import { Z as Plus, w as FileText, D as Clock, C as CircleCheck, y as ThumbsUp, z as CircleX, am as DollarSign, ae as TriangleAlert, $ as Search, X, ad as CalendarClock, a0 as Eye } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
const PAGE_SIZE = 20;
function QStatusBadge({
  status,
  t
}) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive" : status === "draft" || status === "expired" ? "outline" : "default";
  const cls = status === "approved" || status === "accepted" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: cls, children: t(`qstatus.${status}`) });
}
function QuotationsList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [customer, setCustomer] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [hotel, setHotel] = reactExports.useState("all");
  const [creator, setCreator] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const dSearch = useDebounce(search, 300);
  const filtersActive = !!(dSearch || customer !== "all" || status !== "all" || hotel !== "all" || creator !== "all" || from || to);
  const resetAll = () => {
    setSearch("");
    setCustomer("all");
    setStatus("all");
    setHotel("all");
    setCreator("all");
    setFrom("");
    setTo("");
    setPage(1);
  };
  const setStatusAndReset = (s) => {
    setStatus(s);
    setPage(1);
  };
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const creators = useQuery({
    queryKey: ["lookup-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id,email")).data ?? []
  });
  const metrics = useQuery({
    queryKey: ["quotes-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("quotations").select("status, expiry_date, items:quotation_items(total_selling)").is("deleted_at", null);
      const rows = data ?? [];
      const sum = rows.reduce((a, r) => a + (r.items ?? []).reduce((x, i) => x + Number(i.total_selling), 0), 0);
      const by = (...s) => rows.filter((r) => s.includes(r.status)).length;
      const today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const in7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      const expiringSoon = rows.filter((r) => r.status === "sent" && r.expiry_date && r.expiry_date >= today2 && r.expiry_date <= in7).length;
      return {
        total: rows.length,
        draft: by("draft"),
        pending: by("pending_approval"),
        approved: by("approved"),
        sent: by("sent"),
        accepted: by("accepted"),
        rejected: by("rejected", "cancelled"),
        expired: by("expired"),
        expiringSoon,
        value: sum
      };
    }
  });
  const list = useQuery({
    queryKey: ["quotations", {
      dSearch,
      customer,
      status,
      hotel,
      creator,
      from,
      to,
      page
    }],
    queryFn: async () => {
      let ids = null;
      if (hotel !== "all") {
        const {
          data: data2
        } = await supabase.from("quotation_items").select("quotation_id").eq("hotel_id", hotel);
        ids = Array.from(new Set((data2 ?? []).map((x) => x.quotation_id)));
        if (ids.length === 0) return {
          rows: [],
          count: 0
        };
      }
      let q = supabase.from("quotations").select("id,quotation_no,status,currency,quotation_date,travel_date,expiry_date,created_by,created_at,deleted_at,customer:customers(name_en,name_ar),items:quotation_items(total_selling)", {
        count: "exact"
      }).is("deleted_at", null);
      if (ids) q = q.in("id", ids);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (creator !== "all") q = q.eq("created_by", creator);
      if (from) q = q.gte("quotation_date", from);
      if (to) q = q.lte("quotation_date", to);
      if (dSearch.trim()) q = q.ilike("quotation_no", `%${dSearch.trim()}%`);
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
  const fmt = (n) => n.toLocaleString(void 0, {
    maximumFractionDigits: 0
  });
  const creatorName = (id) => creators.data?.find((p) => p.id === id)?.email ?? "—";
  const actions = reactExports.useMemo(() => canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
    to: "/quotations/new"
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
    " ",
    t("quotes.new")
  ] }), [canWrite, navigate, t]);
  const quickFilters = [{
    key: "all",
    label: t("filter.all"),
    count: metrics.data?.total,
    tone: "primary"
  }, {
    key: "draft",
    label: t("qstatus.draft"),
    count: metrics.data?.draft,
    tone: "muted"
  }, {
    key: "pending_approval",
    label: t("qstatus.pending_approval"),
    count: metrics.data?.pending,
    tone: "warning"
  }, {
    key: "approved",
    label: t("qstatus.approved"),
    count: metrics.data?.approved,
    tone: "success"
  }, {
    key: "sent",
    label: t("qstatus.sent"),
    count: metrics.data?.sent,
    tone: "info"
  }, {
    key: "accepted",
    label: t("qstatus.accepted"),
    count: metrics.data?.accepted,
    tone: "success"
  }, {
    key: "rejected",
    label: t("qstatus.rejected"),
    count: metrics.data?.rejected,
    tone: "destructive"
  }, {
    key: "expired",
    label: t("qstatus.expired"),
    count: metrics.data?.expired,
    tone: "muted"
  }];
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("quotes.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: FileText, tone: "primary", label: t("dash.quotes_total"), value: metrics.data?.total, active: status === "all", onClick: () => setStatusAndReset("all") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Clock, tone: "warning", label: t("dash.quotes_pending"), value: metrics.data?.pending, active: status === "pending_approval", onClick: () => setStatusAndReset("pending_approval") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "info", label: t("dash.quotes_approved"), value: metrics.data?.approved, active: status === "approved", onClick: () => setStatusAndReset("approved") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: ThumbsUp, tone: "success", label: t("dash.quotes_accepted"), value: metrics.data?.accepted, active: status === "accepted", onClick: () => setStatusAndReset("accepted") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleX, tone: "destructive", label: t("dash.quotes_rejected"), value: metrics.data?.rejected, active: status === "rejected", onClick: () => setStatusAndReset("rejected") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: DollarSign, tone: "warning", label: t("dash.quotes_value"), value: metrics.data ? fmt(metrics.data.value) : void 0 })
      ] }),
      (metrics.data?.expiringSoon ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: metrics.data.expiringSoon }),
          " ",
          t("quotes.expiring_soon", "عروض ستنتهي صلاحيتها خلال 7 أيام")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setStatusAndReset("sent"), children: t("actions.view") })
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
          }, placeholder: t("quotes.number"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customer, onValueChange: (v) => {
          setCustomer(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.customer") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar }, c.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotel, onValueChange: (v) => {
          setHotel(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.hotel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: creator, onValueChange: (v) => {
          setCreator(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.creator") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            creators.data?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.email }, p.id))
          ] })
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
        filtersActive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 xl:col-span-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: resetAll, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          " ",
          t("actions.reset")
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap bg-muted/40 hover:bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.customer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.quotation_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.expiry_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("quotes.value") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.creator") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-sm flex-col items-center gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("label.no_results") }),
              filtersActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: resetAll, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                " ",
                t("actions.reset")
              ] }) : canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
                to: "/quotations/new"
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                " ",
                t("quotes.new")
              ] })
            ] }) }) }),
            list.data?.rows.map((q) => {
              const value = (q.items ?? []).reduce((a, i) => a + Number(i.total_selling), 0);
              const expiringSoon = q.status === "sent" && q.expiry_date && q.expiry_date >= today && (new Date(q.expiry_date).getTime() - new Date(today).getTime()) / 864e5 <= 7;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap cursor-pointer hover:bg-muted/50", onClick: () => navigate({
                to: "/quotations/$id",
                params: {
                  id: q.id
                }
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/quotations/$id", params: {
                  id: q.id
                }, className: "text-primary hover:underline", onClick: (e) => e.stopPropagation(), children: q.quotation_no }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: q.customer ? lang === "ar" ? q.customer.name_ar || q.customer.name_en : q.customer.name_en || q.customer.name_ar : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(q.quotation_date, lang) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1", expiringSoon && "font-semibold text-amber-600 dark:text-amber-400"), children: [
                  expiringSoon && /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3 w-3" }),
                  formatDate(q.expiry_date, lang)
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs font-semibold tabular-nums", children: [
                  fmt(value),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: q.currency })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QStatusBadge, { status: q.status, t }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate max-w-[180px]", children: creatorName(q.created_by) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: "text-muted-foreground", children: formatDateTime(q.created_at, lang) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/quotations/$id", params: {
                  id: q.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }) })
              ] }, q.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] })
  ] });
}
export {
  QStatusBadge,
  QuotationsList as component
};
