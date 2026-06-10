import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useHotelsLite } from "@/lib/lookups";
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

export function RoomTypeDialog({ open, onOpenChange, initial, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: any; onSaved: () => void;
}) {
  const { t, lang } = useI18n();
  const hotels = useHotelsLite();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!v.hotel_id) throw new Error(`${t("room_types.hotel")}: ${t("label.required")}`);
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const adults = Number(v.max_adults ?? 2);
      const children = Number(v.max_children ?? 0);
      const maxOcc = Number(v.max_occupancy ?? adults);
      if (maxOcc < adults || maxOcc > adults + children) throw new Error(t("room_types.err_occupancy"));
      const payload: any = {
        hotel_id: v.hotel_id,
        code: v.code?.trim() || "",
        name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        max_adults: adults, max_children: children, max_occupancy: maxOcc,
        bed_type: v.bed_type?.trim() || null,
        size_sqm: v.size_sqm !== "" && v.size_sqm != null ? Number(v.size_sqm) : null,
        smoking_allowed: !!v.smoking_allowed,
        description_en: v.description_en?.trim() || null,
        description_ar: v.description_ar?.trim() || null,
        is_active: v.is_active ?? true,
        sort_order: Number(v.sort_order ?? 0),
      };
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
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { max_adults: 2, max_children: 0, max_occupancy: 2, is_active: true, smoking_allowed: false, sort_order: 0 }); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? t("room_types.edit") : t("room_types.new")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("room_types.hotel")} *`}>
            <Select value={v.hotel_id ?? ""} onValueChange={(x) => setV({ ...v, hotel_id: x })} disabled={isEdit}>
              <SelectTrigger><SelectValue placeholder={t("room_types.hotel")} /></SelectTrigger>
              <SelectContent>
                {hotels.data?.map((h) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("label.code")}><Input dir="ltr" value={v.code ?? ""} onChange={(e) => setV({ ...v, code: e.target.value })} placeholder="RT-00001 (auto)" /></Field>
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <Field label={t("label.max_adults")}><Input type="number" min={1} value={v.max_adults ?? 2} onChange={(e) => setV({ ...v, max_adults: e.target.value })} /></Field>
          <Field label={t("label.max_children")}><Input type="number" min={0} value={v.max_children ?? 0} onChange={(e) => setV({ ...v, max_children: e.target.value })} /></Field>
          <Field label={t("label.max_occupancy")}><Input type="number" min={1} value={v.max_occupancy ?? 2} onChange={(e) => setV({ ...v, max_occupancy: e.target.value })} /></Field>
          <Field label={t("label.bed_type")}><Input value={v.bed_type ?? ""} onChange={(e) => setV({ ...v, bed_type: e.target.value })} /></Field>
          <Field label={t("label.size_sqm")}><Input type="number" step="0.01" min={0} value={v.size_sqm ?? ""} onChange={(e) => setV({ ...v, size_sqm: e.target.value })} /></Field>
          <Field label={t("label.sort_order")}><Input type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm self-end">
            <Checkbox checked={!!v.smoking_allowed} onCheckedChange={(x) => setV({ ...v, smoking_allowed: !!x })} />{t("room_types.smoking")}
          </label>
          <label className="flex items-center gap-2 text-sm self-end">
            <Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}
          </label>
          <Field label={t("room_types.desc_en")}><Textarea rows={2} dir="ltr" value={v.description_en ?? ""} onChange={(e) => setV({ ...v, description_en: e.target.value })} /></Field>
          <Field label={t("room_types.desc_ar")}><Textarea rows={2} dir="rtl" value={v.description_ar ?? ""} onChange={(e) => setV({ ...v, description_ar: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
