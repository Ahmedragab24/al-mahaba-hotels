import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CustomerForm } from "./-form";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers/new")({
  component: CreateCustomer,
});

function CreateCustomer() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("customers.new")} children={
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/customers" })}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
        </Button>
      } />
      <div className="p-6">
        <CustomerForm onSaved={(id) => navigate({ to: "/customers/$id", params: { id } })} />
      </div>
    </>
  );
}
