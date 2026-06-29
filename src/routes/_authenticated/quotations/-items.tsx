// Quotation Items tab — cascading Hotel → Contract → Room Type (rate) → Season → Occupancy → Pricing
import { useMemo, useState } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { OCCUPANCY_TYPES } from "../rates/-occupancy";

type ItemForm = {
  id?: string;
  hotel_id: string;
  contract_id: string;
  rate_id: string;
  season_id: string; // "" = none
  occupancy_type: string;
  check_in: string;
  check_out: string;
  rooms: number;
};

const BLANK: ItemForm = { hotel_id: "", contract_id: "", rate_id: "", season_id: "", occupancy_type: "", check_in: "", check_out: "", rooms: 1 };

export function useQuotationItems(quotationId: string) {
  return useQuery({
    queryKey: ["quotation-items", quotationId],
    queryFn: async () => {
      const { data, error } = await db
        .from("quotation_items")
        .select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar), rate:rates(code, contract:supplier_contracts(contract_number,title))")
        .eq("quotation_id", quotationId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function ItemsTab({ quotationId, currency, editable }: { quotationId: string; currency: string; editable: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const items = useQuotationItems(quotationId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ItemForm>(BLANK);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const nm = (o: any) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const money = (n: number) => `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ===== Cascading lookups =====
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await apiClient.hotels.getAll()) ?? [],
  });

  const contracts = useQuery({
    queryKey: ["q-contracts", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () =>
      (await db.from("supplier_contracts").select("id,contract_number,title,start_date,end_date")
        .eq("hotel_id", form.hotel_id).eq("status", "active").is("deleted_at", null).order("start_date", { ascending: false })).data ?? [],
  });

  const rates = useQuery({
    queryKey: ["q-rates", form.hotel_id, form.contract_id],
    enabled: !!form.hotel_id && !!form.contract_id,
    queryFn: async () =>
      (await db.from("rates")
        .select("id,code,currency,valid_from,valid_to,room_type_id,room_type:hotel_room_types(name_en,name_ar)")
        .eq("hotel_id", form.hotel_id).eq("contract_id", form.contract_id)
        .eq("status", "approved").is("deleted_at", null).order("valid_from", { ascending: false })).data ?? [],
  });

  const seasons = useQuery({
    queryKey: ["q-rate-seasons", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () =>
      (await db.from("rate_seasons").select("id,name,start_date,end_date").eq("rate_id", form.rate_id).order("start_date")).data ?? [],
  });

  const occPrices = useQuery({
    queryKey: ["q-occ-prices", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () =>
      (await db.from("rate_occupancy_prices")
        .select("occupancy_type,cost_price,selling_price,markup_percent,currency")
        .eq("rate_id", form.rate_id).eq("active", true)).data ?? [],
  });

  const hotelTaxes = useQuery({
    queryKey: ["q-hotel-taxes", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () =>
      (await db.from("hotel_taxes").select("calc_method,value,apply_scope,is_inclusive,effective_date,expiry_date")
        .eq("hotel_id", form.hotel_id).eq("is_active", true).is("deleted_at", null)).data ?? [],
  });

  const occSorted = useMemo(
    () => [...(occPrices.data ?? [])].sort((a: any, b: any) => OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type)),
    [occPrices.data],
  );
  const selectedPrice: any = occSorted.find((p: any) => p.occupancy_type === form.occupancy_type);
  const selectedRate: any = (rates.data ?? []).find((r: any) => r.id === form.rate_id);

  // ===== Live pricing preview (mirrors the DB calculation engine) =====
  const preview = useMemo(() => {
    if (!selectedPrice || !form.check_in || !form.check_out) return null;
    const nights = Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000);
    if (nights <= 0) return null;
    const rooms = Math.max(1, Number(form.rooms) || 1);
    const cost = Number(selectedPrice.cost_price);
    const sell = Number(selectedPrice.selling_price ?? selectedPrice.cost_price);
    let taxes = 0, fees = 0;
    for (const tx of (hotelTaxes.data ?? []) as any[]) {
      if (tx.is_inclusive) continue;
      if (tx.effective_date && tx.effective_date > form.check_in) continue;
      if (tx.expiry_date && tx.expiry_date < form.check_in) continue;
      if (tx.calc_method === "percentage") taxes += (sell * nights * rooms * Number(tx.value)) / 100;
      else fees += Number(tx.value) * (tx.apply_scope === "per_night" ? nights * rooms : tx.apply_scope === "per_room" || tx.apply_scope === "per_person" ? rooms : 1);
    }
    return {
      nights, rooms, cost, sell,
      markup: Number(selectedPrice.markup_percent ?? 0),
      totalCost: cost * nights * rooms,
      margin: (sell - cost) * nights * rooms,
      taxes, fees,
      total: sell * nights * rooms + taxes + fees,
    };
  }, [selectedPrice, form.check_in, form.check_out, form.rooms, hotelTaxes.data]);

  const set = (patch: Partial<ItemForm>) => setForm((f) => ({ ...f, ...patch }));
  const pickHotel = (v: string) => set({ hotel_id: v, contract_id: "", rate_id: "", season_id: "", occupancy_type: "" });
  const pickContract = (v: string) => set({ contract_id: v, rate_id: "", season_id: "", occupancy_type: "" });
  const pickRate = (v: string) => set({ rate_id: v, season_id: "", occupancy_type: "" });
  const pickSeason = (v: string) => {
    if (v === "none") { set({ season_id: "" }); return; }
    const sn: any = (seasons.data ?? []).find((x: any) => x.id === v);
    set({ season_id: v, check_in: form.check_in || sn?.start_date || "", check_out: form.check_out || sn?.end_date || "" });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.rate_id || !form.occupancy_type) throw new Error(t("quotes.items.pricing_auto"));
      if (!form.check_in || !form.check_out) throw new Error(t("quotes.err_dates"));
      const payload: any = {
        quotation_id: quotationId,
        hotel_id: form.hotel_id,
        rate_id: form.rate_id,
        room_type_id: selectedRate?.room_type_id ?? null,
        occupancy_type: form.occupancy_type,
        check_in: form.check_in,
        check_out: form.check_out,
        rooms: Math.max(1, Number(form.rooms) || 1),
        // Prices pulled by the DB engine — never typed by the user
        cost_price: null,
        selling_price: null,
      };
      if (form.id) {
        await apiClient.quotationItems.update(form.id, payload);
      } else {
        await apiClient.quotationItems.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false); setForm(BLANK);
      qc.invalidateQueries({ queryKey: ["quotation-items", quotationId] });
      qc.invalidateQueries({ queryKey: ["quotation", quotationId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.quotationItems.delete(id);
    },
    onSuccess: () => {
      toast.success(t("toast.deleted", t("toast.saved")));
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["quotation-items", quotationId] });
      qc.invalidateQueries({ queryKey: ["quotation", quotationId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  const startEdit = (it: any) => {
    setForm({
      id: it.id, hotel_id: it.hotel_id, contract_id: "", rate_id: it.rate_id ?? "",
      season_id: "", occupancy_type: it.occupancy_type,
      check_in: it.check_in, check_out: it.check_out, rooms: it.rooms,
    });
    setOpen(true);
  };

  const rows = items.data ?? [];
  const sums = rows.reduce(
    (a: any, i: any) => ({
      cost: a.cost + Number(i.total_cost), taxes: a.taxes + Number(i.taxes), fees: a.fees + Number(i.fees),
      margin: a.margin + Number(i.margin), total: a.total + Number(i.total_selling),
    }),
    { cost: 0, taxes: 0, fees: 0, margin: 0, total: 0 },
  );

  return (
    <div className="space-y-4">
      {!editable && <p className="text-sm text-muted-foreground">{t("quotes.items.locked")}</p>}
      {editable && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("quotes.items.price_hint")}</p>
          <Button size="sm" onClick={() => { setForm(BLANK); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("quotes.items.add")}
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("quotes.items.hotel")}</TableHead>
                <TableHead>{t("quotes.items.room_type")}</TableHead>
                <TableHead>{t("quotes.items.occupancy")}</TableHead>
                <TableHead>{t("quotes.items.check_in")}</TableHead>
                <TableHead>{t("quotes.items.check_out")}</TableHead>
                <TableHead className="text-center">{t("quotes.items.nights")}</TableHead>
                <TableHead className="text-center">{t("quotes.items.rooms")}</TableHead>
                <TableHead>{t("quotes.items.cost")}</TableHead>
                <TableHead>{t("quotes.items.selling")}</TableHead>
                <TableHead>{t("quotes.items.taxes")}</TableHead>
                <TableHead>{t("quotes.items.fees")}</TableHead>
                <TableHead>{t("quotes.items.margin")}</TableHead>
                <TableHead>{t("quotes.items.total_selling")}</TableHead>
                {editable && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={14} className="py-10 text-center text-muted-foreground">{t("quotes.items.empty")}</TableCell></TableRow>
              )}
              {rows.map((i: any) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{nm(i.hotel)}</TableCell>
                  <TableCell>{nm(i.room_type)}</TableCell>
                  <TableCell>{t(`occupancy.${i.occupancy_type}`, i.occupancy_type)}</TableCell>
                  <TableCell dir="ltr">{formatDate(i.check_in)}</TableCell>
                  <TableCell dir="ltr">{formatDate(i.check_out)}</TableCell>
                  <TableCell className="text-center">{i.nights}</TableCell>
                  <TableCell className="text-center">{i.rooms}</TableCell>
                  <TableCell dir="ltr">{money(i.cost_price)}</TableCell>
                  <TableCell dir="ltr">{money(i.selling_price)}</TableCell>
                  <TableCell dir="ltr">{money(i.taxes)}</TableCell>
                  <TableCell dir="ltr">{money(i.fees)}</TableCell>
                  <TableCell dir="ltr" className="text-emerald-600">{money(i.margin)}</TableCell>
                  <TableCell dir="ltr" className="font-semibold">{money(i.total_selling)}</TableCell>
                  {editable && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} className="font-semibold">{t("quotes.pricing.grand_total")} ({currency})</TableCell>
                  <TableCell dir="ltr">{money(sums.cost)}</TableCell>
                  <TableCell />
                  <TableCell dir="ltr">{money(sums.taxes)}</TableCell>
                  <TableCell dir="ltr">{money(sums.fees)}</TableCell>
                  <TableCell dir="ltr" className="text-emerald-600">{money(sums.margin)}</TableCell>
                  <TableCell dir="ltr" className="font-bold">{money(sums.total)}</TableCell>
                  {editable && <TableCell />}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* ===== Add / Edit dialog ===== */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(BLANK); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? t("quotes.items.edit") : t("quotes.items.add")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.hotel")} *</label>
              <Select value={form.hotel_id} onValueChange={pickHotel}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
                <SelectContent>{(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => <SelectItem key={h.id} value={h.id}>{nm(h)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.contract")} *</label>
              <Select value={form.contract_id} onValueChange={pickContract} disabled={!form.hotel_id}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.contract")} /></SelectTrigger>
                <SelectContent>
                  {(contracts.data ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.contract_number} — {c.title ?? formatDate(c.start_date)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.hotel_id && contracts.data?.length === 0 && <p className="text-xs text-destructive">{t("quotes.items.no_contracts")}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.room_type")} *</label>
              <Select value={form.rate_id} onValueChange={pickRate} disabled={!form.contract_id}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.room_type")} /></SelectTrigger>
                <SelectContent>
                  {(rates.data ?? []).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{nm(r.room_type)} — {r.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.contract_id && rates.data?.length === 0 && <p className="text-xs text-destructive">{t("quotes.items.no_rates")}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.season")}</label>
              <Select value={form.season_id || "none"} onValueChange={pickSeason} disabled={!form.rate_id}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.season")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("quotes.items.season_any")}</SelectItem>
                  {(seasons.data ?? []).map((sn: any) => (
                    <SelectItem key={sn.id} value={sn.id}>{sn.name} ({formatDate(sn.start_date)} → {formatDate(sn.end_date)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.occupancy")} *</label>
              <Select value={form.occupancy_type} onValueChange={(v) => set({ occupancy_type: v })} disabled={!form.rate_id}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.occupancy")} /></SelectTrigger>
                <SelectContent>
                  {occSorted.map((p: any) => (
                    <SelectItem key={p.occupancy_type} value={p.occupancy_type}>
                      {t(`occupancy.${p.occupancy_type}`, p.occupancy_type)} — {Number(p.selling_price ?? p.cost_price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.rate_id && occSorted.length === 0 && <p className="text-xs text-destructive">{t("quotes.items.no_occ")}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.rooms")} *</label>
              <Input type="number" min={1} value={form.rooms} onChange={(e) => set({ rooms: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_in")} *</label>
              <Input type="date" value={form.check_in} onChange={(e) => set({ check_in: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_out")} *</label>
              <Input type="date" value={form.check_out} onChange={(e) => set({ check_out: e.target.value })} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{t("quotes.items.pricing_auto")}</p>

          {preview && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="mb-2 text-sm font-semibold">{t("quotes.items.preview")}</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.nights")}</span><b>{preview.nights}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.cost")}</span><b dir="ltr">{preview.cost.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("rates.markup")}</span><b dir="ltr">{preview.markup.toFixed(2)}%</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.selling")}</span><b dir="ltr">{preview.sell.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.total_cost")}</span><b dir="ltr">{preview.totalCost.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.margin")}</span><b dir="ltr" className="text-emerald-600">{preview.margin.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.taxes")}</span><b dir="ltr">{preview.taxes.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.fees")}</span><b dir="ltr">{preview.fees.toFixed(2)}</b></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">{t("quotes.items.grand")}</span><b dir="ltr">{preview.total.toFixed(2)}</b></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button
              disabled={save.isPending || !form.hotel_id || !form.rate_id || !form.occupancy_type || !form.check_in || !form.check_out}
              onClick={() => save.mutate()}
            >
              {t("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("actions.delete")}
        description={t("toast.confirm_delete")}
        onConfirm={() => deleteId && del.mutate(deleteId)}
      />
    </div>
  );
}
