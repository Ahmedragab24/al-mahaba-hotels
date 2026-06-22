// Invoice list — Section 15 (BR-INV). KPIs, filters, create from booking or manual.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataPagination } from "@/components/data-pagination";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { Plus, Search, Eye, FileText, AlertTriangle, CheckCircle2, FileEdit, Wallet } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/invoices/")({
  component: InvoicesList,
});

const PAGE_SIZE = 20;
const STATUSES = ["draft", "issued", "sent", "partially_paid", "paid", "cancelled"] as const;
export const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"] as const;

export function InvStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "cancelled" ? "destructive" : status === "draft" ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600"
    : status === "partially_paid" ? "bg-amber-500 text-white hover:bg-amber-500" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`invstatus.${status}`)}</Badge>;
}

function InvoicesList() {
  const { t, lang, dir } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole([...FINANCE_WRITE]);

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const [openNew, setOpenNew] = useState(false);
  const [mode, setMode] = useState<"booking" | "manual">("booking");
  const [bookingId, setBookingId] = useState("");
  const [mCustomer, setMCustomer] = useState("");
  const [mCurrency, setMCurrency] = useState("SAR");
  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mDue, setMDue] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
  });
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await supabase.from("currencies").select("code").order("code")).data ?? [],
  });
  const bookings = useQuery({
    queryKey: ["lookup-confirmed-bookings"],
    enabled: openNew,
    queryFn: async () =>
      (await supabase.from("bookings")
        .select("id,booking_no,status,currency,customer:customers(name_en,name_ar)")
        .in("status", ["confirmed", "checked_in", "checked_out"])
        .is("deleted_at", null).order("created_at", { ascending: false })).data ?? [],
  });

  const metrics = useQuery({
    queryKey: ["inv-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("status,total_amount,paid_amount,due_date").is("deleted_at", null);
      const rows = data ?? [];
      const today = new Date().toISOString().slice(0, 10);
      const open = rows.filter((r) => ["issued", "sent", "partially_paid"].includes(r.status));
      return {
        total: rows.length,
        outstanding: open.reduce((a, r) => a + Number(r.total_amount) - Number(r.paid_amount), 0),
        overdue: open.filter((r) => r.due_date < today).length,
        paid: rows.filter((r) => r.status === "paid").length,
        draft: rows.filter((r) => r.status === "draft").length,
      };
    },
  });

  const list = useQuery({
    queryKey: ["invoices", { dSearch, customer, status, from, to, page }],
    queryFn: async () => {
      let q = supabase.from("invoices").select(
        "id,invoice_no,status,invoice_date,due_date,currency,total_amount,paid_amount,customer:customers(name_en,name_ar)",
        { count: "exact" },
      ).is("deleted_at", null);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("invoice_date", from);
      if (to) q = q.lte("invoice_date", to);
      if (dSearch.trim()) q = q.ilike("invoice_no", `%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const createInvoice = async () => {
    setBusy(true);
    try {
      if (mode === "booking") {
        if (!bookingId) return;
        const { data, error } = await supabase.rpc("create_invoice_from_booking", { _booking_id: bookingId });
        if (error) throw error;
        toast.success(t("label.saved", "Saved"));
        navigate({ to: "/invoices/$id", params: { id: data as string } });
      } else {
        if (!mCustomer) return;
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("invoices").insert({
          customer_id: mCustomer, currency: mCurrency, invoice_date: mDate, due_date: mDue,
          created_by: userData.user?.id ?? null,
        }).select("id").single();
        if (error) throw error;
        toast.success(t("label.saved", "Saved"));
        navigate({ to: "/invoices/$id", params: { id: data.id } });
      }
      setOpenNew(false);
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  const total = list.data?.count ?? 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const name = (c: any) => (c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—");

  return (
    <>
      <PageHeader title={t("inv.title")} subtitle={`${total} ${t("label.total")}`}
        children={canWrite && <Button size="sm" onClick={() => setOpenNew(true)}><Plus className="h-4 w-4" /> {t("inv.new")}</Button>} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard icon={FileText} tone="primary" label={t("inv.kpi.total")} value={metrics.data?.total ?? "—"}
            active={status === "all"} onClick={() => { setStatus("all"); setPage(1); }} />
          <KpiCard icon={Wallet} tone="warning" label={t("inv.kpi.outstanding")} value={metrics.data ? fmt(metrics.data.outstanding) : "—"} />
          <KpiCard icon={AlertTriangle} tone="destructive" label={t("inv.kpi.overdue")} value={metrics.data?.overdue ?? "—"} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("inv.kpi.paid")} value={metrics.data?.paid ?? "—"}
            active={status === "paid"} onClick={() => { setStatus("paid"); setPage(1); }} />
          <KpiCard icon={FileEdit} tone="muted" label={t("inv.kpi.draft")} value={metrics.data?.draft ?? "—"}
            active={status === "draft"} onClick={() => { setStatus("draft"); setPage(1); }} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={t("filter.all")} tone="primary" active={status === "all"} onClick={() => { setStatus("all"); setPage(1); }} />
          {STATUSES.map(s => (
            <StatusPill key={s} label={t(`invstatus.${s}`)}
              tone={s === "paid" ? "success" : s === "cancelled" ? "destructive" : s === "partially_paid" ? "warning" : s === "draft" ? "muted" : "info"}
              active={status === s} onClick={() => { setStatus(s); setPage(1); }} />
          ))}
        </div>


        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("inv.number")} className="ps-8 w-full" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("inv.customer")}</Label>
              <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("inv.customer")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`invstatus.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.from")}</Label>
              <Input className="w-full justify-center" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.to")}</Label>
              <Input className="w-full justify-center" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead>{t("inv.number")}</TableHead>
                  <TableHead>{t("inv.customer")}</TableHead>
                  <TableHead>{t("inv.date")}</TableHead>
                  <TableHead>{t("inv.due_date")}</TableHead>
                  <TableHead className="text-end">{t("inv.total")}</TableHead>
                  <TableHead className="text-end">{t("inv.paid")}</TableHead>
                  <TableHead className="text-end">{t("inv.balance")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((r: any) => (
                  <TableRow key={r.id} className="whitespace-nowrap">
                    <TableCell className="font-mono text-xs">
                      <Link to="/invoices/$id" params={{ id: r.id }} className="hover:underline">{r.invoice_no}</Link>
                    </TableCell>
                    <TableCell className="text-sm">{name(r.customer)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(r.invoice_date, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(r.due_date, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.total_amount))} {r.currency}</TableCell>
                    <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.paid_amount))}</TableCell>
                    <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.total_amount) - Number(r.paid_amount))}</TableCell>
                    <TableCell><InvStatusBadge status={r.status} t={t} /></TableCell>
                    <TableCell className="text-end">
                      <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                        <Link to="/invoices/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("inv.new")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={mode === "booking" ? "default" : "outline"} size="sm" onClick={() => setMode("booking")}>{t("inv.from_booking")}</Button>
              <Button variant={mode === "manual" ? "default" : "outline"} size="sm" onClick={() => setMode("manual")}>{t("inv.manual")}</Button>
            </div>
            {mode === "booking" ? (
              <div className="space-y-2">
                <Label>{t("inv.select_booking")}</Label>
                <Select value={bookingId} onValueChange={setBookingId}>
                  <SelectTrigger dir={dir}><SelectValue placeholder={t("inv.select_booking")} /></SelectTrigger>
                  <SelectContent>
                    {bookings.data?.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.booking_no} · {name(b.customer)} · {b.currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>{t("inv.customer")}</Label>
                  <Select value={mCustomer} onValueChange={setMCustomer}>
                    <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("inv.currency")}</Label>
                  <Select value={mCurrency} onValueChange={setMCurrency}>
                    <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.data?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("inv.date")}</Label>
                  <Input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("inv.due_date")}</Label>
                  <Input type="date" value={mDue} onChange={(e) => setMDue(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>{t("actions.cancel")}</Button>
            <Button onClick={createInvoice} disabled={busy || (mode === "booking" ? !bookingId : !mCustomer)}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
