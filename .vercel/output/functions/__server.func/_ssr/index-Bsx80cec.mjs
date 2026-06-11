import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { B as Badge, u as useI18n, e as useAuth, f as BK_WRITE_ROLES } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import "../_libs/sonner.mjs";
import { Z as Plus, n as ClipboardList, C as CircleCheck, at as LogIn, au as CheckCheck, z as CircleX, am as DollarSign, $ as Search, X, av as CalendarCheck2, k as Hotel, B as BedDouble, w as FileText, a0 as Eye } from "../_libs/lucide-react.mjs";
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
function BkStatusBadge({
  status,
  t
}) {
  const variant = status === "cancelled" || status === "no_show" ? "destructive" : status === "draft" || status === "checked_out" ? "outline" : "default";
  const cls = status === "confirmed" || status === "checked_in" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: cls, children: t(`bkstatus.${status}`) });
}
function BookingsList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole([...BK_WRITE_ROLES]);
  const [search, setSearch] = reactExports.useState("");
  const [customer, setCustomer] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [hotel, setHotel] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const dSearch = useDebounce(search, 300);
  const filtersActive = !!(dSearch || customer !== "all" || status !== "all" || hotel !== "all" || from || to);
  const resetAll = () => {
    setSearch("");
    setCustomer("all");
    setStatus("all");
    setHotel("all");
    setFrom("");
    setTo("");
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
  const metrics = useQuery({
    queryKey: ["bookings-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("bookings").select("status, rooms:booking_rooms(total_selling)").is("deleted_at", null);
      const rows = data ?? [];
      const sum = rows.reduce((a, r) => a + (r.rooms ?? []).reduce((x, i) => x + Number(i.total_selling), 0), 0);
      const by = (...s) => rows.filter((r) => s.includes(r.status)).length;
      return {
        total: rows.length,
        draft: by("draft"),
        pending: by("pending_confirmation"),
        confirmed: by("confirmed"),
        inHouse: by("checked_in"),
        completed: by("checked_out"),
        cancelled: by("cancelled", "no_show"),
        value: sum
      };
    }
  });
  const list = useQuery({
    queryKey: ["bookings", {
      dSearch,
      customer,
      status,
      hotel,
      from,
      to,
      page
    }],
    queryFn: async () => {
      let ids = null;
      if (hotel !== "all") {
        const {
          data: data2
        } = await supabase.from("booking_rooms").select("booking_id").eq("hotel_id", hotel);
        ids = Array.from(new Set((data2 ?? []).map((x) => x.booking_id)));
        if (ids.length === 0) return {
          rows: [],
          count: 0
        };
      }
      let q = supabase.from("bookings").select("id,booking_no,status,currency,booking_date,quotation_id,created_by,customer:customers(name_en,name_ar),rooms:booking_rooms(total_selling,check_in,check_out,hotel:hotels(name_en,name_ar))", {
        count: "exact"
      }).is("deleted_at", null);
      if (ids) q = q.in("id", ids);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("booking_date", from);
      if (to) q = q.lte("booking_date", to);
      if (dSearch.trim()) q = q.ilike("booking_no", `%${dSearch.trim()}%`);
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
  const actions = reactExports.useMemo(() => canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
    to: "/bookings/new"
  }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
    " ",
    t("bk.new")
  ] }), [canWrite, navigate, t]);
  const setStatusAndReset = (s) => {
    setStatus(s);
    setPage(1);
  };
  const quickFilters = [{
    key: "all",
    label: t("filter.all"),
    count: metrics.data?.total,
    tone: "primary"
  }, {
    key: "draft",
    label: t("bkstatus.draft"),
    count: metrics.data?.draft,
    tone: "muted"
  }, {
    key: "pending_confirmation",
    label: t("bkstatus.pending_confirmation"),
    count: metrics.data?.pending,
    tone: "warning"
  }, {
    key: "confirmed",
    label: t("bkstatus.confirmed"),
    count: metrics.data?.confirmed,
    tone: "success"
  }, {
    key: "checked_in",
    label: t("bkstatus.checked_in"),
    count: metrics.data?.inHouse,
    tone: "info"
  }, {
    key: "checked_out",
    label: t("bkstatus.checked_out"),
    count: metrics.data?.completed,
    tone: "muted"
  }, {
    key: "cancelled",
    label: t("bkstatus.cancelled"),
    count: metrics.data?.cancelled,
    tone: "destructive"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("bk.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: ClipboardList, tone: "primary", label: t("bk.kpi.total"), value: metrics.data?.total, active: status === "all", onClick: () => setStatusAndReset("all") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "success", label: t("bk.kpi.confirmed"), value: metrics.data?.confirmed, active: status === "confirmed", onClick: () => setStatusAndReset("confirmed") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: LogIn, tone: "info", label: t("bk.kpi.in_house"), value: metrics.data?.inHouse, active: status === "checked_in", onClick: () => setStatusAndReset("checked_in") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CheckCheck, tone: "muted", label: t("bk.kpi.completed"), value: metrics.data?.completed, active: status === "checked_out", onClick: () => setStatusAndReset("checked_out") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleX, tone: "destructive", label: t("bk.kpi.cancelled"), value: metrics.data?.cancelled, active: status === "cancelled", onClick: () => setStatusAndReset("cancelled") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: DollarSign, tone: "warning", label: t("bk.kpi.value"), value: metrics.data ? fmt(metrics.data.value) : void 0 })
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
          }, placeholder: t("bk.number"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customer, onValueChange: (v) => {
          setCustomer(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("bk.customer") }) }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.customer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.col.hotels") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.col.checkin") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: t("bk.col.nights") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.source") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("bk.value") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-sm flex-col items-center gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck2, { className: "h-7 w-7" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("label.no_results") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("bk.no_results_hint") }),
              filtersActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: resetAll, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                " ",
                t("actions.reset")
              ] }),
              !filtersActive && canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
                to: "/bookings/new"
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                " ",
                t("bk.new")
              ] })
            ] }) }) }),
            list.data?.rows.map((b) => {
              const value = (b.rooms ?? []).reduce((a, i) => a + Number(i.total_selling), 0);
              const earliestCheckIn = (b.rooms ?? []).map((r) => r.check_in).filter(Boolean).sort()[0];
              const latestCheckOut = (b.rooms ?? []).map((r) => r.check_out).filter(Boolean).sort().slice(-1)[0];
              const nights = earliestCheckIn && latestCheckOut ? Math.max(0, Math.round((new Date(latestCheckOut).getTime() - new Date(earliestCheckIn).getTime()) / 864e5)) : null;
              const hotelNames = Array.from(new Set((b.rooms ?? []).map((r) => r.hotel ? lang === "ar" ? r.hotel.name_ar || r.hotel.name_en : r.hotel.name_en || r.hotel.name_ar : null).filter((x) => typeof x === "string" && x.length > 0)));
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap cursor-pointer hover:bg-muted/50", onClick: () => navigate({
                to: "/bookings/$id",
                params: {
                  id: b.id
                }
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/bookings/$id", params: {
                  id: b.id
                }, className: "text-primary hover:underline", onClick: (e) => e.stopPropagation(), children: b.booking_no }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: b.customer ? lang === "ar" ? b.customer.name_ar || b.customer.name_en : b.customer.name_en || b.customer.name_ar : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs max-w-[220px]", children: hotelNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", title: hotelNames.join(", "), children: [
                    hotelNames[0],
                    hotelNames.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                      " +",
                      hotelNames.length - 1
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: earliestCheckIn ? formatDate(earliestCheckIn, lang) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center text-xs", children: nights !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "h-3 w-3" }),
                  " ",
                  nights
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: b.quotation_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                  " ",
                  t("bk.source_quotation")
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("bk.source_direct") }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs font-semibold tabular-nums", children: [
                  fmt(value),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: b.currency })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BkStatusBadge, { status: b.status, t }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/bookings/$id", params: {
                  id: b.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }) })
              ] }, b.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] })
  ] });
}
export {
  BkStatusBadge,
  BookingsList as component
};
