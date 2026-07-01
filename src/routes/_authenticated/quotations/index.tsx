import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
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
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import {
  Plus, Search, Eye, X, FileText, Clock, CheckCircle2, ThumbsUp, XCircle, DollarSign,
  CalendarClock, AlertTriangle, Pencil, Trash2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KpiCard, StatusPill, type KpiTone } from "@/components/list-toolkit";



const PAGE_SIZE = 20;


export function QStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive"
    : status === "draft" || status === "expired" ? "outline"
      : "default";
  const cls = status === "approved" || status === "accepted" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`qstatus.${status}`)}</Badge>;
}

export default function QuotationsList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "sales_manager", "sales_agent"]);

  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const qc = useQueryClient();
  const { mutate: deleteQuote } = useMutation({
    mutationFn: (id: string) => apiClient.quotations.delete(id),
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
      qc.invalidateQueries({ queryKey: ["quotations"] });
      setConfirmDelete(null);
    },
    onError: (e: any) => {
      toast.error(e?.message || (lang === "ar" ? "حدث خطأ" : "Error occurred"));
      setConfirmDelete(null);
    }
  });

  const filtersActive = !!(customer !== "all" || status !== "all" || hotel !== "all");
  const resetAll = () => { setCustomer("all"); setStatus("all"); setHotel("all"); setPage(1); };
  const setStatusAndReset = (s: string) => { setStatus(s); setPage(1); };

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => {
      const response = await apiClient.customers.getAll();
      const data = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
      return data;
    },
  });
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => {
      const response = await apiClient.hotels.getAll();
      const data = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
      return data;
    },
  });

  const list = useQuery({
    queryKey: ["quotations", { lang, status, hotel, customer, page }],
    queryFn: async () => {
      const params: any = { lang };
      
      // Apply filters only if they are not "all"
      if (status !== "all") params.status = status;
      if (hotel !== "all") params.hotel_id = hotel;
      if (customer !== "all") params.customer_id = customer;
      
      const response = await apiClient.quotations.getAll(params);
      
      // Extract data from API response structure
      // api-client already unwraps { data: ... } so response is either the array or the full object
      let data: any[] = [];
      let totalCount = 0;
      
      if (Array.isArray(response)) {
        data = response;
        totalCount = data.length;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
        totalCount = response.total || response.statistics?.total_count || data.length;
      }
      
      // If no filters applied, return all data with pagination on client side
      if (status === "all" && hotel === "all" && customer === "all") {
        const f = (page - 1) * PAGE_SIZE;
        return {
          rows: data.slice(f, f + PAGE_SIZE),
          count: totalCount,
        };
      }
      
      // If paginated response from API
      return {
        rows: data,
        count: totalCount,
      };
    },
  });

  const total = list.data?.count ?? 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const actions = useMemo(() => canWrite && (
    <Button size="sm" onClick={() => navigate("/quotations/new")}>
      <Plus className="h-4 w-4" /> {t("quotes.new")}
    </Button>
  ), [canWrite, navigate, t]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title={t("quotes.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={actions}
      />
      <div className="space-y-5 p-4 sm:p-6">
        {/* Filters */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("quotes.customer")}</Label>
              <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder={t("filter.all")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : []).map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0 text-muted-foreground">{lang === "ar" ? "الفندق" : "Hotel"}</Label>
              <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder={t("filter.all")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : []).map((h: any) => (
                    <SelectItem key={h.id} value={String(h.id)}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("filter.status")}</Label>
              <Select value={status} onValueChange={setStatusAndReset}>
                <SelectTrigger><SelectValue placeholder={t("filter.all")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="draft">{t("qstatus.draft")}</SelectItem>
                  <SelectItem value="pending">{t("qstatus.pending")}</SelectItem>
                  <SelectItem value="approved">{t("qstatus.approved")}</SelectItem>
                  <SelectItem value="sent">{t("qstatus.sent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap bg-muted/40 hover:bg-muted/40">
                  <TableHead>{t("quotes.number")}</TableHead>
                  <TableHead>{t("quotes.customer")}</TableHead>
                  <TableHead>{lang === "ar" ? "الفندق" : "Hotel"}</TableHead>
                  <TableHead>{t("quotes.start_date")}</TableHead>
                  <TableHead>{t("quotes.end_date")}</TableHead>
                  <TableHead className="text-end">{t("quotes.value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                          <FileText className="h-7 w-7" />
                        </div>
                        <div className="text-sm font-medium">{t("label.no_results")}</div>
                        {filtersActive ? (
                          <Button variant="outline" size="sm" onClick={resetAll}>
                            <X className="h-4 w-4" /> {t("actions.reset")}
                          </Button>
                        ) : canWrite && (
                          <Button size="sm" onClick={() => navigate("/quotations/new")}>
                            <Plus className="h-4 w-4" /> {t("quotes.new")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {list.data?.rows.map((q: any) => {
                  return (
                    <TableRow
                      key={q.id}
                      className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/quotations/${q.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/quotations/${q.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            {q.code}
                          </Link>
                          {q.is_recommended && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 text-[10px] px-1 py-0 flex items-center gap-0.5">
                              <ThumbsUp className="h-2.5 w-2.5 fill-current" />
                              {lang === "ar" ? "موصى به" : "Recommended"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{q.customer ? (lang === "ar" ? (q.customer.name_ar || q.customer.name_en) : (q.customer.name_en || q.customer.name_ar)) : "—"}</TableCell>
                      <TableCell className="text-sm">{q.hotel ? (lang === "ar" ? (q.hotel.name_ar || q.hotel.name_en) : (q.hotel.name_en || q.hotel.name_ar)) : "—"}</TableCell>
                      <TableCell style={{ direction: 'ltr' }} className="text-xs">{formatDate(q.start_date, lang)}</TableCell>
                      <TableCell style={{ direction: 'ltr' }} className="text-xs">{formatDate(q.end_date, lang)}</TableCell>
                      <TableCell dir="ltr" style={{ direction: 'ltr' }} className="text-xs font-semibold tabular-nums">
                        {fmt(q.total_value || 0)} <span className="text-muted-foreground font-normal">{typeof q.currency === 'object' ? q.currency?.code : q.currency}</span>
                      </TableCell>
                      <TableCell><QStatusBadge status={q.status} t={t} /></TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/quotations/${q.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to={`/quotations/${q.id}?edit=1`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        {canWrite && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirmDelete(String(q.id))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
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

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title={t("actions.delete")}
        description={t("toast.confirm_delete", "هل أنت متأكد من الحذف؟")}
        destructive={true}
        onConfirm={() => confirmDelete && deleteQuote(confirmDelete)}
      />
    </>
  );
}
