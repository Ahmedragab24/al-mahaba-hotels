import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-uBlCHUHs.mjs";
import { c as createSsrRpc } from "./createSsrRpc-BABjPGaI.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DICWdMih.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, I as Building2, k as Hotel, d as FilePenLine, T as Tags, c as CalendarCheck, W as Wallet } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "./client-BdL2Ylqo.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const getMySupplierProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b430ce200499dc048ab7b076e73568074561eb7efabf614ba07ce3ef399dd4bb"));
const listMyHotels = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("057df38c0120ceaae680e3059fe1b092a628089670ccb33b0cd8b78db4502a44"));
const listMyRates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("2482d9d18bbbc7ca6d7b5b032f4179a4391105d3e3947316f3d5a4b4046b5083"));
const listMyBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8b5cb7eda2a5c859025bea234c7243fbe3aab8f11e0c4a974d6c5e47f489734e"));
const listMyPayables = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6cc532cdca1d2a0cc7e4ba9d96b5f1bcf907bbc9db57b37fc309cfa074c2ed86"));
function SupplierPortalPage() {
  const {
    t,
    lang
  } = useI18n();
  const profile = useQuery({
    queryKey: ["my-supplier"],
    queryFn: () => getMySupplierProfile()
  });
  if (profile.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (!profile.data?.supplier) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-12 w-12 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: t("supplier.portal.no_link_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t("supplier.portal.no_link_desc") })
    ] }) }) });
  }
  const s = profile.data.supplier;
  const stats = profile.data.stats;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: lang === "ar" ? s.name_ar : s.name_en, subtitle: `${s.code} · ${t(`supplier.type.${s.supplier_type}`)}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "h-5 w-5" }), label: t("nav.hotels"), value: stats.hotels }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "h-5 w-5" }), label: t("nav.contracts"), value: stats.contracts }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tags, { className: "h-5 w-5" }), label: t("nav.rates"), value: stats.rates }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-5 w-5" }), label: t("nav.bookings"), value: stats.bookings }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5" }), label: t("supplier.portal.outstanding"), value: stats.outstanding.toLocaleString(), accent: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "overview", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: t("supplier.portal.tab_overview") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "hotels", children: t("nav.hotels") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rates", children: t("nav.rates") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bookings", children: t("nav.bookings") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "payables", children: t("nav.payables") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: t("supplier.portal.profile") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("label.code"), value: s.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("label.type"), value: t(`supplier.type.${s.supplier_type}`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("label.email"), value: s.email ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("label.phone"), value: s.phone ?? "—" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hotels", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HotelsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rates", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatesTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bookings", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "payables", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PayablesTab, {}) })
    ] })
  ] });
}
function Kpi({
  icon,
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold mt-1 ${accent ? "text-amber-600" : ""}`, children: value })
  ] }) });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: value })
  ] });
}
function HotelsTab() {
  const {
    lang,
    t
  } = useI18n();
  const q = useQuery({
    queryKey: ["my-hotels"],
    queryFn: () => listMyHotels()
  });
  const rows = q.data?.rows ?? [];
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, {});
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: t("supplier.portal.empty_hotels") });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: rows.map((r) => r.hotels && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: lang === "ar" ? r.hotels.name_ar : r.hotels.name_en }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      r.hotels.code,
      " · ",
      "★".repeat(r.hotels.star_rating ?? 0)
    ] })
  ] }) }, r.hotels.id)) });
}
function RatesTab() {
  const {
    t
  } = useI18n();
  const q = useQuery({
    queryKey: ["my-rates"],
    queryFn: () => listMyRates()
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, {});
  const rows = q.data?.rows ?? [];
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: t("supplier.portal.empty_rates") });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.code") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.status") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.checkin") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.checkout") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.currency") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.status }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.valid_from }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.valid_to }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.currency })
    ] }, r.id)) })
  ] }) }) });
}
function BookingsTab() {
  const {
    t
  } = useI18n();
  const q = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listMyBookings()
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, {});
  const rows = q.data?.rows ?? [];
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: t("supplier.portal.empty_bookings") });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.checkin") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.checkout") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Nights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Rooms" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.status") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.check_in }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.check_out }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.nights }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.rooms }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: Number(r.total_cost).toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.confirmation_status }) })
    ] }, r.id)) })
  ] }) }) });
}
function PayablesTab() {
  const {
    t
  } = useI18n();
  const q = useQuery({
    queryKey: ["my-payables"],
    queryFn: () => listMyPayables()
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, {});
  const rows = q.data?.rows ?? [];
  if (rows.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: t("supplier.portal.empty_payables") });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Due" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Th, { children: t("label.status") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: r.due_date }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Td, { children: [
        Number(r.amount).toLocaleString(),
        " ",
        r.currency
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Td, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "paid" ? "default" : "secondary", children: r.status }) })
    ] }, r.id)) })
  ] }) }) });
}
const Th = ({
  children
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-start px-3 py-2 font-medium", children });
const Td = ({
  children
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children });
const Loader = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) });
const Empty = ({
  msg
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-muted-foreground text-sm", children: msg }) });
export {
  SupplierPortalPage as component
};
