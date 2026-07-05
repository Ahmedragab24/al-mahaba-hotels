import { useState } from "react";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { dbErrorMessage } from "@/store/queryBridge";
import { toast } from "sonner";

const OCC = ["SGL", "DBL", "TPL", "QUAD", "CHD", "INF"] as const;
const MEALS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

export function useRfqItems(rfqId: string) {
  return useQuery({
    queryKey: ["rfq-items", rfqId],
    queryFn: async () => {
      const { data, error } = await db
        .from("rfq_items")
        .select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar)")
        .eq("rfq_id", rfqId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function rfqItemLabel(i: any, lang: string): string {
  const h = i.hotel ? (lang === "ar" ? (i.hotel.name_ar || i.hotel.name_en) : (i.hotel.name_en || i.hotel.name_ar)) : "—";
  const rt = i.room_type ? (lang === "ar" ? (i.room_type.name_ar || i.room_type.name_en) : (i.room_type.name_en || i.room_type.name_ar)) : "";
  return `${h}${rt ? " · " + rt : ""} · ${i.occupancy_type} · ${i.check_in} → ${i.check_out}`;
}

export function RfqItemsTab({ rfqId, editable }: { rfqId: string; editable: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const items = useRfqItems(rfqId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const empty = { hotel_id: "", room_type_id: "", occupancy_type: "DBL", quantity: "1", check_in: "", check_out: "", meal_plan: "", special_requests: "" };
  const [form, setForm] = useState<any>(empty);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await apiClient.hotels.getAll()) ?? [],
  });
  const roomTypes = useQuery({
    queryKey: ["lookup-room-types", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () => (await db.from("hotel_room_types").select("id,name_en,name_ar").eq("hotel_id", form.hotel_id).is("deleted_at", null).order("name_en")).data ?? [],
  });

  const nm = (x: any) => (x ? (lang === "ar" ? (x.name_ar || x.name_en) : (x.name_en || x.name_ar)) : "—");

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.check_in || !form.check_out) throw new Error(t("toast.error"));
      const payload: any = {
        rfq_id: rfqId,
        hotel_id: form.hotel_id,
        room_type_id: form.room_type_id || null,
        occupancy_type: form.occupancy_type,
        quantity: Number(form.quantity) || 1,
        check_in: form.check_in,
        check_out: form.check_out,
        meal_plan: form.meal_plan || null,
        special_requests: form.special_requests || null,
      };
      const { error } = editing
        ? await db.from("rfq_items").update(payload).eq("id", editing.id)
        : await apiClient.rfqItems.create(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false); setEditing(null); setForm(empty);
      qc.invalidateQueries({ queryKey: ["rfq-items", rfqId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.rfqItems.delete(id);
    },
    onSuccess: () => { toast.success(t("toast.saved")); setDeleteId(null); qc.invalidateQueries({ queryKey: ["rfq-items", rfqId] }); },
    onError: (e: any) => { setDeleteId(null); toast.error(dbErrorMessage(e)); },
  });

  const startEdit = (i: any) => {
    setEditing(i);
    setForm({
      hotel_id: i.hotel_id, room_type_id: i.room_type_id ?? "", occupancy_type: i.occupancy_type,
      quantity: String(i.quantity), check_in: i.check_in, check_out: i.check_out,
      meal_plan: i.meal_plan ?? "", special_requests: i.special_requests ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      {!editable && <p className="text-sm text-muted-foreground">{t("rfq.items.locked")}</p>}
      {editable && (
        <Button size="sm" onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>
          <Plus className="h-4 w-4" /> {t("rfq.items.add")}
        </Button>
      )}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("quotes.items.hotel")}</TableHead>
                <TableHead>{t("quotes.items.room_type")}</TableHead>
                <TableHead>{t("quotes.items.occupancy")}</TableHead>
                <TableHead>{t("rfq.items.quantity")}</TableHead>
                <TableHead>{t("quotes.items.check_in")}</TableHead>
                <TableHead>{t("quotes.items.check_out")}</TableHead>
                <TableHead>{t("quotes.items.nights")}</TableHead>
                <TableHead>{t("rfq.items.meal_plan")}</TableHead>
                {editable && <TableHead className="text-end">{t("label.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items.data?.length ?? 0) === 0 && (
                <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("rfq.items.empty")}</TableCell></TableRow>
              )}
              {(Array.isArray(items.data) ? items.data : Array.isArray(items.data?.data) ? items.data.data : [])?.map((i: any) => (
                <TableRow key={i.id} className="whitespace-nowrap">
                  <TableCell>{nm(i.hotel)}</TableCell>
                  <TableCell>{nm(i.room_type)}</TableCell>
                  <TableCell>{i.occupancy_type}</TableCell>
                  <TableCell>{i.quantity}</TableCell>
                  <TableCell dir="ltr" className="text-xs">{formatDate(i.check_in, lang)}</TableCell>
                  <TableCell dir="ltr" className="text-xs">{formatDate(i.check_out, lang)}</TableCell>
                  <TableCell>{i.nights}</TableCell>
                  <TableCell>{i.meal_plan ?? "—"}</TableCell>
                  {editable && (
                    <TableCell className="text-end">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(i)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? t("rfq.items.edit") : t("rfq.items.add")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.hotel")} *</label>
              <Select value={form.hotel_id} onValueChange={(v) => { set("hotel_id", v); set("room_type_id", ""); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.hotel")} /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => <SelectItem key={h.id} value={h.id}>{nm(h)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.room_type")}</label>
              <Select value={form.room_type_id} onValueChange={(v) => set("room_type_id", v)} disabled={!form.hotel_id}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("quotes.items.room_type")} /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(roomTypes.data) ? roomTypes.data : Array.isArray(roomTypes.data?.data) ? roomTypes.data.data : [])?.map((r: any) => <SelectItem key={r.id} value={r.id}>{nm(r)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.occupancy")} *</label>
              <Select value={form.occupancy_type} onValueChange={(v) => set("occupancy_type", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{OCC.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.items.quantity")} *</label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_in")} *</label>
              <Input type="date" value={form.check_in} onChange={(e) => set("check_in", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("quotes.items.check_out")} *</label>
              <Input type="date" value={form.check_out} onChange={(e) => set("check_out", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.items.meal_plan")}</label>
              <Select value={form.meal_plan || "none"} onValueChange={(v) => set("meal_plan", v === "none" ? "" : v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {MEALS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm">{t("rfq.items.special")}</label>
              <Textarea value={form.special_requests} onChange={(e) => set("special_requests", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("actions.delete")}
        description={t("confirm.delete", "")}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
