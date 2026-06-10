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

export const Route = createFileRoute("/_authenticated/bookings/")({
  component: BookingsList,
});

const PAGE_SIZE = 20;
export const BK_STATUSES = ["draft","pending_confirmation","confirmed","checked_in","checked_out","cancelled","no_show"] as const;
export const BK_WRITE_ROLES = ["super_admin","admin","sales_manager","sales_agent","operations_manager","operations_agent"] as const;

export function BkStatusBadge({ status, t }: { status: string; t: (k: string, f?: string) => string }) {
  const variant = status === "cancelled" || status === "no_show" ? "destructive"
    : status === "draft" || status === "checked_out" ? "outline"
    : "default";
  const cls = status === "confirmed" || status === "checked_in" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined;
  return <Badge variant={variant as any} className={cls}>{t(`bkstatus.${status}`)}</Badge>;
}

function BookingsList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole([...BK_WRITE_ROLES]);

  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("all");
  const [status, setStatus] = useState("all");
  const [hotel, setHotel] = useState("all");
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

  // Booking KPIs
  const metrics = useQuery({
    queryKey: ["bookings-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("status, rooms:booking_rooms(total_selling)").is("deleted_at", null);
      const rows = data ?? [];
      const sum = rows.reduce((a, r: any) => a + (r.rooms ?? []).reduce((x: number, i: any) => x + Number(i.total_selling), 0), 0);
      const by = (...s: string[]) => rows.filter((r: any) => s.includes(r.status)).length;
      return { total: rows.length, confirmed: by("confirmed"), inHouse: by("checked_in"), completed: by("checked_out"), cancelled: by("cancelled","no_show"), value: sum };
    },
  });

  const list = useQuery({
    queryKey: ["bookings", { dSearch, customer, status, hotel, from, to, page }],
    queryFn: async () => {
      let ids: string[] | null = null;
      if (hotel !== "all") {
        const { data } = await supabase.from("booking_rooms").select("booking_id").eq("hotel_id", hotel);
        ids = Array.from(new Set((data ?? []).map((x: any) => x.booking_id)));
        if (ids.length === 0) return { rows: [], count: 0 };
      }
      let q = supabase.from("bookings").select(
        "id,booking_no,status,currency,booking_date,quotation_id,created_by,customer:customers(name_en,name_ar),rooms:booking_rooms(total_selling,check_in)",
        { count: "exact" },
      ).is("deleted_at", null);
      if (ids) q = q.in("id", ids);
      if (customer !== "all") q = q.eq("customer_id", customer);
      if (status !== "all") q = q.eq("status", status);
      if (from) q = q.gte("booking_date", from);
      if (to) q = q.lte("booking_date", to);
      if (dSearch.trim()) q = q.ilike("booking_no", `%${dSearch.trim()}%`);
      const f = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(f, f + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const total = list.data?.count ?? 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const actions = useMemo(() => canWrite && (
    <Button size="sm" onClick={() => navigate({ to: "/bookings/new" })}><Plus className="h-4 w-4" /> {t("bk.new")}</Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("bk.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            [t("bk.kpi.total"), metrics.data?.total],
            [t("bk.kpi.confirmed"), metrics.data?.confirmed],
            [t("bk.kpi.in_house"), metrics.data?.inHouse],
            [t("bk.kpi.completed"), metrics.data?.completed],
            [t("bk.kpi.cancelled"), metrics.data?.cancelled],
            [t("bk.kpi.value"), metrics.data ? fmt(metrics.data.value) : undefined],
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
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("bk.number")} className="ps-8" />
            </div>
            <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("bk.customer")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {customers.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {BK_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`bkstatus.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {hotels.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
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
                  <TableHead>{t("bk.number")}</TableHead>
                  <TableHead>{t("bk.customer")}</TableHead>
                  <TableHead>{t("bk.booking_date")}</TableHead>
                  <TableHead>{t("bk.source")}</TableHead>
                  <TableHead>{t("bk.value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((b: any) => {
                  const value = (b.rooms ?? []).reduce((a: number, i: any) => a + Number(i.total_selling), 0);
                  return (
                    <TableRow key={b.id} className="whitespace-nowrap">
                      <TableCell className="font-mono text-xs">
                        <Link to="/bookings/$id" params={{ id: b.id }} className="hover:underline">{b.booking_no}</Link>
                      </TableCell>
                      <TableCell className="text-sm">{b.customer ? (lang === "ar" ? (b.customer.name_ar || b.customer.name_en) : (b.customer.name_en || b.customer.name_ar)) : "—"}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(b.booking_date, lang)}</TableCell>
                      <TableCell className="text-xs">{b.quotation_id ? t("bk.source_quotation") : t("bk.source_direct")}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{fmt(value)} {b.currency}</TableCell>
                      <TableCell><BkStatusBadge status={b.status} t={t} /></TableCell>
                      <TableCell className="text-end">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/bookings/$id" params={{ id: b.id }}><Eye className="h-4 w-4" /></Link>
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
