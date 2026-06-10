import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import {
  useHotelsLite, useSuppliersLite, useCurrencies,
  useHotelRoomTypes, useHotelViews, useSupplierContracts,
} from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

const schema = z.object({
  hotel_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  contract_id: z.string().uuid().optional().or(z.literal("")),
  room_type_id: z.string().uuid(),
  view_id: z.string().uuid().optional().or(z.literal("")),
  meal_plan: z.enum(BOARDS),
  currency: z.string().length(3),
  valid_from: z.string().min(1),
  valid_to: z.string().min(1),
  cost_per_night: z.coerce.number().nonnegative(),
  selling_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  markup_pct: z.coerce.number().min(0).max(500).optional().or(z.literal("")),
  min_nights: z.coerce.number().int().min(1),
  max_nights: z.coerce.number().int().min(1).optional().or(z.literal("")),
  release_days: z.coerce.number().int().min(0),
  allotment: z.coerce.number().int().min(0).optional().or(z.literal("")),
  notes_en: z.string().max(2000).optional().or(z.literal("")),
  notes_ar: z.string().max(2000).optional().or(z.literal("")),
  cancellation_policy_en: z.string().max(4000).optional().or(z.literal("")),
  cancellation_policy_ar: z.string().max(4000).optional().or(z.literal("")),
}).refine((v) => new Date(v.valid_to) >= new Date(v.valid_from), {
  path: ["valid_to"], message: "valid_to >= valid_from",
});

type FormVals = z.input<typeof schema>;

export function RateForm({ initial, onSaved }: { initial?: any; onSaved: (id: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();
  const currencies = useCurrencies();

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotel_id: initial?.hotel_id ?? "",
      supplier_id: initial?.supplier_id ?? "",
      contract_id: initial?.contract_id ?? "",
      room_type_id: initial?.room_type_id ?? "",
      view_id: initial?.view_id ?? "",
      meal_plan: initial?.meal_plan ?? "BB",
      currency: initial?.currency ?? "USD",
      valid_from: initial?.valid_from ?? "",
      valid_to: initial?.valid_to ?? "",
      cost_per_night: initial?.cost_per_night ?? 0,
      selling_price: initial?.selling_price ?? "",
      markup_pct: initial?.markup_pct ?? "",
      min_nights: initial?.min_nights ?? 1,
      max_nights: initial?.max_nights ?? "",
      release_days: initial?.release_days ?? 0,
      allotment: initial?.allotment ?? "",
      notes_en: initial?.notes_en ?? "",
      notes_ar: initial?.notes_ar ?? "",
      cancellation_policy_en: initial?.cancellation_policy_en ?? "",
      cancellation_policy_ar: initial?.cancellation_policy_ar ?? "",
    },
  });

  const hotelId = form.watch("hotel_id");
  const supplierId = form.watch("supplier_id");
  const roomTypes = useHotelRoomTypes(hotelId || null);
  const views = useHotelViews(hotelId || null);
  const contracts = useSupplierContracts(supplierId || null);

  const mut = useMutation({
    mutationFn: async (vals: FormVals) => {
      const clean: any = { ...vals };
      ["contract_id", "view_id", "selling_price", "markup_pct", "max_nights", "allotment",
       "notes_en", "notes_ar", "cancellation_policy_en", "cancellation_policy_ar"].forEach((k) => {
        if (clean[k] === "" || clean[k] === undefined) clean[k] = null;
      });
      if (initial?.id) {
        const { error } = await supabase.from("rates").update(clean).eq("id", initial.id);
        if (error) throw error;
        return initial.id as string;
      } else {
        const { data, error } = await supabase
          .from("rates").insert({ ...clean, code: "", status: "draft" }).select("id").single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rates"] });
      qc.invalidateQueries({ queryKey: ["rate", id] });
      onSaved(id);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
            <FormField control={form.control} name="hotel_id" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.hotel")} *</FormLabel>
                <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("room_type_id", ""); form.setValue("view_id", ""); }}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {hotels.data?.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="supplier_id" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.supplier")} *</FormLabel>
                <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("contract_id", ""); }}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {suppliers.data?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="contract_id" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.contract")}</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange} disabled={!supplierId}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {contracts.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.contract_number} · {c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="room_type_id" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.room_type")} *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={!hotelId}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {roomTypes.data?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="view_id" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.view")}</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange} disabled={!hotelId}>
                  <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {views.data?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{lang === "ar" ? (v.name_ar || v.name_en) : (v.name_en || v.name_ar)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="meal_plan" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.meal_plan")} *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {BOARDS.map((b) => <SelectItem key={b} value={b}>{t(`board.${b}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currency" render={({ field }) => (
              <FormItem><FormLabel>{t("label.currency")} *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {currencies.data?.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="valid_from" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.valid_from")} *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="valid_to" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.valid_to")} *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
            <FormField control={form.control} name="cost_per_night" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cost")} *</FormLabel><FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="selling_price" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.selling")}</FormLabel><FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="markup_pct" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.markup")}</FormLabel><FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="release_days" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.release_days")} *</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="min_nights" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.min_nights")} *</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="max_nights" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.max_nights")}</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="allotment" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.allotment")}</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <FormField control={form.control} name="notes_en" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.notes_en")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notes_ar" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.notes_ar")}</FormLabel><FormControl><Textarea rows={3} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cancellation_policy_en" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cxl_en")}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cancellation_policy_ar" render={({ field }) => (
              <FormItem><FormLabel>{t("rates.cxl_ar")}</FormLabel><FormControl><Textarea rows={3} dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={mut.isPending}>{mut.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </div>
      </form>
    </Form>
  );
}
