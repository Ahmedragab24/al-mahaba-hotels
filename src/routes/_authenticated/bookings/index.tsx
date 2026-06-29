import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { useGetBookingsQuery, useDeleteBookingMutation } from "@/store/api";
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
  Plus, Search, Eye, X, CalendarCheck2, BedDouble, ClipboardList,
  CheckCircle2, LogIn, CheckCheck, XCircle, DollarSign, FileText, Hotel,
  Pencil, Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { KpiCard, StatusPill, type KpiTone } from "@/components/list-toolkit";



const PAGE_SIZE = 20;
export const BK_STATUSES = ["draft", "pending_confirmation", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"] as const;
export const BK_WRITE_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent"] as const;

export function BkStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "cancelled" || status === "no_show" ? "destructive"
    : status === "draft" || status === "checked_out" ? "outline"
      : "default";
  const cls = status === "confirmed" || status === "checked_in" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`bkstatus.${status}`)}</Badge>;
}


export default function BookingsList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, BK_WRITE_ROLES as any);

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const filtersActive = !!(dSearch || customer !== "all" || status !== "all" || hotel !== "all" || from || to);
  const resetAll = () => { setSearch(""); setCustomer("all"); setStatus("all"); setHotel("all"); setFrom(""); setTo(""); setPage(1); };

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => {
      const response = await apiClient.customers.getAll();
      return Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
    },
  });
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => {
      const response = await apiClient.hotels.getAll();
      return Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
    },
  });

  const { data: rawBookings, isLoading: isLoadingBookings, refetch } = useGetBookingsQuery();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id).unwrap();
      toast.success(t("toast.deleted"));
      setConfirmDeleteId(null);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || t("toast.error"));
    }
  };

  const allBookings = useMemo(() => {
    if (!rawBookings) return [];
    if (Array.isArray(rawBookings)) return rawBookings;
    const anyRaw = rawBookings as any;
    if (Array.isArray(anyRaw.data)) return anyRaw.data;
    if (anyRaw.data && Array.isArray(anyRaw.data.data)) return anyRaw.data.data;
    if (Array.isArray(anyRaw.rows)) return anyRaw.rows;
    if (Array.isArray(anyRaw.items)) return anyRaw.items;
    return [];
  }, [rawBookings]);

  const metrics = useMemo(() => {
    const backendStats = (rawBookings as any)?.statistics;
    if (backendStats) {
      const by = (...s: string[]) => allBookings.filter((r: any) => s.includes(r.status)).length;
      return {
        data: {
          total: backendStats.total_bookings_count,
          draft: by("draft"),
          pending: by("pending_confirmation"),
          confirmed: backendStats.confirmed_count,
          inHouse: backendStats.checked_in_count,
          completed: backendStats.checked_out_count,
          cancelled: backendStats.cancelled_no_show_count || by("cancelled", "no_show"),
          value: backendStats.total_sales_sar,
        },
        isLoading: isLoadingBookings,
      };
    }

    const sum = allBookings.reduce((a: number, r: any) => a + (r.total_amount !== undefined ? Number(r.total_amount) : (r.rooms ?? []).reduce((x: number, i: any) => x + Number(i.total_selling), 0)), 0);
    const by = (...s: string[]) => allBookings.filter((r: any) => s.includes(r.status)).length;
    return {
      data: {
        total: allBookings.length,
        draft: by("draft"),
        pending: by("pending_confirmation"),
        confirmed: by("confirmed"),
        inHouse: by("checked_in"),
        completed: by("checked_out"),
        cancelled: by("cancelled", "no_show"),
        value: sum,
      },
      isLoading: isLoadingBookings,
    };
  }, [rawBookings, allBookings, isLoadingBookings]);

  const list = useMemo(() => {
    let rows = allBookings;
    if (status !== "all") {
      rows = rows.filter((b: any) => b.status === status);
    }
    if (customer !== "all") {
      rows = rows.filter((b: any) => String(b.customer_id) === String(customer));
    }
    if (hotel !== "all") {
      rows = rows.filter((b: any) => String(b.hotel_id) === String(hotel) || (b.rooms ?? []).some((r: any) => String(r.hotel_id) === String(hotel)));
    }
    if (from) {
      rows = rows.filter((b: any) => b.booking_date >= from);
    }
    if (to) {
      rows = rows.filter((b: any) => b.booking_date <= to);
    }
    if (dSearch.trim()) {
      rows = rows.filter((b: any) => (b.code || b.booking_no)?.toLowerCase().includes(dSearch.trim().toLowerCase()));
    }
    
    const count = rows.length;
    const f = (page - 1) * PAGE_SIZE;
    return {
      data: {
        rows: rows.slice(f, f + PAGE_SIZE),
        count,
      },
      isLoading: isLoadingBookings,
    };
  }, [allBookings, status, customer, hotel, from, to, dSearch, page, isLoadingBookings]);

  const total = list.data?.count ?? 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const actions = useMemo(() => canWrite && (
    <Button size="sm" onClick={() => navigate("/bookings/new")}>
      <Plus className="h-4 w-4" /> {t("bk.new")}
    </Button>
  ), [canWrite, navigate, t]);

  const setStatusAndReset = (s: string) => { setStatus(s); setPage(1); };

  const quickFilters: { key: string; label: string; count?: number; tone: KpiTone }[] = [
    { key: "all", label: t("filter.all"), count: metrics.data?.total, tone: "primary" },
    { key: "draft", label: t("bkstatus.draft"), count: metrics.data?.draft, tone: "muted" },
    { key: "pending_confirmation", label: t("bkstatus.pending_confirmation"), count: metrics.data?.pending, tone: "warning" },
    { key: "confirmed", label: t("bkstatus.confirmed"), count: metrics.data?.confirmed, tone: "success" },
    { key: "checked_in", label: t("bkstatus.checked_in"), count: metrics.data?.inHouse, tone: "info" },
    { key: "checked_out", label: t("bkstatus.checked_out"), count: metrics.data?.completed, tone: "muted" },
    { key: "cancelled", label: t("bkstatus.cancelled"), count: metrics.data?.cancelled, tone: "destructive" },
  ];

  return (
    <>
      <PageHeader
        title={t("bk.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={actions}
      />
      <div className="space-y-5 p-4 sm:p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={ClipboardList} tone="primary" label={t("bk.kpi.total")} value={metrics.data?.total} active={status === "all"} onClick={() => setStatusAndReset("all")} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("bk.kpi.confirmed")} value={metrics.data?.confirmed} active={status === "confirmed"} onClick={() => setStatusAndReset("confirmed")} />
          <KpiCard icon={LogIn} tone="info" label={t("bk.kpi.in_house")} value={metrics.data?.inHouse} active={status === "checked_in"} onClick={() => setStatusAndReset("checked_in")} />
          <KpiCard icon={CheckCheck} tone="muted" label={t("bk.kpi.completed")} value={metrics.data?.completed} active={status === "checked_out"} onClick={() => setStatusAndReset("checked_out")} />
          <KpiCard icon={XCircle} tone="destructive" label={t("bk.kpi.cancelled")} value={metrics.data?.cancelled} active={status === "cancelled"} onClick={() => setStatusAndReset("cancelled")} />
          <KpiCard icon={DollarSign} tone="warning" label={t("bk.kpi.value")} value={metrics.data ? fmt(metrics.data.value) : undefined} />
        </div>

        {/* Quick status pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{t("bk.filter.quick")}:</span>
          {quickFilters.map((q) => (
            <StatusPill key={q.key} label={q.label} count={q.count} tone={q.tone} active={status === q.key} onClick={() => setStatusAndReset(q.key)} />
          ))}
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
                  {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.hotel")}</Label>
              <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {hotels.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">{t("filter.from")}</Label>
                <Input className="w-full justify-center" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">{t("filter.to")}</Label>
                <Input className="w-full justify-center" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
              </div>
            </div>
            
            {filtersActive && (
              <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
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
                  <TableHead>{t("bk.col.hotels")}</TableHead>
                  <TableHead>{t("bk.col.checkin")}</TableHead>
                  <TableHead className="text-center">{t("bk.col.nights")}</TableHead>
                  <TableHead>{t("bk.source")}</TableHead>
                  <TableHead className="text-end">{t("bk.value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                          <CalendarCheck2 className="h-7 w-7" />
                        </div>
                        <div className="text-sm font-medium">{t("label.no_results")}</div>
                        <div className="text-xs text-muted-foreground">{t("bk.no_results_hint")}</div>
                        {filtersActive && (
                          <Button variant="outline" size="sm" onClick={resetAll}>
                            <X className="h-4 w-4" /> {t("actions.reset")}
                          </Button>
                        )}
                        {!filtersActive && canWrite && (
                          <Button size="sm" onClick={() => navigate("/bookings/new")}>
                            <Plus className="h-4 w-4" /> {t("bk.new")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {list.data?.rows.map((b: any) => {
                  const value = b.total_amount !== undefined ? Number(b.total_amount) : (b.rooms ?? []).reduce((a: number, i: any) => a + Number(i.total_selling), 0);
                  const earliestCheckIn = b.check_in || (b.rooms ?? [])
                    .map((r: any) => r.check_in).filter(Boolean).sort()[0];
                  const latestCheckOut = b.check_out || (b.rooms ?? [])
                    .map((r: any) => r.check_out).filter(Boolean).sort().slice(-1)[0];
                  const nights = b.nights || (earliestCheckIn && latestCheckOut
                    ? Math.max(0, Math.round((new Date(latestCheckOut).getTime() - new Date(earliestCheckIn).getTime()) / 86400000))
                    : null);
                  
                  let hotelNames: string[] = [];
                  if (b.hotel) {
                    const hName = lang === "ar" ? (b.hotel.name_ar || b.hotel.name_en) : (b.hotel.name_en || b.hotel.name_ar);
                    if (hName) hotelNames.push(hName);
                  } else {
                    hotelNames = Array.from(new Set(
                      (b.rooms ?? [])
                        .map((r: any) => r.hotel ? (lang === "ar" ? (r.hotel.name_ar || r.hotel.name_en) : (r.hotel.name_en || r.hotel.name_ar)) : null)
                        .filter((x: any): x is string => typeof x === "string" && x.length > 0)
                    ));
                  }
                  return (
                    <TableRow
                      key={b.id}
                      className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/bookings/${b.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        <Link to={`/bookings/${b.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          {b.code || b.booking_no}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {b.customer ? (lang === "ar" ? (b.customer.name_ar || b.customer.name_en) : (b.customer.name_en || b.customer.name_ar)) : "—"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[220px]">
                        {hotelNames.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate">
                            <Hotel className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate" title={hotelNames.join(", ")}>
                              {hotelNames[0]}
                              {hotelNames.length > 1 && <span className="text-muted-foreground"> +{hotelNames.length - 1}</span>}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell dir="ltr" className="text-xs">
                        {earliestCheckIn ? formatDate(earliestCheckIn, lang) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {nights !== null ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium">
                            <BedDouble className="h-3 w-3" /> {nights}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {b.quotation_id ? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" /> {t("bk.source_quotation")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t("bk.source_direct")}</span>
                        )}
                      </TableCell>
                      <TableCell dir="ltr" className="text-end text-xs font-semibold tabular-nums">
                        {fmt(value)} <span className="text-muted-foreground font-normal">{typeof b.currency === "object" ? b.currency?.code : (b.currency || "SAR")}</span>
                      </TableCell>
                      <TableCell><BkStatusBadge status={b.status} t={t} /></TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                            <Link to={`/bookings/${b.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {canWrite && (
                            <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                              <Link to={`/bookings/${b.id}?edit=true`}><Pencil className="h-4 w-4 text-amber-600 dark:text-amber-500" /></Link>
                            </Button>
                          )}
                          {canWrite && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("actions.delete")}
                              onClick={() => setConfirmDeleteId(b.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title={t("actions.delete")}
        description={t("toast.confirm_delete") || "Are you sure you want to delete this booking?"}
        destructive
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
      />
    </>
  );
}
