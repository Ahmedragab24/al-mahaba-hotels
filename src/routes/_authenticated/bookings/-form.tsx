import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SelectedRate } from "@/components/quotation-rates-dialog";
import { HotelRatesSelector } from "@/components/hotel-rates-selector";
import { useI18n } from "@/lib/i18n";
import {
  useCountries,
  useCities,
  useCurrencies,
} from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Globe, CalendarDays, FileText,
  Wallet, CreditCard, Receipt,
} from "lucide-react";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useGetCustomersQuery,
  useGetHotelsQuery,
} from "@/store/api";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENT_MODES = [
  { code: "full", ar: "دفع كامل", en: "Full Payment" },
  { code: "partial", ar: "دفع جزئي", en: "Partial Payment" },
  { code: "deferred", ar: "دفع مؤجل", en: "Deferred Payment" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UI Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border/60 mb-1">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive ms-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Financial Summary Card
// ─────────────────────────────────────────────────────────────────────────────
function FinancialSummary({
  roomRate,
  nights,
  rooms,
  totalAmount,
  amountPaid,
  currency,
  lang,
}: {
  roomRate: number;
  nights: number;
  rooms: number;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  lang: string;
}) {
  const roomTotal = roomRate * Math.max(nights, 0) * Math.max(rooms, 1);
  const remaining = totalAmount - amountPaid;
  const isOverpaid = amountPaid > totalAmount && totalAmount > 0;
  const isPaid = totalAmount > 0 && amountPaid >= totalAmount;

  const fmt = (v: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {lang === "ar" ? "ملخص مالي" : "Financial Summary"}
          </span>
        </div>

        <div className="space-y-2.5">
          {roomRate > 0 && nights > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {lang === "ar"
                  ? `${fmt(roomRate)} × ${nights} ليلة × ${rooms} غرفة`
                  : `${fmt(roomRate)} × ${nights} nights × ${rooms} room${rooms > 1 ? "s" : ""}`}
              </span>
              <span className="font-medium tabular-nums">
                {fmt(roomTotal)} {currency}
              </span>
            </div>
          )}

          <div className="border-t border-border/50 pt-2.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">
                {lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {fmt(totalAmount || 0)} {currency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {lang === "ar" ? "المبلغ المدفوع" : "Amount Paid"}
              </span>
              <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                {fmt(amountPaid || 0)} {currency}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-border/50 pt-2">
              <span className="text-sm font-semibold">
                {lang === "ar" ? "المبلغ المتبقي" : "Remaining Balance"}
              </span>
              <div className="flex items-center gap-2">
                {isOverpaid ? (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                    {lang === "ar" ? "زيادة دفع" : "Overpaid"}
                  </Badge>
                ) : isPaid ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    {lang === "ar" ? "مدفوع بالكامل" : "Fully Paid"}
                  </Badge>
                ) : null}
                <span
                  className={`text-sm font-bold tabular-nums ${remaining < 0
                    ? "text-amber-600"
                    : remaining === 0 && totalAmount > 0
                      ? "text-emerald-600"
                      : "text-destructive"
                    }`}
                >
                  {fmt(Math.max(remaining, 0))} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {totalAmount > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{lang === "ar" ? "نسبة السداد" : "Payment Progress"}</span>
              <span>{Math.min(Math.round((amountPaid / totalAmount) * 100), 100)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverpaid ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                style={{ width: `${Math.min((amountPaid / totalAmount) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main BookingForm Component
// ═════════════════════════════════════════════════════════════════════════════

export function BookingForm({
  initial,
  onSaved,
}: {
  initial?: any;
  onSaved: (id: string) => void;
}) {
  const { t, lang } = useI18n();
  const currencies = useCurrencies({ lang, per_page: 500 });
  const countries = useCountries({ lang, per_page: 500 });

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>([]);
  const [invoiceImage, setInvoiceImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    customer_id: initial?.customer_id ? String(initial.customer_id) : "",
    currency_id: initial?.currency_id ? String(initial.currency_id) : "",
    booking_date: initial?.booking_date
      ? new Date(initial.booking_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),

    country_id: initial?.country_id ? String(initial.country_id) : "",
    city_id: initial?.city_id ? String(initial.city_id) : "",

    hotel_id: initial?.hotel_id ? String(initial.hotel_id) : "",
    room_type_id: initial?.room_type_id ? String(initial.room_type_id) : "",
    rooms: initial?.rooms ?? 1,

    check_in: initial?.check_in ?? "",
    check_out: initial?.check_out ?? "",

    is_direct: initial?.booking_type ? (initial.booking_type === "direct") : (initial?.is_direct ?? true),
    room_rate: initial?.room_rate ?? "",
    total_amount: initial?.total_amount ?? "",
    amount_paid: initial?.amount_paid ?? "",
    payment_mode: initial?.payment_method ?? "full",
    second_payment_date: (() => {
      const dStr = initial?.second_payment_due_date ?? initial?.deferred_payment_due_date;
      if (!dStr) return "";
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
      } catch {
        return "";
      }
    })(),

    special_requests: initial?.special_requests ?? "",
    notes: initial?.notes ?? "",
  });

  const isQuotationMode = !form.is_direct && !!initial?.quotation_id;

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (initial) {
      setForm((f) => ({
        ...f,
        customer_id: initial.customer_id ? String(initial.customer_id) : f.customer_id,
        currency_id: initial.currency_id ? String(initial.currency_id) : f.currency_id,
        booking_date: initial.booking_date
          ? new Date(initial.booking_date).toISOString().slice(0, 10)
          : f.booking_date,
        country_id: initial.country_id ? String(initial.country_id) : f.country_id,
        city_id: initial.city_id ? String(initial.city_id) : f.city_id,
        hotel_id: initial.hotel_id ? String(initial.hotel_id) : f.hotel_id,
        room_type_id: initial.room_type_id ? String(initial.room_type_id) : f.room_type_id,
        rooms: initial.rooms ?? f.rooms,
        check_in: initial.check_in ?? f.check_in,
        check_out: initial.check_out ?? f.check_out,
        is_direct: initial.booking_type ? (initial.booking_type === "direct") : (initial.is_direct ?? f.is_direct),
        room_rate: initial.room_rate ?? f.room_rate,
        total_amount: initial.total_amount ?? f.total_amount,
        amount_paid: initial.amount_paid ?? f.amount_paid,
        payment_mode: initial.payment_method ?? f.payment_mode,
        second_payment_date: (() => {
          const dStr = initial.second_payment_due_date ?? initial.deferred_payment_due_date;
          if (!dStr) return f.second_payment_date;
          try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
            const d = new Date(dStr);
            return isNaN(d.getTime()) ? f.second_payment_date : d.toISOString().slice(0, 10);
          } catch {
            return f.second_payment_date;
          }
        })(),
        special_requests: initial.special_requests ?? f.special_requests,
        notes: initial.notes ?? f.notes,
      }));
    }
  }, [initial]);

  const currencyList = useMemo(() => {
    if (!currencies.data) return [];
    if (Array.isArray(currencies.data)) return currencies.data;
    if (currencies.data.data && Array.isArray(currencies.data.data)) return currencies.data.data;
    return [];
  }, [currencies.data]);

  const currencyCode = useMemo(() => {
    if (!form.currency_id) return "SAR";
    const found = currencyList.find((c: any) => String(c.id) === String(form.currency_id));
    return found?.code || "SAR";
  }, [form.currency_id, currencyList]);

  const countryList = useMemo(() => {
    if (!countries.data) return [];
    if (Array.isArray(countries.data)) return countries.data;
    if (countries.data.data && Array.isArray(countries.data.data)) return countries.data.data;
    return [];
  }, [countries.data]);

  const cities = useCities(form.country_id || null);

  const cityList = useMemo(() => {
    if (!cities.data) return [];
    if (Array.isArray(cities.data)) return cities.data;
    if (cities.data.data && Array.isArray(cities.data.data)) return cities.data.data;
    return [];
  }, [cities.data]);

  const customersQuery = useGetCustomersQuery({ all: true });

  const customerList = useMemo(() => {
    const d = customersQuery.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray((d as any).data)) return (d as any).data;
    return [];
  }, [customersQuery.data]);

  const hotelsQuery = useGetHotelsQuery({
    per_page: 1000,
    lang,
    country_id: form.country_id || undefined,
    city_id: form.city_id || undefined,
  });

  const hotelList = useMemo(() => {
    const d = hotelsQuery.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray((d as any).data)) return (d as any).data;
    return [];
  }, [hotelsQuery.data]);

  const filteredHotels = useMemo(() => {
    let list = hotelList;
    if (form.country_id) list = list.filter((h: any) => String(h.country_id) === String(form.country_id));
    if (form.city_id) list = list.filter((h: any) => String(h.city_id) === String(form.city_id));
    return list;
  }, [hotelList, form.country_id, form.city_id]);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const diff =
      (new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) /
      86400000;
    return Math.max(0, diff);
  }, [form.check_in, form.check_out]);

  const roomRate = Number(form.room_rate) || 0;
  const totalAmount = Number(form.total_amount) || 0;
  const amountPaid = Number(form.amount_paid) || 0;
  const remaining = totalAmount - amountPaid;

  const initialRooms = useQuery({
    queryKey: ["booking-rooms-initial", initial?.id],
    enabled: !!initial?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_rooms")
        .select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar), supplier:suppliers(name_en,name_ar), rate:rates(*)")
        .eq("booking_id", initial.id)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  useEffect(() => {
    if (initialRooms.data && initialRooms.data.length > 0 && selectedItems.length === 0) {
      setSelectedItems(
        initialRooms.data.map((r: any) => ({
          rate_id: r.rate_id,
          room_type_id: r.room_type_id || r.rate?.room_type_id,
          view_id: r.rate?.view_id || null,
          meal_plan: r.rate?.meal_plan || "RO",
          selling_price: Number(r.selling_price) || 0,
          rooms: r.rooms || 1,
          supplier_id: r.supplier_id || null,
          is_direct: r.rate?.is_direct ?? true,
          room_name_en: r.room_type?.name_en,
          room_name_ar: r.room_type?.name_ar,
          supplier_name_en: r.supplier?.name_en,
          supplier_name_ar: r.supplier?.name_ar,
        }))
      );
    }
  }, [initialRooms.data]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      const totalRoomsCount = selectedItems.reduce((sum, item) => sum + (item.rooms || 0), 0);
      const roomTotalRate = selectedItems.reduce((sum, item) => sum + (Number(item.selling_price) || 0) * (item.rooms || 1), 0);
      const autoTotal = roomTotalRate * nights;

      setForm((f) => ({
        ...f,
        rooms: totalRoomsCount,
        room_rate: String(roomTotalRate / (totalRoomsCount || 1)),
        total_amount: autoTotal > 0 ? String(autoTotal) : f.total_amount,
        amount_paid: f.payment_mode === "full" ? (autoTotal > 0 ? String(autoTotal) : f.amount_paid) : f.amount_paid,
      }));
    }
  }, [selectedItems, nights]);

  const handleCountryChange = (val: string) => {
    setForm((f) => ({ ...f, country_id: val, city_id: "", hotel_id: "", room_type_id: "" }));
    setSelectedItems([]);
  };
  const handleCityChange = (val: string) => {
    setForm((f) => ({ ...f, city_id: val, hotel_id: "", room_type_id: "" }));
    setSelectedItems([]);
  };
  const handleHotelChange = (val: string) => {
    setForm((f) => ({ ...f, hotel_id: val, room_type_id: "" }));
    setSelectedItems([]);
  };

  const handlePaymentModeChange = (val: string) => {
    setForm((f) => ({
      ...f,
      payment_mode: val,
      amount_paid: val === "full" ? f.total_amount : val === "deferred" ? "0" : f.amount_paid,
    }));
  };

  const saveBooking = async () => {
    if (!form.customer_id) {
      toast.error(t("bk.customer") + " *");
      return;
    }
    if (!isQuotationMode) {
      if (!form.hotel_id) {
        toast.error(ar("يجب اختيار الفندق", "Hotel is required") + " *");
        return;
      }
      if (!form.check_in || !form.check_out) {
        toast.error(ar("يجب تحديد تواريخ الإقامة", "Check-in/out dates required") + " *");
        return;
      }
    }

    try {
      let payload: any = {};
      if (isQuotationMode) {
        payload = {
          booking_type: "quotation",
          booking_date: form.booking_date,
          quotation_id: Number(initial.quotation_id),
          payment_method: form.payment_mode,
          paid_amount: Number(form.amount_paid) || 0,
          second_payment_due_date: form.payment_mode === "partial" ? (form.second_payment_date || null) : null,
          deferred_payment_due_date: form.payment_mode === "deferred" ? (form.second_payment_date || null) : null,
          status: initial?.status ?? "confirmed",
        };
      } else {
        payload = {
          booking_type: "direct",
          booking_source: form.is_direct ? "hotel" : "supplier",
          customer_id: Number(form.customer_id),
          currency_id: Number(form.currency_id),
          booking_date: form.booking_date,
          country_id: Number(form.country_id),
          city_id: Number(form.city_id),
          hotel_id: Number(form.hotel_id),
          check_in: form.check_in,
          check_out: form.check_out,
          payment_method: form.payment_mode,
          paid_amount: Number(form.amount_paid) || 0,
          second_payment_due_date: form.payment_mode === "partial" ? (form.second_payment_date || null) : null,
          deferred_payment_due_date: form.payment_mode === "deferred" ? (form.second_payment_date || null) : null,
          special_requests: form.special_requests || "",
          notes: form.notes || "",
          status: initial?.status ?? "confirmed",
          items: selectedItems.map((item) => ({
            price_id: Number(item.rate_id),
            room_count: Number(item.rooms) || 1,
          })),
        };
      }

      let finalBody: any;
      if (invoiceImage) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val === null || val === undefined) {
            // skip
          } else if (key === "items" && Array.isArray(val)) {
            val.forEach((item: any, idx: number) => {
              formData.append(`items[${idx}][price_id]`, String(item.price_id));
              formData.append(`items[${idx}][room_count]`, String(item.room_count));
            });
          } else {
            formData.append(key, String(val));
          }
        });
        formData.append("invoice_image", invoiceImage);
        finalBody = formData;
      } else {
        finalBody = payload;
      }

      let resId = "";
      if (initial?.id) {
        const res = await updateBooking({ id: initial.id, body: finalBody }).unwrap();
        resId = String(res.id);
      } else {
        const res = await createBooking(finalBody).unwrap();
        resId = String(res.id);
      }

      toast.success(t("toast.saved"));
      onSaved(resId);
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      {/* ── 1. Customer & Booking Info ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={User}
            title={ar("بيانات العميل", "Customer Details")}
            subtitle={ar("المعلومات الأساسية للحجز", "Basic booking information")}
          />
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <FormField label={t("bk.customer")} required>
              <Select
                value={form.customer_id}
                onValueChange={(val) => {
                  const selectedCust = customerList.find((c: any) => String(c.id) === String(val));
                  if (selectedCust?.country_id) {
                    setForm((f) => ({
                      ...f,
                      customer_id: val,
                      country_id: String(selectedCust.country_id),
                      city_id: "",
                      hotel_id: "",
                      room_type_id: "",
                      currency_id: selectedCust.currency_id ? String(selectedCust.currency_id) : f.currency_id,
                    }));
                  } else {
                    setForm((f) => ({
                      ...f,
                      customer_id: val,
                      currency_id: selectedCust?.currency_id ? String(selectedCust.currency_id) : f.currency_id,
                    }));
                  }
                  setSelectedItems([]);
                }}
                disabled={!!initial?.quotation_id}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={ar("اختر العميل", "Select customer")} />
                </SelectTrigger>
                <SelectContent>
                  {customerList.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)} —{" "}
                      {t(`ctype.${c.type || c.customer_type || "individual"}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.currency")} required>
              <Select
                value={form.currency_id}
                onValueChange={(v) => set("currency_id", v)}
                disabled={!!initial?.quotation_id}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyList.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("bk.booking_date")} required>
              <Input
                className="h-9"
                type="date"
                value={form.booking_date}
                onChange={(e) => set("booking_date", e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Location & Hotel ── */}
      {!isQuotationMode && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-5">
            <SectionHeader
              icon={Globe}
              title={ar("الوجهة والفندق", "Destination & Hotel")}
              subtitle={ar("اختر الدولة والمدينة والفندق", "Select country, city and hotel")}
            />
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <FormField label={t("label.country", "الدولة")}>
                <Select value={form.country_id} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={ar("اختر الدولة", "Select country")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {lang === "ar" ? c.name_ar : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t("label.city", "المدينة")}>
                <Select
                  value={form.city_id}
                  onValueChange={handleCityChange}
                  disabled={!form.country_id}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={ar("اختر المدينة", "Select city")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cityList.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {lang === "ar" ? c.name_ar : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t("rates.hotel", "الفندق")} required>
                <Select
                  value={form.hotel_id}
                  onValueChange={handleHotelChange}
                  disabled={!form.city_id}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={ar("اختر الفندق", "Select hotel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredHotels.length === 0 ? (
                      <SelectItem value="none" disabled>
                        {ar("لا يتوفر فنادق في هذه المدينة", "No hotels available in this city")}
                      </SelectItem>
                    ) : (
                      filteredHotels.map((h: any) => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                          {h.star_rating || h.stars ? " " + "★".repeat(h.star_rating || h.stars) : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <HotelRatesSelector
              hotelId={form.hotel_id}
              currencyId={form.currency_id}
              currencyCode={currencyCode}
              selectedItems={selectedItems}
              onChange={setSelectedItems}
            />
          </CardContent>
        </Card>
      )}

      {/* ── 4. Stay Dates ── */}
      {!isQuotationMode && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-5">
            <SectionHeader
              icon={CalendarDays}
              title={ar("تواريخ الإقامة", "Stay Dates")}
              subtitle={ar("تاريخ الوصول والمغادرة", "Check-in and check-out dates")}
            />
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <FormField label={ar("تاريخ الوصول (Check-in)", "Check-in Date")} required>
                <Input
                  className="h-9"
                  type="date"
                  value={form.check_in}
                  onChange={(e) => set("check_in", e.target.value)}
                />
              </FormField>

              <FormField label={ar("تاريخ المغادرة (Check-out)", "Check-out Date")} required>
                <Input
                  className="h-9"
                  type="date"
                  value={form.check_out}
                  min={form.check_in || undefined}
                  onChange={(e) => set("check_out", e.target.value)}
                />
              </FormField>

              <div className="flex flex-col justify-end">
                <div
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 ${nights > 0
                    ? "bg-primary/5 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                    }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm font-semibold tabular-nums">
                    {nights > 0
                      ? `${nights} ${ar("ليلة", nights === 1 ? "night" : "nights")}`
                      : ar("لم يُحدَّد بعد", "Not set yet")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 5. Pricing & Payment ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Wallet}
            title={ar("التسعير والدفع", "Pricing & Payment")}
            subtitle={ar("سعر الغرفة وطريقة الدفع والمبلغ المدفوع", "Room rate, payment method and amount paid")}
          />
          <div className="grid gap-6 lg:grid-cols-2 mt-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {!isQuotationMode && (
                  <FormField label={ar("مصدر الحجز", "Booking Source")}>
                    <Select
                      value={form.is_direct ? "direct" : "supplier"}
                      onValueChange={(v) => set("is_direct", v === "direct")}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">{ar("مباشر", "Direct")}</SelectItem>
                        <SelectItem value="supplier">{ar("عن طريق مورد", "Via Supplier")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}

                {!isQuotationMode && (
                  <FormField label={ar("سعر الغرفة / ليلة", "Room Rate / Night")}>
                    <div className="relative">
                      <Input
                        className="h-9 pe-12 bg-muted"
                        type="number"
                        readOnly
                        placeholder="0.00"
                        value={form.room_rate}
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        {currencyCode}
                      </span>
                    </div>
                  </FormField>
                )}

                <FormField label={ar("المبلغ الإجمالي", "Total Amount")}>
                  <div className="relative">
                    <Input
                      className="h-9 pe-12"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={form.total_amount}
                      readOnly={!isQuotationMode}
                      onChange={(e) => {
                        if (isQuotationMode) {
                          set("total_amount", e.target.value);
                          if (form.payment_mode === "full") {
                            set("amount_paid", e.target.value);
                          }
                        }
                      }}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                      {currencyCode}
                    </span>
                  </div>
                </FormField>
              </div>

              <FormField label={ar("طريقة الدفع", "Payment Mode")}>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_MODES.map((pm) => (
                    <button
                      key={pm.code}
                      type="button"
                      onClick={() => handlePaymentModeChange(pm.code)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150 ${form.payment_mode === pm.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/40 text-muted-foreground"
                        }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      {lang === "ar" ? pm.ar : pm.en}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label={ar("المبلغ المدفوع", "Amount Paid")}>
                <div className="relative">
                  <Input
                    className="h-9 pe-12"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount_paid}
                    disabled={form.payment_mode === "deferred"}
                    onChange={(e) => set("amount_paid", e.target.value)}
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                    {currencyCode}
                  </span>
                </div>
                {remaining > 0 && totalAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {ar("المبلغ المتبقي: ", "Remaining: ")}
                    <span className="font-semibold text-destructive tabular-nums">
                      {new Intl.NumberFormat().format(remaining)} {currencyCode}
                    </span>
                  </p>
                )}
              </FormField>

              {(form.payment_mode === "partial" || form.payment_mode === "deferred") && (
                <FormField label={form.payment_mode === "partial" ? ar("تاريخ سداد الدفعة الثانية", "Second Payment Date") : ar("تاريخ الدفعة المؤجلة", "Deferred Payment Date")}>
                  <Input
                    className="h-9"
                    type="date"
                    value={form.second_payment_date}
                    onChange={(e) => set("second_payment_date", e.target.value)}
                  />
                </FormField>
              )}

              <FormField label={ar("صورة الفاتورة (اختياري)", "Invoice Image (Optional)")}>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInvoiceImage(file);
                    } else {
                      setInvoiceImage(null);
                    }
                  }}
                />
                {initial?.invoice_image && !invoiceImage && (
                  <div className="mt-2 text-xs">
                    <a
                      href={initial.invoice_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      {ar("عرض الفاتورة الحالية", "View current invoice")}
                    </a>
                  </div>
                )}
              </FormField>
            </div>

            <FinancialSummary
              roomRate={roomRate}
              nights={nights}
              rooms={form.rooms}
              totalAmount={totalAmount}
              amountPaid={amountPaid}
              currency={currencyCode}
              lang={lang}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 6. Notes & Requests ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={FileText}
            title={ar("الطلبات والملاحظات", "Requests & Notes")}
            subtitle={ar("أي طلبات خاصة أو ملاحظات إضافية", "Special requests or additional notes")}
          />
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <FormField label={t("bk.special_requests")}>
              <Textarea
                className="min-h-[80px] resize-none"
                placeholder={ar("أي طلبات خاصة...", "Any special requests...")}
                value={form.special_requests}
                onChange={(e) => set("special_requests", e.target.value)}
              />
            </FormField>
            <FormField label={t("label.notes")}>
              <Textarea
                className="min-h-[80px] resize-none"
                placeholder={ar("ملاحظات داخلية...", "Internal notes...")}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* ── Save ── */}
      <div className="flex justify-end gap-3 pt-1">
        <Button
          size="lg"
          className="min-w-[160px] font-semibold"
          disabled={isSaving}
          onClick={saveBooking}
        >
          {isSaving
            ? ar("جاري الحفظ...", "Saving...")
            : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
