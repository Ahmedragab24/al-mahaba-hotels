import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Store } from "lucide-react";
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
  view_name_en?: string;
  view_name_ar?: string;
}

interface QuotationRatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  onSave: (selected: SelectedRate[]) => void;
}

export function QuotationRatesDialog({ open, onOpenChange, hotelId, onSave }: QuotationRatesDialogProps) {
  const { t, lang } = useI18n();

  // Selected state per rate_id: quantity
  const [selected, setSelected] = useState<Record<string, { selected: boolean; quantity: number }>>({});

  // Reset state when opened with a new hotel
  useEffect(() => {
    if (open) {
      setSelected({});
    }
  }, [open, hotelId]);

  const q = useQuery({
    queryKey: ["rates-for-quotation", hotelId],
    enabled: !!hotelId && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rates")
        .select(`
          *,
          supplier:suppliers(name_en, name_ar),
          contract:supplier_contracts(
            supplier_id,
            supplier:suppliers(name_en, name_ar)
          ),
          room:hotel_room_types(name_en, name_ar),
          view:hotel_views(name_en, name_ar)
        `)
        .eq("hotel_id", hotelId)
        .eq("status", "approved")
        .is("deleted_at", null);
      if (error) throw error;
      return data || [];
    },
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

    (q.data || []).forEach(r => {
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
    (q.data || []).forEach(r => {
      const state = selected[r.id];
      if (state?.selected && state.quantity > 0) {
        results.push({
          rate_id: r.id,
          room_type_id: r.room_type_id,
          view_id: r.view_id,
          meal_plan: r.meal_plan,
          selling_price: r.selling_price || r.cost_per_night, // Fallback if no selling price
          rooms: state.quantity,
          supplier_id: r.supplier_id || r.contract?.supplier_id || null,
          is_direct: r.is_direct,
          room_name_en: r.room?.name_en,
          room_name_ar: r.room?.name_ar,
          view_name_en: r.view?.name_en,
          view_name_ar: r.view?.name_ar,
        });
      }
    });
    onSave(results);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            {lang === "ar" ? "عروض أسعار الفندق" : "Hotel Rates"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/50">
          {q.isLoading && <div className="text-center py-10 text-muted-foreground">{t("label.loading")}</div>}
          {!q.isLoading && groupedRates.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">لا توجد أسعار متاحة لهذا الفندق.</div>
          )}

          {groupedRates.map((group) => (
            <Card key={group.supplier_id || "direct"} className="overflow-hidden border-border/50 shadow-sm">
              <div className="bg-card px-4 py-3 border-b flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  {group.is_direct ? <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-500" /> : <Store className="w-4 h-4 text-amber-600 dark:text-amber-500" />}
                </div>
                <h3 className="font-bold text-lg">{lang === "ar" ? group.name_ar : group.name_en}</h3>
                {group.is_direct && <Badge variant="secondary" className="mr-auto text-xs bg-secondary">مصدر رئيسي</Badge>}
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground text-center border-b">
                        <th className="py-3 px-4 font-medium text-start">الغرفة</th>
                        <th className="py-3 px-4 font-medium">الإطلالة</th>
                        <th className="py-3 px-4 font-medium">خطة الوجبات</th>
                        <th className="py-3 px-4 font-medium">سعر الليلة</th>
                        <th className="py-3 px-4 font-medium w-32">العدد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {group.rates.map(rate => {
                        const isSelected = selected[rate.id]?.selected || false;
                        const qty = selected[rate.id]?.quantity || "";
                        const price = rate.selling_price || rate.cost_per_night;

                        return (
                          <tr key={rate.id} className={cn("hover:bg-muted/50 transition-colors", isSelected && "bg-amber-50 dark:bg-amber-900/20")}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={isSelected} 
                                  onCheckedChange={(c) => handleToggle(rate.id, !!c)} 
                                  className={cn("data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600")}
                                />
                                <span className={cn("font-medium", isSelected ? "text-amber-900 dark:text-amber-200" : "")}>
                                  {lang === "ar" ? rate.room?.name_ar : rate.room?.name_en}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {rate.view ? (lang === "ar" ? rate.view.name_ar : rate.view.name_en) : "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="outline" className="font-normal bg-background">
                                {t(`board.${rate.meal_plan}`)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-amber-700 dark:text-amber-500 font-bold">{price} {rate.currency}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                type="number"
                                min={1}
                                value={qty}
                                onChange={(e) => handleQuantity(rate.id, parseInt(e.target.value) || 0)}
                                className={cn("h-9 text-center", isSelected ? "border-amber-300 dark:border-amber-700 focus-visible:ring-amber-500" : "")}
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-6 border-t bg-background flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">إضافة الأسعار المحددة</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
