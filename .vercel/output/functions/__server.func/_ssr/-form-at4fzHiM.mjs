import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { u } from "../_libs/hookform__resolvers.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { b as useCountries, u as useCurrencies, d as useCities } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { F as Form, a as FormField, b as FormItem, c as FormLabel, d as FormControl, e as FormMessage } from "./form-BepQWxLA.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { o as objectType, s as stringType, l as literalType, c as coerce, e as enumType } from "../_libs/zod.mjs";
const STYPES = ["hotel_supplier", "dmc", "direct_hotel", "wholesaler", "other"];
const schema = objectType({
  name_en: stringType().trim().min(1).max(200),
  name_ar: stringType().trim().min(1).max(200),
  legal_name: stringType().trim().max(200).optional().or(literalType("")),
  supplier_type: enumType(STYPES),
  status: enumType(["active", "inactive", "archived"]),
  tax_number: stringType().trim().max(80).optional().or(literalType("")),
  commercial_registration: stringType().trim().max(80).optional().or(literalType("")),
  preferred_currency: stringType().trim().max(3).optional().or(literalType("")),
  credit_days: coerce.number().int().min(0).max(365),
  payment_terms: stringType().trim().max(300).optional().or(literalType("")),
  country_code: stringType().length(2).optional().or(literalType("")),
  city_id: stringType().uuid().optional().or(literalType("")),
  address_line1: stringType().trim().max(200).optional().or(literalType("")),
  address_line2: stringType().trim().max(200).optional().or(literalType("")),
  phone: stringType().trim().max(40).optional().or(literalType("")),
  mobile: stringType().trim().max(40).optional().or(literalType("")),
  email: stringType().trim().email().max(255).optional().or(literalType("")),
  website: stringType().trim().max(200).optional().or(literalType("")),
  notes: stringType().trim().max(4e3).optional().or(literalType("")),
  tags: stringType().trim().max(500).optional().or(literalType(""))
});
function SupplierForm({ initial, onSaved }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries();
  const currencies = useCurrencies();
  const form = useForm({
    resolver: u(schema),
    defaultValues: {
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      legal_name: initial?.legal_name ?? "",
      supplier_type: initial?.supplier_type ?? "hotel_supplier",
      status: initial?.status ?? "active",
      tax_number: initial?.tax_number ?? "",
      commercial_registration: initial?.commercial_registration ?? "",
      preferred_currency: initial?.preferred_currency ?? "",
      credit_days: initial?.credit_days ?? 0,
      payment_terms: initial?.payment_terms ?? "",
      country_code: initial?.country_code ?? "",
      city_id: initial?.city_id ?? "",
      address_line1: initial?.address_line1 ?? "",
      address_line2: initial?.address_line2 ?? "",
      phone: initial?.phone ?? "",
      mobile: initial?.mobile ?? "",
      email: initial?.email ?? "",
      website: initial?.website ?? "",
      notes: initial?.notes ?? "",
      tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : ""
    }
  });
  const country = form.watch("country_code");
  const cities = useCities(country || null);
  const mut = useMutation({
    mutationFn: async (vals) => {
      const clean = { ...vals };
      Object.keys(clean).forEach((k) => {
        if (clean[k] === "") clean[k] = null;
      });
      clean.tags = typeof vals.tags === "string" && vals.tags.trim() ? vals.tags.split(",").map((s) => s.trim()).filter(Boolean) : null;
      if (initial?.id) {
        const { error: error2 } = await supabase.from("suppliers").update(clean).eq("id", initial.id);
        if (error2) throw error2;
        return initial.id;
      }
      const { data, error } = await supabase.from("suppliers").insert(clean).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier", id] });
      qc.invalidateQueries({ queryKey: ["lookup", "suppliers-lite"] });
      onSaved(id);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit((v) => mut.mutate(v)), className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "name_en", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.name_en"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "name_ar", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.name_ar"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "legal_name", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.legal_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "supplier_type", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("filter.type"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`stype.${s}`) }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "status", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.status"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "inactive", "archived"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`status.${s}`) }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "tags", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.tags") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "vip, partner", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3 text-sm font-medium text-muted-foreground", children: t("suppliers.commercial") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "tax_number", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.tax_number") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "commercial_registration", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.cr") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "preferred_currency", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.currency") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: field.onChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
            c.code,
            " — ",
            lang === "ar" ? c.name_ar : c.name_en
          ] }, c.code)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "credit_days", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.credit_days") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "payment_terms", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.payment_terms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3 text-sm font-medium text-muted-foreground", children: t("suppliers.address") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "country_code", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.country") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: (v) => {
          field.onChange(v);
          form.setValue("city_id", "");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: lang === "ar" ? c.name_ar : c.name_en }, c.code)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "city_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.city") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: field.onChange, disabled: !country, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cities.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: lang === "ar" ? c.name_ar : c.name_en }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "address_line1", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.address"),
          " 1"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "address_line2", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.address"),
          " 2"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "phone", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.phone") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "mobile", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.mobile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "email", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "website", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.website") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "notes", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.notes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: mut.isPending, children: mut.isPending ? t("actions.saving") : t("actions.save") }) })
  ] }) });
}
export {
  SupplierForm as S
};
