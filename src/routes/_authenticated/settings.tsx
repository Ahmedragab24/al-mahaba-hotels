import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { Country as CountryLib, State as StateLib, City as CityLib } from "country-state-city";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { apiClient } from "@/store/queryBridge";

// Arabic city name map for bulk-add flow
const ARABIC_CITY_MAP: Record<string, string> = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Makkah: "مكة المكرمة",
  Madinah: "المدينة المنورة",
  Dammam: "الدمام",
  Khobar: "الخبر",
  Taif: "الطائف",
  Tabuk: "تبوك",
  Buraydah: "بريدة",
  "Khamis Mushait": "خميس مشيط",
  Dubai: "دبي",
  "Abu Dhabi": "أبو ظبي",
  Sharjah: "الشارقة",
  "Al Ain": "العين",
  Ajman: "عجمان",
  Manama: "المنامة",
  Doha: "الدوحة",
  Muscat: "مسقط",
  Salalah: "صلالة",
  "Kuwait City": "الكويت",
  Amman: "عمان",
  Zarqa: "الزرقاء",
  Irbid: "إربد",
  Baghdad: "بغداد",
  Mosul: "الموصل",
  Basra: "البصرة",
  Damascus: "دمشق",
  Aleppo: "حلب",
  Beirut: "بيروت",
  Cairo: "القاهرة",
  Alexandria: "الإسكندرية",
  Giza: "الجيزة",
  Sanaa: "صنعاء",
  Aden: "عدن",
  Tunis: "تونس",
  Algiers: "الجزائر",
  Rabat: "الرباط",
  Casablanca: "الدار البيضاء",
  Marrakesh: "مراكش",
  Khartoum: "الخرطوم",
  // Saudi Arabia States/Regions
  "Al Madinah": "المدينة المنورة",
  "Al Madinah Region": "المدينة المنورة",
  "Makkah Region": "مكة المكرمة",
  "Riyadh Region": "الرياض",
  Asir: "عسير",
  "Asir Region": "عسير",
  "Al-Qassim": "القصيم",
  "Al-Qassim Region": "القصيم",
  "Tabuk Region": "تبوك",
  Hail: "حائل",
  "Hail Region": "حائل",
  Jazan: "جازان",
  "Jazan Region": "جازان",
  Najran: "نجران",
  "Najran Region": "نجران",
  "Al-Bahah": "الباحة",
  "Al-Bahah Region": "الباحة",
  "Al-Jouf": "الجوف",
  "Al-Jouf Region": "الجوف",
  "Northern Borders": "الحدود الشمالية",
  "Northern Borders Region": "الحدود الشمالية",
  "Eastern Province": "المنطقة الشرقية",
  // Egypt Governorates
  Luxor: "الأقصر",
  Aswan: "أسوان",
  "Red Sea": "البحر الأحمر",
  "South Sinai": "جنوب سيناء",
  "North Sinai": "شمال سيناء",
  Suez: "السويس",
  "Port Said": "بورسعيد",
  Ismailia: "الإسماعيلية",
  Qena: "قنا",
  Sohag: "سوهاج",
  Asyut: "أسيوط",
  Minya: "المنيا",
  "Beni Suef": "بني سويف",
  Faiyum: "الفيوم",
  Qalyubia: "القليوبية",
  Sharqia: "الشرقية",
  Dakahlia: "الدقهلية",
  Damietta: "دمياط",
  Gharbia: "الغربية",
  Monufia: "المنوفية",
  "Kafr El Sheikh": "كفر الشيخ",
  Beheira: "البحيرة",
  Matrouh: "مطروح",
  "New Valley": "الوادي الجديد",
  // UAE Emirates
  "Ras Al Khaimah": "رأس الخيمة",
  Fujairah: "الفجيرة",
  "Umm Al Quwain": "أم القيوين",
};

const getCurrencySymbol = (code: string) => {
  try {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    });
    const parts = fmt.formatToParts(1);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart ? symbolPart.value : code;
  } catch {
    return code;
  }
};

const getCurrencyNameEn = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) || code;
  } catch {
    return code;
  }
};

const getCurrencyNameAr = (code: string) => {
  try {
    return new Intl.DisplayNames(["ar"], { type: "currency" }).of(code) || code;
  } catch {
    return code;
  }
};

