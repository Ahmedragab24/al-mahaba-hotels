// Supplier payables, payment orders, payments, statements & aging — Section 16 (BR-PAY)
import { useState } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataPagination } from "@/components/data-pagination";
import { Plus, Settings2, XCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"] as const;
const APPROVERS = ["super_admin", "admin", "finance_manager"] as const;
const METHODS = ["cash", "bank_transfer", "cheque", "card", "online"] as const;
const PYB_STATUSES = ["pending", "partially_paid", "paid", "cancelled"] as const;

function PoStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive" : status === "draft" ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600"
    : status === "pending_approval" ? "bg-amber-500 text-white hover:bg-amber-500" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`postatus.${status}`)}</Badge>;
}

export default function PayablesPage() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const canWrite = hasAnyRole(auth, [...FINANCE_WRITE]);
  const canApprove = hasAnyRole(auth, [...APPROVERS]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const name = (s: any) => (s ? (lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar) : "—");
  const [busy, setBusy] = useState(false);

  const suppliers = useQuery({
    queryKey: ["lookup-suppliers"],
    queryFn: async () => (await apiClient.suppliers.getAll()) ?? [],
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await apiClient.currencies.getAll()) ?? [],
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["payables"] });
    qc.invalidateQueries({ queryKey: ["payables-aging"] });
    qc.invalidateQueries({ queryKey: ["porders"] });
    qc.invalidateQueries({ queryKey: ["porder-items"] });
    qc.invalidateQueries({ queryKey: ["spayments"] });
    qc.invalidateQueries({ queryKey: ["pyb-statement"] });
  };

  // ================= PAYABLES =================
  const [fSupplier, setFSupplier] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [page, setPage] = useState(1);

  const payables = useQuery({
    queryKey: ["payables", { fSupplier, fStatus, page }],
    queryFn: async () => {
      let q = db.from("supplier_payables").select(
        "id,payable_no,status,currency,amount,paid_amount,due_date,booking_id,supplier:suppliers(name_en,name_ar),booking:bookings(booking_no)",
        { count: "exact" },
      ).is("deleted_at", null);
      if (fSupplier !== "all") q = q.eq("supplier_id", fSupplier);
      if (fStatus !== "all") q = q.eq("status", fStatus);
      const f = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const aging = useQuery({
    queryKey: ["payables-aging"],
    queryFn: async () => {
      const { data } = await db.from("supplier_payables")
        .select("amount,paid_amount,exchange_rate,due_date,status").is("deleted_at", null)
        .in("status", ["pending", "partially_paid"]);
      const buckets = { current: 0, d30: 0, d60: 0, d90: 0, over: 0 };
      const today = new Date();
      for (const r of data ?? []) {
        const bal = (Number(r.amount) - Number(r.paid_amount)) * Number(r.exchange_rate);
        if (!r.due_date) { buckets.current += bal; continue; }
        const days = Math.floor((today.getTime() - new Date(r.due_date).getTime()) / 86400000);
        if (days <= 0) buckets.current += bal;
        else if (days <= 30) buckets.d30 += bal;
        else if (days <= 60) buckets.d60 += bal;
        else if (days <= 90) buckets.d90 += bal;
        else buckets.over += bal;
      }
      return buckets;
    },
  });

  // generate from booking
  const [openGen, setOpenGen] = useState(false);
  const [genBooking, setGenBooking] = useState("");
  const bookings = useQuery({
    queryKey: ["lookup-confirmed-bookings"],
    enabled: openGen,
    queryFn: async () =>
      (await db.from("bookings")
        .select("id,booking_no,status,currency,customer:customers(name_en,name_ar)")
        .in("status", ["confirmed", "checked_in", "checked_out"])
        .is("deleted_at", null).order("created_at", { ascending: false })).data ?? [],
  });
  const generatePayables = async () => {
    setBusy(true);
    try {
      const { error } = await apiClient.rpc("create_payables_from_booking", { booking_id: genBooking });
      if (error) throw error;
      toast.success(t("pyb.generated"));
      setOpenGen(false); setGenBooking("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // ================= PAYMENT ORDERS =================
  const orders = useQuery({
    queryKey: ["porders"],
    queryFn: async () =>
      (await db.from("payment_orders")
        .select("id,order_no,status,currency,total_amount,rejection_reason,supplier_id,supplier:suppliers(name_en,name_ar),created_at")
        .is("deleted_at", null).order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  const [openNewOrder, setOpenNewOrder] = useState(false);
  const [oSupplier, setOSupplier] = useState("");
  const [oCurrency, setOCurrency] = useState("SAR");
  const createOrder = async () => {
    setBusy(true);
    try {
      await apiClient.paymentOrders.create({ supplier_id: oSupplier, currency: oCurrency });
      toast.success(t("label.saved", "Saved"));
      setOpenNewOrder(false); setOSupplier("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // manage order
  const [manageOrder, setManageOrder] = useState<any | null>(null);
  const orderItems = useQuery({
    queryKey: ["porder-items", manageOrder?.id],
    enabled: !!manageOrder,
    queryFn: async () =>
      (await db.from("payment_order_items")
        .select("id,amount,payable:supplier_payables(id,payable_no,amount,paid_amount)")
        .eq("order_id", manageOrder.id).order("created_at")).data ?? [],
  });
  const openPayables = useQuery({
    queryKey: ["porder-open-payables", manageOrder?.supplier_id, manageOrder?.currency],
    enabled: !!manageOrder,
    queryFn: async () =>
      (await db.from("supplier_payables")
        .select("id,payable_no,amount,paid_amount")
        .eq("supplier_id", manageOrder.supplier_id).eq("currency", manageOrder.currency)
        .in("status", ["pending", "partially_paid"]).is("deleted_at", null)
        .order("created_at")).data ?? [],
  });
  const [itemPayable, setItemPayable] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const addItem = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("payment_order_items").insert({
        order_id: manageOrder.id, payable_id: itemPayable, amount: Number(itemAmount),
      });
      if (error) throw error;
      setItemPayable(""); setItemAmount("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };
  const removeItem = async (id: string) => {
    try {
      await apiClient.paymentOrderItems.delete(id);
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); }
  };
  const setOrderStatus = async (status: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      await apiClient.paymentOrders.update(manageOrder.id, { status, ...extra });
      toast.success(t("label.saved", "Saved"));
      setManageOrder({ ...manageOrder, status });
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };
  const [rejectReason, setRejectReason] = useState("");
  const [openReject, setOpenReject] = useState(false);

  // record payment
  const [openPay, setOpenPay] = useState(false);
  const [pAmount, setPAmount] = useState("");
  const [pMethod, setPMethod] = useState("bank_transfer");
  const [pRef, setPRef] = useState("");
  const [pDate, setPDate] = useState(new Date().toISOString().slice(0, 10));
  const recordPayment = async () => {
    setBusy(true);
    try {
      const amount = Number(pAmount);
      const data = await apiClient.supplierPayments.create({
        payment_order_id: manageOrder.id, supplier_id: manageOrder.supplier_id,
        payment_date: pDate, payment_method: pMethod, reference_no: pRef || null,
        currency: manageOrder.currency, amount,
      });
      // allocate across order items (in order) up to the payment amount
      let remaining = amount;
      const items = orderItems.data ?? [];
      for (const it of items as any[]) {
        if (remaining <= 0) break;
        if (!it.payable) continue;
        const balance = Number(it.payable.amount) - Number(it.payable.paid_amount);
        const alloc = Math.min(remaining, Number(it.amount), balance);
        if (alloc <= 0) continue;
        const { error: ae } = await apiClient.paymentAllocations.create({
          payment_id: data.id, payable_id: it.payable.id, amount: alloc,
        });
        if (ae) throw ae;
        remaining -= alloc;
      }
      toast.success(t("label.saved", "Saved"));
      setOpenPay(false); setPAmount(""); setPRef("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // ================= PAYMENTS =================
  const payments = useQuery({
    queryKey: ["spayments"],
    queryFn: async () =>
      (await db.from("supplier_payments")
        .select("id,payment_no,status,payment_date,payment_method,reference_no,currency,amount,supplier:suppliers(name_en,name_ar),order:payment_orders(order_no)")
        .order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  const [cancelPay, setCancelPay] = useState<any | null>(null);
  const [cancelPayReason, setCancelPayReason] = useState("");
  const doCancelPayment = async () => {
    setBusy(true);
    try {
      const { error: de } = await db.from("payment_allocations").delete().eq("payment_id", cancelPay.id);
      if (de) throw de;
      const { error } = await db.from("supplier_payments")
        .update({ status: "cancelled", cancellation_reason: cancelPayReason }).eq("id", cancelPay.id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setCancelPay(null); setCancelPayReason("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // ================= STATEMENT =================
  const [stSupplier, setStSupplier] = useState("");
  const statement = useQuery({
    queryKey: ["pyb-statement", stSupplier],
    enabled: !!stSupplier,
    queryFn: async () => {
      const [pyb, pays] = await Promise.all([
        db.from("supplier_payables")
          .select("payable_no,amount,exchange_rate,currency,created_at,status")
          .eq("supplier_id", stSupplier).is("deleted_at", null).neq("status", "cancelled"),
        db.from("supplier_payments")
          .select("payment_no,amount,exchange_rate,currency,payment_date,created_at,status")
          .eq("supplier_id", stSupplier).eq("status", "confirmed"),
      ]);
      const rows: { date: string; ref: string; type: "debit" | "credit"; amount: number }[] = [];
      for (const r of pyb.data ?? []) rows.push({ date: r.created_at, ref: r.payable_no ?? "—", type: "debit", amount: Number(r.amount) * Number(r.exchange_rate) });
      for (const r of pays.data ?? []) rows.push({ date: r.created_at, ref: r.payment_no ?? "—", type: "credit", amount: Number(r.amount) * Number(r.exchange_rate) });
      rows.sort((a, b) => a.date.localeCompare(b.date));
      let bal = 0;
      return rows.map((r) => ({ ...r, balance: (bal += r.type === "debit" ? r.amount : -r.amount) }));
    },
  });

  const total = payables.data?.count ?? 0;
  const orderRemaining = manageOrder
    ? Number(manageOrder.total_amount) - (payments.data ?? [])
        .filter((p: any) => p.order?.order_no === manageOrder.order_no && p.status === "confirmed")
        .reduce((a: number, p: any) => a + Number(p.amount), 0)
    : 0;

  return (
    <>
      <PageHeader title={t("pyb.title")} subtitle={`${total} ${t("label.total")}`}
        actions={canWrite && <Button size="sm" onClick={() => setOpenGen(true)}><Plus className="h-4 w-4" /> {t("pyb.from_booking")}</Button>} />
      <div className="space-y-4 p-6">
        <Tabs defaultValue="payables" dir={dir}>
          <TabsList>
            <TabsTrigger value="payables">{t("pyb.payables")}</TabsTrigger>
            <TabsTrigger value="orders">{t("pyb.orders")}</TabsTrigger>
            <TabsTrigger value="payments">{t("pyb.payments")}</TabsTrigger>
            <TabsTrigger value="statement">{t("pyb.statement")}</TabsTrigger>
          </TabsList>

          {/* ---------- PAYABLES ---------- */}
          <TabsContent value="payables" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                [t("rpt.aging_current", "Current"), aging.data?.current],
                ["1–30", aging.data?.d30],
                ["31–60", aging.data?.d60],
                ["61–90", aging.data?.d90],
                ["+90", aging.data?.over],
              ].map(([label, val], i) => (
                <Card key={i}><CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">{t("pyb.aging")} · {label as string}</div>
                  <div dir="ltr" className="text-xl font-bold tabular-nums">{val === undefined ? "—" : fmt(val as number)}</div>
                </CardContent></Card>
              ))}
            </div>
            <Card>
              <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                <Select value={fSupplier} onValueChange={(v) => { setFSupplier(v); setPage(1); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("pyb.supplier")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filter.all")}</SelectItem>
                    {(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray(suppliers.data?.data) ? suppliers.data.data : [])?.map((s: any) => <SelectItem key={s.id} value={s.id}>{name(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fStatus} onValueChange={(v) => { setFStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filter.all")}</SelectItem>
                    {PYB_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`pybstatus.${s}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("pyb.number")}</TableHead>
                      <TableHead>{t("pyb.supplier")}</TableHead>
                      <TableHead>{t("bk.number", "Booking")}</TableHead>
                      <TableHead className="text-end">{t("pyb.amount")}</TableHead>
                      <TableHead className="text-end">{t("pyb.paid")}</TableHead>
                      <TableHead className="text-end">{t("pyb.balance")}</TableHead>
                      <TableHead>{t("pyb.due")}</TableHead>
                      <TableHead>{t("label.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.isLoading && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                    {!payables.isLoading && (payables.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                    {payables.data?.rows.map((r: any) => (
                      <TableRow key={r.id} className="whitespace-nowrap">
                        <TableCell className="font-mono text-xs">{r.payable_no}</TableCell>
                        <TableCell className="text-sm">{name(r.supplier)}</TableCell>
                        <TableCell className="font-mono text-xs">{r.booking?.booking_no ?? "—"}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount))} {r.currency}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.paid_amount))}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount) - Number(r.paid_amount))}</TableCell>
                        <TableCell dir="ltr" className="text-xs">{r.due_date ? formatDate(r.due_date, lang) : "—"}</TableCell>
                        <TableCell><Badge variant={r.status === "cancelled" ? "destructive" : r.status === "pending" ? "outline" : "default"}
                          className={r.status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}>{t(`pybstatus.${r.status}`)}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- ORDERS ---------- */}
          <TabsContent value="orders" className="space-y-4">
            {canWrite && (
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setOpenNewOrder(true)}><Plus className="h-4 w-4" /> {t("po.new")}</Button>
              </div>
            )}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("po.number")}</TableHead>
                      <TableHead>{t("pyb.supplier")}</TableHead>
                      <TableHead className="text-end">{t("po.total")}</TableHead>
                      <TableHead>{t("label.status")}</TableHead>
                      <TableHead className="text-end">{t("label.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!orders.isLoading && (orders.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                    {(Array.isArray(orders.data) ? orders.data : Array.isArray(orders.data?.data) ? orders.data.data : [])?.map((r: any) => (
                      <TableRow key={r.id} className="whitespace-nowrap">
                        <TableCell className="font-mono text-xs">{r.order_no}</TableCell>
                        <TableCell className="text-sm">{name(r.supplier)}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.total_amount))} {r.currency}</TableCell>
                        <TableCell><PoStatusBadge status={r.status} t={t} /></TableCell>
                        <TableCell className="text-end">
                          {canWrite && (
                            <Button variant="ghost" size="icon" title={t("actions.edit", "Manage")} onClick={() => setManageOrder(r)}>
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- PAYMENTS ---------- */}
          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("spy.number")}</TableHead>
                      <TableHead>{t("po.number")}</TableHead>
                      <TableHead>{t("pyb.supplier")}</TableHead>
                      <TableHead>{t("spy.date")}</TableHead>
                      <TableHead>{t("rct.method")}</TableHead>
                      <TableHead className="text-end">{t("rct.amount")}</TableHead>
                      <TableHead>{t("label.status")}</TableHead>
                      <TableHead className="text-end">{t("label.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!payments.isLoading && (payments.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                    {(Array.isArray(payments.data) ? payments.data : Array.isArray(payments.data?.data) ? payments.data.data : [])?.map((r: any) => (
                      <TableRow key={r.id} className="whitespace-nowrap">
                        <TableCell className="font-mono text-xs">{r.payment_no}</TableCell>
                        <TableCell className="font-mono text-xs">{r.order?.order_no ?? "—"}</TableCell>
                        <TableCell className="text-sm">{name(r.supplier)}</TableCell>
                        <TableCell dir="ltr" className="text-xs">{formatDate(r.payment_date, lang)}</TableCell>
                        <TableCell className="text-xs">{t(`pm.${r.payment_method}`)}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount))} {r.currency}</TableCell>
                        <TableCell><Badge variant={r.status === "cancelled" ? "destructive" : "default"}>{t(`spystatus.${r.status}`)}</Badge></TableCell>
                        <TableCell className="text-end">
                          {canWrite && r.status === "confirmed" && (
                            <Button variant="ghost" size="icon" title={t("spy.cancel")} onClick={() => setCancelPay(r)}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- STATEMENT ---------- */}
          <TabsContent value="statement" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="max-w-sm space-y-2">
                  <Label>{t("pyb.supplier")}</Label>
                  <Select value={stSupplier} onValueChange={setStSupplier}>
                    <SelectTrigger dir={dir}><SelectValue placeholder={t("pyb.supplier")} /></SelectTrigger>
                    <SelectContent>{(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray(suppliers.data?.data) ? suppliers.data.data : [])?.map((s: any) => <SelectItem key={s.id} value={s.id}>{name(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {stSupplier && (
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="whitespace-nowrap">
                        <TableHead>{t("label.date", "Date")}</TableHead>
                        <TableHead>{t("label.code", "Reference")}</TableHead>
                        <TableHead className="text-end">{t("rct.debit")}</TableHead>
                        <TableHead className="text-end">{t("rct.credit")}</TableHead>
                        <TableHead className="text-end">{t("pyb.balance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(statement.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                      {(Array.isArray(statement.data) ? statement.data : Array.isArray(statement.data?.data) ? statement.data.data : [])?.map((r: any, i: number) => (
                        <TableRow key={i} className="whitespace-nowrap">
                          <TableCell dir="ltr" className="text-xs">{formatDate(r.date, lang)}</TableCell>
                          <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs tabular-nums">{r.type === "debit" ? fmt(r.amount) : "—"}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs tabular-nums">{r.type === "credit" ? fmt(r.amount) : "—"}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs font-semibold tabular-nums">{fmt(r.balance)} SAR</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate from booking */}
      <Dialog open={openGen} onOpenChange={setOpenGen}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("pyb.from_booking")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>{t("inv.select_booking")}</Label>
            <Select value={genBooking} onValueChange={setGenBooking}>
              <SelectTrigger dir={dir}><SelectValue placeholder={t("inv.select_booking")} /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(bookings.data) ? bookings.data : Array.isArray(bookings.data?.data) ? bookings.data.data : [])?.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.booking_no} · {name(b.customer)} · {b.currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenGen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={generatePayables} disabled={busy || !genBooking}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New order */}
      <Dialog open={openNewOrder} onOpenChange={setOpenNewOrder}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("po.new")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label>{t("pyb.supplier")}</Label>
              <Select value={oSupplier} onValueChange={setOSupplier}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray(suppliers.data?.data) ? suppliers.data.data : [])?.map((s: any) => <SelectItem key={s.id} value={s.id}>{name(s)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("inv.currency")}</Label>
              <Select value={oCurrency} onValueChange={setOCurrency}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNewOrder(false)}>{t("actions.cancel")}</Button>
            <Button onClick={createOrder} disabled={busy || !oSupplier}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage order */}
      <Dialog open={!!manageOrder} onOpenChange={(o) => !o && setManageOrder(null)}>
        <DialogContent dir={dir} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {manageOrder?.order_no} {manageOrder && <PoStatusBadge status={manageOrder.status} t={t} />}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {name(manageOrder?.supplier)} · {t("po.total")}: <span dir="ltr" className="font-semibold tabular-nums">{manageOrder ? fmt(Number(manageOrder.total_amount)) : ""} {manageOrder?.currency}</span>
            </div>
            <div className="space-y-1">
              <Label>{t("po.items")}</Label>
              {(orderItems.data?.length ?? 0) === 0 && <div className="rounded border px-3 py-2 text-xs text-muted-foreground">{t("label.no_results")}</div>}
              {(Array.isArray(orderItems.data) ? orderItems.data : Array.isArray(orderItems.data?.data) ? orderItems.data.data : [])?.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-xs">
                  <span className="font-mono">{it.payable?.payable_no}</span>
                  <span className="flex items-center gap-2">
                    <span dir="ltr" className="tabular-nums">{fmt(Number(it.amount))}</span>
                    {manageOrder?.status === "draft" && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(it.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {manageOrder?.status === "draft" && (
              <div className="grid grid-cols-3 items-end gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>{t("po.add_payable")}</Label>
                  <Select value={itemPayable} onValueChange={setItemPayable}>
                    <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(openPayables.data) ? openPayables.data : Array.isArray(openPayables.data?.data) ? openPayables.data.data : [])?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.payable_no} · {fmt(Number(p.amount) - Number(p.paid_amount))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("rct.amount")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" step="0.01" value={itemAmount} onChange={(e) => setItemAmount(e.target.value)} />
                    <Button size="icon" onClick={addItem} disabled={busy || !itemPayable || !Number(itemAmount)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}
            {manageOrder?.rejection_reason && manageOrder?.status === "rejected" && (
              <div className="rounded border border-destructive/50 px-3 py-2 text-xs text-destructive">{manageOrder.rejection_reason}</div>
            )}
          </div>
          <DialogFooter className="flex-wrap gap-2">
            {manageOrder?.status === "draft" && (
              <Button onClick={() => setOrderStatus("pending_approval")} disabled={busy || (orderItems.data?.length ?? 0) === 0}>{t("po.submit")}</Button>
            )}
            {manageOrder?.status === "pending_approval" && canApprove && (
              <>
                <Button onClick={() => setOrderStatus("approved")} disabled={busy}>{t("po.approve")}</Button>
                <Button variant="destructive" onClick={() => setOpenReject(true)} disabled={busy}>{t("po.reject")}</Button>
              </>
            )}
            {manageOrder?.status === "rejected" && (
              <Button variant="outline" onClick={() => setOrderStatus("draft")} disabled={busy}>{t("actions.edit", "Reopen")}</Button>
            )}
            {manageOrder?.status === "approved" && (
              <Button onClick={() => { setPAmount(String(Math.max(orderRemaining, 0) || manageOrder.total_amount)); setOpenPay(true); }} disabled={busy}>{t("po.record_payment")}</Button>
            )}
            <Button variant="outline" onClick={() => setManageOrder(null)}>{t("actions.close", "Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject order */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("po.reject")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>{t("po.rejection_reason")}</Label>
            <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" disabled={busy || !rejectReason.trim()}
              onClick={async () => { await setOrderStatus("rejected", { rejection_reason: rejectReason }); setOpenReject(false); setRejectReason(""); }}>
              {t("po.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record payment */}
      <Dialog open={openPay} onOpenChange={setOpenPay}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("po.record_payment")} · {manageOrder?.order_no}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>{t("spy.date")}</Label><Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>{t("rct.method")}</Label>
              <Select value={pMethod} onValueChange={setPMethod}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{t(`pm.${m}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t("rct.amount")}</Label><Input type="number" step="0.01" value={pAmount} onChange={(e) => setPAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("rct.reference")}</Label><Input value={pRef} onChange={(e) => setPRef(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPay(false)}>{t("actions.cancel")}</Button>
            <Button onClick={recordPayment} disabled={busy || !Number(pAmount)}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel payment */}
      <Dialog open={!!cancelPay} onOpenChange={(o) => !o && setCancelPay(null)}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("spy.cancel")} · {cancelPay?.payment_no}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>{t("rct.reason")}</Label>
            <Textarea rows={3} value={cancelPayReason} onChange={(e) => setCancelPayReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelPay(null)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" onClick={doCancelPayment} disabled={busy || !cancelPayReason.trim()}>{t("spy.cancel")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


