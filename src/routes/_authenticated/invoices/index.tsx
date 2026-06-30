// Invoice list — Section 15 (BR-INV). KPIs, filters, create from booking or manual.
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { getCurrentUserId } from "@/lib/api/base";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useGetInvoicesQuery,
  useGetInvoiceStatisticsQuery,
  useCreateInvoiceMutation,
  useCreateInvoiceFromBookingMutation,
  useGetBookingsQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetCurrenciesQuery,
} from "@/store/api";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
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
import { Plus, Search, Eye, FileText, AlertTriangle, CheckCircle2, FileEdit, Wallet, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;
const STATUSES = ["draft", "issued", "sent", "partially_paid", "paid", "cancelled"] as const;
export const FINANCE_WRITE = ["super_admin", "admin", "finance_manager", "finance_agent"] as const;

export function InvStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "cancelled" ? "destructive" : status === "draft" ? "outline" : "default";
  const cls = status === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-600"
    : status === "partially_paid" ? "bg-amber-500 text-white hover:bg-amber-500" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`invstatus.${status}`)}</Badge>;
}

export default function InvoicesList() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, [...FINANCE_WRITE]);

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
  const [mTax, setMTax] = useState("15.00");
  const [mDiscount, setMDiscount] = useState("0.00");
  const [mNotes, setMNotes] = useState("");

  // Dynamic Items builder state for manual mode
  const [manualItems, setManualItems] = useState<{ description: string; quantity: number; unit_price: number }[]>([]);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Edit / Delete states
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [editCustomer, setEditCustomer] = useState("");
  const [editCurrency, setEditCurrency] = useState("SAR");
  const [editDate, setEditDate] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editTax, setEditTax] = useState("15.00");
  const [editDiscount, setEditDiscount] = useState("0.00");
  const [editNotes, setEditNotes] = useState("");
  const [editItems, setEditItems] = useState<{ description: string; quantity: number; unit_price: number }[]>([]);
  const [editNewItemDesc, setEditNewItemDesc] = useState("");
  const [editNewItemQty, setEditNewItemQty] = useState("1");
  const [editNewItemPrice, setEditNewItemPrice] = useState("");
  const [editStatus, setEditStatus] = useState("draft");
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | number | null>(null);

  const addEditItem = () => {
    if (!editNewItemDesc.trim() || Number(editNewItemQty) <= 0 || Number(editNewItemPrice) < 0) return;
    setEditItems((prev) => [
      ...prev,
      {
        description: editNewItemDesc.trim(),
        quantity: Number(editNewItemQty),
        unit_price: Number(editNewItemPrice),
      },
    ]);
    setEditNewItemDesc("");
    setEditNewItemQty("1");
    setEditNewItemPrice("");
  };

  const removeEditItem = (index: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addManualItem = () => {
    if (!newItemDesc.trim() || Number(newItemQty) <= 0 || Number(newItemPrice) < 0) {
      toast.error(lang === "ar" ? "يرجى تعبئة بيانات البند بشكل صحيح" : "Please fill in item details correctly");
      return;
    }
    setManualItems((prev) => [
      ...prev,
      {
        description: newItemDesc.trim(),
        quantity: Number(newItemQty),
        unit_price: Number(newItemPrice),
      },
    ]);
    setNewItemDesc("");
    setNewItemQty("1");
    setNewItemPrice("");
  };

  const removeManualItem = (index: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  };

  const [createInvoiceFromBooking] = useCreateInvoiceFromBookingMutation();
  const [createInvoiceManual] = useCreateInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [deleteInvoice] = useDeleteInvoiceMutation();

  const handleOpenEdit = (inv: any) => {
    setEditingInvoice(inv);
    setEditCustomer(String(inv.customer_id));
    setEditCurrency(typeof inv.currency === "object" ? inv.currency?.code : (inv.currency ?? "SAR"));
    setEditDate(inv.invoice_date ? inv.invoice_date.slice(0, 10) : "");
    setEditDue(inv.due_date ? inv.due_date.slice(0, 10) : "");
    setEditTax(String(inv.tax_percent ?? "15.00"));
    setEditDiscount(String(inv.discount ?? "0.00"));
    setEditNotes(inv.notes ?? "");
    setEditItems(inv.items ?? []);
    setEditStatus(inv.status ?? "draft");
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    setBusy(true);
    try {
      const payload: any = {
        invoice_date: editDate,
        due_date: editDue,
        tax_percent: Number(editTax),
        discount: Number(editDiscount),
        notes: editNotes,
        status: editStatus,
        items: editItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      if (editingInvoice.invoice_type === "manual") {
        payload.customer_id = Number(editCustomer);
        payload.currency_id = currencyList.find((c: any) => c.code === editCurrency)?.id || editingInvoice.currency_id;
      }

      await updateInvoice({ id: editingInvoice.id, body: payload }).unwrap();
      toast.success(t("label.saved", "Saved successfully"));
      setEditingInvoice(null);
    } catch (e: any) {
      toast.error(e.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    setBusy(true);
    try {
      await deleteInvoice(invoiceToDelete).unwrap();
      toast.success(lang === "ar" ? "تم حذف الفاتورة بنجاح" : "Invoice deleted successfully");
      setInvoiceToDelete(null);
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
  const currenciesQuery = useGetCurrenciesQuery(undefined, { skip: !openNew && !editingInvoice });

  const currencyList = useMemo(() => {
    const rawData = currenciesQuery.data;
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    const cData = rawData as any;
    if (Array.isArray(cData.data)) return cData.data;
    return [];
  }, [currenciesQuery.data]);

  const customerList = useMemo(() => {
    if (!customers.data) return [];
    if (Array.isArray(customers.data)) return customers.data;
    const cData = customers.data as any;
    if (Array.isArray(cData.data)) return cData.data;
    return [];
  }, [customers.data]);

  const bookingsQuery = useGetBookingsQuery(undefined, { skip: !openNew });
  const confirmedBookingsList = useMemo(() => {
    const rawData = bookingsQuery.data;
    if (!rawData) return [];
    const list = Array.isArray(rawData) ? rawData : (rawData as any).data ?? [];
    return list.filter((b: any) => ["confirmed", "checked_in", "checked_out"].includes(b.status));
  }, [bookingsQuery.data]);

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
    return {
      total: statsData?.total ?? listStats?.total_invoices_count ?? 0,
      outstanding: statsData?.outstanding ?? listStats?.due_amount_sar ?? 0,
      overdue: statsData?.overdue ?? listStats?.overdue_count ?? 0,
      paid: statsData?.paid ?? listStats?.paid_count ?? 0,
      draft: statsData?.draft ?? listStats?.draft_count ?? 0,
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

  const createInvoice = async () => {
    setBusy(true);
    try {
      if (mode === "booking") {
        if (!bookingId) return;
        const res = await createInvoiceFromBooking({
          booking_id: Number(bookingId),
          invoice_date: mDate,
          due_date: mDue,
          tax_percent: Number(mTax) || 0,
          discount: Number(mDiscount) || 0,
          notes: mNotes || undefined,
          ...(manualItems.length > 0 ? { items: manualItems } : {}),
        }).unwrap();
        toast.success(t("label.saved", "Saved"));
        const newId = typeof res === "object" ? res?.id : res;
        navigate(`/invoices/${newId}`);
      } else {
        if (!mCustomer) return;
        if (manualItems.length === 0) {
          toast.error(lang === "ar" ? "يرجى إضافة بند واحد على الأقل للفاتورة اليدوية" : "Please add at least one item for the manual invoice");
          setBusy(false);
          return;
        }
        const selectedCurrencyObj = currencyList.find((c: any) => c.code === mCurrency || c.id === Number(mCurrency));
        const currencyId = selectedCurrencyObj ? Number(selectedCurrencyObj.id) : 3;
        const res = await createInvoiceManual({
          invoice_type: "manual",
          customer_id: Number(mCustomer),
          currency_id: currencyId,
          invoice_date: mDate,
          due_date: mDue,
          tax_percent: Number(mTax) || 0,
          discount: Number(mDiscount) || 0,
          notes: mNotes || null,
          status: "draft",
          items: manualItems,
        }).unwrap();
        toast.success(t("label.saved", "Saved"));
        navigate(`/invoices/${res.id}`);
      }
      setOpenNew(false);
      setManualItems([]);
      setMNotes("");
      setMTax("15.00");
      setMDiscount("0.00");
    } catch (e: any) {
      toast.error(e.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const total = listCount;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const name = (c: any) => (c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—");

  return (
    <>
      <PageHeader title={t("inv.title")} subtitle={`${total} ${t("label.total")}`}
        children={canWrite && <Button size="sm" onClick={() => setOpenNew(true)}><Plus className="h-4 w-4" /> {t("inv.new")}</Button>} />
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
                {isListLoading && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!isListLoading && listRows.length === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {listRows.map((r: any) => {
                  const currencyCode = typeof r.currency === "object" ? r.currency?.code : (r.currency ?? "SAR");
                  return (
                    <TableRow key={r.id} className="whitespace-nowrap">
                      <TableCell className="font-mono text-xs">
                        <Link to={`/invoices/${r.id}`} className="hover:underline">{r.invoice_number || r.invoice_no}</Link>
                      </TableCell>
                      <TableCell className="text-sm">{name(r.customer)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(r.invoice_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(r.due_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.total_amount))} {currencyCode}</TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.paid_amount))}</TableCell>
                      <TableCell dir="ltr" className="text-end text-xs tabular-nums">{fmt(Number(r.total_amount) - Number(r.paid_amount))}</TableCell>
                      <TableCell><InvStatusBadge status={r.status} t={t} /></TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                            <Link to={`/invoices/${r.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {canWrite && (
                            <>
                              <Button variant="ghost" size="icon" title={t("actions.edit")} onClick={() => handleOpenEdit(r)}>
                                <FileEdit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setInvoiceToDelete(r.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
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

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent className="max-w-2xl" dir={dir}>
          <DialogHeader><DialogTitle>{t("inv.new")}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="flex gap-2">
              <Button type="button" variant={mode === "booking" ? "default" : "outline"} size="sm" onClick={() => setMode("booking")}>{t("inv.from_booking")}</Button>
              <Button type="button" variant={mode === "manual" ? "default" : "outline"} size="sm" onClick={() => setMode("manual")}>{t("inv.manual")}</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mode === "booking" ? (
                <div className="space-y-2 col-span-2">
                  <Label>{t("inv.select_booking")}</Label>
                  <Select value={bookingId} onValueChange={setBookingId}>
                    <SelectTrigger dir={dir}><SelectValue placeholder={t("inv.select_booking")} /></SelectTrigger>
                    <SelectContent>
                      {confirmedBookingsList.map((b: any) => {
                        const bCurrency = typeof b.currency === "object" ? b.currency?.code : (b.currency ?? "SAR");
                        return (
                          <SelectItem key={b.id} value={String(b.id)}>{b.booking_no} · {name(b.customer)} · {bCurrency}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{t("inv.customer")}</Label>
                    <Select value={mCustomer} onValueChange={setMCustomer}>
                      <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {customerList.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{name(c)} {c.code ? `(${c.code})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("inv.currency")}</Label>
                    <Select value={mCurrency} onValueChange={setMCurrency}>
                      <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {currencyList.map((c: any) => (
                          <SelectItem key={c.id} value={c.code}>
                            {lang === "ar" ? c.name_ar : c.name_en} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>{t("inv.date")}</Label>
                <Input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("inv.due_date")}</Label>
                <Input type="date" value={mDue} onChange={(e) => setMDue(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>{lang === "ar" ? "نسبة الضريبة (%)" : "Tax Percent (%)"}</Label>
                <Input type="number" step="0.01" value={mTax} onChange={(e) => setMTax(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "الخصم" : "Discount"}</Label>
                <Input type="number" step="0.01" value={mDiscount} onChange={(e) => setMDiscount(e.target.value)} />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>{lang === "ar" ? "ملاحظات الفاتورة" : "Invoice Notes"}</Label>
                <Input value={mNotes} onChange={(e) => setMNotes(e.target.value)} placeholder={lang === "ar" ? "ملاحظات إضافية تظهر بالفاتورة..." : "Additional notes..."} />
              </div>
            </div>

            {/* Items builder — shown for both booking and manual modes */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold">
                {lang === "ar" ? "بنود إضافية للفاتورة" : mode === "booking" ? "Additional Invoice Items (Optional)" : "Invoice Items"}
              </h4>
              {mode === "booking" && (
                <p className="text-xs text-muted-foreground -mt-1">
                  {lang === "ar" ? "يمكنك إضافة بنود إضافية فوق بنود الحجز الأساسية." : "You can add extra items on top of the booking's base items."}
                </p>
              )}

              {manualItems.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="py-2 h-8">{lang === "ar" ? "البيان" : "Description"}</TableHead>
                        <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "الكمية" : "Qty"}</TableHead>
                        <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "سعر الوحدة" : "Unit Price"}</TableHead>
                        <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "الإجمالي" : "Total"}</TableHead>
                        <TableHead className="py-2 h-8 text-end"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="py-1.5 text-xs">{item.description}</TableCell>
                          <TableCell className="py-1.5 text-xs text-end">{item.quantity}</TableCell>
                          <TableCell className="py-1.5 text-xs text-end">{fmt(item.unit_price)}</TableCell>
                          <TableCell className="py-1.5 text-xs text-end font-semibold">{fmt(item.quantity * item.unit_price)}</TableCell>
                          <TableCell className="py-1.5 text-xs text-end">
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeManualItem(index)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-muted/20 p-2.5 rounded-lg border border-border/40">
                <div className="sm:col-span-6 space-y-1">
                  <Label className="text-[10px]">{lang === "ar" ? "بيان الخدمة" : "Item Description"}</Label>
                  <Input className="h-8 text-xs" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder={lang === "ar" ? "وصف الخدمة..." : "Description..."} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px]">{lang === "ar" ? "الكمية" : "Qty"}</Label>
                  <Input className="h-8 text-xs text-end" type="number" min="1" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-[10px]">{lang === "ar" ? "سعر الوحدة" : "Unit Price"}</Label>
                  <Input className="h-8 text-xs text-end" type="number" step="0.01" min="0" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="sm:col-span-1">
                  <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={addManualItem}>{lang === "ar" ? "إضافة" : "Add"}</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenNew(false)}>{t("actions.cancel")}</Button>
            <Button onClick={createInvoice} disabled={busy || (mode === "booking" ? !bookingId : !mCustomer)}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editingInvoice} onOpenChange={(val) => !val && setEditingInvoice(null)}>
        <DialogContent className="max-w-2xl" dir={dir}>
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "تعديل الفاتورة" : "Edit Invoice"} · {editingInvoice?.invoice_number || editingInvoice?.invoice_no}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingInvoice?.invoice_type === "manual" ? (
                <>
                  <div className="space-y-2">
                    <Label>{t("inv.customer")}</Label>
                    <Select value={editCustomer} onValueChange={setEditCustomer}>
                      <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {customerList.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{name(c)} {c.code ? `(${c.code})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("inv.currency")}</Label>
                    <Select value={editCurrency} onValueChange={setEditCurrency}>
                      <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {currencyList.map((c: any) => (
                          <SelectItem key={c.id} value={c.code}>
                            {lang === "ar" ? c.name_ar : c.name_en} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="col-span-2 p-3 bg-muted/40 rounded-md text-xs border border-border/50">
                  <span className="font-semibold text-muted-foreground block mb-1">
                    {lang === "ar" ? "العميل والحجز المرتبط (مغلق)" : "Customer & Linked Booking (Locked)"}
                  </span>
                  <span>{name(editingInvoice?.customer)} (Booking: {editingInvoice?.booking?.booking_no})</span>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("inv.date")}</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("inv.due_date")}</Label>
                <Input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>{lang === "ar" ? "نسبة الضريبة (%)" : "Tax Percent (%)"}</Label>
                <Input type="number" step="0.01" value={editTax} onChange={(e) => setEditTax(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{lang === "ar" ? "الخصم" : "Discount"}</Label>
                <Input type="number" step="0.01" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} />
              </div>

              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>{lang === "ar" ? "ملاحظات الفاتورة" : "Invoice Notes"}</Label>
                <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder={lang === "ar" ? "ملاحظات إضافية..." : "Notes..."} />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>{lang === "ar" ? "حالة الفاتورة" : "Invoice Status"}</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{lang === "ar" ? "مسودة" : "Draft"}</SelectItem>
                    <SelectItem value="issued">{lang === "ar" ? "صدرت" : "Issued"}</SelectItem>
                    <SelectItem value="sent">{lang === "ar" ? "مرسلة للعميل" : "Sent"}</SelectItem>
                    <SelectItem value="partially_paid">{lang === "ar" ? "مدفوعة جزئياً" : "Partially Paid"}</SelectItem>
                    <SelectItem value="paid">{lang === "ar" ? "مدفوعة" : "Paid"}</SelectItem>
                    <SelectItem value="overdue">{lang === "ar" ? "متأخرة" : "Overdue"}</SelectItem>
                    <SelectItem value="cancelled">{lang === "ar" ? "ملغاة" : "Cancelled"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {true && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-semibold">{lang === "ar" ? "بنود الفاتورة" : "Invoice Items"}</h4>

                {editItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="py-2 h-8">{lang === "ar" ? "البيان" : "Description"}</TableHead>
                          <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "الكمية" : "Qty"}</TableHead>
                          <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "سعر الوحدة" : "Unit Price"}</TableHead>
                          <TableHead className="py-2 h-8 text-end">{lang === "ar" ? "الإجمالي" : "Total"}</TableHead>
                          <TableHead className="py-2 h-8 text-end"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="py-1.5 text-xs">{item.description}</TableCell>
                            <TableCell className="py-1.5 text-xs text-end">{item.quantity}</TableCell>
                            <TableCell className="py-1.5 text-xs text-end">{fmt(item.unit_price)}</TableCell>
                            <TableCell className="py-1.5 text-xs text-end font-semibold">{fmt(item.quantity * item.unit_price)}</TableCell>
                            <TableCell className="py-1.5 text-xs text-end">
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeEditItem(index)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <div className="sm:col-span-6 space-y-1">
                    <Label className="text-[10px]">{lang === "ar" ? "بيان الخدمة" : "Item Description"}</Label>
                    <Input className="h-8 text-xs" value={editNewItemDesc} onChange={(e) => setEditNewItemDesc(e.target.value)} placeholder={lang === "ar" ? "وصف الخدمة..." : "Description..."} />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[10px]">{lang === "ar" ? "الكمية" : "Qty"}</Label>
                    <Input className="h-8 text-xs text-end" type="number" min="1" value={editNewItemQty} onChange={(e) => setEditNewItemQty(e.target.value)} />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <Label className="text-[10px]">{lang === "ar" ? "سعر الوحدة" : "Unit Price"}</Label>
                    <Input className="h-8 text-xs text-end" type="number" step="0.01" min="0" value={editNewItemPrice} onChange={(e) => setEditNewItemPrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="sm:col-span-1">
                    <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={addEditItem}>{lang === "ar" ? "إضافة" : "Add"}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInvoice(null)}>{t("actions.cancel")}</Button>
            <Button onClick={handleSaveEdit} disabled={busy}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invoice Confirmation Dialog */}
      <Dialog open={!!invoiceToDelete} onOpenChange={(val) => !val && setInvoiceToDelete(null)}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {lang === "ar" ? "تأكيد حذف الفاتورة" : "Confirm Invoice Deletion"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {lang === "ar"
              ? "هل أنت متأكد من رغبتك في حذف هذه الفاتورة نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
              : "Are you sure you want to permanently delete this invoice? This action cannot be undone."}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceToDelete(null)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>{t("actions.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
