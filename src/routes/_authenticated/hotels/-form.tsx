import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useCountries, useCities } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  name_en: z.string().trim().min(1).max(200),
  name_ar: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  star_rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(["active", "inactive", "archived"]),
  country_code: z.string().length(2).optional().or(z.literal("")),
  city_id: z.string().uuid().optional().or(z.literal("")),
  district: z.string().trim().max(120).optional().or(z.literal("")),
  address_line1: z.string().trim().max(200).optional().or(z.literal("")),
  address_line2: z.string().trim().max(200).optional().or(z.literal("")),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  latitude: z.union([z.coerce.number().min(-90).max(90), z.literal("")]).optional(),
  longitude: z.union([z.coerce.number().min(-180).max(180), z.literal("")]).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  check_in_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(z.literal("")),
  check_out_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().or(z.literal("")),
  description_en: z.string().trim().max(4000).optional().or(z.literal("")),
  description_ar: z.string().trim().max(4000).optional().or(z.literal("")),
  policies_en: z.string().trim().max(4000).optional().or(z.literal("")),
  policies_ar: z.string().trim().max(4000).optional().or(z.literal("")),
  cover_image_path: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormVals = z.input<typeof schema>;

export function HotelForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries();

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
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
      cover_image_path: initial?.cover_image_path ?? "",
    },
  });

  const country = form.watch("country_code");
  const cities = useCities(country || null);

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      Object.keys(clean).forEach((k) => {
        if (clean[k] === "") clean[k] = null;
      });
      if (initial?.id) {
        const { error } = await supabase.from("hotels").update(clean).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      }
      const { data, error } = await supabase.from("hotels").insert(clean).select("id").single();
      if (error) throw error;
      return (data as any).id as string;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["hotels"] });
      qc.invalidateQueries({ queryKey: ["hotel", id] });
      qc.invalidateQueries({ queryKey: ["lookup", "hotels-lite"] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-4">
        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <FormField control={form.control} name="name_en" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_en")} *</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="name_ar" render={({ field }) => (
            <FormItem><FormLabel>{t("label.name_ar")} *</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="brand" render={({ field }) => (
            <FormItem><FormLabel>{t("label.brand")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="star_rating" render={({ field }) => (
            <FormItem><FormLabel>{t("label.stars")} (1-5)</FormLabel>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(v ? Number(v) : null)}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{"★".repeat(n)}</SelectItem>)}</SelectContent>
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
          <FormField control={form.control} name="cover_image_path" render={({ field }) => (
            <FormItem><FormLabel>{t("label.cover_image")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("hotels.location")}</div>
          <FormField control={form.control} name="country_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.country")}</FormLabel>
              <Select value={field.value || ""} onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); }}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {countries.data?.map((c) => <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.city")}</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!country}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {cities.data?.map((c) => <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="district" render={({ field }) => (
            <FormItem><FormLabel>{t("label.district")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_line1" render={({ field }) => (
            <FormItem className="md:col-span-2"><FormLabel>{t("label.address")} 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="postal_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.postal_code")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_line2" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.address")} 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="latitude" render={({ field }) => (
            <FormItem><FormLabel>{t("label.latitude")}</FormLabel><FormControl><Input type="number" step="0.0000001" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="longitude" render={({ field }) => (
            <FormItem><FormLabel>{t("label.longitude")}</FormLabel><FormControl><Input type="number" step="0.0000001" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("hotels.contact_info")}</div>
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>{t("label.phone")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>{t("label.email")}</FormLabel><FormControl><Input type="email" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem><FormLabel>{t("label.website")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="check_in_time" render={({ field }) => (
            <FormItem><FormLabel>{t("label.checkin")}</FormLabel><FormControl><Input type="time" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="check_out_time" render={({ field }) => (
            <FormItem><FormLabel>{t("label.checkout")}</FormLabel><FormControl><Input type="time" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2 text-sm font-medium text-muted-foreground">{t("hotels.policies")}</div>
          <FormField control={form.control} name="description_en" render={({ field }) => (
            <FormItem><FormLabel>{t("label.description")} (EN)</FormLabel><FormControl><Textarea rows={4} dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description_ar" render={({ field }) => (
            <FormItem><FormLabel>{t("label.description")} (AR)</FormLabel><FormControl><Textarea rows={4} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="policies_en" render={({ field }) => (
            <FormItem><FormLabel>Policies (EN)</FormLabel><FormControl><Textarea rows={4} dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="policies_ar" render={({ field }) => (
            <FormItem><FormLabel>السياسات (AR)</FormLabel><FormControl><Textarea rows={4} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
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
