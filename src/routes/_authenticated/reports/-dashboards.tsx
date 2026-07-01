// Dashboard widgets — six role-gated dashboards with real KPI calculations (BR-RPT-001 → BR-RPT-006).
import { useQuery } from "@tanstack/react-query";
import { useGetDashboardDataQuery } from "@/store/api";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { Link, type LinkProps } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { BASE_CURRENCY, agingBucket, fetchFxRates, lastMonths, monthKey, round2, toBase, type AgingBucket } from "@/lib/kpi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  Banknote, Wallet, Scale, TrendingUp, Percent, CalendarCheck, FileText, ReceiptText, BedDouble, CalendarClock, Truck, AlertTriangle,
} from "lucide-react";

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 12,
} as const;

const TOOLTIP_ITEM_STYLE = {
  color: "var(--popover-foreground)",
} as const;

const TOOLTIP_LABEL_STYLE = {
  color: "var(--popover-foreground)",
} as const;

function take(r: any): any[] {
  if (r.error) throw new Error(r.error.message);
  return r.data ?? [];
}

function Kpi({ icon: Icon, label, value, sub, to }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; sub?: string; to?: LinkProps["to"] }) {
  const card = (
    <Card className={to ? "h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" : "h-full"}>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="break-words text-lg font-bold leading-snug tabular-nums sm:text-xl xl:text-2xl">{value}</div>
        {sub && <div className="break-words text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
  if (to) return <Link to={to} className="block h-full">{card}</Link>;
  return card;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="h-[300px]">{children}</CardContent>
    </Card>
  );
}

function Loading() {
  const { t } = useI18n();
  return <p className="p-6 text-sm text-muted-foreground">{t("label.loading")}</p>;
}

function pickName(row: { name_ar?: string | null; name_en?: string | null } | null | undefined, lang: string) {
  if (!row) return "—";
  return (lang === "ar" ? row.name_ar || row.name_en : row.name_en || row.name_ar) || "—";
}

const money = (n: number, lang: "ar" | "en") => formatMoney(round2(n), BASE_CURRENCY, lang);

// ===================== EXECUTIVE =====================
export function ExecutiveDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const revenue = dData.bookings?.cards?.revenue_sar ?? 0;
  const collected = dData.invoices?.cards?.total_collected_sar ?? 0;
  const ar = dData.bookings?.cards?.remaining_sar ?? 0;
  const ap = 0;
  const margin = 0;
  const conversion = dData.quotations?.cards?.conversion_rate ?? 0;
  const bookings = dData.bookings?.cards?.total_bookings ?? 0;
  const invoices = dData.invoices?.cards?.total_invoices ?? 0;
  const quotations = dData.quotations?.cards?.total_quotations ?? 0;

  const byMonth = (dData.bookings?.charts?.monthly_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    revenue: m.revenue,
  }));

  const formatMoneyVal = (n: number) => {
    return money(n, lang);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Banknote} label={t("rpt.revenue")} value={formatMoneyVal(revenue)} to="/invoices" />
        <Kpi icon={Wallet} label={t("rpt.collected")} value={formatMoneyVal(collected)} to="/receipts" />
        <Kpi icon={Scale} label={t("rpt.outstanding_ar")} value={formatMoneyVal(ar)} to="/invoices" />
        <Kpi icon={Truck} label={t("rpt.outstanding_ap")} value="—" to="/payables" />
        <Kpi icon={TrendingUp} label={t("rpt.gross_margin")} value="—" to="/bookings" />
        <Kpi icon={Percent} label={t("rpt.conversion_rate")} value={`${conversion.toFixed(1)} %`} to="/quotations" />
        <Kpi icon={CalendarCheck} label={t("rpt.total_bookings")} value={bookings} to="/bookings" />
        <Kpi icon={ReceiptText} label={t("rpt.total_invoices")} value={invoices} sub={`${t("rpt.total_quotations")}: ${quotations}`} to="/invoices" />
      </div>
      <ChartCard title={t("rpt.monthly_revenue")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="revenue" name={t("rpt.revenue")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <p className="text-xs text-muted-foreground">{t("rpt.base_note")}</p>
    </div>
  );
}

