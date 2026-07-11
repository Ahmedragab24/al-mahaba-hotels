import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuotationRatesDialog, SelectedRate, formatMealPlan } from "@/components/quotation-rates-dialog";

interface HotelRatesSelectorProps {
  hotelId: string;
  currencyId: string;
  currencyCode?: string;
  selectedItems: SelectedRate[];
  onChange: (items: SelectedRate[]) => void;
  nights?: number;
  groupSize?: string | number;
  checkIn?: string;
  checkOut?: string;
  readOnly?: boolean;
  hotels?: any[];
  roomTypes?: any[];
}

export function HotelRatesSelector({
  hotelId,
  currencyId,
  currencyCode,
  selectedItems,
  onChange,
  nights = 1,
  groupSize = 1,
  checkIn,
  checkOut,
  readOnly = false,
  hotels,
  roomTypes,
}: HotelRatesSelectorProps) {
  const { t, lang } = useI18n();
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const parsedGroupSize = Number(groupSize) || 1;

  const arLabel = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const calculateNights = (start?: string, end?: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getClientNightPrice = (item: SelectedRate, base: number) => {
    const margin = item.profit_margin !== undefined ? item.profit_margin : 5;
    const marginAmt = base * (margin / 100);
    return base + marginAmt;
  };

  const getRateTotal = (item: SelectedRate) => {
    // 1. If it's a saved item, use the subtotal or night_price from server directly
    if (item.quotation_item_id || item.is_saved) {
      if (item.subtotal !== undefined && item.subtotal !== null) {
        return Number(item.subtotal);
      }
      if (item.night_price !== undefined && item.night_price !== null) {
        const rooms = item.rooms || 1;
        const itemNights = calculateNights(item.start_date, item.end_date) || nights || 1;
        return Number(item.night_price) * rooms * itemNights;
      }
    }

    // 2. Otherwise, perform dynamic calculation
    const rooms = item.rooms || 1;
    const itemNights = calculateNights(item.start_date, item.end_date) || nights || 1;

    if (readOnly) {
      return (Number(item.night_price) ?? item.selling_price ?? 0) * rooms * itemNights;
    }

    const hasCustom = item.custom_selling_price !== undefined && item.custom_selling_price !== null && item.custom_selling_price !== "";

    if (hasCustom) {
      const basePrice = Number(item.custom_selling_price) || 0;
      const clientPrice = getClientNightPrice(item, basePrice);
      return clientPrice * rooms * itemNights;
    }

    if (!item.is_weekend_weekday || !item.start_date || !item.end_date) {
      return getClientNightPrice(item, item.selling_price || 0) * rooms * itemNights;
    }

    const startDate = new Date(item.start_date + "T00:00:00");
    const endDate = new Date(item.end_date + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return getClientNightPrice(item, item.selling_price || 0) * rooms * itemNights;
    }

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
      totalSum += getClientNightPrice(item, Number(basePrice));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalSum * rooms;
  };

  const getRateCost = (item: SelectedRate) => {
    // 1. If it's a saved item, use hotel_total from server directly
    if (item.quotation_item_id || item.is_saved) {
      if (item.hotel_total !== undefined && item.hotel_total !== null) {
        return Number(item.hotel_total);
      }
    }

    // 2. Otherwise, perform dynamic calculation
    const rooms = item.rooms || 1;
    const itemNights = calculateNights(item.start_date, item.end_date) || nights || 1;

    if (!item.is_weekend_weekday || !item.start_date || !item.end_date) {
      return (item.selling_price || 0) * rooms * itemNights;
    }

    const startDate = new Date(item.start_date + "T00:00:00");
    const endDate = new Date(item.end_date + "T00:00:00");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return (item.selling_price || 0) * rooms * itemNights;
    }

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
      totalSum += Number(basePrice);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalSum * rooms;
  };

  const groupedSelectedItems = useMemo(() => {
    const groups: Record<
      string,
      {
        supplier_id: string | null;
        name_en: string;
        name_ar: string;
        is_direct: boolean;
        items: SelectedRate[];
      }
    > = {};

    selectedItems.forEach((item) => {
      const id = item.supplier_id || "direct";
      if (!groups[id]) {
        groups[id] = {
          supplier_id: item.supplier_id,
          name_en: item.supplier_name_en || (item.is_direct ? "Direct Hotel" : "Supplier"),
          name_ar: item.supplier_name_ar || (item.is_direct ? "فندق مباشر" : "مورد"),
          is_direct: item.is_direct,
          items: [],
        };
      }
      groups[id].items.push(item);
    });

    return Object.values(groups);
  }, [selectedItems]);

  if (!hotelId) return null;

  return (
    <div className="mt-6 border-t pt-5 border-border/60">
      {selectedItems.length === 0 ? (
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              setRatesDialogOpen(true);
            }}
            variant="outline"
            className="bg-amber-600 hover:bg-amber-700 text-white border-transparent hover:text-white"
          >
            <Building2 className="w-4 h-4 me-2" />
            {arLabel("عرض الاسعار", "Show Prices")}
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-border/60 rounded-xl bg-slate-50/50 dark:bg-card shadow-xs p-4 space-y-6">
          {groupedSelectedItems.map((group) => (
            <div key={group.supplier_id || "direct"} className="bg-card border rounded-xl p-3 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {lang === "ar" ? group.name_ar : group.name_en}
                      </h3>
                      {group.is_direct && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal px-2 rounded-full text-[9px] hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          مصدر رئيسي
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/50">
                        {parsedGroupSize} {lang === "ar" ? "أشخاص" : "Persons"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 font-normal text-center border-b border-border/50">
                      <th className="pb-2 px-2 font-normal text-start">الغرفة</th>
                      <th className="pb-2 px-2 font-normal">{lang === "ar" ? "نوع الغرفة" : "Room Type"}</th>
                      <th className="pb-2 px-2 font-normal">{lang === "ar" ? "فترة الإقامة / الليالي" : "Stay Period / Nights"}</th>
                      <th className="pb-2 px-2 font-normal">خطة الوجبات</th>
                      <th className="pb-2 px-2 font-normal">سعر الليلة</th>
                      <th className="pb-2 px-2 font-normal">{lang === "ar" ? "الضريبة" : "Tax"}</th>
                      <th className="pb-2 px-2 font-normal">{lang === "ar" ? "هامش الربح" : "Profit Margin"}</th>
                      <th className="pb-2 px-2 font-normal w-24">{lang === "ar" ? "عدد الغرف" : "Rooms Quantity"}</th>
                      <th className="pb-2 px-2 font-normal">{lang === "ar" ? "الربح" : "Profit"}</th>
                      <th className="pb-2 px-2 font-normal">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => {
                      const startDate = item.start_date || item.check_in;
                      const endDate = item.end_date || item.check_out;
                      const itemNights = calculateNights(startDate, endDate);
                      const hotelObj = hotels?.find((h: any) => String(h.id) === String(item.hotel_id));
                      const hotelName = hotelObj ? (lang === "ar" ? hotelObj.name_ar || hotelObj.name_en : hotelObj.name_en || hotelObj.name_ar) : "";
                      const cityName = hotelObj?.city ? (lang === "ar" ? hotelObj.city.name_ar || hotelObj.city.name_en : hotelObj.city.name_en || hotelObj.city.name_ar) : "";
                      const countryName = hotelObj?.country ? (lang === "ar" ? hotelObj.country.name_ar || hotelObj.country.name_en : hotelObj.country.name_en || hotelObj.country.name_ar) : "";
                      return (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded flex items-center justify-center bg-amber-600 border border-amber-600 dark:border-amber-600 text-white shrink-0">
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                  {lang === "ar" ? item.room_name_ar : item.room_name_en}
                                </span>
                                {hotelName && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5">
                                    {hotelName}
                                    {(cityName || countryName) && (
                                      <span className="text-[9px] text-slate-400 font-sans mx-1">
                                        • {cityName}{cityName && countryName && ", "}{countryName}
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-xs">
                            <div className="font-medium text-slate-600 dark:text-slate-300">
                              <span>
                                {(() => {
                                  const rtObj = roomTypes?.find((r: any) => String(r.id) === String(item.room_type_id));
                                  const rtNameAr = rtObj?.name_ar || rtObj?.name;
                                  const rtNameEn = rtObj?.name_en || rtObj?.name;
                                  const nameAr = item.room_type_name_ar || item.room_type?.name_ar || item.room?.room_type?.name_ar || rtNameAr || item.room_type?.name || item.room?.room_type?.name;
                                  const nameEn = item.room_type_name_en || item.room_type?.name_en || item.room?.room_type?.name_en || rtNameEn || item.room_type?.name || item.room?.room_type?.name;
                                  return lang === "ar" ? nameAr || nameEn || "—" : nameEn || nameAr || "—";
                                })()}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="font-medium text-slate-600 dark:text-slate-300">
                              {startDate && endDate ? (
                                <div className="flex flex-col gap-0.5 text-[10px]">
                                  <span>{startDate} ➔ {endDate}</span>
                                  <span className="text-[9px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.2 rounded mx-auto w-fit">
                                    {itemNights} {lang === "ar" ? "ليالي" : "Nights"}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[10px]">
                            <div className="font-medium text-slate-600 dark:text-slate-300 mx-auto w-fit">
                              {formatMealPlan(item.meal_plan_type || item.meal_plan, item.meal_plan_details, lang, t)}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px] max-w-[50px]!">
                            <div className="font-medium mx-auto w-fit">
                              {(item.is_saved || item.quotation_item_id || readOnly) && item.night_price !== undefined && item.night_price !== null ? (
                                <span className="font-bold text-amber-600 dark:text-amber-500">
                                  {Number(item.night_price).toFixed(2)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                                </span>
                              ) : item.custom_selling_price !== undefined && item.custom_selling_price !== null && item.custom_selling_price !== "" ? (
                                <span className="font-bold text-amber-600 dark:text-amber-500">
                                  {getClientNightPrice(item, Number(item.custom_selling_price)).toFixed(2)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                                </span>
                              ) : item.is_weekend_weekday ? (
                                <div className="flex flex-col gap-0.5 text-[9px] text-start min-w-[100px] font-sans">
                                  {item.selling_price !== null && item.selling_price !== undefined && (
                                    <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800/40 p-1 rounded border border-border/40">
                                      <span className="text-slate-700 dark:text-slate-300">WD Price :</span>
                                      <span className="font-bold text-amber-600">
                                        {getClientNightPrice(item, Number(item.selling_price)).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  {item.weekend_selling_price !== null && item.weekend_selling_price !== undefined && (
                                    <div className="flex items-center justify-between gap-1 bg-amber-50/20 dark:bg-amber-950/10 p-1 rounded border border-amber-200/20">
                                      <span className="text-amber-800 dark:text-amber-400">WE Price :</span>
                                      <span className="font-bold text-amber-600">
                                        {getClientNightPrice(item, Number(item.weekend_selling_price)).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="font-semibold text-amber-600 dark:text-amber-500">
                                  {getClientNightPrice(item, Number(item.selling_price || 0)).toFixed(2)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px]">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {item.tax_rate}%
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px]">
                            <div className="font-medium text-slate-700 dark:text-slate-300 mx-auto w-fit font-sans">
                              {item.custom_selling_price !== undefined && item.custom_selling_price !== null && item.custom_selling_price !== "" ? (
                                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200/50 text-[10px] font-normal">
                                  {lang === "ar" ? "سعر مخصص" : "Custom Price"}
                                </Badge>
                              ) : (
                                `${item.profit_margin ?? 0}%`
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px]">
                            <div className="font-bold text-slate-700 dark:text-slate-300 mx-auto w-fit">
                              {item.rooms}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px]">
                            <div className="font-bold text-emerald-600 dark:text-emerald-500 mx-auto w-fit">
                              {(getRateTotal(item) - getRateCost(item)).toFixed(2)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-[11px]">
                            <div className="font-bold text-amber-600 dark:text-amber-500">
                              {getRateTotal(item).toFixed(2)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {!readOnly && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setRatesDialogOpen(true);
                }}
                className="bg-[#B48443] hover:bg-[#A37332] text-white border-transparent hover:text-white px-5 h-8 text-[11px]"
              >
                تعديل
              </Button>
            </div>
          )}
        </div>
      )}

      <QuotationRatesDialog
        open={ratesDialogOpen}
        onOpenChange={setRatesDialogOpen}
        hotelId={hotelId}
        initialSelected={selectedItems}
        onSave={onChange}
        groupSize={parsedGroupSize}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    </div>
  );
}
