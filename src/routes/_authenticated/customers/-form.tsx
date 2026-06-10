import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useCountries, useCities, useCurrencies } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  customer_type: z.enum(["corporate","individual","agency","government"]),
  name_en: z.string().trim().min(1).max(200),
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
  preferred_language: z.enum(["ar","en","id","ur"]),
  preferred_currency: z.string().length(3).optional().or(z.literal("")),
  credit_limit: z.coerce.number().min(0).default(0),
  credit_days: z.coerce.number().int().min(0).default(0),
  payment_terms: z.string().trim().max(200).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(["active","inactive","archived"]),
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
      customer_type: initial?.customer_type ?? "corporate",
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

  const customerType = form.watch("customer_type");
  const isIndividual = customerType === "individual";
  const country = form.watch("country_code");
  const cities = useCities(country || null);

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      Object.keys(clean).forEach(k => { if (clean[k] === "") clean[k] = null; });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-4">
        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <FormField control={form.control} name="customer_type" render={({ field }) => (
            <FormItem><FormLabel>{t("filter.type")} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {(["corporate","individual","agency","government"] as const).map(c =>
                    <SelectItem key={c} value={c}>{t(`ctype.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>{t("label.status")} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {(["active","inactive","archived"] as const).map(s =>
                    <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="preferred_language" render={({ field }) => (
            <FormItem><FormLabel>{t("label.language")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="ur">اردو</SelectItem>
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="name_en" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_en")} *</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="name_ar" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_ar")} *</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="legal_name" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="tax_number" render={({ field }) => (
            <FormItem><FormLabel>{t("label.tax_number")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="commercial_registration" render={({ field }) => (
            <FormItem><FormLabel>{t("label.cr")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="rating" render={({ field }) => (
            <FormItem><FormLabel>{t("label.rating")} (1-5)</FormLabel>
              <FormControl><Input type="number" min={1} max={5} {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>{t("label.email")}</FormLabel><FormControl><Input type="email" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>{t("label.phone")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="mobile" render={({ field }) => (
            <FormItem><FormLabel>{t("label.mobile")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem><FormLabel>{t("label.website")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="country_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.country")}</FormLabel>
              <Select value={field.value || ""} onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); }}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {countries.data?.map(c => <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.city")}</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!country}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {cities.data?.map(c => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_line1" render={({ field }) => (
            <FormItem className="md:col-span-2"><FormLabel>{t("label.address")} 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="postal_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.address")} ZIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <FormField control={form.control} name="preferred_currency" render={({ field }) => (
            <FormItem><FormLabel>{t("label.currency")}</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{currencies.data?.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="credit_limit" render={({ field }) => (
            <FormItem><FormLabel>{t("label.credit_limit")}</FormLabel><FormControl><Input type="number" step="0.01" min={0} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="credit_days" render={({ field }) => (
            <FormItem><FormLabel>{t("label.credit_days")}</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="payment_terms" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.payment_terms")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.notes")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