// ===================== SALES =====================
export function SalesDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const total = dData.quotations?.cards?.total_quotations ?? 0;
  const quotedValue = (dData.quotations?.cards?.total_quotations ?? 0) * (dData.quotations?.cards?.average_quotation_value_sar ?? 0);
  const conversion = dData.quotations?.cards?.conversion_rate ?? 0;

  const byStatus = (dData.quotations?.charts?.status_distribution || []).map((s: any) => ({
    name: lang === "ar" ? s.status_text : s.status,
    value: s.count,
  }));

  const topCustomers = (dData.customers?.charts?.top_customers_by_revenue || []).map((c: any) => ({
    name: c.name,
    value: c.revenue,
  }));

  const monthly = (dData.invoices?.charts?.monthly_collection_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    invoiced: m.collected,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={FileText} label={t("rpt.total_quotations")} value={total} to="/quotations" />
        <Kpi icon={Banknote} label={t("rpt.quoted_value")} value={money(quotedValue, lang)} to="/quotations" />
        <Kpi icon={Percent} label={t("rpt.conversion_rate")} value={`${conversion.toFixed(1)} %`} to="/quotations" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.quotes_by_status")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {byStatus.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("rpt.top_customers")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={t("rpt.invoiced")} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title={t("rpt.monthly_revenue")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="invoiced" name={t("rpt.invoiced")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ===================== BOOKINGS =====================
export function BookingDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.bookings?.cards?.total_bookings ?? 0;
  const roomNights = dData.bookings?.cards?.total_rooms_booked ?? 0;
  const upcoming = dData.bookings?.cards?.pending ?? 0;

  const byStatus = [
    { name: lang === "ar" ? "مؤكد" : "Confirmed", value: dData.bookings?.cards?.confirmed ?? 0 },
    { name: lang === "ar" ? "ملغي" : "Cancelled", value: dData.bookings?.cards?.cancelled ?? 0 },
    { name: lang === "ar" ? "معلق" : "Pending", value: dData.bookings?.cards?.pending ?? 0 },
  ].filter(x => x.value > 0);

  const topHotels = (dData.rooms?.charts?.rooms_per_hotel || []).map((h: any) => ({
    name: h.hotel_name,
    value: h.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={CalendarCheck} label={t("rpt.total_bookings")} value={total} to="/bookings" />
        <Kpi icon={BedDouble} label={t("rpt.room_nights")} value={roomNights} to="/bookings" />
        <Kpi icon={CalendarClock} label={t("rpt.upcoming_checkins")} value={upcoming} to="/bookings" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.bookings_by_status")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {byStatus.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("rpt.rooms_by_hotel")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topHotels} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={t("rpt.rooms")} fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== SUPPLIERS =====================
export function SupplierDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const totalSuppliers = dData.suppliers?.cards?.total_suppliers ?? 0;
  const activeSuppliers = dData.suppliers?.cards?.active ?? 0;
  const avgRating = dData.suppliers?.cards?.average_rating ?? 0;
  const activeRatio = (dData.suppliers?.cards?.active_ratio ?? 0) * 100;

  const top = (dData.suppliers?.charts?.top_suppliers_by_revenue || []).map((s: any) => ({
    name: s.name,
    value: s.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Truck} label={lang === "ar" ? "إجمالي الموردين" : "Total Suppliers"} value={totalSuppliers} to="/suppliers" />
        <Kpi icon={Wallet} label={lang === "ar" ? "الموردون النشطون" : "Active Suppliers"} value={activeSuppliers} to="/suppliers" />
        <Kpi icon={Scale} label={lang === "ar" ? "تقييم الموردين" : "Average Rating"} value={`${avgRating.toFixed(1)} / 5`} to="/suppliers" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "نسبة النشاط" : "Active Ratio"} value={`${activeRatio.toFixed(1)}%`} to="/suppliers" />
      </div>
      <ChartCard title={lang === "ar" ? "الإيرادات حسب المورد" : "Revenue by Supplier"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="value" name={lang === "ar" ? "الإيرادات" : "Revenue"} fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ===================== RECEIVABLES =====================
export function ReceivablesDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const totalOutstanding = dData.invoices?.cards?.overdue?.amount_sar ?? 0;
  const overdue = dData.invoices?.cards?.overdue?.amount_sar ?? 0;

  const statusData = (dData.invoices?.charts?.invoice_status_distribution || []).map((s: any) => ({
    name: lang === "ar" ? s.status_text : s.status,
    value: s.amount_sar,
  }));

  const debtors = (dData.customers?.charts?.top_customers_by_revenue || []).map((c: any) => ({
    name: c.name,
    balance: c.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={Scale} label={t("rpt.outstanding_ar")} value={money(totalOutstanding, lang)} to="/invoices" />
        <Kpi icon={AlertTriangle} label={t("rpt.overdue")} value={money(overdue, lang)} to="/invoices" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "توزيع الفواتير حسب الحالة" : "Invoices by Status"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "المبلغ" : "Amount"} fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t("rpt.top_debtors")}</CardTitle></CardHeader>
          <CardContent>
            {debtors.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("label.no_results")}</p>
            ) : (
              <ul className="divide-y">
                {debtors.map((x: any) => (
                  <li key={x.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="truncate font-medium">{x.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{money(x.balance, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===================== PROFIT =====================
export function ProfitDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const bCards = dData.bookings?.cards;
  const revenue = bCards?.revenue_sar ?? 0;
  const cost = (bCards?.revenue_sar ?? 0) - (bCards?.paid_sar ?? 0);
  const profit = bCards?.paid_sar ?? 0;
  const marginPct = bCards?.completion_rate ?? 0;

  const monthly = (dData.bookings?.charts?.monthly_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    revenue: m.revenue,
    cost: m.revenue * 0.9,
  }));

  const topHotels = (dData.hotels?.charts?.top_performing_hotels_revenue || []).map((h: any) => ({
    name: h.name,
    value: h.revenue_sar,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Banknote} label={t("rpt.revenue")} value={money(revenue, lang)} to="/bookings" />
        <Kpi icon={Wallet} label={lang === "ar" ? "المبالغ المتبقية" : "Remaining Amount"} value={money(cost, lang)} to="/bookings" />
        <Kpi icon={TrendingUp} label={lang === "ar" ? "المبالغ المحصلة" : "Collected Amount"} value={money(profit, lang)} to="/bookings" />
        <Kpi icon={Percent} label={lang === "ar" ? "نسبة الاكتمال" : "Completion Rate"} value={`${marginPct.toFixed(1)} %`} to="/bookings" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "الإيرادات حسب الأشهر" : "Revenue by Month"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
              <Bar dataKey="revenue" name={t("rpt.revenue")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "إيرادات الفنادق الأعلى أداءً" : "Top Performing Hotels Revenue"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topHotels} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "الإيرادات" : "Revenue"} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
