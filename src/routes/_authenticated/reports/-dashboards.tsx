// Dashboard widgets — eight role-gated dashboards with real KPI calculations mapped directly to database entity metrics.
import { useGetDashboardDataQuery } from "@/store/api";
import { Link, type LinkProps } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { BASE_CURRENCY, round2 } from "@/lib/kpi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  Banknote, Wallet, Scale, TrendingUp, Percent, CalendarCheck, ReceiptText, BedDouble, CalendarClock, Truck, AlertTriangle,
  FileSpreadsheet, Hotel, Users, Handshake, ClipboardList,
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

const money = (n: number, lang: "ar" | "en") => formatMoney(round2(n), BASE_CURRENCY, lang);

// ===================== 1. BOOKINGS =====================
export function BookingDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const cards = dData.bookings?.cards || {};
  const total = cards.total_bookings ?? 0;
  const confirmed = cards.confirmed ?? 0;
  const cancelled = cards.cancelled ?? 0;
  const pending = cards.pending ?? 0;
  const revenue = cards.revenue_sar ?? 0;
  const paid = cards.paid_sar ?? 0;
  const remaining = cards.remaining_sar ?? 0;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const monthlyTrend = (dData.bookings?.charts?.monthly_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    count: m.count,
    revenue: m.revenue,
  }));

  const bookingSources = (dData.bookings?.charts?.booking_sources || []).map((s: any) => ({
    name: s.source === "Direct" ? (lang === "ar" ? "مباشر" : "Direct") : (lang === "ar" ? "فندق" : "Hotel"),
    value: s.count,
    revenue: s.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={CalendarCheck} label={t("rpt.total_bookings")} value={total} to="/bookings" />
        <Kpi icon={CalendarCheck} label={lang === "ar" ? "الحجوزات المؤكدة" : "Confirmed Bookings"} value={confirmed} to="/bookings" />
        <Kpi icon={CalendarClock} label={lang === "ar" ? "الحجوزات المعلقة" : "Pending Bookings"} value={pending} to="/bookings" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الحجوزات الملغاة" : "Cancelled Bookings"} value={cancelled} to="/bookings" />
        <Kpi icon={Banknote} label={t("rpt.revenue")} value={money(revenue, lang)} to="/bookings" />
        <Kpi icon={Wallet} label={lang === "ar" ? "المبالغ المحصلة" : "Collected Amount"} value={money(paid, lang)} to="/bookings" />
        <Kpi icon={Scale} label={lang === "ar" ? "المبالغ المتبقية" : "Remaining Amount"} value={money(remaining, lang)} to="/bookings" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "الإيرادات الشهرية للحجوزات" : "Monthly Booking Revenue"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="revenue" name={t("rpt.revenue")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "مصادر الحجوزات" : "Booking Sources"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={bookingSources} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {bookingSources.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== 2. QUOTATIONS =====================
export function QuotationDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.quotations?.cards?.total_quotations ?? 0;
  const valid = dData.quotations?.cards?.valid ?? 0;
  const expired = dData.quotations?.cards?.expired ?? 0;
  const converted = dData.quotations?.cards?.converted ?? 0;
  const conversion = dData.quotations?.cards?.conversion_rate ?? 0;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const monthlyTrend = (dData.quotations?.charts?.monthly_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    created: m.created,
    converted: m.converted,
  }));

  const topHotels = (dData.quotations?.charts?.top_requested_hotels || []).map((h: any) => ({
    name: h.name,
    value: h.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={FileSpreadsheet} label={t("rpt.total_quotations")} value={total} to="/quotations" />
        <Kpi icon={CalendarCheck} label={lang === "ar" ? "عروض صالحة" : "Valid Quotes"} value={valid} to="/quotations" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "عروض منتهية" : "Expired Quotes"} value={expired} to="/quotations" />
        <Kpi icon={CalendarCheck} label={lang === "ar" ? "عروض محولة" : "Converted Quotes"} value={converted} to="/quotations" />
        <Kpi icon={Percent} label={t("rpt.conversion_rate")} value={`${conversion.toFixed(1)} %`} to="/quotations" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "المخطط الشهري لعروض الأسعار" : "Monthly Quotation Trend"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
              <Bar dataKey="created" name={lang === "ar" ? "عروض منشأة" : "Created"} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converted" name={lang === "ar" ? "عروض محولة" : "Converted"} fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "أكثر الفنادق طلباً في عروض الأسعار" : "Top Requested Hotels"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topHotels} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "عدد الطلبات" : "Requests Count"} fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== 3. HOTELS =====================
export function HotelDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.hotels?.cards?.total_hotels ?? 0;
  const active = dData.hotels?.cards?.active ?? 0;
  const archived = dData.hotels?.cards?.archived ?? 0;

  const stars = (dData.hotels?.charts?.stars_distribution || []).map((s: any) => ({
    name: `${s.stars} ${lang === "ar" ? "نجوم" : "Stars"}`,
    value: s.count,
  }));

  const countries = (dData.hotels?.charts?.country_distribution || []).map((c: any) => ({
    name: c.country_name,
    value: c.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={Hotel} label={lang === "ar" ? "إجمالي الفنادق" : "Total Hotels"} value={total} to="/hotels" />
        <Kpi icon={Hotel} label={lang === "ar" ? "الفنادق النشطة" : "Active Hotels"} value={active} to="/hotels" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الفنادق المؤرشفة" : "Archived Hotels"} value={archived} to="/hotels" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "توزيع الفنادق حسب النجوم" : "Stars Distribution"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stars} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {stars.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "توزيع الفنادق حسب الدول" : "Hotels Country Distribution"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "عدد الفنادق" : "Hotels Count"} fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== 4. ROOMS =====================
export function RoomDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.rooms?.cards?.total_rooms ?? 0;
  const active = dData.rooms?.cards?.active ?? 0;
  const archived = dData.rooms?.cards?.archived ?? 0;

  const views = (dData.rooms?.charts?.views_distribution || []).map((v: any) => ({
    name: v.view,
    value: v.count,
  }));

  const perHotel = (dData.rooms?.charts?.rooms_per_hotel || []).map((h: any) => ({
    name: h.hotel_name,
    value: h.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={BedDouble} label={lang === "ar" ? "إجمالي الغرف" : "Total Rooms"} value={total} to="/rooms" />
        <Kpi icon={BedDouble} label={lang === "ar" ? "الغرف النشطة" : "Active Rooms"} value={active} to="/rooms" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الغرف المؤرشفة" : "Archived Rooms"} value={archived} to="/rooms" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "توزيع الغرف حسب الإطلالة" : "Views Distribution"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={views} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {views.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "عدد الغرف التابعة للفنادق" : "Rooms Per Hotel"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perHotel} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "عدد الغرف" : "Rooms Count"} fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== 5. CUSTOMERS =====================
export function CustomerDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.customers?.cards?.total_customers ?? 0;
  const active = dData.customers?.cards?.active ?? 0;
  const corporate = dData.customers?.cards?.corporate ?? 0;
  const individual = dData.customers?.cards?.individual ?? 0;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const monthlyReg = (dData.customers?.charts?.monthly_registration_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    count: m.count,
  }));

  const countries = (dData.customers?.charts?.country_distribution || []).map((c: any) => ({
    name: c.country_name,
    value: c.count,
  }));

  const topCustomers = (dData.customers?.charts?.top_customers_by_revenue || []).map((c: any) => ({
    name: c.name,
    value: c.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Users} label={lang === "ar" ? "إجمالي العملاء" : "Total Customers"} value={total} to="/customers" />
        <Kpi icon={Users} label={lang === "ar" ? "العملاء النشطون" : "Active Customers"} value={active} to="/customers" />
        <Kpi icon={Hotel} label={lang === "ar" ? "حسابات الشركات" : "Corporate Accounts"} value={corporate} to="/customers" />
        <Kpi icon={Wallet} label={lang === "ar" ? "الحسابات الفردية" : "Individual Accounts"} value={individual} to="/customers" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "معدل تسجيل العملاء شهرياً" : "Monthly Registration Trend"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyReg}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="count" name={lang === "ar" ? "العملاء الجدد" : "New Customers"} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "توزيع العملاء حسب الدول" : "Customers by Country"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={countries} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {countries.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title={lang === "ar" ? "أعلى العملاء تحقيقاً للمبيعات" : "Top Customers by Revenue"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topCustomers} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
            <Bar dataKey="value" name={t("rpt.revenue")} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ===================== 6. SUPPLIERS =====================
export function SupplierDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const totalSuppliers = dData.suppliers?.cards?.total_suppliers ?? 0;
  const activeSuppliers = dData.suppliers?.cards?.active ?? 0;
  const archivedSuppliers = dData.suppliers?.cards?.archived ?? 0;

  const countries = (dData.suppliers?.charts?.country_distribution || []).map((c: any) => ({
    name: c.country_name,
    value: c.count,
  }));

  const top = (dData.suppliers?.charts?.top_suppliers_by_prices || []).map((s: any) => ({
    name: s.name,
    value: s.price_listings_count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={Handshake} label={lang === "ar" ? "إجمالي الموردين" : "Total Suppliers"} value={totalSuppliers} to="/suppliers" />
        <Kpi icon={Handshake} label={lang === "ar" ? "الموردون النشطون" : "Active Suppliers"} value={activeSuppliers} to="/suppliers" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الموردون المؤرشفون" : "Archived Suppliers"} value={archivedSuppliers} to="/suppliers" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "توزيع الموردين حسب الدول" : "Suppliers by Country"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={countries} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {countries.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "قوائم الأسعار حسب المورد" : "Price Listings by Supplier"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "عدد السجلات" : "Listings Count"} fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ===================== 7. INVOICES =====================
export function InvoiceDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const totalInvoices = dData.invoices?.cards?.total_invoices ?? 0;
  const totalCollected = dData.invoices?.cards?.total_collected_sar ?? 0;
  const collectionRate = dData.invoices?.cards?.collection_rate ?? 0;

  const paidCount = dData.invoices?.cards?.paid?.count ?? 0;
  const paidAmount = dData.invoices?.cards?.paid?.amount_sar ?? 0;

  const overdueCount = dData.invoices?.cards?.overdue?.count ?? 0;
  const overdueAmount = dData.invoices?.cards?.overdue?.amount_sar ?? 0;

  const scheduledCount = dData.invoices?.cards?.scheduled?.count ?? 0;
  const scheduledAmount = dData.invoices?.cards?.scheduled?.amount_sar ?? 0;

  const cancelledCount = dData.invoices?.cards?.cancelled?.count ?? 0;
  const cancelledAmount = dData.invoices?.cards?.cancelled?.amount_sar ?? 0;

  const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getEnglishMonthName = (num: number) => EN_MONTHS[num - 1] || "";

  const monthlyCollection = (dData.invoices?.charts?.monthly_collection_trend || []).map((m: any) => ({
    month: lang === "ar" ? m.month_name : getEnglishMonthName(m.month_num),
    collected: m.collected,
  }));

  const statusData = [
    { name: lang === "ar" ? "مدفوعة" : "Paid", value: paidAmount },
    { name: lang === "ar" ? "متأخرة" : "Overdue", value: overdueAmount },
    { name: lang === "ar" ? "مجدولة" : "Scheduled", value: scheduledAmount },
    { name: lang === "ar" ? "ملغاة" : "Cancelled", value: cancelledAmount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={ReceiptText} label={t("rpt.total_invoices")} value={totalInvoices} to="/invoices" />
        <Kpi icon={Banknote} label={lang === "ar" ? "إجمالي الكاش المحصل" : "Total Collected"} value={money(totalCollected, lang)} to="/invoices" />
        <Kpi icon={Percent} label={lang === "ar" ? "نسبة التحصيل" : "Collection Rate"} value={`${collectionRate.toFixed(1)} %`} to="/invoices" />
        <Kpi icon={Wallet} label={lang === "ar" ? "الفواتير المدفوعة" : "Paid Invoices"} value={`${paidCount} (${money(paidAmount, lang)})`} to="/invoices" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الفواتير المتأخرة" : "Overdue Invoices"} value={`${overdueCount} (${money(overdueAmount, lang)})`} to="/invoices" />
        <Kpi icon={Scale} label={lang === "ar" ? "الفواتير المجدولة" : "Scheduled Invoices"} value={`${scheduledCount} (${money(scheduledAmount, lang)})`} to="/invoices" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "الفواتير الملغاة" : "Cancelled Invoices"} value={`${cancelledCount} (${money(cancelledAmount, lang)})`} to="/invoices" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "التحصيل المالي الشهري" : "Monthly Collected Trend"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyCollection}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="collected" name={lang === "ar" ? "المحصل" : "Collected"} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "توزيع المبالغ حسب الحالة" : "Invoice Amounts by Status"}>
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
      </div>
    </div>
  );
}

// ===================== 8. TASKS =====================
export function TaskDashboard() {
  const { t, lang } = useI18n();
  const { data: dData, isLoading, isError } = useGetDashboardDataQuery();

  if (isLoading) return <Loading />;
  if (isError || !dData) return <div className="p-4 text-red-500 flex items-center justify-center h-48 border rounded-xl bg-slate-50 dark:bg-slate-900">Failed to load dashboard data</div>;

  const total = dData.tasks?.cards?.total_tasks ?? 0;
  const completed = dData.tasks?.cards?.completed ?? 0;
  const inProgress = dData.tasks?.cards?.in_progress ?? 0;
  const pending = dData.tasks?.cards?.pending ?? 0;
  const overdue = dData.tasks?.cards?.overdue ?? 0;

  const priorities = (dData.tasks?.charts?.priority_distribution || []).map((p: any) => ({
    name: p.priority === "urgent" ? (lang === "ar" ? "عاجل جداً" : "Urgent") : 
          p.priority === "high" ? (lang === "ar" ? "هام" : "High") :
          p.priority === "medium" ? (lang === "ar" ? "متوسط" : "Medium") : (lang === "ar" ? "منخفض" : "Low"),
    value: p.count,
  }));

  const statuses = (dData.tasks?.charts?.status_distribution || []).map((s: any) => ({
    name: s.status === "open" ? (lang === "ar" ? "مفتوحة" : "Open") : (lang === "ar" ? "بانتظار رد" : "Awaiting Reply"),
    value: s.count,
  }));

  const assignees = (dData.tasks?.charts?.top_assignees || []).map((a: any) => ({
    name: a.name,
    value: a.task_count ?? a.completed_tasks_count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={ClipboardList} label={lang === "ar" ? "إجمالي المهام" : "Total Tasks"} value={total} to="/tasks" />
        <Kpi icon={CalendarCheck} label={lang === "ar" ? "المهام المكتملة" : "Completed Tasks"} value={completed} to="/tasks" />
        <Kpi icon={TrendingUp} label={lang === "ar" ? "جاري العمل عليها" : "In Progress"} value={inProgress} to="/tasks" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "مهام معلقة" : "Pending Tasks"} value={pending} to="/tasks" />
        <Kpi icon={AlertTriangle} label={lang === "ar" ? "مهام متأخرة" : "Overdue Tasks"} value={overdue} to="/tasks" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={lang === "ar" ? "توزيع المهام حسب الأهمية" : "Priority Distribution"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priorities} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {priorities.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={lang === "ar" ? "توزيع المهام حسب الحالة" : "Status Distribution"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statuses} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {statuses.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      {assignees.length > 0 && (
        <ChartCard title={lang === "ar" ? "أعلى الموظفين إنجازاً للمهام" : "Top Assignees"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assignees} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
              <Bar dataKey="value" name={lang === "ar" ? "عدد المهام" : "Tasks Count"} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
