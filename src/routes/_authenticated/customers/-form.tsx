import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { useCreateCustomerMutation, useUpdateCustomerMutation, customersApi } from "@/store/services/customers/customersService";
import { useI18n } from "@/lib/i18n";
import { useCountries, useCurrencies } from "@/lib/lookups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, User, Landmark, Briefcase } from "lucide-react";
import type { Customer } from "@/types/api";

const getSchema = (lang: "ar" | "en") => z.object({
  type: z.enum(["company", "individual", "agency", "government"]),
  name_en: z.string().trim().max(200, lang === "ar" ? "يجب ألا يتجاوز الاسم 200 حرف" : "Name must not exceed 200 characters").optional().or(z.literal("")),
  name_ar: z.string().trim()
    .min(1, lang === "ar" ? "الاسم بالعربية مطلوب" : "Arabic name is required")
    .max(200, lang === "ar" ? "يجب ألا يتجاوز الاسم 200 حرف" : "Name must not exceed 200 characters"),
  email: z.string().trim()
    .email(lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address")
    .max(255, lang === "ar" ? "البريد الإلكتروني يجب ألا يتجاوز 255 حرف" : "Email must not exceed 255 characters")
    .optional().or(z.literal("")),
  phone: z.string().trim().max(40, lang === "ar" ? "يجب ألا يتجاوز الهاتف 40 حرف" : "Phone must not exceed 40 characters")
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: lang === "ar"
        ? "يجب أن يبدأ رقم الهاتف بـ + ومفتاح الدولة (مثال: +966500000000)"
        : "Phone must start with + and country code (e.g., +966500000000)"
    }).optional().or(z.literal("")),
  country_id: z.coerce.number().int().min(1, lang === "ar" ? "الدولة مطلوبة" : "Country is required").or(z.literal("")),
  legal_name: z.string().trim().max(200, lang === "ar" ? "يجب ألا يتجاوز الاسم القانوني 200 حرف" : "Legal name must not exceed 200 characters").optional().or(z.literal("")),
  tax_number: z.string().trim().max(50, lang === "ar" ? "يجب ألا يتجاوز الرقم الضريبي 50 حرف" : "Tax number must not exceed 50 characters").optional().or(z.literal("")),
  commercial_register: z.string().trim().max(50, lang === "ar" ? "يجب ألا يتجاوز السجل التجاري 50 حرف" : "Commercial register must not exceed 50 characters").optional().or(z.literal("")),
  credit_limit: z.coerce.number().min(0, lang === "ar" ? "الحد الائتماني يجب أن يكون صفراً أو أكثر" : "Credit limit must be 0 or more").default(0),
  credit_days: z.coerce.number().int().min(0, lang === "ar" ? "أيام الائتمان يجب أن تكون صفراً أو أكثر" : "Credit days must be 0 or more").default(0),
  currency_id: z.coerce.number().int().min(1, lang === "ar" ? "العملة مطلوبة" : "Currency is required").or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  notes: z.string().trim().max(2000, lang === "ar" ? "يجب ألا تتجاوز الملاحظات 2000 حرف" : "Notes must not exceed 2000 characters").optional().or(z.literal("")),
});

type FormVals = z.input<ReturnType<typeof getSchema>>;

interface bodyRequest {
  type: "individual" | "company" | "agency" | "government";
  name_ar: string,
  name_en: string,
  email: string,
  phone: string,
  country_id: number,
  legal_name?: string,
  tax_number?: string,
  commercial_register?: string,
  credit_limit: number,
  credit_days: number,
  currency_id: number,
  status: boolean,
  notes: string
}

