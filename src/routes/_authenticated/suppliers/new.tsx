import { useNavigate } from "react-router-dom";
import { SupplierForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateSupplier() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("suppliers.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <SupplierForm onSaved={(id) => navigate(`/suppliers/${id}`)} />
      </div>
    </>
  );
}

export { CreateSupplier as Component };
