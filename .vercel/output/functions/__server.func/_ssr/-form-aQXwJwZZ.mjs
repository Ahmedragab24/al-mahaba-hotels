import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { c as useSuppliersLite, a as useHotelsLite, u as useCurrencies } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
const CONTRACT_TYPES = ["allotment", "free_sale", "on_request", "commitment", "other"];
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function ContractForm({ initial, onSaved }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const suppliers = useSuppliersLite();
  const hotels = useHotelsLite();
  const currencies = useCurrencies();
  const isEdit = !!initial?.id;
  const [v, setV] = reactExports.useState(initial ?? { contract_type: "allotment", commission_type: "percentage", credit_days: 0 });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.supplier_id) throw new Error(`${t("contracts.supplier")}: ${t("label.required")}`);
      if (!v.start_date || !v.end_date) throw new Error(`${t("contracts.period")}: ${t("label.required")}`);
      if (v.end_date < v.start_date) throw new Error(t("contracts.err_overlap_dates", "End date must be after start date"));
      const payload = {
        supplier_id: v.supplier_id,
        hotel_id: v.hotel_id || null,
        title: v.title?.trim() || null,
        contract_type: v.contract_type ?? "allotment",
        start_date: v.start_date,
        end_date: v.end_date,
        currency: v.currency || null,
        commission_type: v.commission_type ?? "percentage",
        commission_pct: v.commission_pct !== "" && v.commission_pct != null ? Number(v.commission_pct) : null,
        credit_days: Number(v.credit_days ?? 0),
        payment_terms: v.payment_terms?.trim() || null,
        cancellation_terms: v.cancellation_terms?.trim() || null,
        notes: v.notes?.trim() || null
      };
      if (payload.commission_type === "percentage" && payload.commission_pct != null && (payload.commission_pct < 0 || payload.commission_pct > 100)) {
        throw new Error(t("taxes.err_pct"));
      }
      if (isEdit) {
        const { error } = await supabase.from("supplier_contracts").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.contract_number = "";
        payload.status = "draft";
        payload.created_by = u.user?.id ?? null;
        const { data, error } = await supabase.from("supplier_contracts").insert(payload).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      if (onSaved) onSaved();
      else navigate({ to: "/contracts/$id", params: { id } });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("contracts.supplier")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.supplier_id ?? "", onValueChange: (x) => setV({ ...v, supplier_id: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("contracts.supplier") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }, s.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("contracts.hotel"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.hotel_id ?? "", onValueChange: (x) => setV({ ...v, hotel_id: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("contracts.hotel") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("contracts.type"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.contract_type ?? "allotment", onValueChange: (x) => setV({ ...v, contract_type: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTRACT_TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: t(`ctrtype.${c}`) }, c)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("contracts.name"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.title ?? "", onChange: (e) => setV({ ...v, title: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.start_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.start_date ?? "", onChange: (e) => setV({ ...v, start_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.end_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.end_date ?? "", onChange: (e) => setV({ ...v, end_date: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.currency"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.currency ?? "", onValueChange: (x) => setV({ ...v, currency: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("label.currency") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
          c.code,
          " — ",
          lang === "ar" ? c.name_ar : c.name_en
        ] }, c.code)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("contracts.commission_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.commission_type ?? "percentage", onValueChange: (x) => setV({ ...v, commission_type: x }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: t("calc.percentage") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: t("calc.fixed") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: v.commission_type === "fixed" ? t("label.tax_value") : t("label.commission_pct"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: 0, value: v.commission_pct ?? "", onChange: (e) => setV({ ...v, commission_pct: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.credit_days"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: v.credit_days ?? 0, onChange: (e) => setV({ ...v, credit_days: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.payment_terms"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.payment_terms ?? "", onChange: (e) => setV({ ...v, payment_terms: e.target.value }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.penalty_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.cancellation_terms ?? "", onChange: (e) => setV({ ...v, cancellation_terms: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({ ...v, notes: e.target.value }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onSaved ? onSaved() : navigate({ to: "/contracts" }), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
export {
  ContractForm as C
};
