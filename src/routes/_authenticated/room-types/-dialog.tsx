import { useState, useEffect } from "react";
import { apiClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useHotels, useHotelViews } from "@/lib/lookups";
import { dbErrorMessage } from "@/store/queryBridge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCreateRoomMutation, useUpdateRoomMutation } from "@/store/services/rooms/roomsService";
import { useGetRoomTypesQuery } from "@/store/services/attributes/room-types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

export function RoomTypeDialog({ open, onOpenChange, initial, onSaved, fixedHotelId }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: any; onSaved: () => void; fixedHotelId?: string;
}) {
  const { t, lang } = useI18n();
  const hotels = useHotels({}, { refetchInterval: 2000 });
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const { token } = useAuth();

  const views = useHotelViews(v.hotel_id || null);

  const { data: roomTypesData } = useGetRoomTypesQuery(
    v.hotel_id ? { hotel_id: v.hotel_id } : undefined,
    { skip: !v.hotel_id, pollingInterval: 2000 }
  );

  const roomTypes = Array.isArray(roomTypesData)
    ? roomTypesData
    : Array.isArray(roomTypesData?.data)
      ? roomTypesData.data
      : [];

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setV(initial ?? (fixedHotelId ? { hotel_id: fixedHotelId } : {}));
    }
  }, [open, initial, fixedHotelId]);

  const handleSave = async () => {
    if (!v.hotel_id) {
      toast.error(`${t("room_types.hotel")}: ${t("label.required")}`);
      return;
    }
    if (!v.name_en?.trim() || !v.name_ar?.trim()) {
      toast.error(t("label.required"));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name_ar", v.name_ar.trim());
      formData.append("name_en", v.name_en.trim());
      formData.append("view", v.view?.trim() || v.view_name?.trim() || "");
      formData.append("hotel_id", String(v.hotel_id));
      formData.append("room_type_id", String(v.room_type_id));

      const statusValue = (v.status === undefined || v.status === true || v.status === 1 || v.status === "1") ? "1" : "0";
      formData.append("status", statusValue);

      if (isEdit) {
        await updateRoom({ id: initial.id, body: formData }).unwrap();
        toast.success(t("toast.updated"));
      } else {
        await createRoom(formData).unwrap();
        toast.success(t("toast.created"));
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(dbErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEdit ? t("room_types.edit") : t("room_types.new")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* General Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {!fixedHotelId && (
              <Field label={`${t("room_types.hotel")} *`}>
                <Select value={v.hotel_id?.toString() ?? ""} onValueChange={(x) => setV({ ...v, hotel_id: x, view_id: null })} disabled={isEdit}>
                  <SelectTrigger className="h-10"><SelectValue placeholder={t("room_types.hotel")} /></SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => (
                      <SelectItem key={h.id} value={h.id.toString()}>
                        {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}


            <Field label={`${t("label.name_ar")} *`}>
              <Input
                className="h-10"
                dir="rtl"
                value={v.name_ar ?? ""}
                onChange={(e) => setV({ ...v, name_ar: e.target.value })}
              />
            </Field>

            <Field label={`${t("label.name_en")} *`}>
              <Input
                className="h-10"
                dir="ltr"
                value={v.name_en ?? ""}
                onChange={(e) => setV({ ...v, name_en: e.target.value })}
              />
            </Field>

            <Field label={t("label.view")}>
              <Input
                className="h-10"
                value={v.view ?? ""}
                onChange={(e) => setV({ ...v, view: e.target.value })}
                placeholder={lang === "ar" ? "أدخل الإطلالة (مثال: إطلالة على البحر)" : "Enter view (e.g. Sea View)"}
              />
            </Field>

            <Field label={lang === "ar" ? "نوع الغرفة" : "Room Type"}>
              <Select value={v.room_type_id?.toString() ?? ""} onValueChange={(x) => setV({ ...v, room_type_id: x })} disabled={!v.hotel_id}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={lang === "ar" ? "اختر نوع الغرفة" : "Select room type"} />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt: any) => (
                    <SelectItem key={rt.id} value={rt.id.toString()}>
                      {lang === "ar" ? (rt.name_ar || rt.name_en) : (rt.name_en || rt.name_ar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={lang === "ar" ? "الحالة" : "Status"}>
              <Select
                value={v.status !== undefined ? (v.status ? "1" : "0") : "1"}
                onValueChange={(x) => setV({ ...v, status: x === "1" })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={lang === "ar" ? "اختر الحالة" : "Select Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{lang === "ar" ? "نشط" : "Active"}</SelectItem>
                  <SelectItem value="0">{lang === "ar" ? "غير نشط" : "Inactive"}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={handleSave} disabled={isPending}>{isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
