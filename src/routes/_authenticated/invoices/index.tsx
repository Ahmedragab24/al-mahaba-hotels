// Invoice list — Section 15 (BR-INV). KPIs, filters, create from booking or manual.
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/store/queryBridge";
import { useState, useMemo } from "react";
import { useQuery } from "@/store/queryBridge";
import {
  useGetInvoicesQuery,
  useGetInvoiceStatisticsQuery,
  useUpdateInvoiceMutation,
} from "@/store/api";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataPagination } from "@/components/data-pagination";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { Search, Eye, FileText, AlertTriangle, CheckCircle2, FileEdit, Wallet } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const STATUSES = ["unpaid", "paid", "scheduled", "overdue", "cancelled"] as const;
export const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"] as const;

export function InvStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "cancelled" ? "destructive" : (status === "unpaid" || status === "overdue") ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600" : status === "scheduled" ? "bg-blue-600 text-white hover:bg-blue-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`invstatus.${status}`)}</Badge>;
}

export default function InvoicesList() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = canWriteModule(auth, "invoices");

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const [busy, setBusy] = useState(false);

  // Edit states
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("unpaid");
  const [editNotes, setEditNotes] = useState("");
  const [editInvoiceImage, setEditInvoiceImage] = useState<File | null>(null);

  const [updateInvoice] = useUpdateInvoiceMutation();

  const handleOpenEdit = (inv: any) => {
    setEditingInvoice(inv);
    setEditStatus(inv.status ?? "unpaid");
    setEditNotes(inv.notes ?? "");
    setEditInvoiceImage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("status", editStatus);
      formData.append("notes", editNotes || "");
      if (editInvoiceImage) {
        formData.append("invoice_image", editInvoiceImage);
      }

      await updateInvoice({ id: editingInvoice.id, body: formData }).unwrap();
      toast.success(t("label.saved", "Saved successfully"));
      setEditingInvoice(null);
      setEditInvoiceImage(null);
    } catch (e: any) {
      toast.error(e.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await apiClient.customers.getAll()) ?? [],
  });

  const { data: invoicesData, isLoading: isListLoading } = useGetInvoicesQuery({
    page,
    per_page: PAGE_SIZE,
    search: dSearch.trim() || undefined,
    customer_id: customer !== "all" ? customer : undefined,
    status: status !== "all" ? status : undefined,
    start_date: from || undefined,
    end_date: to || undefined,
    lang,
  });

  const { data: statsData } = useGetInvoiceStatisticsQuery();
  const metricsData = useMemo(() => {
    const listStats = (invoicesData as any)?.statistics;
    const s = (statsData as any)?.data || statsData || listStats || {};
    return {
      total: s.total_invoices_count ?? 0,
      outstanding: s.due_amount_sar ?? 0,
      overdue: s.overdue_count ?? 0,
      paid: s.paid_count ?? 0,
      draft: s.scheduled_count ?? 0,
    };
  }, [statsData, invoicesData]);

  const listRows = useMemo(() => {
    if (!invoicesData) return [];
    if (Array.isArray(invoicesData)) return invoicesData;
    const array = (invoicesData as any).data;
    return Array.isArray(array) ? array : [];
  }, [invoicesData]);

  const listCount = useMemo(() => {
    if (!invoicesData) return 0;
    return Array.isArray(invoicesData) ? invoicesData.length : invoicesData.count ?? invoicesData.total ?? 0;
  }, [invoicesData]);

  const total = listCount;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const name = (c: any) => (c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—");

  return (
    <>
      <PageHeader title={t("inv.title")} subtitle={`${total} ${t("label.total")}`}
      />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard icon={FileText} tone="primary" label={t("inv.kpi.total")} value={metricsData.total ?? "—"}
            active={status === "all"} onClick={() => { setStatus("all"); setPage(1); }} />
          <KpiCard icon={Wallet} tone="warning" label={t("inv.kpi.outstanding")} value={metricsData ? fmt(metricsData.outstanding) : "—"} />
          <KpiCard icon={AlertTriangle} tone="destructive" label={t("inv.kpi.overdue")} value={metricsData.overdue ?? "—"} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("inv.kpi.paid")} value={metricsData.paid ?? "—"}
            active={status === "paid"} onClick={() => { setStatus("paid"); setPage(1); }} />
          <KpiCard icon={FileEdit} tone="muted" label={t("inv.kpi.draft")} value={metricsData.draft ?? "—"}
            active={status === "draft"} onClick={() => { setStatus("draft"); setPage(1); }} />
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
                  {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : []).map((c: any) => <SelectItem key={c.id} value={c.id}>{name(c)}</SelectItem>)}
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
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t("inv.number")}</TableHead>
                  <TableHead className="whitespace-nowrap">{lang === "ar" ? "رقم الحجز" : "Booking Code"}</TableHead>
                  <TableHead className="min-w-[150px]">{t("inv.customer")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("inv.date")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("inv.due_date")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("inv.total")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("inv.paid")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("inv.balance")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("label.status")}</TableHead>
                  <TableHead className="text-end whitespace-nowrap">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading && <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!isListLoading && listRows.length === 0 && <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {listRows.map((r: any) => {
                  const currencyCode = typeof r.currency === "object" ? r.currency?.code : (r.currency ?? "SAR");
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        <Link to={`/invoices/${r.id}`} className="hover:underline text-primary font-semibold">{r.invoice_number || r.invoice_no}</Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {r.booking_code || r.booking?.code || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{name(r.customer)}</TableCell>
                      <TableCell dir="ltr" className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.invoice_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.due_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums font-semibold whitespace-nowrap">{fmt(Number(r.total_amount))} <span className="text-muted-foreground font-normal">{currencyCode}</span></TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums whitespace-nowrap text-muted-foreground">{fmt(Number(r.paid_amount))}</TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums whitespace-nowrap text-destructive">{fmt(Number(r.total_amount) - Number(r.paid_amount))}</TableCell>
                      <TableCell className="whitespace-nowrap"><InvStatusBadge status={r.status} t={t} /></TableCell>
                      <TableCell className="text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                            <Link to={`/invoices/${r.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {canWrite && (
                            <Button variant="ghost" size="icon" title={t("actions.edit")} onClick={() => handleOpenEdit(r)}>
                              <FileEdit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editingInvoice} onOpenChange={(val) => !val && setEditingInvoice(null)}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "تعديل حالة الفاتورة" : "Edit Invoice Status"} · {editingInvoice?.invoice_number || editingInvoice?.invoice_no}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "ar" ? "العميل" : "Customer"}</Label>
              <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40">
                {name(editingInvoice?.customer)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{lang === "ar" ? "رقم الحجز" : "Booking Code"}</Label>
                <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40 font-mono">
                  {editingInvoice?.booking_code || editingInvoice?.booking?.code || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}</Label>
                <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40 tabular-nums">
                  {fmt(Number(editingInvoice?.total_amount))} {typeof editingInvoice?.currency === "object" ? editingInvoice.currency?.code : (editingInvoice?.currency ?? "SAR")}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "حالة الفاتورة" : "Invoice Status"}</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{lang === "ar" ? "غير مدفوعة" : "Unpaid"}</SelectItem>
                  <SelectItem value="paid">{lang === "ar" ? "مدفوعة" : "Paid"}</SelectItem>
                  <SelectItem value="scheduled">{lang === "ar" ? "مجدولة" : "Scheduled"}</SelectItem>
                  <SelectItem value="overdue">{lang === "ar" ? "متأخرة" : "Overdue"}</SelectItem>
                  <SelectItem value="cancelled">{lang === "ar" ? "ملغاة" : "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "ملاحظات الدفع / الفاتورة" : "Payment / Invoice Notes"}</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={lang === "ar" ? "اكتب ملاحظات الدفع أو الفاتورة هنا..." : "Write payment or invoice notes here..."}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "إيصال السداد / صورة الفاتورة (اختياري)" : "Payment Receipt / Invoice Image (Optional)"}</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setEditInvoiceImage(file || null);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInvoice(null)}>{t("actions.cancel")}</Button>
            <Button onClick={handleSaveEdit} disabled={busy}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
