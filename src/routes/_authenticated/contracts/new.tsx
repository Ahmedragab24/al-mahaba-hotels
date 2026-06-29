import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { ContractForm } from "./-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewContract() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={t("contracts.new")}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/contracts")}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
          </Button>
        }
      />
      <div className="p-6"><ContractForm /></div>
    </>
  );
}

export { NewContract as Component };
