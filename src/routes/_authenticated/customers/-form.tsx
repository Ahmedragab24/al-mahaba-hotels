import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const schema = z.object({
  customer_type: z.enum(["corporate", "individual", "agency", "government"]),
  name_en: z.string().trim().max(200).optional().or(z.literal("")),
  name_ar: z.string().trim().min(1).max(200),
  legal_name: z.string().trim().max(200).optional().or(z.literal("")),
  tax_number: z.string().trim().max(50).optional().or(z.literal("")),
  commercial_registration: z.string().trim().max(50).optional().or(z.literal("")),
  country_code: z.string().length(2).optional().or(z.literal("")),
  city_id: z.string().uuid().optional().or(z.literal("")),
  address_line1: z.string().trim().max(200).optional().or(z.literal("")),
  address_line2: z.string().trim().max(200).optional().or(z.literal("")),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  mobile: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  preferred_language: z.enum(["ar", "en", "id", "ur"]),
  preferred_currency: z.string().length(3).optional().or(z.literal("")),
  credit_limit: z.coerce.number().min(0).default(0),
  credit_days: z.coerce.number().int().min(0).default(0),
  payment_terms: z.string().trim().max(200).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(["active", "inactive", "archived"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type FormVals = z.input<typeof schema>;

export function CustomerForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries();
  const currencies = useCurrencies();

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_type: initial?.customer_type ?? "individual",
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      legal_name: initial?.legal_name ?? "",
      tax_number: initial?.tax_number ?? "",
      commercial_registration: initial?.commercial_registration ?? "",
      country_code: initial?.country_code ?? "",
      city_id: initial?.city_id ?? "",
      address_line1: initial?.address_line1 ?? "",
      address_line2: initial?.address_line2 ?? "",
      postal_code: initial?.postal_code ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      mobile: initial?.mobile ?? "",
      website: initial?.website ?? "",
      preferred_language: initial?.preferred_language ?? "ar",
      preferred_currency: initial?.preferred_currency ?? "SAR",
      credit_limit: initial?.credit_limit ?? 0,
      credit_days: initial?.credit_days ?? 0,
      payment_terms: initial?.payment_terms ?? "",
      rating: initial?.rating ?? null,
      status: initial?.status ?? "active",
      notes: initial?.notes ?? "",
    },
  });

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      Object.keys(clean).forEach(k => { if (clean[k] === "") clean[k] = null; });
      if (!clean.name_en) {
        clean.name_en = clean.name_ar;
      }
      
      // If individual, nullify B2B fields
      if (clean.customer_type === "individual") {
        clean.legal_name = null;
        clean.tax_number = null;
        clean.commercial_registration = null;
        clean.credit_limit = 0;
        clean.credit_days = 0;
      }

      if (initial?.id) {
        const { error } = await supabase.from("customers").update(clean).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      }
      const { data, error } = await supabase.from("customers").insert(clean).select("id").single();
      if (error) throw error;
      return (data as any).id as string;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer", id] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);
  const typeWatch = form.watch("customer_type");
  const isCorporate = typeWatch !== "individual";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        
        {/* 1. Customer Type & Basic Info */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {ar("المعلومات الأساسية ونوع العميل", "Basic Info & Customer Type")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField control={form.control} name="customer_type" render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-3 mb-2">
                <FormLabel>{ar("نوع العميل", "Customer Type")} *</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "individual", label: ar("فرد (مباشر)", "Individual"), icon: User },
                    { id: "corporate", label: ar("شركة", "Corporate"), icon: Building2 },
                    { id: "agency", label: ar("وكالة (B2B)", "Agency"), icon: Briefcase },
                    { id: "government", label: ar("جهة حكومية", "Government"), icon: Landmark },
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => field.onChange(t.id)}
                      className={`flex flex-1 min-w-[140px] items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        field.value === t.id
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

            <FormField control={form.control} name="mobile" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.mobile")}</FormLabel>
                <FormControl><Input dir="ltr" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="country_code" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("label.country")}</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {countries.data?.map(c => (
                      <SelectItem key={c.code} value={c.code}>
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

              <FormField control={form.control} name="commercial_registration" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("رقم السجل التجاري", "Commercial Registration")}</FormLabel>
                  <FormControl><Input dir="ltr" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="credit_limit" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("الحد الائتماني", "Credit Limit")}</FormLabel>
                  <FormControl><Input type="number" dir="ltr" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="credit_days" render={({ field }) => (
                <FormItem>
                  <FormLabel>{ar("أيام الائتمان", "Credit Days")}</FormLabel>
                  <FormControl><Input type="number" dir="ltr" {...field} /></FormControl>
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
            
            <FormField control={form.control} name="preferred_currency" render={({ field }) => (
              <FormItem>
                <FormLabel>{ar("العملة المفضلة", "Preferred Currency")}</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {currencies.data?.map(c => (
                      <SelectItem key={c.code} value={c.code}>
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
          <Button className="w-[150px]" type="submit" disabled={mut.isPending}>
            {mut.isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
