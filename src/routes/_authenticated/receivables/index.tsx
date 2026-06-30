import { Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import { Search, Eye, X, Wallet, ArrowUpRight, Phone, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { KpiCard } from "@/components/list-toolkit";
import { BkStatusBadge } from "../bookings";

const PAGE_SIZE = 50; // Increased since we filter in memory

export default function ReceivablesList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const filtersActive = !!(dSearch || customer !== "all");
  const resetAll = () => { setSearch(""); setCustomer("all"); setPage(1); };

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await apiClient.customers.getAll()) ?? [],
  });

  const list = useQuery({
    queryKey: ["receivables-bookings", { dSearch, customer }],
    queryFn: async () => {
      // Fetch bookings where total_amount > 0 and status is not cancelled/no_show
      let q = db.from("bookings").select(
        "id, booking_no, status, currency, booking_date, check_in, total_amount, amount_paid, payment_mode, customer:customers(id, name_en, name_ar, phone)"
      )
        .is("deleted_at", null)
        .not("status", "in", '("draft","cancelled","no_show")')
        .gt("total_amount", 0);

      if (customer !== "all") q = q.eq("customer_id", customer);
      if (dSearch.trim()) q = q.ilike("booking_no", `%${dSearch.trim()}%`);

      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;

      // Filter locally for outstanding balance (total > paid)
      const rows = (data ?? []).filter((b: any) => {
        const total = Number(b.total_amount) || 0;
        const paid = Number(b.amount_paid) || 0;
        return total > paid;
      });

      return rows;
    },
  });

  const allRows: any[] = (list.data as any[]) ?? [];
  const totalItems = allRows.length;
  const paginatedRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Aggregate metrics
  const totalReceivables = allRows.reduce((sum, b) => sum + (Number(b.total_amount) - Number(b.amount_paid)), 0);
  const totalExpected = allRows.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalCollected = allRows.reduce((sum, b) => sum + Number(b.amount_paid), 0);

  const fmt = (n: number) => new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

  return (
    <>
      <PageHeader
        title={t("nav.receivables")}
        subtitle={ar("متابعة المبالغ المستحقة غير المسددة بالكامل", "Track outstanding unpaid balances")}
      />
      <div className="space-y-5 p-4 sm:p-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">{ar("إجمالي المستحقات (المتبقي)", "Total Receivables")}</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 tabular-nums mt-1">{fmt(totalReceivables)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">{ar("إجمالي المبيعات", "Total Expected")}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums mt-1">{fmt(totalExpected)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">{ar("المحصل فعلياً", "Total Collected")}</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-1">{fmt(totalCollected)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("bk.number")} className="ps-8 w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("bk.customer")}</Label>
              <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("bk.customer")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : []).map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {filtersActive && (
              <div className="flex items-center self-end pb-1 mt-auto">
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  <X className="h-4 w-4" /> {t("actions.reset")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap bg-muted/40 hover:bg-muted/40">
                  <TableHead>{t("bk.number")}</TableHead>
                  <TableHead>{t("bk.customer")}</TableHead>
                  <TableHead>{ar("الإجمالي", "Total Amount")}</TableHead>
                  <TableHead>{ar("المدفوع", "Paid")}</TableHead>
                  <TableHead className="font-bold text-red-600">{ar("المتبقي (المستحق)", "Remaining (Due)")}</TableHead>
                  <TableHead>{t("bk.col.checkin")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/50" />
                        <p>{ar("لا توجد مبالغ مستحقة", "No outstanding receivables")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRows.map((b: any) => {
                  const total = Number(b.total_amount) || 0;
                  const paid = Number(b.amount_paid) || 0;
                  const remaining = Math.max(total - paid, 0);
                  const customerName = b.customer ? (lang === "ar" ? (b.customer.name_ar || b.customer.name_en) : (b.customer.name_en || b.customer.name_ar)) : "—";

                  return (
                    <TableRow key={b.id} className="whitespace-nowrap cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/bookings/${b.id}`)}>
                      <TableCell className="font-mono text-xs">
                        <Link to={`/bookings/${b.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {b.booking_no}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{customerName}</span>
                          {b.customer?.phone && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> <span dir="ltr">{b.customer.phone}</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell dir="ltr" className="text-sm tabular-nums text-blue-600 font-semibold">{fmt(total)} <span className="text-xs text-muted-foreground font-normal">{typeof b.currency === "object" ? b.currency?.code : (b.currency || "SAR")}</span></TableCell>
                      <TableCell dir="ltr" className="text-sm tabular-nums text-emerald-600 font-semibold">{fmt(paid)} <span className="text-xs text-muted-foreground font-normal">{typeof b.currency === "object" ? b.currency?.code : (b.currency || "SAR")}</span></TableCell>
                      <TableCell dir="ltr" className="text-sm tabular-nums text-red-600 font-bold bg-red-50/50 dark:bg-red-950/10">{fmt(remaining)} <span className="text-xs text-muted-foreground font-normal">{typeof b.currency === "object" ? b.currency?.code : (b.currency || "SAR")}</span></TableCell>
                      <TableCell dir="ltr" className="text-xs">{b.check_in ? formatDate(b.check_in, lang) : "—"}</TableCell>
                      <TableCell><BkStatusBadge status={b.status} t={t} /></TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/bookings/${b.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <DataPagination page={page} pageSize={PAGE_SIZE} total={totalItems} onPage={setPage} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export { ReceivablesList as Component };
