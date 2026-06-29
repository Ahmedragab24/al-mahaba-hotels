import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  useHotelsLite, useMealPlans, useCurrencies, useSuppliersLite, useHotelViewsScoped
} from "@/lib/lookups";
import { useGetRoomsQuery } from "@/store/services/rooms/roomsService";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreatePriceMutation, useUpdatePriceMutation } from "@/store/services/pricing/pricingService";
import { MealPlanConfigurator } from "@/components/meal-plan-configurator";



const schema = z.object({
  hotel_id: z.coerce.string(),
  is_direct: z.boolean().default(false),
  supplier_id: z.coerce.string().optional().or(z.literal("")),
  room_id: z.coerce.string(),
  hotel_view_id: z.coerce.string().optional().or(z.literal("")),
  currency_id: z.coerce.string(),
  valid_from: z.string().min(1),
  valid_to: z.string().min(1),

  meal_plan_type: z.enum(["inclusive", "exclusive"]).default("inclusive"),
  meal_plan_inclusive_details: z.array(z.number()).default([]),
  meal_plan_exclusive_prices: z.record(z.string(), z.coerce.number()).default({}),

  cost_per_night: z.coerce.number().nonnegative(),
  selling_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  profit_margin: z.coerce.number().optional().or(z.literal("")),

  tax_type: z.enum(["inclusive_tax", "exclusive_tax"]).default("inclusive_tax"),
  tax_rate: z.coerce.number().nonnegative().default(15),

  status: z.string().default("approved"),

  notes_en: z.string().max(2000).optional().or(z.literal("")),
  notes_ar: z.string().max(2000).optional().or(z.literal("")),
  cancellation_policy_en: z.string().max(4000).optional().or(z.literal("")),
  cancellation_policy_ar: z.string().max(4000).optional().or(z.literal("")),
}).refine((v) => new Date(v.valid_to) >= new Date(v.valid_from), {
  path: ["valid_to"], message: "valid_to >= valid_from",
}).refine((v) => v.is_direct || (v.supplier_id && v.supplier_id.toString().length > 0), {
  path: ["supplier_id"], message: "supplier required unless direct",
});

type FormVals = z.input<typeof schema>;

