import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RfqForm } from "./-form";

export default function NewRfq() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={t("rfq.new")}
        children={
          <Button variant="outline" size="sm" onClick={() => navigate("/rfqs")}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
          </Button>
        }
      />
      <div className="p-6">
        <RfqForm onSaved={(id) => navigate(`/rfqs/${id}`)} />
      </div>
    </>
  );
}

export { NewRfq as Component };
