import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-uBlCHUHs.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-D3oUK5Qe.mjs";
import { E as EXEC_ROLES, S as SALES_ROLES, B as BOOKING_ROLES, a as SUPPLIER_ROLES, F as FINANCE_ROLES, b as BASE_CURRENCY, r as round2, f as fetchFxRates, t as toBase, l as lastMonths, m as monthKey, c as agingBucket } from "./kpi-BRXHxgCd.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { b as formatMoney } from "./format-CMnhdgFc.mjs";
import "../_libs/sonner.mjs";
import { ac as ShieldAlert, E as Banknote, W as Wallet, g as Scale, u as Truck, o as TrendingUp, P as Percent, c as CalendarCheck, R as ReceiptText, w as FileText, B as BedDouble, ad as CalendarClock, ae as TriangleAlert } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, P as PieChart, b as Pie, c as Cell, L as Legend } from "../_libs/recharts.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "./simulation-engine.server-CqcvilV1.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 12
};
function take(r) {
  if (r.error) throw new Error(r.error.message);
  return r.data ?? [];
}
function Kpi({ icon: Icon, label, value, sub, to }) {
  const card = /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: to ? "h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" : "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 text-sm text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words text-lg font-bold leading-snug tabular-nums sm:text-xl xl:text-2xl", children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words text-xs text-muted-foreground", children: sub })
  ] }) });
  if (to) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "block h-full", children: card });
  return card;
}
function ChartCard({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "h-[300px]", children })
  ] });
}
function Loading() {
  const { t } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-muted-foreground", children: t("label.loading") });
}
function pickName(row, lang) {
  if (!row) return "—";
  return (lang === "ar" ? row.name_ar || row.name_en : row.name_en || row.name_ar) || "—";
}
const money = (n, lang) => formatMoney(round2(n), BASE_CURRENCY, lang);
function ExecutiveDashboard() {
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
        supabase.from("booking_rooms").select("total_cost, total_selling, booking:bookings!inner(status, currency, deleted_at)")
      ]);
      const inv = take(invR).filter((i) => i.status !== "cancelled");
      const rec = take(recR).filter((r) => r.status !== "cancelled");
      const pay = take(payR).filter((p) => p.status !== "cancelled");
      const bk = take(bkR);
      const qt = take(qtR);
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking;
        return b && !b.deleted_at && b.status !== "cancelled";
      });
      const revenue = inv.reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0);
      const collected = rec.reduce((a, r) => a + toBase(r.amount, r.currency, fx, r.exchange_rate), 0);
      const ar = inv.reduce((a, i) => a + toBase(Number(i.total_amount) - Number(i.paid_amount ?? 0), i.currency, fx, i.exchange_rate), 0);
      const ap = pay.reduce((a, p) => a + toBase(Number(p.amount) - Number(p.paid_amount ?? 0), p.currency, fx, p.exchange_rate), 0);
      const margin = rooms.reduce((a, r) => {
        const b = r.booking;
        return a + toBase(Number(r.total_selling ?? 0) - Number(r.total_cost ?? 0), b.currency, fx);
      }, 0);
      const accepted = qt.filter((x) => x.status === "accepted" || x.status === "converted").length;
      const conversion = qt.length ? accepted / qt.length * 100 : 0;
      const months = lastMonths(6);
      const byMonth = months.map((m) => ({
        month: m,
        revenue: round2(inv.filter((i) => monthKey(i.invoice_date) === m).reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0))
      }));
      return { revenue, collected, ar, ap, margin, conversion, bookings: bk.length, quotations: qt.length, invoices: inv.length, byMonth };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Banknote, label: t("rpt.revenue"), value: money(d.revenue, lang), to: "/invoices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Wallet, label: t("rpt.collected"), value: money(d.collected, lang), to: "/receipts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Scale, label: t("rpt.outstanding_ar"), value: money(d.ar, lang), to: "/invoices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Truck, label: t("rpt.outstanding_ap"), value: money(d.ap, lang), to: "/payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: TrendingUp, label: t("rpt.gross_margin"), value: money(d.margin, lang), to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Percent, label: t("rpt.conversion_rate"), value: `${d.conversion.toFixed(1)} %`, to: "/quotations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: CalendarCheck, label: t("rpt.total_bookings"), value: d.bookings, to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: ReceiptText, label: t("rpt.total_invoices"), value: d.invoices, sub: `${t("rpt.total_quotations")}: ${d.quotations}`, to: "/invoices" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.monthly_revenue"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.byMonth, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 12 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue", name: t("rpt.revenue"), fill: "var(--chart-1)", radius: [4, 4, 0, 0] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("rpt.base_note") })
  ] });
}
function SalesDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-sales"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const [qtR, invR] = await Promise.all([
        supabase.from("quotations").select("status, created_at, items:quotation_items(total_selling)").is("deleted_at", null),
        supabase.from("invoices").select("total_amount, currency, exchange_rate, status, invoice_date, customer:customers(name_ar, name_en)").is("deleted_at", null)
      ]);
      const qt = take(qtR);
      const inv = take(invR).filter((i) => i.status !== "cancelled");
      const statusCounts = {};
      for (const r of qt) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      const byStatus = Object.entries(statusCounts).map(([s, v]) => ({ name: t(`status.${s}`, s), value: v }));
      const quotedValue = qt.reduce((a, r) => a + (r.items ?? []).reduce((x, i) => x + Number(i.total_selling ?? 0), 0), 0);
      const accepted = qt.filter((x) => x.status === "accepted" || x.status === "converted").length;
      const conversion = qt.length ? accepted / qt.length * 100 : 0;
      const byCustomer = {};
      for (const i of inv) {
        const name = pickName(i.customer, lang);
        byCustomer[name] = (byCustomer[name] ?? 0) + toBase(i.total_amount, i.currency, fx, i.exchange_rate);
      }
      const topCustomers = Object.entries(byCustomer).map(([name, value]) => ({ name, value: round2(value) })).sort((a, b) => b.value - a.value).slice(0, 8);
      const months = lastMonths(6);
      const monthly = months.map((m) => ({
        month: m,
        invoiced: round2(inv.filter((i) => monthKey(i.invoice_date) === m).reduce((a, i) => a + toBase(i.total_amount, i.currency, fx, i.exchange_rate), 0))
      }));
      return { byStatus, quotedValue, conversion, total: qt.length, topCustomers, monthly };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: FileText, label: t("rpt.total_quotations"), value: d.total, to: "/quotations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Banknote, label: t("rpt.quoted_value"), value: money(d.quotedValue, lang), to: "/quotations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Percent, label: t("rpt.conversion_rate"), value: `${d.conversion.toFixed(1)} %`, to: "/quotations" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.quotes_by_status"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: d.byStatus, dataKey: "value", nameKey: "name", innerRadius: 55, outerRadius: 95, paddingAngle: 2, children: d.byStatus.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PALETTE[i % PALETTE.length] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.top_customers"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.topCustomers, layout: "vertical", margin: { left: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 120, tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: t("rpt.invoiced"), fill: "var(--chart-2)", radius: [0, 4, 4, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.monthly_revenue"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.monthly, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 12 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "invoiced", name: t("rpt.invoiced"), fill: "var(--chart-1)", radius: [4, 4, 0, 0] })
    ] }) }) })
  ] });
}
function BookingDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-bookings"],
    queryFn: async () => {
      const [bkR, roomsR] = await Promise.all([
        supabase.from("bookings").select("status, booking_date").is("deleted_at", null),
        supabase.from("booking_rooms").select("rooms, nights, check_in, hotel:hotels(name_ar, name_en), booking:bookings!inner(status, deleted_at)")
      ]);
      const bk = take(bkR);
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking;
        return b && !b.deleted_at && b.status !== "cancelled";
      });
      const statusCounts = {};
      for (const r of bk) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      const byStatus = Object.entries(statusCounts).map(([s, v]) => ({ name: t(`status.${s}`, s.replace(/_/g, " ")), value: v }));
      const roomNights = rooms.reduce((a, r) => a + Number(r.rooms ?? 0) * Number(r.nights ?? 0), 0);
      const now = Date.now();
      const week = now + 7 * 864e5;
      const upcoming = rooms.filter((r) => {
        if (!r.check_in) return false;
        const ts = new Date(r.check_in).getTime();
        return ts >= now && ts <= week;
      }).length;
      const byHotel = {};
      for (const r of rooms) {
        const name = pickName(r.hotel, lang);
        byHotel[name] = (byHotel[name] ?? 0) + Number(r.rooms ?? 0);
      }
      const topHotels = Object.entries(byHotel).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
      return { total: bk.length, byStatus, roomNights, upcoming, topHotels };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: CalendarCheck, label: t("rpt.total_bookings"), value: d.total, to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: BedDouble, label: t("rpt.room_nights"), value: d.roomNights, to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: CalendarClock, label: t("rpt.upcoming_checkins"), value: d.upcoming, to: "/bookings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.bookings_by_status"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: d.byStatus, dataKey: "value", nameKey: "name", innerRadius: 55, outerRadius: 95, paddingAngle: 2, children: d.byStatus.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PALETTE[i % PALETTE.length] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.rooms_by_hotel"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.topHotels, layout: "vertical", margin: { left: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 130, tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: t("rpt.rooms"), fill: "var(--chart-3)", radius: [0, 4, 4, 0] })
      ] }) }) })
    ] })
  ] });
}
function SupplierDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-suppliers"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const payR = await supabase.from("supplier_payables").select("amount, paid_amount, currency, exchange_rate, status, supplier:suppliers(name_ar, name_en)").is("deleted_at", null);
      const pay = take(payR).filter((p) => p.status !== "cancelled");
      const total = pay.reduce((a, p) => a + toBase(p.amount, p.currency, fx, p.exchange_rate), 0);
      const paid = pay.reduce((a, p) => a + toBase(p.paid_amount ?? 0, p.currency, fx, p.exchange_rate), 0);
      const outstanding = total - paid;
      const bySupplier = {};
      for (const p of pay) {
        const name = pickName(p.supplier, lang);
        bySupplier[name] = (bySupplier[name] ?? 0) + toBase(Number(p.amount) - Number(p.paid_amount ?? 0), p.currency, fx, p.exchange_rate);
      }
      const top = Object.entries(bySupplier).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value: round2(value) })).sort((a, b) => b.value - a.value).slice(0, 10);
      return { total, paid, outstanding, suppliersWithDues: top.length, top };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Truck, label: t("rpt.payables_total"), value: money(d.total, lang), to: "/payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Wallet, label: t("rpt.payables_paid"), value: money(d.paid, lang), to: "/payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Scale, label: t("rpt.outstanding_ap"), value: money(d.outstanding, lang), to: "/payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: TriangleAlert, label: t("rpt.suppliers_with_dues"), value: d.suppliersWithDues, to: "/suppliers" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.payables_by_supplier"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.top, layout: "vertical", margin: { left: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 140, tick: { fontSize: 11 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: t("rpt.outstanding"), fill: "var(--chart-4)", radius: [0, 4, 4, 0] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("rpt.base_note") })
  ] });
}
function ReceivablesDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-receivables"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const invR = await supabase.from("invoices").select("total_amount, paid_amount, due_date, currency, exchange_rate, status, customer:customers(name_ar, name_en)").is("deleted_at", null);
      const inv = take(invR).filter((i) => i.status !== "cancelled");
      const buckets = { current: 0, b30: 0, b60: 0, b90: 0, b90p: 0 };
      const byCustomer = {};
      let totalOutstanding = 0;
      for (const i of inv) {
        const out = toBase(Number(i.total_amount) - Number(i.paid_amount ?? 0), i.currency, fx, i.exchange_rate);
        if (out > 0) {
          buckets[agingBucket(i.due_date)] += out;
          totalOutstanding += out;
        }
        const name = pickName(i.customer, lang);
        const c = byCustomer[name] ??= { invoiced: 0, paid: 0 };
        c.invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
        c.paid += toBase(i.paid_amount ?? 0, i.currency, fx, i.exchange_rate);
      }
      const aging = Object.keys(buckets).map((k) => ({ name: t(`aging.${k}`), value: round2(buckets[k]) }));
      const debtors = Object.entries(byCustomer).map(([name, v]) => ({ name, invoiced: round2(v.invoiced), paid: round2(v.paid), balance: round2(v.invoiced - v.paid) })).filter((x) => x.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 10);
      const overdue = buckets.b30 + buckets.b60 + buckets.b90 + buckets.b90p;
      return { totalOutstanding, overdue, aging, debtors };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Scale, label: t("rpt.outstanding_ar"), value: money(d.totalOutstanding, lang), to: "/invoices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: TriangleAlert, label: t("rpt.overdue"), value: money(d.overdue, lang), to: "/invoices" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.aging_title"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.aging, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: t("rpt.outstanding"), fill: "var(--chart-5)", radius: [4, 4, 0, 0] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: t("rpt.top_debtors") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: d.debtors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("label.no_results") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: d.debtors.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 py-2.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: x.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 tabular-nums text-muted-foreground", children: money(x.balance, lang) })
        ] }, x.name)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("rpt.base_note") })
  ] });
}
function ProfitDashboard() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["rpt-profit"],
    queryFn: async () => {
      const fx = await fetchFxRates();
      const roomsR = await supabase.from("booking_rooms").select("total_cost, total_selling, check_in, hotel:hotels(name_ar, name_en), booking:bookings!inner(status, currency, deleted_at)");
      const rooms = take(roomsR).filter((r) => {
        const b = r.booking;
        return b && !b.deleted_at && b.status !== "cancelled";
      });
      let revenue = 0;
      let cost = 0;
      const byMonth = {};
      const byHotel = {};
      for (const r of rooms) {
        const b = r.booking;
        const sell = toBase(r.total_selling ?? 0, b.currency, fx);
        const cst = toBase(r.total_cost ?? 0, b.currency, fx);
        revenue += sell;
        cost += cst;
        const m = monthKey(r.check_in);
        const mm = byMonth[m] ??= { revenue: 0, cost: 0 };
        mm.revenue += sell;
        mm.cost += cst;
        const name = pickName(r.hotel, lang);
        byHotel[name] = (byHotel[name] ?? 0) + (sell - cst);
      }
      const profit = revenue - cost;
      const marginPct = revenue > 0 ? profit / revenue * 100 : 0;
      const months = lastMonths(6);
      const monthly = months.map((m) => ({
        month: m,
        revenue: round2(byMonth[m]?.revenue ?? 0),
        cost: round2(byMonth[m]?.cost ?? 0)
      }));
      const topHotels = Object.entries(byHotel).map(([name, value]) => ({ name, value: round2(value) })).sort((a, b) => b.value - a.value).slice(0, 8);
      return { revenue, cost, profit, marginPct, monthly, topHotels };
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {});
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Banknote, label: t("rpt.revenue"), value: money(d.revenue, lang), to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Wallet, label: t("rpt.cost"), value: money(d.cost, lang), to: "/payables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: TrendingUp, label: t("rpt.gross_margin"), value: money(d.profit, lang), to: "/bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Percent, label: t("rpt.margin_pct"), value: `${d.marginPct.toFixed(1)} %`, to: "/bookings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.revenue_vs_cost"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.monthly, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue", name: t("rpt.revenue"), fill: "var(--chart-1)", radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cost", name: t("rpt.cost"), fill: "var(--chart-3)", radius: [4, 4, 0, 0] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: t("rpt.profit_by_hotel"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: d.topHotels, layout: "vertical", margin: { left: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 130, tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: TOOLTIP_STYLE }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: t("rpt.gross_margin"), fill: "var(--chart-2)", radius: [0, 4, 4, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("rpt.base_note") })
  ] });
}
const TABS = [{
  key: "executive",
  labelKey: "rpt.tab_executive",
  roles: EXEC_ROLES,
  Comp: ExecutiveDashboard
}, {
  key: "sales",
  labelKey: "rpt.tab_sales",
  roles: SALES_ROLES,
  Comp: SalesDashboard
}, {
  key: "bookings",
  labelKey: "rpt.tab_bookings",
  roles: BOOKING_ROLES,
  Comp: BookingDashboard
}, {
  key: "suppliers",
  labelKey: "rpt.tab_suppliers",
  roles: SUPPLIER_ROLES,
  Comp: SupplierDashboard
}, {
  key: "receivables",
  labelKey: "rpt.tab_receivables",
  roles: FINANCE_ROLES,
  Comp: ReceivablesDashboard
}, {
  key: "profit",
  labelKey: "rpt.tab_profit",
  roles: FINANCE_ROLES,
  Comp: ProfitDashboard
}];
function ReportsHub() {
  const {
    t
  } = useI18n();
  const auth = useAuth();
  const visible = TABS.filter((tab) => auth.hasAnyRole(tab.roles));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.title"), subtitle: t("rpt.subtitle_dash") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-6 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5" }),
      " ",
      t("rpt.no_access")
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: visible[0].key, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "mb-6 flex h-auto flex-wrap justify-start", children: visible.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: tab.key, className: "px-4 py-2", children: t(tab.labelKey) }, tab.key)) }),
      visible.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: tab.key, children: /* @__PURE__ */ jsxRuntimeExports.jsx(tab.Comp, {}) }, tab.key))
    ] }) })
  ] });
}
export {
  ReportsHub as component
};
