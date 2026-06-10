import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";

export function BookingForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const [form, setForm] = useState({
    customer_id: initial?.customer_id ?? "",
    currency: initial?.currency ?? "SAR",
    booking_date: initial?.booking_date ?? new Date().toISOString().slice(0, 10),
    special_requests: initial?.special_requests ?? "",
    notes: initial?.notes ?? "",
  });

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar,customer_type").is("deleted_at", null).order("name_en")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("bk.customer") + " *");
      const payload: any = {
        customer_id: form.customer_id,
        currency: (form.currency || "SAR").toUpperCase(),
        booking_date: form.booking_date,
        special_requests: form.special_requests || null,
        notes: form.notes || null,
      };
      if (initial?.id) {
        const { error } = await supabase.from("bookings").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("bookings").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => { toast.success(t("toast.saved")); onSaved(id); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm">{t("bk.customer")} *</label>
          <Select value={form.customer_id} onValueChange={(v) => set("customer_id", v)}>
            <SelectTrigger><SelectValue placeholder={t("bk.customer")} /></SelectTrigger>
            <SelectContent>
              {customers.data?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {(lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar))} — {t(`ctype.${c.customer_type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("label.currency")}</label>
          <Input value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))} dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("bk.booking_date")}</label>
          <Input type="date" value={form.booking_date} onChange={(e) => set("booking_date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("bk.special_requests")}</label>
          <Input value={form.special_requests} onChange={(e) => set("special_requests", e.target.value)} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm">{t("label.notes")}</label>
          <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
