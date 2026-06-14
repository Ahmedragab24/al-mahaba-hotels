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
import { Label } from "@/components/ui/label";

type Props = {
  initial?: any;
  onSaved: (id: string) => void;
};

export function QuotationForm({ initial, onSaved }: Props) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const [form, setForm] = useState({
    customer_id: initial?.customer_id ?? "",
    currency: initial?.currency ?? "SAR",
    quotation_date: initial?.quotation_date ?? new Date().toISOString().slice(0, 10),
    travel_date: initial?.travel_date ?? "",
    expiry_date: initial?.expiry_date ?? "",
    notes: initial?.notes ?? "",
  });

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar,customer_type").is("deleted_at", null).order("name_en")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("quotes.customer") + " *");
      if (!form.expiry_date) throw new Error(t("quotes.expiry_date") + " *");
      const payload: any = {
        customer_id: form.customer_id,
        currency: form.currency || "SAR",
        quotation_date: form.quotation_date,
        travel_date: form.travel_date || null,
        expiry_date: form.expiry_date,
        notes: form.notes || null,
      };
      if (initial?.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("quotations").insert(payload).select("id").single();
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
        <div className="flex flex-col gap-2">
          <Label>{t("quotes.customer")} *</Label>
          <Select value={form.customer_id} onValueChange={(v) => set("customer_id", v)}>
            <SelectTrigger><SelectValue placeholder={t("quotes.customer")} /></SelectTrigger>
            <SelectContent>
              {customers.data?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {(lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar))} — {t(`ctype.${c.customer_type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("label.currency")} *</Label>
          <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
            <SelectTrigger><SelectValue placeholder={t("label.currency")} /></SelectTrigger>
            <SelectContent>
              {["SAR", "USD", "EUR"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("quotes.quotation_date")} *</Label>
          <Input type="datetime-local" value={form.quotation_date} onChange={(e) => set("quotation_date", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t("quotes.expiry_date")} *</Label>
          <Input type="datetime-local" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <Label>{t("label.notes")}</Label>
          <Textarea className="min-h-[120px]" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
