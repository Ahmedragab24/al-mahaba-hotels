import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";

type Props = {
  initial?: any;
  onSaved: (id: string) => void;
};

export function RfqForm({ initial, onSaved }: Props) {
  const { t } = useI18n();
  const auth = useAuth();
  const [form, setForm] = useState({
    destination: initial?.destination ?? "",
    travel_start: initial?.travel_start ?? "",
    travel_end: initial?.travel_end ?? "",
    currency: initial?.currency ?? "SAR",
    notes: initial?.notes ?? "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      if (!form.travel_start || !form.travel_end) throw new Error(t("rfq.travel_start") + " *");
      if (form.travel_end < form.travel_start) throw new Error(t("rfq.err_item_dates"));
      const payload: any = {
        destination: form.destination || null,
        travel_start: form.travel_start,
        travel_end: form.travel_end,
        currency: form.currency || "SAR",
        notes: form.notes || null,
      };
      if (initial?.id) {
        const { error } = await supabase.from("rfqs").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("rfqs").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => { toast.success(t("toast.saved")); onSaved(id); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Card>
      <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.destination")}</label>
          <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("label.currency")}</label>
          <Input value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))} dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.travel_start")} *</label>
          <Input type="date" value={form.travel_start} onChange={(e) => set("travel_start", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.travel_end")} *</label>
          <Input type="date" value={form.travel_end} onChange={(e) => set("travel_end", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <label className="text-sm">{t("label.notes")}</label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 text-xs text-muted-foreground">
          {t("rfq.suppliers_hint", "بعد الحفظ، اختر الموردين من تبويب \"الموردون\" لإرسال طلب السعر إليهم.")}
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
