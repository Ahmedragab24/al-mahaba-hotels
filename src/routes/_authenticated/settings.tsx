import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Country, City } from "country-state-city";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useCurrencies } from "@/lib/lookups";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building,
  DollarSign,
  ShieldAlert,
  Globe,
  Loader2,
  Save,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ListChecks,
  Eye,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/settings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: SettingsPage,
});

// Dynamic Settings Default lists (stored in system_settings if modified)
const DEFAULT_NATIONALITIES = [
  { code: "SA", name_ar: "المملكة العربية السعودية", name_en: "Saudi Arabia", is_active: true },
  { code: "AE", name_ar: "الإمارات العربية المتحدة", name_en: "United Arab Emirates", is_active: true },
  { code: "EG", name_ar: "جمهورية مصر العربية", name_en: "Egypt", is_active: true },
  { code: "IN", name_ar: "جمهورية الهند", name_en: "India", is_active: true },
  { code: "PK", name_ar: "جمهورية باكستان الإسلامية", name_en: "Pakistan", is_active: true },
  { code: "BD", name_ar: "جمهورية بنغلاديش الشعبية", name_en: "Bangladesh", is_active: true },
  { code: "ID", name_ar: "جمهورية إندونيسيا", name_en: "Indonesia", is_active: true },
  { code: "TR", name_ar: "الجمهورية التركية", name_en: "Turkey", is_active: true },
  { code: "YE", name_ar: "الجمهورية اليمنية", name_en: "Yemen", is_active: true },
];

const DEFAULT_LANGUAGES = [
  { code: "ar", name_ar: "العربية", name_en: "Arabic", is_active: true },
  { code: "en", name_ar: "الإنجليزية", name_en: "English", is_active: true },
  { code: "id", name_ar: "الإندونيسية", name_en: "Indonesian", is_active: true },
  { code: "ur", name_ar: "الأوردو", name_en: "Urdu", is_active: true },
];

const DEFAULT_RATINGS = [
  { code: "5", name_ar: "5 نجوم", name_en: "5 Stars", is_active: true },
  { code: "4", name_ar: "4 نجوم", name_en: "4 Stars", is_active: true },
  { code: "3", name_ar: "3 نجوم", name_en: "3 Stars", is_active: true },
  { code: "2", name_ar: "نجمتان", name_en: "2 Stars", is_active: true },
  { code: "1", name_ar: "نجمة واحدة", name_en: "1 Star", is_active: true },
];

const defaultSettings: Record<string, any> = {
  "company.name_ar": "",
  "company.name_en": "",
  "company.default_currency": "SAR",
  "finance.base_currency": "SAR",
  "quotation.approval_threshold": 10000,
  "security.session_timeout_minutes": 30,
  "security.max_failed_attempts": 5,
  "security.lock_duration_minutes": 15,
  "security.password_min_length": 8,
  "localization.default_language": "ar",
};

const ARABIC_CITY_MAP: Record<string, string> = {
  "Riyadh": "الرياض",
  "Jeddah": "جدة",
  "Makkah": "مكة المكرمة",
  "Madinah": "المدينة المنورة",
  "Dammam": "الدمام",
  "Khobar": "الخبر",
  "Taif": "الطائف",
  "Tabuk": "تبوك",
  "Buraydah": "بريدة",
  "Khamis Mushait": "خميس مشيط",
  "Hufuf": "الهفوف",
  "Al Mubarraz": "المبرز",
  "Hafr Al-Batin": "حفر الباطن",
  "Hail": "حائل",
  "Sanaa": "صنعاء",
  "Aden": "عدن",
  "Cairo": "القاهرة",
  "Alexandria": "الإسكندرية",
  "Giza": "الجيزة",
  "Shubra El Kheima": "شبرا الخيمة",
  "Port Said": "بورسعيد",
  "Suez": "السويس",
  "Dubai": "دبي",
  "Abu Dhabi": "أبو ظبي",
  "Sharjah": "الشارقة",
  "Al Ain": "العين",
  "Ajman": "عجمان",
  "Manama": "المنامة",
  "Riffa": "الرفاع",
  "Muharraq": "المحرق",
  "Doha": "الدوحة",
  "Ar Rayyan": "الريان",
  "Muscat": "مسقط",
  "Seeb": "السيب",
  "Salalah": "صلالة",
  "Kuwait City": "الكويت",
  "Hawalli": "حولي",
  "Salmiya": "السالمية",
  "Amman": "عمان",
  "Zarqa": "الزرقاء",
  "Irbid": "إربد",
  "Baghdad": "بغداد",
  "Mosul": "الموصل",
  "Basra": "البصرة",
  "Erbil": "أربيل",
  "Damascus": "دمشق",
  "Aleppo": "حلب",
  "Homs": "حمص",
  "Latakia": "اللاذقية",
  "Beirut": "بيروت",
  "Tripoli": "طرابلس",
  "Sidon": "صيدا",
  "Tunis": "تونس",
  "Sfax": "صفاقس",
  "Sousse": "سوسة",
  "Algiers": "الجزائر",
  "Oran": "وهران",
  "Constantine": "قسنطينة",
  "Rabat": "الرباط",
  "Casablanca": "الدار البيضاء",
  "Fes": "فاس",
  "Marrakesh": "مراكش",
  "Tangier": "طنجة",
  "Khartoum": "الخرطوم",
  "Omdurman": "أم درمان",
  "Port Sudan": "بورتسودان",
};

const getCurrencySymbol = (code: string) => {
  try {
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: code });
    const parts = fmt.formatToParts(1);
    const symbolPart = parts.find(p => p.type === 'currency');
    return symbolPart ? symbolPart.value : code;
  } catch (e) {
    return code;
  }
};

const getCurrencyNameEn = (code: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) || code;
  } catch (e) {
    return code;
  }
};

const getCurrencyNameAr = (code: string) => {
  try {
    return new Intl.DisplayNames(['ar'], { type: 'currency' }).of(code) || code;
  } catch (e) {
    return code;
  }
};

