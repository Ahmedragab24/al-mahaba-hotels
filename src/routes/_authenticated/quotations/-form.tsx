import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  useCountries,
  useCities,
  useCurrencies,
  useHotelRoomTypes,
  useHotelViews,
} from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { User, Globe, Building2, BedDouble, CalendarDays, FileText, Star, Trash2, MapPin } from "lucide-react";
import { SelectedRate } from "@/components/quotation-rates-dialog";
import { HotelRatesSelector } from "@/components/hotel-rates-selector";

type Props = {
  initial?: any;
  onSaved: (id: string) => void;
};

const BOARDS = [
  { code: "RO", label: { ar: "بدون وجبات (RO)", en: "Room Only (RO)" } },
  { code: "BB", label: { ar: "إفطار (BB)", en: "Bed & Breakfast (BB)" } },
  { code: "HB", label: { ar: "Half Board (HB)", en: "Half Board (HB)" } },
  { code: "FB", label: { ar: "Full Board (FB)", en: "Full Board (FB)" } },
  { code: "AI", label: { ar: "شامل كلياً (AI)", en: "All Inclusive (AI)" } },
  { code: "UAI", label: { ar: "شامل كلياً ممتاز (UAI)", en: "Ultra All Inclusive (UAI)" } },
];

// ─── Section Header Component ───────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border/60 mb-1">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Field Group Component ───────────────────────────────────────────────────
function FieldGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {children}
    </div>
  );
}

// ─── Form Field Wrapper ──────────────────────────────────────────────────────
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive ms-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Toggle Checkbox ─────────────────────────────────────────────────────────
function ToggleField({
  id,
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  accentColor = "primary",
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ElementType;
  accentColor?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${checked
        ? "border-primary/50 bg-primary/5"
        : "border-border hover:border-border/80 hover:bg-muted/30"
        }`}
    >
      <div className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted"
        }`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "start-5" : "start-1"
          }`} />
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-3.5 h-3.5 ${checked ? "text-primary" : "text-muted-foreground"}`} />}
          <span className={`text-sm font-medium ${checked ? "text-primary" : "text-foreground"}`}>
            {label}
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {checked && (
        <Badge variant="secondary" className="text-[10px] shrink-0 bg-primary/10 text-primary border-primary/20">
          ✓
        </Badge>
      )}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Form Component
// ═══════════════════════════════════════════════════════════════════════════════

