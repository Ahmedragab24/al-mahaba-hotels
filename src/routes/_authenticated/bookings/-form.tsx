import { useState, useMemo, useEffect } from "react";
import { SelectedRate } from "@/components/quotation-rates-dialog";
import { HotelRatesSelector } from "@/components/hotel-rates-selector";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Globe,
  CalendarDays,
  FileText,
  Wallet,
  CreditCard,
  Receipt,
  Plus,
  X,
  Check,
  Building2,
  MapPin,
} from "lucide-react";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useGetCustomersQuery,
  useGetHotelsQuery,
  useGetCurrenciesQuery,
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetRoomTypesQuery,
} from "@/store/api";

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
  isQuotationMode = false,
  selectedItems = [],
  getItemTotal = (item: any) => 0,
}: {
  roomRate: number;
  nights: number;
  rooms: number;
  totalAmount: number;
  amountPaid: number;
  currency: string;
  lang: string;
  isQuotationMode?: boolean;
  selectedItems?: any[];
  getItemTotal?: (item: any) => number;
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
          {selectedItems && selectedItems.length > 0 ? (
            selectedItems.map((item: any, idx: number) => {
              const sDate = item.check_in || item.start_date;
              const eDate = item.check_out || item.end_date;
              let itemNights = nights || 1;
              if (sDate && eDate) {
                const startDate = new Date(sDate.split(/[ T]/)[0]);
                const endDate = new Date(eDate.split(/[ T]/)[0]);
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                  const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
                  if (diff > 0) itemNights = diff;
                }
              }
              const itemTotal = getItemTotal(item);
              const roomName = lang === "ar"
                ? item.room_name_ar || item.room_type_name_ar || "غرفة"
                : item.room_name_en || item.room_type_name_en || "Room";
              return (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-border/20 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground text-xs">
                    {lang === "ar"
                      ? `${roomName} (${fmt(item.selling_price || 0)} ${currency}) × ${itemNights} ليلة × ${item.rooms || 1} غرفة`
                      : `${roomName} (${fmt(item.selling_price || 0)} ${currency}) × ${itemNights} nights × ${item.rooms || 1} room${(item.rooms || 1) > 1 ? "s" : ""}`}
                  </span>
                  <span className="font-semibold tabular-nums text-xs text-foreground">
                    {fmt(itemTotal)} {currency}
                  </span>
                </div>
              );
            })
          ) : (
            roomRate > 0 && nights > 0 && (
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
            )
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

const mapInitialItemsToSelectedRates = (items: any[], initial: any) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item: any) => {
    const price = item.price_details || item.price || {};
    const roomObj = price.room || item.room || {};
    // Room name fallback: price.room -> item.room -> price.room.name
    const roomNameEn = price.room?.name_en || price.room?.name || item.room?.name_en || item.room?.name || "";
    const roomNameAr = price.room?.name_ar || price.room?.name || item.room?.name_ar || item.room?.name || "";
    // View Obj
    const viewObj = price.hotel_view || price.hotelView || price.view || item.view || item.hotel_view;
    const viewNameEn = viewObj?.name_en || (typeof viewObj === "string" ? viewObj : "") || item.view_name_en || "";
    const viewNameAr = viewObj?.name_ar || (typeof viewObj === "string" ? viewObj : "") || item.view_name_ar || "";
    // Supplier
    const supplierNameEn = price.supplier?.name_en || item.supplier?.name_en || (price.is_direct || item.is_direct ? "Direct Hotel" : "Supplier");
    const supplierNameAr = price.supplier?.name_ar || item.supplier?.name_ar || (price.is_direct || item.is_direct ? "فندق مباشر" : "مورد");

    // Use parent stay dates as a fallback for direct booking items
    const itemCheckIn = item.start_date || item.check_in || initial?.check_in || "";
    const itemCheckOut = item.end_date || item.check_out || initial?.check_out || "";

    return {
      rate_id: String(price.id || item.price_id || ""),
      room_type_id: String(item.room_type_id || price.room_type_id || price.room?.room_type_id || roomObj.room_type_id || ""),
      is_saved: true, // Mark as saved so that we use server computed values directly
      view_id: price.hotel_view_id || item.hotel_view_id ? String(price.hotel_view_id || item.hotel_view_id) : null,
      meal_plan: price.meal_plan_type || item.meal_plan || "exclusive",
      meal_plan_type: price.meal_plan_type || item.meal_plan,
      meal_plan_details: price.meal_plan_details || item.meal_plan_details,
      is_weekend_weekday: price.is_weekend_weekday || false,
      weekend_selling_price: price.weekend_selling_price,
      weekend_days: price.weekend_days,
      days: price.days,
      // Set base supplier price (e.g. 200). Fallback to hotel_total or night_price (reversing margin & tax) if empty
      selling_price: Number(price.selling_price) || Number(item.hotel_total) ||
        (item.night_price ? Number(item.night_price) / (1 + (item.profit_margin || 5) / 100 * 1.15) : 0),
      rooms: Number(item.room_count) || Number(item.rooms) || 1,
      supplier_id: price.supplier_id ? String(price.supplier_id) : null,
      is_direct: !!price.is_direct,
      room_name_en: roomNameEn,
      room_name_ar: roomNameAr,
      room_type_name_en:
        item.room_type?.name_en ||
        price.room_type?.name_en ||
        price.room?.room_type?.name_en ||
        price.room?.name_en ||
        price.room?.name ||
        roomObj.room_type?.name_en ||
        "",
      room_type_name_ar:
        item.room_type?.name_ar ||
        price.room_type?.name_ar ||
        price.room?.room_type?.name_ar ||
        price.room?.name_ar ||
        price.room?.name ||
        roomObj.room_type?.name_ar ||
        "",
      view_name_en: viewNameEn,
      view_name_ar: viewNameAr,
      supplier_name_en: supplierNameEn,
      supplier_name_ar: supplierNameAr,
      room: price.room || item.room || roomObj,
      room_type: item.room_type || price.room_type || price.room?.room_type || item.room?.room_type || roomObj.room_type,
      start_date: itemCheckIn,
      end_date: itemCheckOut,
      check_in: itemCheckIn,
      check_out: itemCheckOut,
      hotel_id: String(item.hotel_id || price.hotel_id || ""),
      quotation_item_id: item.id,
      profit_margin: item.profit_margin !== undefined ? item.profit_margin : 5,
      night_price: item.night_price || null,
      subtotal: item.subtotal || null,
    };
  });
};

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
  // Auto-refresh all lists every 2 seconds for real-time data
  const currencies = useGetCurrenciesQuery({ lang, all: 1 }, { pollingInterval: 2000 });
  const countries = useGetCountriesQuery({ lang, all: 1 }, { pollingInterval: 2000 });

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>(() => {
    return mapInitialItemsToSelectedRates(initial?.items, initial);
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

    is_direct: initial?.booking_type
      ? initial.booking_type === "direct"
      : (initial?.is_direct ?? true),
    room_rate: (() => {
      if (initial?.items?.[0]) {
        const firstItem = initial.items[0];
        const price = firstItem.price_details || firstItem.price || {};
        const cost = price.selling_price || firstItem.hotel_total;
        if (cost) return String(cost);
      }
      if (initial?.room_rate) return String(initial.room_rate);
      if (
        initial?.quotation_id &&
        initial?.total_amount &&
        initial?.check_in &&
        initial?.check_out
      ) {
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
    amount_paid: initial?.paid_amount ?? initial?.amount_paid ?? "",
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
    status: initial?.status ?? "pending",
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

  const addInstallment = () =>
    setInstallments([
      ...installments,
      { amount: "", due_date: "", is_paid: false, invoice_image: null },
    ]);
  const updateInstallment = (idx: number, key: string, val: any) => {
    const newInst = [...installments];
    newInst[idx][key] = val;
    setInstallments(newInst);
  };
  const removeInstallment = (idx: number) => {
    setInstallments(installments.filter((_, i) => i !== idx));
  };
  // State for number of installments
  const [numInstallments, setNumInstallments] = useState(1);

  const distributeInstallments = (count: number, remaining: number) => {
    if (count <= 0) return [];
    const safeRemaining = Math.max(0, remaining);
    const amountPerInstallment = safeRemaining > 0 ? (safeRemaining / count).toFixed(2) : "0.00";
    const result = Array.from({ length: count }, (_, idx) => ({
      amount:
        idx === count - 1
          ? (safeRemaining - parseFloat(amountPerInstallment) * (count - 1)).toFixed(2)
          : amountPerInstallment,
      due_date: "",
      is_paid: false,
      invoice_image: null,
    }));
    return result;
  };

  const isQuotationMode = isQuotationConfirm || !!initial?.quotation_id;

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const isSaving = isCreating || isUpdating;

  const initialId = initial?.id || initial?.quotation_id;
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
        is_direct: initial.booking_type
          ? initial.booking_type === "direct"
          : (initial.is_direct ?? f.is_direct),
        room_rate: (() => {
          if (initial.items?.[0]) {
            const firstItem = initial.items[0];
            const price = firstItem.price_details || firstItem.price || {};
            const cost = price.selling_price || firstItem.hotel_total;
            if (cost) return String(cost);
          }
          if (initial.room_rate) return String(initial.room_rate);
          if (
            initial.quotation_id &&
            initial.total_amount &&
            initial.check_in &&
            initial.check_out
          ) {
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
        amount_paid: initial.paid_amount ?? initial.amount_paid ?? f.amount_paid,
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
        status: initial.status ?? f.status,
      }));

      if (initial.items && Array.isArray(initial.items)) {
        setSelectedItems(mapInitialItemsToSelectedRates(initial.items, initial));
      }
    }
  }, [initialId]);

  const currencyList = useMemo(() => {
    const data = currencies.data as any;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Handle { data: { data: [...] } } format
    if (data.data && Array.isArray(data.data)) return data.data;
    // Handle { data: [...] } format
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [currencies.data]);

  const currencyCode = useMemo(() => {
    if (!form.currency_id) return "SAR";
    const found = currencyList.find((c: any) => String(c.id) === String(form.currency_id));
    return found?.code || "SAR";
  }, [form.currency_id, currencyList]);

  const countryList = useMemo(() => {
    const data = countries.data as any;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Handle { data: { data: [...] } } format
    if (data.data && Array.isArray(data.data)) return data.data;
    // Handle { data: [...] } format
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [countries.data]);

  const cities = useGetCitiesQuery(form.country_id ? { country_id: form.country_id } : undefined, {
    pollingInterval: 2000,
  });

  const cityList = useMemo(() => {
    const data = cities.data as any;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Handle { data: { data: [...] } } format
    if (data.data && Array.isArray(data.data)) return data.data;
    // Handle { data: [...] } format
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [cities.data]);

  const customersQuery = useGetCustomersQuery({ all: true }, { pollingInterval: 2000 });

  const customerList = useMemo(() => {
    const d = customersQuery.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray((d as any).data)) return (d as any).data;
    return [];
  }, [customersQuery.data]);

  const roomTypesQuery = useGetRoomTypesQuery({ all: true }, { pollingInterval: 2000 });

  const roomTypesList = useMemo(() => {
    const d = roomTypesQuery.data as any;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (d.data && Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.data)) return d.data;
    return [];
  }, [roomTypesQuery.data]);

  const hotelsQuery = useGetHotelsQuery(
    {
      per_page: 1000,
      lang,
      country_id: isQuotationMode ? undefined : (form.country_id || undefined),
      city_id: isQuotationMode ? undefined : (form.city_id || undefined),
    },
    { pollingInterval: 2000 },
  );

  const hotelList = useMemo(() => {
    const d = hotelsQuery.data as any;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    // Handle { data: { data: [...] } } format
    if (d?.data && Array.isArray(d.data)) return d.data;
    // Handle { data: [...] } format
    if (Array.isArray(d?.data)) return d.data;
    return [];
  }, [hotelsQuery.data]);

  const filteredHotels = useMemo(() => {
    let list = hotelList;
    if (form.country_id)
      list = list.filter((h: any) => String(h.country_id) === String(form.country_id));
    if (form.city_id) list = list.filter((h: any) => String(h.city_id) === String(form.city_id));
    return list;
  }, [hotelList, form.country_id, form.city_id]);

  const uniqueSelectedHotels = useMemo(() => {
    const list: any[] = [];
    const seen = new Set<string>();
    selectedItems.forEach((item) => {
      if (item.hotel_id && !seen.has(String(item.hotel_id))) {
        seen.add(String(item.hotel_id));
        const found = hotelList.find((h: any) => String(h.id) === String(item.hotel_id));
        if (found) {
          list.push(found);
        }
      }
    });
    return list;
  }, [selectedItems, hotelList]);

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

  // Auto-generate installments when numInstallments or amount_paid changes
  useEffect(() => {
    if (form.payment_mode === "partial" && numInstallments > 0 && totalAmount > 0) {
      const amountPaidNum = Number(form.amount_paid) || 0;
      const remaining = Math.max(0, totalAmount - amountPaidNum);

      // Check if this is a user-initiated change (not restoration of initial data)
      const existingPayments = installments.filter((i) => i.amount);
      // Only auto-distribute if installments are empty or count has changed
      if (existingPayments.length === 0 || installments.length !== numInstallments) {
        setInstallments(distributeInstallments(numInstallments, remaining));
      }
    }
  }, [numInstallments, form.payment_mode, form.amount_paid, totalAmount]);

  const calculateItemNights = (start?: string, end?: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start.split(/[ T]/)[0]);
    const endDate = new Date(end.split(/[ T]/)[0]);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const getItemTotal = (item: any) => {
    const rCount = item.rooms || 1;
    const sDate = item.check_in || item.start_date || form.check_in;
    const eDate = item.check_out || item.end_date || form.check_out;
    const itemNights = calculateItemNights(sDate, eDate) || nights || 1;

    if (isQuotationMode) {
      return (item.selling_price || 0) * rCount * itemNights;
    }

    const margin = item.profit_margin !== undefined ? item.profit_margin : 5;

    const getClientNightPrice = (base: number) => {
      const marginAmt = base * (margin / 100);
      const taxAmt = marginAmt * 0.15;
      return base + marginAmt + taxAmt;
    };

    // If it has weekend/weekday rates
    if (item.is_weekend_weekday && sDate && eDate) {
      const startDate = new Date(sDate.split(/[ T]/)[0]);
      const endDate = new Date(eDate.split(/[ T]/)[0]);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate) {
        let totalSum = 0;
        const currentDate = new Date(startDate);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekendDays = item.weekend_days || ["Friday", "Saturday"];
        const weekendPrice = item.weekend_selling_price !== null && item.weekend_selling_price !== undefined
          ? item.weekend_selling_price
          : item.selling_price;
        const weekdayPrice = item.selling_price || 0;

        while (currentDate < endDate) {
          const dayOfWeek = dayNames[currentDate.getDay()];
          const basePrice = weekendDays.includes(dayOfWeek) ? weekendPrice : weekdayPrice;
          totalSum += getClientNightPrice(Number(basePrice));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return totalSum * rCount;
      }
    }

    return getClientNightPrice(item.selling_price || 0) * rCount * itemNights;
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      const totalRoomsCount = selectedItems.reduce((sum, item) => sum + (item.rooms || 0), 0);
      const roomTotalRate = selectedItems.reduce(
        (sum, item) => sum + (Number(item.selling_price) || 0) * (item.rooms || 1),
        0,
      );
      const autoTotalRaw = selectedItems.reduce((sum, item) => sum + getItemTotal(item), 0);
      const autoTotal = Number(autoTotalRaw.toFixed(2));

      setForm((f) => {
        const nextTotal = autoTotal > 0 ? String(autoTotal) : f.total_amount;
        if (
          f.total_amount === nextTotal &&
          f.room_rate === String(roomTotalRate / (totalRoomsCount || 1))
        )
          return f;
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
        const autoTotal = Number((rate * rCount * nights).toFixed(2));
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
  }, [selectedItems, nights, isQuotationMode]);

  // Auto-update amount_paid based on payment mode and installments
  useEffect(() => {
    setForm((f) => {
      if (f.payment_mode === "full") {
        // Full payment: amount_paid should be total_amount
        if (f.amount_paid !== f.total_amount) {
          return { ...f, amount_paid: f.total_amount };
        }
      } else if (f.payment_mode === "deferred") {
        // Deferred payment: amount_paid should be 0
        if (f.amount_paid !== "0") {
          return { ...f, amount_paid: "0" };
        }
      } else if (f.payment_mode === "partial") {
        // Partial payment: amount_paid should be sum of paid installments
        const paidSum = installments.reduce(
          (sum, inst) => sum + (inst.is_paid ? Number(inst.amount) || 0 : 0),
          0,
        );
        const paidSumStr = String(paidSum);
        if (f.amount_paid !== paidSumStr) {
          return { ...f, amount_paid: paidSumStr };
        }
      }
      return f;
    });
  }, [form.payment_mode, form.total_amount, installments]);

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
      if (selectedItems.length === 0) {
        toast.error(ar("يجب اختيار بند سعر واحد على الأقل", "At least one rate item must be selected") + " *");
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
        paidAmt = installments.reduce(
          (sum, inst) => sum + (inst.is_paid ? Number(inst.amount) || 0 : 0),
          0,
        );
      }

      let checkInDate = form.check_in;
      let checkOutDate = form.check_out;

      if (!isQuotationMode && selectedItems.length > 0) {
        const startDates = selectedItems.map(item => item.start_date || item.check_in).filter(Boolean);
        const endDates = selectedItems.map(item => item.end_date || item.check_out).filter(Boolean);
        if (startDates.length > 0) {
          checkInDate = startDates.sort()[0];
        }
        if (endDates.length > 0) {
          checkOutDate = endDates.sort().reverse()[0];
        }
      }

      let payload: any = {
        booking_type: isQuotationMode ? "quotation" : "direct",
        booking_date: form.booking_date,
        payment_method: form.payment_mode,
        status: form.status,
      };

      if (isQuotationMode) {
        payload.quotation_id = Number(initial.quotation_id || initial.id);
        payload.quotation_items = selectedItems.map((item) => Number(item.quotation_item_id)).filter(Boolean);
      } else {
        payload.booking_source = form.is_direct ? "hotel" : "supplier";
        payload.customer_id = Number(form.customer_id);
        payload.currency_id = Number(form.currency_id);
        payload.country_id = Number(form.country_id);
        payload.city_id = Number(form.city_id);
        payload.hotel_id = Number(form.hotel_id);
        payload.check_in = checkInDate;
        payload.check_out = checkOutDate;
        payload.special_requests = form.special_requests || "";
        payload.notes = form.notes || "";
        payload.items = selectedItems.map((item) => ({
          price_id: Number(item.rate_id),
          room_count: Number(item.rooms) || 1,
          profit_margin: Number(item.profit_margin !== undefined ? item.profit_margin : 5),
        }));
      }

      if (form.payment_mode === "deferred") {
        payload.deferred_payment_due_date = form.deferred_payment_due_date;
      } else if (form.payment_mode === "partial") {
        payload.installments = installments.map((i) => ({
          amount: Number(i.amount) || 0,
          due_date: i.due_date,
          is_paid: Boolean(i.is_paid),
          invoice_image: null,
        }));
      }

      const hasFiles =
        invoiceImage ||
        (form.payment_mode === "partial" && installments.some((i) => i.invoice_image));

      let finalBody: any;
      if (hasFiles) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val === null || val === undefined) {
            // skip
          } else if (key === "items" && Array.isArray(val)) {
            val.forEach((item: any, idx: number) => {
              formData.append(`items[${idx}][hotel_id]`, String(item.hotel_id));
              formData.append(`items[${idx}][price_id]`, String(item.price_id));
              formData.append(`items[${idx}][room_count]`, String(item.room_count));
              formData.append(`items[${idx}][start_date]`, String(item.start_date));
              formData.append(`items[${idx}][end_date]`, String(item.end_date));
              formData.append(`items[${idx}][profit_margin]`, String(item.profit_margin));
            });
          } else if (key === "quotation_items" && Array.isArray(val)) {
            val.forEach((id: any, idx: number) => {
              formData.append(`quotation_items[${idx}]`, String(id));
            });
          } else if (key === "installments" && Array.isArray(val)) {
            val.forEach((inst: any, idx: number) => {
              formData.append(`installments[${idx}][amount]`, String(inst.amount));
              formData.append(`installments[${idx}][due_date]`, String(inst.due_date));
              formData.append(`installments[${idx}][is_paid]`, inst.is_paid ? "true" : "false");
              if (installments[idx].invoice_image) {
                formData.append(
                  `installments[${idx}][invoice_image]`,
                  installments[idx].invoice_image,
                );
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
                    const selectedCust = customerList.find(
                      (c: any) => String(c.id) === String(val),
                    );
                    if (selectedCust?.country_id) {
                      setForm((f) => ({
                        ...f,
                        customer_id: val,
                        country_id: String(selectedCust.country_id),
                        city_id: "",
                        hotel_id: "",
                        room_type_id: "",
                        currency_id: selectedCust.currency_id
                          ? String(selectedCust.currency_id)
                          : f.currency_id,
                      }));
                    } else {
                      setForm((f) => ({
                        ...f,
                        customer_id: val,
                        currency_id: selectedCust?.currency_id
                          ? String(selectedCust.currency_id)
                          : f.currency_id,
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
                        {lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar} —{" "}
                        {t(`ctype.${c.type || c.customer_type || "individual"}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.customer_id &&
                  (() => {
                    const selCust = customerList.find(
                      (c: any) => String(c.id) === String(form.customer_id),
                    );
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
      {/* <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={CalendarDays}
            title={ar("تواريخ الإقامة", "Stay Dates")}
            subtitle={ar("تاريخ الوصول والمغادرة", "Check-in and check-out dates")}
          />
          <div className={`grid gap-4 md:grid-cols-3 mt-4 ${isQuotationMode && "items-center"}`}>
            <FormField label={ar("تاريخ الوصول (Check-in)", "Check-in Date")} required>
              <Input
                className={`h-9 ${isQuotationMode ? "bg-muted cursor-not-allowed" : ""}`}
                type="date"
                value={form.check_in}
                onChange={(e) => set("check_in", e.target.value)}
                readOnly={isQuotationMode}
                disabled={isQuotationMode}
              />
              {isQuotationMode && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {ar(
                    "يتم جلب التاريخ من عرض السعر تلقائياً",
                    "Date is fetched from the quotation automatically",
                  )}
                </p>
              )}
            </FormField>

            <FormField label={ar("تاريخ المغادرة (Check-out)", "Check-out Date")} required>
              <Input
                className={`h-9 ${isQuotationMode ? "bg-muted cursor-not-allowed" : ""}`}
                type="date"
                value={form.check_out}
                min={form.check_in || undefined}
                onChange={(e) => set("check_out", e.target.value)}
                readOnly={isQuotationMode}
                disabled={isQuotationMode}
              />
              {isQuotationMode && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {ar(
                    "يتم جلب التاريخ من عرض السعر تلقائياً",
                    "Date is fetched from the quotation automatically",
                  )}
                </p>
              )}
            </FormField>

            <div className="flex flex-col justify-end">
              <div
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 ${
                  nights > 0
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
      </Card> */}

      {/* ── 2. Location & Hotel ── */}
      {(true) && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-5">
            <SectionHeader
              icon={Globe}
              title={ar("الوجهة والفندق", "Destination & Hotel")}
              subtitle={ar("اختر الدولة والمدينة والفندق", "Select country, city and hotel")}
            />
            {isQuotationMode ? (
              <div className="mt-4 bg-slate-50/50 dark:bg-slate-800/10 rounded-xl p-4 border border-border/40">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {ar("الفنادق المحددة في هذا الحجز", "Hotels selected in this booking")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {uniqueSelectedHotels.map((h: any) => {
                    const hName = lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar;
                    const cName = h.city ? (lang === "ar" ? h.city.name_ar || h.city.name_en : h.city.name_en || h.city.name_ar) : "";
                    const coName = h.country ? (lang === "ar" ? h.country.name_ar || h.country.name_en : h.country.name_en || h.country.name_ar) : "";
                    return (
                      <div key={h.id} className="bg-card border rounded-lg p-3 flex items-start gap-3 shadow-xs">
                        <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {hName}
                            {(h.star_rating || h.stars) ? (
                              <span className="text-amber-500 ms-1.5 text-xs">
                                {"★".repeat(h.star_rating || h.stars)}
                              </span>
                            ) : null}
                          </div>
                          {(cName || coName) && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {cName}{cName && coName && ", "}{coName}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <FormField label={t("label.country", "الدولة")}>
                  <Select value={form.country_id} onValueChange={handleCountryChange} disabled={isQuotationMode}>
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
                    disabled={isQuotationMode || !form.country_id}
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
                    disabled={isQuotationMode || !form.city_id}
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
                            {lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar}
                            {h.star_rating || h.stars
                              ? " " + "★".repeat(h.star_rating || h.stars)
                              : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}

            <HotelRatesSelector
              hotelId={form.hotel_id || "quotation-hotel"}
              currencyId={form.currency_id}
              currencyCode={currencyCode}
              selectedItems={selectedItems}
              onChange={setSelectedItems}
              nights={nights}
              groupSize={form.group_size}
              checkIn={form.check_in}
              checkOut={form.check_out}
              readOnly={isQuotationMode}
              hotels={hotelList}
              roomTypes={roomTypesList}
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
            subtitle={ar(
              "سعر الغرفة وطريقة الدفع والمبلغ المدفوع",
              "Room rate, payment method and amount paid",
            )}
          />
          <div className="grid gap-6 lg:grid-cols-2 mt-4">
            <div className="space-y-4">
              <div className="grid gap-4">
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

              {!isQuotationMode && form.payment_mode !== "partial" && (
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
                      readOnly={form.payment_mode === "full"}
                      onChange={(e) => set("amount_paid", e.target.value)}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                      {currencyCode}
                    </span>
                  </div>
                  {form.payment_mode === "full" && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {ar("يتم سداد المبلغ كاملاً", "Full amount will be paid")}
                    </p>
                  )}
                  {remaining > 0 && totalAmount > 0 && form.payment_mode !== "full" && (
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
                  {/* إدخال المبلغ الفوري (الدفع الآن) */}
                  <FormField label={ar("المبلغ المدفوع الآن", "Amount to Pay Now")}>
                    <div className="relative">
                      <Input
                        className="h-9 pe-12"
                        type="number"
                        min={0}
                        step="0.01"
                        max={totalAmount}
                        placeholder="0.00"
                        value={form.amount_paid}
                        onChange={(e) => set("amount_paid", e.target.value)}
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        {currencyCode}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ar("المتبقي للأقساط: ", "Remaining for installments: ")}
                      <span className="font-semibold text-primary tabular-nums">
                        {new Intl.NumberFormat().format(
                          Math.max(0, totalAmount - (Number(form.amount_paid) || 0)),
                        )}{" "}
                        {currencyCode}
                      </span>
                    </p>
                  </FormField>

                  {/* عدد الأقساط */}
                  <FormField label={ar("عدد الأقساط", "Number of Installments")}>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          className="h-9"
                          type="number"
                          min={1}
                          max={12}
                          value={numInstallments}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(12, Number(e.target.value) || 1));
                            setNumInstallments(val);
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-2 rounded-md whitespace-nowrap">
                        {ar(
                          `كل قسط: ${(Math.max(0, totalAmount - (Number(form.amount_paid) || 0)) / numInstallments).toFixed(2)} ${currencyCode}`,
                          `Per installment: ${(Math.max(0, totalAmount - (Number(form.amount_paid) || 0)) / numInstallments).toFixed(2)} ${currencyCode}`,
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {ar(
                        "سيتم توزيع المتبقي على الأقساط تلقائياً",
                        "Remaining amount will be distributed automatically",
                      )}
                    </p>
                  </FormField>

                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">
                      {ar("الأقساط / الدفعات", "Installments")}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumInstallments((prev) => prev + 1)}
                      disabled={numInstallments >= 12}
                    >
                      <Plus className="w-4 h-4 me-1" />
                      {ar("إضافة قسط", "Add Installment")}
                    </Button>
                  </div>
                  {installments.map((inst, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-3 border rounded-lg bg-muted/20"
                    >
                      <FormField label={ar("تاريخ السداد", "Due Date")}>
                        <Input
                          type="date"
                          className="h-9"
                          value={inst.due_date}
                          onChange={(e) => updateInstallment(idx, "due_date", e.target.value)}
                        />
                      </FormField>
                      <FormField label={ar("المبلغ", "Amount")}>
                        <Input
                          type="number"
                          className="h-9"
                          value={inst.amount}
                          onChange={(e) => updateInstallment(idx, "amount", e.target.value)}
                        />
                      </FormField>
                      <div className="flex items-center gap-4 pb-2 sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <Checkbox
                            checked={inst.is_paid}
                            onCheckedChange={(c) => updateInstallment(idx, "is_paid", !!c)}
                          />
                          {ar("تم الدفع", "Paid")}
                        </label>
                      </div>
                      {inst.is_paid && (
                        <div className="sm:col-span-2 flex items-center justify-between gap-2">
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            className="text-xs h-9"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              updateInstallment(idx, "invoice_image", file || null);
                            }}
                          />
                        </div>
                      )}
                      {installments.length > 1 && (
                        <div className="sm:col-span-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeInstallment(idx)}
                          >
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
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-0.5">
                      {ar("المبلغ الإجمالي", "Total Amount")}
                    </p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {new Intl.NumberFormat().format(Number(form.total_amount) || 0)}{" "}
                      {currencyCode}
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
              isQuotationMode={isQuotationMode}
              selectedItems={selectedItems}
              getItemTotal={getItemTotal}
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
              subtitle={ar(
                "أي طلبات خاصة أو ملاحظات إضافية",
                "Special requests or additional notes",
              )}
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
          {isSaving ? ar("جاري الحفظ...", "Saving...") : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