export function CustomerForm({ initial, onSaved }: { initial?: Partial<Customer> & { id?: string | number }; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const dispatch = useDispatch();
  const countries = useCountries();
  const currencies = useCurrencies();

  const schema = useMemo(() => getSchema(lang), [lang]);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initial?.type ?? "individual",
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      country_id: initial?.country_id ? Number(initial?.country_id) : 0,
      legal_name: initial?.legal_name ?? "",
      tax_number: initial?.tax_number ?? "",
      commercial_register: initial?.commercial_register ?? "",
      credit_limit: initial?.credit_limit ? Number(initial?.credit_limit) : 0,
      credit_days: initial?.credit_days ? Number(initial?.credit_days) : 0,
      currency_id: initial?.currency_id ? Number(initial?.currency_id) : 0,
      status: (initial?.status === false) ? "inactive" : "active",
      notes: initial?.notes ?? "",
    },
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const isPending = isCreating || isUpdating;

  const onSubmit = async (vals: FormVals) => {
    try {
      const payload: bodyRequest = {
        type: vals.type as any,
        name_ar: vals.name_ar,
        name_en: vals.name_en || vals.name_ar,
        email: vals.email || "",
        phone: vals.phone || "",
        country_id: Number(vals.country_id) || 1,
        legal_name: vals.legal_name || "",
        tax_number: vals.tax_number || "",
        commercial_register: vals.commercial_register || "",
        credit_limit: Number(vals.credit_limit) || 0,
        credit_days: Number(vals.credit_days) || 0,
        currency_id: Number(vals.currency_id) || 1,
        status: vals.status === "active",
        notes: vals.notes || "",
      };

      if (payload.type === "individual") {
        payload.legal_name = "";
        payload.tax_number = "";
        payload.commercial_register = "";
        payload.credit_limit = 0;
        payload.credit_days = 0;
      }

      const id = initial?.id;
      if (id) {
        await updateCustomer({ id: id.toString(), body: payload }).unwrap();
        toast.success(t("toast.saved"));
        dispatch(customersApi.util.invalidateTags(["Customers"]));
        onSaved(id.toString());
      } else {
        const data = await createCustomer(payload).unwrap();
        toast.success(t("toast.saved"));
        dispatch(customersApi.util.invalidateTags(["Customers"]));
        onSaved(String(data.id));
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || t("toast.error"));
    }
  };

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);
  const typeWatch = form.watch("type");
  const isCorporate = typeWatch !== "individual";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>

        {/* 1. Customer Type & Basic Info */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {ar("المعلومات الأساسية ونوع العميل", "Basic Info & Customer Type")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-3 mb-2">
                <FormLabel>{ar("نوع العميل", "Customer Type")} *</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "individual", label: ar("فرد (مباشر)", "Individual"), icon: User },
                    { id: "company", label: ar("شركة", "Company"), icon: Building2 },
                    { id: "agency", label: ar("وكالة (B2B)", "Agency"), icon: Briefcase },
                    { id: "government", label: ar("جهة حكومية", "Government"), icon: Landmark },
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => field.onChange(t.id)}
                      className={`flex flex-1 min-w-[140px] items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${field.value === t.id
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground"
                        }`}
                    >
                      <t.icon className={`w-5 h-5 ${field.value === t.id ? "text-primary" : "opacity-60"}`} />
                      <span className="font-medium text-sm">{t.label}</span>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name_ar" render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === "ar" ? "الاسم كامل (عربي) *" : "Full Name (Arabic) *"}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name_en" render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === "ar" ? "الاسم كامل (انجليزي)" : "Full Name (English)"}</FormLabel>
                <FormControl><Input {...field} dir="ltr" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.email")}</FormLabel>
                <FormControl><Input type="email" dir="ltr" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.mobile")} / {t("label.phone")}</FormLabel>
                <FormControl><Input dir="ltr" placeholder="+966500000000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="country_id" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.country")}</FormLabel>
                <Select value={field.value ? field.value.toString() : ""} onValueChange={(val) => field.onChange(val)}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(Array.isArray(countries.data) ? countries.data : Array.isArray(countries.data?.data) ? countries.data.data : [])?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id?.toString()}>
                        {lang === "ar" ? c.name_ar : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

          </CardContent>
        </Card>

        {/* 2. Corporate Fields (Conditionally Rendered) */}
        {isCorporate && (
          <Card className="shadow-sm border-border/60 border-t-4 border-t-primary/60">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                {ar("البيانات القانونية والمالية (للشركات)", "Legal & Financial Data (B2B)")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <FormField control={form.control} name="legal_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("الاسم القانوني الرسمي", "Official Legal Name")}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tax_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("الرقم الضريبي", "Tax/VAT Number")}</FormLabel>
                  <FormControl><Input dir="ltr" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="commercial_register" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("رقم السجل التجاري", "Commercial Registration")}</FormLabel>
                  <FormControl><Input dir="ltr" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            </CardContent>
          </Card>
        )}

        {/* 3. Settings & Notes */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary" />
              {ar("إعدادات إضافية وملاحظات", "Additional Settings & Notes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">

            <FormField control={form.control} name="currency_id" render={({ field }) => (
              <FormItem>
                <FormLabel>{ar("العملة المرجعية", "Base Currency")}</FormLabel>
                <Select value={field.value ? field.value.toString() : ""} onValueChange={(val) => field.onChange(val)}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id?.toString()}>
                        {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.status")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="active">{ar("نشط", "Active")}</SelectItem>
                    <SelectItem value="inactive">{ar("غير نشط", "Inactive")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("label.notes")}</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 sticky bottom-4">
          <Button type="button" variant="outline" className="w-[120px]" onClick={() => window.history.back()}>
            {t("actions.cancel")}
          </Button>
          <Button className="w-[150px]" type="submit" disabled={isPending}>
            {isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
