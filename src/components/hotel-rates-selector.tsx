import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuotationRatesDialog, SelectedRate } from "@/components/quotation-rates-dialog";

interface HotelRatesSelectorProps {
  hotelId: string;
  currencyId: string;
  currencyCode?: string;
  selectedItems: SelectedRate[];
  onChange: (items: SelectedRate[]) => void;
  nights?: number;
  groupSize?: string | number;
}

export function HotelRatesSelector({ hotelId, currencyId, currencyCode, selectedItems, onChange, nights = 1, groupSize = 1 }: HotelRatesSelectorProps) {
  const { t, lang } = useI18n();
  const [ratesDialogOpen, setRatesDialogOpen] = useState(false);
  const parsedGroupSize = Number(groupSize) || 1;

  const arLabel = (ar: string, en: string) => (lang === "ar" ? ar : en);

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
        <div className="border border-slate-200 dark:border-border/60 rounded-2xl bg-slate-50/50 dark:bg-card shadow-sm p-6 space-y-10">
          {groupedSelectedItems.map((group) => (
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
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          مصدر رئيسي
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50">
                        {nights} {lang === "ar" ? "ليالي" : "Nights"}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/50">
                        {parsedGroupSize} {lang === "ar" ? "أشخاص" : "Persons"}
                      </Badge>
                    </div>
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
                      <th className="pb-4 px-4 font-normal w-32">{lang === "ar" ? "عدد الغرف" : "Rooms Quantity"}</th>
                      <th className="pb-4 px-4 font-normal">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-600 border border-amber-600 dark:border-amber-600 text-white">
                              <svg
                                width="12"
                                height="12"
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
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {lang === "ar" ? item.room_name_ar : item.room_name_en}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-medium text-slate-600 dark:text-slate-300">
                            <span>
                              {(() => {
                                const nameAr = item.room_type_name_ar || item.room_type?.name_ar || item.room?.room_type?.name_ar || item.room_type?.name || item.room?.room_type?.name;
                                const nameEn = item.room_type_name_en || item.room_type?.name_en || item.room?.room_type?.name_en || item.room_type?.name || item.room?.room_type?.name;
                                return lang === "ar" ? nameAr || nameEn || "—" : nameEn || nameAr || "—";
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                            {(item.view_id || item.view_name_ar || item.view_name_en || item.room?.view) && <MapPin className="w-3.5 h-3.5 text-amber-600" />}
                            <span>
                              {(() => {
                                const vAr = item.view_name_ar || item.room?.view || "";
                                const vEn = item.view_name_en || item.room?.view || "";
                                return lang === "ar" ? vAr || vEn || "—" : vEn || vAr || "—";
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-medium bg-slate-50 dark:bg-slate-800/50 py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300 mx-auto w-fit min-w-[100px]">
                            {t(`board.${item.meal_plan}`, item.meal_plan || "—")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-medium bg-slate-50 dark:bg-slate-800/50 py-2.5 px-4 rounded-xl text-amber-600 dark:text-amber-500 mx-auto w-fit min-w-[100px]">
                            {item.selling_price} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-bold bg-slate-50 dark:bg-slate-800/50 text-amber-600 dark:text-amber-500 py-2 px-6 rounded-xl mx-auto w-fit h-10 flex items-center justify-center">
                            {item.rooms}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="font-bold text-amber-600 dark:text-amber-500">
                            {item.selling_price * item.rooms * (nights || 1)} {lang === "ar" ? "ريال" : String(currencyCode || "")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setRatesDialogOpen(true);
              }}
              className="bg-[#B48443] hover:bg-[#A37332] text-white border-transparent hover:text-white px-8"
            >
              تعديل
            </Button>
          </div>
        </div>
      )}

      <QuotationRatesDialog
        open={ratesDialogOpen}
        onOpenChange={setRatesDialogOpen}
        hotelId={hotelId}
        initialSelected={selectedItems}
        onSave={onChange}
        nights={nights}
        groupSize={parsedGroupSize}
      />
    </div>
  );
}
