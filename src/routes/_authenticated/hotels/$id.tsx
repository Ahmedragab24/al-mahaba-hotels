import { useLocation, useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { db } from "@/store/queryBridge";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useFacilities, useHotelViews } from "@/lib/lookups";
import { useGetRoomsQuery } from "@/store/services/rooms/roomsService";
import {
  useGetHotelImagesQuery,
  useUploadHotelImagesMutation,
  useSetImageAsCoverMutation,
  useDeleteHotelImageMutation,
} from "@/store/services/hotels/hotelsService";
import { useGetSuppliersQuery } from "@/store/services/suppliers/suppliersService";
import { useGetBookingsQuery } from "@/store/services/bookings/bookingsService";
import { useGetQuotationsQuery } from "@/store/services/quotations/quotationsService";
import { useGetPricesQuery } from "@/store/services/pricing/pricingService";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HotelForm } from "./-form";
import { HotelShareActions } from "./-share-actions";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Eye, Pencil, Plus, Trash2, Star, Shield } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { RoomTypeDialog } from "../room-types/-dialog";
import { MealPlanSelector, MEAL_PLANS } from "@/components/meal-plan-selector";
import { MealPlanConfigurator } from "@/components/meal-plan-configurator";
import { apiClient } from "@/store/queryBridge";
import { BkStatusBadge } from "../bookings";
import { QStatusBadge } from "../quotations";
const CONTRACT_STATUSES = ["draft", "active", "expired", "terminated"] as const;

