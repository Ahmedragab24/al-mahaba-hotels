import { useState } from "react";
import { apiClient } from "@/store/queryBridge";
import { useMutation } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule } from "@/lib/auth-utils";
import { useCurrencies } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dbErrorMessage } from "@/store/queryBridge";
import { toast } from "sonner";

type Props = {
  initial?: any;
  onSaved: (id: string) => void;
};

export function RfqForm({ initial, onSaved }: Props) {
  const { t } = useI18n();
  const auth = useSelector(selectAuth);
  const currencies = useCurrencies();
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
        await apiClient.rfqs.update(initial.id, payload);
        return initial.id as string;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const data = await apiClient.rfqs.create(payload);
        return data.id as string;
      }
    },
    onSuccess: (id) => { toast.success(t("toast.saved")); onSaved(id); },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  return (
    <Card>
      <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.destination")}</label>
          <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("label.currency")}</label>
          <Select value={form.currency} onValueChange={(val) => set("currency", val)}>
            <SelectTrigger className="w-full"><SelectValue placeholder={t("label.currency")} /></SelectTrigger>
            <SelectContent>
              {(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.travel_start")} *</label>
          <Input type="date" value={form.travel_start} onChange={(e) => set("travel_start", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">{t("rfq.travel_end")} *</label>
          <Input type="date" value={form.travel_end} onChange={(e) => set("travel_end", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm">{t("label.notes")}</label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
        <div className="text-xs text-muted-foreground sm:col-span-2">
          {t("rfq.suppliers_hint", "بعد الحفظ، اختر الموردين من تبويب \"الموردون\" لإرسال طلب السعر إليهم.")}
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
