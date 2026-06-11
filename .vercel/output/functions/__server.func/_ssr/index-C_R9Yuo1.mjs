import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-uBlCHUHs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, af as Coins, z as CircleX, V as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
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
const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"];
const ADJ_WRITE = ["super_admin", "admin", "finance_manager"];
const METHODS = ["cash", "bank_transfer", "cheque", "card", "online"];
function ReceiptsPage() {
  const {
    t,
    lang,
    dir
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole([...FINANCE_WRITE]);
  const canAdjust = auth.hasAnyRole([...ADJ_WRITE]);
  const fmt = (n) => n.toLocaleString(void 0, {
    maximumFractionDigits: 2
  });
  const name = (c) => c ? lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar : "—";
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await supabase.from("currencies").select("code").order("code")).data ?? []
  });
  const [fCustomer, setFCustomer] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(1);
  const list = useQuery({
    queryKey: ["receipts", {
      fCustomer,
      fStatus,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("receipts").select("id,receipt_no,status,receipt_date,payment_method,reference_no,currency,amount,allocated_amount,customer_id,customer:customers(name_en,name_ar)", {
        count: "exact"
      }).is("deleted_at", null);
      if (fCustomer !== "all") q = q.eq("customer_id", fCustomer);
      if (fStatus !== "all") q = q.eq("status", fStatus);
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
  const refresh = () => {
    qc.invalidateQueries({
      queryKey: ["receipts"]
    });
    qc.invalidateQueries({
      queryKey: ["rct-balances"]
    });
    qc.invalidateQueries({
      queryKey: ["rct-allocs"]
    });
    qc.invalidateQueries({
      queryKey: ["invoices"]
    });
  };
  const [openNew, setOpenNew] = reactExports.useState(false);
  const [nCustomer, setNCustomer] = reactExports.useState("");
  const [nDate, setNDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [nMethod, setNMethod] = reactExports.useState("bank_transfer");
  const [nRef, setNRef] = reactExports.useState("");
  const [nCurrency, setNCurrency] = reactExports.useState("SAR");
  const [nRate, setNRate] = reactExports.useState("1");
  const [nAmount, setNAmount] = reactExports.useState("");
  const [nNotes, setNNotes] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const createReceipt = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("receipts").insert({
        customer_id: nCustomer,
        receipt_date: nDate,
        payment_method: nMethod,
        reference_no: nRef || null,
        currency: nCurrency,
        exchange_rate: Number(nRate) || 1,
        amount: Number(nAmount),
        notes: nNotes || null
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setOpenNew(false);
      setNCustomer("");
      setNAmount("");
      setNRef("");
      setNNotes("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const [allocFor, setAllocFor] = reactExports.useState(null);
  const [allocInvoice, setAllocInvoice] = reactExports.useState("");
  const [allocAmount, setAllocAmount] = reactExports.useState("");
  const openInvoices = useQuery({
    queryKey: ["rct-open-invoices", allocFor?.customer_id, allocFor?.currency],
    enabled: !!allocFor,
    queryFn: async () => (await supabase.from("invoices").select("id,invoice_no,total_amount,paid_amount,currency,status").eq("customer_id", allocFor.customer_id).eq("currency", allocFor.currency).in("status", ["issued", "sent", "partially_paid"]).is("deleted_at", null).order("invoice_date")).data ?? []
  });
  const allocations = useQuery({
    queryKey: ["rct-allocs", allocFor?.id],
    enabled: !!allocFor,
    queryFn: async () => (await supabase.from("receipt_allocations").select("id,amount,invoice:invoices(invoice_no)").eq("receipt_id", allocFor.id).order("created_at")).data ?? []
  });
  const addAllocation = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("receipt_allocations").insert({
        receipt_id: allocFor.id,
        invoice_id: allocInvoice,
        amount: Number(allocAmount)
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setAllocInvoice("");
      setAllocAmount("");
      qc.invalidateQueries({
        queryKey: ["rct-allocs"]
      });
      qc.invalidateQueries({
        queryKey: ["rct-open-invoices"]
      });
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const removeAllocation = async (id) => {
    try {
      const {
        error
      } = await supabase.from("receipt_allocations").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({
        queryKey: ["rct-allocs"]
      });
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    }
  };
  const [cancelFor, setCancelFor] = reactExports.useState(null);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const cancelReceipt = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("receipts").update({
        status: "cancelled",
        cancellation_reason: cancelReason
      }).eq("id", cancelFor.id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setCancelFor(null);
      setCancelReason("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const balances = useQuery({
    queryKey: ["rct-balances"],
    queryFn: async () => {
      const [inv, rct, adj] = await Promise.all([supabase.from("invoices").select("customer_id,total_amount,exchange_rate,status").is("deleted_at", null), supabase.from("receipts").select("customer_id,amount,exchange_rate,status").is("deleted_at", null), supabase.from("customer_adjustments").select("customer_id,amount,exchange_rate,adjustment_type")]);
      const map = {};
      const get = (id) => map[id] ??= {
        invoiced: 0,
        received: 0,
        adj: 0
      };
      for (const r of inv.data ?? []) if (!["draft", "cancelled"].includes(r.status)) get(r.customer_id).invoiced += Number(r.total_amount) * Number(r.exchange_rate);
      for (const r of rct.data ?? []) if (r.status === "confirmed") get(r.customer_id).received += Number(r.amount) * Number(r.exchange_rate);
      for (const r of adj.data ?? []) get(r.customer_id).adj += (r.adjustment_type === "credit" ? 1 : -1) * Number(r.amount) * Number(r.exchange_rate);
      return map;
    }
  });
  const adjList = useQuery({
    queryKey: ["rct-adjustments"],
    queryFn: async () => (await supabase.from("customer_adjustments").select("id,adjustment_no,adjustment_type,amount,currency,reason,created_at,customer:customers(name_en,name_ar),invoice:invoices(invoice_no)").order("created_at", {
      ascending: false
    }).limit(100)).data ?? []
  });
  const [openAdj, setOpenAdj] = reactExports.useState(false);
  const [aCustomer, setACustomer] = reactExports.useState("");
  const [aType, setAType] = reactExports.useState("credit");
  const [aAmount, setAAmount] = reactExports.useState("");
  const [aCurrency, setACurrency] = reactExports.useState("SAR");
  const [aReason, setAReason] = reactExports.useState("");
  const createAdjustment = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("customer_adjustments").insert({
        customer_id: aCustomer,
        adjustment_type: aType,
        amount: Number(aAmount),
        currency: aCurrency,
        reason: aReason
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setOpenAdj(false);
      setACustomer("");
      setAAmount("");
      setAReason("");
      qc.invalidateQueries({
        queryKey: ["rct-adjustments"]
      });
      qc.invalidateQueries({
        queryKey: ["rct-balances"]
      });
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const total = list.data?.count ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rct.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpenNew(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("rct.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "receipts", dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "receipts", children: t("rct.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "balances", children: t("rct.balances") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "adjustments", children: t("rct.adjustments") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "receipts", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fCustomer, onValueChange: (v) => {
            setFCustomer(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("inv.customer") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
              customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: name(c) }, c.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: (v) => {
            setFStatus(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confirmed", children: t("rctstatus.confirmed") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: t("rctstatus.cancelled") })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 overflow-x-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.number") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.customer") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.date") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.method") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.amount") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.allocated") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.unallocated") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
              !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
              list.data?.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.receipt_no }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.customer) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.receipt_date, lang) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`pm.${r.payment_method}`) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
                  fmt(Number(r.amount)),
                  " ",
                  r.currency
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.allocated_amount)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.amount) - Number(r.allocated_amount)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "cancelled" ? "destructive" : "default", children: t(`rctstatus.${r.status}`) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && r.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("rct.allocate"), onClick: () => setAllocFor(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("rct.cancel"), onClick: () => setCancelFor(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive" }) })
                ] }) })
              ] }, r.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "balances", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.customer") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.invoiced") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.received") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.adjustments") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.balance") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          customers.data?.filter((c) => balances.data?.[c.id]).map((c) => {
            const b = balances.data[c.id];
            const bal = b.invoiced - b.received - b.adj;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(c) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(b.invoiced) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(b.received) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(b.adj) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: `text-end text-xs font-semibold tabular-nums ${bal > 0 ? "text-destructive" : ""}`, children: [
                fmt(bal),
                " SAR"
              ] })
            ] }, c.id);
          }),
          !balances.isLoading && Object.keys(balances.data ?? {}).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) })
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "adjustments", className: "space-y-4", children: [
        canAdjust && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpenAdj(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " ",
          t("rct.adj_new")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code", "No.") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.customer") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.adj_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.amount") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.reason") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.number") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            adjList.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.adjustment_no }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.customer) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.adjustment_type === "credit" ? "default" : "outline", children: t(`rct.${r.adjustment_type}`) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
                fmt(Number(r.amount)),
                " ",
                r.currency
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[280px] truncate text-xs", children: r.reason }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.invoice?.invoice_no ?? "—" })
            ] }, r.id)),
            !adjList.isLoading && (adjList.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) })
          ] })
        ] }) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openNew, onOpenChange: setOpenNew, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rct.new") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.customer") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: nCustomer, onValueChange: setNCustomer, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: name(c) }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: nDate, onChange: (e) => setNDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.method") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: nMethod, onValueChange: setNMethod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: t(`pm.${m}`) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: nCurrency, onValueChange: setNCurrency, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rates.exchange_rate", "Exchange Rate") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.000001", value: nRate, onChange: (e) => setNRate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: nAmount, onChange: (e) => setNAmount(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.reference") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nRef, onChange: (e) => setNRef(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.notes", "Notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: nNotes, onChange: (e) => setNNotes(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenNew(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createReceipt, disabled: busy || !nCustomer || !Number(nAmount), children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!allocFor, onOpenChange: (o) => !o && setAllocFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("rct.allocate"),
        " · ",
        allocFor?.receipt_no
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          t("rct.unallocated"),
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { dir: "ltr", className: "font-semibold tabular-nums", children: [
            allocFor ? fmt(Number(allocFor.amount) - Number(allocFor.allocated_amount)) : "",
            " ",
            allocFor?.currency
          ] })
        ] }),
        (allocations.data?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.allocations") }),
          allocations.data.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border px-3 py-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: a.invoice?.invoice_no }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "tabular-nums", children: fmt(Number(a.amount)) }),
              canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => removeAllocation(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
            ] })
          ] }, a.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: allocInvoice, onValueChange: setAllocInvoice, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: openInvoices.data?.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: i.id, children: [
                i.invoice_no,
                " · ",
                fmt(Number(i.total_amount) - Number(i.paid_amount)),
                " ",
                i.currency
              ] }, i.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.amount") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: allocAmount, onChange: (e) => setAllocAmount(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAllocFor(null), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addAllocation, disabled: busy || !allocInvoice || !Number(allocAmount), children: t("rct.allocate") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!cancelFor, onOpenChange: (o) => !o && setCancelFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("rct.cancel"),
        " · ",
        cancelFor?.receipt_no
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.reason") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: cancelReason, onChange: (e) => setCancelReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCancelFor(null), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: cancelReceipt, disabled: busy || !cancelReason.trim(), children: t("rct.cancel") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openAdj, onOpenChange: setOpenAdj, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rct.adj_new") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.customer") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aCustomer, onValueChange: setACustomer, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: name(c) }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.adj_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aType, onValueChange: setAType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "credit", children: t("rct.credit") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "debit", children: t("rct.debit") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aCurrency, onValueChange: setACurrency, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: aAmount, onChange: (e) => setAAmount(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.reason") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: aReason, onChange: (e) => setAReason(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenAdj(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createAdjustment, disabled: busy || !aCustomer || !Number(aAmount) || !aReason.trim(), children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
export {
  ReceiptsPage as component
};
