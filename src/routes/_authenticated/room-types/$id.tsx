import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasAnyRole, isAdmin } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoomTypeDialog } from "./-dialog";
import { ArrowLeft, Pencil, Archive, RotateCcw, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { useGetRoomByIdQuery, useUpdateRoomMutation, useDeleteRoomMutation } from "@/store/services/rooms/roomsService";
import { toast } from "sonner";
import { useMutation, useQueryClient, dbErrorMessage } from "@/store/queryBridge";

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  if (value === null || value === undefined || value === "" || value === false) return null;
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  );
}

export default function RoomTypeDetail() {
  const { id } = useParams() as { id: string };
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<{ action: "archive" | "restore" | "delete" } | null>(null);
  const qc = useQueryClient();

  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const q = useGetRoomByIdQuery({ id });

  const archiveMut = useMutation({
    mutationFn: async ({ action, room }: { action: "archive" | "restore" | "delete"; room?: any }) => {
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
      if (v.action === "delete") {
        navigate("/room-types");
      } else {
        q.refetch();
      }
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["lookup", "room-types"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e)); setConfirm(null); },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("room_types.no_found")}</div>;
  const r = q.data as any;
  const name = lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar);
  const isActive = r.status === 1 || r.status === "1" || r.status === true;

  return (
    <>
      <PageHeader
        title={name}
        subtitle={`${r.code} · ${r.hotel ? (lang === "ar" ? (r.hotel.name_ar || r.hotel.name_en) : (r.hotel.name_en || r.hotel.name_ar)) : ""}`}
        children={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/room-types")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && isActive && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {canWrite && (isActive
              ? <Button variant="outline" size="sm" onClick={() => setConfirm({ action: "archive" })}><Archive className="h-4 w-4" />{t("actions.archive")}</Button>
              : <Button variant="outline" size="sm" onClick={() => setConfirm({ action: "restore" })}><RotateCcw className="h-4 w-4" />{t("actions.restore")}</Button>
            )}
            {canWrite && (
              <Button variant="destructive" size="sm" onClick={() => setConfirm({ action: "delete" })}><Trash2 className="h-4 w-4" />{t("actions.delete")}</Button>
            )}
            <StatusPill status={isActive ? "active" : "archived"} />
          </div>
        }
      />
      <div className="p-6">
        <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
          <KV label={t("label.id") || "ID"} value={r.id} />
          <KV label={t("label.code")} value={r.code} mono />
          <KV label={t("label.name_en")} value={r.name_en} />
          <KV label={t("label.name_ar")} value={r.name_ar} />
          <KV label={t("label.view")} value={r.view} />

          {/* Hotel Info */}
          <KV label={lang === "ar" ? "اسم الفندق" : "Hotel Name"} value={r.hotel ? (lang === "ar" ? r.hotel.name_ar : r.hotel.name_en) : ""} />
          <KV label={lang === "ar" ? "كود الفندق" : "Hotel Code"} value={r.hotel?.code} mono />
          <KV label={lang === "ar" ? "العلامة التجارية للفندق" : "Hotel Brand"} value={r.hotel?.brand} />
          <KV label={lang === "ar" ? "نجوم الفندق" : "Hotel Stars"} value={r.hotel?.stars ? `${r.hotel.stars} ★` : ""} />
          <KV label={lang === "ar" ? "الدولة" : "Country"} value={r.hotel?.country ? (lang === "ar" ? r.hotel.country.name_ar : r.hotel.country.name_en) : ""} />
          <KV label={lang === "ar" ? "المدينة" : "City"} value={r.hotel?.city ? (lang === "ar" ? r.hotel.city.name_ar : r.hotel.city.name_en) : ""} />

          {/* Room Type Info */}
          <KV label={lang === "ar" ? "نوع الغرفة" : "Room Type"} value={r.room_type ? (lang === "ar" ? r.room_type.name_ar : r.room_type.name_en) : ""} />

          {/* Optional Spec Values (Hidden if empty) */}
          <KV label={t("label.max_adults")} value={r.room_type?.max_adults} />
          <KV label={t("label.max_children")} value={r.room_type?.max_children} />
          <KV label={t("label.max_occupancy")} value={r.room_type?.max_occupancy} />
          <KV label={t("label.size_sqm")} value={r.room_type?.size_sqm} />
          <KV label={t("room_types.smoking")} value={r.room_type?.smoking_allowed ? (lang === "ar" ? "مسموح" : "Allowed") : null} />

          <KV label={t("label.created_at")} value={formatDateTime(r.created_at, lang)} />
          <KV label={t("label.updated_at")} value={formatDateTime(r.updated_at, lang)} />
          {(r.description_en || r.description_ar) && (
            <div className="md:col-span-3 space-y-1">
              <div className="text-xs text-muted-foreground">{t("label.description")}</div>
              <div className="whitespace-pre-wrap">{lang === "ar" ? (r.description_ar || r.description_en) : (r.description_en || r.description_ar)}</div>
            </div>
          )}
        </CardContent></Card>
      </div>

      <RoomTypeDialog open={editing} onOpenChange={setEditing} initial={r}
        onSaved={() => { q.refetch(); qc.invalidateQueries({ queryKey: ["rooms"] }); qc.invalidateQueries({ queryKey: ["lookup", "room-types"] }); }} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirm?.action !== "restore"}
        onConfirm={() => confirm && archiveMut.mutate({ action: confirm.action, room: r })}
      />
    </>
  );
}
