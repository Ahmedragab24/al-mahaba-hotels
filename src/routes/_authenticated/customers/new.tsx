import { useNavigate } from "react-router-dom";
import { CustomerForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateCustomer() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("customers.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <CustomerForm onSaved={(id) => navigate(`/customers/${id}`)} />
      </div>
    </>
  );
}

export { CreateCustomer as Component };
