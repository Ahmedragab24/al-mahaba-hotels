import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient, apiClient, useQuery } from "@/store/queryBridge";
import { useGetQuotationsQuery, useDeleteQuotationMutation, useUpdateQuotationMutation } from "@/store/api";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import {
  Plus, Eye, X, FileText, ThumbsUp, Pencil, Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/format";



const PAGE_SIZE = 20;


export function QStatusBadge({ status, status_text, is_expired, t, lang }: { status: string; status_text?: string; is_expired?: boolean; t: (k: string, f?: string) => string; lang: string }) {
  // Use status_text from API if available, otherwise use is_expired to determine display
  const isActuallyExpired = is_expired || status === "expired";
  const displayText = status_text || (isActuallyExpired ? (lang === "ar" ? "منتهي" : "Expired") : (lang === "ar" ? "صالح" : "Valid"));
  
  const variant = isActuallyExpired ? "destructive" : "default";
  const cls = !isActuallyExpired ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{displayText}</Badge>;
}

export default function QuotationsList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = canWriteModule(auth, "quotations");

  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [deleteQuotation] = useDeleteQuotationMutation();

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

  const list = useGetQuotationsQuery({ lang, status: status !== "all" ? status : undefined, hotel_id: hotel !== "all" ? hotel : undefined, customer_id: customer !== "all" ? customer : undefined });

  // Handle response structure - data may be nested in a data property
  const rows = Array.isArray(list.data)
    ? list.data
    : (Array.isArray((list.data as any)?.data)
        ? (list.data as any).data
        : (Array.isArray((list.data as any)?.data?.data)
            ? (list.data as any).data.data
            : []));
  const total = rows.length;
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
                  <SelectItem value="valid">{lang === "ar" ? "صالح" : "Valid"}</SelectItem>
                  <SelectItem value="expired">{lang === "ar" ? "منتهي" : "Expired"}</SelectItem>
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
                {!list.isLoading && rows.length === 0 && (
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
                {rows.map((q: any) => {
                  const customerName = q.customer ? (lang === "ar" ? (q.customer.name_ar || q.customer.name_en) : (q.customer.name_en || q.customer.name_ar)) : "—";
                  
                  const uniqueHotelIds = Array.from(new Set((q.items || []).map((item: any) => item.hotel_id).filter(Boolean)));
                  const hotelNames = uniqueHotelIds
                    .map((hid: any) => {
                      const hObj = hotels.data?.find((h: any) => h.id === Number(hid));
                      if (!hObj) return null;
                      return lang === "ar" ? hObj.name_ar || hObj.name_en : hObj.name_en || hObj.name_ar;
                    })
                    .filter((x: any): x is string => typeof x === "string" && x.length > 0)
                    .join(lang === "ar" ? "، " : ", ");
                  const hotelName = hotelNames || "—";

                  const itemStartDates = (q.items || []).map((item: any) => item.start_date).filter(Boolean);
                  const itemEndDates = (q.items || []).map((item: any) => item.end_date).filter(Boolean);
                  const startDate = itemStartDates.length > 0 ? itemStartDates.sort()[0] : null;
                  const endDate = itemEndDates.length > 0 ? itemEndDates.sort().reverse()[0] : null;

                  const currencyCode = typeof q.currency === 'object' ? q.currency?.code : q.currency;
                  const currencySymbol = lang === "ar" ? (typeof q.currency === 'object' ? q.currency?.symbol_ar : q.currency) : (typeof q.currency === 'object' ? q.currency?.symbol_en : q.currency);
                  
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
                      <TableCell className="text-sm font-medium">{customerName}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={hotelName}>{hotelName}</TableCell>
                      <TableCell style={{ direction: 'ltr' }} className="text-xs">{startDate ? formatDate(startDate, lang) : "—"}</TableCell>
                      <TableCell style={{ direction: 'ltr' }} className="text-xs">{endDate ? formatDate(endDate, lang) : "—"}</TableCell>
                      <TableCell dir="ltr" style={{ direction: 'ltr' }} className="text-xs font-semibold tabular-nums">
                        {fmt(q.total_value || 0)} <span className="text-muted-foreground font-normal">{currencySymbol || currencyCode}</span>
                      </TableCell>
                      <TableCell><QStatusBadge status={q.status} status_text={q.status_text} is_expired={q.is_expired} t={t} lang={lang} /></TableCell>
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
        onConfirm={() => confirmDelete && deleteQuotation({ id: confirmDelete, lang }).unwrap().then(() => {
          toast.success(lang === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
          setConfirmDelete(null);
        }).catch((e: any) => {
          toast.error(e?.message || (lang === "ar" ? "حدث خطأ" : "Error occurred"));
          setConfirmDelete(null);
        })}
      />
    </>
  );
}
