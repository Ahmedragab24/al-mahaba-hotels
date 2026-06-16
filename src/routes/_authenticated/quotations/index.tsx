import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import {
  Plus, Search, Eye, X, FileText, Clock, CheckCircle2, ThumbsUp, XCircle, DollarSign,
  CalendarClock, AlertTriangle,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KpiCard, StatusPill, type KpiTone } from "@/components/list-toolkit";

export const Route = createFileRoute("/_authenticated/quotations/")({
  component: QuotationsList,
});

const PAGE_SIZE = 20;


export function QStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive"
    : status === "draft" || status === "expired" ? "outline"
      : "default";
  const cls = status === "approved" || status === "accepted" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`qstatus.${status}`)}</Badge>;
}

function QuotationsList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent"]);

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [creator, setCreator] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const filtersActive = !!(dSearch || customer !== "all" || status !== "all" || hotel !== "all" || creator !== "all" || from || to);
  const resetAll = () => { setSearch(""); setCustomer("all"); setStatus("all"); setHotel("all"); setCreator("all"); setFrom(""); setTo(""); setPage(1); };
  const setStatusAndReset = (s: string) => { setStatus(s); setPage(1); };

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
  });
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
  });
  const creators = useQuery({
    queryKey: ["lookup-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id,email")).data ?? [],
  });

  const metrics = useQuery({
    queryKey: ["quotes-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("quotations").select("status, expiry_date, items:quotation_items(total_selling)").is("deleted_at", null);
      const rows = data ?? [];
      const sum = rows.reduce((a, r: any) => a + (r.items ?? []).reduce((x: number, i: any) => x + Number(i.total_selling), 0), 0);
      const by = (...s: string[]) => rows.filter((r: any) => s.includes(r.status)).length;
      const today = new Date().toISOString().slice(0, 10);
      const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const expiringSoon = rows.filter((r: any) => r.status === "sent" && r.expiry_date && r.expiry_date >= today && r.expiry_date <= in7).length;
      return {
        total: rows.length,
        draft: by("draft"),
        pending: by("pending_approval"),
        approved: by("approved"),
        sent: by("sent"),
        accepted: by("accepted"),
        rejected: by("rejected", "cancelled"),
        expired: by("expired"),
        expiringSoon,
        value: sum,
      };
    },
  });

  const list = useQuery({
    queryKey: ["quotations", { dSearch, customer, status, hotel, creator, from, to, page }],
    queryFn: async () => {
      let ids: string[] | null = null;
      if (hotel !== "all") {
        const { data } = await supabase.from("quotation_items").select("quotation_id").eq("hotel_id", hotel);
        ids = Array.from(new Set((data ?? []).map((x: any) => x.quotation_id)));
        if (ids.length === 0) return { rows: [], count: 0 };
      }
      let q = supabase.from("quotations").select(
        "id,quotation_no,status,currency,quotation_date,travel_date,expiry_date,created_by,created_at,deleted_at,is_recommended,customer:customers(name_en,name_ar),items:quotation_items(total_selling)",
        { count: "exact" },
      ).is("deleted_at", null);
      if (ids) q = q.in("id", ids);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (creator !== "all") q = q.eq("created_by", creator);
      if (from) q = q.gte("quotation_date", from);
      if (to) q = q.lte("quotation_date", to);
      if (dSearch.trim()) q = q.ilike("quotation_no", `%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const total = list.data?.count ?? 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const creatorName = (id: string | null) => creators.data?.find((p: any) => p.id === id)?.email ?? "—";
  const actions = useMemo(() => canWrite && (
    <Button size="sm" onClick={() => navigate({ to: "/quotations/new" })}>
      <Plus className="h-4 w-4" /> {t("quotes.new")}
    </Button>
  ), [canWrite, navigate, t]);

  const quickFilters: { key: string; label: string; count?: number; tone: KpiTone }[] = [
    { key: "all", label: t("filter.all"), count: metrics.data?.total, tone: "primary" },
    { key: "draft", label: t("qstatus.draft"), count: metrics.data?.draft, tone: "muted" },
    { key: "pending_approval", label: t("qstatus.pending_approval"), count: metrics.data?.pending, tone: "warning" },
    { key: "approved", label: t("qstatus.approved"), count: metrics.data?.approved, tone: "success" },
    { key: "sent", label: t("qstatus.sent"), count: metrics.data?.sent, tone: "info" },
    { key: "accepted", label: t("qstatus.accepted"), count: metrics.data?.accepted, tone: "success" },
    { key: "rejected", label: t("qstatus.rejected"), count: metrics.data?.rejected, tone: "destructive" },
    { key: "expired", label: t("qstatus.expired"), count: metrics.data?.expired, tone: "muted" },
  ];

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title={t("quotes.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={actions}
      />
      <div className="space-y-5 p-4 sm:p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={FileText} tone="primary" label={t("dash.quotes_total")} value={metrics.data?.total} active={status === "all"} onClick={() => setStatusAndReset("all")} />
          <KpiCard icon={Clock} tone="warning" label={t("dash.quotes_pending")} value={metrics.data?.pending} active={status === "pending_approval"} onClick={() => setStatusAndReset("pending_approval")} />
          <KpiCard icon={CheckCircle2} tone="info" label={t("dash.quotes_approved")} value={metrics.data?.approved} active={status === "approved"} onClick={() => setStatusAndReset("approved")} />
          <KpiCard icon={ThumbsUp} tone="success" label={t("dash.quotes_accepted")} value={metrics.data?.accepted} active={status === "accepted"} onClick={() => setStatusAndReset("accepted")} />
          <KpiCard icon={XCircle} tone="destructive" label={t("dash.quotes_rejected")} value={metrics.data?.rejected} active={status === "rejected"} onClick={() => setStatusAndReset("rejected")} />
          <KpiCard icon={DollarSign} tone="warning" label={t("dash.quotes_value")} value={metrics.data ? fmt(metrics.data.value) : undefined} />
        </div>

        {/* Expiring soon banner */}
        {(metrics.data?.expiringSoon ?? 0) > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="flex-1">
              <strong>{metrics.data!.expiringSoon}</strong> {t("quotes.expiring_soon", "عروض ستنتهي صلاحيتها خلال 7 أيام")}
            </span>
            <Button size="sm" variant="outline" onClick={() => setStatusAndReset("sent")}>
              {t("actions.view")}
            </Button>
          </div>
        )}

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
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative flex-1">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("quotes.number")} className="ps-8" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("quotes.customer")}</Label>
              <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.customer")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("filter.hotel")}</Label>
              <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {hotels.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-muted-foreground">{t("quotes.creator")}</Label>
              <Select value={creator} onValueChange={(v) => { setCreator(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.creator")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {creators.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2">
              <div className="flex items-center gap-2">
                <Label className="shrink-0 text-muted-foreground">{t("filter.from")}</Label>
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="shrink-0 text-muted-foreground">{t("filter.to")}</Label>
                <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-full" />
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
                  <TableHead>{t("quotes.number")}</TableHead>
                  <TableHead>{t("quotes.customer")}</TableHead>
                  <TableHead>{t("quotes.quotation_date")}</TableHead>
                  <TableHead>{t("quotes.expiry_date")}</TableHead>
                  <TableHead className="text-end">{t("quotes.value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead>{t("quotes.creator")}</TableHead>
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
                          <Button size="sm" onClick={() => navigate({ to: "/quotations/new" })}>
                            <Plus className="h-4 w-4" /> {t("quotes.new")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {list.data?.rows.map((q: any) => {
                  const value = (q.items ?? []).reduce((a: number, i: any) => a + Number(i.total_selling), 0);
                  const expiringSoon = q.status === "sent" && q.expiry_date && q.expiry_date >= today
                    && (new Date(q.expiry_date).getTime() - new Date(today).getTime()) / 86400000 <= 7;
                  return (
                    <TableRow
                      key={q.id}
                      className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate({ to: "/quotations/$id", params: { id: q.id } })}
                    >
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Link to="/quotations/$id" params={{ id: q.id }} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            {q.quotation_no}
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
                      <TableCell dir="ltr" className="text-xs">{formatDate(q.quotation_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">
                        <span className={cn("inline-flex items-center gap-1", expiringSoon && "font-semibold text-amber-600 dark:text-amber-400")}>
                          {expiringSoon && <CalendarClock className="h-3 w-3" />}
                          {formatDate(q.expiry_date, lang)}
                        </span>
                      </TableCell>
                      <TableCell dir="ltr" className="text-end text-xs font-semibold tabular-nums">
                        {fmt(value)} <span className="text-muted-foreground font-normal">{q.currency}</span>
                      </TableCell>
                      <TableCell><QStatusBadge status={q.status} t={t} /></TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium truncate max-w-[180px]">{creatorName(q.created_by)}</div>
                        <div dir="ltr" className="text-muted-foreground">{formatDateTime(q.created_at, lang)}</div>
                      </TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/quotations/$id" params={{ id: q.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
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
    </>
  );
}
