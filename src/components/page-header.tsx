import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

// Map pathnames to i18n description keys. Longest prefix wins.
const PATH_DESC: Array<[string, string]> = [
  ["/customers", "pagedesc.customers"],
  ["/hotels", "pagedesc.hotels"],
  ["/suppliers", "pagedesc.suppliers"],
  ["/supplier-applications", "pagedesc.supplier_applications"],
  ["/supplier-portal", "pagedesc.supplier_portal"],
  ["/rates/compare", "pagedesc.rates_compare"],
  ["/rates", "pagedesc.rates"],
  ["/contracts", "pagedesc.contracts"],
  ["/rfqs", "pagedesc.rfqs"],
  ["/quotations", "pagedesc.quotations"],
  ["/bookings", "pagedesc.bookings"],
  ["/invoices", "pagedesc.invoices"],
  ["/receipts", "pagedesc.receipts"],
  ["/payables", "pagedesc.payables"],
  ["/reports/financial", "pagedesc.reports_financial"],
  ["/reports/operational", "pagedesc.reports_operational"],
  ["/reports/tax", "pagedesc.reports_tax"],
  ["/reports/templates", "pagedesc.reports_templates"],
  ["/reports", "pagedesc.reports"],
  ["/room-types", "pagedesc.room_types"],
  ["/seasons", "pagedesc.seasons"],
  ["/taxes", "pagedesc.taxes"],
  ["/users", "pagedesc.users"],
  ["/audit", "pagedesc.audit"],
  ["/settings", "pagedesc.settings"],
  ["/approval-thresholds", "pagedesc.approval_thresholds"],
];

function lookupKey(pathname: string): string | undefined {
  if (pathname === "/" || pathname === "") return "pagedesc.dashboard";
  const match = PATH_DESC.sort((a, b) => b[0].length - a[0].length).find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  return match?.[1];
}

export function PageHeader({
  title,
  subtitle,
  description,
  actions,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const autoKey = lookupKey(pathname);
  const autoDesc = autoKey ? t(autoKey, "") : "";
  const desc = description ?? (autoDesc && autoDesc !== autoKey ? autoDesc : undefined);

  return (
    <div className="flex flex-col gap-2 border-b bg-background/60 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
        {desc && <p className="mt-1 max-w-3xl text-sm text-muted-foreground/90">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
