import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
function RfqForm({ initial, onSaved }) {
  const { t } = useI18n();
  const auth = useAuth();
  const [form, setForm] = reactExports.useState({
    destination: initial?.destination ?? "",
    travel_start: initial?.travel_start ?? "",
    travel_end: initial?.travel_end ?? "",
    currency: initial?.currency ?? "SAR",
    notes: initial?.notes ?? ""
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = useMutation({
    mutationFn: async () => {
      if (!form.travel_start || !form.travel_end) throw new Error(t("rfq.travel_start") + " *");
      if (form.travel_end < form.travel_start) throw new Error(t("rfq.err_item_dates"));
      const payload = {
        destination: form.destination || null,
        travel_start: form.travel_start,
        travel_end: form.travel_end,
        currency: form.currency || "SAR",
        notes: form.notes || null
      };
      if (initial?.id) {
        const { error } = await supabase.from("rfqs").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("rfqs").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      onSaved(id);
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.destination") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.destination, onChange: (e) => set("destination", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.currency") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.currency, onChange: (e) => set("currency", e.target.value.toUpperCase().slice(0, 3)), dir: "ltr" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        t("rfq.travel_start"),
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.travel_start, onChange: (e) => set("travel_start", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        t("rfq.travel_end"),
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.travel_end, onChange: (e) => set("travel_end", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2 lg:col-span-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.notes") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => set("notes", e.target.value), rows: 3 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 lg:col-span-3 text-xs text-muted-foreground", children: t("rfq.suppliers_hint", 'بعد الحفظ، اختر الموردين من تبويب "الموردون" لإرسال طلب السعر إليهم.') }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") }) })
  ] }) });
}
export {
  RfqForm as R
};
