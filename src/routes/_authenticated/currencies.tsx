import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Search, Edit2, Trash2, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCountries } from "@/lib/lookups";

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

type CurrencyItem = {
  id?: number;
  code?: string;
  symbol?: string;
  symbol_ar?: string;
  symbol_en?: string;
  name_en?: string;
  name_ar?: string;
  country?: any;
  country_id?: number | string;
  rate_sar?: string;
  rate_to_sar?: number | string;
  is_active?: boolean;
  status?: boolean;
};

const PAGE_SIZE = 12;

export default function CurrenciesPage() {
  const { lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [editingItem, setEditingItem] = useState<CurrencyItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CurrencyItem | null>(null);
  const [formData, setFormData] = useState<CurrencyItem>({
    status: true,
    country_id: "",
    rate_to_sar: "",
  });

  const [sarRates, setSarRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/SAR")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          setSarRates(data.rates);
        }
      })
      .catch((err) => console.error("Failed to fetch exchange rates:", err));
  }, []);

  const currenciesQuery = useQuery({
    queryKey: ["currencies", lang],
    queryFn: async () => apiClient.currencies.getAll({ lang, per_page: 500 }),
  });

  const countriesQuery = useCountries({ lang, per_page: 500 });

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  let rawList = (currenciesQuery.data ?? []) as any;
  if (!Array.isArray(rawList)) {
    rawList = rawList?.data?.data || rawList?.data || [];
  }
  if (!Array.isArray(rawList)) rawList = [];

  let countriesList = (countriesQuery.data ?? []) as any;
  if (!Array.isArray(countriesList)) {
    countriesList = countriesList?.data?.data || countriesList?.data || [];
  }
  if (!Array.isArray(countriesList)) countriesList = [];

  const filteredList = (rawList as CurrencyItem[]).filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name_ar || "").toLowerCase().includes(q) ||
      (item.name_en || "").toLowerCase().includes(q) ||
      (item.code || "").toLowerCase().includes(q) ||
      (item.symbol_ar || item.symbol_en || item.symbol || "").toLowerCase().includes(q)
    );
  });

  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedList = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const canWrite = canWriteModule(auth, "currencies");

  const saveMutation = useMutation({
    mutationFn: async (payload: CurrencyItem) => {
      const parsedCountryId = payload.country_id ? Number(payload.country_id) : null;
      const dataToSave = {
        name_ar: payload.name_ar,
        name_en: payload.name_en,
        code: payload.code,
        symbol_ar: payload.symbol_ar || payload.symbol_en || payload.symbol || "$",
        symbol_en: payload.symbol_en || payload.symbol_ar || payload.symbol || "$",
        rate_to_sar: Number(payload.rate_to_sar ?? payload.rate_sar),
        country_id: parsedCountryId,
        status: payload.status !== undefined ? !!payload.status : !!payload.is_active,
      };

      if (editingItem && editingItem.id) {
        await apiClient.currencies.update(editingItem.id, dataToSave);
      } else {
        await apiClient.currencies.create(dataToSave);
      }
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم حفظ العملة" : "Currency saved");
      setIsFormOpen(false);
      setEditingItem(null);
      setFormData({ status: true });
      qc.invalidateQueries({ queryKey: ["currencies", lang] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      toast.error(message || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: CurrencyItem) => {
      await apiClient.currencies.delete(item.id!);
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم حذف العملة" : "Currency deleted");
      setDeleteItem(null);
      qc.invalidateQueries({ queryKey: ["currencies", lang] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      toast.error(message || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
    },
  });

  const openForm = (item: CurrencyItem | null = null) => {
    setEditingItem(item);
    setFormData(
      item
        ? {
          ...item,
          symbol_ar: item.symbol_ar ?? item.symbol,
          symbol_en: item.symbol_en ?? item.symbol,
          rate_to_sar: item.rate_to_sar ?? item.rate_sar,
          country_id: item.country_id ?? item.country,
          status: item.status ?? item.is_active,
        }
        : {
          code: undefined,
          symbol_ar: "",
          symbol_en: "",
          name_ar: undefined,
          name_en: undefined,
          country_id: "",
          rate_to_sar: "",
          status: true,
        },
    );
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error(lang === "ar" ? "يرجى اختيار رمز العملة" : "Please select a currency");
      return;
    }
    if (!formData.name_ar) {
      toast.error(lang === "ar" ? "يرجى إدخال اسم العملة" : "Please enter the currency name");
      return;
    }
    if (!formData.symbol_ar) {
      toast.error(lang === "ar" ? "يرجى إدخال الرمز بالعربية" : "Please enter the symbol in Arabic");
      return;
    }
    if (!formData.symbol_en) {
      toast.error(lang === "ar" ? "يرجى إدخال الرمز بالإنجليزية" : "Please enter the symbol in English");
      return;
    }
    if (formData.rate_to_sar === "" || formData.rate_to_sar === undefined || formData.rate_to_sar === null) {
      toast.error(lang === "ar" ? "حقل السعر بالريال مطلوب" : "Rate to SAR is required");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    const nameEn = getCurrencyNameEn(currencyCode);
    const nameAr = getCurrencyNameAr(currencyCode);
    const symbol = getCurrencySymbol(currencyCode);

    let rateToSar = "";
    if (currencyCode === "SAR") {
      rateToSar = "1";
    } else if (sarRates[currencyCode]) {
      rateToSar = (1 / sarRates[currencyCode]).toFixed(6);
    }

    setFormData({
      ...formData,
      code: currencyCode,
      symbol_ar: symbol,
      symbol_en: symbol,
      name_en: nameEn,
      name_ar: nameAr,
      rate_to_sar: rateToSar,
    });
  };

  return (
    <>
      <PageHeader
        title={lang === "ar" ? "العملات" : "Currencies"}
        subtitle={lang === "ar" ? `${totalItems} عملة` : `${totalItems} currencies`}
      />

      <div className="p-6 space-y-6" dir={dir}>
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Button
                onClick={() => openForm(null)}
                disabled={!canWrite}
                className="bg-[#a8702c] text-white hover:bg-[#915f23] rounded-xl px-5 h-11 font-medium transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>{lang === "ar" ? "إضافة عملة جديدة" : "Add New Currency"}</span>
              </Button>
              <div className="relative w-full md:w-80">
                <Input
                  type="text"
                  placeholder={lang === "ar" ? "بحث..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-10 ps-4 h-11 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                />
                <Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {currenciesQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#a8702c]" />
                <span className="text-sm text-muted-foreground">
                  {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                </span>
              </div>
            ) : paginatedList.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm border border-dashed rounded-2xl">
                {lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching currencies found"}
              </div>
            ) : (
              <div className="border border-border/40 rounded-2xl overflow-hidden shadow-sm bg-background/40">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox className="rounded" />
                      </TableHead>
                      <TableHead>{lang === "ar" ? "رمز العملة" : "Currency Code"}</TableHead>
                      <TableHead>{lang === "ar" ? "الرمز" : "Symbol"}</TableHead>
                      <TableHead>{lang === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}</TableHead>
                      <TableHead>
                        {lang === "ar" ? "الاسم بالانجليزية" : "Name (English)"}
                      </TableHead>
                      <TableHead>{lang === "ar" ? "الدولة" : "Country"}</TableHead>
                      <TableHead>{lang === "ar" ? "سعر الصرف (SAR)" : "Rate to SAR"}</TableHead>
                      <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-center w-28">
                        {lang === "ar" ? "الإجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((item, index) => {
                      const isActive = item.status !== undefined ? item.status : item.is_active !== false;
                      return (
                        <TableRow key={item.id || item.code || index} className="hover:bg-muted/20">
                          <TableCell>
                            <Checkbox className="rounded" />
                          </TableCell>
                          <TableCell className="font-mono uppercase">{item.code || "—"}</TableCell>
                          <TableCell className="font-medium">
                            {lang === "ar"
                              ? (item.symbol_ar || item.symbol || getCurrencySymbol(item.code || ""))
                              : (item.symbol_en || item.symbol || getCurrencySymbol(item.code || ""))}
                          </TableCell>
                          <TableCell>{item.name_ar || "—"}</TableCell>
                          <TableCell>{item.name_en || "—"}</TableCell>
                          <TableCell>
                            {item.country ? (
                              <span className="text-sm">
                                {lang === "ar"
                                  ? (item.country.name_ar || item.country.name)
                                  : (item.country.name_en || item.country.name)}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {item.rate_to_sar !== undefined && item.rate_to_sar !== null ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">{Number(item.rate_to_sar)} SAR</span>
                                {Number(item.rate_to_sar) > 0 && item.code !== "SAR" && (
                                  <span className="text-[10px] text-muted-foreground">
                                    1 SAR = {Number((1 / Number(item.rate_to_sar)).toFixed(4))} {item.code}
                                  </span>
                                )}
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                              )}
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

            {totalItems > 0 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4 px-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-border/50 disabled:opacity-40"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    {lang === "ar" ? (
                      <Search className="h-4 w-4" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        className={`h-9 w-9 rounded-xl font-semibold border-border/50 ${pageNum === page ? "bg-[#a8702c] hover:bg-[#915f23] text-white" : ""
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
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    {lang === "ar" ? (
                      <Search className="h-4 w-4" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {lang === "ar"
                    ? `عرض ${Math.min(totalItems, (page - 1) * PAGE_SIZE + 1)} إلى ${Math.min(totalItems, page * PAGE_SIZE)} من ${totalItems} عملة`
                    : `Showing ${Math.min(totalItems, (page - 1) * PAGE_SIZE + 1)} to ${Math.min(totalItems, page * PAGE_SIZE)} of ${totalItems} currencies`}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "تأكيد حذف العملة" : "Confirm Currency Delete"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {lang === "ar"
                ? `هل أنت متأكد من حذف العملة ${deleteItem?.code || ""}؟`
                : `Are you sure you want to delete ${deleteItem?.code || ""}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteItem(null)}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {editingItem
                ? lang === "ar"
                  ? `تعديل ${editingItem.code}`
                  : `Edit ${editingItem.code}`
                : lang === "ar"
                  ? "إضافة عملة جديدة"
                  : "Add New Currency"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? "يمكنك إضافة أو تعديل بيانات العملة هنا."
                : "Add or update currency details here."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 py-4">
            {/* Section 1: Basic Info */}
            <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {lang === "ar" ? "بيانات العملة الأساسية" : "Basic Currency Information"}
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency_code" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "العملة" : "Currency"} *
                  </Label>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild disabled={!!editingItem}>
                      <Button
                        id="currency_code"
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className={cn(
                          "w-full justify-between rounded-xl bg-background/50 h-11 px-3 text-sm font-normal border-border/50 text-left cursor-pointer",
                          !formData.code && "text-muted-foreground"
                        )}
                      >
                        {formData.code ? (
                          <span>
                            {lang === "ar"
                              ? `${getCurrencyNameAr(formData.code)} (${formData.code})`
                              : `${getCurrencyNameEn(formData.code)} (${formData.code})`}
                          </span>
                        ) : (
                          <span>{lang === "ar" ? "اختر العملة..." : "Select a currency..."}</span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput
                          placeholder={lang === "ar" ? "ابحث عن عملة..." : "Search currency..."}
                        />
                        <CommandList className="max-h-[250px]">
                          <CommandEmpty>
                            {lang === "ar" ? "لا توجد نتائج مطابقة" : "No matching results"}
                          </CommandEmpty>
                          <CommandGroup>
                            {Intl.supportedValuesOf("currency").map((currencyCode) => {
                              const nameEn = getCurrencyNameEn(currencyCode);
                              const nameAr = getCurrencyNameAr(currencyCode);
                              const label = `${nameAr} ${nameEn} ${currencyCode}`;
                              return (
                                <CommandItem
                                  key={currencyCode}
                                  value={label}
                                  onSelect={() => {
                                    handleCurrencySelect(currencyCode);
                                    setOpenCombobox(false);
                                  }}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Check
                                      className={cn(
                                        "h-4 w-4 shrink-0",
                                        formData.code === currencyCode ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span>
                                      {lang === "ar"
                                        ? `${nameAr} (${currencyCode})`
                                        : `${nameEn} (${currencyCode})`}
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

                <div className="space-y-2">
                  <Label htmlFor="currency_country" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "الدولة" : "Country"}
                  </Label>
                  <Select
                    value={formData.country_id ? String(formData.country_id) : undefined}
                    onValueChange={(val) => setFormData({ ...formData, country_id: val })}
                  >
                    <SelectTrigger id="currency_country" className="bg-background/50 rounded-xl h-11">
                      <SelectValue placeholder={lang === "ar" ? "اختر الدولة..." : "Select Country..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesList.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {lang === "ar" ? c.name_ar || c.name : c.name_en || c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency_name_ar" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "الاسم بالعربية" : "Name (Arabic)"} *
                  </Label>
                  <Input
                    id="currency_name_ar"
                    required
                    value={formData.name_ar || ""}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="bg-background/50 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_name_en" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "الاسم بالانجليزية" : "Name (English)"} *
                  </Label>
                  <Input
                    id="currency_name_en"
                    required
                    value={formData.name_en || ""}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="bg-background/50 rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol_ar" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "الرمز بالعربية" : "Symbol (Arabic)"} *
                  </Label>
                  <Input
                    id="currency_symbol_ar"
                    value={formData.symbol_ar || ""}
                    required
                    onChange={(e) => setFormData({ ...formData, symbol_ar: e.target.value })}
                    className="bg-background/50 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol_en" className="text-xs font-semibold text-foreground/80">
                    {lang === "ar" ? "الرمز بالإنجليزية" : "Symbol (English)"} *
                  </Label>
                  <Input
                    id="currency_symbol_en"
                    value={formData.symbol_en || ""}
                    required
                    onChange={(e) => setFormData({ ...formData, symbol_en: e.target.value })}
                    className="bg-background/50 rounded-xl h-11"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Exchange Rate */}
            <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {lang === "ar" ? "معدل الصرف والتحويل" : "Exchange & Conversion Rate"}
              </h4>

              <div className="space-y-2">
                <Label htmlFor="currency_rate_sar" className="text-xs font-semibold text-foreground/80">
                  {lang === "ar" ? "سعر الصرف مقابل الريال السعودي (SAR)" : "Exchange Rate to Saudi Riyal (SAR)"} *
                </Label>
                <Input
                  id="currency_rate_sar"
                  type="number"
                  step="0.000001"
                  value={formData.rate_to_sar || ""}
                  placeholder="0.00"
                  onChange={(e) => setFormData({ ...formData, rate_to_sar: e.target.value })}
                  className="bg-background/50 rounded-xl h-11"
                />
                {Number(formData.rate_to_sar) > 0 && formData.code && (
                  <div className="mt-1.5 p-3 rounded-xl border bg-muted/40 text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{lang === "ar" ? "سعر الصرف المباشر:" : "Direct Rate:"}</span>
                      <span className="font-semibold text-foreground">1 {formData.code} = {Number(formData.rate_to_sar)} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{lang === "ar" ? "سعر الصرف العكسي:" : "Inverse Rate:"}</span>
                      <span className="font-semibold text-foreground">1 SAR = {Number((1 / Number(formData.rate_to_sar)).toFixed(6))} {formData.code}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Switch */}
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold">{lang === "ar" ? "الحالة" : "Status"}</p>
                <p className="text-sm text-muted-foreground">
                  {(formData.status !== undefined ? formData.status : formData.is_active !== false)
                    ? lang === "ar"
                      ? "نشط"
                      : "Active"
                    : lang === "ar"
                      ? "غير نشط"
                      : "Inactive"}
                </p>
              </div>
              <Switch
                checked={formData.status !== undefined ? formData.status : formData.is_active ?? true}
                onCheckedChange={(value) => setFormData({ ...formData, status: !!value })}
              />
            </div>

            <DialogFooter className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsFormOpen(false)}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {lang === "ar" ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { CurrenciesPage as Component };
