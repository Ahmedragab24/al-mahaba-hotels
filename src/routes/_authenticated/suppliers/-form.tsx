import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useCountries, useCities, useCurrencies, useSupplierTypes } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateSupplierMutation, useUpdateSupplierMutation } from "@/store/services/suppliers/suppliersService";

const getSchema = (lang: "ar" | "en") => z.object({
  name_en: z.string().trim()
    .min(1, lang === "ar" ? "الاسم بالإنجليزية مطلوب" : "English name is required")
    .max(200, lang === "ar" ? "الاسم يجب ألا يتجاوز 200 حرف" : "Name must not exceed 200 characters"),
  name_ar: z.string().trim()
    .min(1, lang === "ar" ? "الاسم بالعربية مطلوب" : "Arabic name is required")
    .max(200, lang === "ar" ? "الاسم يجب ألا يتجاوز 200 حرف" : "Name must not exceed 200 characters"),
  supplier_type_id: z.coerce.number().int().positive(lang === "ar" ? "نوع المورد مطلوب" : "Supplier type is required"),
  status: z.coerce.number().int().min(0).max(1),
  tax_number: z.string().trim().max(80, lang === "ar" ? "الرقم الضريبي يجب ألا يتجاوز 80 حرف" : "Tax number must not exceed 80 characters").optional().or(z.literal("")),
  commercial_register: z.string().trim().max(80, lang === "ar" ? "السجل التجاري يجب ألا يتجاوز 80 حرف" : "Commercial register must not exceed 80 characters").optional().or(z.literal("")),
  currency_id: z.coerce.number().int().positive(lang === "ar" ? "العملة مطلوبة" : "Currency is required"),
  country_id: z.coerce.number().int().positive(lang === "ar" ? "الدولة مطلوبة" : "Country is required"),
  city_id: z.coerce.number().int().positive(lang === "ar" ? "المدينة مطلوبة" : "City is required"),
  address_1: z.string().trim().max(200, lang === "ar" ? "العنوان يجب ألا يتجاوز 200 حرف" : "Address must not exceed 200 characters").optional().or(z.literal("")),
  address_2: z.string().trim().max(200, lang === "ar" ? "العنوان الإضافي يجب ألا يتجاوز 200 حرف" : "Address line 2 must not exceed 200 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(40, lang === "ar" ? "رقم الهاتف يجب ألا يتجاوز 40 حرف" : "Phone must not exceed 40 characters")
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: lang === "ar"
        ? "يجب أن يبدأ رقم الهاتف بـ + ومفتاح الدولة (مثال: +966500000000)"
        : "Phone must start with + and country code (e.g., +966500000000)"
    }).optional().or(z.literal("")),
  email: z.string().trim()
    .email(lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address")
    .max(255, lang === "ar" ? "البريد الإلكتروني يجب ألا يتجاوز 255 حرف" : "Email must not exceed 255 characters")
    .optional().or(z.literal("")),
  website: z.string().trim().max(200, lang === "ar" ? "الموقع الإلكتروني يجب ألا يتجاوز 200 حرف" : "Website must not exceed 200 characters").optional().or(z.literal("")),
  notes: z.string().trim().max(4000, lang === "ar" ? "الملاحظات يجب ألا تتجاوز 4000 حرف" : "Notes must not exceed 4000 characters").optional().or(z.literal("")),
});

type FormVals = z.input<ReturnType<typeof getSchema>>;

export function SupplierForm({ initial, onSaved }: { initial?: any; onSaved: (id: number) => void }) {
  const { t, lang } = useI18n();
  const countries = useCountries({}, { refetchInterval: 2000 });
  const currencies = useCurrencies({}, { refetchInterval: 2000 });
  const supplierTypes = useSupplierTypes({}, { refetchInterval: 2000 });
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();

  const schema = useMemo(() => getSchema(lang), [lang]);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      supplier_type_id: initial?.supplier_type_id ?? 1,
      status: initial?.status === true ? 1 : (initial?.status === false ? 0 : 1),
      tax_number: initial?.tax_number ?? "",
      commercial_register: initial?.commercial_register ?? "",
      currency_id: initial?.currency_id ?? 1,
      country_id: initial?.country_id ?? 1,
      city_id: initial?.city_id ?? 1,
      address_1: initial?.address_1 ?? "",
      address_2: initial?.address_2 ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      website: initial?.website ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const countryId = form.watch("country_id");
  const cities = useCities(countryId ? countryId.toString() : null, { refetchInterval: 2000 });

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      Object.keys(clean).forEach((k) => { if (clean[k] === "") clean[k] = null; });
      if (initial?.id) {
        const result = await updateSupplier({ id: initial.id, body: clean }).unwrap();
        return initial.id as number;
      }
      const result = await createSupplier(clean).unwrap();
      return result.id;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      onSaved(id);
    },
    onError: (e: any) => {
      const errData = e?.data || e;
      if (errData?.errors && typeof errData.errors === "object") {
        Object.keys(errData.errors).forEach((key) => {
          const msg = Array.isArray(errData.errors[key]) ? errData.errors[key][0] : errData.errors[key];
          form.setError(key as any, { type: "server", message: msg });
        });
      }
      toast.error(errData?.message || e.message || t("toast.error"));
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-4">
        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <FormField control={form.control} name="name_en" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_en")} *</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="name_ar" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_ar")} *</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="supplier_type_id" render={({ field }) => (
            <FormItem><FormLabel>{t("filter.type")} *</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {(Array.isArray(supplierTypes.data) ? supplierTypes.data : Array.isArray(supplierTypes.data?.data) ? supplierTypes.data.data : [])?.map((st: any) => (
                    <SelectItem key={st.id} value={st.id.toString()}>{lang === "ar" ? st.name_ar : st.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>{t("label.status")} *</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="1">{t("status.active")}</SelectItem>
                  <SelectItem value="0">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />

        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("suppliers.commercial")}</div>
          <FormField control={form.control} name="tax_number" render={({ field }) => (
            <FormItem><FormLabel>{t("label.tax_number")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="commercial_register" render={({ field }) => (
            <FormItem><FormLabel>{t("label.cr")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="currency_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.currency")}</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />

        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("suppliers.address")}</div>
          <FormField control={form.control} name="country_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.country")}</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => { field.onChange(Number(v)); form.setValue("city_id", 1); }}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{(Array.isArray(countries.data) ? countries.data : Array.isArray(countries.data?.data) ? countries.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.city")}</FormLabel>
              <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))} disabled={!countryId}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{(Array.isArray(cities.data) ? cities.data : Array.isArray(cities.data?.data) ? cities.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_1" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.address")} 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_2" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.address")} 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>{t("label.phone")}</FormLabel><FormControl><Input dir="ltr" placeholder="+966500000000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>{t("label.email")}</FormLabel><FormControl><Input type="email" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.website")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.notes")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <div className="flex justify-end gap-2">
          <Button className="w-[200px]" type="submit" disabled={mut.isPending}>
            {mut.isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
