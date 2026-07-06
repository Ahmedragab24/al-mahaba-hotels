import { Link, useNavigate } from "react-router-dom";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useState, useMemo } from "react";
import { useQuery } from "@/store/queryBridge";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/data-pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Eye, X, Mailbox, Hourglass, PackageCheck, CheckCircle2, XCircle,
  Timer, MapPin, Users,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { KpiCard, StatusPill, type KpiTone } from "@/components/list-toolkit";

const PAGE_SIZE = 20;

export function RStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive"
    : status === "draft" || status === "expired" ? "outline"
      : "default";
  const cls = status === "approved" || status === "completed" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`rstatus.${status}`)}</Badge>;
}

export default function RfqList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = canWriteModule(auth, "quotations");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const filtersActive = !!(dSearch || status !== "all" || from || to);
  const resetAll = () => { setSearch(""); setStatus("all"); setFrom(""); setTo(""); setPage(1); };
  const setStatusAndReset = (s: string) => { setStatus(s); setPage(1); };

  const metrics = useQuery({
    queryKey: ["rfq-metrics"],
    queryFn: async () => {
      const [{ data: rows }, { data: resp }] = await Promise.all([
        db.from("rfqs").select("status").is("deleted_at", null),
        db.from("rfq_supplier_responses").select("responded_at, request:rfq_supplier_requests(sent_at)"),
      ]);
      const all = rows ?? [];
      const by = (...s: string[]) => all.filter((r: any) => s.includes(r.status)).length;
      const times = (resp ?? [])
        .filter((r: any) => r.request?.sent_at)
        .map((r: any) => (new Date(r.responded_at).getTime() - new Date(r.request.sent_at).getTime()) / 86400000);
      const avg = times.length ? (times.reduce((a: number, b: number) => a + b, 0) / times.length).toFixed(1) : "—";
      return {
        total: all.length,
        draft: by("draft"),
        sent: by("sent"),
        partial: by("partial"),
        waiting: by("sent", "partial"),
        completed: by("completed"),
        approved: by("approved"),
        rejected: by("rejected", "cancelled"),
        expired: by("expired"),
        avgDays: avg,
      };
    },
  });

  const list = useQuery({
    queryKey: ["rfqs", { dSearch, status, from, to, page }],
    queryFn: async () => {
      let q = db.from("rfqs").select(
        "id,rfq_no,status,currency,destination,travel_start,travel_end,created_at,customer:customers(name_en,name_ar),supplier_requests:rfq_supplier_requests(supplier:suppliers(name_en,name_ar))",
        { count: "exact" },
      ).is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("travel_start", from);
      if (to) q = q.lte("travel_end", to);
      if (dSearch.trim()) q = q.or(`rfq_no.ilike.%${dSearch.trim()}%,destination.ilike.%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });


  const total = list.data?.count ?? 0;
  const actions = useMemo(() => canWrite && (
    <Button size="sm" onClick={() => navigate("/rfqs/new")}>
      <Plus className="h-4 w-4" /> {t("rfq.new")}
    </Button>
  ), [canWrite, navigate, t]);

  const quickFilters: { key: string; label: string; count?: number; tone: KpiTone }[] = [
    { key: "all", label: t("filter.all"), count: metrics.data?.total, tone: "primary" },
    { key: "draft", label: t("rstatus.draft"), count: metrics.data?.draft, tone: "muted" },
    { key: "sent", label: t("rstatus.sent"), count: metrics.data?.sent, tone: "info" },
    { key: "partial", label: t("rstatus.partial"), count: metrics.data?.partial, tone: "warning" },
    { key: "completed", label: t("rstatus.completed"), count: metrics.data?.completed, tone: "success" },
    { key: "approved", label: t("rstatus.approved"), count: metrics.data?.approved, tone: "success" },
    { key: "rejected", label: t("rstatus.rejected"), count: metrics.data?.rejected, tone: "destructive" },
    { key: "expired", label: t("rstatus.expired"), count: metrics.data?.expired, tone: "muted" },
  ];

  return (
    <>
      <PageHeader
        title={t("rfq.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={actions}
      />
      <div className="space-y-5 p-4 sm:p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={Mailbox} tone="primary" label={t("dash.rfq_total")} value={metrics.data?.total} active={status === "all"} onClick={() => setStatusAndReset("all")} />
          <KpiCard icon={Hourglass} tone="warning" label={t("dash.rfq_waiting")} value={metrics.data?.waiting} active={status === "sent"} onClick={() => setStatusAndReset("sent")} />
          <KpiCard icon={PackageCheck} tone="success" label={t("dash.rfq_completed")} value={metrics.data?.completed} active={status === "completed"} onClick={() => setStatusAndReset("completed")} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("dash.rfq_approved")} value={metrics.data?.approved} active={status === "approved"} onClick={() => setStatusAndReset("approved")} />
          <KpiCard icon={XCircle} tone="muted" label={t("dash.rfq_expired")} value={metrics.data?.expired} active={status === "expired"} onClick={() => setStatusAndReset("expired")} />
          <KpiCard icon={Timer} tone="info" label={t("dash.rfq_avg_response")} value={metrics.data?.avgDays} />
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
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={`${t("rfq.number")} / ${t("rfq.destination")}`} className="ps-8 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">{t("filter.from")}</Label>
                <Input className="justify-center" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground">{t("filter.to")}</Label>
                <Input className="justify-center" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
              </div>
            </div>
            {filtersActive && (
              <div className="flex justify-end sm:col-span-2 xl:col-span-4">
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
                  <TableHead>{t("rfq.number")}</TableHead>
                  <TableHead>{t("rfq.customer", "العميل")}</TableHead>
                  <TableHead>{t("rfq.destination")}</TableHead>
                  <TableHead>{t("rfq.travel_start")}</TableHead>
                  <TableHead>{t("rfq.travel_end")}</TableHead>
                  <TableHead>{t("rfq.suppliers", "الموردون")}</TableHead>
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
                          <Mailbox className="h-7 w-7" />
                        </div>
                        <div className="text-sm font-medium">{t("label.no_results")}</div>
                        {filtersActive ? (
                          <Button variant="outline" size="sm" onClick={resetAll}>
                            <X className="h-4 w-4" /> {t("actions.reset")}
                          </Button>
                        ) : canWrite && (
                          <Button size="sm" onClick={() => navigate("/rfqs/new")}>
                            <Plus className="h-4 w-4" /> {t("rfq.new")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {list.data?.rows.map((r: any) => {
                  const supplierNames: string[] = (r.supplier_requests ?? [])
                    .map((sr: any) => sr.supplier ? (lang === "ar" ? (sr.supplier.name_ar || sr.supplier.name_en) : (sr.supplier.name_en || sr.supplier.name_ar)) : null)
                    .filter((x: any): x is string => typeof x === "string" && x.length > 0);
                  return (
                    <TableRow
                      key={r.id}
                      className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/rfqs/${r.id}`)}
                    >
                      <TableCell className="font-mono text-xs">
                        <Link to={`/rfqs/${r.id}`} className="text-primary hover:underline" onClick={(e: any) => e.stopPropagation()}>
                          {r.rfq_no}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.customer ? (lang === "ar" ? (r.customer.name_ar || r.customer.name_en) : (r.customer.name_en || r.customer.name_ar)) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.destination ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />{r.destination}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(r.travel_start, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(r.travel_end, lang)}</TableCell>
                      <TableCell className="text-xs max-w-[240px]">
                        {supplierNames.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate">
                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate" title={supplierNames.join("، ")}>
                              {supplierNames[0]}
                              {supplierNames.length > 1 && (
                                <span className="ms-1 inline-flex items-center rounded-full bg-muted px-1.5 py-0 text-[10px] font-bold tabular-nums text-muted-foreground">
                                  +{supplierNames.length - 1}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell><RStatusBadge status={r.status} t={t} /></TableCell>
                      <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/rfqs/${r.id}`}><Eye className="h-4 w-4" /></Link>
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
