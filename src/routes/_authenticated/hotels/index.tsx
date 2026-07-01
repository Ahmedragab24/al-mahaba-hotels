import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { useCountries, useCities } from "@/lib/lookups";
import { useGetHotelsQuery, useUpdateHotelMutation, useDeleteHotelMutation } from "@/store/services/hotels/hotelsService";
import hotelImg1 from "@/assets/hotels/hotel-1.jpg";
import hotelImg2 from "@/assets/hotels/hotel-2.jpg";
import hotelImg3 from "@/assets/hotels/hotel-3.jpg";
import hotelImg4 from "@/assets/hotels/hotel-4.jpg";
import hotelImg5 from "@/assets/hotels/hotel-5.jpg";
import hotelImg6 from "@/assets/hotels/hotel-6.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill as StatusBadge } from "@/components/status-pill";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, MapPin, Phone, Star, Hotel, CheckCircle2, Crown, Calendar } from "lucide-react";
import { toast } from "sonner";



const PAGE_SIZE = 12;
const STATUSES = ["active", "inactive", "archived"] as const;
const STARS = [1, 2, 3, 4, 5] as const;

const HOTEL_IMAGES = [hotelImg1, hotelImg2, hotelImg3, hotelImg4, hotelImg5, hotelImg6];

function hotelImage(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return HOTEL_IMAGES[h % HOTEL_IMAGES.length];
}

