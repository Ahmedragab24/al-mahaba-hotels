import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { u } from "../_libs/hookform__resolvers.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { b as useCountries, d as useCities } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { F as Form, a as FormField, b as FormItem, c as FormLabel, d as FormControl, e as FormMessage } from "./form-BepQWxLA.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { o as objectType, s as stringType, l as literalType, u as unionType, c as coerce, e as enumType } from "../_libs/zod.mjs";
const schema = objectType({
  name_en: stringType().trim().min(1).max(200),
  name_ar: stringType().trim().min(1).max(200),
  brand: stringType().trim().max(120).optional().or(literalType("")),
  star_rating: coerce.number().int().min(1).max(5).optional().nullable(),
  status: enumType(["active", "inactive", "archived"]),
  country_code: stringType().length(2).optional().or(literalType("")),
  city_id: stringType().uuid().optional().or(literalType("")),
  district: stringType().trim().max(120).optional().or(literalType("")),
  address_line1: stringType().trim().max(200).optional().or(literalType("")),
  address_line2: stringType().trim().max(200).optional().or(literalType("")),
  postal_code: stringType().trim().max(20).optional().or(literalType("")),
  latitude: unionType([coerce.number().min(-90).max(90), literalType("")]).optional(),
  longitude: unionType([coerce.number().min(-180).max(180), literalType("")]).optional(),
  phone: stringType().trim().max(40).optional().or(literalType("")),
  email: stringType().trim().email().max(255).optional().or(literalType("")),
  website: stringType().trim().max(200).optional().or(literalType("")),
  check_in_time: stringType().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(literalType("")),
  check_out_time: stringType().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(literalType("")),
  description_en: stringType().trim().max(4e3).optional().or(literalType("")),
  description_ar: stringType().trim().max(4e3).optional().or(literalType("")),
  policies_en: stringType().trim().max(4e3).optional().or(literalType("")),
  policies_ar: stringType().trim().max(4e3).optional().or(literalType("")),
  cover_image_path: stringType().trim().max(500).optional().or(literalType(""))
});
function HotelForm({ initial, onSaved }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries();
  const form = useForm({
    resolver: u(schema),
    defaultValues: {
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      brand: initial?.brand ?? "",
      star_rating: initial?.star_rating ?? null,
      status: initial?.status ?? "active",
      country_code: initial?.country_code ?? "",
      city_id: initial?.city_id ?? "",
      district: initial?.district ?? "",
      address_line1: initial?.address_line1 ?? "",
      address_line2: initial?.address_line2 ?? "",
      postal_code: initial?.postal_code ?? "",
      latitude: initial?.latitude ?? "",
      longitude: initial?.longitude ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      website: initial?.website ?? "",
      check_in_time: initial?.check_in_time?.slice(0, 5) ?? "14:00",
      check_out_time: initial?.check_out_time?.slice(0, 5) ?? "12:00",
      description_en: initial?.description_en ?? "",
      description_ar: initial?.description_ar ?? "",
      policies_en: initial?.policies_en ?? "",
      policies_ar: initial?.policies_ar ?? "",
      cover_image_path: initial?.cover_image_path ?? ""
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
      if (initial?.id) {
        const { error: error2 } = await supabase.from("hotels").update(clean).eq("id", initial.id);
        if (error2) throw error2;
        return initial.id;
      }
      const { data, error } = await supabase.from("hotels").insert(clean).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["hotels"] });
      qc.invalidateQueries({ queryKey: ["hotel", id] });
      qc.invalidateQueries({ queryKey: ["lookup", "hotels-lite"] });
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "brand", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.brand") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "star_rating", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.stars"),
          " (1-5)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value ? String(field.value) : "", onValueChange: (v) => field.onChange(v ? Number(v) : null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: "★".repeat(n) }, n)) })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "cover_image_path", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.cover_image") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3 text-sm font-medium text-muted-foreground", children: t("hotels.location") }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "district", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.district") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "address_line1", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.address"),
          " 1"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "postal_code", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.postal_code") }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "latitude", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.latitude") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0000001", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "longitude", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.longitude") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0000001", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3 text-sm font-medium text-muted-foreground", children: t("hotels.contact_info") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "phone", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.phone") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "email", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "website", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.website") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "check_in_time", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.checkin") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "check_out_time", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("label.checkout") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 p-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2 text-sm font-medium text-muted-foreground", children: t("hotels.policies") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "description_en", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.description"),
          " (EN)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "description_ar", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.description"),
          " (AR)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, dir: "rtl", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "policies_en", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Policies (EN)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, dir: "ltr", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "policies_ar", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "السياسات (AR)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, dir: "rtl", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: mut.isPending, children: mut.isPending ? t("actions.saving") : t("actions.save") }) })
  ] }) });
}
export {
  HotelForm as H
};