export function QuotationForm({ initial, onSaved }: Props) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const [form, setForm] = useState({
    customer_id: initial?.customer_id ?? "",
    currency: initial?.currency ?? "SAR",
    quotation_date: initial?.quotation_date
      ? new Date(initial.quotation_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    travel_date: initial?.travel_date ?? "",
    expiry_date: initial?.expiry_date
      ? new Date(initial.expiry_date).toISOString().slice(0, 16)
      : "",
    notes: initial?.notes ?? "",
    country_code: initial?.country_code ?? "",
    city_id: initial?.city_id ?? "",
    language: initial?.language ?? "ar",
    hotel_id: initial?.hotel_id ?? "",
    group_name: initial?.group_name ?? "",
    is_recommended: initial?.is_recommended ?? false,
  });

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>([]);

  const countries = useCountries();
  const cities = useCities(form.country_code || null);
  const currencies = useCurrencies();



  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () =>
      (await supabase.from("customers").select("id,name_en,name_ar,customer_type").is("deleted_at", null).order("name_en")).data ?? [],
  });

  const hotelsQuery = useQuery({
    queryKey: ["lookup-hotels-with-loc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id,name_en,name_ar,city_id,country_code")
        .is("deleted_at", null)
        .order("name_en");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredHotels = useMemo(() => {
    let list = hotelsQuery.data ?? [];
    if (form.country_code) list = list.filter((h) => h.country_code === form.country_code);
    if (form.city_id) list = list.filter((h) => h.city_id === form.city_id);
    return list;
  }, [hotelsQuery.data, form.country_code, form.city_id]);

  const handleCountryChange = (val: string) => {
    setForm((f) => ({ ...f, country_code: val, city_id: "", hotel_id: "", room_type_id: "", view_id: "" }));
  };
  const handleCityChange = (val: string) => {
    setForm((f) => ({ ...f, city_id: val, hotel_id: "", room_type_id: "", view_id: "" }));
  };
  const handleHotelChange = (val: string) => {
    setForm((f) => ({ ...f, hotel_id: val }));
    setSelectedItems([]);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("quotes.customer") + " *");
      if (!form.expiry_date) throw new Error(t("quotes.expiry_date") + " *");
      const payload: any = {
        customer_id: form.customer_id,
        currency: form.currency || "SAR",
        quotation_date: form.quotation_date,
        travel_date: form.travel_date || null,
        expiry_date: form.expiry_date,
        notes: form.notes || null,
        country_code: form.country_code || null,
        city_id: form.city_id || null,
        language: form.language || null,
        hotel_id: form.hotel_id || null,
        group_name: form.group_name || null,
        is_recommended: !!form.is_recommended,
      };

      let qid = "";
      if (initial?.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", initial.id);
        if (error) throw error;
        qid = initial.id;
      } else {
        payload.created_by = auth.user?.id ?? null;
        const { data, error } = await supabase.from("quotations").insert(payload).select("id").single();
        if (error) throw error;
        qid = data.id as string;
      }

      // Save Quotation Items
      if (qid && selectedItems.length > 0) {
        const itemsPayload = selectedItems.map(item => ({
          quotation_id: qid,
          hotel_id: form.hotel_id,
          room_type_id: item.room_type_id,
          rooms: item.rooms,
          rate_id: item.rate_id,
          selling_price: item.selling_price,
          total_selling: item.selling_price * item.rooms * 1, // default 1 night
          nights: 1,
          check_in: form.travel_date || new Date().toISOString().slice(0, 10),
          check_out: form.travel_date || new Date().toISOString().slice(0, 10),
          occupancy_type: "double", // default
        }));
        const { error: itemsError } = await supabase.from("quotation_items").insert(itemsPayload);
        if (itemsError) throw itemsError;
      }
      return qid;
    },
    onSuccess: (id) => { toast.success(t("toast.saved")); onSaved(id); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const arLabel = (ar: string, en: string) => lang === "ar" ? ar : en;

  return (
    <div className="space-y-5">

      {/* ── Section 1: Customer & Quotation Info ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={User}
            title={arLabel("بيانات العميل والعرض", "Customer & Quotation Info")}
            subtitle={arLabel("المعلومات الأساسية للعرض والعميل", "Basic quotation and client details")}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-2 mt-4">
            <FormField label={t("quotes.customer")} required>
              <Select value={form.customer_id} onValueChange={(v) => set("customer_id", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر العميل", "Select customer")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)} — {t(`ctype.${c.customer_type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={arLabel("عدد المجموعه", "Group Size")}>
              <Input
                className="h-9"
                type="number"
                min={1}
                placeholder="1"
                value={form.group_name}
                onChange={(e) => set("group_name", e.target.value)}
              />
            </FormField>

            <FormField label={t("label.currency")} required>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("label.currency")} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.data?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.language", "لغة العرض")}>
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">🇸🇦 عربي</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="ur">🇵🇰 اردو</SelectItem>
                  <SelectItem value="id">🇮🇩 Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ── Section 2: Dates ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={CalendarDays}
            title={arLabel("التواريخ", "Dates")}
            subtitle={arLabel("تواريخ العرض والسفر", "Quotation and travel dates")}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-2 mt-4">
            <FormField label={t("quotes.quotation_date")} required>
              <Input className="h-9" type="datetime-local" value={form.quotation_date} onChange={(e) => set("quotation_date", e.target.value)} />
            </FormField>

            <FormField label={t("quotes.expiry_date")} required>
              <Input className="h-9" type="datetime-local" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
            </FormField>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ── Section 3: Location ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Building2}
            title={arLabel("واجهة الفندق", "Hotel Interface")}
            subtitle={arLabel("حدد الدولة والمدينة لتصفية الفنادق", "Select country and city to filter hotels")}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-3 mt-4">
            <FormField label={t("label.country", "الدولة")}>
              <Select value={form.country_code} onValueChange={handleCountryChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر الدولة", "Select country")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.data?.map((c: any) => (
                    <SelectItem key={c.code} value={c.code}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.city", "المدينة")}>
              <Select value={form.city_id} onValueChange={handleCityChange} disabled={!form.country_code}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر المدينة", "Select city")} />
                </SelectTrigger>
                <SelectContent>
                  {cities.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("rates.hotel", "الفندق")}>
              <Select value={form.hotel_id} onValueChange={handleHotelChange} disabled={!form.city_id}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر الفندق", "Select hotel")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredHotels.map((h: any) => (
                    <SelectItem key={h.id} value={h.id}>
                      {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FieldGroup>

          <HotelRatesSelector
            hotelId={form.hotel_id}
            currency={form.currency}
            selectedItems={selectedItems}
            onChange={(items) => setSelectedItems(items)}
          />
        </CardContent>
      </Card>



      {/* ── Section 5: Status & Recommendation ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Star}
            title={arLabel("التصنيف والتوصية", "Status & Recommendation")}
            subtitle={arLabel("تحديد ما إذا كان هذا العرض موصى به للعميل", "Mark if this offer is recommended to the customer")}
          />
          <div className="mt-4">
            <ToggleField
              id="is_recommended"
              label={arLabel("عرض موصى به (مميز)", "Recommended Offer (Featured)")}
              description={arLabel(
                "ستظهر شارة 'موصى به' على هذا العرض في قائمة العروض وبطاقة التفاصيل",
                "A 'Recommended' badge will appear on this offer in the list and detail view"
              )}
              checked={form.is_recommended}
              onChange={(v) => set("is_recommended", v)}
              icon={Star}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 6: Notes ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={FileText}
            title={t("label.notes")}
            subtitle={arLabel("أي ملاحظات أو تعليمات إضافية للعرض", "Any additional notes or instructions for the offer")}
          />
          <div className="mt-4">
            <Textarea
              className="min-h-[100px] resize-none"
              placeholder={arLabel("أدخل ملاحظاتك هنا...", "Enter your notes here...")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Save Button ── */}
      <div className="flex justify-end gap-3 pt-1">
        <Button
          size="lg"
          className="min-w-[160px] font-semibold"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending
            ? arLabel("جاري الحفظ...", "Saving...")
            : t("actions.save")}
        </Button>
      </div>


    </div>
  );
}
