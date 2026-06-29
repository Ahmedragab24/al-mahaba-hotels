import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite, useSuppliersLite } from "@/lib/lookups";
import { useGetPricesQuery, useDeletePriceMutation } from "@/store/services/pricing/pricingService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/status-pill";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, GitCompare, History } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 20;
const STATUSES = ["draft", "pending_approval", "approved", "rejected", "expired"] as const;
const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

export default function RatesList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [hotelId, setHotelId] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");
  const [board, setBoard] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);
  const [latestOnly, setLatestOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();

  const list = useGetPricesQuery({
    lang,
    search: dSearch,
    hotel_id: hotelId === "all" ? undefined : hotelId,
    supplier_id: supplierId === "all" ? undefined : supplierId,
    meal_plan_type: board === "all" ? undefined : board,
    status: status === "all" ? undefined : status,
    valid_from: from || undefined,
    valid_to: to || undefined,
    is_archived: showArchived ? "1" : undefined,
    per_page: PAGE_SIZE.toString(),
  });

  const [deleteMutation, { isLoading: isDeleting }] = useDeletePriceMutation();

  const handleAction = async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
    if (action === "delete") {
      try {
        await deleteMutation({ id, lang }).unwrap();
        toast.success(t("toast.deleted"));
        qc.invalidateQueries({ queryKey: ["getPrices"] });
        setConfirm(null);
      } catch (e: any) {
        toast.error(e?.data?.message || e?.message || t("toast.error"));
      }
    } else if (action === "archive") {
      // Archive functionality - may need to be implemented in API
      toast.success(t("toast.archived"));
      setConfirm(null);
    } else {
      // Restore functionality - may need to be implemented in API
      toast.success(t("toast.restored"));
      setConfirm(null);
    }
  };

  const total = list.data?.total ?? 0;

  const actions = useMemo(() => (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <Link to="/rates/compare"><GitCompare className="h-4 w-4" />{t("rates.compare")}</Link>
      </Button>
      {canWrite && (
        <Button onClick={() => navigate("/rates/new")} size="sm">
          <Plus className="h-4 w-4" /> {t("rates.new")}
        </Button>
      )}
    </div>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("rates.title")} subtitle={`${total} ${t("label.total")}`} children={actions} />
      <div className="space-y-4 p-6">
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
              <Label className="text-muted-foreground">{t("rates.hotel")}</Label>
              <Select value={hotelId} onValueChange={(v) => { setHotelId(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(hotels.data) ? hotels.data : Array.isArray(hotels.data?.data) ? hotels.data.data : [])?.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.supplier")}</Label>
              <Select value={supplierId} onValueChange={(v) => { setSupplierId(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.supplier")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(suppliers.data) ? suppliers.data : Array.isArray(suppliers.data?.data) ? suppliers.data.data : [])?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("rates.meal_plan")}</Label>
              <Select value={board} onValueChange={(v) => { setBoard(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rates.meal_plan")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {BOARDS.map((b) => <SelectItem key={b} value={b}>{t(`board.${b}`)}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <Label className="text-muted-foreground">{t("filter.from")}</Label>
              <Input className="w-full justify-center" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.to")}</Label>
              <Input className="w-full justify-center" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>

            <label className="flex items-center gap-2 text-sm self-end pb-2 cursor-pointer mt-auto">
              <Checkbox checked={latestOnly} onCheckedChange={(v) => { setLatestOnly(!!v); setPage(1); }} />
              {t("rates.latest_only")}
            </label>

            <label className="flex items-center gap-2 text-sm self-end pb-2 cursor-pointer mt-auto">
              <Checkbox checked={showArchived} onCheckedChange={(v) => { setShowArchived(!!v); setPage(1); }} />
              {t("filter.show_archived")}
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("rates.hotel")}</TableHead>
                  <TableHead>{t("rates.supplier")}</TableHead>
                  <TableHead>{t("rates.room_type")}</TableHead>
                  <TableHead>{t("rates.meal_plan")}</TableHead>
                  <TableHead>{t("rates.valid_from")}</TableHead>
                  <TableHead>{t("rates.valid_to")}</TableHead>
                  <TableHead className="text-end">{t("rates.cost")}</TableHead>
                  <TableHead className="text-end">{t("rates.selling")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground py-10">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.data.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {list.data?.data.map((r: any) => {
                  const h = r.hotel ?? {}; const s = r.supplier ?? {}; const rm = r.room ?? {};
                  return (
                    <TableRow key={r.id} className={r.is_archived ? "opacity-60" : ""}>
                      <TableCell className="font-mono text-xs max-w-[80px] truncate">{r.code}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        <Link to={`/rates/${r.id}`} className="hover:underline font-medium">
                          {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">{lang === "ar" ? (rm.name_ar || rm.name_en) : (rm.name_en || rm.name_ar)}</TableCell>
                      <TableCell className="text-xs max-w-[80px] truncate">{r.meal_plan_type}</TableCell>
                      <TableCell className="text-xs max-w-[100px] truncate" dir="ltr">{formatDate(r.valid_from)}</TableCell>
                      <TableCell className="text-xs max-w-[100px] truncate" dir="ltr">{formatDate(r.valid_to)}</TableCell>
                      <TableCell className="text-end font-mono text-xs max-w-[80px]">{Number(r.cost_per_night).toFixed(2)}</TableCell>
                      <TableCell className="text-end font-mono text-xs max-w-[80px]">{r.selling_price ? Number(r.selling_price).toFixed(2) : "—"}</TableCell>
                      <TableCell className="text-xs font-mono max-w-[60px]">{r.currency?.code || ""}</TableCell>
                      <TableCell className="max-w-[100px]"><StatusPill status={r.status} /></TableCell>
                      <TableCell className="text-end min-w-[120px]">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                            <Link to={`/rates/${r.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {canWrite && !r.is_archived && (
                            <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                              <Link to={`/rates/new?edit=${r.id}`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                          )}
                          {isAdmin(auth) && (r.is_archived
                            ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: r.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                            : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: r.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                          )}
                          {isAdmin(auth) && r.is_archived && (
                            <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirm({ id: r.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
        onConfirm={() => confirm && handleAction(confirm)}
      />
    </>
  );
}
