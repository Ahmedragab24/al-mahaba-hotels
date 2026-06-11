import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useCurrencies } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { S as Switch } from "./switch-BwRKxUkF.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, _ as Pencil, V as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
const ENTITY_TYPES = ["payment_order", "supplier_payment", "invoice", "rate"];
function ApprovalThresholdsPage() {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const currencies = useCurrencies();
  const [dialog, setDialog] = reactExports.useState({
    open: false
  });
  const [confirm, setConfirm] = reactExports.useState(null);
  const list = useQuery({
    queryKey: ["approval_thresholds"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("approval_thresholds").select("*").order("entity_type").order("currency");
      if (error) throw error;
      return data ?? [];
    }
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("approval_thresholds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["approval_thresholds"]
      });
      setConfirm(null);
    },
    onError: (e) => {
      toast.error(dbErrorMessage(e, t));
      setConfirm(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("thresholds.title"), subtitle: t("thresholds.subtitle"), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setDialog({
      open: true
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("actions.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("thresholds.entity_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("thresholds.amount") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("thresholds.requires_second") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
        !list.isLoading && (list.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
        list.data?.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`thresholds.entity.${row.entity_type}`) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: row.currency }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: Number(row.amount).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.requires_second_approver ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-900 border-transparent", children: t("label.yes") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("label.no") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-transparent", children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDialog({
              open: true,
              initial: row
            }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setConfirm(row.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, row.id))
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ThresholdDialog, { open: dialog.open, initial: dialog.initial, currencies: currencies.data ?? [], onOpenChange: (v) => setDialog({
      open: v,
      initial: v ? dialog.initial : void 0
    }), onSaved: () => qc.invalidateQueries({
      queryKey: ["approval_thresholds"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => confirm && del.mutate(confirm) })
  ] });
}
function ThresholdDialog({
  open,
  onOpenChange,
  initial,
  currencies,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const isEdit = !!initial?.id;
  const [form, setForm] = reactExports.useState(initial ?? {});
  const save = useMutation({
    mutationFn: async () => {
      if (!form.entity_type || !form.currency) throw new Error(t("label.required"));
      const payload = {
        entity_type: form.entity_type,
        currency: form.currency,
        amount: Number(form.amount ?? 0),
        requires_second_approver: form.requires_second_approver ?? true,
        notes: form.notes ?? null,
        is_active: form.is_active ?? true
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("approval_thresholds").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("approval_thresholds").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    onOpenChange(v);
    if (v) setForm(initial ?? {});
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? t("actions.edit") : t("actions.new") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("thresholds.entity_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.entity_type ?? "", onValueChange: (v) => setForm((f) => ({
          ...f,
          entity_type: v
        })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ENTITY_TYPES.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e, children: t(`thresholds.entity.${e}`) }, e)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.currency ?? "", onValueChange: (v) => setForm((f) => ({
            ...f,
            currency: v
          })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("thresholds.amount") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.01", value: form.amount ?? "", onChange: (e) => setForm((f) => ({
            ...f,
            amount: Number(e.target.value)
          })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: t("thresholds.requires_second") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.requires_second_approver ?? true, onCheckedChange: (v) => setForm((f) => ({
          ...f,
          requires_second_approver: v
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: t("status.active") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.is_active ?? true, onCheckedChange: (v) => setForm((f) => ({
          ...f,
          is_active: v
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.notes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes ?? "", onChange: (e) => setForm((f) => ({
          ...f,
          notes: e.target.value
        })) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
    ] })
  ] }) });
}
export {
  ApprovalThresholdsPage as component
};