const ISO_LANGUAGES = [
  "ar", "en", "fr", "es", "de", "it", "tr", "ru", "zh", "hi", "ur", "id", "pt", "ja", "ko",
  "bn", "fa", "he", "tl", "nl", "pl", "sv", "no", "fi", "da", "el", "th", "vi", "ms", "ro",
  "hu", "cs", "sk", "bg", "uk", "hr", "sr", "sl", "et", "lv", "lt", "is", "ga", "cy", "sq",
  "mk", "hy", "ka", "az", "uz", "kk", "ky", "tg", "tk", "ps", "ku", "sd", "am", "so", "sw",
  "yo", "ig", "ha", "zu", "xh", "af"
];

const getLanguageNameEn = (code: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code;
  } catch (e) {
    return code;
  }
};

const getLanguageNameAr = (code: string) => {
  try {
    return new Intl.DisplayNames(['ar'], { type: 'language' }).of(code) || code;
  } catch (e) {
    return code;
  }
};

function SettingsPage() {
  const { t, lang, dir } = useI18n();
  const qc = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("countries");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Selected Hotel state for room-types, views, meal-plans
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  // CRUD Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<any>({});

  // Custom UI states for searchable selection & bulk edits
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [currencyPopoverOpen, setCurrencyPopoverOpen] = useState(false);
  const [nationalityPopoverOpen, setNationalityPopoverOpen] = useState(false);
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false);
  const [selectedCountryCodeForCities, setSelectedCountryCodeForCities] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [selectedCityNames, setSelectedCityNames] = useState<string[]>([]);

  // 1. Fetch Counts for Cards
  const countsQuery = useQuery({
    queryKey: ["settings-lookup-counts"],
    queryFn: async () => {
      const [hRes, rtRes, mpRes, vRes] = await Promise.all([
        supabase.from("hotels").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("hotel_room_types").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("hotel_meal_plans").select("*", { count: "exact", head: true }),
        supabase.from("hotel_views").select("*", { count: "exact", head: true }),
      ]);
      return {
        hotels: hRes.count ?? 0,
        roomTypes: rtRes.count ?? 0,
        mealPlans: mpRes.count ?? 0,
        views: vRes.count ?? 0,
      };
    },
  });

  // 2. Fetch Hotels Lite
  const hotelsQuery = useQuery({
    queryKey: ["settings-hotels-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id, name_en, name_ar, code")
        .is("deleted_at", null)
        .order("name_en");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (hotelsQuery.data && hotelsQuery.data.length > 0 && !selectedHotelId) {
      setSelectedHotelId(hotelsQuery.data[0].id);
    }
  }, [hotelsQuery.data, selectedHotelId]);

  // 3. Fetch Tab Content Query
  const dataQuery = useQuery({
    queryKey: ["settings-lookup-tab", activeTab, selectedHotelId],
    queryFn: async () => {
      switch (activeTab) {
        case "countries": {
          const { data, error } = await supabase.from("countries").select("*").order("name_ar");
          if (error) throw error;
          return data ?? [];
        }
        case "cities": {
          const { data, error } = await supabase.from("cities").select("*").order("name_ar");
          if (error) throw error;
          return data ?? [];
        }
        case "currencies": {
          const { data, error } = await supabase.from("currencies").select("*").order("code");
          if (error) throw error;
          return data ?? [];
        }
        case "nationalities": {
          const { data, error } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "lookup.nationalities")
            .maybeSingle();
          if (error) throw error;
          return (data?.value as any[]) ?? DEFAULT_NATIONALITIES;
        }
        case "languages": {
          const { data, error } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "lookup.languages")
            .maybeSingle();
          if (error) throw error;
          return (data?.value as any[]) ?? DEFAULT_LANGUAGES;
        }
        case "room_types": {
          if (!selectedHotelId) return [];
          const { data, error } = await supabase
            .from("hotel_room_types")
            .select("*")
            .eq("hotel_id", selectedHotelId)
            .is("deleted_at", null)
            .order("sort_order");
          if (error) throw error;
          return data ?? [];
        }
        case "meal_plans": {
          if (!selectedHotelId) return [];
          const { data, error } = await supabase
            .from("hotel_meal_plans")
            .select("*")
            .eq("hotel_id", selectedHotelId)
            .order("name_en");
          if (error) throw error;
          return data ?? [];
        }
        case "views": {
          if (!selectedHotelId) return [];
          const { data, error } = await supabase
            .from("hotel_views")
            .select("*")
            .eq("hotel_id", selectedHotelId)
            .order("name_en");
          if (error) throw error;
          return data ?? [];
        }
        case "ratings": {
          const { data, error } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "lookup.hotel_ratings")
            .maybeSingle();
          if (error) throw error;
          return (data?.value as any[]) ?? DEFAULT_RATINGS;
        }
        default:
          return [];
      }
    },
    enabled: activeTab !== "general",
  });

  // Original System Settings logic preserved
  const originalSettingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
    enabled: activeTab === "general",
  });

  const [generalFormState, setGeneralFormState] = useState<Record<string, any>>(defaultSettings);

  useEffect(() => {
    if (originalSettingsQuery.data) {
      const loadedForm: Record<string, any> = { ...defaultSettings };
      originalSettingsQuery.data.forEach((item: any) => {
        loadedForm[item.key] = item.value;
      });
      setGeneralFormState(loadedForm);
    }
  }, [originalSettingsQuery.data]);

  const updateGeneralSetting = (key: string, value: any) => {
    setGeneralFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneralReset = () => {
    if (originalSettingsQuery.data) {
      const loadedForm: Record<string, any> = { ...defaultSettings };
      originalSettingsQuery.data.forEach((item: any) => {
        loadedForm[item.key] = item.value;
      });
      setGeneralFormState(loadedForm);
      toast.info(lang === "ar" ? "تمت استعادة الإعدادات الأصلية" : "Original settings restored");
    }
  };

  const saveGeneralMutation = useMutation({
    mutationFn: async (updatedSettings: Record<string, any>) => {
      const payload = Object.entries(updatedSettings).map(([key, value]) => ({
        key,
        value,
      }));
      const { error } = await supabase.from("system_settings").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  const handleGeneralSave = () => {
    saveGeneralMutation.mutate(generalFormState);
  };

  // Reset page when tab or hotel changes
  useEffect(() => {
    setPage(1);
    setSearchQuery("");
  }, [activeTab, selectedHotelId]);

  // Mutation for Add/Edit lookups
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      // If editing JSON-backed settings (Nationalities, Languages, Ratings)
      if (["nationalities", "languages", "ratings"].includes(activeTab)) {
        const key = activeTab === "nationalities"
          ? "lookup.nationalities"
          : activeTab === "languages"
            ? "lookup.languages"
            : "lookup.hotel_ratings";
        const currentList = [...(dataQuery.data ?? [])];
        if (editingItem) {
          // Edit
          const idx = currentList.findIndex(x => x.code === editingItem.code);
          if (idx !== -1) currentList[idx] = { ...payload };
        } else {
          // Add
          if (currentList.some(x => x.code === payload.code)) {
            throw new Error(lang === "ar" ? "الرمز مضاف بالفعل وموجود بالنظام" : "Code already exists in system");
          }
          currentList.push(payload);
        }
        const { error } = await supabase.from("system_settings").upsert({ key, value: currentList });
        if (error) throw error;
        return;
      }

      // If database tables
      if (activeTab === "countries") {
        if (editingItem) {
          const { error } = await supabase
            .from("countries")
            .update({
              name_ar: payload.name_ar,
              name_en: payload.name_en,
              phone_code: payload.phone_code,
              is_active: payload.is_active,
            })
            .eq("code", editingItem.code);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("countries").insert(payload);
          if (error) throw error;
        }
      } else if (activeTab === "cities") {
        if (editingItem) {
          const { error } = await supabase
            .from("cities")
            .update({
              name_ar: payload.name_ar,
              name_en: payload.name_en,
              country_code: payload.country_code,
              is_active: payload.is_active,
            })
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("cities").insert(payload);
          if (error) throw error;
        }
      } else if (activeTab === "currencies") {
        if (editingItem) {
          const { error } = await supabase
            .from("currencies")
            .update({
              name_ar: payload.name_ar,
              name_en: payload.name_en,
              symbol: payload.symbol,
              is_active: payload.is_active,
            })
            .eq("code", editingItem.code);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("currencies").insert(payload);
          if (error) throw error;
        }
      } else if (activeTab === "room_types") {
        const dbPayload = { ...payload, hotel_id: selectedHotelId };
        if (editingItem) {
          const { error } = await supabase
            .from("hotel_room_types")
            .update(dbPayload)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          dbPayload.max_adults = 2;
          dbPayload.max_children = 0;
          dbPayload.max_occupancy = 2;
          dbPayload.smoking_allowed = false;
          dbPayload.is_active = true;
          dbPayload.sort_order = 0;
          const { error } = await supabase.from("hotel_room_types").insert(dbPayload);
          if (error) throw error;
        }
      } else if (activeTab === "meal_plans") {
        const dbPayload = { ...payload, hotel_id: selectedHotelId };
        if (editingItem) {
          const { error } = await supabase
            .from("hotel_meal_plans")
            .update(dbPayload)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("hotel_meal_plans").insert(dbPayload);
          if (error) throw error;
        }
      } else if (activeTab === "views") {
        const dbPayload = { ...payload, hotel_id: selectedHotelId };
        if (editingItem) {
          const { error } = await supabase
            .from("hotel_views")
            .update(dbPayload)
            .eq("id", editingItem.id);
          if (error) throw error;
        } else {
          dbPayload.code = (payload.name_en || "").toUpperCase().trim().replace(/[^A-Z0-9]/g, "_");
          const { error } = await supabase.from("hotel_views").insert(dbPayload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({});
      qc.invalidateQueries({ queryKey: ["settings-lookup-tab", activeTab] });
      qc.invalidateQueries({ queryKey: ["settings-lookup-counts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  // Mutation for Delete lookups
  const deleteMutation = useMutation({
    mutationFn: async (item: any) => {
      if (["nationalities", "languages", "ratings"].includes(activeTab)) {
        const key = activeTab === "nationalities"
          ? "lookup.nationalities"
          : activeTab === "languages"
            ? "lookup.languages"
            : "lookup.hotel_ratings";
        const currentList = (dataQuery.data ?? []).filter((x: any) => x.code !== item.code);
        const { error } = await supabase.from("system_settings").upsert({ key, value: currentList });
        if (error) throw error;
        return;
      }

      if (activeTab === "countries") {
        const { error } = await supabase.from("countries").delete().eq("code", item.code);
        if (error) throw error;
      } else if (activeTab === "cities") {
        const { error } = await supabase.from("cities").delete().eq("id", item.id);
        if (error) throw error;
      } else if (activeTab === "currencies") {
        const { error } = await supabase.from("currencies").delete().eq("code", item.code);
        if (error) throw error;
      } else if (activeTab === "room_types") {
        // Soft delete room type
        const { error } = await supabase
          .from("hotel_room_types")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", item.id);
        if (error) throw error;
      } else if (activeTab === "meal_plans") {
        const { error } = await supabase.from("hotel_meal_plans").delete().eq("id", item.id);
        if (error) throw error;
      } else if (activeTab === "views") {
        const { error } = await supabase.from("hotel_views").delete().eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      setDeleteItem(null);
      qc.invalidateQueries({ queryKey: ["settings-lookup-tab", activeTab] });
      qc.invalidateQueries({ queryKey: ["settings-lookup-counts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  // Filter and Paginate List
  const rawList = dataQuery.data ?? [];
  const filteredList = rawList.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameAr = (item.name_ar || "").toLowerCase();
    const nameEn = (item.name_en || "").toLowerCase();
    const code = (item.code || item.board || "").toLowerCase();
    return nameAr.includes(query) || nameEn.includes(query) || code.includes(query);
  });

  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  const countriesList = useQuery({
    queryKey: ["settings-all-countries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("code, name_ar, name_en").order("name_ar");
      if (error) throw error;
      return data ?? [];
    },
    enabled: activeTab === "cities" || isFormOpen,
  });

  // Open Form Dialog for Create/Edit
  const openForm = (item: any | null = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      // Default values
      setFormData({
        is_active: true,
        max_adults: 2,
        max_children: 1,
        max_occupancy: 3,
        sort_order: 0,
        smoking_allowed: false,
        bed_type: "",
        size_sqm: null,
      });
    }
    // Reset custom UI states
    setCountryPopoverOpen(false);
    setCurrencyPopoverOpen(false);
    setNationalityPopoverOpen(false);
    setLanguagePopoverOpen(false);
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
        toast.error(lang === "ar" ? "يرجى تحديد مدينة واحدة على الأقل" : "Please select at least one city");
        return;
      }
      const payloads = selectedCityNames.map((cityName) => ({
        country_code: selectedCountryCodeForCities,
        name_en: cityName,
        name_ar: ARABIC_CITY_MAP[cityName] || cityName,
        is_active: true,
      }));
      saveMutation.mutate(payloads);
    } else {
      saveMutation.mutate(formData);
    }
  };

  return (
    <>
      <PageHeader title={lang === "ar" ? "إعدادات النظام" : "System Settings"} />

      <div className="p-6 mx-auto space-y-6" dir={dir}>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1: Hotels */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الفنادق" : "Hotels"}
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {countsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : countsQuery.data?.hotels}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#eff6ff] dark:bg-[#1e293b] flex items-center justify-center text-[#3b82f6]">
              <Building className="h-6 w-6" />
            </div>
          </Card>

          {/* Card 2: Room Types */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "أنواع الغرف" : "Room Types"}
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {countsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : countsQuery.data?.roomTypes}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#faf5ff] dark:bg-[#2e1065] flex items-center justify-center text-[#a855f7]">
              <ListChecks className="h-6 w-6" />
            </div>
          </Card>

          {/* Card 3: Meal Plans */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "أنواع الوجبات" : "Meal Types"}
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {countsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : countsQuery.data?.mealPlans}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#f0fdf4] dark:bg-[#14532d] flex items-center justify-center text-[#22c55e]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </Card>

          {/* Card 4: Views */}
          <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الإطلالات" : "Views"}
              </span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {countsQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : countsQuery.data?.views}
              </h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#fff7ed] dark:bg-[#7c2d12] flex items-center justify-center text-[#f97316]">
              <Eye className="h-6 w-6" />
            </div>
          </Card>
        </div>

        {/* Main Tabbed settings */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            {/* Custom styled list of tabs */}
            <div className="border-b border-border/40 bg-muted/20 px-6 py-2 overflow-x-auto flex">
              <TabsList className="bg-transparent flex w-max h-auto gap-1 p-0">
                <TabsTrigger
                  value="countries"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "الدول" : "Countries"}
                </TabsTrigger>
                <TabsTrigger
                  value="cities"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "المدن" : "Cities"}
                </TabsTrigger>
                <TabsTrigger
                  value="currencies"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "العملات" : "Currencies"}
                </TabsTrigger>
                <TabsTrigger
                  value="nationalities"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "الجنسيات" : "Nationalities"}
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "اللغات" : "Languages"}
                </TabsTrigger>
                <TabsTrigger
                  value="room_types"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "أنواع الغرف" : "Room Types"}
                </TabsTrigger>
                <TabsTrigger
                  value="meal_plans"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "خطط الوجبات" : "Meal Plans"}
                </TabsTrigger>
                <TabsTrigger
                  value="views"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "الإطلالات" : "Views"}
                </TabsTrigger>
                <TabsTrigger
                  value="ratings"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground"
                >
                  {lang === "ar" ? "تقييم الفنادق" : "Hotel Ratings"}
                </TabsTrigger>
                <TabsTrigger
                  value="general"
                  className="px-4 py-2 text-sm font-semibold rounded-full data-[state=active]:bg-[#a8702c] data-[state=active]:text-white transition-all text-muted-foreground flex items-center gap-1.5"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span>{lang === "ar" ? "إعدادات عامة" : "General Settings"}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* List Lookup Tabs Panels */}
            {activeTab !== "general" && (
              <div className="p-6 space-y-6">

                {/* Search, Filter Hotel (if applicable), and Add button row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => openForm(null)}
                      className="bg-[#a8702c] text-white hover:bg-[#915f23] rounded-xl px-5 h-11 font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{lang === "ar" ? "إضافة سمة جديدة" : "Add New Attribute"}</span>
                    </Button>

                    {/* Hotel Selector for hotel-specific lookups */}
                    {["room_types", "meal_plans", "views"].includes(activeTab) && (
                      <div className="w-64">
                        <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                          <SelectTrigger className="h-11 rounded-xl border-border/50 bg-background/50 focus:bg-background">
                            <SelectValue placeholder={lang === "ar" ? "اختر الفندق" : "Select Hotel"} />
                          </SelectTrigger>
                          <SelectContent>
                            {hotelsQuery.data?.map((hotel) => (
                              <SelectItem key={hotel.id} value={hotel.id}>
                                {hotel.code} - {lang === "ar" ? hotel.name_ar : hotel.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Right Search Input */}
                  <div className="relative w-full md:w-80">
                    <Input
                      type="text"
                      placeholder={lang === "ar" ? `البحث في ${t(`nav.${activeTab === "ratings" ? "ratings" : activeTab === "room_types" ? "room_types" : activeTab === "meal_plans" ? "meal_plans" : activeTab}`)}...` : `Search...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 ps-4 h-11 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                    />
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Table Data */}
                {dataQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#a8702c]" />
                    <span className="text-sm text-muted-foreground">{t("label.loading")}</span>
                  </div>
                ) : paginatedList.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground text-sm border border-dashed rounded-2xl">
                    {lang === "ar" ? "لا توجد نتائج مطابقة لبحثك" : "No results found matching your search"}
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
                          <TableHead>ENGLISH NAME</TableHead>

                          {/* Conditional headers based on Tab */}
                          {activeTab === "countries" && <TableHead>{lang === "ar" ? "رمز الدولة" : "Country Code"}</TableHead>}
                          {activeTab === "countries" && <TableHead>{lang === "ar" ? "مفتاح الاتصال" : "Phone Code"}</TableHead>}
                          {activeTab === "cities" && <TableHead>{lang === "ar" ? "الدولة" : "Country"}</TableHead>}
                          {activeTab === "currencies" && <TableHead>{lang === "ar" ? "رمز العملة" : "Currency Code"}</TableHead>}
                          {activeTab === "currencies" && <TableHead>{lang === "ar" ? "شعار العملة" : "Symbol"}</TableHead>}
                          {activeTab === "room_types" && <TableHead>{lang === "ar" ? "الرمز" : "Code"}</TableHead>}
                          {activeTab === "room_types" && <TableHead>{lang === "ar" ? "البالغين" : "Max Adults"}</TableHead>}
                          {activeTab === "room_types" && <TableHead>{lang === "ar" ? "الأطفال" : "Max Children"}</TableHead>}
                          {activeTab === "meal_plans" && <TableHead>{lang === "ar" ? "رمز الوجبة" : "Board"}</TableHead>}
                          {activeTab === "views" && <TableHead>{lang === "ar" ? "الرمز" : "Code"}</TableHead>}
                          {["nationalities", "languages", "ratings"].includes(activeTab) && <TableHead>{lang === "ar" ? "الرمز" : "Code"}</TableHead>}

                          <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                          <TableHead className="text-center w-28">{lang === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedList.map((item: any, index) => {
                          const nameAr = item.name_ar || "—";
                          const nameEn = item.name_en || "—";
                          const code = item.code || item.board || "—";
                          const isActive = item.is_active !== false;

                          return (
                            <TableRow key={item.id || item.code || index} className="hover:bg-muted/20">
                              <TableCell>
                                <Checkbox className="rounded" />
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                <div className="flex items-center gap-2">
                                  {activeTab === "countries" && (
                                    <img
                                      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                                      alt={nameEn}
                                      className="w-6 h-4 object-contain shadow-sm rounded-sm border border-border/40 shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  )}
                                  <span>{nameAr}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-medium">{nameEn}</TableCell>

                              {/* Conditional cell values */}
                              {activeTab === "countries" && <TableCell className="font-mono uppercase">{code}</TableCell>}
                              {activeTab === "countries" && <TableCell dir="ltr" className="text-start">{item.phone_code || "—"}</TableCell>}
                              {activeTab === "cities" && (
                                <TableCell>
                                  {countriesList.data?.find((c: any) => c.code === item.country_code)?.name_ar || item.country_code}
                                </TableCell>
                              )}
                              {activeTab === "currencies" && <TableCell className="font-mono uppercase">{code}</TableCell>}
                              {activeTab === "currencies" && <TableCell className="font-medium text-foreground">{item.symbol || "—"}</TableCell>}
                              {activeTab === "room_types" && <TableCell className="font-mono uppercase">{code}</TableCell>}
                              {activeTab === "room_types" && <TableCell className="font-semibold text-foreground">{item.max_adults}</TableCell>}
                              {activeTab === "room_types" && <TableCell className="font-semibold text-foreground">{item.max_children}</TableCell>}
                              {activeTab === "meal_plans" && <TableCell className="font-semibold text-foreground">{code}</TableCell>}
                              {activeTab === "views" && <TableCell className="font-semibold text-foreground">{code}</TableCell>}
                              {["nationalities", "languages", "ratings"].includes(activeTab) && <TableCell className="font-semibold text-foreground">{code}</TableCell>}

                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  }`}>
                                  {isActive ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
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

                {/* Table Pagination Footer */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between border-t border-border/40 pt-4 px-2">
                    {/* Left: page navigation controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-xl border-border/50 disabled:opacity-40"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {dir === "rtl" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </Button>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === page;
                        return (
                          <Button
                            key={pageNum}
                            variant={isCurrent ? "default" : "outline"}
                            className={`h-9 w-9 rounded-xl font-semibold border-border/50 ${isCurrent ? "bg-[#a8702c] hover:bg-[#915f23] text-white" : ""
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
                        {dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Right: Showing text */}
                    <span className="text-sm text-muted-foreground font-medium">
                      {lang === "ar"
                        ? `عرض ${Math.min(totalItems, (page - 1) * pageSize + 1)} إلى ${Math.min(totalItems, page * pageSize)} من ${totalItems} عنصر`
                        : `Showing ${Math.min(totalItems, (page - 1) * pageSize + 1)} to ${Math.min(totalItems, page * pageSize)} of ${totalItems} items`}
                    </span>
                  </div>
                )}

              </div>
            )}

            {/* General Configurations Tab (original forms preserved) */}
            <TabsContent value="general" className="p-0 m-0">
              {originalSettingsQuery.isLoading || originalSettingsQuery.isFetching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[#a8702c]" />
                  <span className="text-sm text-muted-foreground">{t("label.loading")}</span>
                </div>
              ) : (
                <>
                  <div className="border-b border-border/40 p-6">
                    <h3 className="text-lg font-bold text-foreground">
                      {lang === "ar" ? "إعدادات الشركة" : "Company Settings"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang === "ar"
                        ? "إدارة إعدادات وبيانات الشركة الأساسية للنظام."
                        : "Manage basic company settings and parameters for the system."}
                    </p>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="max-w-2xl">
                      {/* Section A: Company settings */}
                      <Card className="border border-border/30 bg-background/20 p-6 rounded-2xl space-y-4 shadow-sm">
                        <h4 className="font-bold text-foreground border-b border-border/30 pb-2 flex items-center gap-2">
                          <Building className="h-4 w-4 text-[#a8702c]" />
                          <span>{t("settings.company")}</span>
                        </h4>

                        <div className="space-y-2">
                          <Label htmlFor="company_name_ar" className="text-sm font-medium">
                            {t("settings.company_name_ar")}
                          </Label>
                          <Input
                            id="company_name_ar"
                            className="bg-background/50 focus:bg-background transition-all"
                            value={generalFormState["company.name_ar"] ?? ""}
                            onChange={(e) => updateGeneralSetting("company.name_ar", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_name_en" className="text-sm font-medium">
                            {t("settings.company_name_en")}
                          </Label>
                          <Input
                            id="company_name_en"
                            className="bg-background/50 focus:bg-background transition-all"
                            value={generalFormState["company.name_en"] ?? ""}
                            onChange={(e) => updateGeneralSetting("company.name_en", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="default_currency" className="text-sm font-medium">
                            {t("settings.default_currency")}
                          </Label>
                          <Select
                            value={generalFormState["company.default_currency"] ?? ""}
                            onValueChange={(val) => updateGeneralSetting("company.default_currency", val)}
                          >
                            <SelectTrigger id="default_currency" className="bg-background/50 focus:bg-background">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {rawList.map((c: any) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.code} - {lang === "ar" ? c.name_ar : c.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <CardFooter className="flex justify-end gap-3 border-t border-border/40 p-8 bg-muted/10">
                    <Button
                      variant="outline"
                      size="default"
                      className="gap-2 cursor-pointer active:scale-95 transition-all"
                      onClick={handleGeneralReset}
                      disabled={saveGeneralMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{t("actions.cancel")}</span>
                    </Button>
                    <Button
                      size="default"
                      className="gap-2 cursor-pointer active:scale-95 transition-all bg-[#a8702c] text-white hover:bg-[#915f23]"
                      onClick={handleGeneralSave}
                      disabled={saveGeneralMutation.isPending}
                    >
                      {saveGeneralMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saveGeneralMutation.isPending ? t("actions.saving") : t("actions.save")}</span>
                    </Button>
                  </CardFooter>
                </>
              )}
            </TabsContent>

          </Tabs>
        </Card>

      </div>

      {/* 1. Delete Confirmation Dialog */}
      <Dialog open={deleteItem !== null} onOpenChange={(o) => { if (!o) setDeleteItem(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {lang === "ar" ? "تأكيد حذف السمة" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {lang === "ar"
                ? `هل أنت متأكد من رغبتك في حذف "${deleteItem?.name_ar || deleteItem?.name_en || ""}"؟ قد يؤثر هذا الإجراء على الحجوزات والبيانات المرتبطة بالسمة.`
                : `Are you sure you want to delete "${deleteItem?.name_en || deleteItem?.name_ar || ""}"? This may affect linked reservations and systems data.`}
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
              {deleteMutation.isPending ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin mr-1" />
              ) : null}
              {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. CRUD Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingItem
                ? (lang === "ar" ? `تعديل ${editingItem.name_ar || editingItem.name_en}` : `Edit Item`)
                : (lang === "ar" ? "إضافة سمة جديدة" : "Add New Attribute")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? "يرجى تعبئة الحقول المطلوبة لبيانات السمة، وتحديد حالتها في النظام."
                : "Please fill in the required fields for the attribute and define its status in the system."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSave} className="space-y-4 py-4">

            {/* Field: code / PK */}
            {activeTab === "room_types" && (
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-semibold">
                  {lang === "ar" ? "رمز السمة / المعرّف" : "Code / Identifier"}
                </Label>
                <Input
                  id="code"
                  required
                  placeholder="etc."
                  disabled={editingItem !== null} // Disable primary key editing
                  className="bg-background/50 rounded-xl"
                  value={formData.code || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value });
                  }}
                />
              </div>
            )}

            {/* Country Selection Combobox (Add Country Form) */}
            {activeTab === "countries" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">{lang === "ar" ? "اختر الدولة" : "Select Country"}</Label>
                <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryPopoverOpen}
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 hover:text-accent-foreground text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? (() => {
                            const country = Country.getAllCountries().find((c) => c.isoCode === formData.code);
                            return country
                              ? `${country.name} (${country.isoCode})`
                              : (lang === "ar" ? "اختر الدولة..." : "Select Country...");
                          })()
                          : (lang === "ar" ? "اختر الدولة..." : "Select Country...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={lang === "ar" ? "ابحث عن دولة..." : "Search for a country..."} />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>{lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}</CommandEmpty>
                        <CommandGroup>
                          {Country.getAllCountries().map((country) => {
                            const isSelected = formData.code === country.isoCode;
                            return (
                              <CommandItem
                                key={country.isoCode}
                                value={`${country.name} ${country.isoCode}`}
                                onSelect={() => {
                                  let nameAr = "";
                                  let nameEn = "";
                                  try {
                                    nameAr = new Intl.DisplayNames(['ar'], { type: 'region' }).of(country.isoCode) || country.name;
                                  } catch (e) {
                                    nameAr = country.name;
                                  }
                                  try {
                                    nameEn = new Intl.DisplayNames(['en'], { type: 'region' }).of(country.isoCode) || country.name;
                                  } catch (e) {
                                    nameEn = country.name;
                                  }

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
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
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
                                </div>
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

            {/* Currency Selection Combobox (Add Currency Form) */}
            {activeTab === "currencies" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">{lang === "ar" ? "اختر العملة" : "Select Currency"}</Label>
                <Popover open={currencyPopoverOpen} onOpenChange={setCurrencyPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={currencyPopoverOpen}
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 hover:text-accent-foreground text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? (() => {
                            const nameEn = getCurrencyNameEn(formData.code);
                            return `${nameEn} (${formData.code})`;
                          })()
                          : (lang === "ar" ? "اختر العملة..." : "Select Currency...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={lang === "ar" ? "ابحث عن عملة..." : "Search for a currency..."} />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>{lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}</CommandEmpty>
                        <CommandGroup>
                          {Intl.supportedValuesOf('currency').map((currencyCode) => {
                            const isSelected = formData.code === currencyCode;
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
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate">
                                    {nameEn} ({currencyCode}) — {nameAr}
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
              </div>
            )}

            {/* Nationality Selection Combobox (Add Nationality Form) */}
            {activeTab === "nationalities" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">{lang === "ar" ? "اختر الجنسية" : "Select Nationality"}</Label>
                <Popover open={nationalityPopoverOpen} onOpenChange={setNationalityPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nationalityPopoverOpen}
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 hover:text-accent-foreground text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? (() => {
                            const country = Country.getAllCountries().find((c) => c.isoCode === formData.code);
                            return country
                              ? `${country.name} (${country.isoCode})`
                              : (lang === "ar" ? "اختر الجنسية..." : "Select Nationality...");
                          })()
                          : (lang === "ar" ? "اختر الجنسية..." : "Select Nationality...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={lang === "ar" ? "ابحث عن جنسية..." : "Search for nationality..."} />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>{lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}</CommandEmpty>
                        <CommandGroup>
                          {Country.getAllCountries().map((country) => {
                            const isSelected = formData.code === country.isoCode;
                            return (
                              <CommandItem
                                key={country.isoCode}
                                value={`${country.name} ${country.isoCode}`}
                                onSelect={() => {
                                  let nameAr = "";
                                  let nameEn = "";
                                  try {
                                    nameAr = new Intl.DisplayNames(['ar'], { type: 'region' }).of(country.isoCode) || country.name;
                                  } catch (e) {
                                    nameAr = country.name;
                                  }
                                  try {
                                    nameEn = new Intl.DisplayNames(['en'], { type: 'region' }).of(country.isoCode) || country.name;
                                  } catch (e) {
                                    nameEn = country.name;
                                  }

                                  setFormData({
                                    ...formData,
                                    code: country.isoCode,
                                    name_ar: nameAr,
                                    name_en: nameEn,
                                    is_active: true,
                                  });
                                  setNationalityPopoverOpen(false);
                                }}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
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
                                </div>
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

            {/* Language Selection Combobox (Add Language Form) */}
            {activeTab === "languages" && !editingItem && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold">{lang === "ar" ? "اختر اللغة" : "Select Language"}</Label>
                <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={languagePopoverOpen}
                      className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-accent/50 hover:text-accent-foreground text-left rtl:text-right"
                    >
                      <span className="truncate">
                        {formData.code
                          ? (() => {
                            const nameEn = getLanguageNameEn(formData.code);
                            return `${nameEn} (${formData.code})`;
                          })()
                          : (lang === "ar" ? "اختر اللغة..." : "Select Language...")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={lang === "ar" ? "ابحث عن لغة..." : "Search for a language..."} />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>{lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}</CommandEmpty>
                        <CommandGroup>
                          {ISO_LANGUAGES.map((langCode) => {
                            const isSelected = formData.code === langCode;
                            const nameEn = getLanguageNameEn(langCode);
                            const nameAr = getLanguageNameAr(langCode);
                            return (
                              <CommandItem
                                key={langCode}
                                value={`${nameEn} ${nameAr} ${langCode}`}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    code: langCode,
                                    name_ar: nameAr,
                                    name_en: nameEn,
                                    is_active: true,
                                  });
                                  setLanguagePopoverOpen(false);
                                }}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate">
                                    {nameEn} ({langCode}) — {nameAr}
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
              </div>
            )}

            {/* Field: Hotel Ratings Star Selector */}
            {activeTab === "ratings" && (
              <div className="space-y-2">
                <Label htmlFor="rating_stars" className="text-sm font-semibold">
                  {lang === "ar" ? "عدد النجوم" : "Number of Stars"}
                </Label>
                <Select
                  value={formData.code || ""}
                  onValueChange={(val) => {
                    const nameEn = val === "1" ? "1 Star" : `${val} Stars`;
                    const nameAr =
                      val === "5"
                        ? "5 نجوم"
                        : val === "4"
                          ? "4 نجوم"
                          : val === "3"
                            ? "3 نجوم"
                            : val === "2"
                              ? "نجمتان"
                              : "نجمة واحدة";
                    setFormData({
                      ...formData,
                      code: val,
                      name_en: nameEn,
                      name_ar: nameAr,
                      is_active: true,
                    });
                  }}
                >
                  <SelectTrigger id="rating_stars" className="bg-background/50 rounded-xl">
                    <SelectValue placeholder={lang === "ar" ? "اختر عدد النجوم" : "Select number of stars"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{lang === "ar" ? "★ (نجمة واحدة)" : "★ (1 Star)"}</SelectItem>
                    <SelectItem value="2">{lang === "ar" ? "★★ (نجمتان)" : "★★ (2 Stars)"}</SelectItem>
                    <SelectItem value="3">{lang === "ar" ? "★★★ (3 نجوم)" : "★★★ (3 Stars)"}</SelectItem>
                    <SelectItem value="4">{lang === "ar" ? "★★★★ (4 نجوم)" : "★★★★ (4 Stars)"}</SelectItem>
                    <SelectItem value="5">{lang === "ar" ? "★★★★★ (5 نجوم)" : "★★★★★ (5 Stars)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Field: Name Arabic */}
            {!(activeTab === "cities" && !editingItem) && activeTab !== "ratings" && (
              <div className="space-y-2">
                <Label htmlFor="name_ar" className="text-sm font-semibold">{lang === "ar" ? "الاسم بالعربي" : "Name (Arabic)"}</Label>
                <Input
                  id="name_ar"
                  required
                  className="bg-background/50 rounded-xl"
                  value={formData.name_ar || ""}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                />
              </div>
            )}

            {/* Field: Name English */}
            {!(activeTab === "cities" && !editingItem) && activeTab !== "ratings" && (
              <div className="space-y-2">
                <Label htmlFor="name_en" className="text-sm font-semibold">ENGLISH NAME</Label>
                <Input
                  id="name_en"
                  required
                  className="bg-background/50 rounded-xl"
                  value={formData.name_en || ""}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                />
              </div>
            )}

            {/* Specific Fields for Cities: country selection & bulk city list */}
            {activeTab === "cities" && (
              <>
                {editingItem ? (
                  // Edit view: read-only country & editable names
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">{lang === "ar" ? "الدولة" : "Country"}</Label>
                      <Input
                        disabled
                        className="bg-muted rounded-xl"
                        value={
                          countriesList.data?.find((c: any) => c.code === formData.country_code)?.name_ar ||
                          formData.country_code ||
                          ""
                        }
                      />
                    </div>
                  </div>
                ) : (
                  // Add view: country select and bulk city checklists
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city_country_code" className="text-sm font-semibold">
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
                        <SelectTrigger id="city_country_code" className="bg-background/50 rounded-xl">
                          <SelectValue placeholder={lang === "ar" ? "اختر الدولة" : "Select Country"} />
                        </SelectTrigger>
                        <SelectContent>
                          {countriesList.data?.map((c: any) => (
                            <SelectItem key={c.code} value={c.code}>
                              {lang === "ar" ? c.name_ar : c.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCountryCodeForCities && (
                      <div className="space-y-3 pt-2">
                        <Label className="text-sm font-semibold">
                          {lang === "ar" ? "اختر المدن المراد إضافتها" : "Select Cities to Add"}
                        </Label>

                        {/* Search Input for Cities */}
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder={lang === "ar" ? "ابحث عن مدينة..." : "Search city..."}
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            className="pe-10 ps-4 h-10 rounded-xl border-border/50 bg-background/50 focus:bg-background"
                          />
                          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Select All Checkbox */}
                        {(() => {
                          const availableCities = City.getCitiesOfCountry(selectedCountryCodeForCities) || [];
                          const filteredCities = availableCities.filter((city) =>
                            city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
                          );

                          if (filteredCities.length === 0) return null;

                          const allSelected = filteredCities.every((city) =>
                            selectedCityNames.includes(city.name)
                          );
                          const someSelected = filteredCities.some((city) =>
                            selectedCityNames.includes(city.name)
                          ) && !allSelected;

                          return (
                            <div className="flex items-center gap-2.5 px-2 py-1 bg-muted/30 border border-border/30 rounded-lg">
                              <Checkbox
                                id="select-all-cities"
                                className="rounded cursor-pointer"
                                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    const nextSelected = [...selectedCityNames];
                                    filteredCities.forEach((city) => {
                                      if (!nextSelected.includes(city.name)) {
                                        nextSelected.push(city.name);
                                      }
                                    });
                                    setSelectedCityNames(nextSelected);
                                  } else {
                                    const filteredNames = filteredCities.map((c) => c.name);
                                    setSelectedCityNames(
                                      selectedCityNames.filter((name) => !filteredNames.includes(name))
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
                          );
                        })()}

                        {/* Scrollable list of cities */}
                        <div className="border border-border/40 rounded-xl max-h-60 overflow-y-auto p-3 space-y-2 bg-background/30">
                          {(() => {
                            const availableCities = City.getCitiesOfCountry(selectedCountryCodeForCities) || [];
                            const filteredCities = availableCities.filter((city) =>
                              city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
                            );

                            if (filteredCities.length === 0) {
                              return (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                  {lang === "ar" ? "لا توجد مدن تطابق البحث" : "No cities match search"}
                                </div>
                              );
                            }

                            return filteredCities.map((city) => {
                              const isChecked = selectedCityNames.includes(city.name);
                              return (
                                <div
                                  key={city.name}
                                  className="flex items-center gap-2.5 hover:bg-muted/30 p-1.5 rounded-lg transition-colors"
                                >
                                  <Checkbox
                                    id={`city-${city.name}`}
                                    className="rounded cursor-pointer"
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedCityNames([...selectedCityNames, city.name]);
                                      } else {
                                        setSelectedCityNames(
                                          selectedCityNames.filter((name) => name !== city.name)
                                        );
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`city-${city.name}`}
                                    className="text-sm font-medium cursor-pointer flex-1 select-none"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span>{city.name}</span>
                                      {ARABIC_CITY_MAP[city.name] && (
                                        <span className="text-xs text-muted-foreground font-arabic">
                                          {ARABIC_CITY_MAP[city.name]}
                                        </span>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Specific Fields for Meal Plans: Board type dropdown & descriptions */}
            {activeTab === "meal_plans" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="board" className="text-sm font-semibold">{lang === "ar" ? "رمز نوع الوجبة" : "Meal Board Type"}</Label>
                  <Select
                    value={formData.board || ""}
                    onValueChange={(val) => setFormData({ ...formData, board: val })}
                  >
                    <SelectTrigger id="board" className="bg-background/50 rounded-xl">
                      <SelectValue placeholder={lang === "ar" ? "اختر النوع" : "Select Board Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RO">RO (Room Only - بدون وجبات)</SelectItem>
                      <SelectItem value="BB">BB (Bed & Breakfast - إفطار)</SelectItem>
                      <SelectItem value="HB">HB (Half Board - Half Board)</SelectItem>
                      <SelectItem value="FB">FB (Full Board - Full Board)</SelectItem>
                      <SelectItem value="AI">AI (All Inclusive - شامل)</SelectItem>
                      <SelectItem value="UAI">UAI (Ultra All Inclusive - شامل ممتاز)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar" className="text-sm font-semibold">{lang === "ar" ? "الوصف بالعربي" : "Description (Arabic)"}</Label>
                  <Input
                    id="description_ar"
                    className="bg-background/50 rounded-xl"
                    value={formData.description_ar || ""}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en" className="text-sm font-semibold">{lang === "ar" ? "الوصف بالانجليزي" : "Description (English)"}</Label>
                  <Input
                    id="description_en"
                    className="bg-background/50 rounded-xl"
                    value={formData.description_en || ""}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Specific Fields for Room Types: bed type and view name */}
            {activeTab === "room_types" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="view_name" className="text-sm font-semibold">
                    {lang === "ar" ? "الإطلالة" : "View"}
                  </Label>
                  <Input
                    id="view_name"
                    className="bg-background/50 rounded-xl"
                    value={formData.view_name || ""}
                    onChange={(e) => setFormData({ ...formData, view_name: e.target.value })}
                    placeholder={lang === "ar" ? "أدخل الإطلالة (مثال: إطلالة على البحر)" : "Enter view (e.g. Sea View)"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bed_type" className="text-sm font-semibold">
                    {lang === "ar" ? "نوع الغرفة" : "Room Type"}
                  </Label>
                  <Select
                    value={formData.bed_type || ""}
                    onValueChange={(val) => setFormData({ ...formData, bed_type: val })}
                  >
                    <SelectTrigger id="bed_type" className="bg-background/50 rounded-xl">
                      <SelectValue placeholder={lang === "ar" ? "اختر نوع الغرفة" : "Select room type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{lang === "ar" ? "أحادي" : "Single"}</SelectItem>
                      <SelectItem value="double">{lang === "ar" ? "ثنائي" : "Double"}</SelectItem>
                      <SelectItem value="triple">{lang === "ar" ? "ثلاثي" : "Triple"}</SelectItem>
                      <SelectItem value="quadruple">{lang === "ar" ? "رباعي" : "Quadruple"}</SelectItem>
                      <SelectItem value="quintuple">{lang === "ar" ? "خماسي" : "Quintuple"}</SelectItem>
                      <SelectItem value="sextuple">{lang === "ar" ? "سداسي" : "Sextuple"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
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
                {saveMutation.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin mr-1" />
                ) : null}
                {lang === "ar" ? "حفظ السمة" : "Save Attribute"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
