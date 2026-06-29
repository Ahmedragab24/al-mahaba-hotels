import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useGetCustomerByIdQuery, useDeleteCustomerMutation } from "@/store/services/customers/customersService";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "./-form";
import { StatusPill } from "@/components/status-pill";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
export default function CustomerDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries());
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, ["super_admin", "financial_manager", "sales_manager", "employee", "viewer"]);
  const [editing, setEditing] = useState(!!search.edit);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteCustomer] = useDeleteCustomerMutation();
  const { data: custData, isLoading } = useGetCustomerByIdQuery({ id: id as string, lang });

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCustomer(id).unwrap();
      toast.success(t("toast.deleted"));
      navigate("/customers");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || t("toast.error"));
    }
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  const c = custData;
  if (!c) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;
  const displayName = lang === "ar" ? (c.name_ar || c.name_en || c.name) : (c.name_en || c.name_ar || c.name);
  const isIndividual = c.type === "individual";

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${c.code} · ${t(`ctype.${c.type}`)}`}
        children={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {isAdmin(auth) && !editing && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />{t("actions.delete")}
              </Button>
            )}
            <StatusPill status={c.status ? "active" : "inactive"} />
          </div>
        }
      />
      <div className="p-6">
        {editing ? (
          <CustomerForm initial={c} onSaved={() => setEditing(false)} />
        ) : (
          <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
            <KV label={t("label.code")} value={c.code} mono />
            <KV label={t("filter.type")} value={t(`ctype.${c.type}`)} />
            <KV label={isIndividual ? t("label.personal_name_en") : t("label.name_en")} value={c.name_en} />
            <KV label={isIndividual ? t("label.personal_name_ar") : t("label.name_ar")} value={c.name_ar} />
            {!isIndividual && (
              <>
                <KV label={t("label.legal_name")} value={c.legal_name} />
                <KV label={t("label.tax_number")} value={c.tax_number} />
                <KV label={t("label.cr")} value={c.commercial_register} />
              </>
            )}
            <KV label={t("label.email")} value={c.email} />
            <KV label={t("label.phone")} value={c.phone} />
            <KV label={t("label.country")} value={c.country ? (lang === "ar" ? c.country.name_ar : c.country.name_en) : ""} />
            <KV label={t("label.currency")} value={c.currency ? `${lang === "ar" ? c.currency.name_ar : c.currency.name_en} (${c.currency.code})` : c.currency_id} />
            <KV label={t("label.created_at")} value={formatDateTime(c.created_at, lang)} />
            <KV label={t("label.updated_at")} value={formatDateTime(c.updated_at, lang)} />
            {c.notes && <div className="md:col-span-3"><div className="text-xs text-muted-foreground">{t("label.notes")}</div><div className="whitespace-pre-wrap">{c.notes}</div></div>}
          </CardContent></Card>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("actions.delete")}
        description={t("toast.confirm_delete")}
        destructive={true}
        onConfirm={handleDelete}
      />
    </>
  );
}

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export { CustomerDetail as Component };
