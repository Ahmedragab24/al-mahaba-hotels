import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/store/queryBridge";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@/store/queryBridge";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule, isAdmin } from "@/lib/auth-utils";
import { useDebounce } from "@/lib/use-debounce";
import { useCountries } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill as StatusBadge } from "@/components/status-pill";
import { KpiCard } from "@/components/list-toolkit";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
} from "@/store/services/suppliers/suppliersService";
import { useGetSupplierTypesQuery } from "@/store/services/attributes/supplier-types";

const PAGE_SIZE = 20;

export default function SuppliersList() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = canWriteModule(auth, "suppliers");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [stype, setStype] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{
    id: number;
    action: "archive" | "restore" | "delete";
  } | null>(null);

  const dSearch = useDebounce(search, 300);
  const countries = useCountries();
  const { data: supplierTypesData } = useGetSupplierTypesQuery({ lang });
  const supplierTypes = useMemo(() => {
    if (Array.isArray(supplierTypesData)) return supplierTypesData;
    if (Array.isArray((supplierTypesData as any)?.data)) return (supplierTypesData as any).data;
    return [];
  }, [supplierTypesData]);

  const { data: suppliersData, isLoading } = useGetSuppliersQuery(
    {
      lang,
      search: dSearch || undefined,
      supplier_type_id: stype !== "all" ? Number(stype) : undefined,
      status: status !== "all" ? (status === "active" ? 1 : 0) : undefined,
      country_id: country !== "all" ? Number(country) : undefined,
      all: 1,
      is_archived: showArchived || undefined,
    },
    { refetchOnMountOrArgChange: true },
  );

  console.log("[SuppliersList] suppliersData:", suppliersData);
  console.log("[SuppliersList] isLoading:", isLoading);

  const suppliers = useMemo(() => {
    let list = suppliersData?.data ?? [];
    if (stype !== "all") {
      list = list.filter((s: any) => String(s.supplier_type_id || s.supplier_type?.id) === stype);
    }
    return list;
  }, [suppliersData, stype]);
  const statistics = suppliersData?.statistics;

  console.log("[SuppliersList] suppliers:", suppliers);
  console.log("[SuppliersList] statistics:", statistics);

  const [updateSupplier] = useUpdateSupplierMutation();

  const handleAction = async ({
    id,
    action,
  }: {
    id: number;
    action: "archive" | "restore" | "delete";
  }) => {
    if (action === "delete") {
      try {
        console.log("[handleAction] Calling apiClient.suppliers.delete for id:", id);
        await apiClient.suppliers.delete(id);
        toast.success(t("toast.deleted"));
        qc.invalidateQueries({ queryKey: ["Suppliers"] });
        setConfirm(null);
      } catch (e: any) {
        toast.error(e.message ?? t("toast.error"));
      }
    } else {
      const s = suppliers.find((x: any) => x.id === id);
      if (!s) return;

      const body = {
        name_en: s.name_en,
        name_ar: s.name_ar,
        supplier_type_id: s.supplier_type_id || s.supplier_type?.id,
        status: s.status ? 1 : 0,
        tax_number: s.tax_number || null,
        commercial_register: s.commercial_register || null,
        currency_id: s.currency_id || s.currency?.id,
        country_id: s.country_id || s.country?.id,
        city_id: s.city_id || s.city?.id,
        address_1: s.address_1 || null,
        address_2: s.address_2 || null,
        phone: s.phone || null,
        email: s.email || null,
        website: s.website || null,
        notes: s.notes || null,
        is_archived: action === "archive" ? 1 : 0,
      };

      try {
        await updateSupplier({ id, body }).unwrap();
        toast.success(action === "archive" ? t("toast.archived") : t("toast.restored"));
        qc.invalidateQueries({ queryKey: ["Suppliers"] });
        setConfirm(null);
      } catch (e: any) {
        toast.error(e.message ?? t("toast.error"));
      }
    }
  };

  const total = suppliers.length;

  const actions = useMemo(
    () =>
      canWrite && (
        <Button onClick={() => navigate("/suppliers/new")} size="sm">
          <Plus className="h-4 w-4" /> {t("suppliers.new")}
        </Button>
      ),
    [canWrite, navigate, t],
  );

  return (
    <>
      <PageHeader
        title={t("suppliers.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={actions}
      />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            icon={Building2}
            tone="primary"
            label={t("kpi.total")}
            value={statistics?.total ?? "—"}
            active={status === "all" && !showArchived}
            onClick={() => {
              setStatus("all");
              setShowArchived(false);
              setPage(1);
            }}
          />
          <KpiCard
            icon={CheckCircle2}
            tone="success"
            label={t("kpi.active")}
            value={statistics?.active ?? "—"}
            active={status === "active"}
            onClick={() => {
              setStatus("active");
              setShowArchived(false);
              setPage(1);
            }}
          />
          <KpiCard
            icon={XCircle}
            tone="warning"
            label={t("kpi.inactive")}
            value={statistics?.inactive ?? "—"}
            active={status === "inactive"}
            onClick={() => {
              setStatus("inactive");
              setShowArchived(false);
              setPage(1);
            }}
          />
          <KpiCard
            icon={Archive}
            tone="muted"
            label={t("kpi.archived")}
            value={statistics?.archived ?? "—"}
            active={showArchived}
            onClick={() => {
              setShowArchived(true);
              setStatus("all");
              setPage(1);
            }}
          />
          <KpiCard
            icon={Calendar}
            tone="info"
            label={t("kpi.this_month")}
            value={statistics?.this_month ?? "—"}
          />
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t("actions.search")}
                  className="ps-8 w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.type")}</Label>
              <Select
                value={stype}
                onValueChange={(v) => {
                  setStype(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filter.type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {supplierTypes?.map((st: any) => (
                    <SelectItem key={st.id} value={st.id.toString()}>
                      {lang === "ar" ? st.name_ar : st.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filter.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.country")}</Label>
              <Select
                value={country}
                onValueChange={(v) => {
                  setCountry(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filter.country")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {(Array.isArray(countries.data)
                    ? countries.data
                    : Array.isArray(countries.data?.data)
                      ? countries.data.data
                      : []
                  )?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm self-end pb-2 cursor-pointer mt-auto">
              <Checkbox
                checked={showArchived}
                onCheckedChange={(v) => {
                  setShowArchived(!!v);
                  setPage(1);
                }}
              />
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
                  <TableHead>{t("label.country")}</TableHead>
                  <TableHead>{t("label.phone")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      {t("label.loading")}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      {t("label.no_results")}
                    </TableCell>
                  </TableRow>
                )}
                {suppliers.map((s: any) => (
                  <TableRow key={s.id} className={s.is_archived ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/suppliers/${s.id}`} className="hover:underline">
                        {lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{s.supplier_type?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{s.country?.name ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="text-xs">
                      {s.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{s.currency?.code ?? "—"}</TableCell>
                    {/* <TableCell>{s.rating ? <span className="flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current" />{Number(s.rating).toFixed(1)}</span> : <span className="text-muted-foreground">—</span>}</TableCell> */}
                    <TableCell>
                      <StatusBadge status={s.status ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to={`/suppliers/${s.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canWrite && !s.is_archived && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to={`/suppliers/${s.id}?edit=1`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {isAdmin(auth) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("actions.delete")}
                            onClick={() => setConfirm({ id: s.id, action: "delete" })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {isAdmin(auth) &&
                          (s.is_archived ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("actions.restore")}
                              onClick={() => setConfirm({ id: s.id, action: "restore" })}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("actions.archive")}
                              onClick={() => setConfirm({ id: s.id, action: "archive" })}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={
          confirm?.action === "restore"
            ? t("actions.restore")
            : confirm?.action === "delete"
              ? t("actions.delete")
              : t("actions.archive")
        }
        description={
          confirm?.action === "delete"
            ? t("toast.confirm_delete")
            : confirm?.action === "restore"
              ? ""
              : t("toast.confirm_archive")
        }
        destructive={confirm?.action !== "restore"}
        onConfirm={() => confirm && handleAction(confirm)}
      />
    </>
  );
}
