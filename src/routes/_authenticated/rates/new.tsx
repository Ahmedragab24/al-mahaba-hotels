import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RateForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/rates/new")({
  component: CreateRate,
});

function CreateRate() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("rates.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/rates" })}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <RateForm onSaved={(id) => navigate({ to: "/rates/$id", params: { id } })} />
      </div>
    </>
  );
}