export default function HotelsList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "financial_manager", "sales_manager", "employee", "viewer"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [stars, setStars] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const countries = useCountries();
  const cities = useCities();
  const countriesList = Array.isArray(countries.data) ? countries.data : ((countries.data as any)?.data || []);
  const citiesList = Array.isArray(cities.data) ? cities.data : ((cities.data as any)?.data || []);
  const cityMap = useMemo(() => {
    const m = new Map<string, { name_en: string; name_ar: string }>();
    citiesList.forEach((c: any) => m.set(c.id, c));
    return m;
  }, [cities.data]);

  const { data: allHotels, isLoading: isLoadingHotels, isFetching: isFetchingHotels } = useGetHotelsQuery({
    is_archived: showArchived ? 1 : 0
  });
  const [updateHotel] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  const hotelsList = useMemo(() => {
    return Array.isArray(allHotels) ? allHotels : Array.isArray((allHotels as any)?.data) ? (allHotels as any).data : [];
  }, [allHotels]);

  const metrics = useMemo(() => {
    const rows = hotelsList;
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    return {
      data: {
        total: rows.filter((r: any) => !r.is_archived).length,
        active: rows.filter((r: any) => r.status && !r.is_archived).length,
        archived: rows.filter((r: any) => r.is_archived).length,
        luxury: rows.filter((r: any) => Number(r.stars) === 5 && !r.is_archived).length,
        thisMonth: rows.filter((r: any) => new Date(r.created_at) >= monthStart && !r.is_archived).length,
      }
    };
  }, [hotelsList]);

  const list = useMemo(() => {
    let q = hotelsList;
    if (!showArchived) q = q.filter((r: any) => !r.is_archived);
    if (status !== "all") {
      const activeBool = status === "active";
      q = q.filter((r: any) => !!r.status === activeBool);
    }
    if (country !== "all") q = q.filter((r: any) => String(r.country_id) === String(country));
    if (stars !== "all") q = q.filter((r: any) => Number(r.stars) === Number(stars));
    if (dSearch.trim()) {
      const s = dSearch.trim().toLowerCase();
      q = q.filter((r: any) =>
        (r.code || "").toLowerCase().includes(s) ||
        (r.name_en || "").toLowerCase().includes(s) ||
        (r.name_ar || "").toLowerCase().includes(s) ||
        (r.brand || "").toLowerCase().includes(s) ||
        (r.email || "").toLowerCase().includes(s) ||
        (r.phone || "").toLowerCase().includes(s)
      );
    }
    const count = q.length;
    q = [...q].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const from = (page - 1) * PAGE_SIZE;
    const rows = q.slice(from, from + PAGE_SIZE);

    return {
      isLoading: isLoadingHotels,
      isFetching: isFetchingHotels,
      data: { rows, count }
    };
  }, [hotelsList, showArchived, status, country, stars, dSearch, page, isLoadingHotels, isFetchingHotels]);

  const handleArchive = async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
    try {
      if (action === "delete") {
        await deleteHotel(id).unwrap();
        toast.success(t("toast.deleted"));
      } else {
        const h = hotelsList.find((x: any) => String(x.id) === String(id));
        const body = h ? {
          name_en: h.name_en,
          name_ar: h.name_ar,
          stars: h.stars,
          city_id: h.city_id,
          country_id: h.country_id,
          is_archived: action === "archive" ? 1 : 0
        } : { is_archived: action === "archive" ? 1 : 0 };

        await updateHotel({ id, body: body as any }).unwrap();
        toast.success(action === "archive" ? t("toast.archived") : t("toast.restored"));
      }
      setConfirm(null);
    } catch (e: any) {
      toast.error(e.data?.message || e.message || t("toast.error"));
    }
  };

  const total = list.data?.count ?? 0;

  const actions = useMemo(() => canWrite && (
    <Button onClick={() => navigate("/hotels/new")} size="sm">
      <Plus className="h-4 w-4" /> {t("hotels.new")}
    </Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("hotels.title")} subtitle={`${total} ${t("label.total")}`} children={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard icon={Hotel} tone="primary" label={t("kpi.total")} value={metrics.data?.total ?? "—"}
            active={status === "all" && !showArchived} onClick={() => { setStatus("all"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("kpi.active")} value={metrics.data?.active ?? "—"}
            active={status === "active"} onClick={() => { setStatus("active"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={Crown} tone="warning" label={t("kpi.luxury")} value={metrics.data?.luxury ?? "—"}
            active={stars === "5"} onClick={() => { setStars(stars === "5" ? "all" : "5"); setPage(1); }} />
          <KpiCard icon={Archive} tone="muted" label={t("kpi.archived")} value={metrics.data?.archived ?? "—"}
            active={showArchived} onClick={() => { setShowArchived(true); setStatus("all"); setPage(1); }} />
          <KpiCard icon={Calendar} tone="info" label={t("kpi.this_month")} value={metrics.data?.thisMonth ?? "—"} />
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={t("actions.search")} className="ps-8 w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.country")}</Label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.country")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {countriesList.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("label.stars")}</Label>
              <Select value={stars} onValueChange={(v) => { setStars(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("label.stars")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {STARS.map((n) => <SelectItem key={n} value={String(n)}>{"★".repeat(n)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm self-end pb-2 cursor-pointer mt-auto">
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
          {list.data?.rows.map((h: any) => {
            const name = lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar);
            const cityName = h.city ? (lang === "ar" ? (h.city.name_ar || h.city.name_en) : (h.city.name_en || h.city.name_ar)) : null;
            const countryName = h.country ? (lang === "ar" ? (h.country.name_ar || h.country.name_en) : (h.country.name_en || h.country.name_ar)) : null;
            const location = [cityName, countryName].filter(Boolean).join("، ");
            return (
              <Card
                key={h.id}
                className={`group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${h.is_archived ? "opacity-60" : ""}`}
              >
                <Link to={`/hotels/${h.id}`} className="relative block aspect-[3/2] overflow-hidden bg-muted">
                  <img
                    src={h.cover_image || hotelImage(h.id)}
                    alt={name}
                    width={768}
                    height={512}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute top-3 start-3 flex items-center gap-2">
                    <StatusBadge status={h.status} />
                  </div>
                  {h.stars ? (
                    <Badge className="absolute top-3 end-3 gap-1 bg-card/90 text-amber-500 shadow backdrop-blur hover:bg-card/90">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-foreground">{h.stars}</span>
                    </Badge>
                  ) : null}
                  <div className="absolute bottom-2 start-3 end-3">
                    <span className="font-mono text-[11px] text-background/90">{h.code}</span>
                  </div>
                </Link>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/hotels/${h.id}`} className="line-clamp-1 text-base font-semibold hover:underline">
                      {name}
                    </Link>
                  </div>
                  {h.brand && <div className="text-xs font-medium text-primary">{h.brand}</div>}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">{location || "—"}</span>
                  </div>
                  {h.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span dir="ltr">{h.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-amber-500 text-sm">{h.stars ? "★".repeat(h.stars) : ""}</div>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title={t("actions.view")}>
                        <Link to={`/hotels/${h.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      {canWrite && !h.is_archived && (
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title={t("actions.edit")}>
                          <Link to={`/hotels/${h.id}?edit=1`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                      )}
                      {isAdmin(auth) && (h.is_archived
                        ? <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.restore")} onClick={() => setConfirm({ id: h.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                        : <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.archive")} onClick={() => setConfirm({ id: h.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                      )}
                      {isAdmin(auth) && h.is_archived && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("actions.delete")} onClick={() => setConfirm({ id: h.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirm?.action !== "restore"}
        onConfirm={() => confirm && handleArchive(confirm)}
      />
    </>
  );
}
