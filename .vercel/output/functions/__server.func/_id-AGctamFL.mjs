import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { t as Route$3, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { A as ApprovalWorkflow } from "./_ssr/approval-workflow-BEWDKdSF.mjs";
import { d as dbErrorMessage } from "./_ssr/db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { C as ContractForm } from "./_ssr/-form-aQXwJwZZ.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { C as CircleCheck, z as CircleX, aL as Pause, aM as Lock, Q as Play, A as ArrowLeft, _ as Pencil } from "./_libs/lucide-react.mjs";
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
import "./_ssr/textarea-BvXe9TDs.mjs";
import "./_ssr/dialog-B3U_60pZ.mjs";
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
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_ssr/lookups-DjTAjyZF.mjs";
import "./_ssr/input-B9Lwb7ES.mjs";
import "./_ssr/select-CiTC5spL.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
const TRANSITIONS = {
  draft: [{
    to: "active",
    labelKey: "contracts.activate",
    icon: Play
  }],
  active: [{
    to: "suspended",
    labelKey: "contracts.suspend",
    icon: Pause
  }, {
    to: "expired",
    labelKey: "contracts.mark_expired",
    icon: CircleX
  }, {
    to: "terminated",
    labelKey: "contracts.terminate",
    icon: CircleX
  }, {
    to: "closed",
    labelKey: "contracts.close",
    icon: Lock
  }],
  suspended: [{
    to: "active",
    labelKey: "contracts.resume",
    icon: CircleCheck
  }, {
    to: "terminated",
    labelKey: "contracts.terminate",
    icon: CircleX
  }],
  expired: [],
  terminated: [],
  closed: []
};
function KV({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: mono ? "font-mono text-sm" : "text-sm", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function ContractDetail() {
  const {
    id
  } = Route$3.useParams();
  const search = Route$3.useSearch();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "operations_manager"]);
  const [editing, setEditing] = reactExports.useState(!!search.edit);
  const [pendingStatus, setPendingStatus] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("supplier_contracts").select("*, supplier:suppliers(id,name_en,name_ar), hotel:hotels(id,name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const rates = useQuery({
    queryKey: ["contract-rates", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rates").select("id,code,valid_from,valid_to,currency,selling_price,status,deleted_at,room_type:hotel_room_types(name_en,name_ar)").eq("contract_id", id).order("valid_from", {
        ascending: false
      }).limit(100);
      if (error) throw error;
      return data ?? [];
    }
  });
  const statusMut = useMutation({
    mutationFn: async (to) => {
      const {
        data: u
      } = await supabase.auth.getUser();
      const {
        error
      } = await supabase.from("supplier_contracts").update({
        status: to,
        updated_by: u.user?.id ?? null
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["contract", id]
      });
      qc.invalidateQueries({
        queryKey: ["contracts"]
      });
      setPendingStatus(null);
    },
    onError: (e) => {
      toast.error(dbErrorMessage(e, t));
      setPendingStatus(null);
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("contracts.no_found") });
  const c = q.data;
  const transitions = c.deleted_at ? [] : TRANSITIONS[c.status] ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: c.title || c.contract_number, subtitle: `${c.contract_number} · ${t(`ctrtype.${c.contract_type}`)}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/contracts"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      canWrite && !editing && !c.deleted_at && c.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      canApprove && transitions.map((tr) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: tr.to === "active" ? "default" : "outline", onClick: () => setPendingStatus(tr.to), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(tr.icon, { className: "h-4 w-4" }),
        t(tr.labelKey)
      ] }, tr.to)),
      c.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: c.status })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("contracts.tab.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "rates", children: [
          t("contracts.tab.rates"),
          " (",
          rates.data?.length ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("tab.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approval", children: t("tab.approval") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("contracts.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(ContractForm, { initial: c, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["contract", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.contract_number"), value: c.contract_number, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("contracts.name"), value: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("contracts.type"), value: t(`ctrtype.${c.contract_type}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("contracts.supplier"), value: c.supplier ? lang === "ar" ? c.supplier.name_ar || c.supplier.name_en : c.supplier.name_en || c.supplier.name_ar : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("contracts.hotel"), value: c.hotel ? lang === "ar" ? c.hotel.name_ar || c.hotel.name_en : c.hotel.name_en || c.hotel.name_ar : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.status"), value: t(`status.${c.status}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.start_date"), value: formatDate(c.start_date, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.end_date"), value: formatDate(c.end_date, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.currency"), value: c.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("contracts.commission_type"), value: c.commission_type === "fixed" ? t("calc.fixed") : t("calc.percentage") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: c.commission_type === "fixed" ? t("label.tax_value") : t("label.commission_pct"), value: c.commission_pct }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.credit_days"), value: c.credit_days }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.payment_terms"), value: c.payment_terms }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(c.created_at, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.updated_at"), value: formatDateTime(c.updated_at, lang) }),
        c.cancellation_terms && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.penalty_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: c.cancellation_terms })
        ] }),
        c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: c.notes })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("nav.room_types") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          (rates.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("contracts.no_rates") }) }),
          rates.data?.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: x.deleted_at ? "opacity-60" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
              id: x.id
            }, className: "hover:underline", children: x.code }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: x.room_type ? lang === "ar" ? x.room_type.name_ar || x.room_type.name_en : x.room_type.name_en || x.room_type.name_ar : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(x.valid_from, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(x.valid_to, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: x.currency }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: x.status }) })
          ] }, x.id))
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "contract", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approval", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalWorkflow, { entityType: "contract", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "supplier_contracts", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!pendingStatus, onOpenChange: (v) => !v && setPendingStatus(null), title: t("contracts.confirm_status"), description: pendingStatus ? `${t(`status.${c.status}`)} → ${t(`status.${pendingStatus}`)}` : "", destructive: pendingStatus === "terminated", onConfirm: () => pendingStatus && statusMut.mutate(pendingStatus) })
  ] });
}
export {
  ContractDetail as component
};
