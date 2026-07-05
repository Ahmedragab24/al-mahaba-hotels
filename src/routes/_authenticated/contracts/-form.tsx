import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useMutation } from "@/store/queryBridge";
import { dbErrorMessage } from "@/store/queryBridge";
import { useHotelsLite, useSuppliersLite, useCurrencies } from "@/lib/lookups";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CONTRACT_TYPES = ["allotment", "free_sale", "on_request", "commitment", "other"] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

export function ContractForm({ initial, onSaved }: { initial?: any; onSaved?: () => void }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const suppliers = useSuppliersLite();
  const hotels = useHotelsLite();
  const currencies = useCurrencies();
  const isEdit = !!initial?.id;
  const [v, setV] = useState<any>(initial ?? { contract_type: "allotment", commission_type: "percentage", credit_days: 0 });

  const save = useMutation({
    mutationFn: async () => {
      if (!v.supplier_id) throw new Error(`${t("contracts.supplier")}: ${t("label.required")}`);
      if (!v.start_date || !v.end_date) throw new Error(`${t("contracts.period")}: ${t("label.required")}`);
      if (v.end_date < v.start_date) throw new Error(t("contracts.err_overlap_dates", "End date must be after start date"));
      const payload: any = {
        supplier_id: v.supplier_id,
        hotel_id: v.hotel_id || null,
        title: v.title?.trim() || null,
        contract_type: v.contract_type ?? "allotment",
        start_date: v.start_date,
        end_date: v.end_date,
        currency: v.currency || null,
        commission_type: v.commission_type ?? "percentage",
        commission_pct: v.commission_pct !== "" && v.commission_pct != null ? Number(v.commission_pct) : null,
        credit_days: Number(v.credit_days ?? 0),
        payment_terms: v.payment_terms?.trim() || null,
        cancellation_terms: v.cancellation_terms?.trim() || null,
        notes: v.notes?.trim() || null,
      };
      if (payload.commission_type === "percentage" && payload.commission_pct != null && (payload.commission_pct < 0 || payload.commission_pct > 100)) {
        throw new Error(t("taxes.err_pct"));
      }
      if (isEdit) {
        await apiClient.supplierContracts.update(initial.id, payload as any);
        return initial.id as string;
      } else {
        const u = { user: { id: getCurrentUserId() } };
        payload.contract_number = "";
        payload.status = "draft";
        payload.created_by = u.user?.id ?? null;
        const data = await apiClient.supplierContracts.create(payload as any);
        return data.id as string;
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      if (onSaved) onSaved();
      else navigate(`/contracts/${id}`);
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={`${t("contracts.supplier")} *`}>
            <Select value={v.supplier_id ?? ""} onValueChange={(x) => setV({ ...v, supplier_id: x })}>
              <SelectTrigger><SelectValue placeholder={t("contracts.supplier")} /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray(suppliers.data) ? suppliers.data : [])?.map((s: any) => <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("contracts.hotel")}>
            <Select value={v.hotel_id ?? ""} onValueChange={(x) => setV({ ...v, hotel_id: x })}>
              <SelectTrigger><SelectValue placeholder={t("contracts.hotel")} /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data) ? hotels.data : [])?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("contracts.type")}>
            <Select value={v.contract_type ?? "allotment"} onValueChange={(x) => setV({ ...v, contract_type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((c) => <SelectItem key={c} value={c}>{t(`ctrtype.${c}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("contracts.name")}><Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label={`${t("label.start_date")} *`}><Input type="date" value={v.start_date ?? ""} onChange={(e) => setV({ ...v, start_date: e.target.value })} /></Field>
          <Field label={`${t("label.end_date")} *`}><Input type="date" value={v.end_date ?? ""} onChange={(e) => setV({ ...v, end_date: e.target.value })} /></Field>
          <Field label={t("label.currency")}>
            <Select value={v.currency ?? ""} onValueChange={(x) => setV({ ...v, currency: x })}>
              <SelectTrigger><SelectValue placeholder={t("label.currency")} /></SelectTrigger>
              <SelectContent>
                {(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("contracts.commission_type")}>
            <Select value={v.commission_type ?? "percentage"} onValueChange={(x) => setV({ ...v, commission_type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t("calc.percentage")}</SelectItem>
                <SelectItem value="fixed">{t("calc.fixed")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={v.commission_type === "fixed" ? t("label.tax_value") : t("label.commission_pct")}>
            <Input type="number" step="0.01" min={0} value={v.commission_pct ?? ""} onChange={(e) => setV({ ...v, commission_pct: e.target.value })} />
          </Field>
          <Field label={t("label.credit_days")}><Input type="number" min={0} value={v.credit_days ?? 0} onChange={(e) => setV({ ...v, credit_days: e.target.value })} /></Field>
          <Field label={t("label.payment_terms")}><Input value={v.payment_terms ?? ""} onChange={(e) => setV({ ...v, payment_terms: e.target.value })} /></Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("label.penalty_type")}><Textarea rows={2} value={v.cancellation_terms ?? ""} onChange={(e) => setV({ ...v, cancellation_terms: e.target.value })} /></Field>
          <Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => (onSaved ? onSaved() : navigate("/contracts"))}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