export function RateForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();
  const currencies = useCurrencies();
  const { data: mealPlansRes } = useMealPlans();
  const dynamicMeals = Array.isArray(mealPlansRes) ? mealPlansRes : (mealPlansRes?.data || []);

  const [createPrice, { isLoading: isCreating }] = useCreatePriceMutation();
  const [updatePrice, { isLoading: isUpdating }] = useUpdatePriceMutation();
  const isPending = isCreating || isUpdating;

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotel_id: initial?.hotel_id?.toString() ?? "",
      is_direct: initial?.is_direct ?? false,
      supplier_id: initial?.supplier_id?.toString() ?? "",
      room_id: (initial?.room_id || initial?.room_type_id)?.toString() ?? "",
      hotel_view_id: (initial?.hotel_view_id || initial?.view_id)?.toString() ?? "",
      currency_id: (initial?.currency_id || initial?.currency)?.toString() ?? "1",
      valid_from: initial?.valid_from ? initial.valid_from.split('T')[0] : "",
      valid_to: initial?.valid_to ? initial.valid_to.split('T')[0] : "",
      meal_plan_type: initial?.meal_plan_type ?? "inclusive",
      meal_plan_inclusive_details: initial?.meal_plan_inclusive_details ?? initial?.meal_plan_details?.map((d: any) => d.id) ?? [],
      meal_plan_exclusive_prices: initial?.meal_plan_exclusive_prices ?? initial?.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.price }), {}) ?? {},
      cost_per_night: initial?.cost_per_night ?? 0,
      selling_price: initial?.selling_price?.toString() ?? "",
      profit_margin: initial?.profit_margin?.toString() ?? "",
      tax_type: initial?.tax_type ?? "inclusive_tax",
      tax_rate: initial?.tax_rate ?? 15,
      status: initial?.status ?? "approved",
      notes_en: initial?.notes_en ?? initial?.notes ?? "",
      notes_ar: initial?.notes_ar ?? initial?.notes ?? "",
      cancellation_policy_en: initial?.cancellation_policy_en ?? initial?.cancellation_policy ?? "",
      cancellation_policy_ar: initial?.cancellation_policy_ar ?? initial?.cancellation_policy ?? "",
    },
  });

  const hotelId = form.watch("hotel_id");
  const isDirect = form.watch("is_direct");
  const mealPlanType = form.watch("meal_plan_type");

  const roomsQuery = useGetRoomsQuery({ hotel_id: hotelId });
  const views = useHotelViewsScoped(hotelId);

  const selectedHotel = Array.isArray(hotels.data)
    ? hotels.data.find((h: any) => h.id == hotelId)
    : Array.isArray(hotels.data?.data) ? hotels.data.data.find((h: any) => h.id == hotelId) : null;

  const onSubmit = async (vals: FormVals) => {
    try {
      const payload: any = { ...vals };

      const nullFields = [
        "hotel_view_id", "selling_price", "profit_margin",
        "notes_en", "notes_ar", "cancellation_policy_en", "cancellation_policy_ar"
      ];
      nullFields.forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
      });

      if (payload.meal_plan_type === "inclusive") {
        delete payload.meal_plan_exclusive_prices;
      } else {
        delete payload.meal_plan_inclusive_details;
      }

      if (payload.is_direct) {
        payload.supplier_id = null;
      } else if (payload.supplier_id === "") {
        payload.supplier_id = null;
      }

      // Convert ID fields to numbers where appropriate if the API expects it.
      // Usually form inputs are strings, we coerce to numbers for the payload if needed.
      if (payload.hotel_id) payload.hotel_id = Number(payload.hotel_id);
      if (payload.room_id) payload.room_id = Number(payload.room_id);
      if (payload.hotel_view_id) payload.hotel_view_id = Number(payload.hotel_view_id);
      if (payload.currency_id) payload.currency_id = Number(payload.currency_id);
      if (payload.supplier_id) payload.supplier_id = Number(payload.supplier_id);

      if (initial?.id) {
        await updatePrice({ id: initial.id, body: payload, lang }).unwrap();
        toast.success(t("toast.saved"));
        onSaved(initial.id);
      } else {
        const res = await createPrice({ ...payload, lang }).unwrap();
        toast.success(t("toast.saved"));
        onSaved(res.id ? String(res.id) : "");
      }
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || t("toast.error"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3" dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* Top Row: General Toggles (Spans across all columns) */}
            <div className="col-span-full border-b pb-6 mb-2">
              <div className="w-1/2 pe-3">
                <FormField control={form.control} name="is_direct" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card hover:bg-accent/5 transition-colors">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium cursor-pointer">{t("rates.is_direct")}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("supplier_id", "");
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Column 1: Right Column */}
            <div className="space-y-4">
              <FormField control={form.control} name="hotel_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.hotel")} *</FormLabel>
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("room_id", ""); form.setValue("hotel_view_id", ""); }}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => (
                        <SelectItem key={h.id} value={h.id.toString()}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="room_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.room_type")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!hotelId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Array.isArray(roomsQuery.data) ? roomsQuery.data : Array.isArray((roomsQuery.data as any)?.data) ? (roomsQuery.data as any).data : [])?.map((r: any) => (
                        <SelectItem key={r.id} value={r.id.toString()}>{lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Column 2: Middle Column */}
            <div className="space-y-4">
              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.supplier")} {!isDirect && "*"}</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange} disabled={isDirect}>
                    <FormControl><SelectTrigger><SelectValue placeholder={isDirect ? t("rates.source.direct") : "—"} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray((suppliers.data as any)?.data) ? (suppliers.data as any).data : [])?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="hotel_view_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.view")}</FormLabel>
                  <Select value={field.value || "none"} onValueChange={(x) => field.onChange(x === "none" ? "" : x)} disabled={!hotelId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {(Array.isArray(views.data) ? views.data : Array.isArray((views.data as any)?.data) ? (views.data as any).data : [])?.map((v: any) => (
                        <SelectItem key={v.id} value={v.id.toString()}>{lang === "ar" ? (v.name_ar || v.name_en) : (v.name_en || v.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Column 3: Left Column */}
            <div className="space-y-4">
              <FormField control={form.control} name="currency_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.currency")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Array.isArray(currencies.data) ? currencies.data : Array.isArray((currencies.data as any)?.data) ? (currencies.data as any).data : [])?.map((c: any) => (
                        <SelectItem key={c.id || c.code} value={(c.id || c.code).toString()}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="valid_from" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rates.valid_from")} *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="valid_to" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rates.valid_to")} *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan Section */}
        <Card>
          <CardContent className="p-6 space-y-4">

            <MealPlanConfigurator
              meals={dynamicMeals}
              control={form.control}
              lang={lang as any}
            />
          </CardContent>
        </Card>

        {/* Pricing & Taxes */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2" dir={lang === "ar" ? "rtl" : "ltr"}>
            <FormField control={form.control} name="cost_per_night" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.cost")} *</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="selling_price" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.selling")}</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="profit_margin" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.profit_margin")}</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />


            <FormField control={form.control} name="tax_type" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.tax_type")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="inclusive_tax">{t("rates.tax_inclusive_yes")}</SelectItem>
                    <SelectItem value="exclusive_tax">{t("rates.tax_inclusive_no")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tax_rate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.tax_rate")} (%)</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Notes & Policies */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <FormField control={form.control} name="notes_en" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.notes_en")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notes_ar" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.notes_ar")}</FormLabel><FormControl><Textarea rows={3} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cancellation_policy_en" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cxl_en")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cancellation_policy_ar" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cxl_ar")}</FormLabel><FormControl><Textarea rows={3} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button className="w-[300px]" type="submit" disabled={isPending}>{isPending ? t("actions.saving") : t("actions.save")}</Button>
        </div>
      </form>
    </Form>
  );
}
