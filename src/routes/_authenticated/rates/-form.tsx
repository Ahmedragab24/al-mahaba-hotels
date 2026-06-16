import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import {
  useHotelsLite, useSuppliersLite, useCurrencies,
  useHotelRoomTypes, useHotelViews, useSupplierContracts,
} from "@/lib/lookups";
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
import { Check, CheckCircle2 } from "lucide-react";
import { MealPlanSelector } from "@/components/meal-plan-selector";
import { MealPlanConfigurator } from "@/components/meal-plan-configurator";

const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

const schema = z.object({
  hotel_id: z.string().uuid(),
  is_direct: z.boolean().default(false),
  supplier_id: z.string().uuid().optional().or(z.literal("")),
  contract_id: z.string().uuid().optional().or(z.literal("")),
  room_type_id: z.string().uuid(),
  view_id: z.string().uuid().optional().or(z.literal("")),
  meal_plan: z.enum(BOARDS),
  currency: z.string().length(3),
  valid_from: z.string().min(1),
  valid_to: z.string().min(1),
  cost_per_night: z.coerce.number().nonnegative(),
  selling_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  markup_pct: z.coerce.number().min(0).max(500).optional().or(z.literal("")),
  min_nights: z.coerce.number().int().min(1),
  max_nights: z.coerce.number().int().min(1).optional().or(z.literal("")),
  release_days: z.coerce.number().int().min(0),
  allotment: z.coerce.number().int().min(0).optional().or(z.literal("")),
  notes_en: z.string().max(2000).optional().or(z.literal("")),
  notes_ar: z.string().max(2000).optional().or(z.literal("")),
  cancellation_policy_en: z.string().max(4000).optional().or(z.literal("")),
  cancellation_policy_ar: z.string().max(4000).optional().or(z.literal("")),
  // New fields
  allow_extra_bed: z.boolean().default(false),
  extra_bed_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  extra_bed_limit: z.coerce.number().int().min(1).default(1),
  meals_included: z.boolean().default(true),
  meal_plan_components: z.array(z.string()).default([]),
  breakfast_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  lunch_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  dinner_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  half_board_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  full_board_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  tax_inclusive: z.boolean().default(false),
}).refine((v) => new Date(v.valid_to) >= new Date(v.valid_from), {
  path: ["valid_to"], message: "valid_to >= valid_from",
}).refine((v) => v.is_direct || (v.supplier_id && v.supplier_id.length > 0), {
  path: ["supplier_id"], message: "supplier required unless direct",
});

type FormVals = z.input<typeof schema>;

