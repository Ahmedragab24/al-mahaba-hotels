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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import { Plus, Search, Eye } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/rfqs/")({
  component: RfqList,
});

const PAGE_SIZE = 20;
const STATUSES = ["draft","sent","partial","completed","approved","rejected","expired","cancelled"] as const;

export function RStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "rejected" || status === "cancelled" ? "destructive"
    : status === "draft" || status === "expired" ? "outline"
    : "default";
  const cls = status === "approved" || status === "completed" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`rstatus.${status}`)}</Badge>;
}

function RfqList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

  const metrics = useQuery({
    queryKey: ["rfq-metrics"],
    queryFn: async () => {
      const [{ data: rows }, { data: resp }] = await Promise.all([
        supabase.from("rfqs").select("status").is("deleted_at", null),
        supabase.from("rfq_supplier_responses").select("responded_at, request:rfq_supplier_requests(sent_at)"),
      ]);
      const all = rows ?? [];
      const by = (...s: string[]) => all.filter((r: any) => s.includes(r.status)).length;
      const times = (resp ?? [])
        .filter((r: any) => r.request?.sent_at)
        .map((r: any) => (new Date(r.responded_at).getTime() - new Date(r.request.sent_at).getTime()) / 86400000);
      const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : "—";
      return { total: all.length, waiting: by("sent","partial"), completed: by("completed"), approved: by("approved"), expired: by("expired"), avgDays: avg };
    },
  });

  const list = useQuery({
    queryKey: ["rfqs", { dSearch, status, from, to, page }],
    queryFn: async () => {
      let q = supabase.from("rfqs").select(
        "id,rfq_no,status,currency,destination,travel_start,travel_end,created_at,supplier_requests:rfq_supplier_requests(supplier:suppliers(name_en,name_ar))",
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
    <Button size="sm" onClick={() => navigate({ to: "/rfqs/new" })}><Plus className="h-4 w-4" /> {t("rfq.new")}</Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("rfq.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [t("dash.rfq_total"), metrics.data?.total],
            [t("dash.rfq_waiting"), metrics.data?.waiting],
            [t("dash.rfq_completed"), metrics.data?.completed],
            [t("dash.rfq_approved"), metrics.data?.approved],
            [t("dash.rfq_expired"), metrics.data?.expired],
            [t("dash.rfq_avg_response"), metrics.data?.avgDays],
          ].map(([label, val], i) => (
            <Card key={i}><CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{label as string}</div>
              <div className="text-xl font-bold">{val ?? "—"}</div>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={`${t("rfq.number")} / ${t("rfq.destination")}`} className="ps-8" />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`rstatus.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-full" />
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-full" />
          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead>{t("rfq.number")}</TableHead>
                  <TableHead>{t("rfq.suppliers", "الموردون")}</TableHead>
                  <TableHead>{t("rfq.destination")}</TableHead>
                  <TableHead>{t("rfq.travel_start")}</TableHead>
                  <TableHead>{t("rfq.travel_end")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((r: any) => (
                  <TableRow key={r.id} className="whitespace-nowrap">
                    <TableCell className="font-mono text-xs">
                      <Link to="/rfqs/$id" params={{ id: r.id }} className="hover:underline">{r.rfq_no}</Link>
                    </TableCell>
                    <TableCell className="text-sm">{(r.supplier_requests ?? []).length > 0 ? (r.supplier_requests as any[]).map((sr: any) => lang === "ar" ? (sr.supplier?.name_ar || sr.supplier?.name_en) : (sr.supplier?.name_en || sr.supplier?.name_ar)).filter(Boolean).join("، ") : "—"}</TableCell>

                    <TableCell className="text-sm">{r.destination ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(r.travel_start, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(r.travel_end, lang)}</TableCell>
                    <TableCell><RStatusBadge status={r.status} t={t} /></TableCell>
                    <TableCell className="text-end">
                      <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                        <Link to="/rfqs/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></Link>
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
    </>
  );
}
