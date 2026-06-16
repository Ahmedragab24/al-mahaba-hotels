import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { BookingForm } from "./-form";

export const Route = createFileRoute("/_authenticated/bookings/new")({
  component: NewBooking,
});

function NewBooking() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [quoteId, setQuoteId] = useState("");

  // accepted, not-yet-converted quotations
  const quotes = useQuery({
    queryKey: ["accepted-quotes"],
    queryFn: async () => {
      const { data: accepted } = await supabase
        .from("quotations")
        .select("id,quotation_no,currency,customer:customers(name_en,name_ar)")
        .eq("status", "accepted").is("deleted_at", null).order("created_at", { ascending: false });
      const { data: converted } = await supabase.from("bookings").select("quotation_id").not("quotation_id", "is", null).is("deleted_at", null);
      const used = new Set((converted ?? []).map((b: any) => b.quotation_id));
      return (accepted ?? []).filter((q: any) => !used.has(q.id));
    },
  });

  const convert = useMutation({
    mutationFn: async () => {
      if (!quoteId) throw new Error(t("bk.pick_quotation"));
      const { data, error } = await supabase.rpc("create_booking_from_quotation", { _quotation_id: quoteId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (id) => { toast.success(t("toast.saved")); navigate({ to: "/bookings/$id", params: { id } }); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <>
      <PageHeader
        title={t("bk.new")}
        children={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/bookings" })}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
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
            <BookingForm onSaved={(id) => navigate({ to: "/bookings/$id", params: { id } })} />
          </TabsContent>
          <TabsContent value="quotation">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1.5 max-w-lg">
                  <label className="text-sm">{t("bk.quotation")} *</label>
                  <Select value={quoteId} onValueChange={setQuoteId}>
                    <SelectTrigger><SelectValue placeholder={t("bk.pick_quotation")} /></SelectTrigger>
                    <SelectContent>
                      {(quotes.data ?? []).map((q: any) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.quotation_no} — {lang === "ar" ? (q.customer?.name_ar || q.customer?.name_en) : (q.customer?.name_en || q.customer?.name_ar)} ({q.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!quotes.isLoading && (quotes.data?.length ?? 0) === 0 && (
                    <p className="text-xs text-muted-foreground">{t("bk.no_accepted_quotes")}</p>
                  )}
                </div>
                <Button disabled={!quoteId || convert.isPending} onClick={() => convert.mutate()}>
                  {t("bk.create_from_quote")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
