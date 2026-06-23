import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useHotelsLite, useHotelViews } from "@/lib/lookups";
import { dbErrorMessage } from "@/lib/db-errors";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

export function RoomTypeDialog({ open, onOpenChange, initial, onSaved, fixedHotelId }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: any; onSaved: () => void; fixedHotelId?: string;
}) {
  const { t, lang } = useI18n();
  const hotels = useHotelsLite();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;

  const views = useHotelViews(v.hotel_id || null);

  const save = useMutation({
    mutationFn: async () => {
      if (!v.hotel_id) throw new Error(`${t("room_types.hotel")}: ${t("label.required")}`);
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: v.hotel_id,
        code: v.code?.trim() || "",
        name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        bed_type: v.bed_type?.trim() || null,
        view_name: v.view_name?.trim() || null,
      };
      if (!isEdit) {
        payload.max_adults = 2;
        payload.max_children = 0;
        payload.max_occupancy = 2;
        payload.smoking_allowed = false;
        payload.is_active = true;
        payload.sort_order = 0;
      }
      if (isEdit) {
        const { error } = await supabase.from("hotel_room_types").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id ?? null;
        const { error } = await supabase.from("hotel_room_types").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? (fixedHotelId ? { hotel_id: fixedHotelId } : {})); }}>
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
                <Select value={v.hotel_id ?? ""} onValueChange={(x) => setV({ ...v, hotel_id: x, view_id: null })} disabled={isEdit}>
                  <SelectTrigger className="h-10"><SelectValue placeholder={t("room_types.hotel")} /></SelectTrigger>
                  <SelectContent>
                    {hotels.data?.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label={t("label.code")}>
              <Input
                className="h-10 font-mono"
                dir="ltr"
                value={v.code ?? ""}
                onChange={(e) => setV({ ...v, code: e.target.value })}
                placeholder="RT-00001 (auto)"
              />
            </Field>

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
                value={v.view_name ?? ""}
                onChange={(e) => setV({ ...v, view_name: e.target.value })}
                placeholder={lang === "ar" ? "أدخل الإطلالة (مثال: إطلالة على البحر)" : "Enter view (e.g. Sea View)"}
              />
            </Field>

            <Field label={lang === "ar" ? "نوع الغرفة" : "Room Type"}>
              <Select value={v.bed_type ?? ""} onValueChange={(x) => setV({ ...v, bed_type: x })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={lang === "ar" ? "اختر نوع الغرفة" : "Select room type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{lang === "ar" ? "أحادي" : "Single"}</SelectItem>
                  <SelectItem value="double">{lang === "ar" ? "ثنائي" : "Double"}</SelectItem>
                  <SelectItem value="triple">{lang === "ar" ? "ثلاثي" : "Triple"}</SelectItem>
                  <SelectItem value="quadruple">{lang === "ar" ? "رباعي" : "Quadruple"}</SelectItem>
                  <SelectItem value="quintuple">{lang === "ar" ? "خماسي" : "Quintuple"}</SelectItem>
                  <SelectItem value="sextuple">{lang === "ar" ? "سداسي" : "Sextuple"}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
