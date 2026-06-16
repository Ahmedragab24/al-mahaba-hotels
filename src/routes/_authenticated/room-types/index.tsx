import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite } from "@/lib/lookups";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoomTypeDialog } from "./-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, Users, BedDouble, Ruler, CigaretteOff } from "lucide-react";
import { toast } from "sonner";
import hotelImg1 from "@/assets/hotels/hotel-1.jpg";
import hotelImg2 from "@/assets/hotels/hotel-2.jpg";
import hotelImg3 from "@/assets/hotels/hotel-3.jpg";
import hotelImg4 from "@/assets/hotels/hotel-4.jpg";
import hotelImg5 from "@/assets/hotels/hotel-5.jpg";
import hotelImg6 from "@/assets/hotels/hotel-6.jpg";

export const Route = createFileRoute("/_authenticated/room-types/")({
  component: RoomTypesList,
});

const PAGE_SIZE = 12;
const HOTEL_IMAGES = [hotelImg1, hotelImg2, hotelImg3, hotelImg4, hotelImg5, hotelImg6];

function hotelImage(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return HOTEL_IMAGES[h % HOTEL_IMAGES.length];
}

function RoomTypesList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("all");
  const [active, setActive] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; initial?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();

  const list = useQuery({
    queryKey: ["room-types", { dSearch, hotel, active, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("hotel_room_types").select(
        "id,code,name_en,name_ar,max_adults,max_children,max_occupancy,bed_type,size_sqm,smoking_allowed,is_active,deleted_at,created_at,hotel_id,hotel:hotels(name_en,name_ar)",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},bed_type.ilike.${s}`);
      }
      const from = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const archiveMut = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
      if (action !== "restore") {
        const { count } = await supabase.from("rates").select("*", { count: "exact", head: true })
          .eq("room_type_id", id).is("deleted_at", null).in("status", ["approved", "pending_approval"]);
        if ((count ?? 0) > 0) throw new Error(t("room_types.err_linked_rates"));
      }
      if (action === "delete") {
        const { error } = await supabase.from("hotel_room_types").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("hotel_room_types").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotel_room_types").update({ deleted_at: null, is_active: true }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["room-types"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e, t)); setConfirm(null); },
  });

  const total = list.data?.count ?? 0;

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
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("actions.search")} className="ps-8" />
            </div>
            <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {hotels.data?.map((h) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={active} onValueChange={(v) => { setActive(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                <SelectItem value="active">{t("status.active")}</SelectItem>
                <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
            <label className="ms-auto flex items-center gap-2 text-sm">
              <Checkbox checked={showArchived} onCheckedChange={(v) => { setShowArchived(!!v); setPage(1); }} />
              {t("filter.show_archived")}
            </label>
          </CardContent>
        </Card>

        {list.isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[3/2] w-full rounded-none" />
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
          <Card><CardContent className="py-16 text-center text-muted-foreground">{t("label.no_results")}</CardContent></Card>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.data?.rows.map((r: any) => {
            const name = lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar);
            const hotelName = r.hotel ? (lang === "ar" ? (r.hotel.name_ar || r.hotel.name_en) : (r.hotel.name_en || r.hotel.name_ar)) : "—";
            return (
              <Card
                key={r.id}
                className={`group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${r.deleted_at ? "opacity-60" : ""}`}
              >
                <Link to="/room-types/$id" params={{ id: r.id }} className="relative block aspect-[3/2] overflow-hidden bg-muted">
                  <img
                    src={hotelImage(r.id)}
                    alt={name}
                    width={768}
                    height={512}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute top-3 start-3 flex items-center gap-2">
                    {r.deleted_at
                      ? <Badge variant="secondary">{t("status.archived")}</Badge>
                      : r.is_active
                        ? <Badge className="bg-emerald-100 text-emerald-800 border-transparent">{t("status.active")}</Badge>
                        : <Badge variant="secondary">{t("status.inactive")}</Badge>
                    }
                  </div>
                  <div className="absolute bottom-2 start-3 end-3">
                    <span className="font-mono text-[11px] text-background/90">{r.code}</span>
                  </div>
                </Link>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/room-types/$id" params={{ id: r.id }} className="line-clamp-1 text-base font-semibold hover:underline">
                      {name}
                    </Link>
                  </div>
                  <div className="text-xs font-medium text-primary">{hotelName}</div>
                  {r.bed_type && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BedDouble className="h-3.5 w-3.5 shrink-0" />
                      <span>{r.bed_type}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-end border-t pt-3">
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title={t("actions.view")}>
                        <Link to="/room-types/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      {canWrite && !r.deleted_at && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.edit")} onClick={() => setDialog({ open: true, initial: r })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {auth.isAdmin && (r.deleted_at
                        ? <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.restore")} onClick={() => setConfirm({ id: r.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                        : <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.archive")} onClick={() => setConfirm({ id: r.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                      )}
                      {auth.isAdmin && r.deleted_at && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.delete")} onClick={() => setConfirm({ id: r.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <RoomTypeDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, initial: v ? dialog.initial : undefined })}
        initial={dialog.initial} onSaved={() => qc.invalidateQueries({ queryKey: ["room-types"] })} />
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
