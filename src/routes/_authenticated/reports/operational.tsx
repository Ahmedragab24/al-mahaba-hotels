// Operational report — bookings activity with filters and full export (Section 17).
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import { BASE_CURRENCY, fetchFxRates, round2, toBase } from "@/lib/kpi";
import { ReportToolbar } from "./-report-toolbar";
import type { ReportColumn, ReportRow } from "@/lib/report-export";

type OpSearch = { from?: string; to?: string; status?: string };

export const Route = createFileRoute("/_authenticated/reports/operational")({
  validateSearch: (s: Record<string, unknown>): OpSearch => ({
    from: typeof s.from === "string" ? s.from : undefined,
    to: typeof s.to === "string" ? s.to : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  component: OperationalReport,
});

function OperationalReport() {
  const { t, lang, dir } = useI18n();
  const search = Route.useSearch();
  const [from, setFrom] = useState(search.from ?? "");
  const [to, setTo] = useState(search.to ?? "");
  const [status, setStatus] = useState(search.status ?? "all");

  const q = useQuery({
    queryKey: ["rpt-operational", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let query = supabase
        .from("bookings")
        .select("id, booking_no, status, booking_date, currency, customer:customers(name_ar, name_en), rooms:booking_rooms(rooms, nights, total_selling, total_cost)")
        .is("deleted_at", null)
        .order("booking_date", { ascending: false });
      if (from) query = query.gte("booking_date", from);
      if (to) query = query.lte("booking_date", to);
      const { data, error } = await query;
      if (error) throw error;
      return { rows: data ?? [], fx };
    },
  });

  const statuses = useMemo(() => Array.from(new Set((q.data?.rows ?? []).map((r) => r.status))).sort(), [q.data]);

  const filtered = useMemo(
    () => (q.data?.rows ?? []).filter((r) => status === "all" || r.status === status),
    [q.data, status],
  );

  const exportRows: ReportRow[] = useMemo(() => {
    const fx = q.data?.fx ?? {};
    return filtered.map((b) => {
      const cust = b.customer as { name_ar: string; name_en: string } | null;
      const rooms = (b.rooms as { rooms: number; nights: number; total_selling: number | null; total_cost: number | null }[]) ?? [];
      const roomsCount = rooms.reduce((a, r) => a + Number(r.rooms ?? 0), 0);
      const nights = rooms.reduce((a, r) => a + Number(r.nights ?? 0) * Number(r.rooms ?? 0), 0);
      const selling = rooms.reduce((a, r) => a + Number(r.total_selling ?? 0), 0);
      const sellingBase = round2(toBase(selling, b.currency, fx));
      return {
        booking_no: b.booking_no,
        customer: cust ? (lang === "ar" ? cust.name_ar || cust.name_en : cust.name_en || cust.name_ar) : "—",
        status: t(`status.${b.status}`, b.status),
        booking_date: formatDate(b.booking_date, lang),
        rooms: roomsCount,
        nights,
        selling: round2(selling),
        currency: b.currency,
        selling_base: sellingBase,
      };
    });
  }, [filtered, q.data, lang, t]);

  const columns: ReportColumn[] = [
    { key: "booking_no", label: t("label.code") },
    { key: "customer", label: t("nav.customers") },
    { key: "status", label: t("label.status") },
    { key: "booking_date", label: t("label.created_at") },
    { key: "rooms", label: t("rpt.rooms"), numeric: true },
    { key: "nights", label: t("rpt.nights"), numeric: true },
    { key: "selling", label: t("label.total"), numeric: true },
    { key: "currency", label: t("label.currency") },
    { key: "selling_base", label: `${t("label.total")} (${BASE_CURRENCY})`, numeric: true },
  ];

  const totalBase = exportRows.reduce((a, r) => a + Number(r.selling_base ?? 0), 0);

  return (
    <>
      <PageHeader
        title={t("rpt.operational_title")}
        subtitle={t("rpt.operational_sub")}
        actions={
          <ReportToolbar
            reportKey="operational"
            fileName="operational-report"
            title={t("rpt.operational_title")}
            subtitle={`${from || "…"} → ${to || "…"}`}
            columns={columns}
            rows={exportRows}
            config={{ from: from || undefined, to: to || undefined, status: status !== "all" ? status : undefined }}
          />
        }
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("rpt.from")}</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("rpt.to")}</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("label.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("label.total")}</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>{t(`status.${s}`, s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={c.numeric ? "text-end" : ""}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading ? (
                  <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                ) : exportRows.length === 0 ? (
                  <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                ) : (
                  exportRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.booking_no}</TableCell>
                      <TableCell>{r.customer}</TableCell>
                      <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                      <TableCell>{r.booking_date}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.rooms}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.nights}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(r.selling).toLocaleString()}</TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(r.selling_base).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="text-sm font-medium">
          {t("label.total")}: {formatMoney(round2(totalBase), BASE_CURRENCY, lang)} · {exportRows.length} {t("rpt.records")}
        </p>
      </div>
    </>
  );
}
