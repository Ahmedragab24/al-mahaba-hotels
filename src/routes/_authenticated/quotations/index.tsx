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
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/quotations/")({
  component: QuotationsList,
});

const PAGE_SIZE = 20;
const STATUSES = ["draft","pending_approval","approved","rejected","sent","accepted","expired","cancelled"] as const;

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
  const canWrite = auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent"]);

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [creator, setCreator] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const dSearch = useDebounce(search, 300);

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
      const { data } = await supabase.from("quotations").select("status, items:quotation_items(total_selling)").is("deleted_at", null);
      const rows = data ?? [];
      const sum = rows.reduce((a, r: any) => a + (r.items ?? []).reduce((x: number, i: any) => x + Number(i.total_selling), 0), 0);
      const by = (s: string) => rows.filter((r: any) => r.status === s).length;
      return { total: rows.length, pending: by("pending_approval"), approved: by("approved"), accepted: by("accepted"), rejected: by("rejected"), value: sum };
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
        "id,quotation_no,status,currency,quotation_date,travel_date,expiry_date,created_by,created_at,deleted_at,customer:customers(name_en,name_ar),items:quotation_items(total_selling)",
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
    <Button size="sm" onClick={() => navigate({ to: "/quotations/new" })}><Plus className="h-4 w-4" /> {t("quotes.new")}</Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("quotes.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [t("dash.quotes_total"), metrics.data?.total],
            [t("dash.quotes_pending"), metrics.data?.pending],
            [t("dash.quotes_approved"), metrics.data?.approved],
            [t("dash.quotes_accepted"), metrics.data?.accepted],
            [t("dash.quotes_rejected"), metrics.data?.rejected],
            [t("dash.quotes_value"), metrics.data ? fmt(metrics.data.value) : undefined],
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
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("quotes.number")} className="ps-8" />
            </div>
            <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.customer")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`qstatus.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {hotels.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={creator} onValueChange={(v) => { setCreator(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.creator")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {creators.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.email}</SelectItem>)}
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
                  <TableHead>{t("quotes.number")}</TableHead>
                  <TableHead>{t("quotes.customer")}</TableHead>
                  <TableHead>{t("quotes.quotation_date")}</TableHead>
                  <TableHead>{t("quotes.expiry_date")}</TableHead>
                  <TableHead>{t("quotes.value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead>{t("quotes.creator")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((q: any) => {
                  const value = (q.items ?? []).reduce((a: number, i: any) => a + Number(i.total_selling), 0);
                  return (
                    <TableRow key={q.id} className="whitespace-nowrap">
                      <TableCell className="font-mono text-xs">
                        <Link to="/quotations/$id" params={{ id: q.id }} className="hover:underline">{q.quotation_no}</Link>
                      </TableCell>
                      <TableCell className="text-sm">{q.customer ? (lang === "ar" ? (q.customer.name_ar || q.customer.name_en) : (q.customer.name_en || q.customer.name_ar)) : "—"}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(q.quotation_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(q.expiry_date, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{fmt(value)} {q.currency}</TableCell>
                      <TableCell><QStatusBadge status={q.status} t={t} /></TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{creatorName(q.created_by)}</div>
                        <div dir="ltr" className="text-muted-foreground">{formatDateTime(q.created_at, lang)}</div>
                      </TableCell>
                      <TableCell className="text-end">
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
