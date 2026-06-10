import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SupplierForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/suppliers/new")({
  component: CreateSupplier,
});

function CreateSupplier() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("suppliers.new")} actions={
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/suppliers" })}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <SupplierForm onSaved={(id) => navigate({ to: "/suppliers/$id", params: { id } })} />
      </div>
    </>
  );
}
