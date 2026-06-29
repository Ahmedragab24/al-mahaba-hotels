import { Link } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SeasonDialog, SEASON_TYPES } from "./-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function SeasonsList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [active, setActive] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; initial?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);

  const list = useQuery({
    queryKey: ["seasons", { dSearch, type, active, showArchived, page }],
    queryFn: async () => {
      let q = db.from("seasons").select("*", { count: "exact" });
      if (!showArchived) q = q.is("deleted_at", null);
      if (type !== "all") q = q.eq("season_type", type);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s}`);
      }
      const from = (page - 1) * PAGE_SIZE;
      q = q.order("start_date", { ascending: false }).range(from, from + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const archiveMut = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
      if (action === "delete") {
        await apiClient.seasons.delete(id);
      } else if (action === "archive") {
        const { error } = await db.from("seasons").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
        if (error) throw error;
      } else {
        await apiClient.seasons.update(id, { deleted_at: null, is_active: true });
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["seasons"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e)); setConfirm(null); },
  });

  const total = list.data?.count ?? 0;

  return (
    <>
      <PageHeader
        title={t("seasons.title")}
        subtitle={`${total} ${t("label.total")}`}
        actions={canWrite && (
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            <Plus className="h-4 w-4" /> {t("seasons.new")}
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
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder={t("seasons.type")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {SEASON_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`season_type.${s}`)}</SelectItem>)}
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("label.season_name")}</TableHead>
                  <TableHead>{t("seasons.type")}</TableHead>
                  <TableHead>{t("label.start_date")}</TableHead>
                  <TableHead>{t("label.end_date")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((s: any) => (
                  <TableRow key={s.id} className={s.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/seasons/${s.id}`} className="hover:underline">
                        {lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t(`season_type.${s.season_type}`)}</Badge></TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(s.start_date, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{formatDate(s.end_date, lang)}</TableCell>
                    <TableCell>
                      {s.deleted_at
                        ? <Badge variant="secondary">{t("status.archived")}</Badge>
                        : s.is_active ? <Badge className="bg-emerald-100 text-emerald-800 border-transparent">{t("status.active")}</Badge>
                          : <Badge variant="secondary">{t("status.inactive")}</Badge>}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/seasons/${s.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !s.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.edit")} onClick={() => setDialog({ open: true, initial: s })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin(auth) && (s.deleted_at
                          ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: s.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                          : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: s.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {isAdmin(auth) && s.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirm({ id: s.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <SeasonDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, initial: v ? dialog.initial : undefined })}
        initial={dialog.initial} onSaved={() => qc.invalidateQueries({ queryKey: ["seasons"] })} />
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

export { SeasonsList as Component };
