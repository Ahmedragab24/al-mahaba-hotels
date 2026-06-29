import { useNavigate } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useGetQuotationsQuery } from "@/store/api";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { BookingForm } from "./-form";
import { cn } from "@/lib/utils";

export default function NewBooking() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [quoteId, setQuoteId] = useState("");
  const [open, setOpen] = useState(false);

  // accepted, not-yet-converted quotations
  const { data: rawQuotes, isLoading: isLoadingQuotes } = useGetQuotationsQuery({ all: true, lang });

  const convertedQuery = useQuery({
    queryKey: ["converted-booking-quotes"],
    queryFn: async () => {
      const { data } = await db
        .from("bookings")
        .select("quotation_id")
        .not("quotation_id", "is", null)
        .is("deleted_at", null);
      return data ?? [];
    }
  });

  const quotesList = useMemo(() => {
    if (!rawQuotes) return [];
    let list: any[] = [];
    if (Array.isArray(rawQuotes)) {
      list = rawQuotes;
    } else if (rawQuotes && Array.isArray((rawQuotes as any).data)) {
      list = (rawQuotes as any).data;
    } else if (rawQuotes && (rawQuotes as any).data && Array.isArray((rawQuotes as any).data.data)) {
      list = (rawQuotes as any).data.data;
    }

    // Filter out rejected and expired status
    list = list.filter((q: any) => q.status !== "rejected" && q.status !== "expired");

    const used = new Set((convertedQuery.data ?? []).map((b: any) => String(b.quotation_id)));
    return list.filter((q: any) => !used.has(String(q.id)));
  }, [rawQuotes, convertedQuery.data]);

  const convert = useMutation({
    mutationFn: async () => {
      if (!quoteId) throw new Error(t("bk.pick_quotation"));
      const data = await apiClient.bookings.createFromQuotation({
        _quotation_id: quoteId,
      });
      const error = null;
      if (error) throw error;
      if (typeof data !== "string") throw new Error(t("toast.error"));
      return data;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      navigate(`/bookings/${id}`);
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <>
      <PageHeader
        title={t("bk.new")}
        children={
          <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("actions.back")}
          </Button>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="direct" className="space-y-4">
          <TabsList>
            <TabsTrigger value="direct">{t("bk.source_direct")}</TabsTrigger>
            <TabsTrigger value="quotation">{t("bk.source_quotation")}</TabsTrigger>
          </TabsList>
          <TabsContent value="direct">
            <BookingForm onSaved={(id) => navigate(`/bookings/${id}`)} />
          </TabsContent>
          <TabsContent value="quotation">
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-1.5 max-w-lg flex flex-col">
                    <label className="text-sm">{t("bk.quotation")} *</label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 hover:text-accent-foreground text-left"
                        >
                          <span className="truncate">
                            {(() => {
                              const selected = quotesList.find(
                                (q: any) => String(q.id) === String(quoteId),
                              );
                              if (!selected) return t("bk.pick_quotation");
                              const qNo = selected.code || selected.quotation_no || "—";
                              const qCurr = typeof selected.currency === "object" ? selected.currency?.code : (selected.currency || "SAR");
                              return `${qNo} — ${lang === "ar" ? selected.customer?.name_ar || selected.customer?.name_en : selected.customer?.name_en || selected.customer?.name_ar} (${qCurr})`;
                            })()}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder={
                              lang === "ar"
                                ? "ابحث برقم عرض السعر أو اسم العميل..."
                                : "Search by quotation number or customer name..."
                            }
                          />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>
                              {lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
                            </CommandEmpty>
                            <CommandGroup>
                              {quotesList.map((q: any) => {
                                const qNo = q.code || q.quotation_no || "—";
                                const qCurr = typeof q.currency === "object" ? q.currency?.code : (q.currency || "SAR");
                                const label = `${qNo} ${q.customer?.name_en || ""} ${q.customer?.name_ar || ""} ${qCurr}`;
                                return (
                                  <CommandItem
                                    key={q.id}
                                    value={label.toLowerCase()}
                                    onSelect={() => {
                                      setQuoteId(q.id);
                                      setOpen(false);
                                    }}
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <Check
                                        className={cn(
                                          "h-4 w-4 shrink-0",
                                          String(quoteId) === String(q.id) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <span className="truncate">
                                        {qNo} —{" "}
                                        {lang === "ar"
                                          ? q.customer?.name_ar || q.customer?.name_en
                                          : q.customer?.name_en || q.customer?.name_ar}{" "}
                                        ({qCurr})
                                      </span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!isLoadingQuotes && (quotesList.length ?? 0) === 0 && (
                      <p className="text-xs text-muted-foreground">{t("bk.no_accepted_quotes")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(() => {
                const selected = quotesList.find((q: any) => String(q.id) === String(quoteId));
                const currCode = typeof selected?.currency === "object" ? selected.currency?.code : (selected?.currency ?? "SAR");
                return (
                  <BookingForm
                    key={quoteId || "quotation-booking"}
                    initial={{
                      currency: currCode,
                      customer_id: selected?.customer_id,
                      currency_id: selected?.currency_id,
                      hotel_id: selected?.hotel_id,
                      check_in: selected?.start_date,
                      check_out: selected?.end_date,
                      notes: selected?.notes,
                      total_amount: selected?.total_value,
                      is_direct: false,
                      quotation_id: quoteId,
                    }}
                    onSaved={(id) => navigate(`/bookings/${id}`)}
                  />
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export { NewBooking as Component };
