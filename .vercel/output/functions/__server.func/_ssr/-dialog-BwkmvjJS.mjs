import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { a as useHotelsLite, u as useCurrencies } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
const TAX_TYPES = ["vat", "municipality_fee", "tourism_fee", "service_charge", "resort_fee", "custom"];
const APPLY_SCOPES = ["per_room", "per_night", "per_person", "per_stay"];
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function TaxDialog({ open, onOpenChange, initial, onSaved }) {
  const { t, lang } = useI18n();
  const hotels = useHotelsLite();
  const currencies = useCurrencies();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.hotel_id) throw new Error(`${t("filter.hotel")}: ${t("label.required")}`);
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const value = Number(v.value ?? 0);
      if (v.calc_method === "percentage" && value > 100) throw new Error(t("taxes.err_pct"));
      if (v.calc_method === "fixed" && !v.currency) throw new Error(t("taxes.err_currency"));
      if (v.expiry_date && v.effective_date && v.expiry_date < v.effective_date) throw new Error(t("taxes.err_dates"));
      const payload = {
        hotel_id: v.hotel_id,
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        tax_type: v.tax_type ?? "vat",
        calc_method: v.calc_method ?? "percentage",
        value,
        currency: v.calc_method === "fixed" ? v.currency : null,
        apply_scope: v.apply_scope ?? "per_stay",
        is_inclusive: !!v.is_inclusive,
        effective_date: v.effective_date || null,
        expiry_date: v.expiry_date || null,
        is_active: v.is_active ?? true,
        notes: v.notes?.trim() || null
      };
      if (isEdit) {
        const { error } = await supabase.from("hotel_taxes").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id ?? null;
        const { error } = await supabase.from("hotel_taxes").insert(payload);
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
    if (o) setV(initial ?? { tax_type: "vat", calc_method: "percentage", apply_scope: "per_stay", is_active: true, is_inclusive: false, value: 0 });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? t("taxes.edit") : t("taxes.new") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("filter.hotel")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.hotel_id ?? "", onValueChange: (x) => setV({ ...v, hotel_id: x }), disabled: isEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.hotel") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.tax_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.tax_type ?? "vat", onValueChange: (x) => setV({ ...v, tax_type: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TAX_TYPES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: t(`taxtype.${x}`) }, x)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({ ...v, name_en: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({ ...v, name_ar: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("taxes.calc_method"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.calc_method ?? "percentage", onValueChange: (x) => setV({ ...v, calc_method: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: t("calc.percentage") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: t("calc.fixed") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.tax_value")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: 0, value: v.value ?? 0, onChange: (e) => setV({ ...v, value: e.target.value }) }) }),
      v.calc_method === "fixed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.currency")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.currency ?? "", onValueChange: (x) => setV({ ...v, currency: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("label.currency") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("taxes.apply_scope"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.apply_scope ?? "per_stay", onValueChange: (x) => setV({ ...v, apply_scope: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APPLY_SCOPES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: t(`scope.${x}`) }, x)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("taxes.effective_date"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.effective_date ?? "", onChange: (e) => setV({ ...v, effective_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("taxes.expiry_date"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.expiry_date ?? "", onChange: (e) => setV({ ...v, expiry_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_inclusive, onCheckedChange: (x) => setV({ ...v, is_inclusive: !!x }) }),
        t("label.inclusive")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({ ...v, is_active: !!x }) }),
        t("label.is_active")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({ ...v, notes: e.target.value }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
export {
  TAX_TYPES as T,
  TaxDialog as a
};
