import { useNavigate } from "react-router-dom";
import { HotelForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateHotel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("hotels.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate("/hotels")}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <HotelForm onSaved={(id) => navigate(`/hotels/${id}`)} />
      </div>
    </>
  );
}

export { CreateHotel as Component };
