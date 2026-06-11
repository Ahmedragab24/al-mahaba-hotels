import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
const SEASON_TYPES = ["low", "high", "peak", "ramadan", "eid", "hajj", "new_year", "custom"];
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function SeasonDialog({ open, onOpenChange, initial, onSaved }) {
  const { t } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      if (!v.start_date || !v.end_date) throw new Error(`${t("label.start_date")} / ${t("label.end_date")}: ${t("label.required")}`);
      if (v.end_date < v.start_date) throw new Error(t("seasons.err_overlap"));
      const payload = {
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        season_type: v.season_type ?? "custom",
        start_date: v.start_date,
        end_date: v.end_date,
        is_active: v.is_active ?? true,
        notes: v.notes?.trim() || null
      };
      if (isEdit) {
        const { error } = await supabase.from("seasons").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id ?? null;
        const { error } = await supabase.from("seasons").insert(payload);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? { season_type: "high", is_active: true });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? t("seasons.edit") : t("seasons.new") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({ ...v, name_en: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({ ...v, name_ar: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("seasons.type"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.season_type ?? "high", onValueChange: (x) => setV({ ...v, season_type: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEASON_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`season_type.${s}`) }, s)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({ ...v, is_active: !!x }) }),
        t("label.is_active")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.start_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.start_date ?? "", onChange: (e) => setV({ ...v, start_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.end_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.end_date ?? "", onChange: (e) => setV({ ...v, end_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({ ...v, notes: e.target.value }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
export {
  SEASON_TYPES as S,
  SeasonDialog as a
};
