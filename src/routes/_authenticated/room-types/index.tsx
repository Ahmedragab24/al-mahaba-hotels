import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { useGetRoomsQuery, useUpdateRoomMutation, useDeleteRoomMutation } from "@/store/services/rooms/roomsService";
import { useGetRoomTypesQuery } from "@/store/services/attributes/room-types";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite } from "@/lib/lookups";
import { dbErrorMessage } from "@/store/queryBridge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoomTypeDialog } from "./-dialog";
import { StatusPill } from "@/components/status-pill";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, BedDouble } from "lucide-react";
import { toast } from "sonner";


const PAGE_SIZE = 12;



export default function RoomTypesList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const canWrite = canWriteModule(auth, "room_types");

  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; initial?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete"; room?: any } | null>(null);

  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();

  const { data: roomTypesData } = useGetRoomTypesQuery(
    hotel !== "all" ? { hotel_id: hotel } : undefined
  );
  const roomTypes = Array.isArray(roomTypesData)
    ? roomTypesData
    : Array.isArray(roomTypesData?.data)
      ? roomTypesData.data
      : [];

  const list = useGetRoomsQuery({
    search: dSearch || undefined,
    hotel_id: hotel !== "all" ? hotel : undefined,
    room_type_id: roomType !== "all" ? roomType : undefined,
    status: active === "active" ? "1" : active === "archived" ? "0" : undefined,
    page: page,
    per_page: PAGE_SIZE,
    lang: lang,
  } as any);

  const [deleteRoom] = useDeleteRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();

  const archiveMut = useMutation({
    mutationFn: async ({ id, action, room }: { id: string; action: "archive" | "restore" | "delete"; room?: any }) => {
      if (action === "delete") {
        await deleteRoom(id).unwrap();
      } else {
        await updateRoom({
          id,
          body: {
            name_ar: room?.name_ar,
            name_en: room?.name_en,
            hotel_id: room?.hotel_id,
            room_type_id: room?.room_type_id,
            view: room?.view || "",
            status: action === "archive" ? "0" : "1"
          } as any
        }).unwrap();
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : v.action === "archive" ? t("toast.archived") : t("toast.deleted"));
      list.refetch();
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["lookup", "room-types"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e)); setConfirm(null); },
  });

  const listData = list.data as any;
  const rows = Array.isArray(listData) ? listData : Array.isArray(listData?.data) ? listData.data : [];
  const total = listData?.total ?? listData?.meta?.total ?? rows.length;

  return (
    <>
      <PageHeader
        title={t("room_types.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={canWrite && (
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            <Plus className="h-4 w-4" /> {t("room_types.new")}
          </Button>
        )}
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("actions.search")} className="ps-8 w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.hotel")}</Label>
              <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select value={active} onValueChange={(v) => { setActive(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="archived">{t("status.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{lang === "ar" ? "نوع الغرفة" : "Room Type"}</Label>
              <Select value={roomType} onValueChange={(v) => { setRoomType(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={lang === "ar" ? "اختر نوع الغرفة" : "Select Room Type"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {roomTypes.map((rt: any) => (
                    <SelectItem key={rt.id} value={rt.id.toString()}>
                      {lang === "ar" ? (rt.name_ar || rt.name_en) : (rt.name_en || rt.name_ar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {list.isLoading && (
          <Card>
            <CardContent className="p-0 space-y-2 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        )}

        {!list.isLoading && rows.length === 0 && (
          <Card><CardContent className="py-16 text-center text-muted-foreground">{t("label.no_results")}</CardContent></Card>
        )}

        {!list.isLoading && rows.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-slate-500 font-semibold">
                    <th className="py-3 px-4 text-start font-medium">{lang === "ar" ? "الرمز" : "Code"}</th>
                    <th className="py-3 px-4 text-start font-medium">{lang === "ar" ? "الاسم" : "Name"}</th>
                    <th className="py-3 px-4 text-start font-medium">{lang === "ar" ? "الفندق" : "Hotel"}</th>
                    <th className="py-3 px-4 text-center font-medium">{lang === "ar" ? "نوع الغرفة" : "Room Type"}</th>
                    <th className="py-3 px-4 text-center font-medium">{lang === "ar" ? "الحالة" : "Status"}</th>
                    <th className="py-3 px-4 text-end font-medium">{lang === "ar" ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => {
                    const name = lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar);
                    const hotelName = r.hotel ? (lang === "ar" ? (r.hotel.name_ar || r.hotel.name_en) : (r.hotel.name_en || r.hotel.name_ar)) : "—";
                    const roomTypeName = r.room_type ? (lang === "ar" ? (r.room_type.name_ar || r.room_type.name_en) : (r.room_type.name_en || r.room_type.name_ar)) : "";
                    const isActive = r.status === 1 || r.status === "1" || r.status === true;
                    return (
                      <tr key={r.id} className={`border-b transition-colors hover:bg-muted/30 ${!isActive ? "opacity-60" : ""}`}>
                        <td className="py-3 px-4 font-mono text-xs">{r.code}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          <Link to={`/room-types/${r.id}`} className="hover:underline">
                            {name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-primary">{hotelName}</td>
                        <td className="py-3 px-4 text-center text-muted-foreground">{roomTypeName || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex justify-center">
                            <StatusPill status={isActive ? "active" : "archived"} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 justify-end">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8" title={t("actions.view")}>
                              <Link to={`/room-types/${r.id}`}><Eye className="h-4 w-4" /></Link>
                            </Button>
                            {canWrite && isActive && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.edit")} onClick={() => setDialog({ open: true, initial: r })}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canWrite && (isActive
                              ? <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.archive")} onClick={() => setConfirm({ id: r.id, action: "archive", room: r })}><Archive className="h-4 w-4" /></Button>
                              : <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.restore")} onClick={() => setConfirm({ id: r.id, action: "restore", room: r })}><RotateCcw className="h-4 w-4" /></Button>
                            )}
                            {canWrite && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.delete")} onClick={() => setConfirm({ id: r.id, action: "delete", room: r })}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
      </div>

      <RoomTypeDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, initial: v ? dialog.initial : undefined })}
        initial={dialog.initial} onSaved={() => { list.refetch(); qc.invalidateQueries({ queryKey: ["rooms"] }); qc.invalidateQueries({ queryKey: ["lookup", "room-types"] }); }} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirm?.action !== "restore"}
        onConfirm={() => confirm && archiveMut.mutate(confirm)}
      />
    </>
  );
}
