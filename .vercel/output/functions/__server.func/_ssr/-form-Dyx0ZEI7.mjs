import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
function QuotationForm({ initial, onSaved }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const [form, setForm] = reactExports.useState({
    customer_id: initial?.customer_id ?? "",
    currency: initial?.currency ?? "SAR",
    quotation_date: initial?.quotation_date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    travel_date: initial?.travel_date ?? "",
    expiry_date: initial?.expiry_date ?? "",
    notes: initial?.notes ?? ""
  });
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar,customer_type").is("deleted_at", null).order("name_en")).data ?? []
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("quotes.customer") + " *");
      if (!form.expiry_date) throw new Error(t("quotes.expiry_date") + " *");
      const payload = {
        customer_id: form.customer_id,
        currency: form.currency || "SAR",
        quotation_date: form.quotation_date,
        travel_date: form.travel_date || null,
        expiry_date: form.expiry_date,
        notes: form.notes || null
      };
      if (initial?.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("quotations").insert(payload).select("id").single();
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
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        t("quotes.customer"),
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customer_id, onValueChange: (v) => set("customer_id", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.customer") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
          lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar,
          " — ",
          t(`ctype.${c.customer_type}`)
        ] }, c.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.currency") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.currency, onChange: (e) => set("currency", e.target.value.toUpperCase().slice(0, 3)), dir: "ltr" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("quotes.quotation_date") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.quotation_date, onChange: (e) => set("quotation_date", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("quotes.travel_date") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.travel_date, onChange: (e) => set("travel_date", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        t("quotes.expiry_date"),
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiry_date, onChange: (e) => set("expiry_date", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 md:col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.notes") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => set("notes", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: t("actions.save") }) })
  ] }) });
}
export {
  QuotationForm as Q
};
