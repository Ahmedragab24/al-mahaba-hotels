// Receipts, customer balances & financial adjustments — Section 15 (BR-INV-007..010)
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
import { Plus, Coins, XCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"] as const;
const ADJ_WRITE = ["super_admin", "admin", "finance_manager"] as const;
const METHODS = ["cash", "bank_transfer", "cheque", "card", "online"] as const;

export default function ReceiptsPage() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const canWrite = hasAnyRole(auth, [...FINANCE_WRITE]);
  const canAdjust = hasAnyRole(auth, [...ADJ_WRITE]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const name = (c: any) => (c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—");

  // ---------- shared lookups ----------
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await apiClient.customers.getAll()) ?? [],
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await apiClient.currencies.getAll()) ?? [],
  });

  // ---------- receipts list ----------
  const [fCustomer, setFCustomer] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["receipts", { fCustomer, fStatus, page }],
    queryFn: async () => {
      let q = db.from("receipts").select(
        "id,receipt_no,status,receipt_date,payment_method,reference_no,currency,amount,allocated_amount,customer_id,customer:customers(name_en,name_ar)",
        { count: "exact" },
      ).is("deleted_at", null);
      if (fCustomer !== "all") q = q.eq("customer_id", fCustomer);
      if (fStatus !== "all") q = q.eq("status", fStatus);
      const f = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["receipts"] });
    qc.invalidateQueries({ queryKey: ["rct-balances"] });
    qc.invalidateQueries({ queryKey: ["rct-allocs"] });
    qc.invalidateQueries({ queryKey: ["invoices"] });
  };

  // ---------- new receipt ----------
  const [openNew, setOpenNew] = useState(false);
  const [nCustomer, setNCustomer] = useState("");
  const [nDate, setNDate] = useState(new Date().toISOString().slice(0, 10));
  const [nMethod, setNMethod] = useState("bank_transfer");
  const [nRef, setNRef] = useState("");
  const [nCurrency, setNCurrency] = useState("SAR");
  const [nRate, setNRate] = useState("1");
  const [nAmount, setNAmount] = useState("");
  const [nNotes, setNNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const createReceipt = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("receipts").insert({
        customer_id: nCustomer, receipt_date: nDate, payment_method: nMethod,
        reference_no: nRef || null, currency: nCurrency,
        exchange_rate: Number(nRate) || 1, amount: Number(nAmount), notes: nNotes || null,
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setOpenNew(false); setNCustomer(""); setNAmount(""); setNRef(""); setNNotes("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // ---------- allocation ----------
  const [allocFor, setAllocFor] = useState<any | null>(null);
  const [allocInvoice, setAllocInvoice] = useState("");
  const [allocAmount, setAllocAmount] = useState("");

  const openInvoices = useQuery({
    queryKey: ["rct-open-invoices", allocFor?.customer_id, allocFor?.currency],
    enabled: !!allocFor,
    queryFn: async () =>
      (await db.from("invoices")
        .select("id,invoice_no,total_amount,paid_amount,currency,status")
        .eq("customer_id", allocFor.customer_id).eq("currency", allocFor.currency)
        .in("status", ["issued", "sent", "partially_paid"]).is("deleted_at", null)
        .order("invoice_date")).data ?? [],
  });
  const allocations = useQuery({
    queryKey: ["rct-allocs", allocFor?.id],
    enabled: !!allocFor,
    queryFn: async () =>
      (await db.from("receipt_allocations")
        .select("id,amount,invoice:invoices(invoice_no)")
        .eq("receipt_id", allocFor.id).order("created_at")).data ?? [],
  });

  const addAllocation = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("receipt_allocations").insert({
        receipt_id: allocFor.id, invoice_id: allocInvoice, amount: Number(allocAmount),
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setAllocInvoice(""); setAllocAmount("");
      qc.invalidateQueries({ queryKey: ["rct-allocs"] });
      qc.invalidateQueries({ queryKey: ["rct-open-invoices"] });
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };
  const removeAllocation = async (id: string) => {
    try {
      await apiClient.receiptAllocations.delete(id);
      qc.invalidateQueries({ queryKey: ["rct-allocs"] });
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); }
  };

  // ---------- cancel ----------
  const [cancelFor, setCancelFor] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const cancelReceipt = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("receipts")
        .update({ status: "cancelled", cancellation_reason: cancelReason })
        .eq("id", cancelFor.id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setCancelFor(null); setCancelReason("");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  // ---------- balances ----------
  const balances = useQuery({
    queryKey: ["rct-balances"],
    queryFn: async () => {
      const [inv, rct, adj] = await Promise.all([
        db.from("invoices").select("customer_id,total_amount,exchange_rate,status").is("deleted_at", null),
        db.from("receipts").select("customer_id,amount,exchange_rate,status").is("deleted_at", null),
        db.from("customer_adjustments").select("customer_id,amount,exchange_rate,adjustment_type"),
      ]);
      const map: Record<string, { invoiced: number; received: number; adj: number }> = {};
      const get = (id: string) => (map[id] ??= { invoiced: 0, received: 0, adj: 0 });
      for (const r of inv.data ?? []) if (!["draft", "cancelled"].includes(r.status)) get(r.customer_id).invoiced += Number(r.total_amount) * Number(r.exchange_rate);
      for (const r of rct.data ?? []) if (r.status === "confirmed") get(r.customer_id).received += Number(r.amount) * Number(r.exchange_rate);
      for (const r of adj.data ?? []) get(r.customer_id).adj += (r.adjustment_type === "credit" ? 1 : -1) * Number(r.amount) * Number(r.exchange_rate);
      return map;
    },
  });

  // ---------- adjustments ----------
  const adjList = useQuery({
    queryKey: ["rct-adjustments"],
    queryFn: async () =>
      (await db.from("customer_adjustments")
        .select("id,adjustment_no,adjustment_type,amount,currency,reason,created_at,customer:customers(name_en,name_ar),invoice:invoices(invoice_no)")
        .order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  const [openAdj, setOpenAdj] = useState(false);
  const [aCustomer, setACustomer] = useState("");
  const [aType, setAType] = useState("credit");
  const [aAmount, setAAmount] = useState("");
  const [aCurrency, setACurrency] = useState("SAR");
  const [aReason, setAReason] = useState("");

  const createAdjustment = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("customer_adjustments").insert({
        customer_id: aCustomer, adjustment_type: aType, amount: Number(aAmount),
        currency: aCurrency, reason: aReason,
      });
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setOpenAdj(false); setACustomer(""); setAAmount(""); setAReason("");
      qc.invalidateQueries({ queryKey: ["rct-adjustments"] });
      qc.invalidateQueries({ queryKey: ["rct-balances"] });
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  const total = list.data?.count ?? 0;

  return (
    <>
      <PageHeader title={t("rct.title")} subtitle={`${total} ${t("label.total")}`}
        actions={canWrite && <Button size="sm" onClick={() => setOpenNew(true)}><Plus className="h-4 w-4" /> {t("rct.new")}</Button>} />
      <div className="space-y-4 p-6">
        <Tabs defaultValue="receipts" dir={dir}>
          <TabsList>
            <TabsTrigger value="receipts">{t("rct.title")}</TabsTrigger>
            <TabsTrigger value="balances">{t("rct.balances")}</TabsTrigger>
            <TabsTrigger value="adjustments">{t("rct.adjustments")}</TabsTrigger>
          </TabsList>

          <TabsContent value="receipts" className="space-y-4">
            <Card>
              <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
                <Select value={fCustomer} onValueChange={(v) => { setFCustomer(v); setPage(1); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("inv.customer")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filter.all")}</SelectItem>
                    {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fStatus} onValueChange={(v) => { setFStatus(v); setPage(1); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filter.all")}</SelectItem>
                    <SelectItem value="confirmed">{t("rctstatus.confirmed")}</SelectItem>
                    <SelectItem value="cancelled">{t("rctstatus.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("rct.number")}</TableHead>
                      <TableHead>{t("inv.customer")}</TableHead>
                      <TableHead>{t("rct.date")}</TableHead>
                      <TableHead>{t("rct.method")}</TableHead>
                      <TableHead className="text-end">{t("rct.amount")}</TableHead>
                      <TableHead className="text-end">{t("rct.allocated")}</TableHead>
                      <TableHead className="text-end">{t("rct.unallocated")}</TableHead>
                      <TableHead>{t("label.status")}</TableHead>
                      <TableHead className="text-end">{t("label.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.isLoading && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                    {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                    {list.data?.rows.map((r: any) => (
                      <TableRow key={r.id} className="whitespace-nowrap">
                        <TableCell className="font-mono text-xs">{r.receipt_no}</TableCell>
                        <TableCell className="text-sm">{name(r.customer)}</TableCell>
                        <TableCell dir="ltr" className="text-xs">{formatDate(r.receipt_date, lang)}</TableCell>
                        <TableCell className="text-xs">{t(`pm.${r.payment_method}`)}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount))} {r.currency}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.allocated_amount))}</TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount) - Number(r.allocated_amount))}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "cancelled" ? "destructive" : "default"}>{t(`rctstatus.${r.status}`)}</Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          {canWrite && r.status === "confirmed" && (
                            <>
                              <Button variant="ghost" size="icon" title={t("rct.allocate")} onClick={() => setAllocFor(r)}><Coins className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" title={t("rct.cancel")} onClick={() => setCancelFor(r)}><XCircle className="h-4 w-4 text-destructive" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("inv.customer")}</TableHead>
                      <TableHead className="text-end">{t("rct.invoiced")}</TableHead>
                      <TableHead className="text-end">{t("rct.received")}</TableHead>
                      <TableHead className="text-end">{t("rct.adjustments")}</TableHead>
                      <TableHead className="text-end">{t("rct.balance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.data?.filter((c: any) => balances.data?.[c.id]).map((c: any) => {
                      const b = balances.data![c.id];
                      const bal = b.invoiced - b.received - b.adj;
                      return (
                        <TableRow key={c.id} className="whitespace-nowrap">
                          <TableCell className="text-sm">{name(c)}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(b.invoiced)}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(b.received)}</TableCell>
                          <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(b.adj)}</TableCell>
                          <TableCell dir="ltr" className={`text-end text-xs font-semibold tabular-nums ${bal > 0 ? "text-destructive" : ""}`}>{fmt(bal)} SAR</TableCell>
                        </TableRow>
                      );
                    })}
                    {!balances.isLoading && Object.keys(balances.data ?? {}).length === 0 && (
                      <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adjustments" className="space-y-4">
            {canAdjust && (
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setOpenAdj(true)}><Plus className="h-4 w-4" /> {t("rct.adj_new")}</Button>
              </div>
            )}
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="whitespace-nowrap">
                      <TableHead>{t("label.code", "No.")}</TableHead>
                      <TableHead>{t("inv.customer")}</TableHead>
                      <TableHead>{t("rct.adj_type")}</TableHead>
                      <TableHead className="text-end">{t("rct.amount")}</TableHead>
                      <TableHead>{t("rct.reason")}</TableHead>
                      <TableHead>{t("inv.number")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(adjList.data) ? adjList.data : Array.isArray(adjList.data?.data) ? adjList.data.data : [])?.map((r: any) => (
                      <TableRow key={r.id} className="whitespace-nowrap">
                        <TableCell className="font-mono text-xs">{r.adjustment_no}</TableCell>
                        <TableCell className="text-sm">{name(r.customer)}</TableCell>
                        <TableCell><Badge variant={r.adjustment_type === "credit" ? "default" : "outline"}>{t(`rct.${r.adjustment_type}`)}</Badge></TableCell>
                        <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.amount))} {r.currency}</TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs">{r.reason}</TableCell>
                        <TableCell className="font-mono text-xs">{r.invoice?.invoice_no ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                    {!adjList.isLoading && (adjList.data?.length ?? 0) === 0 && (
                      <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New receipt */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("rct.new")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label>{t("inv.customer")}</Label>
              <Select value={nCustomer} onValueChange={setNCustomer}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t("rct.date")}</Label><Input type="date" value={nDate} onChange={(e) => setNDate(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>{t("rct.method")}</Label>
              <Select value={nMethod} onValueChange={setNMethod}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{t(`pm.${m}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("inv.currency")}</Label>
              <Select value={nCurrency} onValueChange={setNCurrency}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t("rates.exchange_rate", "Exchange Rate")}</Label><Input type="number" step="0.000001" value={nRate} onChange={(e) => setNRate(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("rct.amount")}</Label><Input type="number" step="0.01" value={nAmount} onChange={(e) => setNAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("rct.reference")}</Label><Input value={nRef} onChange={(e) => setNRef(e.target.value)} /></div>
            <div className="col-span-2 space-y-2"><Label>{t("label.notes", "Notes")}</Label><Textarea rows={2} value={nNotes} onChange={(e) => setNNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>{t("actions.cancel")}</Button>
            <Button onClick={createReceipt} disabled={busy || !nCustomer || !Number(nAmount)}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocate */}
      <Dialog open={!!allocFor} onOpenChange={(o) => !o && setAllocFor(null)}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("rct.allocate")} · {allocFor?.receipt_no}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {t("rct.unallocated")}: <span dir="ltr" className="font-semibold tabular-nums">{allocFor ? fmt(Number(allocFor.amount) - Number(allocFor.allocated_amount)) : ""} {allocFor?.currency}</span>
            </div>
            {(allocations.data?.length ?? 0) > 0 && (
              <div className="space-y-1">
                <Label>{t("rct.allocations")}</Label>
                {allocations.data!.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-xs">
                    <span className="font-mono">{a.invoice?.invoice_no}</span>
                    <span className="flex items-center gap-2">
                      <span dir="ltr" className="tabular-nums">{fmt(Number(a.amount))}</span>
                      {canWrite && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAllocation(a.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>{t("inv.number")}</Label>
                <Select value={allocInvoice} onValueChange={setAllocInvoice}>
                  <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(openInvoices.data) ? openInvoices.data : Array.isArray(openInvoices.data?.data) ? openInvoices.data.data : [])?.map((i: any) => (
                      <SelectItem key={i.id} value={i.id}>{i.invoice_no} · {fmt(Number(i.total_amount) - Number(i.paid_amount))} {i.currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("rct.amount")}</Label><Input type="number" step="0.01" value={allocAmount} onChange={(e) => setAllocAmount(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocFor(null)}>{t("actions.cancel")}</Button>
            <Button onClick={addAllocation} disabled={busy || !allocInvoice || !Number(allocAmount)}>{t("rct.allocate")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={!!cancelFor} onOpenChange={(o) => !o && setCancelFor(null)}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("rct.cancel")} · {cancelFor?.receipt_no}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>{t("rct.reason")}</Label>
            <Textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelFor(null)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" onClick={cancelReceipt} disabled={busy || !cancelReason.trim()}>{t("rct.cancel")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New adjustment */}
      <Dialog open={openAdj} onOpenChange={setOpenAdj}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("rct.adj_new")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label>{t("inv.customer")}</Label>
              <Select value={aCustomer} onValueChange={setACustomer}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("rct.adj_type")}</Label>
              <Select value={aType} onValueChange={setAType}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">{t("rct.credit")}</SelectItem>
                  <SelectItem value="debit">{t("rct.debit")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("inv.currency")}</Label>
              <Select value={aCurrency} onValueChange={setACurrency}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>{(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t("rct.amount")}</Label><Input type="number" step="0.01" value={aAmount} onChange={(e) => setAAmount(e.target.value)} /></div>
            <div className="col-span-2 space-y-2"><Label>{t("rct.reason")}</Label><Textarea rows={2} value={aReason} onChange={(e) => setAReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdj(false)}>{t("actions.cancel")}</Button>
            <Button onClick={createAdjustment} disabled={busy || !aCustomer || !Number(aAmount) || !aReason.trim()}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ReceiptsPage as Component };
