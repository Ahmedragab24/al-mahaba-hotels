import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { u } from "../_libs/hookform__resolvers.mjs";
import { a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { a as useHotelsLite, c as useSuppliersLite, u as useCurrencies, e as useHotelRoomTypes, f as useHotelViews, g as useSupplierContracts } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { F as Form, a as FormField, b as FormItem, c as FormLabel, d as FormControl, e as FormMessage } from "./form-BepQWxLA.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { o as objectType, s as stringType, l as literalType, c as coerce, e as enumType, b as booleanType } from "../_libs/zod.mjs";
const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"];
const schema = objectType({
  hotel_id: stringType().uuid(),
  is_direct: booleanType().default(false),
  supplier_id: stringType().uuid().optional().or(literalType("")),
  contract_id: stringType().uuid().optional().or(literalType("")),
  room_type_id: stringType().uuid(),
  view_id: stringType().uuid().optional().or(literalType("")),
  meal_plan: enumType(BOARDS),
  currency: stringType().length(3),
  valid_from: stringType().min(1),
  valid_to: stringType().min(1),
  cost_per_night: coerce.number().nonnegative(),
  selling_price: coerce.number().nonnegative().optional().or(literalType("")),
  markup_pct: coerce.number().min(0).max(500).optional().or(literalType("")),
  min_nights: coerce.number().int().min(1),
  max_nights: coerce.number().int().min(1).optional().or(literalType("")),
  release_days: coerce.number().int().min(0),
  allotment: coerce.number().int().min(0).optional().or(literalType("")),
  notes_en: stringType().max(2e3).optional().or(literalType("")),
  notes_ar: stringType().max(2e3).optional().or(literalType("")),
  cancellation_policy_en: stringType().max(4e3).optional().or(literalType("")),
  cancellation_policy_ar: stringType().max(4e3).optional().or(literalType(""))
}).refine((v) => new Date(v.valid_to) >= new Date(v.valid_from), {
  path: ["valid_to"],
  message: "valid_to >= valid_from"
}).refine((v) => v.is_direct || v.supplier_id && v.supplier_id.length > 0, {
  path: ["supplier_id"],
  message: "supplier required unless direct"
});
function RateForm({ initial, onSaved }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();
  const currencies = useCurrencies();
  const form = useForm({
    resolver: u(schema),
    defaultValues: {
      hotel_id: initial?.hotel_id ?? "",
      is_direct: initial?.is_direct ?? false,
      supplier_id: initial?.supplier_id ?? "",
      contract_id: initial?.contract_id ?? "",
      room_type_id: initial?.room_type_id ?? "",
      view_id: initial?.view_id ?? "",
      meal_plan: initial?.meal_plan ?? "BB",
      currency: initial?.currency ?? "USD",
      valid_from: initial?.valid_from ?? "",
      valid_to: initial?.valid_to ?? "",
      cost_per_night: initial?.cost_per_night ?? 0,
      selling_price: initial?.selling_price ?? "",
      markup_pct: initial?.markup_pct ?? "",
      min_nights: initial?.min_nights ?? 1,
      max_nights: initial?.max_nights ?? "",
      release_days: initial?.release_days ?? 0,
      allotment: initial?.allotment ?? "",
      notes_en: initial?.notes_en ?? "",
      notes_ar: initial?.notes_ar ?? "",
      cancellation_policy_en: initial?.cancellation_policy_en ?? "",
      cancellation_policy_ar: initial?.cancellation_policy_ar ?? ""
    }
  });
  const hotelId = form.watch("hotel_id");
  const supplierId = form.watch("supplier_id");
  const isDirect = form.watch("is_direct");
  const roomTypes = useHotelRoomTypes(hotelId || null);
  const views = useHotelViews(hotelId || null);
  const contracts = useSupplierContracts(supplierId || null);
  const mut = useMutation({
    mutationFn: async (vals) => {
      const clean = { ...vals };
      [
        "contract_id",
        "view_id",
        "selling_price",
        "markup_pct",
        "max_nights",
        "allotment",
        "notes_en",
        "notes_ar",
        "cancellation_policy_en",
        "cancellation_policy_ar"
      ].forEach((k) => {
        if (clean[k] === "" || clean[k] === void 0) clean[k] = null;
      });
      if (clean.is_direct) {
        clean.supplier_id = null;
        clean.contract_id = null;
      } else if (clean.supplier_id === "") {
        clean.supplier_id = null;
      }
      if (initial?.id) {
        if (initial.status === "approved") {
          const { data, error: error2 } = await supabase.rpc("create_rate_version", {
            _rate_id: initial.id,
            _changes: clean
          });
          if (error2) throw error2;
          toast.info(t("rates.versioned_saved"));
          return data;
        }
        const { error } = await supabase.from("rates").update(clean).eq("id", initial.id);
        if (error) throw error;
        return initial.id;
      } else {
        const { data, error } = await supabase.from("rates").insert({ ...clean, code: "", status: "draft" }).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rates"] });
      qc.invalidateQueries({ queryKey: ["rate", id] });
      onSaved(id);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit((v) => mut.mutate(v)), className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 p-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "hotel_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.hotel"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: (v) => {
          field.onChange(v);
          form.setValue("room_type_id", "");
          form.setValue("view_id", "");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "is_direct", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex items-center gap-2 self-end pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!field.value, onCheckedChange: (v) => {
          field.onChange(!!v);
          if (v) {
            form.setValue("supplier_id", "");
            form.setValue("contract_id", "");
          }
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { className: "!mt-0", children: t("rates.is_direct") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "supplier_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.supplier"),
          " ",
          !isDirect && "*"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: (v) => {
          field.onChange(v);
          form.setValue("contract_id", "");
        }, disabled: isDirect, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: isDirect ? t("rates.source.direct") : "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }, s.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "contract_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.contract") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: field.onChange, disabled: !supplierId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: contracts.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
            c.contract_number,
            " · ",
            c.title
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "room_type_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.room_type"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, disabled: !hotelId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: roomTypes.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar }, r.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "view_id", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.view") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value || "", onValueChange: field.onChange, disabled: !hotelId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: views.data?.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v.id, children: lang === "ar" ? v.name_ar || v.name_en : v.name_en || v.name_ar }, v.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "meal_plan", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.meal_plan"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BOARDS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: t(`board.${b}`) }, b)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "currency", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("label.currency"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
            c.code,
            " — ",
            lang === "ar" ? c.name_ar : c.name_en
          ] }, c.code)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "valid_from", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.valid_from"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "valid_to", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.valid_to"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 p-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "cost_per_night", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.cost"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "selling_price", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.selling") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "markup_pct", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.markup") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "release_days", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.release_days"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "min_nights", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormLabel, { children: [
          t("rates.min_nights"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "max_nights", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.max_nights") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "allotment", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.allotment") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-4 p-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "notes_en", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.notes_en") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "notes_ar", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.notes_ar") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, dir: "rtl", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "cancellation_policy_en", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.cxl_en") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { control: form.control, name: "cancellation_policy_ar", render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: t("rates.cxl_ar") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, dir: "rtl", ...field }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: mut.isPending, children: mut.isPending ? t("actions.saving") : t("actions.save") }) })
  ] }) });
}
export {
  RateForm as R
};