export function RateForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();
  const currencies = useCurrencies();

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotel_id: initial?.hotel_id ?? "",
      is_direct: initial?.is_direct ?? false,
      supplier_id: initial?.supplier_id ?? "",
      contract_id: initial?.contract_id ?? "",
      room_type_id: initial?.room_type_id ?? "",
      view_id: initial?.view_id ?? "",
      meal_plan: initial?.meals_included === false
        ? (initial?.breakfast_price ? "BB" : initial?.half_board_price ? "HB" : initial?.full_board_price ? "FB" : "RO")
        : (initial?.meal_plan ?? "BB"),
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
      cancellation_policy_ar: initial?.cancellation_policy_ar ?? "",
      allow_extra_bed: initial?.allow_extra_bed ?? false,
      extra_bed_price: initial?.extra_bed_price ?? "",
      extra_bed_limit: initial?.extra_bed_limit ?? 1,
      meals_included: initial?.meals_included ?? true,
      meal_plan_components: initial?.meals_included ? [initial?.meal_plan ?? "BB"] : [],
      breakfast_price: initial?.breakfast_price ?? "",
      lunch_price: "",
      dinner_price: "",
      half_board_price: initial?.half_board_price ?? "",
      full_board_price: initial?.full_board_price ?? "",
      tax_inclusive: false,
    },
  });

  const hotelId = form.watch("hotel_id");
  const supplierId = form.watch("supplier_id");
  const isDirect = form.watch("is_direct");
  const mealsIncluded = form.watch("meals_included");
  const mealPlanComponents = form.watch("meal_plan_components") || [];
  const allowExtraBed = form.watch("allow_extra_bed");
  const extraBedLimit = form.watch("extra_bed_limit") || 1;
  const extraBedPrice = form.watch("extra_bed_price");
  const currency = form.watch("currency") || "USD";

  const roomTypes = useHotelRoomTypes(hotelId || null);
  const views = useHotelViews(hotelId || null);
  const contracts = useSupplierContracts(supplierId || null);

  // Find selected hotel star rating
  const selectedHotel = hotels.data?.find((h: any) => h.id === hotelId);
  const isStar4or5 = selectedHotel ? (selectedHotel.star_rating === 4 || selectedHotel.star_rating === 5) : false;

  // Query rate taxes to pre-populate the tax selection
  const rateTaxes = useQuery({
    queryKey: ["rate-taxes", initial?.id],
    enabled: !!initial?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_taxes").select("*").eq("rate_id", initial.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (rateTaxes.data && rateTaxes.data.length > 0) {
      const isInclusive = rateTaxes.data.some((x: any) => x.is_inclusive);
      form.setValue("tax_inclusive", isInclusive);
    }
  }, [rateTaxes.data, form]);

  // Reset extra bed values if hotel is not 4 or 5 stars
  useEffect(() => {
    if (!isStar4or5) {
      form.setValue("allow_extra_bed", false);
      form.setValue("extra_bed_price", "");
      form.setValue("extra_bed_limit", 1);
    }
  }, [isStar4or5, form]);

  // Manage UI logic dependencies silently
  useEffect(() => {
    // optional reset logic if needed
  }, [mealsIncluded, form]);

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      const { tax_inclusive } = clean;
      delete clean.tax_inclusive;

      const nullFields = [
        "contract_id", "view_id", "selling_price", "markup_pct", "max_nights", "allotment",
        "notes_en", "notes_ar", "cancellation_policy_en", "cancellation_policy_ar",
        "extra_bed_price", "breakfast_price", "half_board_price", "full_board_price"
      ];
      nullFields.forEach((k) => {
        if (clean[k] === "" || clean[k] === undefined) clean[k] = null;
      });

      // Convert pricing inputs to numbers if they are set
      if (clean.extra_bed_price !== null) clean.extra_bed_price = Number(clean.extra_bed_price);
      if (clean.breakfast_price !== null) clean.breakfast_price = Number(clean.breakfast_price);
      if (clean.lunch_price !== null) clean.lunch_price = Number(clean.lunch_price);
      if (clean.dinner_price !== null) clean.dinner_price = Number(clean.dinner_price);
      if (clean.half_board_price !== null) clean.half_board_price = Number(clean.half_board_price);
      if (clean.full_board_price !== null) clean.full_board_price = Number(clean.full_board_price);

      // Clean up based on allow_extra_bed
      if (!clean.allow_extra_bed) {
        clean.extra_bed_price = null;
        clean.extra_bed_limit = null;
      } else {
        clean.extra_bed_limit = Number(clean.extra_bed_limit);
      }

      // Clean up based on meals_included
      if (clean.meals_included) {
        clean.breakfast_price = null;
        clean.half_board_price = null;
        clean.full_board_price = null;

        // Derive meal_plan from components for backend compatibility
        if (clean.meal_plan_components.includes('FB')) clean.meal_plan = 'FB';
        else if (clean.meal_plan_components.includes('HB')) clean.meal_plan = 'HB';
        else clean.meal_plan = 'BB';
      } else {
        clean.meal_plan = "RO";
      }

      delete clean.meal_plan_components;
      delete clean.lunch_price;
      delete clean.dinner_price;

      if (clean.is_direct) {
        clean.supplier_id = null;
        clean.contract_id = null;
      } else if (clean.supplier_id === "") {
        clean.supplier_id = null;
      }

      if (initial?.id) {
        // Approved rates → create a new draft version via RPC
        if (initial.status === "approved") {
          // Fetch existing taxes of the approved rate
          const { data: oldTaxes, error: fetchErr } = await supabase
            .from("rate_taxes")
            .select("*")
            .eq("rate_id", initial.id);
          if (fetchErr) throw fetchErr;

          const { data, error } = await supabase.rpc("create_rate_version", {
            _rate_id: initial.id,
            _changes: clean as any,
          });
          if (error) throw error;
          const newRateId = data as string;

          // Copy taxes to the new version with the updated is_inclusive
          if (oldTaxes && oldTaxes.length > 0) {
            const newTaxes = oldTaxes.map((ot: any) => ({
              rate_id: newRateId,
              name: ot.name,
              tax_type: ot.tax_type,
              value: ot.value,
              is_inclusive: !!tax_inclusive,
              applies_to: ot.applies_to,
            }));
            const { error: insertErr } = await supabase.from("rate_taxes").insert(newTaxes);
            if (insertErr) throw insertErr;
          } else {
            // Insert default VAT tax
            const { error: insertErr } = await supabase.from("rate_taxes").insert({
              rate_id: newRateId,
              name: "VAT 15%",
              tax_type: "percentage",
              value: 15,
              is_inclusive: !!tax_inclusive,
              applies_to: "total"
            });
            if (insertErr) throw insertErr;
          }

          toast.info(t("rates.versioned_saved"));
          return newRateId;
        }

        // Draft update
        const { error } = await supabase.from("rates").update(clean).eq("id", initial.id);
        if (error) throw error;

        // Update existing taxes
        const { data: existingTaxes, error: fetchErr } = await supabase
          .from("rate_taxes")
          .select("id")
          .eq("rate_id", initial.id);
        if (fetchErr) throw fetchErr;

        if (existingTaxes && existingTaxes.length > 0) {
          const { error: taxErr } = await supabase
            .from("rate_taxes")
            .update({ is_inclusive: !!tax_inclusive })
            .eq("rate_id", initial.id);
          if (taxErr) throw taxErr;
        } else {
          // Insert default VAT tax if none exists
          const { error: taxErr } = await supabase.from("rate_taxes").insert({
            rate_id: initial.id,
            name: "VAT 15%",
            tax_type: "percentage",
            value: 15,
            is_inclusive: !!tax_inclusive,
            applies_to: "total"
          });
          if (taxErr) throw taxErr;
        }

        return initial.id as string;
      } else {
        // Create new rate
        const { data, error } = await supabase
          .from("rates").insert({ ...clean, code: "", status: "draft" }).select("id").single();
        if (error) throw error;
        const newRateId = data.id as string;

        // Insert default VAT tax record with the selected inclusive value
        const { error: taxErr } = await supabase.from("rate_taxes").insert({
          rate_id: newRateId,
          name: "VAT 15%",
          tax_type: "percentage",
          value: 15,
          is_inclusive: !!tax_inclusive,
          applies_to: "total"
        });
        if (taxErr) throw taxErr;

        return newRateId;
      }
    },


    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rates"] });
      qc.invalidateQueries({ queryKey: ["rate", id] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-6">
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
                            form.setValue("contract_id", "");
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Column 1: Right Column (Hotel, Room Type, Meals / Meal Prices, Extra Bed) */}
            <div className="space-y-4">
              <FormField control={form.control} name="hotel_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.hotel")} *</FormLabel>
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("room_type_id", ""); form.setValue("view_id", ""); }}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {hotels.data?.map((h: any) => (
                        <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="room_type_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.room_type")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!hotelId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {roomTypes.data?.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>{lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />



              {isStar4or5 && (
                <div className={cn(
                  "border rounded-lg p-3 space-y-3 transition-all",
                  allowExtraBed ? "bg-amber-50/20 border-amber-200/60 dark:bg-amber-950/10 dark:border-amber-900/40" : "bg-muted/10 border-border/60"
                )}>
                  <div className="flex items-center justify-between">
                    <FormField control={form.control} name="allow_extra_bed" render={({ field }) => (
                      <FormItem className="flex items-start gap-2.5 space-y-0">
                        <FormControl className="mt-1">
                          <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-semibold cursor-pointer">{t("rates.extra_bed.title")}</FormLabel>
                          <div className="text-[11px] text-muted-foreground leading-snug">{t("rates.extra_bed.description")}</div>
                        </div>
                      </FormItem>
                    )} />
                    {allowExtraBed && (
                      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/40 dark:bg-amber-900/30 px-2 py-0.5 rounded text-end leading-normal">
                        {extraBedPrice ? `+${(Number(extraBedPrice) || 0) * extraBedLimit}` : "+0"} {lang === "ar" ? "ريال" : "SAR"} <br /> <span className="text-[10px] font-normal text-muted-foreground">{t("rates.extra_bed.per_night")}</span>
                      </div>
                    )}
                  </div>

                  {allowExtraBed && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                      <FormField control={form.control} name="extra_bed_price" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t("rates.extra_bed.price")} ({lang === "ar" ? "ريال" : "SAR"}) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">{t("rates.extra_bed.limit")}</label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("extra_bed_limit", Math.max(1, extraBedLimit - 1))}
                            disabled={extraBedLimit <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{extraBedLimit}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => form.setValue("extra_bed_limit", Math.min(10, extraBedLimit + 1))}
                            disabled={extraBedLimit >= 10}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{t("rates.extra_bed.max_limit_disclaimer")}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Middle Column (Supplier, View) */}
            <div className="space-y-4">
              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.supplier")} {!isDirect && "*"}</FormLabel>
                  <Select value={field.value || ""} onValueChange={(v) => { field.onChange(v); form.setValue("contract_id", ""); }} disabled={isDirect}>
                    <FormControl><SelectTrigger><SelectValue placeholder={isDirect ? t("rates.source.direct") : "—"} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {suppliers.data?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="view_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.view")}</FormLabel>
                  <Select value={field.value || "none"} onValueChange={(x) => field.onChange(x === "none" ? "" : x)} disabled={!hotelId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {views.data?.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{lang === "ar" ? (v.name_ar || v.name_en) : (v.name_en || v.name_ar)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Column 3: Left Column (Currency, Dates Range) */}
            <div className="space-y-4">
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("label.currency")} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {currencies.data?.map((c: any) => (
                        <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
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
          <CardContent className="p-6">
            <MealPlanConfigurator 
              mealsIncluded={mealsIncluded ?? true}
              onMealsIncludedChange={(v) => form.setValue("meals_included", v)}
              mealPlanComponents={mealPlanComponents}
              onMealPlanComponentsChange={(v) => form.setValue("meal_plan_components", v)}
              currency={currency}
              prices={{
                breakfast_price: form.watch("breakfast_price"),
                lunch_price: form.watch("lunch_price"),
                dinner_price: form.watch("dinner_price"),
                half_board_price: form.watch("half_board_price"),
                full_board_price: form.watch("full_board_price"),
              }}
              onPriceChange={(field, val) => form.setValue(field, val)}
              lang={lang as any}
            />
          </CardContent>
        </Card>

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
            <FormField control={form.control} name="markup_pct" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.markup")}</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tax_inclusive" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("rates.tax_inclusive_select")}</FormLabel>
                <Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rates.tax_inclusive_select")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">{t("rates.tax_inclusive_yes")}</SelectItem>
                    <SelectItem value="false">{t("rates.tax_inclusive_no")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

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
          <Button className="w-[300px]" type="submit" disabled={mut.isPending}>{mut.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </div>
      </form>
    </Form>
  );
}
