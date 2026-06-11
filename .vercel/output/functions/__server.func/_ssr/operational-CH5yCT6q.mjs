import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, m as Route$g, B as Badge } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { a as formatDate, b as formatMoney } from "./format-CMnhdgFc.mjs";
import { r as round2, t as toBase, b as BASE_CURRENCY, f as fetchFxRates } from "./kpi-BRXHxgCd.mjs";
import { R as ReportToolbar } from "./-report-toolbar-Bl3VozSs.mjs";
import "../_libs/sonner.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/lucide-react.mjs";
import "./button-D2X9i3zo.mjs";
import "./switch-BwRKxUkF.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "./dialog-B3U_60pZ.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
function OperationalReport() {
  const {
    t,
    lang,
    dir
  } = useI18n();
  const search = Route$g.useSearch();
  const [from, setFrom] = reactExports.useState(search.from ?? "");
  const [to, setTo] = reactExports.useState(search.to ?? "");
  const [status, setStatus] = reactExports.useState(search.status ?? "all");
  const q = useQuery({
    queryKey: ["rpt-operational", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let query = supabase.from("bookings").select("id, booking_no, status, booking_date, currency, customer:customers(name_ar, name_en), rooms:booking_rooms(rooms, nights, total_selling, total_cost)").is("deleted_at", null).order("booking_date", {
        ascending: false
      });
      if (from) query = query.gte("booking_date", from);
      if (to) query = query.lte("booking_date", to);
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return {
        rows: data ?? [],
        fx
      };
    }
  });
  const statuses = reactExports.useMemo(() => Array.from(new Set((q.data?.rows ?? []).map((r) => r.status))).sort(), [q.data]);
  const filtered = reactExports.useMemo(() => (q.data?.rows ?? []).filter((r) => status === "all" || r.status === status), [q.data, status]);
  const exportRows = reactExports.useMemo(() => {
    const fx = q.data?.fx ?? {};
    return filtered.map((b) => {
      const cust = b.customer;
      const rooms = b.rooms ?? [];
      const roomsCount = rooms.reduce((a, r) => a + Number(r.rooms ?? 0), 0);
      const nights = rooms.reduce((a, r) => a + Number(r.nights ?? 0) * Number(r.rooms ?? 0), 0);
      const selling = rooms.reduce((a, r) => a + Number(r.total_selling ?? 0), 0);
      const sellingBase = round2(toBase(selling, b.currency, fx));
      return {
        booking_no: b.booking_no,
        customer: cust ? lang === "ar" ? cust.name_ar || cust.name_en : cust.name_en || cust.name_ar : "—",
        status: t(`status.${b.status}`, b.status),
        booking_date: formatDate(b.booking_date, lang),
        rooms: roomsCount,
        nights,
        selling: round2(selling),
        currency: b.currency,
        selling_base: sellingBase
      };
    });
  }, [filtered, q.data, lang, t]);
  const columns = [{
    key: "booking_no",
    label: t("label.code")
  }, {
    key: "customer",
    label: t("nav.customers")
  }, {
    key: "status",
    label: t("label.status")
  }, {
    key: "booking_date",
    label: t("label.created_at")
  }, {
    key: "rooms",
    label: t("rpt.rooms"),
    numeric: true
  }, {
    key: "nights",
    label: t("rpt.nights"),
    numeric: true
  }, {
    key: "selling",
    label: t("label.total"),
    numeric: true
  }, {
    key: "currency",
    label: t("label.currency")
  }, {
    key: "selling_base",
    label: `${t("label.total")} (${BASE_CURRENCY})`,
    numeric: true
  }];
  const totalBase = exportRows.reduce((a, r) => a + Number(r.selling_base ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.operational_title"), subtitle: t("rpt.operational_sub"), actions: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportToolbar, { reportKey: "operational", fileName: "operational-report", title: t("rpt.operational_title"), subtitle: `${from || "…"} → ${to || "…"}`, columns, rows: exportRows, config: {
      from: from || void 0,
      to: to || void 0,
      status: status !== "all" ? status : void 0
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 p-5 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("label.total") }),
              statuses.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`status.${s}`, s) }, s))
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: c.numeric ? "text-end" : "", children: c.label }, c.key)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: columns.length, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }) : exportRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: columns.length, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }) : exportRows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.booking_no }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.customer }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.booking_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.rooms }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.nights }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(r.selling).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.currency }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(r.selling_base).toLocaleString() })
        ] }, i)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        t("label.total"),
        ": ",
        formatMoney(round2(totalBase), BASE_CURRENCY, lang),
        " · ",
        exportRows.length,
        " ",
        t("rpt.records")
      ] })
    ] })
  ] });
}
export {
  OperationalReport as component
};
