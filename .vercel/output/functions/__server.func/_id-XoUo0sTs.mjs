import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { q as Route$9, u as useI18n, e as useAuth, F as FINANCE_WRITE, I as InvStatusBadge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { L as Label } from "./_ssr/label-BWkpBOCr.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { b as formatMoney, a as formatDate } from "./_ssr/format-CMnhdgFc.mjs";
import { d as dbErrorMessage } from "./_ssr/db-errors-CH7zwDRs.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { A as ArrowLeft, aI as Printer, J as Mail, aJ as MessageCircle, aK as BadgeCheck, aw as Send, ax as Ban, Z as Plus, V as Trash2 } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-tooltip.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_ssr/simulation-engine.server-CqcvilV1.mjs";
import "./_ssr/checkbox-Co4oTAVV.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-label.mjs";
function KV({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function InvoiceDetail() {
  const {
    id
  } = Route$9.useParams();
  const {
    t,
    lang,
    dir
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole([...FINANCE_WRITE]);
  const [cancelOpen, setCancelOpen] = reactExports.useState(false);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const [itemOpen, setItemOpen] = reactExports.useState(false);
  const [descEn, setDescEn] = reactExports.useState("");
  const [descAr, setDescAr] = reactExports.useState("");
  const [qty, setQty] = reactExports.useState("1");
  const [price, setPrice] = reactExports.useState("");
  const [taxes, setTaxes] = reactExports.useState("0");
  const [fees, setFees] = reactExports.useState("0");
  const [busy, setBusy] = reactExports.useState(false);
  const q = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const [{
        data: inv,
        error
      }, {
        data: items2
      }, {
        data: allocs2
      }] = await Promise.all([supabase.from("invoices").select("*, customer:customers(name_en,name_ar,email,phone), booking:bookings(booking_no)").eq("id", id).maybeSingle(), supabase.from("invoice_items").select("*").eq("invoice_id", id).order("created_at"), supabase.from("receipt_allocations").select("*, receipt:receipts(receipt_no,receipt_date,payment_method,status)").eq("invoice_id", id).order("created_at")]);
      if (error) throw error;
      return {
        inv,
        items: items2 ?? [],
        allocs: allocs2 ?? []
      };
    }
  });
  const refresh = () => {
    qc.invalidateQueries({
      queryKey: ["invoice", id]
    });
    qc.invalidateQueries({
      queryKey: ["invoices"]
    });
  };
  const setStatus = async (status, extra) => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("invoices").update({
        status,
        ...extra
      }).eq("id", id);
      if (error) throw error;
      toast.success(t("label.saved", "Saved"));
      setCancelOpen(false);
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const addItem = async () => {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.from("invoice_items").insert({
        invoice_id: id,
        description_en: descEn,
        description_ar: descAr || null,
        quantity: Number(qty),
        unit_price: Number(price),
        taxes: Number(taxes),
        fees: Number(fees)
      });
      if (error) throw error;
      setItemOpen(false);
      setDescEn("");
      setDescAr("");
      setQty("1");
      setPrice("");
      setTaxes("0");
      setFees("0");
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };
  const removeItem = async (itemId) => {
    try {
      const {
        error
      } = await supabase.from("invoice_items").delete().eq("id", itemId);
      if (error) throw error;
      refresh();
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    }
  };
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  const x = q.data?.inv;
  if (!x) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.no_results") });
  const items = q.data.items;
  const allocs = q.data.allocs;
  const custName = x.customer ? lang === "ar" ? x.customer.name_ar || x.customer.name_en : x.customer.name_en || x.customer.name_ar : "—";
  const balance = Number(x.total_amount) - Number(x.paid_amount);
  const isDraft = x.status === "draft";
  const printInvoice = () => {
    const rows = items.map((i) => `<tr><td>${lang === "ar" ? i.description_ar || i.description_en : i.description_en}</td><td>${i.quantity}</td><td>${Number(i.unit_price).toLocaleString()}</td><td>${Number(i.taxes).toLocaleString()}</td><td>${Number(i.fees).toLocaleString()}</td><td>${Number(i.line_total).toLocaleString()}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><title>${x.invoice_no}</title>
<style>body{font-family:system-ui;padding:32px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;font-size:12px;text-align:start}tfoot td{font-weight:700}</style></head><body>
<h1>${t("inv.title")} · ${x.invoice_no}</h1>
<p>${t("inv.customer")}: ${custName}<br/>${t("inv.date")}: ${x.invoice_date} · ${t("inv.due_date")}: ${x.due_date}<br/>${t("label.status")}: ${t(`invstatus.${x.status}`)}</p>
<table><thead><tr><th>${t("inv.item_desc")}</th><th>${t("inv.qty")}</th><th>${t("inv.unit_price")}</th><th>${t("inv.taxes")}</th><th>${t("inv.fees")}</th><th>${t("inv.line_total")}</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="5">${t("inv.subtotal")}</td><td>${Number(x.subtotal).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.discount")}</td><td>${Number(x.discount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.total")} (${x.currency})</td><td>${Number(x.total_amount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.paid")}</td><td>${Number(x.paid_amount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.balance")}</td><td>${balance.toLocaleString()}</td></tr></tfoot></table>
<script>window.print()<\/script></body></html>`);
    w.document.close();
  };
  const shareText = `${t("inv.email_subject")} ${x.invoice_no} — ${formatMoney(Number(x.total_amount), x.currency, lang)}`;
  const emailHref = `mailto:${x.customer?.email ?? ""}?subject=${encodeURIComponent(`${t("inv.email_subject")} ${x.invoice_no}`)}&body=${encodeURIComponent(`${t("inv.email_body")}
${shareText}`)}`;
  const waHref = `https://wa.me/${String(x.customer?.phone ?? "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(shareText)}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: x.invoice_no, subtitle: `${custName} · ${formatMoney(Number(x.total_amount), x.currency, lang)}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/invoices"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printInvoice, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        t("inv.pdf")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: emailHref, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
        t("inv.send_email")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: waHref, target: "_blank", rel: "noreferrer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
        t("inv.send_whatsapp")
      ] }) }),
      canWrite && isDraft && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: busy, onClick: () => setStatus("issued"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4" }),
        t("inv.issue")
      ] }),
      canWrite && x.status === "issued" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: busy, onClick: () => setStatus("sent"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
        t("inv.mark_sent")
      ] }),
      canWrite && !["paid", "cancelled"].includes(x.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", size: "sm", onClick: () => setCancelOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
        t("inv.cancel")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InvStatusBadge, { status: x.status, t })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "general", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: t("inv.general") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "items", children: t("inv.items") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "payments", children: t("inv.payments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("inv.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("inv.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "general", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.customer"), value: custName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.booking"), value: x.booking?.booking_no }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.date"), value: formatDate(x.invoice_date, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.due_date"), value: formatDate(x.due_date, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.currency"), value: x.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.exchange_rate"), value: x.exchange_rate }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.subtotal"), value: formatMoney(Number(x.subtotal), x.currency, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.taxes"), value: formatMoney(Number(x.taxes), x.currency, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.fees"), value: formatMoney(Number(x.fees), x.currency, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.discount"), value: formatMoney(Number(x.discount), x.currency, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.total"), value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatMoney(Number(x.total_amount), x.currency, lang) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.paid"), value: formatMoney(Number(x.paid_amount), x.currency, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.balance"), value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: formatMoney(balance, x.currency, lang) }) }),
        x.cancellation_reason && /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("inv.cancel_reason"), value: x.cancellation_reason }),
        x.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.notes"), value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: x.notes }) }) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "items", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
            t("inv.items"),
            " (",
            items.length,
            ")"
          ] }),
          canWrite && isDraft && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setItemOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            t("inv.add_item")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("inv.item_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.qty") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.unit_price") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.taxes") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.fees") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("inv.line_total") }),
            canWrite && isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }),
            items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: lang === "ar" ? i.description_ar || i.description_en : i.description_en }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(i.quantity) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(i.unit_price).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(i.taxes).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end tabular-nums", children: Number(i.fees).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-medium tabular-nums", children: Number(i.line_total).toLocaleString() }),
              canWrite && isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeItem(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
            ] }, i.id))
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "payments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.number") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.date") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rct.method") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rct.amount") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          allocs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: t("label.no_results") }) }),
          allocs.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: a.receipt?.receipt_no }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: formatDate(a.receipt?.receipt_date, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: a.receipt ? t(`pm.${a.receipt.payment_method}`, a.receipt.payment_method) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-end tabular-nums", children: [
              Number(a.amount).toLocaleString(),
              " ",
              x.currency
            ] })
          ] }, a.id))
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "invoice", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "invoices", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: cancelOpen, onOpenChange: setCancelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("inv.cancel") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.cancel_reason") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: cancelReason, onChange: (e) => setCancelReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCancelOpen(false), children: t("actions.back") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy || !cancelReason.trim(), onClick: () => setStatus("cancelled", {
          cancellation_reason: cancelReason
        }), children: t("inv.cancel") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: itemOpen, onOpenChange: setItemOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { dir, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("inv.add_item") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.item_desc") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: descEn, onChange: (e) => setDescEn(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.item_desc_ar") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: descAr, onChange: (e) => setDescAr(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.qty") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: qty, onChange: (e) => setQty(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.unit_price") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: price, onChange: (e) => setPrice(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.taxes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: taxes, onChange: (e) => setTaxes(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("inv.fees") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: fees, onChange: (e) => setFees(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setItemOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addItem, disabled: busy || !descEn.trim() || !price, children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
export {
  InvoiceDetail as component
};
