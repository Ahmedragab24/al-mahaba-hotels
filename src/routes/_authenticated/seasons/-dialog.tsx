import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { dbErrorMessage } from "@/lib/db-errors";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const SEASON_TYPES = ["low", "high", "peak", "ramadan", "eid", "hajj", "new_year", "custom"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

export function SeasonDialog({ open, onOpenChange, initial, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: any; onSaved: () => void;
}) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      if (!v.start_date || !v.end_date) throw new Error(`${t("label.start_date")} / ${t("label.end_date")}: ${t("label.required")}`);
      if (v.end_date < v.start_date) throw new Error(t("seasons.err_overlap"));
      const payload: any = {
        name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        season_type: v.season_type ?? "custom",
        start_date: v.start_date, end_date: v.end_date,
        is_active: v.is_active ?? true,
        notes: v.notes?.trim() || null,
      };
      if (isEdit) {
        const { error } = await supabase.from("seasons").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id ?? null;
        const { error } = await supabase.from("seasons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { season_type: "high", is_active: true }); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{isEdit ? t("seasons.edit") : t("seasons.new")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <Field label={t("seasons.type")}>
            <Select value={v.season_type ?? "high"} onValueChange={(x) => setV({ ...v, season_type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEASON_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`season_type.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm self-end">
            <Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}
          </label>
          <Field label={`${t("label.start_date")} *`}><Input type="date" value={v.start_date ?? ""} onChange={(e) => setV({ ...v, start_date: e.target.value })} /></Field>
          <Field label={`${t("label.end_date")} *`}><Input type="date" value={v.end_date ?? ""} onChange={(e) => setV({ ...v, end_date: e.target.value })} /></Field>
          <div className="md:col-span-2">
            <Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
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