type ActiveTab =
  | "countries"
  | "cities"
  | "currencies"
  | "room_types"
  | "supplier_types"
  | "meal_plans"
  | "roles";

const TAB_LABELS: Record<ActiveTab, { ar: string; en: string }> = {
  countries: { ar: "الدول", en: "Countries" },
  cities: { ar: "المدن", en: "Cities" },
  currencies: { ar: "العملات", en: "Currencies" },
  room_types: { ar: "أنواع الغرف", en: "Room Types" },
  supplier_types: { ar: "أنواع الموردين", en: "Supplier Types" },
  meal_plans: { ar: "خطط الوجبات", en: "Meal Plans" },
  roles: { ar: "الأدوار", en: "Roles" },
};

/** Resolve active/inactive status from any item shape */
const getItemActive = (item: any): boolean => {
  if ("is_active" in item) return item.is_active !== false;
  if ("status" in item) return !!item.status;
  return true;
};

export default function SettingsPage() {
  const { t, lang, dir } = useI18n();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("countries");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Form helper state
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [currencyPopoverOpen, setCurrencyPopoverOpen] = useState(false);
  const [selectedCountryCodeForCities, setSelectedCountryCodeForCities] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [selectedCityNames, setSelectedCityNames] = useState<string[]>([]);

  // ── Main data query ──────────────────────────────────────────────────────
  const dataQuery = useQuery({
    queryKey: ["settings-lookup-tab", activeTab, lang],
    queryFn: async () => {
      switch (activeTab) {
        case "countries":
          return apiClient.countries.getAll({ lang, all: 1 });
        case "cities":
          return apiClient.cities.getAll({ lang, per_page: 2000 });
        case "currencies":
          return apiClient.currencies.getAll({
            lang,
            per_page: 500,
          });
        case "room_types":
          return apiClient.roomTypes.getAll({
            lang,
            per_page: 500,
          });
        case "supplier_types":
          return apiClient.supplierTypes.getAll({
            lang,
            per_page: 500,
          });
        case "meal_plans":
          return apiClient.mealPlans.getAll({ lang, all: 1 });
        case "roles":
          return apiClient.roles.getAll({ lang, all: 1 });
        default:
          return [];
      }
    },
  });

  // Countries list used inside the "Add city" form dropdown
  const countriesForCitiesQuery = useQuery({
    queryKey: ["settings-countries-for-cities"],
    queryFn: () => apiClient.countries.getAll({ all: 1 }),
    enabled: activeTab === "cities" || isFormOpen,
  });

  // Reset page/search when tab changes
  useEffect(() => {
    setPage(1);
    setSearchQuery("");
  }, [activeTab]);

  // ── Filter & paginate ────────────────────────────────────────────────────
  const rawData: any = dataQuery.data;
  const rawList = Array.isArray(rawData) ? rawData : rawData?.data || [];
  const filteredList = rawList.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name_ar || "").toLowerCase().includes(q) ||
      (item.name_en || "").toLowerCase().includes(q) ||
      (item.code || item.key || "").toLowerCase().includes(q)
    );
  });
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  // ── Save mutation ────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (activeTab === "countries") {
        if (editingItem) {
          await apiClient.countries.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            phone_code: payload.phone_code,
            symbol_ar: payload.phone_code,
            symbol_en: payload.phone_code,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.countries.create({
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            phone_code: payload.phone_code,
            symbol_ar: payload.phone_code,
            symbol_en: payload.phone_code,
            status: payload.is_active ? 1 : 0,
          });
        }
      } else if (activeTab === "cities") {
        if (editingItem) {
          await apiClient.cities.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          // Bulk city creation
          const rawCountries: any = countriesForCitiesQuery.data;
          const countryArr = Array.isArray(rawCountries) ? rawCountries : rawCountries?.data || [];
          const countryObj = countryArr.find((c: any) => c.code === selectedCountryCodeForCities);
          const countryId = countryObj?.id || selectedCountryCodeForCities;

          for (const cityName of payload as string[]) {
            await apiClient.cities.create({
              country_id: countryId,
              name_en: cityName,
              name_ar: ARABIC_CITY_MAP[cityName] || cityName,
              status: 1,
            });
          }
        }
      } else if (activeTab === "currencies") {
        if (editingItem) {
          await apiClient.currencies.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            symbol: payload.symbol,
            code: payload.symbol,
            symbol_ar: payload.symbol,
            symbol_en: payload.symbol,
            rate_to_sar: 1,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.currencies.create({
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            symbol: payload.symbol,
            code: payload.symbol,
            symbol_ar: payload.symbol,
            symbol_en: payload.symbol,
            rate_to_sar: 1,
            status: payload.is_active ? 1 : 0,
          });
        }
      } else if (activeTab === "room_types") {
        if (editingItem) {
          await apiClient.roomTypes.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            code: payload.code || editingItem.code,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.roomTypes.create({
            code: payload.code,
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        }
      } else if (activeTab === "supplier_types") {
        if (editingItem) {
          await apiClient.supplierTypes.update(editingItem.id, {
            key: payload.key || editingItem.key,
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.supplierTypes.create({
            key: payload.key,
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        }
      } else if (activeTab === "meal_plans") {
        if (editingItem) {
          await apiClient.mealPlans.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.mealPlans.create({
            key: payload.key,
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        }
      } else if (activeTab === "roles") {
        if (editingItem) {
          await apiClient.roles.update(editingItem.id, {
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        } else {
          await apiClient.roles.create({
            name_ar: payload.name_ar,
            name_en: payload.name_en,
            status: payload.is_active ? 1 : 0,
          });
        }
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({});
      qc.invalidateQueries({ queryKey: ["settings-lookup-tab", activeTab] });
    },
    onError: (err: any) => toast.error(err.message || t("toast.error")),
  });

  // ── Delete mutation ──────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (item: any) => {
      if (activeTab === "countries") {
        await apiClient.countries.delete(item.id);
      } else if (activeTab === "cities") {
        await apiClient.cities.delete(item.id);
      } else if (activeTab === "currencies") {
        await apiClient.currencies.delete(item.id);
      } else if (activeTab === "room_types") {
        await apiClient.roomTypes.delete(item.id);
      } else if (activeTab === "supplier_types") {
        await apiClient.supplierTypes.delete(item.id);
      } else if (activeTab === "meal_plans") {
        await apiClient.mealPlans.delete(item.id);
      } else if (activeTab === "roles") {
        await apiClient.roles.delete(item.id);
      }
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      setDeleteItem(null);
      qc.invalidateQueries({ queryKey: ["settings-lookup-tab", activeTab] });
    },
    onError: (err: any) => toast.error(err.message || t("toast.error")),
  });

  // ── Dialog helpers ───────────────────────────────────────────────────────
  const openForm = (item: any | null = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item, is_active: getItemActive(item) } : { is_active: true });
    setCountryPopoverOpen(false);
    setCurrencyPopoverOpen(false);
    setSelectedCountryCodeForCities("");
    setCitySearchQuery("");
    setSelectedCityNames([]);
    setIsFormOpen(true);
  };

  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "cities" && !editingItem) {
      if (!selectedCountryCodeForCities) {
        toast.error(lang === "ar" ? "يرجى اختيار الدولة أولاً" : "Please select a country first");
        return;
      }
      if (selectedCityNames.length === 0) {
        toast.error(
          lang === "ar" ? "يرجى تحديد مدينة واحدة على الأقل" : "Please select at least one city",
        );
        return;
      }
      saveMutation.mutate(selectedCityNames);
    } else {
      saveMutation.mutate(formData);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader title={lang === "ar" ? "إعدادات النظام" : "System Settings"} />

      <div className="p-6 mx-auto space-y-6" dir={dir}>
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ActiveTab)}
            className="w-full"
          >
            {/* Tab list */}
            <div className="border-b border-border/40 bg-muted/20 px-6 py-2 overflow-x-auto flex">
              <TabsList className="bg-transparent flex w-max h-auto gap-1 p-0">
                {(Object.keys(TAB_LABELS) as ActiveTab[]).map((value) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                  >
                    {lang === "ar" ? TAB_LABELS[value].ar : TAB_LABELS[value].en}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Button
                  onClick={() => openForm(null)}
                  className="bg-[#a8702c] text-white hover:bg-[#915f23] rounded-xl px-5 h-11 font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>{lang === "ar" ? "إضافة سمة جديدة" : "Add New Attribute"}</span>
                </Button>
                <div className="relative w-full md:w-80">
                  <Input
                    type="text"
                    placeholder={lang === "ar" ? "بحث..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-10 ps-4 h-11 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                  />
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Table */}
              {dataQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#a8702c]" />
                  <span className="text-sm text-muted-foreground">{t("label.loading")}</span>
                </div>
              ) : paginatedList.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground text-sm border border-dashed rounded-2xl">
                  {lang === "ar" ? "لا توجد نتائج مطابقة لبحثك" : "No results found"}
                </div>
              ) : (
                <div className="border border-border/40 rounded-2xl overflow-hidden shadow-sm bg-background/40">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox className="rounded" />
                        </TableHead>
                        <TableHead>{lang === "ar" ? "الاسم بالعربي" : "Name (Arabic)"}</TableHead>
                        <TableHead>
                          {lang === "ar" ? "الاسم بالانجليزي" : "Name (English)"}
                        </TableHead>
                        {activeTab === "countries" && (
                          <>
                            <TableHead>{lang === "ar" ? "رمز الدولة" : "Code"}</TableHead>
                            <TableHead>{lang === "ar" ? "مفتاح الاتصال" : "Phone Code"}</TableHead>
                          </>
                        )}
                        {activeTab === "cities" && (
                          <TableHead>{lang === "ar" ? "الدولة" : "Country"}</TableHead>
                        )}
                        {activeTab === "currencies" && (
                          <>
                            <TableHead>{lang === "ar" ? "رمز العملة" : "Code"}</TableHead>
                            <TableHead>{lang === "ar" ? "الرمز" : "Symbol"}</TableHead>
                          </>
                        )}
                        {activeTab === "room_types" && (
                          <TableHead>{lang === "ar" ? "الرمز" : "Code"}</TableHead>
                        )}
                        {(activeTab === "meal_plans" || activeTab === "supplier_types") && (
                          <TableHead>{lang === "ar" ? "المفتاح" : "Key"}</TableHead>
                        )}
                        <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                        <TableHead className="text-center w-28">
                          {lang === "ar" ? "الإجراءات" : "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedList.map((item: any, index: number) => {
                        const isActive = getItemActive(item);
                        return (
                          <TableRow
                            key={item.id || item.code || index}
                            className="hover:bg-muted/20"
                          >
                            <TableCell>
                              <Checkbox className="rounded" />
                            </TableCell>
                            <TableCell className="font-bold text-foreground">
                              <div className="flex items-center gap-2">
                                {activeTab === "countries" && (
                                  <img
                                    src={`https://flagcdn.com/w40/${(item.code || "").toLowerCase()}.png`}
                                    alt={item.name_en}
                                    className="w-6 h-4 object-contain shadow-sm rounded-sm border border-border/40 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                )}
                                <span>{item.name_ar || "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium">
                              {item.name_en || "—"}
                            </TableCell>
                            {activeTab === "countries" && (
                              <>
                                <TableCell className="font-mono uppercase">
                                  {item.code || "—"}
                                </TableCell>
                                <TableCell>{item.phone_code || "—"}</TableCell>
                              </>
                            )}
                            {activeTab === "cities" && (
                              <TableCell>
                                {(() => {
                                  const rawCountries = countriesForCitiesQuery.data as any[];
                                  const cId = item.country_id || item.country?.id;
                                  const cCode = item.country_code || item.country?.code;

                                  const country = rawCountries?.find(
                                    (c: any) =>
                                      (cId && String(c.id) === String(cId)) ||
                                      (cCode && c.code === cCode),
                                  );

                                  const name =
                                    lang === "ar"
                                      ? country?.name_ar ||
                                        item.country?.name_ar ||
                                        country?.name_en ||
                                        item.country?.name_en
                                      : country?.name_en ||
                                        item.country?.name_en ||
                                        country?.name_ar ||
                                        item.country?.name_ar;

                                  return name || cCode || cId || "—";
                                })()}
                              </TableCell>
                            )}
                            {activeTab === "currencies" && (
                              <>
                                <TableCell className="font-mono uppercase">
                                  {item.code || "—"}
                                </TableCell>
                                <TableCell className="font-medium">{item.symbol || "—"}</TableCell>
                              </>
                            )}
                            {activeTab === "room_types" && (
                              <TableCell className="font-mono uppercase">
                                {item.code || "—"}
                              </TableCell>
                            )}
                            {(activeTab === "meal_plans" || activeTab === "supplier_types") && (
                              <TableCell className="font-semibold">{item.key || "—"}</TableCell>
                            )}
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                              >
                                {isActive
                                  ? lang === "ar"
                                    ? "نشط"
                                    : "Active"
                                  : lang === "ar"
                                    ? "غير نشط"
                                    : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
                                  onClick={() => openForm(item)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10"
                                  onClick={() => setDeleteItem(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4 px-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-border/50 disabled:opacity-40"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {dir === "rtl" ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          className={`h-9 w-9 rounded-xl font-semibold border-border/50 ${
                            pageNum === page ? "bg-[#a8702c] hover:bg-[#915f23] text-white" : ""
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-border/50 disabled:opacity-40"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {dir === "rtl" ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {lang === "ar"
                      ? `عرض ${Math.min(totalItems, (page - 1) * pageSize + 1)} إلى ${Math.min(totalItems, page * pageSize)} من ${totalItems} عنصر`
                      : `Showing ${Math.min(totalItems, (page - 1) * pageSize + 1)} to ${Math.min(totalItems, page * pageSize)} of ${totalItems} items`}
                  </span>
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={deleteItem !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteItem(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {lang === "ar" ? "تأكيد حذف السمة" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {lang === "ar"
                ? `هل أنت متأكد من رغبتك في حذف "${deleteItem?.name_ar || deleteItem?.name_en || ""}"؟ قد يؤثر هذا على البيانات المرتبطة.`
                : `Are you sure you want to delete "${deleteItem?.name_en || deleteItem?.name_ar || ""}"? This may affect linked data.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 flex sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteItem(null)}
              className="rounded-xl border-border/50"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => deleteMutation.mutate(deleteItem)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingItem
                ? lang === "ar"
                  ? `تعديل ${editingItem.name_ar || editingItem.name_en}`
                  : "Edit Item"
                : lang === "ar"
                  ? "إضافة سمة جديدة"
                  : "Add New Attribute"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? "يرجى تعبئة الحقول المطلوبة لبيانات السمة."
                : "Please fill in the required fields for the attribute."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSave} className="space-y-4 py-4">
            {/* Room Types & Supplier Types: Code/Key field */}
            {(activeTab === "room_types" || activeTab === "supplier_types") && (
              <div className="space-y-2">
                <Label htmlFor="rt_code" className="text-sm font-semibold">
                  {lang === "ar" ? "رمز السمة / المعرّف" : "Code / Identifier"}
                </Label>
                <Input
                  id="rt_code"
                  required
                  disabled={!!editingItem}
                  className="bg-background/50 rounded-xl"
                  value={activeTab === "supplier_types" ? formData.key || "" : formData.code || ""}
                  onChange={(e) =>
                    activeTab === "supplier_types"
                      ? setFormData({ ...formData, key: e.target.value })
                      : setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
            )}

            {/* Meal Plans: Key selector (add only) */}
            {activeTab === "meal_plans" && !editingItem && (
              <div className="space-y-2">
                <Label htmlFor="mp_key" className="text-sm font-semibold">
                  {lang === "ar" ? "رمز نوع الوجبة" : "Meal Board Key"}
                </Label>
                <Select
                  value={formData.key || ""}
                  onValueChange={(val) => setFormData({ ...formData, key: val })}
                >
                  <SelectTrigger id="mp_key" className="bg-background/50 rounded-xl">
                    <SelectValue placeholder={lang === "ar" ? "اختر النوع" : "Select Board Type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RO">RO — Room Only (بدون وجبات)</SelectItem>
                    <SelectItem value="BB">BB — Bed & Breakfast (إفطار)</SelectItem>
                    <SelectItem value="HB">HB — Half Board</SelectItem>
                    <SelectItem value="FB">FB — Full Board</SelectItem>
                    <SelectItem value="AI">AI — All Inclusive (شامل)</SelectItem>
                    <SelectItem value="UAI">UAI — Ultra All Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Countries: Searchable combobox (add only) */}
            {activeTab === "countries" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">
                  {lang === "ar" ? "اختر الدولة" : "Select Country"}
                </Label>
                <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? (() => {
                              const c = CountryLib.getAllCountries().find(
                                (c) => c.isoCode === formData.code,
                              );
                              return c
                                ? `${c.name} (${c.isoCode})`
                                : lang === "ar"
                                  ? "اختر الدولة..."
                                  : "Select Country...";
                            })()
                          : lang === "ar"
                            ? "اختر الدولة..."
                            : "Select Country..."}
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
                        placeholder={lang === "ar" ? "ابحث عن دولة..." : "Search for a country..."}
                      />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                          {lang === "ar" ? "لا توجد نتائج" : "No results"}
                        </CommandEmpty>
                        <CommandGroup>
                          {CountryLib.getAllCountries().map((country) => (
                            <CommandItem
                              key={country.isoCode}
                              value={`${country.name} ${country.isoCode}`}
                              onSelect={() => {
                                let nameAr = country.name;
                                let nameEn = country.name;
                                try {
                                  nameAr =
                                    new Intl.DisplayNames(["ar"], {
                                      type: "region",
                                    }).of(country.isoCode) || country.name;
                                } catch {}
                                try {
                                  nameEn =
                                    new Intl.DisplayNames(["en"], {
                                      type: "region",
                                    }).of(country.isoCode) || country.name;
                                } catch {}
                                setFormData({
                                  ...formData,
                                  code: country.isoCode,
                                  phone_code: `+${country.phonecode.replace(/^\+/, "")}`,
                                  name_ar: nameAr,
                                  name_en: nameEn,
                                  is_active: true,
                                });
                                setCountryPopoverOpen(false);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  formData.code === country.isoCode ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <img
                                src={`https://flagcdn.com/w40/${country.isoCode.toLowerCase()}.png`}
                                alt={country.name}
                                className="w-5 h-3 object-contain shrink-0 rounded-sm border border-border/40"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="truncate">
                                {country.name} ({country.isoCode})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Currencies: Searchable combobox (add only) */}
            {activeTab === "currencies" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">
                  {lang === "ar" ? "اختر العملة" : "Select Currency"}
                </Label>
                <Popover open={currencyPopoverOpen} onOpenChange={setCurrencyPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? `${getCurrencyNameEn(formData.code)} (${formData.code})`
                          : lang === "ar"
                            ? "اختر العملة..."
                            : "Select Currency..."}
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
                        placeholder={lang === "ar" ? "ابحث عن عملة..." : "Search for a currency..."}
                      />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                          {lang === "ar" ? "لا توجد نتائج" : "No results"}
                        </CommandEmpty>
                        <CommandGroup>
                          {Intl.supportedValuesOf("currency").map((currencyCode) => {
                            const nameEn = getCurrencyNameEn(currencyCode);
                            const nameAr = getCurrencyNameAr(currencyCode);
                            return (
                              <CommandItem
                                key={currencyCode}
                                value={`${nameEn} ${nameAr} ${currencyCode}`}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    code: currencyCode,
                                    symbol: getCurrencySymbol(currencyCode),
                                    name_ar: nameAr,
                                    name_en: nameEn,
                                    is_active: true,
                                  });
                                  setCurrencyPopoverOpen(false);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    formData.code === currencyCode ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <span className="truncate">
                                  {nameEn} ({currencyCode}) — {nameAr}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Cities: Bulk country + city selector (add only) */}
            {activeTab === "cities" && !editingItem && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {lang === "ar" ? "اختر الدولة أولاً" : "Select Country First"}
                  </Label>
                  <Select
                    value={selectedCountryCodeForCities}
                    onValueChange={(val) => {
                      setSelectedCountryCodeForCities(val);
                      setSelectedCityNames([]);
                      setCitySearchQuery("");
                    }}
                  >
                    <SelectTrigger className="bg-background/50 rounded-xl">
                      <SelectValue placeholder={lang === "ar" ? "اختر الدولة" : "Select Country"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(countriesForCitiesQuery.data as any[])?.map((c: any) => (
                        <SelectItem key={c.code} value={c.code}>
                          {lang === "ar" ? c.name_ar : c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountryCodeForCities &&
                  (() => {
                    const availableCities = (
                      StateLib.getStatesOfCountry(selectedCountryCodeForCities) || []
                    ).map((state) => ({
                      ...state,
                      name: state.name
                        .replace(/\s+(Region|Province|Governorate|State|Emirate)$/i, "")
                        .replace(/^(Region|Province|Governorate|State|Emirate)\s+of\s+/i, "")
                        .trim(),
                    }));
                    const filteredCities = availableCities.filter((city) =>
                      city.name.toLowerCase().includes(citySearchQuery.toLowerCase()),
                    );
                    const allSelected =
                      filteredCities.length > 0 &&
                      filteredCities.every((city) => selectedCityNames.includes(city.name));
                    const someSelected =
                      filteredCities.some((city) => selectedCityNames.includes(city.name)) &&
                      !allSelected;
                    return (
                      <div className="space-y-3 pt-2">
                        <Label className="text-sm font-semibold">
                          {lang === "ar" ? "اختر المدن المراد إضافتها" : "Select Cities to Add"}
                        </Label>
                        <div className="relative">
                          <Input
                            placeholder={lang === "ar" ? "ابحث عن مدينة..." : "Search city..."}
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            className="pe-10 ps-4 h-10 rounded-xl"
                          />
                          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {filteredCities.length > 0 && (
                          <div className="flex items-center gap-2.5 px-2 py-1 bg-muted/30 border border-border/30 rounded-lg">
                            <Checkbox
                              id="select-all-cities"
                              className="rounded cursor-pointer"
                              checked={allSelected ? true : someSelected ? "indeterminate" : false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const next = [...selectedCityNames];
                                  filteredCities.forEach((c) => {
                                    if (!next.includes(c.name)) next.push(c.name);
                                  });
                                  setSelectedCityNames(next);
                                } else {
                                  const names = filteredCities.map((c) => c.name);
                                  setSelectedCityNames(
                                    selectedCityNames.filter((n) => !names.includes(n)),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor="select-all-cities"
                              className="text-sm font-semibold cursor-pointer select-none"
                            >
                              {lang === "ar"
                                ? `تحديد الكل (${filteredCities.length} مدينة)`
                                : `Select All (${filteredCities.length} cities)`}
                            </Label>
                          </div>
                        )}
                        <div className="border border-border/40 rounded-xl max-h-60 overflow-y-auto p-3 space-y-2 bg-background/30">
                          {filteredCities.length === 0 ? (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                              {lang === "ar" ? "لا توجد مدن" : "No cities"}
                            </div>
                          ) : (
                            filteredCities.map((city) => (
                              <div
                                key={city.name}
                                className="flex items-center gap-2.5 hover:bg-muted/30 p-1.5 rounded-lg transition-colors"
                              >
                                <Checkbox
                                  id={`city-${city.name}`}
                                  className="rounded cursor-pointer"
                                  checked={selectedCityNames.includes(city.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked)
                                      setSelectedCityNames([...selectedCityNames, city.name]);
                                    else
                                      setSelectedCityNames(
                                        selectedCityNames.filter((n) => n !== city.name),
                                      );
                                  }}
                                />
                                <Label
                                  htmlFor={`city-${city.name}`}
                                  className="text-sm font-medium cursor-pointer flex-1 select-none"
                                >
                                  <div className="flex justify-between items-center">
                                    <span>{city.name}</span>
                                    {ARABIC_CITY_MAP[city.name] && (
                                      <span className="text-xs text-muted-foreground">
                                        {ARABIC_CITY_MAP[city.name]}
                                      </span>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}

            {/* Cities edit / all other tabs: Name fields */}
            {!(activeTab === "cities" && !editingItem) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name_ar" className="text-sm font-semibold">
                    {lang === "ar" ? "الاسم بالعربي" : "Name (Arabic)"}
                  </Label>
                  <Input
                    id="name_ar"
                    required
                    className="bg-background/50 rounded-xl"
                    value={formData.name_ar || ""}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en" className="text-sm font-semibold">
                    {lang === "ar" ? "الاسم بالانجليزي" : "Name (English)"}
                  </Label>
                  <Input
                    id="name_en"
                    required
                    className="bg-background/50 rounded-xl"
                    value={formData.name_en || ""}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Status Switch */}
            {!(activeTab === "cities" && !editingItem) && (
              <div className="flex items-center gap-2 mt-4 bg-muted/30 p-3 rounded-xl border border-border/30">
                <Switch 
                  id="is_active" 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} 
                />
                <Label htmlFor="is_active" className="text-sm font-semibold cursor-pointer">
                  {lang === "ar" ? "الحالة: نشط" : "Status: Active"}
                </Label>
              </div>
            )}

            <DialogFooter className="pt-4 border-t gap-2 flex sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border/50"
                onClick={() => setIsFormOpen(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-[#a8702c] hover:bg-[#915f23] text-white rounded-xl px-6"
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {lang === "ar" ? "حفظ السمة" : "Save Attribute"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { SettingsPage as Component };
