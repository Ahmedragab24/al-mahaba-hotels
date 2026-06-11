import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { a as useHotelsLite } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function RoomTypeDialog({ open, onOpenChange, initial, onSaved }) {
  const { t, lang } = useI18n();
  const hotels = useHotelsLite();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.hotel_id) throw new Error(`${t("room_types.hotel")}: ${t("label.required")}`);
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const adults = Number(v.max_adults ?? 2);
      const children = Number(v.max_children ?? 0);
      const maxOcc = Number(v.max_occupancy ?? adults);
      if (maxOcc < adults || maxOcc > adults + children) throw new Error(t("room_types.err_occupancy"));
      const payload = {
        hotel_id: v.hotel_id,
        code: v.code?.trim() || "",
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        max_adults: adults,
        max_children: children,
        max_occupancy: maxOcc,
        bed_type: v.bed_type?.trim() || null,
        size_sqm: v.size_sqm !== "" && v.size_sqm != null ? Number(v.size_sqm) : null,
        smoking_allowed: !!v.smoking_allowed,
        description_en: v.description_en?.trim() || null,
        description_ar: v.description_ar?.trim() || null,
        is_active: v.is_active ?? true,
        sort_order: Number(v.sort_order ?? 0)
      };
      if (isEdit) {
        const { error } = await supabase.from("hotel_room_types").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id ?? null;
        const { error } = await supabase.from("hotel_room_types").insert(payload);
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
    if (o) setV(initial ?? { max_adults: 2, max_children: 0, max_occupancy: 2, is_active: true, smoking_allowed: false, sort_order: 0 });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? t("room_types.edit") : t("room_types.new") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("room_types.hotel")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.hotel_id ?? "", onValueChange: (x) => setV({ ...v, hotel_id: x }), disabled: isEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("room_types.hotel") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.code"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.code ?? "", onChange: (e) => setV({ ...v, code: e.target.value }), placeholder: "RT-00001 (auto)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({ ...v, name_en: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({ ...v, name_ar: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_adults"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: v.max_adults ?? 2, onChange: (e) => setV({ ...v, max_adults: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_children"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: v.max_children ?? 0, onChange: (e) => setV({ ...v, max_children: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_occupancy"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: v.max_occupancy ?? 2, onChange: (e) => setV({ ...v, max_occupancy: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.bed_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.bed_type ?? "", onChange: (e) => setV({ ...v, bed_type: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.size_sqm"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: 0, value: v.size_sqm ?? "", onChange: (e) => setV({ ...v, size_sqm: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.sort_order"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.sort_order ?? 0, onChange: (e) => setV({ ...v, sort_order: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.smoking_allowed, onCheckedChange: (x) => setV({ ...v, smoking_allowed: !!x }) }),
        t("room_types.smoking")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({ ...v, is_active: !!x }) }),
        t("label.is_active")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("room_types.desc_en"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "ltr", value: v.description_en ?? "", onChange: (e) => setV({ ...v, description_en: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("room_types.desc_ar"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "rtl", value: v.description_ar ?? "", onChange: (e) => setV({ ...v, description_ar: e.target.value }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
export {
  RoomTypeDialog as R
};
