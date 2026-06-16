import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RfqForm } from "./-form";

export const Route = createFileRoute("/_authenticated/rfqs/new")({
  component: NewRfq,
});

function NewRfq() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={t("rfq.new")}
        children={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/rfqs" })}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
          </Button>
        }
      />
      <div className="p-6">
        <RfqForm onSaved={(id) => navigate({ to: "/rfqs/$id", params: { id } })} />
      </div>
    </>
  );
}
