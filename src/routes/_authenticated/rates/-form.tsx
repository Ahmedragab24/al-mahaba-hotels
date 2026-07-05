import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import {
  useHotelsLite, useMealPlans, useCurrencies, useSuppliersLite,
} from "@/lib/lookups";
import { useGetRoomsQuery } from "@/store/services/rooms/roomsService";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreatePriceMutation, useUpdatePriceMutation, useGetPricesQuery } from "@/store/services/pricing/pricingService";
import { MealPlanConfigurator } from "@/components/meal-plan-configurator";
import { Calendar, Hotel } from "lucide-react";

function buildSchema(t: (k: string) => string, initial?: any) {
  return z.object({
    hotel_id: z.coerce.string().min(1, t("val.required_hotel")),
    is_direct: z.boolean().default(false),
    supplier_id: z.coerce.string().optional().or(z.literal("")),
    room_id: z.coerce.string().min(1, t("val.required_room")),
    hotel_view_id: z.coerce.string().optional().or(z.literal("")),
    currency_id: z.coerce.string().min(1, t("val.required_currency")),
    valid_from: z.string().min(1, t("val.required_date_from")),
    valid_to: z.string().min(1, t("val.required_date_to")),

    meal_plan_type: z.enum(["inclusive", "exclusive"]).default("inclusive"),
    meal_plan_inclusive_details: z.array(z.number()).default([]),
    meal_plan_exclusive_prices: z.record(z.string(), z.coerce.number()).default({}),

    is_weekend_weekday: z.boolean().default(false),

    cost_per_night: z.coerce.number().nonnegative(t("val.nonnegative")).optional().or(z.literal("")),
    selling_price: z.coerce.number().nonnegative(t("val.nonnegative")).optional().or(z.literal("")),
    profit_margin: z.coerce.number().optional().or(z.literal("")),

    weekend_price: z.object({
      cost_per_night: z.coerce.number().nonnegative(t("val.nonnegative")).optional().or(z.literal("")),
      days: z.array(z.string()).default([]),
    }).optional(),
    weekday_price: z.object({
      cost_per_night: z.coerce.number().nonnegative(t("val.nonnegative")).optional().or(z.literal("")),
      days: z.array(z.string()).default([]),
    }).optional(),

    tax_type: z.enum(["inclusive_tax", "exclusive_tax"]).default("inclusive_tax"),
    tax_rate: z.coerce.number().nonnegative(t("val.nonnegative")).default(15),

    status: z.string().default("valid"),

    notes_en: z.string().max(2000, t("val.max_2000")).optional().or(z.literal("")),
    notes_ar: z.string().max(2000, t("val.max_2000")).optional().or(z.literal("")),
    cancellation_policy_en: z.string().max(4000, t("val.max_4000")).optional().or(z.literal("")),
    cancellation_policy_ar: z.string().max(4000, t("val.max_4000")).optional().or(z.literal("")),
  })
    .refine((v) => !v.valid_from || !v.valid_to || new Date(v.valid_to) >= new Date(v.valid_from), {
      path: ["valid_to"],
      message: t("val.date_range"),
    })
    .refine((v) => v.is_direct || (v.supplier_id && v.supplier_id.toString().length > 0), {
      path: ["supplier_id"],
      message: t("val.required_supplier"),
    })
    .superRefine((data, ctx) => {
      if (data.is_weekend_weekday) {
        if (data.weekend_price?.cost_per_night === undefined || data.weekend_price?.cost_per_night === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("val.required_cost"),
            path: ["weekend_price", "cost_per_night"],
          });
        }
        if (!data.weekend_price?.days || data.weekend_price.days.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("val.required_days"),
            path: ["weekend_price", "days"],
          });
        }
        if (data.weekday_price?.cost_per_night === undefined || data.weekday_price?.cost_per_night === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("val.required_cost"),
            path: ["weekday_price", "cost_per_night"],
          });
        }
        if (!data.weekday_price?.days || data.weekday_price.days.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("val.required_days"),
            path: ["weekday_price", "days"],
          });
        }
      } else {
        if (data.cost_per_night === undefined || data.cost_per_night === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("val.required_cost"),
            path: ["cost_per_night"],
          });
        }
      }
    });
}

type FormVals = z.input<ReturnType<typeof buildSchema>>;

