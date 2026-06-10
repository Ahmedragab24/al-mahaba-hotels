import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuotationForm } from "./-form";

export const Route = createFileRoute("/_authenticated/quotations/new")({
  component: NewQuotation,
});

function NewQuotation() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={t("quotes.new")}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/quotations"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("actions.back")}</Link>
          </Button>
        }
      />
      <div className="p-6">
        <QuotationForm onSaved={(id) => navigate({ to: "/quotations/$id", params: { id } })} />
      </div>
    </>
  );
}
