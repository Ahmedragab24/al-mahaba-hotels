// Booking Rooms tab — cascading Hotel → Contract → Rate → Occupancy, pricing pulled by the DB engine,
// plus supplier confirmation workflow per room.
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Check, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  useGetBookingRoomsQuery,
  useCreateBookingRoomMutation,
  useUpdateBookingRoomMutation,
  useDeleteBookingRoomMutation,
} from "@/store/api";


export function useBookingRooms(bookingId: string) {
  return useGetBookingRoomsQuery({ booking_id: bookingId });
}

export function RoomsTab({ bookingId, currency, editable, confirmable }: { bookingId: string; currency: string; editable: boolean; confirmable: boolean }) {
  const { t, lang } = useI18n();
  const rooms = useBookingRooms(bookingId);
  const [confNos, setConfNos] = useState<Record<string, string>>({});

  const nm = (o: any) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const money = (n: number) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [confirmRoom] = useUpdateBookingRoomMutation();

  const handleConfirmRoom = async ({ id, status }: { id: string; status: "confirmed" | "rejected" }) => {
    const patch: any = { confirmation_status: status };
    if (status === "confirmed") patch.supplier_confirmation_no = (confNos[id] ?? "").trim();
    try {
      await confirmRoom({ booking_id: bookingId, room_id: id, body: patch }).unwrap();
      toast.success(t("toast.saved"));
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  const rows = rooms.data ?? [];
  const sums = rows.reduce(
    (a: { cost: number; margin: number; total: number }, i: any) => ({ cost: a.cost + Number(i.total_cost), margin: a.margin + Number(i.margin), total: a.total + Number(i.total_selling) }),
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
                {confirmable && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">{t("bk.rooms.empty")}</TableCell></TableRow>
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
                  {confirmable && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {i.confirmation_status !== "confirmed" && (
                          <>
                            <Input
                              value={confNos[i.id] ?? ""}
                              onChange={(e) => setConfNos((m) => ({ ...m, [i.id]: e.target.value }))}
                              placeholder={t("bk.rooms.confirmation_no")}
                              className="h-7 w-32 text-xs" dir="ltr"
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title={t("bk.rooms.confirm_room")}
                              onClick={() => handleConfirmRoom({ id: i.id, status: "confirmed" })}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title={t("bk.rooms.reject_room")}
                              onClick={() => handleConfirmRoom({ id: i.id, status: "rejected" })}>
                              <X className="h-3.5 w-3.5" />
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
                  {confirmable && <TableCell />}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
