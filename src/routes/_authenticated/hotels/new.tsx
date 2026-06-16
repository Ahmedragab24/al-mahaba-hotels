import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HotelForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/hotels/new")({
  component: CreateHotel,
});

function CreateHotel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("hotels.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/hotels" })}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <HotelForm onSaved={(id) => navigate({ to: "/hotels/$id", params: { id } })} />
      </div>
    </>
  );
}
