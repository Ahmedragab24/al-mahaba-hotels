// Tax report — VAT/taxes per invoice and per month. Finance roles only (Section 17).
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/api/db";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { BASE_CURRENCY, FINANCE_ROLES, fetchFxRates, round2, toBase } from "@/lib/kpi";
import { ReportToolbar } from "./-report-toolbar";
import type { ReportColumn, ReportRow } from "@/lib/report-export";

export default function TaxReport() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const allowed = hasAnyRole(auth, FINANCE_ROLES);

  const q = useQuery({
    enabled: allowed,
    queryKey: ["rpt-tax", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let query = db
        .from("invoices")
        .select(
          "invoice_no, invoice_date, subtotal, taxes, total_amount, currency, exchange_rate, status, customer:customers(name_ar, name_en)",
        )
        .is("deleted_at", null)
        .order("invoice_date", { ascending: false });
      if (from) query = query.gte("invoice_date", from);
      if (to) query = query.lte("invoice_date", to);
      const { data, error } = await query;
      if (error) throw error;
      return { fx, rows: (data ?? []).filter((x: any) => x.status !== "cancelled") };
    },
  });

  const rows: ReportRow[] = useMemo(() => {
    if (!q.data) return [];
    const { fx } = q.data;
    return q.data.rows.map((i: any) => {
      const c = i.customer as { name_ar: string; name_en: string } | null;
      return {
        invoice_no: i.invoice_no,
        date: formatDate(i.invoice_date, lang),
        customer: c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—",
        subtotal: round2(Number(i.subtotal ?? 0)),
        taxes: round2(Number(i.taxes ?? 0)),
        total: round2(Number(i.total_amount ?? 0)),
        currency: i.currency,
        taxes_base: round2(toBase(i.taxes ?? 0, i.currency, fx, i.exchange_rate)),
      };
    });
  }, [q.data, lang]);

  const totalTaxBase = rows.reduce((a, r) => a + Number(r.taxes_base ?? 0), 0);

  const columns: ReportColumn[] = [
    { key: "invoice_no", label: t("label.code") },
    { key: "date", label: t("label.created_at") },
    { key: "customer", label: t("nav.customers") },
    { key: "subtotal", label: t("rpt.subtotal"), numeric: true },
    { key: "taxes", label: t("rpt.taxes"), numeric: true },
    { key: "total", label: t("label.total"), numeric: true },
    { key: "currency", label: t("label.currency") },
    { key: "taxes_base", label: `${t("rpt.taxes")} (${BASE_CURRENCY})`, numeric: true },
  ];

  if (!allowed) {
    return (
      <>
        <PageHeader title={t("rpt.tax_title")} />
        <div className="p-6">
          <Card>
            <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <ShieldAlert className="h-5 w-5" /> {t("rpt.no_access")}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("rpt.tax_title")}
        subtitle={t("rpt.tax_sub")}
        actions={
          <ReportToolbar
            reportKey="tax"
            fileName="tax-report"
            title={t("rpt.tax_title")}
            subtitle={`${from || "…"} → ${to || "…"}`}
            columns={columns}
            rows={rows}
            config={{ from: from || undefined, to: to || undefined }}
          />
        }
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("rpt.from")}</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("rpt.to")}</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={c.numeric ? "text-end" : ""}>
                      {c.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {t("label.loading")}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {t("label.no_results")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.invoice_no}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.customer}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {Number(r.subtotal).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {Number(r.taxes).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {Number(r.total).toLocaleString()}
                      </TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell className="text-end font-medium tabular-nums">
                        {Number(r.taxes_base).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="text-sm font-medium">
          {t("rpt.taxes")}: {formatMoney(round2(totalTaxBase), BASE_CURRENCY, lang)} · {rows.length}{" "}
          {t("rpt.records")}
        </p>
      </div>
    </>
  );
}
