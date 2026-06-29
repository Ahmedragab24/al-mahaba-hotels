import { Link } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useHotelsLite, useHotelRoomTypes } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { Trophy, Eye, Building2 } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";

export default function CompareRates() {
  const { t, lang } = useI18n();
  const hotels = useHotelsLite();

  const [hotelId, setHotelId] = useState<string>("");
  const [roomTypeId, setRoomTypeId] = useState<string>("all");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");

  const roomTypes = useHotelRoomTypes(hotelId || null);

  const list = useQuery({
    queryKey: ["rates-compare", { hotelId, roomTypeId, checkIn, checkOut }],
    enabled: !!hotelId,
    queryFn: async () => {
      let q = db.from("rates").select(
        "id,code,hotel_id,supplier_id,room_type_id,meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,is_direct,version,created_at,created_by,supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar),hotel:hotels(name_en,name_ar)"
      )
        .eq("hotel_id", hotelId)
        .is("deleted_at", null)
        .is("superseded_at", null);
      if (roomTypeId !== "all") q = q.eq("room_type_id", roomTypeId);
      if (checkIn) q = q.gte("valid_to", checkIn);
      if (checkOut) q = q.lte("valid_from", checkOut);
      const { data, error } = await q.order("cost_per_night", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(() => list.data ?? [], [list.data]);
  const bestId = rows[0]?.id;

  return (
    <>
      <PageHeader title={t("rates.compare_title")} subtitle={t("rates.compare_hint")} />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.hotel")}</Label>
              <Select value={hotelId} onValueChange={(v) => { setHotelId(v); setRoomTypeId("all"); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rates.hotel")} /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.room_type")}</Label>
              <Select value={roomTypeId} onValueChange={setRoomTypeId} disabled={!hotelId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rates.room_type")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(roomTypes.data) ? roomTypes.data : Array.isArray(roomTypes.data?.data) ? roomTypes.data.data : [])?.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.valid_from")}</Label>
              <Input className="w-full justify-center" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.valid_to")}</Label>
              <Input className="w-full justify-center" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{t("rates.source")}</TableHead>
                  <TableHead>{t("rates.room_type")}</TableHead>
                  <TableHead>{t("rates.meal_plan")}</TableHead>
                  <TableHead className="text-end">{t("rates.cost")}</TableHead>
                  <TableHead className="text-end">{t("rates.selling")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("rates.valid_from")}</TableHead>
                  <TableHead>{t("rates.valid_to")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead>{t("rates.entered_at")}</TableHead>
                  <TableHead>{t("rates.entered_by")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hotelId && (
                  <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-10">{t("rates.compare_hint")}</TableCell></TableRow>
                )}
                {hotelId && list.isLoading && (
                  <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-10">{t("label.loading")}</TableCell></TableRow>
                )}
                {hotelId && !list.isLoading && rows.length === 0 && (
                  <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {rows.map((r: any) => {
                  const isBest = r.id === bestId;
                  const sourceName = r.is_direct
                    ? t("rates.source.direct")
                    : (lang === "ar" ? (r.supplier?.name_ar || r.supplier?.name_en) : (r.supplier?.name_en || r.supplier?.name_ar));
                  const enteredBy = r.creator
                    ? (lang === "ar" ? (r.creator.full_name_ar || r.creator.full_name_en) : (r.creator.full_name_en || r.creator.full_name_ar)) || r.creator.email
                    : "—";
                  return (
                    <TableRow key={r.id} className={isBest ? "bg-primary/5" : ""}>
                      <TableCell>{isBest && <Trophy className="h-4 w-4 text-primary" />}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {r.is_direct && <Building2 className="h-4 w-4 text-primary" />}
                          <span>{sourceName}</span>
                          {isBest && <Badge variant="default" className="text-[10px]">{t("rates.best_price")}</Badge>}
                          {r.is_direct && <Badge variant="secondary" className="text-[10px]">{t("rates.is_direct_short")}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{lang === "ar" ? (r.room_type?.name_ar || r.room_type?.name_en) : (r.room_type?.name_en || r.room_type?.name_ar)}</TableCell>
                      <TableCell className="text-xs">{t(`board.${r.meal_plan}`, r.meal_plan)}</TableCell>
                      <TableCell className="text-end font-mono">{Number(r.cost_per_night).toFixed(2)}</TableCell>
                      <TableCell className="text-end font-mono">{r.selling_price ? Number(r.selling_price).toFixed(2) : "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{r.currency}</TableCell>
                      <TableCell className="text-xs" dir="ltr">{formatDate(r.valid_from)}</TableCell>
                      <TableCell className="text-xs" dir="ltr">{formatDate(r.valid_to)}</TableCell>
                      <TableCell><StatusPill status={r.status} /></TableCell>
                      <TableCell className="text-xs" dir="ltr">{formatDateTime(r.created_at)}</TableCell>
                      <TableCell className="text-xs">{enteredBy}</TableCell>
                      <TableCell className="text-end">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/rates/${r.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export { CompareRates as Component };
