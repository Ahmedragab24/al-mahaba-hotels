// Financial report — monthly summary + customer balances. Finance roles only (Section 17).
import { useMemo, useState } from "react";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";
import { BASE_CURRENCY, FINANCE_ROLES, fetchFxRates, monthKey, round2, toBase } from "@/lib/kpi";
import { ReportToolbar } from "./-report-toolbar";
import type { ReportColumn } from "@/lib/report-export";

export default function FinancialReport() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const allowed = canAccessModule(auth, "invoices");

  const q = useQuery({
    enabled: allowed,
    queryKey: ["rpt-financial", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let inv = db.from("invoices").select("invoice_date, total_amount, paid_amount, currency, exchange_rate, status, customer:customers(name_ar, name_en)").is("deleted_at", null);
      let rec = db.from("receipts").select("receipt_date, amount, currency, exchange_rate, status").is("deleted_at", null);
      let pay = db.from("supplier_payables").select("due_date, amount, paid_amount, currency, exchange_rate, status").is("deleted_at", null);
      if (from) { inv = inv.gte("invoice_date", from); rec = rec.gte("receipt_date", from); }
      if (to) { inv = inv.lte("invoice_date", to); rec = rec.lte("receipt_date", to); }
      const [i, r, p] = await Promise.all([inv, rec, pay]);
      if (i.error) throw i.error;
      if (r.error) throw r.error;
      if (p.error) throw p.error;
      return {
        fx,
        invoices: (i.data ?? []).filter((x: any) => x.status !== "cancelled"),
        receipts: (r.data ?? []).filter((x: any) => x.status !== "cancelled"),
        payables: (p.data ?? []).filter((x: any) => x.status !== "cancelled"),
      };
    },
  });

  const { monthlyRows, balanceRows } = useMemo(() => {
    if (!q.data) return { monthlyRows: [], balanceRows: [] };
    const { fx, invoices, receipts, payables } = q.data;
    const months: Record<string, { invoiced: number; collected: number; payables: number; paid: number }> = {};
    const get = (m: string) => (months[m] ??= { invoiced: 0, collected: 0, payables: 0, paid: 0 });
    for (const i of invoices) get(monthKey(i.invoice_date)).invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
    for (const r of receipts) get(monthKey(r.receipt_date)).collected += toBase(r.amount, r.currency, fx, r.exchange_rate);
    for (const p of payables) {
      const m = get(monthKey(p.due_date));
      m.payables += toBase(p.amount, p.currency, fx, p.exchange_rate);
      m.paid += toBase(p.paid_amount ?? 0, p.currency, fx, p.exchange_rate);
    }
    const monthlyRows = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        invoiced: round2(v.invoiced),
        collected: round2(v.collected),
        payables: round2(v.payables),
        supplier_paid: round2(v.paid),
        net_cash: round2(v.collected - v.paid),
      }));

    const byCustomer: Record<string, { invoiced: number; paid: number }> = {};
    for (const i of invoices) {
      const c = i.customer as { name_ar: string; name_en: string } | null;
      const name = c ? (lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) : "—";
      const e = (byCustomer[name] ??= { invoiced: 0, paid: 0 });
      e.invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
      e.paid += toBase(i.paid_amount ?? 0, i.currency, fx, i.exchange_rate);
    }
    const balanceRows = Object.entries(byCustomer)
      .map(([customer, v]) => ({ customer, invoiced: round2(v.invoiced), paid: round2(v.paid), balance: round2(v.invoiced - v.paid) }))
      .sort((a, b) => b.balance - a.balance);
    return { monthlyRows, balanceRows };
  }, [q.data, lang]);

  const columns: ReportColumn[] = [
    { key: "month", label: t("rpt.month") },
    { key: "invoiced", label: t("rpt.invoiced"), numeric: true },
    { key: "collected", label: t("rpt.collected"), numeric: true },
    { key: "payables", label: t("rpt.payables"), numeric: true },
    { key: "supplier_paid", label: t("rpt.payables_paid"), numeric: true },
    { key: "net_cash", label: t("rpt.net_cash"), numeric: true },
  ];

  if (!allowed) {
    return (
      <>
        <PageHeader title={t("rpt.financial_title")} />
        <div className="p-6">
          <Card><CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground"><ShieldAlert className="h-5 w-5" /> {t("rpt.no_access")}</CardContent></Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("rpt.financial_title")}
        subtitle={`${t("rpt.financial_sub")} (${BASE_CURRENCY})`}
        actions={
          <ReportToolbar
            reportKey="financial"
            fileName="financial-report"
            title={t("rpt.financial_title")}
            subtitle={`${from || "…"} → ${to || "…"}`}
            columns={columns}
            rows={monthlyRows}
            config={{ from: from || undefined, to: to || undefined }}
          />
        }
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-2"><Label>{t("rpt.from")}</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("rpt.to")}</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>{columns.map((c) => <TableHead key={c.key} className={c.numeric ? "text-end" : ""}>{c.label}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                ) : monthlyRows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                ) : (
                  monthlyRows.map((r) => (
                    <TableRow key={r.month}>
                      <TableCell className="font-medium">{r.month}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.invoiced.toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.collected.toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.payables.toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.supplier_paid.toLocaleString()}</TableCell>
                      <TableCell className="text-end font-medium tabular-nums">{r.net_cash.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("rpt.customer_balances")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("nav.customers")}</TableHead>
                  <TableHead className="text-end">{t("rpt.invoiced")}</TableHead>
                  <TableHead className="text-end">{t("rpt.paid")}</TableHead>
                  <TableHead className="text-end">{t("rpt.balance")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceRows.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                ) : (
                  balanceRows.map((r) => (
                    <TableRow key={r.customer}>
                      <TableCell className="font-medium">{r.customer}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.invoiced.toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{r.paid.toLocaleString()}</TableCell>
                      <TableCell className="text-end font-medium tabular-nums">{r.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
