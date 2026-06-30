import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasAnyRole } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataPagination } from "@/components/data-pagination";
import { KpiCard } from "@/components/list-toolkit";
import {
  Plus,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  FileEdit,
  Loader2,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  useGetPlatformTransactionsQuery,
  useGetPlatformTransactionsStatisticsQuery,
  useCreatePlatformTransactionMutation,
  useUpdatePlatformTransactionMutation,
  useDeletePlatformTransactionMutation,
} from "@/store/api";
import { apiClient } from "@/lib/api/api-client";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PAGE_SIZE = 15;
const WRITE_ROLES = ["super_admin", "admin", "finance_manager"] as const;
const CATEGORIES = ["rent", "salaries", "utilities", "electricity", "maintenance", "marketing", "office_supplies", "hotel_booking", "supplier_payout", "other"] as const;

export default function PlatformTransactionsList() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const canWrite = hasAnyRole(auth, [...WRITE_ROLES]);

  // Filters state
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  // Dialogs state
  const [openNew, setOpenNew] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | number | null>(null);

  // Form state
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formCategory, setFormCategory] = useState("rent");
  const [customCategory, setCustomCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("SAR");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDesc, setFormDesc] = useState("");
  const [formMethod, setFormMethod] = useState("bank_transfer");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Currencies lookup
  const currencies = useQuery({
    queryKey: ["lookup-currencies"],
    queryFn: async () => (await apiClient.currencies.getAll()) ?? [],
  });

  const currencyList = useMemo(() => {
    if (!currencies.data) return [];
    if (Array.isArray(currencies.data)) return currencies.data;
    const cData = currencies.data as any;
    if (Array.isArray(cData.data)) return cData.data;
    return [];
  }, [currencies.data]);

  // RTK Query hooks
  const { data: statsData, refetch: refetchStats } = useGetPlatformTransactionsStatisticsQuery();
  const { data: transactionsData, isLoading, refetch: refetchList } = useGetPlatformTransactionsQuery({
    page,
    per_page: PAGE_SIZE,
    type: type !== "all" ? type : undefined,
    category: category !== "all" ? category : undefined,
    start_date: from || undefined,
    end_date: to || undefined,
    search: dSearch.trim() || undefined,
  });

  const [createTransaction] = useCreatePlatformTransactionMutation();
  const [updateTransaction] = useUpdatePlatformTransactionMutation();
  const [deleteTransaction] = useDeletePlatformTransactionMutation();

  const listRows = useMemo(() => {
    if (!transactionsData) return [];
    return Array.isArray(transactionsData) ? transactionsData : transactionsData.data ?? [];
  }, [transactionsData]);

  const listCount = useMemo(() => {
    if (!transactionsData) return 0;
    if (Array.isArray(transactionsData)) return transactionsData.length;
    const d = transactionsData as any;
    return d.total ?? d.count ?? (Array.isArray(d.data) ? d.data.length : 0);
  }, [transactionsData]);

  const refreshData = () => {
    refetchStats();
    refetchList();
  };

  const handleOpenNew = () => {
    setFormType("expense");
    setFormCategory("rent");
    setCustomCategory("");
    setFormAmount("");
    setFormCurrency("SAR");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDesc("");
    setFormMethod("bank_transfer");
    setFormFile(null);
    setOpenNew(true);
  };

  const handleOpenEdit = (tRow: any) => {
    setEditingTransaction(tRow);
    setFormType(tRow.type);
    const hasCat = CATEGORIES.includes(tRow.category);
    setFormCategory(hasCat ? tRow.category : "other");
    setCustomCategory(hasCat ? "" : (tRow.category ?? ""));
    setFormAmount(String(tRow.amount));

    const curCode = typeof tRow.currency === "object" ? tRow.currency?.code : (tRow.currency ?? "SAR");
    setFormCurrency(curCode);

    setFormDate(tRow.transaction_date ? new Date(tRow.transaction_date).toISOString().slice(0, 10) : "");
    setFormDesc(tRow.description ?? "");
    setFormMethod(tRow.payment_method ?? "bank_transfer");
    setFormFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      toast.error(lang === "ar" ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount");
      return;
    }

    setBusy(true);
    try {
      const selectedCurrencyObj = currencyList.find((c: any) => c.code === formCurrency || c.id === Number(formCurrency));
      const currencyId = selectedCurrencyObj ? Number(selectedCurrencyObj.id) : 3;

      const fd = new FormData();
      fd.append("type", formType);
      fd.append("category", formCategory === "other" ? customCategory.trim() : formCategory);
      fd.append("amount", formAmount);
      fd.append("currency_id", String(currencyId));
      fd.append("transaction_date", formDate);
      fd.append("description", formDesc);
      fd.append("payment_method", formMethod);
      if (formFile) {
        fd.append("receipt_image", formFile);
      }

      if (editingTransaction) {
        await updateTransaction({ id: editingTransaction.id, body: fd }).unwrap();
        toast.success(lang === "ar" ? "تم تعديل المعاملة بنجاح" : "Transaction updated successfully");
        setEditingTransaction(null);
      } else {
        await createTransaction(fd).unwrap();
        toast.success(lang === "ar" ? "تم إضافة المعاملة بنجاح" : "Transaction created successfully");
        setOpenNew(false);
      }
      refreshData();
    } catch (err: any) {
      toast.error(err.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete).unwrap();
      toast.success(lang === "ar" ? "تم حذف المعاملة بنجاح" : "Transaction deleted successfully");
      setTransactionToDelete(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || t("label.error", "Error"));
    }
  };

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);
  const fmt = (n: number) => new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", { minimumFractionDigits: 2 }).format(n || 0);

  return (
    <>
      <PageHeader
        title={ar("معاملات المنصة المالية", "Platform Financial Transactions")}
        subtitle={ar(`إجمالي المعاملات: ${listCount}`, `Total Transactions: ${listCount}`)}
        children={
          canWrite && (
            <Button size="sm" onClick={handleOpenNew} className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              {ar("إضافة معاملة جديدة", "Add Transaction")}
            </Button>
          )
        }
      />

      <div className="space-y-5 p-4 sm:p-6" dir={dir}>
        {/* Statistics / KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">{ar("إجمالي الإيرادات", "Total Income")}</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-1">
                  {statsData ? fmt(statsData.total_income_sar) + " SAR" : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">{ar("إجمالي المصروفات", "Total Expense")}</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 tabular-nums mt-1">
                  {statsData ? fmt(statsData.total_expense_sar) + " SAR" : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={statsData && statsData.net_profit_sar >= 0 ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={statsData && statsData.net_profit_sar >= 0 ? "p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full" : "p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full"}>
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className={statsData && statsData.net_profit_sar >= 0 ? "text-sm font-medium text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider" : "text-sm font-medium text-red-600/80 dark:text-red-400/80 uppercase tracking-wider"}>
                  {ar("صافي الربح / الخسارة", "Net Profit / Loss")}
                </p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${statsData && statsData.net_profit_sar >= 0 ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300"}`}>
                  {statsData ? fmt(statsData.net_profit_sar) + " SAR" : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{ar("البحث", "Search")}</Label>
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="ps-8 h-9"
                  placeholder={ar("البحث بالبيان أو التصنيف...", "Search description...")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{ar("النوع", "Type")}</Label>
              <Select
                value={type}
                onValueChange={(val: any) => {
                  setType(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar("الكل", "All")}</SelectItem>
                  <SelectItem value="income">{ar("إيراد", "Income")}</SelectItem>
                  <SelectItem value="expense">{ar("مصروف", "Expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{ar("التصنيف", "Category")}</Label>
              <Select
                value={category}
                onValueChange={(val: any) => {
                  setCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar("كل التصنيفات", "All Categories")}</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {ar(
                        c === "rent" ? "إيجار"
                        : c === "salaries" ? "رواتب"
                        : c === "utilities" ? "خدمات ومرافق"
                        : c === "electricity" ? "كهرباء"
                        : c === "maintenance" ? "صيانة"
                        : c === "marketing" ? "تسويق"
                        : c === "office_supplies" ? "أدوات مكتبية"
                        : c === "hotel_booking" ? "حجز فندق"
                        : c === "supplier_payout" ? "مستحقات موردين"
                        : "أخرى",
                        c
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{ar("من تاريخ", "From Date")}</Label>
              <Input
                type="date"
                className="h-9"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{ar("إلى تاريخ", "To Date")}</Label>
              <Input
                type="date"
                className="h-9"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar("التاريخ", "Date")}</TableHead>
                    <TableHead>{ar("النوع", "Type")}</TableHead>
                    <TableHead>{ar("التصنيف", "Category")}</TableHead>
                    <TableHead>{ar("البيان / الوصف", "Description")}</TableHead>
                    <TableHead>{ar("المبلغ", "Amount")}</TableHead>
                    <TableHead>{ar("طريقة الدفع", "Method")}</TableHead>
                    <TableHead>{ar("المرفق", "Attachment")}</TableHead>
                    {canWrite && <TableHead className="text-end">{ar("العمليات", "Actions")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          {t("label.loading")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && listRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        {t("label.no_results")}
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    listRows.map((r: any) => {
                      const curCode = typeof r.currency === "object" ? r.currency?.code : (r.currency ?? "SAR");
                      return (
                        <TableRow key={r.id} className="whitespace-nowrap">
                          <TableCell className="text-xs">{formatDate(r.transaction_date, lang)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={r.type === "income" ? "default" : "destructive"}
                              className={
                                r.type === "income" ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""
                              }
                            >
                              {lang === "ar" ? (r.type_text || (r.type === "income" ? "إيراد" : "مصروف")) : r.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {lang === "ar" ? (r.category_text || r.category) : r.category}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate" title={r.description}>
                            {r.description || "—"}
                          </TableCell>
                          <TableCell className="text-sm font-bold tabular-nums">
                            <div>{fmt(Number(r.amount))} <span className="text-muted-foreground font-normal text-xs">{curCode}</span></div>
                            {r.amount_sar !== undefined && r.currency?.code && r.currency.code !== "SAR" && (
                              <div className="text-xs text-muted-foreground">{fmt(Number(r.amount_sar))} SAR</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {ar(
                              r.payment_method === "cash"
                                ? "نقدي"
                                : r.payment_method === "bank_transfer"
                                  ? "تحويل بنكي"
                                  : r.payment_method === "credit_card"
                                    ? "بطاقة ائتمان"
                                    : r.payment_method === "cheque"
                                      ? "شيك"
                                      : "أخرى",
                              r.payment_method
                            )}
                          </TableCell>
                          <TableCell>
                            {r.receipt_image ? (
                              <a
                                href={r.receipt_image}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <Paperclip className="h-3 w-3" />
                                {ar("عرض المرفق", "View file")}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          {canWrite && (
                            <TableCell className="text-end">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEdit(r)}
                                  className="h-8 w-8 text-primary hover:bg-primary/10"
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setTransactionToDelete(r.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            {listCount > PAGE_SIZE && (
              <div className="p-4 border-t">
                <DataPagination
                  total={listCount}
                  pageSize={PAGE_SIZE}
                  page={page}
                  onPage={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={openNew || !!editingTransaction}
        onOpenChange={(v) => {
          if (!v) {
            setOpenNew(false);
            setEditingTransaction(null);
          }
        }}
      >
        <DialogContent className="max-w-md" dir={dir}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction
                  ? ar("تعديل المعاملة المالية", "Edit Transaction")
                  : ar("إضافة معاملة مالية جديدة", "Add Transaction")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{ar("نوع المعاملة", "Transaction Type")}</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType("expense")}
                      className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                        formType === "expense"
                          ? "bg-red-500 border-red-500 text-white"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {ar("مصروف", "Expense")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("income")}
                      className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                        formType === "income"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {ar("إيراد", "Income")}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{ar("التصنيف", "Category")}</Label>
                  <Select value={formCategory} onValueChange={(val: any) => setFormCategory(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {ar(
                            c === "rent"
                              ? "إيجار"
                              : c === "salaries"
                                ? "رواتب"
                                : c === "utilities"
                                  ? "خدمات ومرافق"
                                  : c === "electricity"
                                    ? "كهرباء"
                                    : c === "maintenance"
                                      ? "صيانة"
                                      : c === "marketing"
                                        ? "تسويق"
                                        : c === "office_supplies"
                                          ? "أدوات مكتبية"
                                          : c === "hotel_booking"
                                            ? "حجز فندق"
                                            : c === "supplier_payout"
                                              ? "مستحقات موردين"
                                              : "أخرى",
                            c
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formCategory === "other" && (
                <div className="flex flex-col gap-1.5 border-l-2 border-primary pl-3 mt-1">
                  <Label>{ar("اسم التصنيف المخصص", "Custom Category Name")}</Label>
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={ar("مثال: electricity", "e.g., electricity")}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{ar("المبلغ", "Amount")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{ar("العملة", "Currency")}</Label>
                  <Select value={formCurrency} onValueChange={(val) => setFormCurrency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyList.map((c: any) => (
                        <SelectItem key={c.id} value={c.code}>
                          {lang === "ar" ? c.name_ar : c.name_en} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{ar("تاريخ المعاملة", "Transaction Date")}</Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{ar("طريقة الدفع", "Payment Method")}</Label>
                  <Select value={formMethod} onValueChange={(val) => setFormMethod(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">{ar("تحويل بنكي", "Bank Transfer")}</SelectItem>
                      <SelectItem value="cash">{ar("نقدي", "Cash")}</SelectItem>
                      <SelectItem value="credit_card">{ar("بطاقة ائتمان", "Credit Card")}</SelectItem>
                      <SelectItem value="cheque">{ar("شيك", "Cheque")}</SelectItem>
                      <SelectItem value="other">{ar("أخرى", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{ar("البيان / الوصف", "Description")}</Label>
                <Input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={ar("وصف وتفاصيل المعاملة...", "Transaction notes...")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{ar("صورة الإيصال / المرفق (اختياري)", "Receipt Image (Optional)")}</Label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 px-4 py-5 text-sm cursor-pointer hover:bg-muted/40 hover:border-primary/50 transition-colors">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground text-center">
                    {formFile
                      ? <span className="text-foreground font-medium">{formFile.name}</span>
                      : ar("اضغط لاختيار صورة الإيصال (PNG, JPG, PDF)", "Click to upload receipt (PNG, JPG, PDF)")}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFormFile(file ?? null);
                    }}
                  />
                </label>
                {editingTransaction?.receipt_image && !formFile && (
                  <div className="mt-1 text-xs">
                    <a
                      href={editingTransaction.receipt_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      {ar("عرض الملف الحالي", "View current file")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpenNew(false);
                  setEditingTransaction(null);
                }}
              >
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="me-1 h-4 w-4" />
                )}
                {editingTransaction ? t("actions.save") : t("actions.add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={transactionToDelete !== null}
        onOpenChange={(v) => {
          if (!v) setTransactionToDelete(null);
        }}
        title={ar("حذف المعاملة؟", "Delete Transaction?")}
        description={ar(
          "هل أنت متأكد من أنك تريد حذف هذه المعاملة المالية نهائياً؟",
          "Are you sure you want to permanently delete this transaction?"
        )}
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
