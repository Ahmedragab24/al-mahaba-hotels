import { useState } from "react";
import { db } from "@/store/queryBridge";
import { getCurrentUserId } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useMutation } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useHotels, useCurrencies } from "@/lib/lookups";
import { dbErrorMessage } from "@/store/queryBridge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const TAX_TYPES = ["vat", "municipality_fee", "tourism_fee", "service_charge", "resort_fee", "custom"] as const;
export const APPLY_SCOPES = ["per_room", "per_night", "per_person", "per_stay"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

export function TaxDialog({ open, onOpenChange, initial, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void; initial?: any; onSaved: () => void;
}) {
  const { t, lang } = useI18n();
  const hotels = useHotels();
  const currencies = useCurrencies();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!v.hotel_id) throw new Error(`${t("filter.hotel")}: ${t("label.required")}`);
      if (!v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const value = Number(v.value ?? 0);
      if (v.calc_method === "percentage" && value > 100) throw new Error(t("taxes.err_pct"));
      if (v.calc_method === "fixed" && !v.currency) throw new Error(t("taxes.err_currency"));
      if (v.expiry_date && v.effective_date && v.expiry_date < v.effective_date) throw new Error(t("taxes.err_dates"));
      const payload: any = {
        hotel_id: v.hotel_id,
        name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        tax_type: v.tax_type ?? "vat",
        calc_method: v.calc_method ?? "percentage",
        value,
        currency: v.calc_method === "fixed" ? v.currency : null,
        apply_scope: v.apply_scope ?? "per_stay",
        is_inclusive: !!v.is_inclusive,
        effective_date: v.effective_date || null,
        expiry_date: v.expiry_date || null,
        is_active: v.is_active ?? true,
        notes: v.notes?.trim() || null,
      };
      if (isEdit) {
        const { error } = await (db.from("hotel_taxes") as any).update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const data = { user: { id: getCurrentUserId() } };
        payload.created_by = data?.user?.id ?? null;
        const { error } = await (db.from("hotel_taxes") as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { tax_type: "vat", calc_method: "percentage", apply_scope: "per_stay", is_active: true, is_inclusive: false, value: 0 }); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? t("taxes.edit") : t("taxes.new")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("filter.hotel")} *`}>
            <Select value={v.hotel_id ?? ""} onValueChange={(x) => setV({ ...v, hotel_id: x })} disabled={isEdit}>
              <SelectTrigger><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("label.tax_type")}>
            <Select value={v.tax_type ?? "vat"} onValueChange={(x) => setV({ ...v, tax_type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TAX_TYPES.map((x) => <SelectItem key={x} value={x}>{t(`taxtype.${x}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <Field label={t("taxes.calc_method")}>
            <Select value={v.calc_method ?? "percentage"} onValueChange={(x) => setV({ ...v, calc_method: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t("calc.percentage")}</SelectItem>
                <SelectItem value="fixed">{t("calc.fixed")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={`${t("label.tax_value")} *`}><Input type="number" step="0.01" min={0} value={v.value ?? 0} onChange={(e) => setV({ ...v, value: e.target.value })} /></Field>
          {v.calc_method === "fixed" && (
            <Field label={`${t("label.currency")} *`}>
              <Select value={v.currency ?? ""} onValueChange={(x) => setV({ ...v, currency: x })}>
                <SelectTrigger><SelectValue placeholder={t("label.currency")} /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label={t("taxes.apply_scope")}>
            <Select value={v.apply_scope ?? "per_stay"} onValueChange={(x) => setV({ ...v, apply_scope: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APPLY_SCOPES.map((x) => <SelectItem key={x} value={x}>{t(`scope.${x}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("taxes.effective_date")}><Input type="date" value={v.effective_date ?? ""} onChange={(e) => setV({ ...v, effective_date: e.target.value })} /></Field>
          <Field label={t("taxes.expiry_date")}><Input type="date" value={v.expiry_date ?? ""} onChange={(e) => setV({ ...v, expiry_date: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm self-end">
            <Checkbox checked={!!v.is_inclusive} onCheckedChange={(x) => setV({ ...v, is_inclusive: !!x })} />{t("label.inclusive")}
          </label>
          <label className="flex items-center gap-2 text-sm self-end">
            <Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}
          </label>
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
