// Booking Rooms tab — cascading Hotel → Contract → Rate → Occupancy, pricing pulled by the DB engine,
// plus supplier confirmation workflow per room.
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { OCCUPANCY_TYPES } from "../rates/-occupancy";

type RoomForm = {
  id?: string;
  hotel_id: string;
  contract_id: string;
  rate_id: string;
  occupancy_type: string;
  check_in: string;
  check_out: string;
  rooms: number;
};
const BLANK: RoomForm = { hotel_id: "", contract_id: "", rate_id: "", occupancy_type: "", check_in: "", check_out: "", rooms: 1 };

export function useBookingRooms(bookingId: string) {
  return useQuery({
    queryKey: ["booking-rooms", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_rooms")
        .select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar), supplier:suppliers(name_en,name_ar)")
        .eq("booking_id", bookingId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function RoomsTab({ bookingId, currency, editable, confirmable }: { bookingId: string; currency: string; editable: boolean; confirmable: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const rooms = useBookingRooms(bookingId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RoomForm>(BLANK);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confNos, setConfNos] = useState<Record<string, string>>({});

  const nm = (o: any) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const money = (n: number) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
  });
  const contracts = useQuery({
    queryKey: ["bk-contracts", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () =>
      (await supabase.from("supplier_contracts").select("id,contract_number,title,start_date")
        .eq("hotel_id", form.hotel_id).eq("status", "active").is("deleted_at", null).order("start_date", { ascending: false })).data ?? [],
  });
  const rates = useQuery({
    queryKey: ["bk-rates", form.hotel_id, form.contract_id],
    enabled: !!form.hotel_id && !!form.contract_id,
    queryFn: async () =>
      (await supabase.from("rates")
        .select("id,code,room_type_id,room_type:hotel_room_types(name_en,name_ar)")
        .eq("hotel_id", form.hotel_id).eq("contract_id", form.contract_id)
        .eq("status", "approved").is("deleted_at", null)).data ?? [],
  });
  const occPrices = useQuery({
    queryKey: ["bk-occ-prices", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () =>
      (await supabase.from("rate_occupancy_prices")
        .select("occupancy_type,cost_price,selling_price")
        .eq("rate_id", form.rate_id).eq("active", true)).data ?? [],
  });

  const occSorted = useMemo(
    () => [...(occPrices.data ?? [])].sort((a: any, b: any) => OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type)),
    [occPrices.data],
  );
  const set = (patch: Partial<RoomForm>) => setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.rate_id || !form.occupancy_type) throw new Error(t("quotes.items.pricing_auto"));
      if (!form.check_in || !form.check_out) throw new Error(t("bk.err_room_dates"));
      const payload: any = {
        booking_id: bookingId,
        hotel_id: form.hotel_id,
        rate_id: form.rate_id,
        occupancy_type: form.occupancy_type,
        check_in: form.check_in,
        check_out: form.check_out,
        rooms: Math.max(1, Number(form.rooms) || 1),
        cost_price: null,
        selling_price: null,
      };
      if (form.id) {
        const { error } = await supabase.from("booking_rooms").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("booking_rooms").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false); setForm(BLANK);
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const confirmRoom = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "confirmed" | "rejected" }) => {
      const patch: any = { confirmation_status: status };
      if (status === "confirmed") patch.supplier_confirmation_no = (confNos[id] ?? "").trim();
      const { error } = await supabase.from("booking_rooms").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const rows = rooms.data ?? [];
  const sums = rows.reduce(
    (a, i: any) => ({ cost: a.cost + Number(i.total_cost), margin: a.margin + Number(i.margin), total: a.total + Number(i.total_selling) }),
    { cost: 0, margin: 0, total: 0 },
  );

  const confBadge = (s: string) => (
    <Badge variant={s === "confirmed" ? "default" : s === "rejected" ? "destructive" : "outline"}
      className={s === "confirmed" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}>
      {t(`bkconf.${s}`)}
    </Badge>
  );

  return (
    <div className="space-y-4">
      {!editable && <p className="text-sm text-muted-foreground">{t("bk.rooms.locked")}</p>}
      {editable && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("quotes.items.price_hint")}</p>
          <Button size="sm" onClick={() => { setForm(BLANK); setOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("bk.rooms.add")}
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("quotes.items.hotel")}</TableHead>
                <TableHead>{t("quotes.items.room_type")}</TableHead>
                <TableHead>{t("quotes.items.occupancy")}</TableHead>
                <TableHead>{t("quotes.items.check_in")}</TableHead>
                <TableHead>{t("quotes.items.check_out")}</TableHead>
                <TableHead className="text-center">{t("quotes.items.nights")}</TableHead>
                <TableHead className="text-center">{t("quotes.items.rooms")}</TableHead>
                <TableHead>{t("quotes.items.total_selling")}</TableHead>
                <TableHead>{t("bk.rooms.supplier")}</TableHead>
                <TableHead>{t("bk.rooms.confirmation")}</TableHead>
                {(editable || confirmable) && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={11} className="py-10 text-center text-muted-foreground">{t("bk.rooms.empty")}</TableCell></TableRow>
              )}
              {rows.map((i: any) => (
                <TableRow key={i.id} className="whitespace-nowrap">
                  <TableCell className="font-medium">{nm(i.hotel)}</TableCell>
                  <TableCell>{nm(i.room_type)}</TableCell>
                  <TableCell>{t(`occupancy.${i.occupancy_type}`, i.occupancy_type)}</TableCell>
                  <TableCell dir="ltr">{formatDate(i.check_in)}</TableCell>
                  <TableCell dir="ltr">{formatDate(i.check_out)}</TableCell>
                  <TableCell className="text-center">{i.nights}</TableCell>
                  <TableCell className="text-center">{i.rooms}</TableCell>
                  <TableCell dir="ltr" className="font-semibold">{money(i.total_selling)}</TableCell>
                  <TableCell>{nm(i.supplier)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {confBadge(i.confirmation_status)}
                      {i.supplier_confirmation_no && <span dir="ltr" className="font-mono text-xs">{i.supplier_confirmation_no}</span>}
                    </div>
                  </TableCell>
                  {(editable || confirmable) && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {confirmable && i.confirmation_status !== "confirmed" && (
                          <>
                            <Input
                              value={confNos[i.id] ?? ""}
                              onChange={(e) => setConfNos((m) => ({ ...m, [i.id]: e.target.value }))}
                              placeholder={t("bk.rooms.confirmation_no")}
                              className="h-7 w-32 text-xs" dir="ltr"
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title={t("bk.rooms.confirm_room")}
                              onClick={() => confirmRoom.mutate({ id: i.id, status: "confirmed" })}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title={t("bk.rooms.reject_room")}
                              onClick={() => confirmRoom.mutate({ id: i.id, status: "rejected" })}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {editable && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7"
                              onClick={() => { setForm({ id: i.id, hotel_id: i.hotel_id, contract_id: "", rate_id: i.rate_id ?? "", occupancy_type: i.occupancy_type, check_in: i.check_in, check_out: i.check_out, rooms: i.rooms }); setOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(i.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
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
                  <TableCell dir="ltr" className="font-bold">{money(sums.total)}</TableCell>
                  <TableCell colSpan={2} dir="ltr" className="text-emerald-600">{t("quotes.items.margin")}: {money(sums.margin)}</TableCell>
                  {(editable || confirmable) && <TableCell />}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(BLANK); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? t("bk.rooms.edit") : t("bk.rooms.add")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.hotel")} *</label>
              <Select value={form.hotel_id} onValueChange={(v) => set({ hotel_id: v, contract_id: "", rate_id: "", occupancy_type: "" })}>
                <SelectTrigger><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
                <SelectContent>{hotels.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{nm(h)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.contract")} *</label>
              <Select value={form.contract_id} onValueChange={(v) => set({ contract_id: v, rate_id: "", occupancy_type: "" })} disabled={!form.hotel_id}>
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
              <Select value={form.rate_id} onValueChange={(v) => set({ rate_id: v, occupancy_type: "" })} disabled={!form.contract_id}>
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
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_in")} *</label>
              <Input type="date" value={form.check_in} onChange={(e) => set({ check_in: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_out")} *</label>
              <Input type="date" value={form.check_out} onChange={(e) => set({ check_out: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.rooms")} *</label>
              <Input type="number" min={1} value={form.rooms} onChange={(e) => set({ rooms: Number(e.target.value) })} dir="ltr" />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("actions.delete")}
        description={t("bk.rooms.edit")}
        onConfirm={() => deleteId && del.mutate(deleteId)}
      />
    </div>
  );
}
