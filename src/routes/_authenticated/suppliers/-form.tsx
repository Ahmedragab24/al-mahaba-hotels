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

const STYPES = ["hotel_supplier", "dmc", "direct_hotel", "wholesaler", "other"] as const;

const schema = z.object({
  name_en: z.string().trim().min(1).max(200),
  name_ar: z.string().trim().min(1).max(200),
  legal_name: z.string().trim().max(200).optional().or(z.literal("")),
  supplier_type: z.enum(STYPES),
  status: z.enum(["active", "inactive", "archived"]),
  tax_number: z.string().trim().max(80).optional().or(z.literal("")),
  commercial_registration: z.string().trim().max(80).optional().or(z.literal("")),
  preferred_currency: z.string().trim().max(3).optional().or(z.literal("")),
  credit_days: z.coerce.number().int().min(0).max(365),
  payment_terms: z.string().trim().max(300).optional().or(z.literal("")),
  country_code: z.string().length(2).optional().or(z.literal("")),
  city_id: z.string().uuid().optional().or(z.literal("")),
  address_line1: z.string().trim().max(200).optional().or(z.literal("")),
  address_line2: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  mobile: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  tags: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormVals = z.input<typeof schema>;

export function SupplierForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries();
  const currencies = useCurrencies();

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
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
      tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : "",
    },
  });

  const country = form.watch("country_code");
  const cities = useCities(country || null);

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      Object.keys(clean).forEach((k) => { if (clean[k] === "") clean[k] = null; });
      clean.tags = typeof vals.tags === "string" && vals.tags.trim()
        ? vals.tags.split(",").map((s) => s.trim()).filter(Boolean) : null;
      if (initial?.id) {
        const { error } = await supabase.from("suppliers").update(clean).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      }
      const { data, error } = await supabase.from("suppliers").insert(clean).select("id").single();
      if (error) throw error;
      return (data as any).id as string;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["supplier", id] });
      qc.invalidateQueries({ queryKey: ["lookup", "suppliers-lite"] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
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

          <FormField control={form.control} name="supplier_type" render={({ field }) => (
            <FormItem><FormLabel>{t("filter.type")} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{STYPES.map((s) => <SelectItem key={s} value={s}>{t(`stype.${s}`)}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>{t("label.status")} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {(["active", "inactive", "archived"] as const).map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />

        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("suppliers.commercial")}</div>
          <FormField control={form.control} name="tax_number" render={({ field }) => (
            <FormItem><FormLabel>{t("label.tax_number")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="commercial_registration" render={({ field }) => (
            <FormItem><FormLabel>{t("label.cr")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="preferred_currency" render={({ field }) => (
            <FormItem><FormLabel>{t("label.currency")}</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{currencies.data?.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />

        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("suppliers.address")}</div>
          <FormField control={form.control} name="country_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.country")}</FormLabel>
              <Select value={field.value || ""} onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); }}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{countries.data?.map((c) => <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.city")}</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!country}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{cities.data?.map((c) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_line1" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.address")} 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_line2" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.address")} 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>{t("label.phone")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
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
