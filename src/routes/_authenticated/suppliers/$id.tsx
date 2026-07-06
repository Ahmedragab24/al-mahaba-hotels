import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupplierForm } from "./-form";
import { StatusPill } from "@/components/status-pill";
import { ArrowLeft, Pencil, Star } from "lucide-react";
import { useGetSupplierByIdQuery } from "@/store/services/suppliers/suppliersService";

export default function SupplierDetail() {
  const { id } = useParams() as { id: string };
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries());
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = canWriteModule(auth, "suppliers");
  const [editing, setEditing] = useState(!!search.edit);

  const { data: supplier, isLoading, error } = useGetSupplierByIdQuery({ id: Number(id), lang });

  if (isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (error)
    return (
      <div className="p-6 text-red-500">Error: {(error as any)?.message || t("label.error")}</div>
    );
  if (!supplier) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;

  const s = supplier;
  const displayName = lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar;

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${s.code} · ${lang === "ar" ? (s.supplier_type?.name_ar ?? s.supplier_type?.name_en) : (s.supplier_type?.name_en ?? s.supplier_type?.name_ar)}${s.rating ? " · ★ " + Number(s.rating).toFixed(1) : ""}`}
        children={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/suppliers")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("actions.back")}
            </Button>
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                {t("actions.edit")}
              </Button>
            )}
            <StatusPill status={s.status ? "active" : "inactive"} />
            {s.is_archived && <StatusPill status="archived" />}
          </div>
        }
      />
      <div className="p-6">
        {editing ? (
          <SupplierForm
            initial={s}
            onSaved={() => {
              setEditing(false);
              qc.invalidateQueries({ queryKey: ["Suppliers"] });
            }}
          />
        ) : (
          <Card>
            <CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
              <KV label={t("label.code")} value={s.code} mono />
              <KV
                label={t("filter.type")}
                value={
                  lang === "ar"
                    ? (s.supplier_type?.name_ar ?? s.supplier_type?.name_en)
                    : (s.supplier_type?.name_en ?? s.supplier_type?.name_ar)
                }
              />
              <KV
                label={t("label.status")}
                value={s.status ? t("status.active") : t("status.inactive")}
              />
              <KV label={t("label.name_en")} value={s.name_en} />
              <KV label={t("label.name_ar")} value={s.name_ar} />

              <KV label={t("label.tax_number")} value={s.tax_number ?? ""} />
              <KV label={t("label.cr")} value={s.commercial_register ?? ""} />
              <KV
                label={t("label.currency")}
                value={
                  s.currency
                    ? `${s.currency.code} ${lang === "ar" ? (s.currency.symbol_ar ?? s.currency.symbol_en) : (s.currency.symbol_en ?? s.currency.symbol_ar)}`
                    : ""
                }
              />

              {/*<KV label={t("label.rating")} value={s.rating ? Number(s.rating).toFixed(2) : ""} />*/}
              <KV
                label={t("label.country")}
                value={s.country ? (lang === "ar" ? s.country.name_ar : s.country.name_en) : ""}
              />
              <KV
                label={t("label.city")}
                value={s.city ? (lang === "ar" ? s.city.name_ar : s.city.name_en) : ""}
              />
              <KV
                label={t("label.address")}
                value={[s.address_1, s.address_2].filter(Boolean).join(", ")}
              />
              <KV label={t("label.phone")} value={s.phone ?? ""} />

              <KV label={t("label.email")} value={s.email ?? ""} />
              <KV label={t("label.website")} value={s.website ?? ""} />
              <KV
                label={t("label.created_at")}
                value={new Date(s.created_at).toLocaleDateString(lang)}
              />
              <KV
                label={t("label.updated_at")}
                value={new Date(s.updated_at).toLocaleDateString(lang)}
              />

              {s.notes && (
                <div className="md:col-span-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{t("label.notes")}</div>
                  <div className="whitespace-pre-wrap">{s.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
