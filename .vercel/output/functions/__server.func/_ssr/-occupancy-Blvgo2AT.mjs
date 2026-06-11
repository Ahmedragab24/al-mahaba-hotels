import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, _ as Pencil, V as Trash2 } from "../_libs/lucide-react.mjs";
const OCCUPANCY_TYPES = ["SGL", "DBL", "TPL", "QUAD", "CHD", "INF"];
const round2 = (n) => Math.round(n * 100) / 100;
function OccupancyTab({ rateId, currency, canWrite }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const blank = { occupancy_type: "", cost_price: "", markup_percent: "", selling_price: "", active: true };
  const [form, setForm] = reactExports.useState(blank);
  const list = useQuery({
    queryKey: ["rate-occupancy", rateId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_occupancy_prices").select("*").eq("rate_id", rateId);
      if (error) throw error;
      const rows = data ?? [];
      return rows.sort(
        (a, b) => OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type)
      );
    }
  });
  const used = new Set((list.data ?? []).filter((r) => r.id !== editId).map((r) => r.occupancy_type));
  function validate() {
    if (!form.occupancy_type) return t("occupancy.err_type_required");
    if (used.has(form.occupancy_type)) return t("occupancy.err_duplicate");
    const cost = Number(form.cost_price);
    if (form.cost_price === "" || isNaN(cost) || cost < 0) return t("occupancy.err_negative");
    if (form.selling_price !== "") {
      const sell = Number(form.selling_price);
      if (isNaN(sell) || sell < 0) return t("occupancy.err_negative");
      if (sell < cost) return t("occupancy.err_sell_below_cost");
    }
    if (form.markup_percent !== "" && Number(form.markup_percent) < 0) return t("occupancy.err_negative");
    return null;
  }
  const save = useMutation({
    mutationFn: async () => {
      const err = validate();
      if (err) throw new Error(err);
      const payload = {
        rate_id: rateId,
        occupancy_type: form.occupancy_type,
        cost_price: Number(form.cost_price),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        markup_percent: form.markup_percent === "" ? null : Number(form.markup_percent),
        currency: currency || null,
        active: !!form.active
      };
      if (editId) {
        const { error } = await supabase.from("rate_occupancy_prices").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rate_occupancy_prices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rate-occupancy", rateId] });
      setOpen(false);
      setEditId(null);
      setForm(blank);
    },
    onError: (e) => toast.error(friendlyDbError(e.message, t))
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("rate_occupancy_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["rate-occupancy", rateId] });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  function onCost(v) {
    const next = { ...form, cost_price: v };
    if (v !== "" && form.markup_percent !== "") {
      next.selling_price = String(round2(Number(v) * (1 + Number(form.markup_percent) / 100)));
    }
    setForm(next);
  }
  function onMarkup(v) {
    const next = { ...form, markup_percent: v };
    if (v !== "" && form.cost_price !== "") {
      next.selling_price = String(round2(Number(form.cost_price) * (1 + Number(v) / 100)));
    }
    setForm(next);
  }
  function onSelling(v) {
    const next = { ...form, selling_price: v };
    const cost = Number(form.cost_price);
    if (v !== "" && form.cost_price !== "" && cost > 0) {
      next.markup_percent = String(round2((Number(v) - cost) / cost * 100));
    }
    setForm(next);
  }
  const missingCore = ["SGL", "DBL"].filter(
    (o) => !(list.data ?? []).some((r) => r.occupancy_type === o && r.active)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    missingCore.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive", children: [
      t("occupancy.core_required"),
      " (",
      missingCore.join(", "),
      ")"
    ] }),
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        size: "sm",
        disabled: used.size >= OCCUPANCY_TYPES.length,
        onClick: () => {
          setEditId(null);
          setForm(blank);
          setOpen(true);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("actions.add")
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("occupancy.type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.cost") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.markup") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.selling") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-6 text-center text-muted-foreground", children: t("label.loading") }) }),
        !list.isLoading && (list.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-6 text-center text-muted-foreground", children: t("label.no_results") }) }),
        list.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: t(`occupancy.${r.occupancy_type}`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: Number(r.cost_price).toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: r.markup_percent != null ? Number(r.markup_percent).toFixed(2) + " %" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: r.selling_price != null ? Number(r.selling_price).toFixed(2) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.currency ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs ${r.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: r.active ? t("occupancy.active") : t("occupancy.inactive") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.edit"), onClick: () => {
              setEditId(r.id);
              setForm({
                occupancy_type: r.occupancy_type,
                cost_price: String(r.cost_price),
                markup_percent: r.markup_percent != null ? String(r.markup_percent) : "",
                selling_price: r.selling_price != null ? String(r.selling_price) : "",
                active: r.active
              });
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditId(null);
        setForm(blank);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rates.tab.occupancy") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("occupancy.type"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.occupancy_type, onValueChange: (v) => setForm({ ...form, occupancy_type: v }), disabled: !!editId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("occupancy.type") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OCCUPANCY_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, disabled: used.has(o), children: t(`occupancy.${o}`) }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.cost"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.cost_price, onChange: (e) => onCost(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs", children: t("rates.markup") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.markup_percent, onChange: (e) => onMarkup(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs", children: t("rates.selling") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.selling_price, onChange: (e) => onSelling(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.active, onCheckedChange: (v) => setForm({ ...form, active: !!v }) }),
          t("occupancy.active")
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!delId,
        onOpenChange: (v) => !v && setDelId(null),
        title: t("actions.delete"),
        description: t("toast.confirm_delete"),
        destructive: true,
        onConfirm: () => delId && del.mutate(delId)
      }
    )
  ] }) });
}
function friendlyDbError(msg, t) {
  if (!msg) return t("toast.error");
  if (msg.includes("OCCUPANCY_SELLING_BELOW_COST")) return t("occupancy.err_sell_below_cost");
  if (msg.includes("rate_occupancy_prices_rate_id_occupancy_type_key") || msg.includes("duplicate key")) return t("occupancy.err_duplicate");
  if (msg.includes("RATE_MISSING_OCCUPANCY")) return t("occupancy.core_required");
  return msg;
}
export {
  OccupancyTab as O,
  OCCUPANCY_TYPES as a
};
