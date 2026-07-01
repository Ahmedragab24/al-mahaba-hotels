import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { useI18n } from "@/lib/i18n";
import { useGetRoomsQuery } from "@/store/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface SelectedRate {
  rate_id: string;
  room_type_id: string;
  view_id: string | null;
  meal_plan: string;
  selling_price: number;
  rooms: number;
  supplier_id: string | null;
  is_direct: boolean;
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
}

interface QuotationRatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  initialSelected?: SelectedRate[];
  onSave: (selected: SelectedRate[]) => void;
  nights?: number;
  groupSize?: number;
}

export function QuotationRatesDialog({ open, onOpenChange, hotelId, initialSelected, onSave, nights = 1, groupSize = 1 }: QuotationRatesDialogProps) {
  const { t, lang } = useI18n();

  const { data: roomsData } = useGetRoomsQuery(
    hotelId ? { hotel_id: hotelId } : undefined,
    { skip: !hotelId || !open }
  );

  const roomsList = useMemo(() => {
    if (!roomsData) return [];
    if (Array.isArray(roomsData)) return roomsData;
    return (roomsData as any).data || [];
  }, [roomsData]);

  // Selected state per rate_id: quantity
  const [selected, setSelected] = useState<Record<string, { selected: boolean; quantity: number }>>({});

  // Reset state when opened with a new hotel
  useEffect(() => {
    if (open) {
      if (initialSelected && initialSelected.length > 0) {
        const state: Record<string, { selected: boolean; quantity: number }> = {};
        initialSelected.forEach(item => {
          state[item.rate_id] = { selected: true, quantity: item.rooms };
        });
        setSelected(state);
      } else {
        setSelected({});
      }
    }
  }, [open, hotelId, initialSelected]);

  const q = useQuery({
    queryKey: ["prices", hotelId],
    queryFn: async () => {
      const response = await apiClient.prices.getAll({
        hotel_id: hotelId,
        status: "approved",
        lang,
        per_page: "500"
      });
      return response;
    },
    enabled: !!hotelId && open,
  });

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

    const ratesData = Array.isArray(q.data) ? q.data : (q.data?.data?.data || q.data?.data || []);

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
  }, [q.data]);

  const handleToggle = (rateId: string, checked: boolean) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { selected: checked, quantity: checked ? (prev[rateId]?.quantity || 1) : 0 }
    }));
  };

  const handleQuantity = (rateId: string, qty: number) => {
    setSelected(prev => ({
      ...prev,
      [rateId]: { ...prev[rateId], quantity: qty, selected: prev[rateId]?.selected || qty > 0 }
    }));
  };

  const handleSave = () => {
    const results: SelectedRate[] = [];
    const ratesData = Array.isArray(q.data) ? q.data : (q.data?.data?.data || q.data?.data || []);
    ratesData.forEach((r: any) => {
      const state = selected[r.id];
      if (state?.selected && state.quantity > 0) {
        const actualSupplier = r.supplier || r.contract?.supplier;
        const roomObj = roomsList.find((rm: any) => String(rm.id) === String(r.room_id || r.room?.id)) || r.room;
        
        const viewObj = r.hotel_view || r.hotelView || roomObj?.hotel_view || roomObj?.hotelView;
        const fallbackView = typeof r.view === "string" ? r.view : (typeof roomObj?.view === "string" ? roomObj.view : undefined);
        const roomTypeObj = roomObj?.room_type || r.room_type;
        
        results.push({
          rate_id: String(r.id),
          room_type_id: String(r.room_type_id || roomObj?.room_type_id),
          view_id: String(r.hotel_view_id || roomObj?.hotel_view_id || null),
          meal_plan: r.meal_plan_type || "exclusive",
          selling_price: r.selling_price || r.cost_per_night,
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
        });
      }
    });
    onSave(results);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              {lang === "ar" ? "عروض أسعار الفندق" : "Hotel Rates"}
            </div>
            <div className="flex gap-2 me-6">
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {nights} {lang === "ar" ? "ليالي" : "Nights"}
              </Badge>
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {groupSize} {lang === "ar" ? "أشخاص" : "Persons"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-card">
          {q.isLoading && <div className="text-center py-10 text-muted-foreground">{t("label.loading")}</div>}
          {!q.isLoading && groupedRates.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">لا توجد أسعار متاحة لهذا الفندق.</div>
          )}

          <div className="space-y-6">
            {groupedRates.map((group) => {
              // Calculate total for this group
              const groupTotal = group.rates.reduce((acc, rate) => {
                const isSelected = selected[rate.id]?.selected || false;
                const qty = selected[rate.id]?.quantity || 0;
                const price = rate.selling_price || rate.cost_per_night;
                return acc + (isSelected ? qty * price * (nights || 1) : 0);
              }, 0);

              return (
                <div key={group.supplier_id || "direct"} className="bg-card border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            {lang === "ar" ? group.name_ar : group.name_en}
                          </h3>
                          {group.is_direct && (
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                              مصدر رئيسي
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {group.is_direct ? (lang === "ar" ? "عروض الأسعار المباشرة من إدارة الفندق" : "Direct rate offers from hotel management") : (lang === "ar" ? "أسعار وخدمات المورد لعملائك" : "Supplier prices and services for your clients")}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-[11px] text-muted-foreground mb-0.5">الإجمالي للمورد</div>
                      <div className="font-bold text-base text-amber-600 dark:text-amber-500">
                        <span className="text-lg me-1">{groupTotal}</span>
                        <span className="text-sm">ريال</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 dark:text-slate-500 font-normal text-center border-b border-border/50">
                          <th className="pb-4 px-4 font-normal text-start">الغرفة</th>
                          <th className="pb-4 px-4 font-normal">{lang === "ar" ? "نوع الغرفة" : "Room Type"}</th>
                          <th className="pb-4 px-4 font-normal">الإطلالة</th>
                          <th className="pb-4 px-4 font-normal">خطة الوجبات</th>
                          <th className="pb-4 px-4 font-normal">سعر الليلة</th>
                          <th className="pb-4 px-4 font-normal w-32">{lang === "ar" ? "عدد الغرف" : "Rooms Qty"}</th>
                          <th className="pb-4 px-4 font-normal">الإجمالي</th>
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
                            <tr key={rate.id} className="transition-colors group">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(c) => handleToggle(rate.id, !!c)}
                                    className={cn("border-slate-300 dark:border-slate-600 rounded transition-colors", isSelected && "bg-amber-600 border-amber-600 dark:border-amber-600")}
                                  />
                                  <span className={cn("font-bold transition-colors", isSelected ? "text-slate-800 dark:text-slate-200" : "text-muted-foreground")}>
                                    {lang === "ar" ? rate.room?.name_ar : rate.room?.name_en}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className={cn("font-medium transition-colors", isSelected ? "text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                  <span>{roomTypeName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className={cn("flex items-center justify-center gap-1.5 font-medium transition-colors", isSelected ? "text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                  {roomView && <MapPin className={cn("w-3.5 h-3.5", isSelected ? "text-amber-600" : "text-muted-foreground/50")} />}
                                  <span>{roomView || "—"}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className={cn("font-medium transition-all mx-auto w-fit min-w-[100px]", isSelected ? "bg-slate-50 dark:bg-slate-800/50 py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300" : "text-muted-foreground/50")}>
                                  {t(`board.${rate.meal_plan_type}`, rate.meal_plan_type || "—")}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className={cn("font-medium transition-all mx-auto w-fit min-w-[100px]", isSelected ? "bg-slate-50 dark:bg-slate-800/50 py-2.5 px-4 rounded-xl text-amber-600 dark:text-amber-500" : "text-muted-foreground/50")}>
                                  {price} {lang === "ar" ? "ريال" : String(rate.currency?.code || rate.currency_id || "")}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {isSelected ? (
                                  <Input
                                    type="number"
                                    min={1}
                                    value={qty}
                                    onChange={(e) => handleQuantity(rate.id, parseInt(e.target.value) || 0)}
                                    className="h-10 text-center bg-slate-50 dark:bg-slate-800/50 border-0 rounded-xl text-amber-600 dark:text-amber-500 font-bold focus-visible:ring-1 focus-visible:ring-amber-500"
                                    placeholder=""
                                  />
                                ) : (
                                  <div className="text-center font-medium text-muted-foreground/50 h-10 flex items-center justify-center">
                                    0
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isSelected ? (
                                  <div className="font-bold text-amber-600 dark:text-amber-500">
                                    {price * (typeof qty === 'number' ? qty : 0) * (nights || 1)} {lang === "ar" ? "ريال" : String(rate.currency?.code || rate.currency_id || "")}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground/50 font-medium">—</div>
                                )}
                              </td>
                            </tr>
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

        <div className="p-6 border-t bg-background flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">إضافة الأسعار المحددة</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
