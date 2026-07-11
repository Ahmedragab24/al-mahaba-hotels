import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery, useMutation, db, apiClient, dbErrorMessage } from "@/store/queryBridge";
import { useGetQuotationsQuery, useGetQuotationByIdQuery } from "@/store/services/quotations/quotationsService";
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
import { BookingForm } from "./-form";
import { cn } from "@/lib/utils";

export default function NewBooking() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [quoteId, setQuoteId] = useState("");
  const [open, setOpen] = useState(false);

  const selectedQuoteQuery = useGetQuotationByIdQuery(
    { id: quoteId, lang },
    { skip: !quoteId, pollingInterval: 2000 }
  );
  
  // Auto-refresh quotations list every 2 seconds to ensure latest data
  const { data: rawQuotes, isLoading: isLoadingQuotes } = useGetQuotationsQuery({ all: true, lang }, { pollingInterval: 2000 });

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

  const selectedQuote = useMemo(() => {
    const rawData = selectedQuoteQuery.data as any;
    const qDetails = rawData?.data || rawData;
    return qDetails || quotesList.find((q: any) => String(q.id) === String(quoteId));
  }, [selectedQuoteQuery.data, quotesList, quoteId]);

  const initialData = useMemo(() => {
    if (!selectedQuote) return null;
    const currCode = typeof selectedQuote?.currency === "object" ? selectedQuote.currency?.code : (selectedQuote?.currency ?? "SAR");
    const firstItem = selectedQuote?.items?.[0];
    const pd = firstItem?.price_details || {};
    
    const allStartDates = selectedQuote?.items?.map((it: any) => it.start_date).filter(Boolean) ?? [];
    const allEndDates = selectedQuote?.items?.map((it: any) => it.end_date).filter(Boolean) ?? [];
    const checkIn = allStartDates.length > 0 ? allStartDates.sort()[0] : (selectedQuote?.check_in || selectedQuote?.start_date || "");
    const checkOut = allEndDates.length > 0 ? allEndDates.sort().reverse()[0] : (selectedQuote?.check_out || selectedQuote?.end_date || "");
    
    const hotelId = selectedQuote?.hotel_id || pd.hotel_id || firstItem?.hotel_id || "";
    const countryId = selectedQuote?.hotel?.country_id || pd.hotel?.country_id || "";
    const cityId = selectedQuote?.hotel?.city_id || pd.hotel?.city_id || "";

    return {
      currency: currCode,
      customer_id: selectedQuote?.customer_id,
      currency_id: selectedQuote?.currency_id,
      hotel_id: hotelId,
      country_id: countryId,
      city_id: cityId,
      check_in: checkIn,
      check_out: checkOut,
      notes: selectedQuote?.notes,
      total_amount: selectedQuote?.total_value != null ? Math.round(Number(selectedQuote.total_value)) : undefined,
      rooms: selectedQuote?.items?.reduce((sum: number, it: any) => sum + (it.room_count || 1), 0) ?? 1,
      group_size: selectedQuote?.group_size ?? 1,
      is_direct: false,
      quotation_id: quoteId,
      items: selectedQuote?.items,
    };
  }, [selectedQuote, quoteId]);

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
      navigate(`/bookings`);
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
            <BookingForm onSaved={(id) => navigate(`/bookings`)} />
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

              {quoteId && selectedQuoteQuery.isLoading && (
                <div className="p-6 text-center text-muted-foreground">{t("label.loading")}</div>
              )}

              {quoteId && !selectedQuoteQuery.isLoading && initialData && (
                <BookingForm
                  key={quoteId || "quotation-booking"}
                  isQuotationConfirm={true}
                  initial={initialData}
                  onSaved={(id) => navigate(`/bookings`)}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export { NewBooking as Component };
