import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useCountries, useCities } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateHotelMutation, useUpdateHotelMutation } from "@/store/services/hotels/hotelsService";

const getSchema = (lang: "ar" | "en") => z.object({
  name_en: z.string().trim()
    .min(1, lang === "ar" ? "الاسم بالإنجليزية مطلوب" : "English name is required")
    .max(200, lang === "ar" ? "الاسم يجب ألا يتجاوز 200 حرف" : "Name must not exceed 200 characters")
    .regex(/^[A-Z]/, lang === "ar" ? "يجب أن يبدأ الاسم الإنجليزي بحرف كبير" : "English name must start with a capital letter"),
  name_ar: z.string().trim()
    .min(1, lang === "ar" ? "الاسم بالعربية مطلوب" : "Arabic name is required")
    .max(200, lang === "ar" ? "الاسم يجب ألا يتجاوز 200 حرف" : "Name must not exceed 200 characters"),
  brand: z.string().trim().max(120, lang === "ar" ? "البراند يجب ألا يتجاوز 120 حرف" : "Brand must not exceed 120 characters").optional().or(z.literal("")),
  stars: z.coerce.number().int()
    .min(1, lang === "ar" ? "يجب أن يكون التقييم نجمة واحدة على الأقل" : "Stars must be at least 1")
    .max(5, lang === "ar" ? "يجب ألا يتجاوز التقييم 5 نجوم" : "Stars must be at most 5"),
  status: z.enum(["1", "0"], {
    errorMap: () => ({ message: lang === "ar" ? "الحالة غير صالحة" : "Invalid status" })
  }),
  country_id: z.string().min(1, lang === "ar" ? "الدولة مطلوبة" : "Country is required"),
  city_id: z.string().min(1, lang === "ar" ? "المدينة مطلوبة" : "City is required"),
  district: z.string().trim().max(120, lang === "ar" ? "الحي يجب ألا يتجاوز 120 حرف" : "District must not exceed 120 characters").optional().or(z.literal("")),
  address_1: z.string().trim().max(200, lang === "ar" ? "العنوان يجب ألا يتجاوز 200 حرف" : "Address must not exceed 200 characters").optional().or(z.literal("")),
  postal_code: z.string().trim().max(20, lang === "ar" ? "الرمز البريدي يجب ألا يتجاوز 20 حرف" : "Postal code must not exceed 20 characters").optional().or(z.literal("")),
  map_link: z.string().trim().max(1000, lang === "ar" ? "رابط الخريطة يجب ألا يتجاوز 1000 حرف" : "Map link must not exceed 1000 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(40, lang === "ar" ? "الهاتف يجب ألا يتجاوز 40 حرف" : "Phone must not exceed 40 characters").optional().or(z.literal("")),
  email: z.string().trim()
    .email(lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address")
    .max(255, lang === "ar" ? "البريد الإلكتروني يجب ألا يتجاوز 255 حرف" : "Email must not exceed 255 characters")
    .optional().or(z.literal("")).nullable(),
  website: z.string().trim().max(200, lang === "ar" ? "الموقع الإلكتروني يجب ألا يتجاوز 200 حرف" : "Website must not exceed 200 characters").optional().or(z.literal("")),
  check_in: z.string().regex(/^\d{2}:\d{2}$/, lang === "ar" ? "تنسيق وقت تسجيل الدخول غير صالح (HH:MM)" : "Invalid check-in time format (HH:MM)").optional().or(z.literal("")),
  check_out: z.string().regex(/^\d{2}:\d{2}$/, lang === "ar" ? "تنسيق وقت تسجيل الخروج غير صالح (HH:MM)" : "Invalid check-out time format (HH:MM)").optional().or(z.literal("")),
  description_en: z.string().trim().max(4000, lang === "ar" ? "الوصف بالإنجليزية يجب ألا يتجاوز 4000 حرف" : "Description (EN) must not exceed 4000 characters").optional().or(z.literal("")),
  description_ar: z.string().trim().max(4000, lang === "ar" ? "الوصف بالعربية يجب ألا يتجاوز 4000 حرف" : "Description (AR) must not exceed 4000 characters").optional().or(z.literal("")),
  policies_en: z.string().trim().max(4000, lang === "ar" ? "السياسات بالإنجليزية يجب ألا يتجاوز 4000 حرف" : "Policies (EN) must not exceed 4000 characters").optional().or(z.literal("")),
  policies_ar: z.string().trim().max(4000, lang === "ar" ? "السياسات بالعربية يجب ألا يتجاوز 4000 حرف" : "Policies (AR) must not exceed 4000 characters").optional().or(z.literal("")),
});

type FormVals = z.input<ReturnType<typeof getSchema>>;

export function HotelForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const countries = useCountries({}, { refetchInterval: 2000 });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [createHotel] = useCreateHotelMutation();
  const [updateHotel] = useUpdateHotelMutation();

  const schema = useMemo(() => getSchema(lang), [lang]);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: initial?.name_en ?? "",
      name_ar: initial?.name_ar ?? "",
      brand: initial?.brand ?? "",
      stars: initial?.stars ?? 5,
      status: initial?.status !== undefined ? (initial.status ? "1" : "0") : "1",
      country_id: initial?.country_id ? String(initial.country_id) : "",
      city_id: initial?.city_id ? String(initial.city_id) : "",
      district: initial?.district ?? "",
      address_1: initial?.address_1 ?? "",
      postal_code: initial?.postal_code ?? "",
      map_link: initial?.map_link ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      website: initial?.website ?? "",
      check_in: initial?.check_in?.slice(0, 5) ?? "16:00",
      check_out: initial?.check_out?.slice(0, 5) ?? "12:00",
      description_en: initial?.description_en ?? "",
      description_ar: initial?.description_ar ?? "",
      policies_en: initial?.policies_en ?? `1. Official check-in time is 4:00 PM, and check-out time is 1:00 PM.

2. Late check-out beyond the designated time will result in an additional full night's charge, in accordance with the hotel's policy.

3. The reservation will be automatically canceled if the full payment is not received within the specified payment period.

4. Guests are not entitled to a refund for any unused portion of their stay if they choose to check out before the agreed reservation period ends.

5. Guests are required to comply with all hotel rules, regulations, and policies, and to maintain appropriate conduct and respect public etiquette throughout their stay.

6. Guests are responsible for any damage or loss caused to the guest room or any hotel facilities during their stay.

7. The hotel and the company shall not be held liable for the loss, theft, or damage of guests' personal belongings, valuables, or cash.`,
      policies_ar: initial?.policies_ar ?? `1. وقت تسجيل الدخول الرسمي الساعة 04:00 مساءً، ووقت تسجيل الخروج الساعة 01:00 ظهراً.

2. في حال التأخير عن موعد الخروج يتم احتساب ليلة إضافية كاملة وفق سياسة الفندق.

3. يلغى الحجز تلقائياً في حال عدم سداد كامل المبلغ خلال المدة المحددة.

4. لا يحق للنزيل استرداد قيمة الإقامة في حال المغادرة قبل انتهاء مدة الحجز المتفق عليها.

5. يلتزم النزيل بالأنظمة والتعليمات المعمول بها في الفندق ومراعاة السلوك والآداب العامة.

6. يتحمل النزيل مسؤولية أي أضرار أو تلفيات تنتج عن استخدامه للغرفة أو مرافق الفندق.

7. الفندق والشركة غير مسؤولين عن فقدان أو سرقة المقتنيات الشخصية أو الأموال.`,
    },
  });

  const countryId = form.watch("country_id");
  const cities = useCities(countryId ? { country_id: countryId } : null, { refetchInterval: 2000 });

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const formData = new FormData();
      formData.append("name_ar", vals.name_ar);
      formData.append("name_en", vals.name_en);
      if (vals.brand) formData.append("brand", vals.brand);
      formData.append("stars", String(vals.stars));
      formData.append("status", vals.status);
      formData.append("country_id", vals.country_id);
      formData.append("city_id", vals.city_id);
      if (vals.district) formData.append("district", vals.district);
      if (vals.address_1) formData.append("address_1", vals.address_1);
      if (vals.postal_code) formData.append("postal_code", vals.postal_code);
      if (vals.map_link) formData.append("map_link", vals.map_link);
      if (vals.phone) formData.append("phone", vals.phone);
      if (vals.email) formData.append("email", vals.email);
      if (vals.website) formData.append("website", vals.website);
      if (vals.check_in) formData.append("check_in", vals.check_in);
      if (vals.check_out) formData.append("check_out", vals.check_out);
      if (vals.description_ar) formData.append("description_ar", vals.description_ar);
      if (vals.description_en) formData.append("description_en", vals.description_en);
      if (vals.policies_ar) formData.append("policies_ar", vals.policies_ar);
      if (vals.policies_en) formData.append("policies_en", vals.policies_en);

      if (coverImageFile) {
        formData.append("cover_image", coverImageFile);
      }

      if (initial?.id) {
        const res = await updateHotel({ id: initial.id, body: formData }).unwrap();
        return String(res.id);
      } else {
        const res = await createHotel(formData as any).unwrap();
        return String(res.id);
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["hotels"] });
      qc.invalidateQueries({ queryKey: ["hotel", id] });
      qc.invalidateQueries({ queryKey: ["lookup", "hotels-lite"] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.data?.message || e.message || t("toast.error")),
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
          <FormField control={form.control} name="stars" render={({ field }) => (
            <FormItem><FormLabel>{t("label.stars")} (1-5)</FormLabel>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(v ? Number(v) : 5)}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{"★".repeat(n)}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>{t("label.status")} *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="1">{t("status.active")}</SelectItem>
                  <SelectItem value="0">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />

          <div className="md:col-span-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("label.cover_image")}</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                    if (!allowedTypes.includes(file.type)) {
                      toast.error(lang === "ar" ? "امتداد الصورة غير مدعوم" : "Unsupported image format");
                      e.target.value = "";
                      setCoverImageFile(null);
                      return;
                    }
                    setCoverImageFile(file);
                  }
                }}
              />
              {initial?.cover_image && !coverImageFile && (
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">{lang === "ar" ? "الصورة الحالية:" : "Current Image:"}</span>
                  <img src={initial.cover_image} alt="Current cover" className="h-16 w-24 object-cover rounded border" />
                </div>
              )}
              {coverImageFile && (
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">{lang === "ar" ? "معاينة الصورة الجديدة:" : "New Image Preview:"}</span>
                  <img src={URL.createObjectURL(coverImageFile)} alt="New cover preview" className="h-16 w-24 object-cover rounded border animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("hotels.location")}</div>
          <FormField control={form.control} name="country_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.country")} *</FormLabel>
              <Select value={field.value || ""} onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); }}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(Array.isArray(countries.data) ? countries.data : Array.isArray(countries.data?.data) ? countries.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="city_id" render={({ field }) => (
            <FormItem><FormLabel>{t("label.city")} *</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!countryId}>
                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {(Array.isArray(cities.data) ? cities.data : Array.isArray(cities.data?.data) ? cities.data.data : [])?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="district" render={({ field }) => (
            <FormItem><FormLabel>{t("label.district")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address_1" render={({ field }) => (
            <FormItem className="md:col-span-2"><FormLabel>{t("label.address")} 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="postal_code" render={({ field }) => (
            <FormItem><FormLabel>{t("label.postal_code")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="map_link" render={({ field }) => (
            <FormItem className="md:col-span-3"><FormLabel>{t("label.location_url")}</FormLabel><FormControl><Input dir="ltr" placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <div className="md:col-span-3 text-sm font-medium text-muted-foreground">{t("hotels.contact_info")}</div>
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>{t("label.phone")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>{t("label.email")}</FormLabel><FormControl><Input type="email" dir="ltr" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem><FormLabel>{t("label.website")}</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="check_in" render={({ field }) => (
            <FormItem><FormLabel>{t("label.checkin")}</FormLabel><FormControl><Input type="time" className="flex! justify-center! gap-4!" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="check_out" render={({ field }) => (
            <FormItem><FormLabel>{t("label.checkout")}</FormLabel><FormControl><Input type="time" className="flex! justify-center! gap-4!" dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
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
            <FormItem><FormLabel>Policies (EN)</FormLabel><FormControl><Textarea rows={8} dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="policies_ar" render={({ field }) => (
            <FormItem><FormLabel>السياسات (AR)</FormLabel><FormControl><Textarea rows={8} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent></Card>

        <div className="flex justify-end gap-2">
          <Button className="w-[300px]" type="submit" disabled={mut.isPending}>
            {mut.isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
