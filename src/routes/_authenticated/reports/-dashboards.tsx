// Dashboard widgets — six role-gated dashboards with real KPI calculations (BR-RPT-001 → BR-RPT-006).
import { useQuery } from "@tanstack/react-query";
import { Link, type LinkProps } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
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

type Take<T> = { data: T[] | null; error: { message: string } | null };
function take<T>(r: Take<T>): T[] {
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
  const q = useQuery({
    queryKey: ["rpt-exec"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const [invR, recR, payR, bkR, qtR, roomsR] = await Promise.all([
        supabase.from("invoices").select("total_amount, paid_amount, currency, exchange_rate, status, invoice_date").is("deleted_at", null),
        supabase.from("receipts").select("amount, currency, exchange_rate, status").is("deleted_at", null),
        supabase.from("supplier_payables").select("amount, paid_amount, currency, exchange_rate, status").is("deleted_at", null),
        supabase.from("bookings").select("status").is("deleted_at", null),
        supabase.from("quotations").select("status").is("deleted_at", null),
        supabase.from("booking_rooms").select("total_cost, total_selling, booking:bookings!inner(status, currency, deleted_at)"),
      ]);
      const inv = take(invR).filter((i) => i.status !== "cancelled");
      const rec = take(recR).filter((r) => r.status !== "cancelled");
      const pay = take(payR).filter((p) => p.status !== "cancelled");
      const bk = take(bkR);
      const qt = take(qtR);
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking as { status: string; deleted_at: string | null; currency: string } | null;
        return b && !b.deleted_at && b.status !== "cancelled";
      });

      const revenue = inv.reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0);
      const collected = rec.reduce((a, r) => a + toBase(r.amount, r.currency, fx, r.exchange_rate), 0);
      const ar = inv.reduce((a, i) => a + toBase(Number(i.total_amount) - Number(i.paid_amount ?? 0), i.currency, fx, i.exchange_rate), 0);
      const ap = pay.reduce((a, p) => a + toBase(Number(p.amount) - Number(p.paid_amount ?? 0), p.currency, fx, p.exchange_rate), 0);
      const margin = rooms.reduce((a, r) => {
        const b = r.booking as unknown as { currency: string };
        return a + toBase(Number(r.total_selling ?? 0) - Number(r.total_cost ?? 0), b.currency, fx);
      }, 0);
      const accepted = qt.filter((x) => x.status === "accepted" || x.status === "converted").length;
      const conversion = qt.length ? (accepted / qt.length) * 100 : 0;

      const months = lastMonths(6);
      const byMonth = months.map((m) => ({
        month: m,
        revenue: round2(inv.filter((i) => monthKey(i.invoice_date) === m).reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0)),
      }));

      return { revenue, collected, ar, ap, margin, conversion, bookings: bk.length, quotations: qt.length, invoices: inv.length, byMonth };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Banknote} label={t("rpt.revenue")} value={money(d.revenue, lang)} to="/invoices" />
        <Kpi icon={Wallet} label={t("rpt.collected")} value={money(d.collected, lang)} to="/receipts" />
        <Kpi icon={Scale} label={t("rpt.outstanding_ar")} value={money(d.ar, lang)} to="/invoices" />
        <Kpi icon={Truck} label={t("rpt.outstanding_ap")} value={money(d.ap, lang)} to="/payables" />
        <Kpi icon={TrendingUp} label={t("rpt.gross_margin")} value={money(d.margin, lang)} to="/bookings" />
        <Kpi icon={Percent} label={t("rpt.conversion_rate")} value={`${d.conversion.toFixed(1)} %`} to="/quotations" />
        <Kpi icon={CalendarCheck} label={t("rpt.total_bookings")} value={d.bookings} to="/bookings" />
        <Kpi icon={ReceiptText} label={t("rpt.total_invoices")} value={d.invoices} sub={`${t("rpt.total_quotations")}: ${d.quotations}`} to="/invoices" />
      </div>
      <ChartCard title={t("rpt.monthly_revenue")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={d.byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
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
  const q = useQuery({
    queryKey: ["rpt-sales"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const [qtR, invR] = await Promise.all([
        supabase.from("quotations").select("status, created_at, items:quotation_items(total_selling)").is("deleted_at", null),
        supabase.from("invoices").select("total_amount, currency, exchange_rate, status, invoice_date, customer:customers(name_ar, name_en)").is("deleted_at", null),
      ]);
      const qt = take(qtR);
      const inv = take(invR).filter((i) => i.status !== "cancelled");

      const statusCounts: Record<string, number> = {};
      for (const r of qt) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      const byStatus = Object.entries(statusCounts).map(([s, v]) => ({ name: t(`status.${s}`, s), value: v }));

      const quotedValue = qt.reduce((a, r) => a + ((r.items as { total_selling: number }[]) ?? []).reduce((x, i) => x + Number(i.total_selling ?? 0), 0), 0);
      const accepted = qt.filter((x) => x.status === "accepted" || x.status === "converted").length;
      const conversion = qt.length ? (accepted / qt.length) * 100 : 0;

      const byCustomer: Record<string, number> = {};
      for (const i of inv) {
        const name = pickName(i.customer as { name_ar: string; name_en: string } | null, lang);
        byCustomer[name] = (byCustomer[name] ?? 0) + toBase(i.total_amount, i.currency, fx, i.exchange_rate);
      }
      const topCustomers = Object.entries(byCustomer)
        .map(([name, value]) => ({ name, value: round2(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const months = lastMonths(6);
      const monthly = months.map((m) => ({
        month: m,
        invoiced: round2(inv.filter((i) => monthKey(i.invoice_date) === m).reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0)),
      }));

      return { byStatus, quotedValue, conversion, total: qt.length, topCustomers, monthly };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={FileText} label={t("rpt.total_quotations")} value={d.total} to="/quotations" />
        <Kpi icon={Banknote} label={t("rpt.quoted_value")} value={money(d.quotedValue, lang)} to="/quotations" />
        <Kpi icon={Percent} label={t("rpt.conversion_rate")} value={`${d.conversion.toFixed(1)} %`} to="/quotations" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.quotes_by_status")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={d.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {d.byStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("rpt.top_customers")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.topCustomers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name={t("rpt.invoiced")} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title={t("rpt.monthly_revenue")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={d.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
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
  const q = useQuery({
    queryKey: ["rpt-bookings"],
    queryFn: async () => {
      const [bkR, roomsR] = await Promise.all([
        supabase.from("bookings").select("status, booking_date").is("deleted_at", null),
        supabase.from("booking_rooms").select("rooms, nights, check_in, hotel:hotels(name_ar, name_en), booking:bookings!inner(status, deleted_at)"),
      ]);
      const bk = take(bkR);
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking as { status: string; deleted_at: string | null } | null;
        return b && !b.deleted_at && b.status !== "cancelled";
      });

      const statusCounts: Record<string, number> = {};
      for (const r of bk) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      const byStatus = Object.entries(statusCounts).map(([s, v]) => ({ name: t(`status.${s}`, s.replace(/_/g, " ")), value: v }));

      const roomNights = rooms.reduce((a, r) => a + Number(r.rooms ?? 0) * Number(r.nights ?? 0), 0);
      const now = Date.now();
      const week = now + 7 * 86400000;
      const upcoming = rooms.filter((r) => {
        if (!r.check_in) return false;
        const ts = new Date(r.check_in).getTime();
        return ts >= now && ts <= week;
      }).length;

      const byHotel: Record<string, number> = {};
      for (const r of rooms) {
        const name = pickName(r.hotel as { name_ar: string; name_en: string } | null, lang);
        byHotel[name] = (byHotel[name] ?? 0) + Number(r.rooms ?? 0);
      }
      const topHotels = Object.entries(byHotel)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      return { total: bk.length, byStatus, roomNights, upcoming, topHotels };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi icon={CalendarCheck} label={t("rpt.total_bookings")} value={d.total} to="/bookings" />
        <Kpi icon={BedDouble} label={t("rpt.room_nights")} value={d.roomNights} to="/bookings" />
        <Kpi icon={CalendarClock} label={t("rpt.upcoming_checkins")} value={d.upcoming} to="/bookings" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.bookings_by_status")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={d.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {d.byStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("rpt.rooms_by_hotel")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.topHotels} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
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
  const q = useQuery({
    queryKey: ["rpt-suppliers"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const payR = await supabase
        .from("supplier_payables")
        .select("amount, paid_amount, currency, exchange_rate, status, supplier:suppliers(name_ar, name_en)")
        .is("deleted_at", null);
      const pay = take(payR).filter((p) => p.status !== "cancelled");

      const total = pay.reduce((a, p) => a + toBase(p.amount, p.currency, fx, p.exchange_rate), 0);
      const paid = pay.reduce((a, p) => a + toBase(p.paid_amount ?? 0, p.currency, fx, p.exchange_rate), 0);
      const outstanding = total - paid;

      const bySupplier: Record<string, number> = {};
      for (const p of pay) {
        const name = pickName(p.supplier as { name_ar: string; name_en: string } | null, lang);
        bySupplier[name] = (bySupplier[name] ?? 0) + toBase(Number(p.amount) - Number(p.paid_amount ?? 0), p.currency, fx, p.exchange_rate);
      }
      const top = Object.entries(bySupplier)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value: round2(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return { total, paid, outstanding, suppliersWithDues: top.length, top };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Truck} label={t("rpt.payables_total")} value={money(d.total, lang)} to="/payables" />
        <Kpi icon={Wallet} label={t("rpt.payables_paid")} value={money(d.paid, lang)} to="/payables" />
        <Kpi icon={Scale} label={t("rpt.outstanding_ap")} value={money(d.outstanding, lang)} to="/payables" />
        <Kpi icon={AlertTriangle} label={t("rpt.suppliers_with_dues")} value={d.suppliersWithDues} to="/suppliers" />
      </div>
      <ChartCard title={t("rpt.payables_by_supplier")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={d.top} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name={t("rpt.outstanding")} fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <p className="text-xs text-muted-foreground">{t("rpt.base_note")}</p>
    </div>
  );
}

// ===================== RECEIVABLES =====================
export function ReceivablesDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-receivables"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const invR = await supabase
        .from("invoices")
        .select("total_amount, paid_amount, due_date, currency, exchange_rate, status, customer:customers(name_ar, name_en)")
        .is("deleted_at", null);
      const inv = take(invR).filter((i) => i.status !== "cancelled");

      const buckets: Record<AgingBucket, number> = { current: 0, b30: 0, b60: 0, b90: 0, b90p: 0 };
      const byCustomer: Record<string, { invoiced: number; paid: number }> = {};
      let totalOutstanding = 0;
      for (const i of inv) {
        const out = toBase(Number(i.total_amount) - Number(i.paid_amount ?? 0), i.currency, fx, i.exchange_rate);
        if (out > 0) {
          buckets[agingBucket(i.due_date)] += out;
          totalOutstanding += out;
        }
        const name = pickName(i.customer as { name_ar: string; name_en: string } | null, lang);
        const c = (byCustomer[name] ??= { invoiced: 0, paid: 0 });
        c.invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
        c.paid += toBase(i.paid_amount ?? 0, i.currency, fx, i.exchange_rate);
      }
      const aging = (Object.keys(buckets) as AgingBucket[]).map((k) => ({ name: t(`aging.${k}`), value: round2(buckets[k]) }));
      const debtors = Object.entries(byCustomer)
        .map(([name, v]) => ({ name, invoiced: round2(v.invoiced), paid: round2(v.paid), balance: round2(v.invoiced - v.paid) }))
        .filter((x) => x.balance > 0)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
      const overdue = buckets.b30 + buckets.b60 + buckets.b90 + buckets.b90p;

      return { totalOutstanding, overdue, aging, debtors };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi icon={Scale} label={t("rpt.outstanding_ar")} value={money(d.totalOutstanding, lang)} to="/invoices" />
        <Kpi icon={AlertTriangle} label={t("rpt.overdue")} value={money(d.overdue, lang)} to="/invoices" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.aging_title")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.aging}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name={t("rpt.outstanding")} fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t("rpt.top_debtors")}</CardTitle></CardHeader>
          <CardContent>
            {d.debtors.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("label.no_results")}</p>
            ) : (
              <ul className="divide-y">
                {d.debtors.map((x) => (
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
      <p className="text-xs text-muted-foreground">{t("rpt.base_note")}</p>
    </div>
  );
}

// ===================== PROFIT =====================
export function ProfitDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-profit"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const roomsR = await supabase
        .from("booking_rooms")
        .select("total_cost, total_selling, check_in, hotel:hotels(name_ar, name_en), booking:bookings!inner(status, currency, deleted_at)");
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking as { status: string; deleted_at: string | null } | null;
        return b && !b.deleted_at && b.status !== "cancelled";
      });

      let revenue = 0;
      let cost = 0;
      const byMonth: Record<string, { revenue: number; cost: number }> = {};
      const byHotel: Record<string, number> = {};
      for (const r of rooms) {
        const b = r.booking as unknown as { currency: string };
        const sell = toBase(r.total_selling ?? 0, b.currency, fx);
        const cst = toBase(r.total_cost ?? 0, b.currency, fx);
        revenue += sell;
        cost += cst;
        const m = monthKey(r.check_in);
        const mm = (byMonth[m] ??= { revenue: 0, cost: 0 });
        mm.revenue += sell;
        mm.cost += cst;
        const name = pickName(r.hotel as { name_ar: string; name_en: string } | null, lang);
        byHotel[name] = (byHotel[name] ?? 0) + (sell - cst);
      }
      const profit = revenue - cost;
      const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
      const months = lastMonths(6);
      const monthly = months.map((m) => ({
        month: m,
        revenue: round2(byMonth[m]?.revenue ?? 0),
        cost: round2(byMonth[m]?.cost ?? 0),
      }));
      const topHotels = Object.entries(byHotel)
        .map(([name, value]) => ({ name, value: round2(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      return { revenue, cost, profit, marginPct, monthly, topHotels };
    },
  });

  if (q.isLoading) return <Loading />;
  const d = q.data!;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Banknote} label={t("rpt.revenue")} value={money(d.revenue, lang)} to="/bookings" />
        <Kpi icon={Wallet} label={t("rpt.cost")} value={money(d.cost, lang)} to="/payables" />
        <Kpi icon={TrendingUp} label={t("rpt.gross_margin")} value={money(d.profit, lang)} to="/bookings" />
        <Kpi icon={Percent} label={t("rpt.margin_pct")} value={`${d.marginPct.toFixed(1)} %`} to="/bookings" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title={t("rpt.revenue_vs_cost")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="revenue" name={t("rpt.revenue")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name={t("rpt.cost")} fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("rpt.profit_by_hotel")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.topHotels} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name={t("rpt.gross_margin")} fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <p className="text-xs text-muted-foreground">{t("rpt.base_note")}</p>
    </div>
  );
}
