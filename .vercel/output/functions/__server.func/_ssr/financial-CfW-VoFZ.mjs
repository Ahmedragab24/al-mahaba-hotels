import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth, n as Route$f } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-D3oUK5Qe.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { F as FINANCE_ROLES, m as monthKey, t as toBase, r as round2, b as BASE_CURRENCY, f as fetchFxRates } from "./kpi-BRXHxgCd.mjs";
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
function FinancialReport() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const search = Route$f.useSearch();
  const [from, setFrom] = reactExports.useState(search.from ?? "");
  const [to, setTo] = reactExports.useState(search.to ?? "");
  const allowed = auth.hasAnyRole(FINANCE_ROLES);
  const q = useQuery({
    enabled: allowed,
    queryKey: ["rpt-financial", from, to],
    queryFn: async () => {
      const fx = await fetchFxRates();
      let inv = supabase.from("invoices").select("invoice_date, total_amount, paid_amount, currency, exchange_rate, status, customer:customers(name_ar, name_en)").is("deleted_at", null);
      let rec = supabase.from("receipts").select("receipt_date, amount, currency, exchange_rate, status").is("deleted_at", null);
      let pay = supabase.from("supplier_payables").select("due_date, amount, paid_amount, currency, exchange_rate, status").is("deleted_at", null);
      if (from) {
        inv = inv.gte("invoice_date", from);
        rec = rec.gte("receipt_date", from);
      }
      if (to) {
        inv = inv.lte("invoice_date", to);
        rec = rec.lte("receipt_date", to);
      }
      const [i, r, p] = await Promise.all([inv, rec, pay]);
      if (i.error) throw i.error;
      if (r.error) throw r.error;
      if (p.error) throw p.error;
      return {
        fx,
        invoices: (i.data ?? []).filter((x) => x.status !== "cancelled"),
        receipts: (r.data ?? []).filter((x) => x.status !== "cancelled"),
        payables: (p.data ?? []).filter((x) => x.status !== "cancelled")
      };
    }
  });
  const {
    monthlyRows,
    balanceRows
  } = reactExports.useMemo(() => {
    if (!q.data) return {
      monthlyRows: [],
      balanceRows: []
    };
    const {
      fx,
      invoices,
      receipts,
      payables
    } = q.data;
    const months = {};
    const get = (m) => months[m] ??= {
      invoiced: 0,
      collected: 0,
      payables: 0,
      paid: 0
    };
    for (const i of invoices) get(monthKey(i.invoice_date)).invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
    for (const r of receipts) get(monthKey(r.receipt_date)).collected += toBase(r.amount, r.currency, fx, r.exchange_rate);
    for (const p of payables) {
      const m = get(monthKey(p.due_date));
      m.payables += toBase(p.amount, p.currency, fx, p.exchange_rate);
      m.paid += toBase(p.paid_amount ?? 0, p.currency, fx, p.exchange_rate);
    }
    const monthlyRows2 = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({
      month,
      invoiced: round2(v.invoiced),
      collected: round2(v.collected),
      payables: round2(v.payables),
      supplier_paid: round2(v.paid),
      net_cash: round2(v.collected - v.paid)
    }));
    const byCustomer = {};
    for (const i of invoices) {
      const c = i.customer;
      const name = c ? lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar : "—";
      const e = byCustomer[name] ??= {
        invoiced: 0,
        paid: 0
      };
      e.invoiced += toBase(i.total_amount, i.currency, fx, i.exchange_rate);
      e.paid += toBase(i.paid_amount ?? 0, i.currency, fx, i.exchange_rate);
    }
    const balanceRows2 = Object.entries(byCustomer).map(([customer, v]) => ({
      customer,
      invoiced: round2(v.invoiced),
      paid: round2(v.paid),
      balance: round2(v.invoiced - v.paid)
    })).sort((a, b) => b.balance - a.balance);
    return {
      monthlyRows: monthlyRows2,
      balanceRows: balanceRows2
    };
  }, [q.data, lang]);
  const columns = [{
    key: "month",
    label: t("rpt.month")
  }, {
    key: "invoiced",
    label: t("rpt.invoiced"),
    numeric: true
  }, {
    key: "collected",
    label: t("rpt.collected"),
    numeric: true
  }, {
    key: "payables",
    label: t("rpt.payables"),
    numeric: true
  }, {
    key: "supplier_paid",
    label: t("rpt.payables_paid"),
    numeric: true
  }, {
    key: "net_cash",
    label: t("rpt.net_cash"),
    numeric: true
  }];
  if (!allowed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.financial_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex items-center gap-3 p-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5" }),
        " ",
        t("rpt.no_access")
      ] }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.financial_title"), subtitle: `${t("rpt.financial_sub")} (${BASE_CURRENCY})`, actions: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportToolbar, { reportKey: "financial", fileName: "financial-report", title: t("rpt.financial_title"), subtitle: `${from || "…"} → ${to || "…"}`, columns, rows: monthlyRows, config: {
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }) : monthlyRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }) : monthlyRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.month }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.invoiced.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.collected.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.payables.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.supplier_paid.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-medium tabular-nums", children: r.net_cash.toLocaleString() })
        ] }, r.month)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: t("rpt.customer_balances") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("nav.customers") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rpt.invoiced") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rpt.paid") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rpt.balance") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: balanceRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }) : balanceRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.customer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.invoiced.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: r.paid.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-medium tabular-nums", children: r.balance.toLocaleString() })
          ] }, r.customer)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  FinancialReport as component
};