export function RateForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite({ refetchInterval: 2000 });
  const suppliers = useSuppliersLite({ refetchInterval: 2000 });
  const currencies = useCurrencies({ refetchInterval: 2000 });
  const { data: mealPlansRes } = useMealPlans({ refetchInterval: 2000 });
  const dynamicMeals = Array.isArray(mealPlansRes) ? mealPlansRes : (mealPlansRes?.data || []);

  const [createPrice, { isLoading: isCreating }] = useCreatePriceMutation();
  const [updatePrice, { isLoading: isUpdating }] = useUpdatePriceMutation();
  const isPending = isCreating || isUpdating;

  const schema = useMemo(() => buildSchema(t, initial), [lang, initial]);

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
      meal_plan_exclusive_prices: initial?.meal_plan_exclusive_prices ?? initial?.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id.toString()]: d.price }), {}) ?? {},
      is_weekend_weekday: initial?.is_weekend_weekday ?? false,
      cost_per_night: initial?.cost_per_night ?? "",
      selling_price: initial?.selling_price?.toString() ?? "",
      profit_margin: initial?.profit_margin?.toString() ?? "5",
      weekend_price: {
        cost_per_night: (initial?.is_weekend_weekday && initial?.price_type === 'weekend') ? (initial?.cost_per_night ?? "") : (initial?.weekend_price?.cost_per_night ?? ""),
        days: (initial?.is_weekend_weekday && initial?.price_type === 'weekend' && initial?.days?.length > 0) ? initial.days : (initial?.weekend_price?.days ?? ["Friday", "Saturday"]),
      },
      weekday_price: {
        cost_per_night: (initial?.is_weekend_weekday && initial?.price_type === 'weekday') ? (initial?.cost_per_night ?? "") : (initial?.weekday_price?.cost_per_night ?? ""),
        days: (initial?.is_weekend_weekday && initial?.price_type === 'weekday' && initial?.days?.length > 0) ? initial.days : (initial?.weekday_price?.days ?? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]),
      },
      tax_type: initial?.tax_type ?? "inclusive_tax",
      tax_rate: initial?.tax_rate ?? 15,
      status: initial?.status ?? "valid",
      notes_en: initial?.notes_en ?? initial?.notes ?? "",
      notes_ar: initial?.notes_ar ?? initial?.notes ?? "",
      cancellation_policy_en: initial?.cancellation_policy_en ?? initial?.cancellation_policy ?? "Guests may cancel their reservation free of charge up to 48 hours before the scheduled check-in date. Cancellations made within 48 hours of check-in, or failure to arrive (No-Show), will incur a charge equivalent to the first night's stay or as specified by the booked rate. For Non-Refundable reservations, no refund will be issued once the booking has been confirmed. Any eligible refunds will be processed in accordance with the hotel's policy and the original payment method.",
      cancellation_policy_ar: initial?.cancellation_policy_ar ?? initial?.cancellation_policy ?? "يمكن للضيف إلغاء الحجز مجانًا حتى 48 ساعة قبل موعد تسجيل الوصول. في حال الإلغاء خلال أقل من 48 ساعة من موعد الوصول أو في حالة عدم الحضور (No-Show)، سيتم خصم قيمة الليلة الأولى أو وفقًا لشروط السعر المحجوز. في حال كان الحجز غير قابل للاسترداد (Non-Refundable)، فلن يتم استرداد أي مبالغ مدفوعة بعد تأكيد الحجز. تتم معالجة أي مبالغ مستحقة للاسترداد، إن وجدت، وفقًا لسياسة الفندق وطريقة الدفع المستخدمة.",
    },
  });

  const siblingQuery = useGetPricesQuery({
    hotel_id: initial?.hotel_id ? Number(initial.hotel_id) : undefined,
    room_id: initial?.room_id ? Number(initial.room_id) : undefined,
    supplier_id: initial?.supplier_id ? Number(initial.supplier_id) : undefined,
    is_direct: initial?.is_direct,
    valid_from: initial?.valid_from ? initial.valid_from.split('T')[0] : undefined,
    valid_to: initial?.valid_to ? initial.valid_to.split('T')[0] : undefined,
    all: "1",
  }, {
    skip: !initial?.id || !initial?.is_weekend_weekday
  });

  useEffect(() => {
    if (initial) {
      let weCost = (initial?.is_weekend_weekday && initial?.price_type === 'weekend') ? (initial?.cost_per_night ?? "") : "";
      let weDays = (initial?.is_weekend_weekday && initial?.price_type === 'weekend' && initial?.days?.length > 0) ? initial.days : ["Friday", "Saturday"];
      
      let wdCost = (initial?.is_weekend_weekday && initial?.price_type === 'weekday') ? (initial?.cost_per_night ?? "") : "";
      let wdDays = (initial?.is_weekend_weekday && initial?.price_type === 'weekday' && initial?.days?.length > 0) ? initial.days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

      const siblingRates = Array.isArray(siblingQuery.data) 
        ? siblingQuery.data 
        : (Array.isArray((siblingQuery.data as any)?.data) ? (siblingQuery.data as any).data : []);
      
      if (siblingRates && siblingRates.length > 0) {
        const weRate = siblingRates.find((r: any) => r.price_type === "weekend");
        const wdRate = siblingRates.find((r: any) => r.price_type === "weekday");

        if (weRate) {
          weCost = weRate.cost_per_night ?? "";
          weDays = weRate.days?.length > 0 ? weRate.days : ["Friday", "Saturday"];
        }
        if (wdRate) {
          wdCost = wdRate.cost_per_night ?? "";
          wdDays = wdRate.days?.length > 0 ? wdRate.days : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
        }
      }

      form.reset({
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
        meal_plan_exclusive_prices: initial?.meal_plan_exclusive_prices ?? initial?.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id.toString()]: d.price }), {}) ?? {},
        is_weekend_weekday: initial?.is_weekend_weekday ?? false,
        cost_per_night: initial?.cost_per_night ?? "",
        selling_price: initial?.selling_price?.toString() ?? "",
        profit_margin: initial?.profit_margin?.toString() ?? "5",
        weekend_price: {
          cost_per_night: weCost,
          days: weDays,
        },
        weekday_price: {
          cost_per_night: wdCost,
          days: wdDays,
        },
        tax_type: initial?.tax_type ?? "inclusive_tax",
        tax_rate: initial?.tax_rate ?? 15,
        status: initial?.status ?? "valid",
        notes_en: initial?.notes_en ?? initial?.notes ?? "",
        notes_ar: initial?.notes_ar ?? initial?.notes ?? "",
        cancellation_policy_en: initial?.cancellation_policy_en ?? initial?.cancellation_policy ?? "Guests may cancel their reservation free of charge up to 48 hours before the scheduled check-in date. Cancellations made within 48 hours of check-in, or failure to arrive (No-Show), will incur a charge equivalent to the first night's stay or as specified by the booked rate. For Non-Refundable reservations, no refund will be issued once the booking has been confirmed. Any eligible refunds will be processed in accordance with the hotel's policy and the original payment method.",
        cancellation_policy_ar: initial?.cancellation_policy_ar ?? initial?.cancellation_policy ?? "يمكن للضيف إلغاء الحجز مجانًا حتى 48 ساعة قبل موعد تسجيل الوصول. في حال الإلغاء خلال أقل من 48 ساعة من موعد الوصول أو في حالة عدم الحضور (No-Show)، سيتم خصم قيمة الليلة الأولى أو وفقًا لشروط السعر المحجوز. في حال كان الحجز غير قابل للاسترداد (Non-Refundable)، فلن يتم استرداد أي مبالغ مدفوعة بعد تأكيد الحجز. تتم معالجة أي مبالغ مستحقة للاسترداد، إن وجدت، وفقًا لسياسة الفندق وطريقة الدفع المستخدمة.",
      });
    }
  }, [initial, siblingQuery.data, form]);

  const isEdit = !!initial?.id;
  const activePriceType = initial?.price_type;

  const hotelId = form.watch("hotel_id");
  const isDirect = form.watch("is_direct");
  const mealPlanType = form.watch("meal_plan_type");
  const isWeekendWeekday = form.watch("is_weekend_weekday");
  const costPerNight = form.watch("cost_per_night");
  const profitMargin = form.watch("profit_margin");
  const taxType = form.watch("tax_type");
  const taxRate = form.watch("tax_rate");
  const sellingPrice = form.watch("selling_price");
  const currencyId = form.watch("currency_id");

  const weekendPrice = form.watch("weekend_price");
  const weekdayPrice = form.watch("weekday_price");
  const weCostPerNight = weekendPrice?.cost_per_night;
  const wdCostPerNight = weekdayPrice?.cost_per_night;

  // Auto-calculate selling_price from cost_per_night and profit_margin
  useEffect(() => {
    if (isWeekendWeekday) return;
    const cost = Number(costPerNight) || 0;
    const margin = Number(profitMargin) || 0;
    let price = cost + (cost * margin / 100);

    if (taxType === "inclusive_tax") {
      const rate = Number(taxRate) || 0;
      price = price - (price * rate / 100);
    }

    form.setValue("selling_price", Number(price.toFixed(2)) || 0);
  }, [costPerNight, profitMargin, taxType, taxRate, isWeekendWeekday, form]);



  const calculateDerivedPrices = (costVal: any) => {
    const cost = Number(costVal) || 0;
    const margin = Number(profitMargin) || 0;
    let selling = cost + (cost * margin / 100);
    const rate = Number(taxRate) || 0;

    if (taxType === "inclusive_tax") {
      selling = selling - (selling * rate / 100);
    }

    const totalVal = taxType === "inclusive_tax"
      ? selling
      : selling + (selling * rate / 100);

    return {
      sellingPrice: Number(selling.toFixed(2)),
      total: Number(totalVal.toFixed(2)),
    };
  };

  const selectedCurrency = (Array.isArray(currencies.data) ? currencies.data : Array.isArray((currencies.data as any)?.data) ? (currencies.data as any).data : [])?.find((c: any) => (c.id || c.code).toString() === currencyId);
  const currencySymbol = selectedCurrency ? (lang === "ar" ? selectedCurrency.symbol_ar : selectedCurrency.symbol_en) || selectedCurrency.code : "";

  const sellingPriceNum = Number(sellingPrice) || 0;
  const taxRateNum = Number(taxRate) || 0;
  const total = taxType === "inclusive_tax"
    ? sellingPriceNum
    : Number((sellingPriceNum + (sellingPriceNum * taxRateNum / 100)).toFixed(2));

  const roomsQuery = useGetRoomsQuery({ hotel_id: hotelId }, { pollingInterval: 2000 });

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
      if (payload.hotel_id) payload.hotel_id = Number(payload.hotel_id);
      if (payload.room_id) payload.room_id = Number(payload.room_id);
      if (payload.hotel_view_id) payload.hotel_view_id = Number(payload.hotel_view_id);
      if (payload.currency_id) payload.currency_id = Number(payload.currency_id);
      if (payload.supplier_id) payload.supplier_id = Number(payload.supplier_id);

      if (payload.tax_rate !== "" && payload.tax_rate !== null && payload.tax_rate !== undefined) {
        payload.tax_rate = Number(payload.tax_rate);
      }

      if (payload.is_weekend_weekday) {
        const margin = Number(payload.profit_margin) || 0;
        const weCost = Number(payload.weekend_price?.cost_per_night) || 0;
        const weDerived = calculateDerivedPrices(weCost);

        payload.weekend_price = {
          cost_per_night: weCost,
          selling_price: weDerived.sellingPrice,
          profit_margin: margin,
          days: payload.weekend_price?.days || [],
        };

        const wdCost = Number(payload.weekday_price?.cost_per_night) || 0;
        const wdDerived = calculateDerivedPrices(wdCost);

        payload.weekday_price = {
          cost_per_night: wdCost,
          selling_price: wdDerived.sellingPrice,
          profit_margin: margin,
          days: payload.weekday_price?.days || [],
        };

        delete payload.cost_per_night;
        delete payload.selling_price;
        delete payload.profit_margin;
      } else {
        if (payload.cost_per_night !== "" && payload.cost_per_night !== null && payload.cost_per_night !== undefined) {
          payload.cost_per_night = Number(payload.cost_per_night);
        }
        if (payload.selling_price !== "" && payload.selling_price !== null && payload.selling_price !== undefined) {
          payload.selling_price = Number(payload.selling_price);
        }
        if (payload.profit_margin !== "" && payload.profit_margin !== null && payload.profit_margin !== undefined) {
          payload.profit_margin = Number(payload.profit_margin);
        }
        delete payload.weekend_price;
        delete payload.weekday_price;
      }

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
      if (e?.data?.errors) {
        const errs = e.data.errors;
        const messages = Object.entries(errs).map(([key, val]) => {
          const fieldName = t(`rates.${key}`, key);
          const errorsList = Array.isArray(val) ? val.join(", ") : String(val);
          return `${fieldName}: ${errorsList}`;
        });
        toast.error(messages.join(" | "));
      } else {
        toast.error(e?.data?.message || e?.message || t("toast.error"));
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-8" dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* Section 1: Property Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="hotel_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("rates.hotel")} *</FormLabel>
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("room_id", ""); }}>
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

              <FormField control={form.control} name="room_id" render={({ field }) => {
                const roomsList = Array.isArray(roomsQuery.data) ? roomsQuery.data : Array.isArray((roomsQuery.data as any)?.data) ? (roomsQuery.data as any).data : [];
                const selectedRoom = roomsList.find((r: any) => r.id.toString() === field.value);
                const roomTypeName = selectedRoom?.room_type
                  ? (lang === "ar" ? (selectedRoom.room_type.name_ar || selectedRoom.room_type.name_en) : (selectedRoom.room_type.name_en || selectedRoom.room_type.name_ar))
                  : null;
                // Support hotel_view as object (name_ar/name_en), or view as string
                const viewObj = selectedRoom?.hotel_view || selectedRoom?.hotelView;
                const roomView = viewObj
                  ? (lang === "ar" ? (viewObj.name_ar || viewObj.name_en) : (viewObj.name_en || viewObj.name_ar))
                  : (typeof selectedRoom?.view === "string" ? selectedRoom.view : null);
                return (
                  <FormItem>
                    <FormLabel>{t("rates.room")} *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={!hotelId}>
                      <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {roomsList.map((r: any) => (
                          <SelectItem key={r.id} value={r.id.toString()}>{lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {/* Auto-populated room info */}
                    {selectedRoom && (
                      <div className="mt-2 rounded-md border bg-muted/40 px-3 py-2 text-xs space-y-1">
                        {roomTypeName && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{t("label.room_type")}:</span>
                            <span className="font-semibold">{roomTypeName}</span>
                          </div>
                        )}
                        {roomView && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{t("rates.view")}:</span>
                            <span className="font-semibold">{roomView}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </FormItem>
                );
              }} />
            </div>

            {/* Section 2: Supplier Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border bg-muted/30 items-center">
              <FormField control={form.control} name="is_direct" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card hover:bg-accent/5 transition-colors m-0">
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

              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem className="m-0">
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
            </div>

            {/* Section 3: Pricing & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <CardContent className="space-y-6 p-6" dir={lang === "ar" ? "rtl" : "ltr"}>

            {/* W.D and W.E Toggle */}
            <FormField control={form.control} name="is_weekend_weekday" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card hover:bg-accent/5 transition-colors">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold cursor-pointer">{t("rates.wd_we_title")}</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )} />

            {isWeekendWeekday ? (
              <div className="space-y-6">
                {/* Global parameters for calculation: Profit Margin & Tax Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField control={form.control} name="profit_margin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rates.profit_margin")} (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tax_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rates.tax_type")}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="inclusive_tax">{t("rates.tax_inclusive_yes")}</SelectItem>
                          <SelectItem value="exclusive_tax">{t("rates.tax_inclusive_no")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {taxType === "inclusive_tax" && (
                    <FormField control={form.control} name="tax_rate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("rates.tax_rate")} (%)</FormLabel>
                        <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>

                {/* Weekend Prices Box */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-start" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fbf6ef] dark:bg-amber-950/30 border border-[#f5e6d3] dark:border-amber-900/30 shrink-0 shadow-sm">
                      <Calendar className="w-4.5 h-4.5 text-[#a8702c] dark:text-amber-500" />
                    </div>
                    <span className="font-bold text-[#1f2937] dark:text-zinc-200 text-base">{t("rates.we_rates")}</span>
                  </div>

                  <Card className="border border-border/30 dark:border-zinc-800/80  rounded-2xl shadow-none p-6">
                    <CardContent className="p-0 space-y-6">
                      {/* Days Checklist */}
                      <div className="flex w-full justify-between flex-wrap gap-x-2 gap-y-3" dir="rtl">
                        {[
                          { key: "Saturday", ar: "السبت", en: "Saturday" },
                          { key: "Sunday", ar: "الاحد", en: "Sunday" },
                          { key: "Monday", ar: "الاثنين", en: "Monday" },
                          { key: "Tuesday", ar: "الثلاثاء", en: "Tuesday" },
                          { key: "Wednesday", ar: "الاربعاء", en: "Wednesday" },
                          { key: "Thursday", ar: "الخميس", en: "Thursday" },
                          { key: "Friday", ar: "الجمعة", en: "Friday" },
                        ].map((day) => {
                          const weDays = form.watch("weekend_price.days") || [];
                          const isChecked = weDays.includes(day.key);
                          return (
                            <div key={day.key} className="flex items-center gap-2 flex-row-reverse">
                              <Checkbox
                                id={`we-day-${day.key}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...weDays, day.key]
                                    : weDays.filter((d: string) => d !== day.key);
                                  form.setValue("weekend_price.days", next, { shouldValidate: true });
                                }}
                                className="data-[state=checked]:bg-[#a8702c] data-[state=checked]:border-[#a8702c] dark:data-[state=checked]:bg-amber-600 dark:data-[state=checked]:border-amber-600 border-border/60 dark:border-zinc-700 rounded-md w-5 h-5 cursor-pointer"
                              />
                              <Label htmlFor={`we-day-${day.key}`} className="text-xs font-semibold text-[#5c6873] dark:text-zinc-400 cursor-pointer">
                                {lang === "ar" ? day.ar : day.en}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      <FormField control={form.control} name="weekend_price.days" render={({ field }) => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Price input row */}
                      <div className="flex items-center justify-between border-t border-border/30 dark:border-zinc-800/80 pt-5 mt-4 relative" dir={lang === "ar" ? "rtl" : "ltr"}>
                        {/* Right side: label + input */}
                        <div className="flex items-center gap-4">
                          <span className="font-extrabold text-base text-[#1f2937] dark:text-zinc-200">{lang === "ar" ? "السعر" : "Price"}</span>
                          <FormField control={form.control} name="weekend_price.cost_per_night" render={({ field }) => (
                            <FormItem className="space-y-1 m-0">
                              <FormControl>
                                <div className="flex items-center gap-1.5 bg-[#fafafc] dark:bg-zinc-900/50 border border-[#f1f1f4] dark:border-zinc-800/80 rounded-2xl px-4 py-2 w-40 h-11 shadow-sm">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="bg-transparent border-0 text-[#a8702c] dark:text-amber-500 font-black text-lg text-center p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-full w-full"
                                    placeholder="60"
                                    {...field}
                                  />
                                  <span className="text-xs font-bold text-[#a8702c] dark:text-amber-500 shrink-0 ps-1">{currencySymbol || "ريال"}</span>
                                </div>
                              </FormControl>
                              <FormMessage className="text-[10px] text-destructive block mt-1" />
                            </FormItem>
                          )} />
                        </div>

                        {/* Left side: Derived Selling and Total Display */}
                        {(() => {
                          const derived = calculateDerivedPrices(weCostPerNight);
                          return (
                            <div className="text-[11px] text-muted-foreground bg-[#fafafc] dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-border/30 dark:border-zinc-800/80 space-y-0.5">
                              <div>{lang === "ar" ? "الإجمالي" : "Total with Tax"}: <span className="font-bold text-primary">{derived.total} {currencySymbol}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekday Prices Box */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-start" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fbf6ef] dark:bg-amber-950/30 border border-[#f5e6d3] dark:border-amber-900/30 shrink-0 shadow-sm">
                      <Hotel className="w-4.5 h-4.5 text-[#a8702c] dark:text-amber-500" />
                    </div>
                    <span className="font-bold text-[#1f2937] dark:text-zinc-200 text-base">{t("rates.wd_rates")}</span>
                  </div>

                  <Card className="border border-border/30 dark:border-zinc-800/80 rounded-2xl shadow-none p-6">
                    <CardContent className="p-0 space-y-6">
                      {/* Days Checklist */}
                      <div className="flex w-full justify-between flex-wrap gap-x-2 gap-y-3" dir="rtl">
                        {[
                          { key: "Saturday", ar: "السبت", en: "Saturday" },
                          { key: "Sunday", ar: "الاحد", en: "Sunday" },
                          { key: "Monday", ar: "الاثنين", en: "Monday" },
                          { key: "Tuesday", ar: "الثلاثاء", en: "Tuesday" },
                          { key: "Wednesday", ar: "الاربعاء", en: "Wednesday" },
                          { key: "Thursday", ar: "الخميس", en: "Thursday" },
                          { key: "Friday", ar: "الجمعة", en: "Friday" },
                        ].map((day) => {
                          const wdDays = form.watch("weekday_price.days") || [];
                          const isChecked = wdDays.includes(day.key);
                          return (
                            <div key={day.key} className="flex items-center gap-2 flex-row-reverse">
                              <Checkbox
                                    id={`wd-day-${day.key}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const next = checked
                                        ? [...wdDays, day.key]
                                        : wdDays.filter((d: string) => d !== day.key);
                                      form.setValue("weekday_price.days", next, { shouldValidate: true });
                                    }}
                                    className="data-[state=checked]:bg-[#a8702c] data-[state=checked]:border-[#a8702c] dark:data-[state=checked]:bg-amber-600 dark:data-[state=checked]:border-amber-600 border-border/60 dark:border-zinc-700 rounded-md w-5 h-5 cursor-pointer"
                                  />
                              <Label htmlFor={`wd-day-${day.key}`} className="text-xs font-semibold text-[#5c6873] dark:text-zinc-400 cursor-pointer">
                                {lang === "ar" ? day.ar : day.en}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      <FormField control={form.control} name="weekday_price.days" render={({ field }) => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Price input row */}
                      <div className="flex items-center justify-between border-t border-border/30 dark:border-zinc-800/80 pt-5 mt-4 relative" dir={lang === "ar" ? "rtl" : "ltr"}>
                        {/* Right side: label + input */}
                        <div className="flex items-center gap-4">
                          <span className="font-extrabold text-base text-[#1f2937] dark:text-zinc-200">{lang === "ar" ? "السعر" : "Price"}</span>
                          <FormField control={form.control} name="weekday_price.cost_per_night" render={({ field }) => (
                            <FormItem className="space-y-1 m-0">
                              <FormControl>
                                <div className="flex items-center gap-1.5 bg-[#fafafc] dark:bg-zinc-900/50 border border-[#f1f1f4] dark:border-zinc-800/80 rounded-2xl px-4 py-2 w-40 h-11 shadow-sm">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="bg-transparent border-0 text-[#a8702c] dark:text-amber-500 font-black text-lg text-center p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-full w-full"
                                    placeholder="45"
                                    {...field}
                                  />
                                  <span className="text-xs font-bold text-[#a8702c] dark:text-amber-500 shrink-0 ps-1">{currencySymbol || "ريال"}</span>
                                </div>
                              </FormControl>
                              <FormMessage className="text-[10px] text-destructive block mt-1" />
                            </FormItem>
                          )} />
                        </div>

                        {/* Left side: Derived Selling and Total Display */}
                        {(() => {
                          const derived = calculateDerivedPrices(wdCostPerNight);
                          return (
                            <div className="text-[11px] text-muted-foreground bg-[#fafafc] dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-border/30 dark:border-zinc-800/80 space-y-0.5">
                              <div>{lang === "ar" ? "الإجمالي" : "Total with Tax"}: <span className="font-bold text-primary">{derived.total} {currencySymbol}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField control={form.control} name="cost_per_night" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rates.cost")} *</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="selling_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rates.selling")} ({lang === "ar" ? "تلقائي" : "Auto"})</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} readOnly className="bg-muted cursor-not-allowed" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="profit_margin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("rates.profit_margin")} (%)</FormLabel>
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

                {taxType === "inclusive_tax" && (
                  <FormField control={form.control} name="tax_rate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("rates.tax_rate")} (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {/* Total Price Display */}
                <div className="col-span-1 sm:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {lang === "ar" ? "الإجمالي (سعر البيع + الضريبة)" : "Total (Selling Price + Tax)"}
                  </span>
                  <div className="text-3xl font-black text-primary mt-1 flex items-baseline gap-1">
                    <span>{total}</span>
                    <span className="text-sm font-medium text-muted-foreground">{currencySymbol}</span>
                  </div>
                </div>
              </div>
            )}
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
              <FormItem><FormLabel>{t("rates.cxl_en")}</FormLabel><FormControl><Textarea rows={6} dir="ltr" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cancellation_policy_ar" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cxl_ar")}</FormLabel><FormControl><Textarea rows={6} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
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
