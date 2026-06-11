import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { B as Badge, u as useI18n, e as useAuth, F as FINANCE_WRITE } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, w as FileText, W as Wallet, ae as TriangleAlert, C as CircleCheck, ao as FilePen, $ as Search, a0 as Eye } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
const PAGE_SIZE = 20;
const STATUSES = ["draft", "issued", "sent", "partially_paid", "paid", "cancelled"];
function InvStatusBadge({
  status,
  t
}) {
  const variant = status === "cancelled" ? "destructive" : status === "draft" ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600" : status === "partially_paid" ? "bg-amber-500 text-white hover:bg-amber-500" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: cls, children: t(`invstatus.${status}`) });
}
function InvoicesList() {
  const {
    t,
    lang,
    dir
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole([...FINANCE_WRITE]);
  const [search, setSearch] = reactExports.useState("");
  const [customer, setCustomer] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const dSearch = useDebounce(search, 300);
  const [openNew, setOpenNew] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("booking");
  const [bookingId, setBookingId] = reactExports.useState("");
  const [mCustomer, setMCustomer] = reactExports.useState("");
  const [mCurrency, setMCurrency] = reactExports.useState("SAR");
  const [mDate, setMDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [mDue, setMDue] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [busy, setBusy] = reactExports.useState(false);
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await supabase.from("currencies").select("code").order("code")).data ?? []
  });
  const bookings = useQuery({
    queryKey: ["lookup-confirmed-bookings"],
    enabled: openNew,
    queryFn: async () => (await supabase.from("bookings").select("id,booking_no,status,currency,customer:customers(name_en,name_ar)").in("status", ["confirmed", "checked_in", "checked_out"]).is("deleted_at", null).order("created_at", {
      ascending: false
    })).data ?? []
  });
  const metrics = useQuery({
    queryKey: ["inv-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("invoices").select("status,total_amount,paid_amount,due_date").is("deleted_at", null);
      const rows = data ?? [];
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const open = rows.filter((r) => ["issued", "sent", "partially_paid"].includes(r.status));
      return {
        total: rows.length,
        outstanding: open.reduce((a, r) => a + Number(r.total_amount) - Number(r.paid_amount), 0),
        overdue: open.filter((r) => r.due_date < today).length,
        paid: rows.filter((r) => r.status === "paid").length,
        draft: rows.filter((r) => r.status === "draft").length
      };
    }
  });
  const list = useQuery({
    queryKey: ["invoices", {
      dSearch,
      customer,
      status,
      from,
      to,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("invoices").select("id,invoice_no,status,invoice_date,due_date,currency,total_amount,paid_amount,customer:customers(name_en,name_ar)", {
        count: "exact"
      }).is("deleted_at", null);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("invoice_date", from);
      if (to) q = q.lte("invoice_date", to);
      if (dSearch.trim()) q = q.ilike("invoice_no", `%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      const {
        data,
        error,
        count
      } = await q.order("created_at", {
        ascending: false
      }).range(f, f + PAGE_SIZE - 1);
      if (error) throw error;
      return {
        rows: data ?? [],
        count: count ?? 0
      };
    }
  });
  const createInvoice = async () => {
    setBusy(true);
    try {
      if (mode === "booking") {
        if (!bookingId) return;
        const {
          data,
          error
        } = await supabase.rpc("create_invoice_from_booking", {
          _booking_id: bookingId
        });
        if (error) throw error;
        toast.success(t("label.saved", "Saved"));
        navigate({
          to: "/invoices/$id",
          params: {
            id: data
          }
        });
      } else {
        if (!mCustomer) return;
        const {
          data: userData
        } = await supabase.auth.getUser();
        const {
          data,
          error
        } = await supabase.from("invoices").insert({
          customer_id: mCustomer,
          currency: mCurrency,
          invoice_date: mDate,
          due_date: mDue,
          created_by: userData.user?.id ?? null
        }).select("id").single();
        if (error) throw error;
        toast.success(t("label.saved", "Saved"));
        navigate({
          to: "/invoices/$id",
          params: {
            id: data.id
          }
        });
      }
      setOpenNew(false);
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const total = list.data?.count ?? 0;
  const fmt = (n) => n.toLocaleString(void 0, {
    maximumFractionDigits: 0
  });
  const name = (c) => c ? lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("inv.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpenNew(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("inv.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: FileText, tone: "primary", label: t("inv.kpi.total"), value: metrics.data?.total ?? "—", active: status === "all", onClick: () => {
          setStatus("all");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Wallet, tone: "warning", label: t("inv.kpi.outstanding"), value: metrics.data ? fmt(metrics.data.outstanding) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: TriangleAlert, tone: "destructive", label: t("inv.kpi.overdue"), value: metrics.data?.overdue ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "success", label: t("inv.kpi.paid"), value: metrics.data?.paid ?? "—", active: status === "paid", onClick: () => {
          setStatus("paid");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: FilePen, tone: "muted", label: t("inv.kpi.draft"), value: metrics.data?.draft ?? "—", active: status === "draft", onClick: () => {
          setStatus("draft");
          setPage(1);
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t("filter.all"), tone: "primary", active: status === "all", onClick: () => {
          setStatus("all");
          setPage(1);
        } }),
        STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t(`invstatus.${s}`), tone: s === "paid" ? "success" : s === "cancelled" ? "destructive" : s === "partially_paid" ? "warning" : s === "draft" ? "muted" : "info", active: status === s, onClick: () => {
          setStatus(s);
          setPage(1);
        } }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: t("inv.number"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customer, onValueChange: (v) => {
          setCustomer(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("inv.customer") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: name(c) }, c.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => {
          setStatus(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`invstatus.${s}`) }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => {
          setFrom(e.target.value);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => {
          setTo(e.target.value);
          setPage(1);
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.customer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.due_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.total") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.paid") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.balance") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            list.data?.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/invoices/$id", params: {
                id: r.id
              }, className: "hover:underline", children: r.invoice_no }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.customer) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.invoice_date, lang) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.due_date, lang) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
                fmt(Number(r.total_amount)),
                " ",
                r.currency
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.paid_amount)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.total_amount) - Number(r.paid_amount)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InvStatusBadge, { status: r.status, t }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/invoices/$id", params: {
                id: r.id
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }) })
            ] }, r.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openNew, onOpenChange: setOpenNew, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("inv.new") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === "booking" ? "default" : "outline", size: "sm", onClick: () => setMode("booking"), children: t("inv.from_booking") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === "manual" ? "default" : "outline", size: "sm", onClick: () => setMode("manual"), children: t("inv.manual") })
        ] }),
        mode === "booking" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.select_booking") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bookingId, onValueChange: setBookingId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("inv.select_booking") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: bookings.data?.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id, children: [
              b.booking_no,
              " · ",
              name(b.customer),
              " · ",
              b.currency
            ] }, b.id)) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.customer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mCustomer, onValueChange: setMCustomer, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: name(c) }, c.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.currency") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mCurrency, onValueChange: setMCurrency, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: mDate, onChange: (e) => setMDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.due_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: mDue, onChange: (e) => setMDue(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenNew(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createInvoice, disabled: busy || (mode === "booking" ? !bookingId : !mCustomer), children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
export {
  InvStatusBadge,
  InvoicesList as component
};
