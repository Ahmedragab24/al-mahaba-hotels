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
import { Z as Plus, an as Settings2, z as CircleX, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const APPROVERS = ["super_admin", "admin", "finance_manager"];
const METHODS = ["cash", "bank_transfer", "cheque", "card", "online"];
const PYB_STATUSES = ["pending", "partially_paid", "paid", "cancelled"];
function PoStatusBadge({
  status,
  t
}) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive" : status === "draft" ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600" : status === "pending_approval" ? "bg-amber-500 text-white hover:bg-amber-500" : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: cls, children: t(`postatus.${status}`) });
}
function PayablesPage() {
  const {
    t,
    lang,
    dir
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole([...FINANCE_WRITE]);
  const canApprove = auth.hasAnyRole([...APPROVERS]);
  const fmt = (n) => n.toLocaleString(void 0, {
    maximumFractionDigits: 2
  });
  const name = (s) => s ? lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar : "—";
  const [busy, setBusy] = reactExports.useState(false);
  const suppliers = useQuery({
    queryKey: ["lookup-suppliers"],
    queryFn: async () => (await supabase.from("suppliers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await supabase.from("currencies").select("code").order("code")).data ?? []
  });
  const refresh = () => {
    qc.invalidateQueries({
      queryKey: ["payables"]
    });
    qc.invalidateQueries({
      queryKey: ["payables-aging"]
    });
    qc.invalidateQueries({
      queryKey: ["porders"]
    });
    qc.invalidateQueries({
      queryKey: ["porder-items"]
    });
    qc.invalidateQueries({
      queryKey: ["spayments"]
    });
    qc.invalidateQueries({
      queryKey: ["pyb-statement"]
    });
  };
  const [fSupplier, setFSupplier] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [page, setPage] = reactExports.useState(1);
  const payables = useQuery({
    queryKey: ["payables", {
      fSupplier,
      fStatus,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("supplier_payables").select("id,payable_no,status,currency,amount,paid_amount,due_date,booking_id,supplier:suppliers(name_en,name_ar),booking:bookings(booking_no)", {
        count: "exact"
      }).is("deleted_at", null);
      if (fSupplier !== "all") q = q.eq("supplier_id", fSupplier);
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
  const aging = useQuery({
    queryKey: ["payables-aging"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("supplier_payables").select("amount,paid_amount,exchange_rate,due_date,status").is("deleted_at", null).in("status", ["pending", "partially_paid"]);
      const buckets = {
        current: 0,
        d30: 0,
        d60: 0,
        d90: 0,
        over: 0
      };
      const today = /* @__PURE__ */ new Date();
      for (const r of data ?? []) {
        const bal = (Number(r.amount) - Number(r.paid_amount)) * Number(r.exchange_rate);
        if (!r.due_date) {
          buckets.current += bal;
          continue;
        }
        const days = Math.floor((today.getTime() - new Date(r.due_date).getTime()) / 864e5);
        if (days <= 0) buckets.current += bal;
        else if (days <= 30) buckets.d30 += bal;
        else if (days <= 60) buckets.d60 += bal;
        else if (days <= 90) buckets.d90 += bal;
        else buckets.over += bal;
      }
      return buckets;
    }
  });
  const [openGen, setOpenGen] = reactExports.useState(false);
  const [genBooking, setGenBooking] = reactExports.useState("");
  const bookings = useQuery({
    queryKey: ["lookup-confirmed-bookings"],
    enabled: openGen,
    queryFn: async () => (await supabase.from("bookings").select("id,booking_no,status,currency,customer:customers(name_en,name_ar)").in("status", ["confirmed", "checked_in", "checked_out"]).is("deleted_at", null).order("created_at", {
      ascending: false
    })).data ?? []
  });
  const generatePayables = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.rpc("create_payables_from_booking", {
        _booking_id: genBooking
      });
      if (error) throw error;
      toast.success(t("pyb.generated"));
      setOpenGen(false);
      setGenBooking("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const orders = useQuery({
    queryKey: ["porders"],
    queryFn: async () => (await supabase.from("payment_orders").select("id,order_no,status,currency,total_amount,rejection_reason,supplier_id,supplier:suppliers(name_en,name_ar),created_at").is("deleted_at", null).order("created_at", {
      ascending: false
    }).limit(100)).data ?? []
  });
  const [openNewOrder, setOpenNewOrder] = reactExports.useState(false);
  const [oSupplier, setOSupplier] = reactExports.useState("");
  const [oCurrency, setOCurrency] = reactExports.useState("SAR");
  const createOrder = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("payment_orders").insert({
        supplier_id: oSupplier,
        currency: oCurrency
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setOpenNewOrder(false);
      setOSupplier("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const [manageOrder, setManageOrder] = reactExports.useState(null);
  const orderItems = useQuery({
    queryKey: ["porder-items", manageOrder?.id],
    enabled: !!manageOrder,
    queryFn: async () => (await supabase.from("payment_order_items").select("id,amount,payable:supplier_payables(id,payable_no,amount,paid_amount)").eq("order_id", manageOrder.id).order("created_at")).data ?? []
  });
  const openPayables = useQuery({
    queryKey: ["porder-open-payables", manageOrder?.supplier_id, manageOrder?.currency],
    enabled: !!manageOrder,
    queryFn: async () => (await supabase.from("supplier_payables").select("id,payable_no,amount,paid_amount").eq("supplier_id", manageOrder.supplier_id).eq("currency", manageOrder.currency).in("status", ["pending", "partially_paid"]).is("deleted_at", null).order("created_at")).data ?? []
  });
  const [itemPayable, setItemPayable] = reactExports.useState("");
  const [itemAmount, setItemAmount] = reactExports.useState("");
  const addItem = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("payment_order_items").insert({
        order_id: manageOrder.id,
        payable_id: itemPayable,
        amount: Number(itemAmount)
      });
      if (error) throw error;
      setItemPayable("");
      setItemAmount("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const removeItem = async (id) => {
    try {
      const {
        error
      } = await supabase.from("payment_order_items").delete().eq("id", id);
      if (error) throw error;
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    }
  };
  const setOrderStatus = async (status, extra = {}) => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("payment_orders").update({
        status,
        ...extra
      }).eq("id", manageOrder.id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setManageOrder({
        ...manageOrder,
        status
      });
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const [openReject, setOpenReject] = reactExports.useState(false);
  const [openPay, setOpenPay] = reactExports.useState(false);
  const [pAmount, setPAmount] = reactExports.useState("");
  const [pMethod, setPMethod] = reactExports.useState("bank_transfer");
  const [pRef, setPRef] = reactExports.useState("");
  const [pDate, setPDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const recordPayment = async () => {
    setBusy(true);
    try {
      const amount = Number(pAmount);
      const {
        data: pay,
        error
      } = await supabase.from("supplier_payments").insert({
        payment_order_id: manageOrder.id,
        supplier_id: manageOrder.supplier_id,
        payment_date: pDate,
        payment_method: pMethod,
        reference_no: pRef || null,
        currency: manageOrder.currency,
        amount
      }).select("id").single();
      if (error) throw error;
      let remaining = amount;
      const items = orderItems.data ?? [];
      for (const it of items) {
        if (remaining <= 0) break;
        if (!it.payable) continue;
        const balance = Number(it.payable.amount) - Number(it.payable.paid_amount);
        const alloc = Math.min(remaining, Number(it.amount), balance);
        if (alloc <= 0) continue;
        const {
          error: ae
        } = await supabase.from("payment_allocations").insert({
          payment_id: pay.id,
          payable_id: it.payable.id,
          amount: alloc
        });
        if (ae) throw ae;
        remaining -= alloc;
      }
      toast.success(t("label.saved", "Saved"));
      setOpenPay(false);
      setPAmount("");
      setPRef("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const payments = useQuery({
    queryKey: ["spayments"],
    queryFn: async () => (await supabase.from("supplier_payments").select("id,payment_no,status,payment_date,payment_method,reference_no,currency,amount,supplier:suppliers(name_en,name_ar),order:payment_orders(order_no)").order("created_at", {
      ascending: false
    }).limit(100)).data ?? []
  });
  const [cancelPay, setCancelPay] = reactExports.useState(null);
  const [cancelPayReason, setCancelPayReason] = reactExports.useState("");
  const doCancelPayment = async () => {
    setBusy(true);
    try {
      const {
        error: de
      } = await supabase.from("payment_allocations").delete().eq("payment_id", cancelPay.id);
      if (de) throw de;
      const {
        error
      } = await supabase.from("supplier_payments").update({
        status: "cancelled",
        cancellation_reason: cancelPayReason
      }).eq("id", cancelPay.id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setCancelPay(null);
      setCancelPayReason("");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const [stSupplier, setStSupplier] = reactExports.useState("");
  const statement = useQuery({
    queryKey: ["pyb-statement", stSupplier],
    enabled: !!stSupplier,
    queryFn: async () => {
      const [pyb, pays] = await Promise.all([supabase.from("supplier_payables").select("payable_no,amount,exchange_rate,currency,created_at,status").eq("supplier_id", stSupplier).is("deleted_at", null).neq("status", "cancelled"), supabase.from("supplier_payments").select("payment_no,amount,exchange_rate,currency,payment_date,created_at,status").eq("supplier_id", stSupplier).eq("status", "confirmed")]);
      const rows = [];
      for (const r of pyb.data ?? []) rows.push({
        date: r.created_at,
        ref: r.payable_no ?? "—",
        type: "debit",
        amount: Number(r.amount) * Number(r.exchange_rate)
      });
      for (const r of pays.data ?? []) rows.push({
        date: r.created_at,
        ref: r.payment_no ?? "—",
        type: "credit",
        amount: Number(r.amount) * Number(r.exchange_rate)
      });
      rows.sort((a, b) => a.date.localeCompare(b.date));
      let bal = 0;
      return rows.map((r) => ({
        ...r,
        balance: bal += r.type === "debit" ? r.amount : -r.amount
      }));
    }
  });
  const total = payables.data?.count ?? 0;
  const orderRemaining = manageOrder ? Number(manageOrder.total_amount) - (payments.data ?? []).filter((p) => p.order?.order_no === manageOrder.order_no && p.status === "confirmed").reduce((a, p) => a + Number(p.amount), 0) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("pyb.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpenGen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("pyb.from_booking")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "payables", dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "payables", children: t("pyb.payables") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "orders", children: t("pyb.orders") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "payments", children: t("pyb.payments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "statement", children: t("pyb.statement") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "payables", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", children: [[t("rpt.aging_current", "Current"), aging.data?.current], ["1–30", aging.data?.d30], ["31–60", aging.data?.d60], ["61–90", aging.data?.d90], ["+90", aging.data?.over]].map(([label, val], i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            t("pyb.aging"),
            " · ",
            label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: "text-xl font-bold tabular-nums", children: val === void 0 ? "—" : fmt(val) })
        ] }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fSupplier, onValueChange: (v) => {
            setFSupplier(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("pyb.supplier") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
              suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: name(s) }, s.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: (v) => {
            setFStatus(v);
            setPage(1);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
              PYB_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`pybstatus.${s}`) }, s))
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 overflow-x-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("pyb.number") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("pyb.supplier") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.number", "Booking") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("pyb.amount") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("pyb.paid") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("pyb.balance") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("pyb.due") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
              payables.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
              !payables.isLoading && (payables.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
              payables.data?.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.payable_no }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.supplier) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.booking?.booking_no ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
                  fmt(Number(r.amount)),
                  " ",
                  r.currency
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.paid_amount)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: fmt(Number(r.amount) - Number(r.paid_amount)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.due_date ? formatDate(r.due_date, lang) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "cancelled" ? "destructive" : r.status === "pending" ? "outline" : "default", className: r.status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0, children: t(`pybstatus.${r.status}`) }) })
              ] }, r.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "orders", className: "space-y-4", children: [
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpenNewOrder(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " ",
          t("po.new")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("po.number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("pyb.supplier") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("po.total") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            !orders.isLoading && (orders.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            orders.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.order_no }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.supplier) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
                fmt(Number(r.total_amount)),
                " ",
                r.currency
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PoStatusBadge, { status: r.status, t }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.edit", "Manage"), onClick: () => setManageOrder(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4" }) }) })
            ] }, r.id))
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "payments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("spy.number") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("po.number") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("pyb.supplier") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("spy.date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.method") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          !payments.isLoading && (payments.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
          payments.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.payment_no }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.order?.order_no ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.supplier) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.payment_date, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`pm.${r.payment_method}`) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: [
              fmt(Number(r.amount)),
              " ",
              r.currency
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "cancelled" ? "destructive" : "default", children: t(`spystatus.${r.status}`) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && r.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("spy.cancel"), onClick: () => setCancelPay(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-destructive" }) }) })
          ] }, r.id))
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "statement", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("pyb.supplier") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stSupplier, onValueChange: setStSupplier, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("pyb.supplier") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: name(s) }, s.id)) })
          ] })
        ] }) }) }),
        stSupplier && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.date", "Date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code", "Reference") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.debit") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.credit") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("pyb.balance") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            (statement.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            statement.data?.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(r.date, lang) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.ref }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: r.type === "debit" ? fmt(r.amount) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-end text-xs tabular-nums", children: r.type === "credit" ? fmt(r.amount) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { dir: "ltr", className: "text-end text-xs font-semibold tabular-nums", children: [
                fmt(r.balance),
                " SAR"
              ] })
            ] }, i))
          ] })
        ] }) }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openGen, onOpenChange: setOpenGen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("pyb.from_booking") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.select_booking") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: genBooking, onValueChange: setGenBooking, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("inv.select_booking") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: bookings.data?.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.id, children: [
            b.booking_no,
            " · ",
            name(b.customer),
            " · ",
            b.currency
          ] }, b.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenGen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: generatePayables, disabled: busy || !genBooking, children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openNewOrder, onOpenChange: setOpenNewOrder, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("po.new") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("pyb.supplier") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: oSupplier, onValueChange: setOSupplier, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: name(s) }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: oCurrency, onValueChange: setOCurrency, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenNewOrder(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createOrder, disabled: busy || !oSupplier, children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!manageOrder, onOpenChange: (o) => !o && setManageOrder(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3", children: [
        manageOrder?.order_no,
        " ",
        manageOrder && /* @__PURE__ */ jsxRuntimeExports.jsx(PoStatusBadge, { status: manageOrder.status, t })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          name(manageOrder?.supplier),
          " · ",
          t("po.total"),
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { dir: "ltr", className: "font-semibold tabular-nums", children: [
            manageOrder ? fmt(Number(manageOrder.total_amount)) : "",
            " ",
            manageOrder?.currency
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("po.items") }),
          (orderItems.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border px-3 py-2 text-xs text-muted-foreground", children: t("label.no_results") }),
          orderItems.data?.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded border px-3 py-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: it.payable?.payable_no }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "tabular-nums", children: fmt(Number(it.amount)) }),
              manageOrder?.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => removeItem(it.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 text-destructive" }) })
            ] })
          ] }, it.id))
        ] }),
        manageOrder?.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 items-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("po.add_payable") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: itemPayable, onValueChange: setItemPayable, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: openPayables.data?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                p.payable_no,
                " · ",
                fmt(Number(p.amount) - Number(p.paid_amount))
              ] }, p.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.amount") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: itemAmount, onChange: (e) => setItemAmount(e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", onClick: addItem, disabled: busy || !itemPayable || !Number(itemAmount), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
            ] })
          ] })
        ] }),
        manageOrder?.rejection_reason && manageOrder?.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border border-destructive/50 px-3 py-2 text-xs text-destructive", children: manageOrder.rejection_reason })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-wrap gap-2", children: [
        manageOrder?.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOrderStatus("pending_approval"), disabled: busy || (orderItems.data?.length ?? 0) === 0, children: t("po.submit") }),
        manageOrder?.status === "pending_approval" && canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setOrderStatus("approved"), disabled: busy, children: t("po.approve") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => setOpenReject(true), disabled: busy, children: t("po.reject") })
        ] }),
        manageOrder?.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOrderStatus("draft"), disabled: busy, children: t("actions.edit", "Reopen") }),
        manageOrder?.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          setPAmount(String(Math.max(orderRemaining, 0) || manageOrder.total_amount));
          setOpenPay(true);
        }, disabled: busy, children: t("po.record_payment") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setManageOrder(null), children: t("actions.close", "Close") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openReject, onOpenChange: setOpenReject, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("po.reject") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("po.rejection_reason") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: rejectReason, onChange: (e) => setRejectReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenReject(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy || !rejectReason.trim(), onClick: async () => {
          await setOrderStatus("rejected", {
            rejection_reason: rejectReason
          });
          setOpenReject(false);
          setRejectReason("");
        }, children: t("po.reject") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openPay, onOpenChange: setOpenPay, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("po.record_payment"),
        " · ",
        manageOrder?.order_no
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("spy.date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: pDate, onChange: (e) => setPDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.method") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: pMethod, onValueChange: setPMethod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: t(`pm.${m}`) }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: pAmount, onChange: (e) => setPAmount(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.reference") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: pRef, onChange: (e) => setPRef(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpenPay(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: recordPayment, disabled: busy || !Number(pAmount), children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!cancelPay, onOpenChange: (o) => !o && setCancelPay(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("spy.cancel"),
        " · ",
        cancelPay?.payment_no
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rct.reason") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: cancelPayReason, onChange: (e) => setCancelPayReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCancelPay(null), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: doCancelPayment, disabled: busy || !cancelPayReason.trim(), children: t("spy.cancel") })
      ] })
    ] }) })
  ] });
}
export {
  PayablesPage as component
};
