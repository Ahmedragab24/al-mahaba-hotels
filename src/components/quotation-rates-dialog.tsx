import { useState, useMemo, useEffect, Fragment } from "react";
import { useI18n } from "@/lib/i18n";
import { useGetRoomsQuery, useGetPricesQuery } from "@/store/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface SelectedRate {
  rate_id: string;
  room_type_id: string;
  view_id: string | null;
  meal_plan: string;
  selling_price: number;
  rooms: number;
  supplier_id: string | null;
  is_direct: boolean;
  tax_type?: "inclusive_tax" | "exclusive_tax";
  tax_rate?: number;
  // UI Display info
  room_name_en?: string;
  room_name_ar?: string;
  room_type_name_en?: string;
  room_type_name_ar?: string;
  view_name_en?: string;
  view_name_ar?: string;
  supplier_name_en?: string;
  supplier_name_ar?: string;
  room?: any;
  room_type?: any;
  meal_plan_type?: string;
  meal_plan_details?: any[];
  is_weekend_weekday?: boolean;
  weekend_selling_price?: number | null;
  weekend_days?: string[];
  days?: string[];
  start_date?: string;
  end_date?: string;
  check_in?: string;
  check_out?: string;
  profit_margin?: number;
  hotel_id?: string;
  quotation_item_id?: string | number;
  custom_selling_price?: number | string | null;
  // قيم محسوبة من السيرفر (ReadOnly mode)
  night_price?: number | null;
  subtotal?: number | null;
  hotel_total?: number | null;
  company_profit?: number | null;
  is_saved?: boolean;
}

export const formatMealPlan = (planType?: string, planDetails?: any[], lang?: string, t?: any) => {
  const isAr = lang === "ar";
  const detailsStr = planDetails && planDetails.length > 0
    ? planDetails.map((d: any) => d.label || d.name_ar || d.name_en || t?.(`board.${d.key}`) || d.key).join(isAr ? "، " : ", ")
    : "";

  if (planType === "inclusive") {
    if (detailsStr) {
      return isAr ? `وجبات مشمولة (${detailsStr})` : `Inclusive Meals (${detailsStr})`;
    } else {
      return isAr ? "بدون وجبات (إقامة فقط)" : "Room Only";
    }
  } else if (planType === "exclusive") {
    if (detailsStr) {
      return isAr ? `وجبات اختيارية (${detailsStr})` : `Exclusive Meals (${detailsStr})`;
    } else {
      return isAr ? "بدون وجبات (إقامة فقط)" : "Room Only";
    }
  }
  return planType ? t?.(`board.${planType}`) || planType : (isAr ? "بدون وجبات (إقامة فقط)" : "—");
};

interface QuotationRatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  initialSelected?: SelectedRate[];
  onSave: (selected: SelectedRate[]) => void;
  nights?: number;
  groupSize?: number;
  checkIn?: string;
  checkOut?: string;
}

