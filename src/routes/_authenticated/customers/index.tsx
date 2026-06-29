import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { useCountries } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusPill as StatusBadge } from "@/components/status-pill";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, Users, UserCheck, UserX, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useGetCustomersQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } from "@/store/services/customers/customersService";

const PAGE_SIZE = 20;
const TYPES = ["company", "individual", "agency", "government"] as const;
const STATUSES = ["active", "inactive", "archived"] as const;

function CustomersList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "financial_manager", "sales_manager", "employee", "viewer"]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const countries = useCountries();

  const { data: allCustomers = [] } = useGetCustomersQuery({ all: true, lang });

  const metricsData = useMemo(() => {
    let rows: any[] = [];
    if (Array.isArray(allCustomers)) rows = allCustomers;
    else if (allCustomers && typeof allCustomers === "object") {
      const dataObj = (allCustomers as any).data || (allCustomers as any).rows || allCustomers;
      rows = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : (Array.isArray(dataObj.items) ? dataObj.items : []));
    }
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    return {
      total: rows.filter((r: any) => !r.is_archived).length,
      active: rows.filter((r: any) => r.status === true && !r.is_archived).length,
      inactive: rows.filter((r: any) => r.status === false && !r.is_archived).length,
      archived: rows.filter((r: any) => r.is_archived).length,
      withCredit: rows.filter((r: any) => Number(r.credit_limit) > 0 && !r.is_archived).length,
      thisMonth: rows.filter((r: any) => new Date(r.created_at) >= monthStart && !r.is_archived).length,
    };
  }, [allCustomers]);

  const { data: listData = [], isLoading: listIsLoading } = useGetCustomersQuery({
    search: dSearch || undefined,
    type: type !== "all" ? type : undefined,
    status: status !== "all" ? (status === "active") : undefined,
    country_id: country !== "all" ? country : undefined,
    is_archived: showArchived,
    lang
  });

  let actualListData: any[] = [];
  if (Array.isArray(listData)) actualListData = listData;
  else if (listData && typeof listData === "object") {
    const dataObj = (listData as any).data || (listData as any).rows || listData;
    actualListData = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : (Array.isArray(dataObj.items) ? dataObj.items : []));
  }
  const total = (listData as any)?.total ?? (listData as any)?.count ?? actualListData.length;
  const from = (page - 1) * PAGE_SIZE;
  const pagedRows = actualListData.slice(from, from + PAGE_SIZE);

  const [deleteCustomer] = useDeleteCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const handleArchive = async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
    try {
      if (action === "delete") {
        await deleteCustomer(id).unwrap();
      } else if (action === "archive") {
        await updateCustomer({ id, body: { is_archived: true, status: false } }).unwrap();
      } else {
        await updateCustomer({ id, body: { is_archived: false, status: true } }).unwrap();
      }
      toast.success(action === "delete" ? t("toast.deleted") : action === "archive" ? t("toast.deleted") : t("toast.restored"));
      setConfirmId(null);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || t("toast.error"));
    }
  };

  const actions = useMemo(() => canWrite && (
    <Button onClick={() => navigate("/customers/new")} size="sm">
      <Plus className="h-4 w-4" /> {t("customers.new")}
    </Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("customers.title")} subtitle={`${total} ${t("label.total")}`} children={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={Users} tone="primary" label={t("kpi.total")} value={metricsData.total ?? "—"}
            active={status === "all" && !showArchived} onClick={() => { setStatus("all"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={UserCheck} tone="success" label={t("kpi.active")} value={metricsData.active ?? "—"}
            active={status === "active"} onClick={() => { setStatus("active"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={UserX} tone="warning" label={t("kpi.inactive")} value={metricsData.inactive ?? "—"}
            active={status === "inactive"} onClick={() => { setStatus("inactive"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={Archive} tone="muted" label={t("kpi.archived")} value={metricsData.archived ?? "—"}
            active={showArchived} onClick={() => { setShowArchived(true); setStatus("all"); setPage(1); }} />
          <KpiCard icon={CreditCard} tone="info" label={t("kpi.with_credit")} value={metricsData.withCredit ?? "—"} />
          <KpiCard icon={Calendar} tone="info" label={t("kpi.this_month")} value={metricsData.thisMonth ?? "—"} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={t("filter.all")} tone="primary" active={type === "all"} onClick={() => { setType("all"); setPage(1); }} />
          {TYPES.map(c => (
            <StatusPill key={c} label={t(`ctype.${c}`)} tone="info" active={type === c} onClick={() => { setType(c); setPage(1); }} />
          ))}
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
              <Label className="text-muted-foreground">{t("filter.type")}</Label>
              <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.type")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {TYPES.map(c => <SelectItem key={c} value={c}>{t(`ctype.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.country")}</Label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.country")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(countries.data) ? countries.data : Array.isArray(countries.data?.data) ? countries.data.data : [])?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("filter.type")}</TableHead>
                  <TableHead>{t("label.email")}</TableHead>
                  <TableHead>{t("label.phone")}</TableHead>
                  <TableHead>{t("label.country")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listIsLoading && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">{t("label.loading")}</TableCell></TableRow>
                )}
                {!listIsLoading && (pagedRows.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {pagedRows.map((c: any) => (
                  <TableRow key={c.id} className={c.is_archived ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/customers/${c.id}`} className="hover:underline">
                        {lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {c.type === "individual" && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 border-transparent">{t(`ctype.${c.type}`)}</Badge>}
                      {c.type === "company" && <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30 border-transparent">{t(`ctype.${c.type}`)}</Badge>}
                      {c.type === "agency" && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 border-transparent">{t(`ctype.${c.type}`)}</Badge>}
                      {c.type === "government" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 border-transparent">{t(`ctype.${c.type}`)}</Badge>}
                      {!["individual", "company", "agency", "government"].includes(c.type) && <Badge variant="outline">{t(`ctype.${c.type}`)}</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{c.email}</TableCell>
                    <TableCell className="text-xs">{c.phone || "-"}</TableCell>
                    <TableCell className="text-xs">{c.country?.code || c.country_id || "-"}</TableCell>
                    <TableCell><StatusBadge status={c.status ? "active" : "inactive"} /></TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/customers/${c.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !c.is_archived && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to={`/customers/${c.id}?edit=1`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        {isAdmin(auth) && !c.is_archived && (
                          <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirmId({ id: c.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {isAdmin(auth) && c.is_archived && (
                          <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirmId({ id: c.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                        )}
                        {isAdmin(auth) && c.is_archived && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirmId({ id: c.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title={confirmId?.action === "restore" ? t("actions.restore") : confirmId?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirmId?.action === "delete" ? t("toast.confirm_delete") : confirmId?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirmId?.action !== "restore"}
        onConfirm={() => confirmId && handleArchive(confirmId)}
      />
    </>
  );
}

export default CustomersList;
export { CustomersList as Component };
