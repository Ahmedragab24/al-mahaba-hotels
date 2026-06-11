import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-uBlCHUHs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { a as approveSupplierApplication, r as rejectSupplierApplication, l as listSupplierApplications } from "./supplier-applications.functions-CZ5a9G9t.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, J as Mail, K as Phone, N as Check, X, I as Building2, w as FileText, O as Copy } from "../_libs/lucide-react.mjs";
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
import "./createSsrRpc-BABjPGaI.mjs";
import "./server-BR2a3ZJC.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-DICWdMih.mjs";
function SupplierApplicationsPage() {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("pending");
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const [rejecting, setRejecting] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [credentials, setCredentials] = reactExports.useState(null);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["supplier-applications"],
    queryFn: () => listSupplierApplications()
  });
  const approve = useMutation({
    mutationFn: (id) => approveSupplierApplication({
      data: {
        id
      }
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({
        queryKey: ["supplier-applications"]
      });
      setSelected(null);
      setCredentials({
        email: res.email,
        password: res.password
      });
      toast.success(t("supplier.applications.approved"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e))
  });
  const reject = useMutation({
    mutationFn: () => rejectSupplierApplication({
      data: {
        id: rejecting.id,
        reason
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["supplier-applications"]
      });
      setRejecting(null);
      setReason("");
      toast.success(t("supplier.applications.rejected"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e))
  });
  const rows = data?.rows ?? [];
  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.name_ar.toLowerCase().includes(s) || r.name_en.toLowerCase().includes(s) || r.contact_email.toLowerCase().includes(s) || r.contact_name.toLowerCase().includes(s);
  });
  const counts = {
    pending: rows.filter((r) => r.status === "pending" || r.status === "under_review").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("supplier.applications.title"), subtitle: t("supplier.applications.subtitle") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row gap-3 items-stretch sm:items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: t("actions.search"), value: search, onChange: (e) => setSearch(e.target.value), className: "sm:max-w-xs" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", children: [
          t("supplier.applications.tab_pending"),
          " (",
          counts.pending,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "approved", children: [
          t("supplier.applications.tab_approved"),
          " (",
          counts.approved,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "rejected", children: [
          t("supplier.applications.tab_rejected"),
          " (",
          counts.rejected,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", children: [
          t("supplier.applications.tab_all"),
          " (",
          counts.all,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: tab, className: "mt-4", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-muted-foreground", children: t("supplier.applications.empty") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: filtered.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => setSelected(app), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex flex-col sm:flex-row sm:items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold truncate", children: lang === "ar" ? app.name_ar : app.name_en }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`supplier.type.${app.supplier_type}`) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: app.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
              app.contact_email
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
              app.contact_phone
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(app.submitted_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US") })
          ] })
        ] }),
        (app.status === "pending" || app.status === "under_review") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => approve.mutate(app.id), disabled: approve.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 me-1" }),
            t("actions.approve")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setRejecting(app), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 me-1" }),
            t("actions.reject")
          ] })
        ] })
      ] }) }, app.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!selected, onOpenChange: (o) => !o && setSelected(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-2xl", children: selected && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: lang === "ar" ? selected.name_ar : selected.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          t(`supplier.type.${selected.supplier_type}`),
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: selected.status })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }), label: t("label.name_en"), value: selected.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }), label: t("label.name_ar"), value: selected.name_ar }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }), label: t("supplier.apply.contact_name"), value: selected.contact_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }), label: t("label.email"), value: selected.contact_email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), label: t("label.phone"), value: selected.contact_phone }),
        selected.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-destructive" }), label: t("supplier.applications.rejection_reason"), value: selected.rejection_reason })
      ] }),
      (selected.status === "pending" || selected.status === "under_review") && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setRejecting(selected);
          setSelected(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 me-1" }),
          t("actions.reject")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => approve.mutate(selected.id), disabled: approve.isPending, children: [
          approve.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 me-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 me-1" }),
          t("actions.approve")
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rejecting, onOpenChange: (o) => !o && setRejecting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("supplier.applications.reject_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: t("supplier.applications.reject_desc") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value), rows: 4, placeholder: t("supplier.applications.reason_placeholder") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setRejecting(null), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => reject.mutate(), disabled: !reason.trim() || reject.isPending, children: [
          reject.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 me-1 animate-spin" }),
          t("actions.reject")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!credentials, onOpenChange: (o) => !o && setCredentials(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("supplier.applications.creds_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: t("supplier.applications.creds_desc") })
      ] }),
      credentials && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CredRow, { label: t("label.email"), value: credentials.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CredRow, { label: t("auth.password"), value: credentials.password })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCredentials(null), children: t("actions.close") || "OK" }) })
    ] }) })
  ] });
}
function StatusBadge({
  status
}) {
  const {
    t
  } = useI18n();
  const variant = {
    pending: "secondary",
    under_review: "secondary",
    approved: "default",
    rejected: "destructive"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: variant[status] ?? "outline", children: t(`supplier.applications.status_${status}`) });
}
function Field({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-0.5", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: value })
    ] })
  ] });
}
function CredRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm truncate", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
      navigator.clipboard.writeText(value);
      toast.success("Copied");
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
  ] });
}
export {
  SupplierApplicationsPage as component
};
