import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth, l as Route$h } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { a as formatDate, b as formatMoney } from "./format-CMnhdgFc.mjs";
import { F as FINANCE_ROLES, r as round2, t as toBase, b as BASE_CURRENCY, f as fetchFxRates } from "./kpi-BRXHxgCd.mjs";
import { R as ReportToolbar } from "./-report-toolbar-Bl3VozSs.mjs";
import "../_libs/sonner.mjs";
import { ac as ShieldAlert } from "../_libs/lucide-react.mjs";
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
import "./button-D2X9i3zo.mjs";
import "./switch-BwRKxUkF.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "./dialog-B3U_60pZ.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
function TaxReport() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const search = Route$h.useSearch();
  const [from, setFrom] = reactExports.useState(search.from ?? "");
  const [to, setTo] = reactExports.useState(search.to ?? "");
  const allowed = auth.hasAnyRole(FINANCE_ROLES);
  const q = useQuery({
    enabled: allowed,
    queryKey: ["rpt-tax", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let query = supabase.from("invoices").select("invoice_no, invoice_date, subtotal, taxes, total_amount, currency, exchange_rate, status, customer:customers(name_ar, name_en)").is("deleted_at", null).order("invoice_date", {
        ascending: false
      });
      if (from) query = query.gte("invoice_date", from);
      if (to) query = query.lte("invoice_date", to);
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return {
        fx,
        rows: (data ?? []).filter((x) => x.status !== "cancelled")
      };
    }
  });
  const rows = reactExports.useMemo(() => {
    if (!q.data) return [];
    const {
      fx
    } = q.data;
    return q.data.rows.map((i) => {
      const c = i.customer;
      return {
        invoice_no: i.invoice_no,
        date: formatDate(i.invoice_date, lang),
        customer: c ? lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar : "—",
        subtotal: round2(Number(i.subtotal ?? 0)),
        taxes: round2(Number(i.taxes ?? 0)),
        total: round2(Number(i.total_amount ?? 0)),
        currency: i.currency,
        taxes_base: round2(toBase(i.taxes ?? 0, i.currency, fx, i.exchange_rate))
      };
    });
  }, [q.data, lang]);
  const totalTaxBase = rows.reduce((a, r) => a + Number(r.taxes_base ?? 0), 0);
  const columns = [{
    key: "invoice_no",
    label: t("label.code")
  }, {
    key: "date",
    label: t("label.created_at")
  }, {
    key: "customer",
    label: t("nav.customers")
  }, {
    key: "subtotal",
    label: t("rpt.subtotal"),
    numeric: true
  }, {
    key: "taxes",
    label: t("rpt.taxes"),
    numeric: true
  }, {
    key: "total",
    label: t("label.total"),
    numeric: true
  }, {
    key: "currency",
    label: t("label.currency")
  }, {
    key: "taxes_base",
    label: `${t("rpt.taxes")} (${BASE_CURRENCY})`,
    numeric: true
  }];
  if (!allowed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.tax_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5" }),
        " ",
        t("rpt.no_access")
      ] }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.tax_title"), subtitle: t("rpt.tax_sub"), actions: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportToolbar, { reportKey: "tax", fileName: "tax-report", title: t("rpt.tax_title"), subtitle: `${from || "…"} → ${to || "…"}`, columns, rows, config: {
      from: from || void 0,
      to: to || void 0
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 p-5 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: c.numeric ? "text-end" : "", children: c.label }, c.key)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: columns.length, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: columns.length, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }) : rows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.invoice_no }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.customer }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(r.subtotal).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(r.taxes).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(r.total).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.currency }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-medium tabular-nums", children: Number(r.taxes_base).toLocaleString() })
        ] }, i)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        t("rpt.taxes"),
        ": ",
        formatMoney(round2(totalTaxBase), BASE_CURRENCY, lang),
        " · ",
        rows.length,
        " ",
        t("rpt.records")
      ] })
    ] })
  ] });
}
export {
  TaxReport as component
};
