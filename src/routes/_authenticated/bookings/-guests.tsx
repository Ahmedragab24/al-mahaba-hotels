// Booking Guests tab — guest CRUD with lead-guest logic (exactly one lead per booking).
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { useBookingRooms } from "./-rooms";
import {
  useGetBookingGuestsQuery,
  useCreateBookingGuestMutation,
  useUpdateBookingGuestMutation,
  useDeleteBookingGuestMutation,
} from "@/store/api";

type GuestForm = {
  id?: string;
  full_name: string;
  guest_type: string;
  nationality: string;
  passport_no: string;
  phone: string;
  email: string;
  booking_room_id: string;
};
const BLANK: GuestForm = {
  full_name: "",
  guest_type: "adult",
  nationality: "",
  passport_no: "",
  phone: "",
  email: "",
  booking_room_id: "",
};



export function GuestsTab({ bookingId, editable }: { bookingId: string; editable: boolean }) {
  const { t, lang } = useI18n();
  const guests = useGetBookingGuestsQuery({ booking_id: bookingId });
  const rooms = useBookingRooms(bookingId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GuestForm>(BLANK);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const nm = (o: any) =>
    (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const roomLabel = (id: string | null) => {
    const r: any = (rooms.data ?? []).find((x: any) => x.id === id);
    return r ? `${nm(r.hotel)} · ${t(`occupancy.${r.occupancy_type}`, r.occupancy_type)}` : "—";
  };


  const [createGuest] = useCreateBookingGuestMutation();
  const [updateGuest] = useUpdateBookingGuestMutation();

  const save = async () => {
    if (!form.full_name.trim()) {
      toast.error(t("bk.guests.name") + " *");
      return;
    }
    const payload: any = {
      full_name: form.full_name.trim(),
      guest_type: form.guest_type,
      nationality: form.nationality || null,
      passport_no: form.passport_no || null,
      phone: form.phone || null,
      email: form.email || null,
      booking_room_id: form.booking_room_id || null,
    };
    try {
      if (form.id) {
        await updateGuest({ booking_id: bookingId, guest_id: form.id, body: payload }).unwrap();
      } else {
        await createGuest({ booking_id: bookingId, body: payload }).unwrap();
      }
      toast.success(t("toast.saved"));
      setOpen(false);
      setForm(BLANK);
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  const [deleteGuest] = useDeleteBookingGuestMutation();

  const del = async (id: string) => {
    try {
      await deleteGuest({ booking_id: bookingId, guest_id: id }).unwrap();
      toast.success(t("toast.saved"));
      setDeleteId(null);
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  // Lead guest logic: demote current lead, promote selected guest
  const setLead = async (id: string) => {
    try {
      const current: any = (guests.data ?? []).find((g: any) => g.is_lead);
      if (current && current.id !== id) {
        await updateGuest({ booking_id: bookingId, guest_id: current.id, body: { is_lead: false } }).unwrap();
      }
      await updateGuest({ booking_id: bookingId, guest_id: id, body: { is_lead: true } }).unwrap();
      toast.success(t("toast.saved"));
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  const rows = guests.data ?? [];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      {!editable && <p className="text-sm text-muted-foreground">{t("bk.guests.locked")}</p>}
      {editable && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => {
              setForm(BLANK);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> {t("bk.guests.add")}
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("bk.guests.name")}</TableHead>
                <TableHead>{t("bk.guests.type")}</TableHead>
                <TableHead>{t("bk.guests.nationality")}</TableHead>
                <TableHead>{t("bk.guests.passport")}</TableHead>
                <TableHead>{t("label.phone")}</TableHead>
                <TableHead>{t("bk.guests.room")}</TableHead>
                <TableHead>{t("bk.guests.lead")}</TableHead>
                {editable && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t("bk.guests.empty")}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((g: any) => (
                <TableRow key={g.id} className="whitespace-nowrap">
                  <TableCell className="font-medium">{g.full_name}</TableCell>
                  <TableCell>{t(`gtype.${g.guest_type}`)}</TableCell>
                  <TableCell>{g.nationality ?? "—"}</TableCell>
                  <TableCell dir="ltr" className="font-mono text-xs">
                    {g.passport_no ?? "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-xs">
                    {g.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">{roomLabel(g.booking_room_id)}</TableCell>
                  <TableCell>
                    {g.is_lead ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        <Star className="h-3 w-3" /> {t("bk.guests.lead")}
                      </Badge>
                    ) : (
                      editable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setLead(g.id)}
                        >
                          {t("bk.guests.set_lead")}
                        </Button>
                      )
                    )}
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setForm({
                              id: g.id,
                              full_name: g.full_name,
                              guest_type: g.guest_type,
                              nationality: g.nationality ?? "",
                              passport_no: g.passport_no ?? "",
                              phone: g.phone ?? "",
                              email: g.email ?? "",
                              booking_room_id: g.booking_room_id ?? "",
                            });
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteId(g.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setForm(BLANK);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? t("bk.guests.edit") : t("bk.guests.add")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm">{t("bk.guests.name")} *</label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("bk.guests.type")}</label>
              <Select value={form.guest_type} onValueChange={(v) => set("guest_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["adult", "child", "infant"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {t(`gtype.${g}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("bk.guests.nationality")}</label>
              <Input
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("bk.guests.passport")}</label>
              <Input
                value={form.passport_no}
                onChange={(e) => set("passport_no", e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("label.phone")}</label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("label.email")}</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("bk.guests.room")}</label>
              <Select
                value={form.booking_room_id || "none"}
                onValueChange={(v) => set("booking_room_id", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {(rooms.data ?? []).map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>
                      {roomLabel(r.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>
              {t("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title={t("actions.delete")}
        description={t("bk.guests.name")}
        onConfirm={() => deleteId && del(deleteId)}
      />
    </div>
  );
}