export function QuotationRatesDialog({
  open,
  onOpenChange,
  hotelId,
  initialSelected,
  onSave,
  nights = 1,
  groupSize = 1,
  checkIn,
  checkOut
}: QuotationRatesDialogProps) {
  const { t, lang } = useI18n();

  const calculateNights = (start?: string, end?: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getRateTotal = (rate: any, qty: number, startDateStr?: string, endDateStr?: string, profitMarginVal: number = 0, customSellingPriceVal?: string | number | null) => {
    if (qty <= 0) return 0;
    const start = startDateStr || "";
    const end = endDateStr || "";
    const n = calculateNights(start, end) || 1;

    const getClientNightPrice = (base: number) => {
      const marginAmt = base * (profitMarginVal / 100);
      return base + marginAmt;
    };

    const hasCustom = customSellingPriceVal !== undefined && customSellingPriceVal !== null && customSellingPriceVal !== "";

    if (hasCustom) {
      const basePrice = Number(customSellingPriceVal) || 0;
      const clientPrice = getClientNightPrice(basePrice);
      return clientPrice * qty * n;
    }

    if (!rate.is_weekend_weekday || !start || !end) {
      const basePrice = rate.selling_price || rate.cost_per_night || 0;
      const clientPrice = getClientNightPrice(basePrice);
      return clientPrice * qty * n;
    }

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      const basePrice = rate.selling_price || rate.cost_per_night || 0;
      const clientPrice = getClientNightPrice(basePrice);
      return clientPrice * qty * n;
    }

    let totalSum = 0;
    const currentDate = new Date(startDate);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekendDays = rate.weekend_days || ["Friday", "Saturday"];
    const weekendPrice = rate.weekend_selling_price !== null && rate.weekend_selling_price !== undefined
      ? rate.weekend_selling_price
      : (rate.selling_price || rate.cost_per_night || 0);
    const weekdayPrice = rate.selling_price || rate.cost_per_night || 0;

    while (currentDate < endDate) {
      const dayOfWeek = dayNames[currentDate.getDay()];
      const basePrice = weekendDays.includes(dayOfWeek) ? weekendPrice : weekdayPrice;
      totalSum += getClientNightPrice(Number(basePrice));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalSum * qty;
  };

  const { data: roomsData } = useGetRoomsQuery(
    hotelId ? { hotel_id: hotelId } : undefined,
    { skip: !hotelId || !open, pollingInterval: 2000 } // Auto-refresh rooms every 2 seconds
  );

  const roomsList = useMemo(() => {
    if (!roomsData) return [];
    if (Array.isArray(roomsData)) return roomsData;
    // Handle { data: { data: [...] } } format
    if (roomsData && Array.isArray(roomsData)) return roomsData;
    // Handle { data: [...] } format
    if (Array.isArray((roomsData as any)?.data)) return (roomsData as any).data;
    return [];
  }, [roomsData]);

  // Selected state per rate_id
  const [selected, setSelected] = useState<Record<string, { selected: boolean; quantity: number; start_date: string; end_date: string; profit_margin: number; custom_selling_price: string }>>({});

  const defaultStart = checkIn ? checkIn.split(/[ T]/)[0] : "";
  const defaultEnd = checkOut ? checkOut.split(/[ T]/)[0] : "";

  const [filterFrom, setFilterFrom] = useState(defaultStart);
  const [filterTo, setFilterTo] = useState(defaultEnd);

  // Reset state when opened with a new hotel
  useEffect(() => {
    if (open) {
      setFilterFrom(checkIn ? checkIn.split(/[ T]/)[0] : "");
      setFilterTo(checkOut ? checkOut.split(/[ T]/)[0] : "");
      if (initialSelected && initialSelected.length > 0) {
        const state: Record<string, { selected: boolean; quantity: number; start_date: string; end_date: string; profit_margin: number; custom_selling_price: string }> = {};
        initialSelected.forEach(item => {
          state[item.rate_id] = {
            selected: true,
            quantity: item.rooms,
            start_date: item.start_date || "",
            end_date: item.end_date || "",
            profit_margin: item.profit_margin || 0,
            custom_selling_price: item.custom_selling_price !== undefined ? (item.custom_selling_price === null ? "" : String(item.custom_selling_price)) : "",
          };
        });
        setSelected(state);
      } else {
        setSelected({});
      }
    }
  }, [open, hotelId, initialSelected, checkIn, checkOut]);

  const q = useGetPricesQuery(
    hotelId
      ? {
        hotel_id: hotelId,
        status: "valid",
        lang,
        per_page: "500",
        ...(filterFrom ? { valid_from: filterFrom } : {}),
        ...(filterTo ? { valid_to: filterTo } : {}),
      }
      : undefined,
    {
      skip: !hotelId || !open,
      pollingInterval: 2000, // Auto-refresh prices every 2 seconds
    }
  );

  const ratesData = useMemo(() => {
    if (!q.data) return [];
    let list = [];
    if (Array.isArray(q.data)) {
      list = q.data;
    } else if (q.data?.data && Array.isArray(q.data.data)) {
      list = q.data.data;
    } else if (Array.isArray((q.data as any)?.data)) {
      list = (q.data as any).data;
    }

    if (filterFrom || filterTo) {
      list = list.filter((r: any) => {
        const rFrom = r.valid_from ? r.valid_from.split(/[ T]/)[0] : null;
        const rTo = r.valid_to ? r.valid_to.split(/[ T]/)[0] : null;

        // If rate has no dates defined, it's always valid
        if (!rFrom && !rTo) return true;

        // Overlap check:
        // Exclude if rate ends before filterFrom
        if (filterFrom && rTo && rTo < filterFrom) return false;
        // Exclude if rate starts after filterTo
        if (filterTo && rFrom && rFrom > filterTo) return false;

        return true;
      });
    }

    return list;
  }, [q.data, filterFrom, filterTo]);

  const groupedRates = useMemo(() => {
    const groups: Record<string, { supplier_id: string | null; name_en: string; name_ar: string; is_direct: boolean; rates: any[] }> = {};

    // Direct Group
    groups["direct"] = {
      supplier_id: null,
      name_en: "Direct Hotel",
      name_ar: "فندق مباشر",
      is_direct: true,
      rates: []
    };

    ratesData.forEach((r: any) => {
      const actualSupplierId = r.supplier_id || r.contract?.supplier_id;
      const actualSupplier = r.supplier || r.contract?.supplier;

      if (r.is_direct || !actualSupplierId) {
        groups["direct"].rates.push(r);
      } else {
        if (!groups[actualSupplierId]) {
          groups[actualSupplierId] = {
            supplier_id: actualSupplierId,
            name_en: actualSupplier?.name_en || "Supplier",
            name_ar: actualSupplier?.name_ar || "مورد",
            is_direct: false,
            rates: []
          };
        }
        groups[actualSupplierId].rates.push(r);
      }
    });

    // Remove empty direct group
    if (groups["direct"].rates.length === 0) {
      delete groups["direct"];
    }

    return Object.values(groups);
  }, [ratesData]);

  const handleToggle = (rateId: string, checked: boolean, validFrom?: string, validTo?: string) => {
    const defaultRateStart = validFrom || filterFrom || defaultStart;
    const defaultRateEnd = validTo || filterTo || defaultEnd;
    setSelected(prev => ({
      ...prev,
      [rateId]: {
        selected: checked,
        quantity: checked ? (prev[rateId]?.quantity || 1) : 0,
        start_date: checked ? (prev[rateId]?.start_date || defaultRateStart) : "",
        end_date: checked ? (prev[rateId]?.end_date || defaultRateEnd) : "",
        profit_margin: checked ? (prev[rateId]?.profit_margin ?? 5) : 0,
        custom_selling_price: checked ? (prev[rateId]?.custom_selling_price ?? "") : "",
      }
    }));
  };

  const handleQuantity = (rateId: string, qty: number, validFrom?: string, validTo?: string) => {
    const defaultRateStart = validFrom || filterFrom || defaultStart;
    const defaultRateEnd = validTo || filterTo || defaultEnd;
    setSelected(prev => ({
      ...prev,
      [rateId]: {
        ...prev[rateId],
        quantity: qty,
        selected: prev[rateId]?.selected || qty > 0,
        profit_margin: prev[rateId]?.profit_margin ?? 5,
        start_date: prev[rateId]?.start_date || defaultRateStart,
        end_date: prev[rateId]?.end_date || defaultRateEnd,
        custom_selling_price: prev[rateId]?.custom_selling_price ?? "",
      }
    }));
  };

  const handleStartDate = (rateId: string, val: string) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { ...prev[rateId], start_date: val }
    }));
  };

  const handleEndDate = (rateId: string, val: string) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { ...prev[rateId], end_date: val }
    }));
  };

  const handleProfitMargin = (rateId: string, val: number) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { ...prev[rateId], profit_margin: val }
    }));
  };

  const handleCustomSellingPrice = (rateId: string, val: string) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { ...prev[rateId], custom_selling_price: val }
    }));
  };

  const handleSave = () => {
    const results: SelectedRate[] = [];
    let hasInvalidNights = false;

    ratesData.forEach((r: any) => {
      const state = selected[r.id];
      if (state?.selected && state.quantity > 0) {
        const n = calculateNights(state.start_date, state.end_date);
        if (n < 1) {
          hasInvalidNights = true;
        }

        const actualSupplier = r.supplier || r.contract?.supplier;
        const roomObj = roomsList.find((rm: any) => String(rm.id) === String(r.room_id || r.room?.id)) || r.room;

        const viewObj = r.hotel_view || r.hotelView || roomObj?.hotel_view || roomObj?.hotelView;
        const fallbackView = typeof r.view === "string" ? r.view : (typeof roomObj?.view === "string" ? roomObj.view : undefined);
        const roomTypeObj = roomObj?.room_type || r.room_type;

        results.push({
          rate_id: String(r.id),
          room_type_id: String(r.room_type_id || roomObj?.room_type_id),
          view_id: String(r.hotel_view_id || roomObj?.hotel_view_id || null),
          meal_plan: formatMealPlan(r.meal_plan_type, r.meal_plan_details, lang, t),
          selling_price: r.selling_price || r.cost_per_night,
          tax_type: r.tax_type || "inclusive_tax",
          tax_rate: Number(r.tax_rate ?? 15),
          rooms: state.quantity,
          supplier_id: String(r.supplier_id || r.contract?.supplier_id || null),
          is_direct: r.is_direct,
          room_name_en: roomObj?.name_en || r.room?.name_en,
          room_name_ar: roomObj?.name_ar || r.room?.name_ar,
          room_type_name_en: roomTypeObj?.name_en || roomTypeObj?.name,
          room_type_name_ar: roomTypeObj?.name_ar || roomTypeObj?.name,
          view_name_en: viewObj?.name_en || fallbackView,
          view_name_ar: viewObj?.name_ar || fallbackView,
          supplier_name_en: actualSupplier?.name_en || (r.is_direct ? "Direct Hotel" : "Supplier"),
          supplier_name_ar: actualSupplier?.name_ar || (r.is_direct ? "فندق مباشر" : "مورد"),
          room: roomObj,
          room_type: roomTypeObj,
          meal_plan_type: r.meal_plan_type,
          meal_plan_details: r.meal_plan_details,
          is_weekend_weekday: r.is_weekend_weekday,
          weekend_selling_price: r.weekend_selling_price,
          weekend_days: r.weekend_days,
          days: r.days,
          start_date: state.start_date,
          end_date: state.end_date,
          profit_margin: state.profit_margin || 0,
          custom_selling_price: state.custom_selling_price ? Number(state.custom_selling_price) : null,
        });
      }
    });

    if (hasInvalidNights) {
      toast.error(lang === "ar" ? "يجب إضافة ليلة واحدة على الأقل لكل غرفة محددة" : "Must select at least 1 night for each selected room");
      return;
    }

    onSave(results);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-sm sm:text-base flex items-center justify-between w-full flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>{lang === "ar" ? "عروض أسعار الفندق" : "Hotel Rates"}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs font-normal">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{lang === "ar" ? "من:" : "From:"}</span>
                  <Input
                    type="date"
                    className="h-8 py-1 px-2 text-xs w-fit bg-background border border-border"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{lang === "ar" ? "إلى:" : "To:"}</span>
                  <Input
                    type="date"
                    className="h-8 py-1 px-2 text-xs w-fit bg-background border border-border"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 me-4">
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {groupSize} {lang === "ar" ? "أشخاص" : "Persons"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-card">
          {q.isLoading && <div className="text-center py-4 text-sm text-muted-foreground">{t("label.loading")}</div>}
          {!q.isLoading && groupedRates.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">لا توجد أسعار متاحة لهذا الفندق.</div>
          )}

          <div className="space-y-4">
            {groupedRates.map((group) => {
              // Calculate total for this group
              const groupTotal = group.rates.reduce((acc, rate) => {
                const isSelected = selected[rate.id]?.selected || false;
                const qty = selected[rate.id]?.quantity || 0;
                const startDate = selected[rate.id]?.start_date;
                const endDate = selected[rate.id]?.end_date;
                const margin = selected[rate.id]?.profit_margin || 0;
                const customPrice = selected[rate.id]?.custom_selling_price;
                return acc + (isSelected ? getRateTotal(rate, qty, startDate, endDate, margin, customPrice) : 0);
              }, 0);

              return (
                <div key={group.supplier_id || "direct"} className="bg-card border rounded-lg p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-4.5 h-4.5 text-amber-700 dark:text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                            {lang === "ar" ? group.name_ar : group.name_en}
                          </h3>
                          {group.is_direct && (
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal px-2 py-0.5 rounded-full text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800">
                              مصدر رئيسي
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm text-muted-foreground">الإجمالي: <span className="font-bold text-amber-600 dark:text-amber-500 text-sm sm:text-base">{groupTotal.toFixed(2)}</span> ريال</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 dark:text-slate-500 font-normal text-center border-b border-border/50">
                          <th className="pb-2 px-2 font-normal text-start">الغرفة</th>
                          <th className="pb-2 px-2 font-normal">{lang === "ar" ? "نوع الغرفة" : "Room Type"}</th>
                          <th className="pb-2 px-2 font-normal">الصلاحية</th>
                          <th className="pb-2 px-2 font-normal">الوجبات</th>
                          <th className="pb-2 px-2 font-normal">سعر الليلة</th>
                          <th className="pb-2 px-2 font-normal">{lang === "ar" ? "الضريبة" : "Tax"}</th>
                          <th className="pb-2 px-2 font-normal w-24">{lang === "ar" ? "عدد الغرف" : "Rooms Qty"}</th>
                          <th className="pb-2 px-2 font-normal">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rates.map(rate => {
                          const isSelected = selected[rate.id]?.selected || false;
                          const qty = selected[rate.id]?.quantity || "";
                          const price = rate.selling_price || rate.cost_per_night;

                          const roomObj = roomsList.find((rm: any) => String(rm.id) === String(rate.room_id || rate.room?.id)) || rate.room;
                          const viewObj = rate.hotel_view || rate.hotelView || roomObj?.hotel_view || roomObj?.hotelView;
                          const fallbackView = typeof rate.view === "string" ? rate.view : (typeof roomObj?.view === "string" ? roomObj.view : null);
                          const roomView = viewObj
                            ? (lang === "ar" ? (viewObj.name_ar || viewObj.name_en) : (viewObj.name_en || viewObj.name_ar))
                            : fallbackView;

                          const roomTypeObj = roomObj?.room_type || rate.room_type;
                          const roomTypeName = roomTypeObj
                            ? (lang === "ar" ? (roomTypeObj.name_ar || roomTypeObj.name_en || roomTypeObj.name) : (roomTypeObj.name_en || roomTypeObj.name_ar || roomTypeObj.name))
                            : "—";

                          return (
                            <Fragment key={rate.id}>
                              <tr className="transition-colors group border-b">
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-2.5">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(c) => handleToggle(rate.id, !!c, rate.valid_from, rate.valid_to)}
                                      className={cn("w-4 h-4 border-slate-300 dark:border-slate-600 rounded transition-colors", isSelected && "bg-amber-600 border-amber-600 dark:border-amber-600")}
                                    />
                                    <div>
                                      <span className={cn("font-bold text-sm sm:text-base transition-colors", isSelected ? "text-slate-800 dark:text-slate-200" : "text-muted-foreground")}>
                                        {lang === "ar" ? (rate.room?.name_ar || rate.room?.name_en || "—") : (rate.room?.name_en || rate.room?.name_ar || "—")}
                                      </span>
                                      <div className="text-[10px] text-muted-foreground font-mono">{rate.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className={cn("font-medium transition-colors text-sm", isSelected ? "text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                    <span>{roomTypeName}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className={cn("flex items-center justify-center gap-0.5 font-medium transition-colors text-sm", isSelected ? "text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                    {rate.valid_from && rate.valid_to && (
                                      <span>{rate.valid_from} ➔ {rate.valid_to}</span>
                                    )}
                                    {!rate.valid_from && <span>—</span>}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className={cn("font-medium transition-all mx-auto w-fit min-w-[70px] text-sm", isSelected ? "bg-slate-50 dark:bg-slate-800/50 py-0.5 px-2 rounded text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                    {formatMealPlan(rate.meal_plan_type, rate.meal_plan_details, lang, t)}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className={cn("font-medium transition-all mx-auto w-fit min-w-[75px] text-sm", isSelected ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground/50")}>
                                    {rate.is_weekend_weekday ? (
                                      <div className="flex flex-col gap-0.5 text-xs text-start min-w-[100px] font-sans">
                                        {rate.selling_price !== null && rate.selling_price !== undefined && (
                                          <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/40 px-1.5 py-0.5 rounded border border-border/40">
                                            <span className="text-slate-700 dark:text-slate-300 text-[10px]">WD:</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-500">{rate.selling_price}</span>
                                          </div>
                                        )}
                                        {rate.weekend_selling_price !== null && rate.weekend_selling_price !== undefined && (
                                          <div className="flex items-center justify-between gap-1 bg-amber-50/20 dark:bg-amber-950/10 px-1.5 py-0.5 rounded border border-amber-200/20">
                                            <span className="text-amber-800 dark:text-amber-400 text-[10px]">WE:</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-500">{rate.weekend_selling_price}</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-slate-50 dark:bg-slate-800/50 py-0.5 px-2 rounded text-sm">
                                        {price} {lang === "ar" ? "ريال" : String(rate.currency?.code || "SAR")}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className={cn("font-medium transition-all mx-auto w-fit text-sm", isSelected ? "text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                    {rate.tax_rate}%
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  {isSelected ? (
                                    <Input
                                      type="number"
                                      min={1}
                                      value={qty}
                                      onChange={(e) => handleQuantity(rate.id, parseInt(e.target.value) || 0, rate.valid_from, rate.valid_to)}
                                      className="h-10 text-center bg-slate-50 dark:bg-slate-800/50 border-0 rounded text-amber-600 dark:text-amber-500 font-bold focus-visible:ring-1 focus-visible:ring-amber-500 text-sm py-0 px-2 w-20 mx-auto"
                                    />
                                  ) : (
                                    <div className="text-center font-medium text-muted-foreground/50 h-10 flex items-center justify-center text-sm">
                                      0
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center text-sm">
                                  {isSelected ? (
                                    <div className="font-bold text-amber-600 dark:text-amber-500 text-sm sm:text-base">
                                      {getRateTotal(rate, typeof qty === 'number' ? qty : 0, selected[rate.id]?.start_date, selected[rate.id]?.end_date, selected[rate.id]?.profit_margin, selected[rate.id]?.custom_selling_price).toFixed(2)}
                                    </div>
                                  ) : (
                                    <div className="text-muted-foreground/50 font-medium">—</div>
                                  )}
                                </td>
                              </tr>
                              {isSelected && (
                                <tr className="bg-amber-50/5 dark:bg-amber-950/5">
                                  <td colSpan={8} className="p-3 border-b border-border/50">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 bg-card p-4 rounded border border-border/50 shadow-xs max-w-5xl mx-auto">
                                      {/* Check-In Date */}
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "تاريخ الدخول" : "Check-In"}
                                        </Label>
                                        <Input
                                          type="date"
                                          value={selected[rate.id]?.start_date || ""}
                                          onChange={(e) => handleStartDate(rate.id, e.target.value)}
                                          className="h-10 text-sm bg-slate-50/50 dark:bg-slate-800/30 border-border/70 focus-visible:ring-amber-500 py-0 px-3"
                                        />
                                      </div>
                                      {/* Check-Out Date */}
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "تاريخ المغادرة" : "Check-Out"}
                                        </Label>
                                        <Input
                                          type="date"
                                          value={selected[rate.id]?.end_date || ""}
                                          min={selected[rate.id]?.start_date || undefined}
                                          onChange={(e) => handleEndDate(rate.id, e.target.value)}
                                          className="h-10 text-sm bg-slate-50/50 dark:bg-slate-800/30 border-border/70 focus-visible:ring-amber-500 py-0 px-3"
                                        />
                                      </div>
                                      {/* Nights display */}
                                      <div className="space-y-1 flex flex-col justify-end">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "عدد الليالي" : "Nights"}
                                        </Label>
                                        <div className="h-10 flex items-center justify-center font-bold text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 px-3 rounded border border-amber-200/20 w-full text-sm">
                                          {calculateNights(selected[rate.id]?.start_date, selected[rate.id]?.end_date)} {lang === "ar" ? "ليالي" : "N"}
                                        </div>
                                      </div>
                                      {/* Profit Margin % */}
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "هامش الربح (%)" : "Profit Margin (%)"}
                                        </Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          step="0.1"
                                          value={selected[rate.id]?.profit_margin ?? 0}
                                          onChange={(e) => handleProfitMargin(rate.id, parseFloat(e.target.value) || 0)}
                                          className="h-10 text-sm bg-slate-50/50 dark:bg-slate-800/30 border-border/70 focus-visible:ring-amber-500 py-0 px-3"
                                        />
                                      </div>
                                      {/* Custom Selling Price */}
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "سعر البيع المخصص" : "Custom Selling Price"}
                                        </Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          step="0.01"
                                          placeholder={lang === "ar" ? "تلقائي" : "Auto"}
                                          value={selected[rate.id]?.custom_selling_price ?? ""}
                                          onChange={(e) => handleCustomSellingPrice(rate.id, e.target.value)}
                                          className="h-10 text-sm bg-slate-50/50 dark:bg-slate-800/30 border-border/70 focus-visible:ring-amber-500 py-0 px-3"
                                        />
                                      </div>
                                      {/* Calculated Profit */}
                                      <div className="space-y-1 flex flex-col justify-end">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                          {lang === "ar" ? "صافي الربح" : "Net Profit"}
                                        </Label>
                                        {(() => {
                                          const costTotal = getRateTotal(rate, typeof qty === 'number' ? qty : 0, selected[rate.id]?.start_date, selected[rate.id]?.end_date, 0, "");
                                          const sellingTotal = getRateTotal(rate, typeof qty === 'number' ? qty : 0, selected[rate.id]?.start_date, selected[rate.id]?.end_date, selected[rate.id]?.profit_margin, selected[rate.id]?.custom_selling_price);
                                          const netProfit = sellingTotal - costTotal;
                                          return (
                                            <div className="h-10 flex items-center justify-center font-bold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 rounded border border-emerald-200/20 w-full text-sm">
                                              {netProfit.toFixed(2)} {lang === "ar" ? "ريال" : String(rate.currency?.code || "SAR")}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-4 py-3 border-t bg-background flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-10 text-sm px-4" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button size="sm" className="h-10 text-sm px-4 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave}>إضافة الأسعار المحددة</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
