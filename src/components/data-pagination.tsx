import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function DataPagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const { t, lang } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const isAr = lang === "ar";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/20 px-6 py-3 text-sm text-muted-foreground rounded-b-lg">
      <div className="flex items-center gap-1.5 order-2 sm:order-1">
        <span className="font-medium text-foreground">{from}–{to}</span>
        <span>/</span>
        <span>{total}</span>
        <span className="text-xs text-muted-foreground/80">({t("label.total")})</span>
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="h-8 gap-1 px-3 select-none"
        >
          {isAr ? (
            <>
              <span>{t("pagination.prev") || "السابق"}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>{t("pagination.prev") || "Previous"}</span>
            </>
          )}
        </Button>

        <span className="flex items-center justify-center font-medium text-foreground min-w-[60px] text-xs">
          {page} / {pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="h-8 gap-1 px-3 select-none"
        >
          {isAr ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>{t("pagination.next") || "التالي"}</span>
            </>
          ) : (
            <>
              <span>{t("pagination.next") || "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