export default function HotelDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries());
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = hasAnyRole(auth, [
    "super_admin",
    "admin",
    "operations_manager",
    "operations_agent",
  ]);
  const [editing, setEditing] = useState(!!search.edit);

  const hotel = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      return await apiClient.hotels.getById(Number(id), { lang });
    },
  });

  // Tab counters are derived from the exact same queries each tab renders,
  // so the badge counts always match what's actually shown (and stay in sync
  // via RTK Query's cache/tag invalidation) instead of a separate, easily
  // stale aggregate query.
  const roomsCountQuery = useGetRoomsQuery({ hotel_id: id, lang });
  const roomsCount = Array.isArray(roomsCountQuery.data)
    ? roomsCountQuery.data.length
    : Array.isArray((roomsCountQuery.data as any)?.data)
      ? (roomsCountQuery.data as any).data.length
      : 0;

  const viewsCountQuery = useQuery({
    queryKey: ["hotel-views", id],
    queryFn: async () =>
      (await db.from("hotel_views").select("*").eq("hotel_id", id).order("name_en")).data ?? [],
  });
  const viewsCount = Array.isArray(viewsCountQuery.data) ? viewsCountQuery.data.length : 0;

  const ratesCountQuery = useGetPricesQuery({ hotel_id: id });
  const ratesCount = Array.isArray(ratesCountQuery.data)
    ? ratesCountQuery.data.length
    : Array.isArray((ratesCountQuery.data as any)?.data)
      ? (ratesCountQuery.data as any).data.length
      : 0;

  const bookingsCountQuery = useGetBookingsQuery({ hotel_id: id });
  const bookingsCount = Array.isArray(bookingsCountQuery.data)
    ? bookingsCountQuery.data.length
    : Array.isArray((bookingsCountQuery.data as any)?.data)
      ? (bookingsCountQuery.data as any).data.length
      : 0;

  const quotationsCountQuery = useGetQuotationsQuery({ hotel_id: id });
  const quotationsCount = Array.isArray(quotationsCountQuery.data)
    ? quotationsCountQuery.data.length
    : Array.isArray((quotationsCountQuery.data as any)?.data)
      ? (quotationsCountQuery.data as any).data.length
      : 0;

  const hotelImages = useGetHotelImagesQuery({ hotel_id: id });
  const { data: linkedSuppliersData } = useGetSuppliersQuery({ hotel_id: id as string, all: 1 });
  const linkedSuppliersList = Array.isArray(linkedSuppliersData)
    ? linkedSuppliersData
    : Array.isArray((linkedSuppliersData as any)?.data)
      ? (linkedSuppliersData as any).data
      : [];
  // Use the length of the (unpaginated) filtered list rather than the response's
  // `statistics.total`, which reflects global supplier stats and is not scoped
  // to this hotel — using it here showed the wrong (much larger) count.
  const suppliersCount = linkedSuppliersList.length;

  if (hotel.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!hotel.data) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;

  const h = hotel.data;
  const displayName = lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar;

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${h.code}${h.brand ? " · " + h.brand : ""}${h.star_rating ? " · " + "★".repeat(h.star_rating) : ""}`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/hotels")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("actions.back")}
            </Button>
            <HotelShareActions hotelId={id as string} contextCustomerId={search.customer} />
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                {t("actions.edit")}
              </Button>
            )}
            <StatusPill status={h.status ? "active" : "inactive"} />
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile">{t("hotels.profile")}</TabsTrigger>
            <TabsTrigger value="rooms">
              {t("hotels.rooms")} ({roomsCount})
            </TabsTrigger>
            <TabsTrigger value="views">
              {t("hotels.views")} ({viewsCount})
            </TabsTrigger>
            <TabsTrigger value="images">
              {t("hotels.images")} ({hotelImages.data?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              {t("hotels.suppliers")} ({suppliersCount})
            </TabsTrigger>
            <TabsTrigger value="rates">
              {t("hotels.rates_history")} ({ratesCount})
            </TabsTrigger>
            <TabsTrigger value="bookings">
              {t("hotels.bookings")} ({bookingsCount})
            </TabsTrigger>
            <TabsTrigger value="quotations">
              {t("nav.quotations")} ({quotationsCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <HotelForm
                initial={h}
                onSaved={() => {
                  setEditing(false);
                  qc.invalidateQueries({ queryKey: ["hotel", id] });
                }}
              />
            ) : (
              <Card>
                <CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
                  <KV label={t("label.code")} value={h.code} mono />
                  <KV label={t("label.brand")} value={h.brand} />
                  <KV
                    label={t("label.stars")}
                    value={
                      h.stars ? (
                        <span className="text-[var(--brand-gold-deep)] text-lg">
                          {"★".repeat(h.stars)}
                        </span>
                      ) : (
                        ""
                      )
                    }
                  />
                  <KV label={t("label.name_en")} value={h.name_en} />
                  <KV label={t("label.name_ar")} value={h.name_ar} />
                  <KV
                    label={t("label.status")}
                    value={h.status ? t("status.active") : t("status.inactive")}
                  />
                  <KV
                    label={t("label.country")}
                    value={h.country ? (lang === "ar" ? h.country.name_ar : h.country.name_en) : ""}
                  />
                  <KV
                    label={t("label.city")}
                    value={h.city ? (lang === "ar" ? h.city.name_ar : h.city.name_en) : ""}
                  />
                  <KV label={t("label.district")} value={h.district} />
                  <KV
                    label={t("label.address")}
                    value={[h.address_1, h.address_2, h.postal_code].filter(Boolean).join(", ")}
                  />
                  <KV
                    label={t("label.location_url")}
                    value={
                      h.map_link ? (
                        <a
                          href={h.map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--brand-gold-deep)] hover:underline truncate max-w-xs block"
                        >
                          {h.map_link}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <KV
                    label={t("label.phone")}
                    value={
                      h.phone ? (
                        <div dir="ltr" className="w-fit">
                          {h.phone}
                        </div>
                      ) : (
                        ""
                      )
                    }
                  />
                  <KV label={t("label.email")} value={h.email} />
                  <KV
                    label={t("label.website")}
                    value={
                      h.website ? (
                        <a
                          href={h.website.startsWith("http") ? h.website : `https://${h.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--brand-gold-deep)] hover:underline truncate block"
                        >
                          {h.website}
                        </a>
                      ) : (
                        ""
                      )
                    }
                  />
                  <KV label={t("label.checkin")} value={h.check_in?.slice(0, 5)} />
                  <KV label={t("label.checkout")} value={h.check_out?.slice(0, 5)} />
                  <KV label={t("label.created_at")} value={formatDateTime(h.created_at, lang)} />
                  {(h.description_en || h.description_ar) && (
                    <div className="md:col-span-3 space-y-1">
                      <div className="text-xs text-muted-foreground">{t("label.description")}</div>
                      <div className="whitespace-pre-wrap">
                        {lang === "ar"
                          ? h.description_ar || h.description_en
                          : h.description_en || h.description_ar}
                      </div>
                    </div>
                  )}
                  {(h.policies_en || h.policies_ar) && (
                    <div className="md:col-span-3 space-y-1">
                      <div className="text-xs text-muted-foreground">{t("hotels.policies")}</div>
                      <div className="whitespace-pre-wrap">
                        {lang === "ar"
                          ? h.policies_ar || h.policies_en
                          : h.policies_en || h.policies_ar}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsTab hotelId={id as string} canWrite={canWrite} />
          </TabsContent>
          <TabsContent value="views">
            <ViewsTab hotelId={id as string} canWrite={canWrite} />
          </TabsContent>
          <TabsContent value="images">
            <ImagesTab hotelId={id as string} canWrite={canWrite} images={hotelImages.data} />
          </TabsContent>
          <TabsContent value="suppliers">
            <SuppliersTab hotelId={id as string} />
          </TabsContent>
          <TabsContent value="rates">
            <RatesHistoryTab hotelId={id as string} />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingsTab hotelId={id as string} />
          </TabsContent>
          <TabsContent value="quotations">
            <QuotationsTab hotelId={id as string} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>
        {value || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

/* ---------- Room Types ---------- */
function RoomsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [viewRoom, setViewRoom] = useState<any>(null);
  const q = useGetRoomsQuery({ hotel_id: hotelId, lang });
  const del = useMutation({
    mutationFn: async (rid: string) => {
      await apiClient.roomTypes.delete(rid);
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      q.refetch();
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">{t("hotels.rooms")}</h3>
          {canWrite && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("actions.add")}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("label.image")}</TableHead>
              <TableHead>{t("label.code")}</TableHead>
              <TableHead>{t("label.name")}</TableHead>
              <TableHead>{t("hotels.room_type")}</TableHead>
              <TableHead>{t("hotels.view")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const rooms = Array.isArray(q.data)
                ? q.data
                : Array.isArray((q.data as any)?.data)
                  ? (q.data as any).data
                  : [];
              return (
                <>
                  {rooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                        {t("empty.title")}
                      </TableCell>
                    </TableRow>
                  )}
                  {rooms.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.cover_image && (
                          <img
                            src={r.cover_image}
                            alt={r.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell>{lang === "ar" ? r.name_ar : r.name_en}</TableCell>
                      <TableCell>
                        {r.room_type?.[lang === "ar" ? "name_ar" : "name_en"] ||
                          r.room_type?.name ||
                          "—"}
                      </TableCell>
                      <TableCell>{r.view || "—"}</TableCell>
                      <TableCell>
                        {r.status ? (
                          <Badge>{t("status.active")}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("status.inactive")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon" onClick={() => setViewRoom(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canWrite && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditing(r);
                                setOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              );
            })()}
          </TableBody>
        </Table>
        <RoomTypeDialog
          open={open}
          onOpenChange={setOpen}
          fixedHotelId={hotelId}
          initial={editing}
          onSaved={() => q.refetch()}
        />
        <ConfirmDialog
          open={!!delId}
          onOpenChange={(v) => !v && setDelId(null)}
          title={t("actions.delete")}
          description={t("toast.confirm_delete")}
          destructive
          onConfirm={() => delId && del.mutate(delId)}
        />
        <Dialog open={!!viewRoom} onOpenChange={(v) => !v && setViewRoom(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("hotels.room_details")}</DialogTitle>
            </DialogHeader>
            {viewRoom && (
              <div className="grid gap-4">
                {viewRoom.cover_image && (
                  <img
                    src={viewRoom.cover_image}
                    alt={viewRoom.name}
                    className="w-full h-64 rounded-md object-cover"
                  />
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  <KV label={t("label.code")} value={viewRoom.code} mono />
                  <KV
                    label={t("label.name")}
                    value={lang === "ar" ? viewRoom.name_ar : viewRoom.name_en}
                  />
                  <KV
                    label={t("hotels.room_type")}
                    value={
                      viewRoom.room_type?.[lang === "ar" ? "name_ar" : "name_en"] ||
                      viewRoom.room_type?.name
                    }
                  />
                  <KV label={t("hotels.view")} value={viewRoom.view} />
                  <KV
                    label={t("label.status")}
                    value={viewRoom.status ? t("status.active") : t("status.inactive")}
                  />
                  <KV
                    label={t("label.is_archived")}
                    value={viewRoom.is_archived ? t("status.yes") : t("status.no")}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("label.created_at")}: {formatDateTime(viewRoom.created_at, lang)}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRoom(null)}>
                {t("actions.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ---------- Views ---------- */
function ViewsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-views", hotelId],
    queryFn: async () =>
      (await db.from("hotel_views").select("*").eq("hotel_id", hotelId).order("name_en")).data ??
      [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => {
      await apiClient.hotelViews.delete(rid);
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["hotel-views", hotelId] });
      qc.invalidateQueries({ queryKey: ["hotel-counts", hotelId] });
      qc.invalidateQueries({ queryKey: ["hotel", hotelId] });
      setDelId(null);
    },
  });
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">{t("hotels.views")}</h3>
          {canWrite && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("actions.add")}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("label.code")}</TableHead>
              <TableHead>{t("label.name")}</TableHead>
              <TableHead>{t("label.is_active")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t("empty.title")}
                </TableCell>
              </TableRow>
            )}
            {(Array.isArray(q.data) ? q.data : Array.isArray(q.data?.data) ? q.data.data : [])?.map(
              (r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell>{lang === "ar" ? r.name_ar : r.name_en}</TableCell>
                  <TableCell>
                    {r.status === true || r.status === 1 ? (
                      <Badge>{t("status.active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("status.inactive")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    {canWrite && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(r);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
        <ViewDialog
          open={open}
          onOpenChange={setOpen}
          hotelId={hotelId}
          initial={editing}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["hotel-views", hotelId] });
            qc.invalidateQueries({ queryKey: ["hotel-counts", hotelId] });
            qc.invalidateQueries({ queryKey: ["hotel", hotelId] });
          }}
        />
        <ConfirmDialog
          open={!!delId}
          onOpenChange={(v) => !v && setDelId(null)}
          title={t("actions.delete")}
          description={t("toast.confirm_delete")}
          destructive
          onConfirm={() => delId && del.mutate(delId)}
        />
      </CardContent>
    </Card>
  );
}
function ViewDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (open) {
      setV(initial ? { ...initial, status: initial.status ? 1 : 0 } : { status: 1 });
    }
  }, [open, initial]);

  const save = useMutation({
    mutationFn: async () => {
      if (!v.code?.trim() || !v.name_en?.trim() || !v.name_ar?.trim())
        throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: hotelId,
        code: v.code.trim(),
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        status: v.status ? 1 : 0,
      };
      if (isEdit) {
        await apiClient.hotelViews.update(initial.id, payload);
      } else {
        await apiClient.hotelViews.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.views")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label={`${t("label.code")} *`}>
            <Input value={v.code ?? ""} onChange={(e) => setV({ ...v, code: e.target.value })} />
          </Field>
          <Field label={`${t("label.name_en")} *`}>
            <Input
              dir="ltr"
              value={v.name_en ?? ""}
              onChange={(e) => setV({ ...v, name_en: e.target.value })}
            />
          </Field>
          <Field label={`${t("label.name_ar")} *`}>
            <Input
              dir="rtl"
              value={v.name_ar ?? ""}
              onChange={(e) => setV({ ...v, name_ar: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={v.status === 1}
              onCheckedChange={(x) => setV({ ...v, status: x ? 1 : 0 })}
            />
            {t("label.is_active")}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Images ---------- */
function ImagesTab({
  hotelId,
  canWrite,
  images,
}: {
  hotelId: string;
  canWrite: boolean;
  images?: any[];
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [delId, setDelId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number>(0);

  const [upload, { isLoading: isUploading }] = useUploadHotelImagesMutation();
  const [setCover] = useSetImageAsCoverMutation();
  const [deleteImage] = useDeleteHotelImageMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: Array<{ file: File; preview: string }> = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        newPreviews.push({ file, preview });
      }
    });

    setPreviewFiles((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePreview = (index: number) => {
    setPreviewFiles((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSave = async () => {
    if (previewFiles.length === 0) throw new Error(t("label.required"));

    const formData = new FormData();
    formData.append("hotel_id", hotelId);
    formData.append("_method", "POST");

    previewFiles.forEach(({ file }) => {
      formData.append("images[]", file);
    });

    try {
      await upload(formData).unwrap();
      toast.success(t("toast.saved"));
      setOpen(false);
      setPreviewFiles([]);
      qc.invalidateQueries({ queryKey: ["getHotelImages"] });
    } catch (e: any) {
      toast.error(e.message || t("toast.error"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id).unwrap();
      toast.success(t("toast.deleted"));
      setDelId(null);
      qc.invalidateQueries({ queryKey: ["getHotelImages"] });
    } catch (e: any) {
      toast.error(e.message || t("toast.error"));
    }
  };

  const handleSetCover = async (id: string) => {
    try {
      await setCover({ id, body: { is_cover: true } as any }).unwrap();
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["getHotelImages"] });
    } catch (e: any) {
      toast.error(e.message || t("toast.error"));
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">{t("hotels.images")}</h3>
          {canWrite && (
            <Dialog
              open={open}
              onOpenChange={(o) => {
                setOpen(o);
                if (!o) {
                  setPreviewFiles([]);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  {t("actions.add")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{t("hotels.upload_images")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <Input
                      id="file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{t("hotels.click_to_upload")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("hotels.supported_formats")}
                      </p>
                    </div>
                  </div>

                  {previewFiles.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {previewFiles.map((item, index) => (
                        <div
                          key={index}
                          className="relative rounded-md border overflow-hidden group"
                        >
                          <img
                            src={item.preview}
                            alt={`Preview ${index + 1}`}
                            className="aspect-video w-full object-cover bg-muted"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 end-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePreview(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    {t("actions.cancel")}
                  </Button>
                  <Button onClick={handleSave} disabled={isUploading || previewFiles.length === 0}>
                    {isUploading ? t("label.uploading") : t("actions.upload")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(!images || images.length === 0) && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              {t("empty.title")}
            </div>
          )}
          {(images || []).map((img: any, idx: number) => (
            <div key={img.id} className="relative rounded-md border overflow-hidden group">
              <button
                type="button"
                className="w-full p-0 border-0 bg-transparent cursor-zoom-in focus:outline-none"
                onClick={() => {
                  setLightboxIdx(idx);
                  setLightboxImg(img.image_url);
                }}
              >
                <img
                  src={img.image_url}
                  className="aspect-video w-full object-cover bg-muted"
                  loading="lazy"
                  alt={`Hotel image ${img.id}`}
                />
              </button>
              <div className="flex items-center justify-between p-2 text-xs">
                <span className="truncate">{img.caption || "—"}</span>
                {img.is_cover && <Badge>{t("label.is_cover")}</Badge>}
              </div>
              {canWrite && (
                <div className="absolute top-1 end-1 flex gap-1 opacity-0 group-hover:opacity-100">
                  {!img.is_cover && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSetCover(img.id)}
                    >
                      {t("label.set_cover")}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDelId(img.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <ConfirmDialog
          open={!!delId}
          onOpenChange={(v) => !v && setDelId(null)}
          title={t("actions.delete")}
          description={t("toast.confirm_delete")}
          destructive
          onConfirm={() => delId && handleDelete(delId)}
        />

        {/* Lightbox */}
        <Dialog open={!!lightboxImg} onOpenChange={(v) => !v && setLightboxImg(null)}>
          <DialogContent className="max-w-5xl p-0 bg-black/90 border-none overflow-hidden">
            <div className="relative flex items-center justify-center min-h-[60vh]">
              {lightboxImg && (
                <img
                  src={lightboxImg}
                  alt="Hotel image"
                  className="max-h-[80vh] max-w-full object-contain"
                />
              )}
              {/* Prev */}
              {(images || []).length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute start-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                    onClick={() => {
                      const list = images || [];
                      const prev = (lightboxIdx - 1 + list.length) % list.length;
                      setLightboxIdx(prev);
                      setLightboxImg(list[prev].image_url);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="absolute end-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                    onClick={() => {
                      const list = images || [];
                      const next = (lightboxIdx + 1) % list.length;
                      setLightboxIdx(next);
                      setLightboxImg(list[next].image_url);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
              {/* Counter */}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/50 px-3 py-1 rounded-full">
                {lightboxIdx + 1} / {(images || []).length}
              </span>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function ContactDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: hotelId,
        full_name: v.full_name.trim(),
        title: v.title || null,
        department: v.department || null,
        email: v.email || null,
        phone: v.phone || null,
        mobile: v.mobile || null,
        whatsapp: v.whatsapp || null,
        is_primary: !!v.is_primary,
        preferred_language: v.preferred_language || "en",
        notes: v.notes || null,
      };
      if (isEdit) {
        await apiClient.hotelContacts.update(initial.id, payload);
      } else {
        await apiClient.hotelContacts.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) setV(initial ?? { is_primary: false, preferred_language: "en" });
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.contacts")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("label.full_name")} *`}>
            <Input
              value={v.full_name ?? ""}
              onChange={(e) => setV({ ...v, full_name: e.target.value })}
            />
          </Field>
          <Field label={t("label.title_position")}>
            <Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} />
          </Field>
          <Field label={t("label.department")}>
            <Input
              value={v.department ?? ""}
              onChange={(e) => setV({ ...v, department: e.target.value })}
            />
          </Field>
          <Field label={t("label.language")}>
            <Select
              value={v.preferred_language ?? "en"}
              onValueChange={(x) => setV({ ...v, preferred_language: x })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("label.email")}>
            <Input
              type="email"
              dir="ltr"
              value={v.email ?? ""}
              onChange={(e) => setV({ ...v, email: e.target.value })}
            />
          </Field>
          <Field label={t("label.phone")}>
            <Input
              dir="ltr"
              value={v.phone ?? ""}
              onChange={(e) => setV({ ...v, phone: e.target.value })}
            />
          </Field>
          <Field label={t("label.mobile")}>
            <Input
              dir="ltr"
              value={v.mobile ?? ""}
              onChange={(e) => setV({ ...v, mobile: e.target.value })}
            />
          </Field>
          <Field label={t("label.whatsapp")}>
            <Input
              dir="ltr"
              value={v.whatsapp ?? ""}
              onChange={(e) => setV({ ...v, whatsapp: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!v.is_primary}
                onCheckedChange={(x) => setV({ ...v, is_primary: !!x })}
              />
              {t("label.is_primary")}
            </label>
          </div>
          <div className="md:col-span-2">
            <Field label={t("label.notes")}>
              <Textarea
                rows={2}
                value={v.notes ?? ""}
                onChange={(e) => setV({ ...v, notes: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? t("actions.saving") : t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Linked Suppliers ---------- */
function SuppliersTab({ hotelId }: { hotelId: string }) {
  const { t, lang } = useI18n();
  const { data: suppliersData, isLoading } = useGetSuppliersQuery({
    hotel_id: hotelId,
    lang,
    all: 1,
  });
  const list = Array.isArray(suppliersData)
    ? suppliersData
    : Array.isArray((suppliersData as any)?.data)
      ? (suppliersData as any).data
      : [];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">
            {t("hotels.suppliers")} ({list.length})
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("label.code")}</TableHead>
              <TableHead>{t("label.name")}</TableHead>
              <TableHead>{t("filter.type")}</TableHead>
              <TableHead>{t("label.country")}</TableHead>
              <TableHead>{t("label.city")}</TableHead>
              <TableHead>{t("label.phone")}</TableHead>
              <TableHead>{t("label.currency")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  {t("label.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  {t("empty.title")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              list.map((s: any) => (
                <TableRow key={s.id} className={s.is_archived ? "opacity-60" : ""}>
                  <TableCell className="font-mono text-xs">{s.code}</TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/suppliers/${s.id}`} className="hover:underline">
                      {lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.supplier_type
                      ? lang === "ar"
                        ? s.supplier_type.name_ar || s.supplier_type.name
                        : s.supplier_type.name_en || s.supplier_type.name
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.country ? (lang === "ar" ? s.country.name_ar : s.country.name_en) : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.city ? (lang === "ar" ? s.city.name_ar : s.city.name_en) : "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-xs">
                    {s.phone || "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{s.currency?.code ?? "—"}</TableCell>
                  <TableCell>
                    <StatusPill status={s.status ? "active" : "inactive"} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ---------- Rates history ---------- */
function RatesHistoryTab({ hotelId }: { hotelId: string }) {
  const { t, lang } = useI18n();
  const { data: pricesData, isLoading } = useGetPricesQuery({ hotel_id: hotelId });
  const list = Array.isArray(pricesData)
    ? pricesData
    : Array.isArray(pricesData?.data)
      ? pricesData.data
      : [];
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("label.code")}</TableHead>
              <TableHead>{t("filter.supplier")}</TableHead>
              <TableHead>{t("rates.room_type")}</TableHead>
              <TableHead>{t("rates.meal_plan")}</TableHead>
              <TableHead>{t("rates.valid_from")}</TableHead>
              <TableHead>{t("rates.valid_to")}</TableHead>
              <TableHead>{t("rates.cost")}</TableHead>
              <TableHead>{t("label.currency")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  {t("label.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  {t("hotels.no_rates")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              list.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell>{lang === "ar" ? r.supplier?.name_ar : r.supplier?.name_en}</TableCell>
                  <TableCell>{lang === "ar" ? r.room?.name_ar : r.room?.name_en}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.meal_plan_type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{r.valid_from}</TableCell>
                  <TableCell className="text-xs">{r.valid_to}</TableCell>
                  <TableCell>{Number(r.cost_per_night).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{r.currency?.code || r.currency}</TableCell>
                  <TableCell>
                    {r.status_text && r.status_text !== t(`status.${r.status}`) ? (
                      <Badge
                        className={
                          r.status === "expired" || r.status_text === "منتهي"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-transparent"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-transparent"
                        }
                      >
                        {r.status_text}
                      </Badge>
                    ) : (
                      <StatusPill status={r.status} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BookingsTab({ hotelId }: { hotelId: string }) {
  const { t } = useI18n();
  const { data: bookingsData, isLoading } = useGetBookingsQuery({ hotel_id: hotelId });
  const list = Array.isArray(bookingsData)
    ? bookingsData
    : Array.isArray((bookingsData as any)?.data)
      ? (bookingsData as any).data
      : [];
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("label.code")}</TableHead>
              <TableHead>{t("label.checkin")}</TableHead>
              <TableHead>{t("label.checkout")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t("label.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t("hotels.no_bookings")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              list.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.code}</TableCell>
                  <TableCell className="text-xs">{b.check_in}</TableCell>
                  <TableCell className="text-xs">{b.check_out}</TableCell>
                  <TableCell>
                    <BkStatusBadge status={b.status} t={t} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function QuotationsTab({ hotelId }: { hotelId: string }) {
  const { t, lang } = useI18n();
  const { data: quotesData, isLoading } = useGetQuotationsQuery({ hotel_id: hotelId });
  const list = Array.isArray(quotesData)
    ? quotesData
    : Array.isArray((quotesData as any)?.data)
      ? (quotesData as any).data
      : [];
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("quotes.number")}</TableHead>
              <TableHead>{t("quotes.customer")}</TableHead>
              <TableHead>{t("quotes.start_date")}</TableHead>
              <TableHead>{t("quotes.end_date")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t("label.loading")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t("label.no_results")}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              list.map((q: any) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{q.code || q.id}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {q.customer
                      ? lang === "ar"
                        ? q.customer.name_ar || q.customer.name_en
                        : q.customer.name_en || q.customer.name_ar
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{q.start_date}</TableCell>
                  <TableCell className="text-xs">{q.end_date}</TableCell>
                  <TableCell>
                    <QStatusBadge
                      status={q.status}
                      status_text={q.status_text}
                      is_expired={q.is_expired}
                      t={t}
                      lang={lang}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export { HotelDetail as Component };
