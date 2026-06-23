import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SelectedRate } from "@/components/quotation-rates-dialog";
import { HotelRatesSelector } from "@/components/hotel-rates-selector";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  useCountries,
  useCities,
  useCurrencies,
  useHotelRoomTypes,
  useHotelViews,
} from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Globe, BedDouble, CalendarDays, FileText,
  Wallet, CreditCard, Receipt, Building2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const OCCUPANCY_TYPES = [
  { code: "SGL", ar: "غرفة مفردة (SGL)", en: "Single (SGL)" },
  { code: "DBL", ar: "غرفة مزدوجة (DBL)", en: "Double (DBL)" },
  { code: "TPL", ar: "غرفة ثلاثية (TPL)", en: "Triple (TPL)" },
  { code: "QUAD", ar: "غرفة رباعية (QUAD)", en: "Quad (QUAD)" },
  { code: "CHD", ar: "طفل (CHD)", en: "Child (CHD)" },
  { code: "INF", ar: "رضيع (INF)", en: "Infant (INF)" },
];

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
          {/* Room subtotal */}
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
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">
                {lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
              </span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {fmt(totalAmount || 0)} {currency}
              </span>
            </div>

            {/* Paid */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {lang === "ar" ? "المبلغ المدفوع" : "Amount Paid"}
              </span>
              <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                {fmt(amountPaid || 0)} {currency}
              </span>
            </div>

            {/* Remaining */}
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

        {/* Payment progress bar */}
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
  const auth = useAuth();
  const currencies = useCurrencies();
  const countries = useCountries();

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>([]);



  const [form, setForm] = useState({
    // Customer & meta
    customer_id: initial?.customer_id ?? "",
    currency: initial?.currency ?? "SAR",
    booking_date: initial?.booking_date
      ? new Date(initial.booking_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),

    // Location
    country_code: initial?.country_code ?? "",
    city_id: initial?.city_id ?? "",

    // Hotel & Room
    hotel_id: initial?.hotel_id ?? "",
    room_type_id: initial?.room_type_id ?? "",
    rooms: initial?.rooms ?? 1,

    // Dates
    check_in: initial?.check_in ?? "",
    check_out: initial?.check_out ?? "",

    // Pricing
    is_direct: initial?.is_direct ?? true,
    room_rate: initial?.room_rate ?? "",       // نرخ الغرفة في الليلة
    total_amount: initial?.total_amount ?? "", // المبلغ الإجمالي
    amount_paid: initial?.amount_paid ?? "",   // المدفوع
    payment_mode: initial?.payment_mode ?? "full",
    second_payment_date: initial?.second_payment_date ?? "",

    // Requests & notes
    special_requests: initial?.special_requests ?? "",
    notes: initial?.notes ?? "",
  });

  const cities = useCities(form.country_code || null);
  const roomTypes = useHotelRoomTypes(form.hotel_id || null);
  const views = useHotelViews(form.hotel_id || null);

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () =>
      (
        await supabase
          .from("customers")
          .select("id,name_en,name_ar,customer_type,country_code")
          .is("deleted_at", null)
          .order("name_en")
      ).data ?? [],
  });

  const hotelsQuery = useQuery({
    queryKey: ["lookup-hotels-with-loc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id,name_en,name_ar,city_id,country_code,star_rating")
        .is("deleted_at", null)
        .order("name_en");
      if (error) throw error;
      return data ?? [];
    },
  });



  const filteredHotels = useMemo(() => {
    let list = hotelsQuery.data ?? [];
    if (form.country_code) list = list.filter((h) => h.country_code === form.country_code);
    if (form.city_id) list = list.filter((h) => h.city_id === form.city_id);
    return list;
  }, [hotelsQuery.data, form.country_code, form.city_id]);

  // Derived calculations
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

  // Load initial booking rooms if editing
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

  // Populate selectedItems when initialRooms finishes loading
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

  // Auto-calculate total from selected items
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
    setForm((f) => ({ ...f, country_code: val, city_id: "", hotel_id: "", room_type_id: "" }));
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

  // Auto-fill total when room_rate / nights / rooms change
  const handleRateChange = (val: string) => {
    const rate = Number(val) || 0;
    const autoTotal = rate * nights * form.rooms;
    setForm((f) => ({
      ...f,
      room_rate: val,
      total_amount: autoTotal > 0 ? String(autoTotal) : f.total_amount,
      amount_paid: f.payment_mode === "full" ? String(autoTotal) : f.amount_paid,
    }));
  };

  const handlePaymentModeChange = (val: string) => {
    setForm((f) => ({
      ...f,
      payment_mode: val,
      amount_paid: val === "full" ? f.total_amount : val === "deferred" ? "0" : f.amount_paid,
    }));
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("bk.customer") + " *");
      if (!form.hotel_id) throw new Error(ar("يجب اختيار الفندق", "Hotel is required") + " *");
      if (!form.check_in || !form.check_out) throw new Error(ar("يجب تحديد تواريخ الإقامة", "Check-in/out dates required") + " *");
      
      const primaryRoomTypeId = selectedItems[0]?.room_type_id || null;
      const totalRoomsCount = selectedItems.reduce((sum, item) => sum + (item.rooms || 0), 0) || 1;

      const payload: any = {
        customer_id: form.customer_id,
        currency: (form.currency || "SAR").toUpperCase(),
        booking_date: form.booking_date,
        hotel_id: form.hotel_id || null,
        room_type_id: primaryRoomTypeId,
        rooms: totalRoomsCount,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        is_direct: form.is_direct,
        room_rate: form.room_rate ? Number(form.room_rate) : null,
        total_amount: form.total_amount ? Number(form.total_amount) : null,
        amount_paid: form.amount_paid ? Number(form.amount_paid) : 0,
        payment_mode: form.payment_mode || null,
        second_payment_date: form.second_payment_date || null,
        special_requests: form.special_requests || null,
        notes: form.notes || null,
      };

      let bookingId = "";
      if (initial?.id) {
        const { error } = await supabase.from("bookings").update(payload).eq("id", initial.id);
        if (error) throw error;
        bookingId = initial.id;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase
          .from("bookings")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        bookingId = data.id as string;

        if (selectedItems.length > 0) {
          const roomsPayload = selectedItems.map(item => ({
            booking_id: bookingId,
            hotel_id: form.hotel_id,
            rate_id: item.rate_id,
            room_type_id: item.room_type_id,
            occupancy_type: "double",
            check_in: form.check_in,
            check_out: form.check_out,
            rooms: item.rooms,
            cost_price: null,
            selling_price: item.selling_price,
          }));
          const { error: roomsError } = await supabase.from("booking_rooms").insert(roomsPayload);
          if (roomsError) throw roomsError;
        }
      }
      return bookingId;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      onSaved(id);
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

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
                  const selectedCust = customers.data?.find((c: any) => c.id === val);
                  if (selectedCust?.country_code) {
                    setForm((f) => ({
                      ...f,
                      customer_id: val,
                      country_code: selectedCust.country_code,
                      city_id: selectedCust.country_code !== f.country_code ? "" : f.city_id,
                      hotel_id: selectedCust.country_code !== f.country_code ? "" : f.hotel_id,
                      room_type_id: selectedCust.country_code !== f.country_code ? "" : f.room_type_id,
                    }));
                  } else {
                    setForm((f) => ({ ...f, customer_id: val }));
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={ar("اختر العميل", "Select customer")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)} —{" "}
                      {t(`ctype.${c.customer_type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.currency")} required>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.data?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
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
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Globe}
            title={ar("الوجهة والفندق", "Destination & Hotel")}
            subtitle={ar("اختر الدولة والمدينة والفندق", "Select country, city and hotel")}
          />
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <FormField label={t("label.country", "الدولة")}>
              <Select value={form.country_code} onValueChange={handleCountryChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={ar("اختر الدولة", "Select country")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.data?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
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
                disabled={!form.country_code}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={ar("اختر المدينة", "Select city")} />
                </SelectTrigger>
                <SelectContent>
                  {cities.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
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
                  {filteredHotels.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>
                      {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                      {h.star_rating ? " " + "★".repeat(h.star_rating) : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <HotelRatesSelector
            hotelId={form.hotel_id}
            currency={form.currency}
            selectedItems={selectedItems}
            onChange={setSelectedItems}
          />
        </CardContent>
      </Card>



      {/* ── 4. Stay Dates ── */}
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

            {/* Nights badge */}
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

      {/* ── 5. Pricing & Payment ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Wallet}
            title={ar("التسعير والدفع", "Pricing & Payment")}
            subtitle={ar("سعر الغرفة وطريقة الدفع والمبلغ المدفوع", "Room rate, payment method and amount paid")}
          />
          <div className="grid gap-6 lg:grid-cols-2 mt-4">
            {/* Left: form fields */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Booking Source */}
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

                {/* Room rate */}
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
                      {form.currency}
                    </span>
                  </div>
                </FormField>

                {/* Total amount */}
                <FormField label={ar("المبلغ الإجمالي", "Total Amount")}>
                  <div className="relative">
                    <Input
                      className="h-9 pe-12"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={form.total_amount}
                      onChange={(e) => {
                        set("total_amount", e.target.value);
                        if (form.payment_mode === "full")
                          set("amount_paid", e.target.value);
                      }}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                      {form.currency}
                    </span>
                  </div>
                </FormField>
              </div>

              {/* Payment mode */}
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

              {/* Amount paid */}
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
                    {form.currency}
                  </span>
                </div>
                {remaining > 0 && totalAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {ar("المبلغ المتبقي: ", "Remaining: ")}
                    <span className="font-semibold text-destructive tabular-nums">
                      {new Intl.NumberFormat().format(remaining)} {form.currency}
                    </span>
                  </p>
                )}
              </FormField>

              {/* Second/Deferred Payment Date */}
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
            </div>

            {/* Right: Financial summary card */}
            <FinancialSummary
              roomRate={roomRate}
              nights={nights}
              rooms={form.rooms}
              totalAmount={totalAmount}
              amountPaid={amountPaid}
              currency={form.currency}
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
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending
            ? ar("جاري الحفظ...", "Saving...")
            : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
