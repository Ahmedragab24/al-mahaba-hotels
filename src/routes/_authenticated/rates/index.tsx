import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite, useSuppliersLite } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/status-pill";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/rates/")({
  component: RatesList,
});

const PAGE_SIZE = 20;
const STATUSES = ["draft", "pending_approval", "approved", "rejected", "expired"] as const;
const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

function RatesList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [hotelId, setHotelId] = useState<string>("all");
  const [supplierId, setSupplierId] = useState<string>("all");
  const [board, setBoard] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();

  const list = useQuery({
    queryKey: ["rates", { dSearch, status, hotelId, supplierId, board, from, to, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("rates").select(
        "id,code,hotel_id,supplier_id,room_type_id,meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,deleted_at,hotel:hotels(name_en,name_ar),supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar)",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status as any);
      if (hotelId !== "all") q = q.eq("hotel_id", hotelId);
      if (supplierId !== "all") q = q.eq("supplier_id", supplierId);
      if (board !== "all") q = q.eq("meal_plan", board as any);
      if (from) q = q.gte("valid_to", from);
      if (to) q = q.lte("valid_from", to);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},notes_en.ilike.${s},notes_ar.ilike.${s}`);
      }
      const off = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(off, off + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const mut = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
      if (action === "delete") {
        const { error } = await supabase.from("rates").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("rates").update({ deleted_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rates").update({ deleted_at: null }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["rates"] });
      setConfirm(null);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const total = list.data?.count ?? 0;

  const actions = useMemo(() => canWrite && (
    <Button onClick={() => navigate({ to: "/rates/new" })} size="sm">
      <Plus className="h-4 w-4" /> {t("rates.new")}
    </Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("rates.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("actions.search")} className="ps-8" />
            </div>
            <Select value={hotelId} onValueChange={(v) => { setHotelId(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {hotels.data?.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierId} onValueChange={(v) => { setSupplierId(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.supplier")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {suppliers.data?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={board} onValueChange={(v) => { setBoard(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("rates.meal_plan")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {BOARDS.map((b) => <SelectItem key={b} value={b}>{t(`board.${b}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-full" />
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-full" />
            <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-1">
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
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {list.data?.rows.map((r: any) => {
                  const h = r.hotel ?? {}; const s = r.supplier ?? {}; const rt = r.room_type ?? {};
                  return (
                    <TableRow key={r.id} className={`whitespace-nowrap ${r.deleted_at ? "opacity-60" : ""}`}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="text-xs">
                        <Link to="/rates/$id" params={{ id: r.id }} className="hover:underline font-medium">
                          {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</TableCell>
                      <TableCell className="text-xs">{lang === "ar" ? (rt.name_ar || rt.name_en) : (rt.name_en || rt.name_ar)}</TableCell>
                      <TableCell className="text-xs">{t(`board.${r.meal_plan}`, r.meal_plan)}</TableCell>
                      <TableCell className="text-xs" dir="ltr">{formatDate(r.valid_from)}</TableCell>
                      <TableCell className="text-xs" dir="ltr">{formatDate(r.valid_to)}</TableCell>
                      <TableCell className="text-end font-mono text-xs">{Number(r.cost_per_night).toFixed(2)}</TableCell>
                      <TableCell className="text-end font-mono text-xs">{r.selling_price ? Number(r.selling_price).toFixed(2) : "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{r.currency}</TableCell>
                      <TableCell><StatusPill status={r.status} /></TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                            <Link to="/rates/$id" params={{ id: r.id }}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {canWrite && !r.deleted_at && r.status === "draft" && (
                            <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                              <Link to="/rates/$id" params={{ id: r.id }} search={{ edit: 1 } as any}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                          )}
                          {auth.isAdmin && (r.deleted_at
                            ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: r.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                            : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: r.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                          )}
                          {auth.isAdmin && r.deleted_at && (
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
        onConfirm={() => confirm && mut.mutate(confirm)}
      />
    </>
  );
}
