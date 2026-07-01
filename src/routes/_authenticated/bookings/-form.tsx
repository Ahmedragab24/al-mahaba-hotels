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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User, Globe, CalendarDays, FileText,
  Wallet, CreditCard, Receipt, Plus, X, Check
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
  isQuotationConfirm,
}: {
  initial?: any;
  onSaved: (id: string) => void;
  isQuotationConfirm?: boolean;
}) {
  const { t, lang } = useI18n();
  const currencies = useCurrencies({ lang, per_page: 500 });
  const countries = useCountries({ lang, per_page: 500 });

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>(() => {
    if (initial?.items && Array.isArray(initial.items)) {
      return initial.items.map((item: any) => {
        const price = item.price_details || item.price || {};
        const roomNameEn = price.room?.name_en || "";
        const roomNameAr = price.room?.name_ar || "";
        const viewObj = price.hotel_view || price.hotelView || price.view;
        const viewNameEn = viewObj?.name_en || (typeof viewObj === "string" ? viewObj : "");
        const viewNameAr = viewObj?.name_ar || (typeof viewObj === "string" ? viewObj : "");
        const supplierNameEn = price.supplier?.name_en || (price.is_direct ? "Direct Hotel" : "Supplier");
        const supplierNameAr = price.supplier?.name_ar || (price.is_direct ? "فندق مباشر" : "مورد");

        return {
          rate_id: String(price.id || item.price_id || ""),
          room_type_id: String(price.room_type_id || price.room?.room_type_id || ""),
          view_id: price.hotel_view_id ? String(price.hotel_view_id) : null,
          meal_plan: price.meal_plan_type || "exclusive",
          selling_price: Number(item.night_price) || Number(price.selling_price) || 0,
          rooms: Number(item.room_count) || Number(item.rooms) || 1,
          supplier_id: price.supplier_id ? String(price.supplier_id) : null,
          is_direct: !!price.is_direct,
          room_name_en: roomNameEn,
          room_name_ar: roomNameAr,
          room_type_name_en: item.room_type?.name_en || price.room_type?.name_en || price.room?.room_type?.name_en || "",
          room_type_name_ar: item.room_type?.name_ar || price.room_type?.name_ar || price.room?.room_type?.name_ar || "",
          view_name_en: viewNameEn,
          view_name_ar: viewNameAr,
          supplier_name_en: supplierNameEn,
          supplier_name_ar: supplierNameAr,
          room: price.room,
          room_type: item.room_type || price.room_type || price.room?.room_type,
        };
      });
    }
    return [];
  });
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
    group_size: initial?.group_size ?? 1,

    check_in: initial?.check_in ? initial.check_in.slice(0, 10) : "",
    check_out: initial?.check_out ? initial.check_out.slice(0, 10) : "",

    is_direct: initial?.booking_type ? (initial.booking_type === "direct") : (initial?.is_direct ?? true),
    room_rate: (() => {
      if (initial?.room_rate) return String(initial.room_rate);
      if (initial?.quotation_id && initial?.total_amount && initial?.check_in && initial?.check_out) {
        const d1 = new Date(initial.check_in.slice(0, 10));
        const d2 = new Date(initial.check_out.slice(0, 10));
        const diff = d2.getTime() - d1.getTime();
        const n = Math.round(diff / 86400000);
        const initialNights = n > 0 ? n : 1;
        const rCount = Number(initial.rooms) || 1;
        return String(Number(initial.total_amount) / (rCount * initialNights));
      }
      return initial?.room_rate ?? "";
    })(),
    total_amount: initial?.total_amount ?? "",
    amount_paid: initial?.amount_paid ?? "",
    payment_mode: initial?.payment_method ?? "full",
    deferred_payment_due_date: (() => {
      const dStr = initial?.deferred_payment_due_date;
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

  const [installments, setInstallments] = useState<any[]>(() => {
    if (initial?.installments && Array.isArray(initial.installments)) {
      return initial.installments.map((i: any) => ({
        amount: i.amount || "",
        due_date: i.due_date || "",
        is_paid: !!i.is_paid,
        invoice_image: null,
      }));
    }
    return [{ amount: "", due_date: "", is_paid: false, invoice_image: null }];
  });

  const addInstallment = () => setInstallments([...installments, { amount: "", due_date: "", is_paid: false, invoice_image: null }]);
  const updateInstallment = (idx: number, key: string, val: any) => {
    const newInst = [...installments];
    newInst[idx][key] = val;
    setInstallments(newInst);
  };
  const removeInstallment = (idx: number) => setInstallments(installments.filter((_, i) => i !== idx));

  const isQuotationMode = isQuotationConfirm || !!initial?.quotation_id;

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
        group_size: initial.group_size ?? f.group_size,
        check_in: initial.check_in ? initial.check_in.slice(0, 10) : f.check_in,
        check_out: initial.check_out ? initial.check_out.slice(0, 10) : f.check_out,
        is_direct: initial.booking_type ? (initial.booking_type === "direct") : (initial.is_direct ?? f.is_direct),
        room_rate: (() => {
          if (initial.room_rate) return String(initial.room_rate);
          if (initial.quotation_id && initial.total_amount && initial.check_in && initial.check_out) {
            const d1 = new Date(initial.check_in.slice(0, 10));
            const d2 = new Date(initial.check_out.slice(0, 10));
            const diff = d2.getTime() - d1.getTime();
            const n = Math.round(diff / 86400000);
            const initialNights = n > 0 ? n : 1;
            const rCount = Number(initial.rooms) || 1;
            return String(Number(initial.total_amount) / (rCount * initialNights));
          }
          return f.room_rate;
        })(),
        total_amount: initial.total_amount ?? f.total_amount,
        amount_paid: initial.amount_paid ?? f.amount_paid,
        payment_mode: initial.payment_method ?? f.payment_mode,
        deferred_payment_due_date: (() => {
          const dStr = initial.deferred_payment_due_date;
          if (!dStr) return f.deferred_payment_due_date;
          try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
            const d = new Date(dStr);
            return isNaN(d.getTime()) ? f.deferred_payment_due_date : d.toISOString().slice(0, 10);
          } catch {
            return f.deferred_payment_due_date;
          }
        })(),
        special_requests: initial.special_requests ?? f.special_requests,
        notes: initial.notes ?? f.notes,
      }));

      if (initial.items && Array.isArray(initial.items)) {
        setSelectedItems(
          initial.items.map((item: any) => {
            const price = item.price_details || item.price || {};
            const roomNameEn = price.room?.name_en || "";
            const roomNameAr = price.room?.name_ar || "";
            const viewObj = price.hotel_view || price.hotelView || price.view;
            const viewNameEn = viewObj?.name_en || (typeof viewObj === "string" ? viewObj : "");
            const viewNameAr = viewObj?.name_ar || (typeof viewObj === "string" ? viewObj : "");
            const supplierNameEn = price.supplier?.name_en || (price.is_direct ? "Direct Hotel" : "Supplier");
            const supplierNameAr = price.supplier?.name_ar || (price.is_direct ? "فندق مباشر" : "مورد");

            return {
              rate_id: String(price.id || item.price_id || ""),
              room_type_id: String(price.room_type_id || price.room?.room_type_id || ""),
              view_id: price.hotel_view_id ? String(price.hotel_view_id) : null,
              meal_plan: price.meal_plan_type || "exclusive",
              selling_price: Number(item.night_price) || Number(price.selling_price) || 0,
              rooms: Number(item.room_count) || Number(item.rooms) || 1,
              supplier_id: price.supplier_id ? String(price.supplier_id) : null,
              is_direct: !!price.is_direct,
              room_name_en: roomNameEn,
              room_name_ar: roomNameAr,
              view_name_en: viewNameEn,
              view_name_ar: viewNameAr,
              supplier_name_en: supplierNameEn,
              supplier_name_ar: supplierNameAr,
            };
          })
        );
      }
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
    const startStr = form.check_in.split(/[ T]/)[0];
    const endStr = form.check_out.split(/[ T]/)[0];
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diff = end.getTime() - start.getTime();
      const diffDays = Math.round(diff / 86400000);
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
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

      setForm((f) => {
        const nextTotal = autoTotal > 0 ? String(autoTotal) : f.total_amount;
        if (f.total_amount === nextTotal && f.room_rate === String(roomTotalRate / (totalRoomsCount || 1))) return f;
        return {
          ...f,
          rooms: totalRoomsCount,
          room_rate: String(roomTotalRate / (totalRoomsCount || 1)),
          total_amount: nextTotal,
          amount_paid: f.payment_mode === "full" ? nextTotal : f.amount_paid,
        };
      });
    } else if (isQuotationMode && nights > 0) {
      setForm((f) => {
        const rate = Number(f.room_rate) || 0;
        const rCount = Number(f.rooms) || 1;
        const autoTotal = rate * rCount * nights;
        if (autoTotal <= 0) return f;

        const nextTotal = String(autoTotal);
        if (f.total_amount === nextTotal) return f;

        return {
          ...f,
          total_amount: nextTotal,
          amount_paid: f.payment_mode === "full" ? nextTotal : f.amount_paid,
        };
      });
    }
  }, [selectedItems, nights, isQuotationMode, form.room_rate]);

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
      let paidAmt = 0;
      if (form.payment_mode === "full") {
        paidAmt = Number(form.total_amount) || 0;
      } else if (form.payment_mode === "deferred") {
        paidAmt = 0;
      } else if (form.payment_mode === "partial") {
        paidAmt = installments.reduce((sum, inst) => sum + (inst.is_paid ? (Number(inst.amount) || 0) : 0), 0);
      }

      let payload: any = {
        booking_type: isQuotationMode ? "quotation" : "direct",
        booking_date: form.booking_date,
        payment_method: form.payment_mode,
        paid_amount: paidAmt,
        status: initial?.status ?? "confirmed",
      };

      if (isQuotationMode) {
        payload.quotation_id = Number(initial.quotation_id);
        payload.check_in = form.check_in;
        payload.check_out = form.check_out;
        payload.total_amount = Number(form.total_amount);
        payload.room_rate = Number(form.room_rate);
        payload.rooms = Number(form.rooms);
      } else {
        payload.booking_source = form.is_direct ? "hotel" : "supplier";
        payload.customer_id = Number(form.customer_id);
        payload.currency_id = Number(form.currency_id);
        payload.country_id = Number(form.country_id);
        payload.city_id = Number(form.city_id);
        payload.hotel_id = Number(form.hotel_id);
        payload.group_size = Number(form.group_size) || 1;
        payload.check_in = form.check_in;
        payload.check_out = form.check_out;
        payload.special_requests = form.special_requests || "";
        payload.notes = form.notes || "";
        payload.items = selectedItems.map((item) => ({
          price_id: Number(item.rate_id),
          room_count: Number(item.rooms) || 1,
        }));
      }

      if (form.payment_mode === "deferred") {
        payload.deferred_payment_due_date = form.deferred_payment_due_date;
      } else if (form.payment_mode === "partial") {
        payload.installments = installments.map(i => ({
          amount: Number(i.amount) || 0,
          due_date: i.due_date,
          is_paid: Boolean(i.is_paid),
          invoice_image: null,
        }));
      }

      const hasFiles = invoiceImage ||
        (form.payment_mode === "partial" && installments.some(i => i.invoice_image));

      let finalBody: any;
      if (hasFiles) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val === null || val === undefined) {
            // skip
          } else if (key === "items" && Array.isArray(val)) {
            val.forEach((item: any, idx: number) => {
              formData.append(`items[${idx}][price_id]`, String(item.price_id));
              formData.append(`items[${idx}][room_count]`, String(item.room_count));
            });
          } else if (key === "installments" && Array.isArray(val)) {
            val.forEach((inst: any, idx: number) => {
              formData.append(`installments[${idx}][amount]`, String(inst.amount));
              formData.append(`installments[${idx}][due_date]`, String(inst.due_date));
              formData.append(`installments[${idx}][is_paid]`, inst.is_paid ? "true" : "false");
              if (installments[idx].invoice_image) {
                formData.append(`installments[${idx}][invoice_image]`, installments[idx].invoice_image);
              }
            });
          } else {
            formData.append(key, String(val));
          }
        });
        if (invoiceImage) {
          formData.append("invoice_image", invoiceImage);
        }
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
      {!isQuotationMode && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-5">
            <SectionHeader
              icon={User}
              title={ar("بيانات العميل", "Customer Details")}
              subtitle={ar("المعلومات الأساسية للحجز", "Basic booking information")}
            />
            <div className="grid gap-4 md:grid-cols-4 mt-4">
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
                {form.customer_id && (() => {
                  const selCust = customerList.find((c: any) => String(c.id) === String(form.customer_id));
                  if (selCust?.country) {
                    return (
                      <div className="text-sm text-end text-muted-foreground mt-1">
                        ( {lang === "ar" ? selCust.country.name_ar : selCust.country.name_en} )
                      </div>
                    );
                  }
                  return null;
                })()}
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

              <FormField label={ar("عدد الأشخاص", "Number of Persons")} required>
                <Input
                  className="h-9"
                  type="number"
                  min={1}
                  value={form.group_size}
                  onChange={(e) => set("group_size", Number(e.target.value) || 1)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}


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
              nights={nights}
              groupSize={form.group_size}
            />
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
                <FormField label={ar("المبلغ الإجمالي", "Total Amount")}>
                  <div className="relative">
                    <Input
                      className="h-9 pe-12 bg-muted"
                      type="number"
                      value={form.total_amount}
                      readOnly
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                      {currencyCode}
                    </span>
                  </div>
                </FormField>

                <div className="flex flex-col justify-end">
                  <div
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 h-9 ${nights > 0
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

              {!isQuotationMode && (
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
                      readOnly
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
              )}

              {form.payment_mode === "deferred" && (
                <FormField label={ar("تاريخ الدفعة المؤجلة", "Deferred Payment Date")}>
                  <Input
                    className="h-9"
                    type="date"
                    value={form.deferred_payment_due_date}
                    onChange={(e) => set("deferred_payment_due_date", e.target.value)}
                  />
                </FormField>
              )}

              {form.payment_mode === "partial" && (
                <div className="col-span-full space-y-4 border-t pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">{ar("الأقساط / الدفعات", "Installments")}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addInstallment}>
                      <Plus className="w-4 h-4 me-1" />
                      {ar("إضافة تاريخ سداد", "Add Payment Date")}
                    </Button>
                  </div>
                  {installments.map((inst, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-3 border rounded-lg bg-muted/20">
                      <FormField label={ar("تاريخ السداد", "Due Date")}>
                        <Input type="date" className="h-9" value={inst.due_date} onChange={(e) => updateInstallment(idx, "due_date", e.target.value)} />
                      </FormField>
                      <FormField label={ar("المبلغ", "Amount")}>
                        <Input type="number" className="h-9" value={inst.amount} onChange={(e) => updateInstallment(idx, "amount", e.target.value)} />
                      </FormField>
                      <div className="flex items-center gap-4 pb-2 sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox checked={inst.is_paid} onCheckedChange={(c) => updateInstallment(idx, "is_paid", !!c)} />
                          {ar("تم الدفع", "Paid")}
                        </label>
                      </div>
                      {inst.is_paid && (
                        <div className="sm:col-span-2 flex items-center justify-between gap-2">
                          <Input type="file" accept="image/*,application/pdf" className="text-xs h-9" onChange={(e) => {
                            const file = e.target.files?.[0];
                            updateInstallment(idx, "invoice_image", file || null);
                          }} />
                        </div>
                      )}
                      {installments.length > 1 && (
                        <div className="sm:col-span-2 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeInstallment(idx)}>
                            <X className="w-4 h-4 me-1" />
                            {ar("إزالة", "Remove")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {form.payment_mode === "full" && isQuotationMode && (
                <div className="col-span-full mt-2 p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-800 dark:text-emerald-300">
                        {ar("سيتم سداد المبلغ كاملاً", "Full amount will be paid")}
                      </p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                        {ar("دفعة واحدة عند التأكيد", "One time payment on confirmation")}
                      </p>
                    </div>
                  </div>
                  <div className="text-start sm:text-end shrink-0">
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">{ar("المبلغ الإجمالي", "Total Amount")}</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {new Intl.NumberFormat().format(Number(form.total_amount) || 0)} {currencyCode}
                    </p>
                  </div>
                </div>
              )}

              {form.payment_mode === "full" && (
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
              )}
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
      {!isQuotationMode && (
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
      )}

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
