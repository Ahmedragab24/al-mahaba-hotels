import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api/api-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import {
  useCountries,
  useCities,
  useCurrencies,
} from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  User,
  Building2,
  CalendarDays,
  FileText,
  Star,
} from "lucide-react";
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
function FieldGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-4 ${className}`}>{children}</div>;
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
      <div
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted"
          }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "start-5" : "start-1"
            }`}
        />
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
          {Icon && (
            <Icon className={`w-3.5 h-3.5 ${checked ? "text-primary" : "text-muted-foreground"}`} />
          )}
          <span className={`text-sm font-medium ${checked ? "text-primary" : "text-foreground"}`}>
            {label}
          </span>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {checked && (
        <Badge
          variant="secondary"
          className="text-[10px] shrink-0 bg-primary/10 text-primary border-primary/20"
        >
          ✓
        </Badge>
      )}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Form Component
// ═══════════════════════════════════════════════════════════════════════════════

const toLocalISOString = (dateInput: Date | string) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function QuotationForm({ initial, onSaved }: Props) {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const [form, setForm] = useState({
    customer_id: String(initial?.customer_id ?? ""),
    group_size: String(initial?.group_size ?? ""),
    currency_id: String(initial?.currency_id ?? ""),
    language_id: String(initial?.language_id ?? "1"),
    start_date: initial?.start_date
      ? toLocalISOString(initial.start_date)
      : toLocalISOString(new Date()),
    end_date: initial?.end_date
      ? toLocalISOString(initial.end_date)
      : "",
    hotel_id: String(initial?.hotel_id ?? ""),
    country_id: "",
    city_id: "",
    is_recommended: initial?.is_recommended ?? false,
    notes: initial?.notes ?? "",
    status: initial?.status ?? "draft",
  });

  const [selectedItems, setSelectedItems] = useState<SelectedRate[]>(() => {
    // Convert existing items to SelectedRate format when editing
    if (initial?.items && Array.isArray(initial.items)) {
      return initial.items.map((item: any) => ({
        rate_id: String(item.price_id),
        room_type_id: String(item.price_details?.room?.room_type_id || item.price_details?.room_id),
        view_id: String(item.price_details?.hotel_view_id || null),
        meal_plan: item.price_details?.meal_plan_type || "exclusive",
        selling_price: item.night_price,
        rooms: item.room_count,
        supplier_id: String(item.price_details?.supplier_id || null),
        is_direct: item.price_details?.is_direct || false,
        // UI Display info
        room_name_en: item.price_details?.room?.name_en,
        room_name_ar: item.price_details?.room?.name_ar,
        room_type_name_en: item.room_type?.name_en || item.price_details?.room_type?.name_en || item.price_details?.room?.room_type?.name_en,
        room_type_name_ar: item.room_type?.name_ar || item.price_details?.room_type?.name_ar || item.price_details?.room?.room_type?.name_ar,
        view_name_en: item.price_details?.hotel_view?.name_en,
        view_name_ar: item.price_details?.hotel_view?.name_ar,
        supplier_name_en: item.price_details?.supplier?.name_en,
        supplier_name_ar: item.price_details?.supplier?.name_ar,
        room: item.price_details?.room,
        room_type: item.room_type || item.price_details?.room_type || item.price_details?.room?.room_type,
      }));
    }
    return [];
  });



  const currencies = useCurrencies({ lang, per_page: 500 });

  const currencyCode = useMemo(() => {
    if (!form.currency_id) return "";
    const currencyList = Array.isArray(currencies.data) ? currencies.data : (currencies.data?.data ? Array.isArray(currencies.data.data) ? currencies.data.data : [currencies.data.data] : []);
    const currency = currencyList.find((c: any) => String(c.id) === form.currency_id);
    return currency?.code || "";
  }, [form.currency_id, currencies.data]);

  const nights = useMemo(() => {
    if (form.start_date && form.end_date) {
      const startDateStr = form.start_date.split(/[ T]/)[0];
      const endDateStr = form.end_date.split(/[ T]/)[0];
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      }
    }
    return 0;
  }, [form.start_date, form.end_date]);

  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await apiClient.customers.getAll()) ?? [],
  });

  const hotelsQuery = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => {
      const response = await apiClient.hotels.getAll();
      const data = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
      return data;
    },
  });

  const handleHotelChange = (val: string) => {
    setForm((f) => ({ ...f, hotel_id: val }));
    setSelectedItems([]);
  };

  const handleCountryChange = (val: string) => {
    setForm((f) => ({ ...f, country_id: val, city_id: "", hotel_id: "" }));
    setSelectedItems([]);
  };

  const handleCityChange = (val: string) => {
    setForm((f) => ({ ...f, city_id: val, hotel_id: "" }));
    setSelectedItems([]);
  };

  const countries = useCountries({ lang, per_page: 500 });
  const countryList = Array.isArray(countries.data) ? countries.data : Array.isArray(countries.data?.data) ? countries.data.data : [];

  const cities = useCities(form.country_id || null);
  const cityList = Array.isArray(cities.data) ? cities.data : Array.isArray(cities.data?.data) ? cities.data.data : [];

  const filteredHotels = useMemo(() => {
    let list = Array.isArray(hotelsQuery.data) ? hotelsQuery.data : [];
    if (form.country_id) list = list.filter((h: any) => String(h.country_id) === String(form.country_id));
    if (form.city_id) list = list.filter((h: any) => String(h.city_id) === String(form.city_id));
    return list;
  }, [hotelsQuery.data, form.country_id, form.city_id]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error(t("quotes.customer") + " *");
      if (!form.currency_id) throw new Error(t("label.currency") + " *");
      if (!form.language_id) throw new Error(t("label.language") + " *");
      if (!form.start_date) throw new Error(t("quotes.start_date") + " *");
      if (!form.end_date) throw new Error(t("quotes.end_date") + " *");
      if (!form.hotel_id) throw new Error(t("quotes.hotel") + " *");
      if (selectedItems.length === 0) throw new Error(t("quotes.items_required"));

      const payload: any = {
        customer_id: Number(form.customer_id),
        group_size: form.group_size ? Number(form.group_size) : null,
        currency_id: Number(form.currency_id),
        language_id: Number(form.language_id),
        start_date: form.start_date.replace('T', ' '),
        end_date: form.end_date.replace('T', ' '),
        hotel_id: Number(form.hotel_id),
        is_recommended: !!form.is_recommended,
        notes: form.notes || null,
        status: form.status || "draft",
        items: selectedItems.map((item) => ({
          price_id: item.rate_id,
          room_count: item.rooms,
        })),
      };

      let qid = "";
      if (initial?.id) {
        await apiClient.quotations.update(initial.id, payload);
        qid = initial.id;
      } else {
        const data = await apiClient.quotations.create(payload);
        qid = data.id as string;
      }
      return qid;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      onSaved(id);
    },
    onError: (e: any) => toast.error(dbErrorMessage(e)),
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const arLabel = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <div className="space-y-5">
      {/* ── Section 1: Customer & Quotation Info ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={User}
            title={arLabel("بيانات العميل والعرض", "Customer & Quotation Info")}
            subtitle={arLabel(
              "المعلومات الأساسية للعرض والعميل",
              "Basic quotation and client details",
            )}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-2 mt-4">
            <FormField label={t("quotes.customer")} required>
              <Select value={form.customer_id} onValueChange={(v) => set("customer_id", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر العميل", "Select customer")} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [])?.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar} —{" "}
                      {t(`ctype.${c.type}`, c.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.customer_id && (() => {
                const custList = Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [];
                const selCust = custList?.find((c: any) => String(c.id) === String(form.customer_id));
                if (selCust?.country) {
                  return (
                    <div className="text-sm text-end text-muted-foreground mt-1">
                      ( {lang === "ar" ? selCust.country.name_ar : selCust.country.name_en} )
                    </div>
                  );
                }
                return null;
              })()}
            </FormField>

            <FormField label={arLabel("عدد الأشخاص", "Number of Persons")}>
              <Input
                className="h-9"
                type="number"
                min={1}
                placeholder="1"
                value={form.group_size}
                onChange={(e) => set("group_size", e.target.value)}
              />
            </FormField>

            <FormField label={t("label.currency")} required>
              <Select value={form.currency_id} onValueChange={(v) => set("currency_id", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("label.currency")} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(currencies.data) ? currencies.data : Array.isArray(currencies.data?.data) ? currencies.data.data : [])?.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.code} — {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.language", "لغة العرض")} required>
              <Select value={form.language_id} onValueChange={(v) => set("language_id", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🇸🇦 عربي</SelectItem>
                  <SelectItem value="2">🇬🇧 English</SelectItem>
                  <SelectItem value="3">🇵🇰 اردو</SelectItem>
                  <SelectItem value="4">🇮🇩 Indonesia</SelectItem>
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
            subtitle={arLabel("تواريخ العرض", "Quotation dates")}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-2 mt-4">
            <FormField label={arLabel("تاريخ البداية", "Start Date")} required>
              <Input
                className="h-9"
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </FormField>

            <FormField label={arLabel("تاريخ النهاية", "End Date")} required>
              <Input
                className="h-9"
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </FormField>
          </FieldGroup>

          {nights > 0 && (
            <div className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-border/50 flex items-center gap-2">
              <span className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 rounded text-base font-bold">{nights}</span>
              {arLabel("ليالي", "Nights")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Hotel Selection ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Building2}
            title={arLabel("الوجهة والفندق", "Destination & Hotel")}
            subtitle={arLabel("اختر الدولة والمدينة والفندق", "Select country, city and hotel")}
          />
          <FieldGroup className="grid-cols-1 md:grid-cols-3 mt-4">
            <FormField label={t("label.country", "الدولة")}>
              <Select value={form.country_id} onValueChange={handleCountryChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر الدولة", "Select country")} />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("label.city", "المدينة")}>
              <Select
                value={form.city_id}
                onValueChange={handleCityChange}
                disabled={!form.country_id}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر المدينة", "Select city")} />
                </SelectTrigger>
                <SelectContent>
                  {cityList.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t("rates.hotel", "الفندق")} required>
              <Select
                value={form.hotel_id}
                onValueChange={handleHotelChange}
                disabled={!form.city_id}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={arLabel("اختر الفندق", "Select hotel")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredHotels.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {arLabel("لا يتوفر فنادق في هذه المدينة", "No hotels available in this city")}
                    </SelectItem>
                  ) : (
                    filteredHotels.map((h: any) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar}
                        {h.star_rating || h.stars ? " " + "★".repeat(h.star_rating || h.stars) : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>
          </FieldGroup>

          <HotelRatesSelector
            hotelId={form.hotel_id}
            currencyId={form.currency_id}
            currencyCode={currencyCode}
            selectedItems={selectedItems}
            onChange={(items) => setSelectedItems(items)}
            nights={nights}
            groupSize={form.group_size}
          />
        </CardContent>
      </Card>

      {/* ── Section 5: Status & Recommendation ── */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-5">
          <SectionHeader
            icon={Star}
            title={arLabel("التصنيف والتوصية", "Status & Recommendation")}
            subtitle={arLabel(
              "تحديد ما إذا كان هذا العرض موصى به للعميل",
              "Mark if this offer is recommended to the customer",
            )}
          />
          <div className="mt-4">
            <ToggleField
              id="is_recommended"
              label={arLabel("عرض موصى به (مميز)", "Recommended Offer (Featured)")}
              description={arLabel(
                "ستظهر شارة 'موصى به' على هذا العرض في قائمة العروض وبطاقة التفاصيل",
                "A 'Recommended' badge will appear on this offer in the list and detail view",
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
            subtitle={arLabel(
              "أي ملاحظات أو تعليمات إضافية للعرض",
              "Any additional notes or instructions for the offer",
            )}
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
          {save.isPending ? arLabel("جاري الحفظ...", "Saving...") : t("actions.save")}
        </Button>
      </div>
    </div>
  );
}
