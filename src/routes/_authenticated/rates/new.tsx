import { useNavigate, useSearchParams } from "react-router-dom";
import { RateForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetPriceByIdQuery } from "@/store/services/pricing/pricingService";

export default function CreateRate() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: editData } = useGetPriceByIdQuery({ id: editId || "", lang }, { skip: !editId });

  return (
    <>
      <PageHeader title={editId ? t("rates.edit") : t("rates.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate("/rates")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        {editId && !editData ? (
          <div className="text-muted-foreground">{t("label.loading")}</div>
        ) : (
          <RateForm initial={editData} onSaved={(id) => navigate(`/rates/${id}`)} />
        )}
      </div>
    </>
  );
}

export { CreateRate as Component };
