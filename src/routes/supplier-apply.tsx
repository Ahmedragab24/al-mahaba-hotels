import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGetCitiesQuery, useGetCountriesQuery } from "@/store/api";
import { useGetSupplierTypesQuery } from "@/store/services/attributes/supplier-types";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useSubmitJoinRequestMutation } from "@/store/services/supplier-requests/supplierRequestsService";
import { toast } from "sonner";
import logoUrl from "@/assets/daleel-logo-transparent.png";

type Form = {
  company_name_ar: string;
  company_name_en: string;
  supplier_type_id: number;
  tax_number: string;
  commercial_register: string;
  country_id: number;
  city_id: number;
  address: string;
  website: string;
  contact_name: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
};

const DRAFT_KEY = "supplier_apply_draft_v1";

export function Component() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>({
    company_name_ar: "",
    company_name_en: "",
    supplier_type_id: 1,
    tax_number: "",
    commercial_register: "",
    country_id: 0,
    city_id: 0,
    address: "",
    website: "",
    contact_name: "",
    contact_position: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const countriesQuery = useGetCountriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
    pollingInterval: 0,
  });
  const citiesQuery = useGetCitiesQuery(
    { country_id: form.country_id || undefined },
    {
      skip: !form.country_id,
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
      refetchOnFocus: false,
      pollingInterval: 0,
    }
  );
  const countries = extractArray(countriesQuery.data);
  const cities = useMemo(
    () => extractArray(citiesQuery.data),
    [citiesQuery.data],
  );
  const supplierTypesQuery = useGetSupplierTypesQuery({ lang });
  const supplierTypes = extractArray(supplierTypesQuery.data);

  const [submitJoinRequest] = useSubmitJoinRequestMutation();

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validStep0 = form.company_name_ar.trim() && form.company_name_en.trim() && form.supplier_type_id > 0;
  const validStep1 = form.country_id > 0 && form.city_id > 0;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim());
  const isValidPhone = /^\+[1-9]\d{1,14}$/.test(form.contact_phone.trim());
  const validStep2 = form.contact_name.trim() && isValidEmail && isValidPhone;

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      const res = await submitJoinRequest(form).unwrap();
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted({ id: res.id || "" });
      toast.success(t("supplier.apply.success_title"));
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || String(e);
      if (msg.includes("DUPLICATE")) setError(t("supplier.apply.err_duplicate"));
      else if (msg.includes("INVALID_EMAIL")) setError(t("supplier.apply.err_email"));
      else if (msg.includes("MISSING_FIELD")) setError(t("supplier.apply.err_missing"));
      else setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    const requestId = String(submitted.id);
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir={dir}
        style={{ background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), var(--background)" }}>
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">{t("supplier.apply.success_title")}</CardTitle>
            <CardDescription>{t("supplier.apply.success_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-semibold">{t("supplier.apply.request_id")}</span>
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">#{requestId.slice(0, 8)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("label.name_ar")}:</span>
                  <p className="font-medium">{form.company_name_ar}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("label.name_en")}:</span>
                  <p className="font-medium">{form.company_name_en}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("supplier.apply.contact_name")}:</span>
                  <p className="font-medium">{form.contact_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("label.email")}:</span>
                  <p className="font-medium">{form.contact_email}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/auth")} className="w-full">{t("supplier.apply.back_to_signin")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [t("supplier.apply.step_company"), t("supplier.apply.step_details"), t("supplier.apply.step_contact"), t("supplier.apply.step_review")];

  return (
    <div className="min-h-screen px-4 py-8" dir={dir}
      style={{ background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), var(--background)" }}>
      <div className="absolute end-4 top-4 z-10 flex items-center gap-1"><ThemeToggle /><LangSwitcher /></div>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoUrl} alt="" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">{t("supplier.apply.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("supplier.apply.subtitle")}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 text-muted-foreground"
                }`}>{i + 1}</div>
              <span className={`text-xs ${i === step ? "font-semibold" : "text-muted-foreground"} hidden sm:inline`}>{label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
            <CardDescription>{t(`supplier.apply.step${step}_desc`)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("label.name_ar")} *</Label>
                    <Input value={form.company_name_ar} onChange={(e) => set("company_name_ar", e.target.value)} required /></div>
                  <div className="space-y-2"><Label>{t("label.name_en")} *</Label>
                    <Input value={form.company_name_en} onChange={(e) => set("company_name_en", e.target.value)} required /></div>
                </div>
                <div className="space-y-2"><Label>{t("supplier.apply.type")} *</Label>
                  <Select value={form.supplier_type_id.toString()} onValueChange={(v) => set("supplier_type_id", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {supplierTypes.map((st: any) => (
                        <SelectItem key={st.id} value={st.id.toString()}>
                          {lang === "ar" ? st.name_ar : st.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("label.tax_number")}</Label>
                    <Input value={form.tax_number} onChange={(e) => set("tax_number", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("label.cr")}</Label>
                    <Input value={form.commercial_register} onChange={(e) => set("commercial_register", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("label.country")}</Label>
                    <Select value={form.country_id.toString()} onValueChange={(v) => { set("country_id", Number(v)); set("city_id", 0); }}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{countries.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                      ))}</SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>{t("label.city")}</Label>
                    <Select value={form.city_id.toString()} onValueChange={(v) => set("city_id", Number(v))} disabled={!form.country_id}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{cities.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                      ))}</SelectContent>
                    </Select></div>
                  <div className="space-y-2 sm:col-span-2"><Label>{t("label.address")}</Label>
                    <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>{t("label.website")}</Label>
                    <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></div>
                </div>
              </>
            )}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("supplier.apply.contact_name")} *</Label>
                  <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} required /></div>
                <div className="space-y-2"><Label>{t("supplier.apply.contact_position")}</Label>
                  <Input value={form.contact_position} onChange={(e) => set("contact_position", e.target.value)} /></div>
                 <div className="space-y-2">
                   <Label>{t("label.email")} *</Label>
                   <Input type="email" dir="ltr" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} required />
                   {form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim()) && (
                     <p className="text-[11px] text-destructive">
                       {lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address"}
                     </p>
                   )}
                 </div>
                 <div className="space-y-2">
                   <Label>{t("label.phone")} *</Label>
                   <Input dir="ltr" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+966500000000" required />
                   {form.contact_phone && !/^\+[1-9]\d{1,14}$/.test(form.contact_phone.trim()) && (
                     <p className="text-[11px] text-destructive">
                       {lang === "ar"
                         ? "يجب أن يبدأ رقم الهاتف بـ + ومفتاح الدولة (مثال: +966500000000)"
                         : "Phone must start with + and country code (e.g., +966500000000)"}
                     </p>
                   )}
                 </div>
               </div>
            )}
            {step === 3 && (
              <div className="space-y-3 text-sm">
                <div className="rounded-md border p-3">
                  <div className="font-semibold mb-2">{t("supplier.apply.step_company")}</div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>{t("label.name_ar")}:</div><div className="text-foreground">{form.company_name_ar}</div>
                    <div>{t("label.name_en")}:</div><div className="text-foreground">{form.company_name_en}</div>
                    <div>{t("supplier.apply.type")}:</div>
                    <div className="text-foreground">
                      {(() => {
                        const st = supplierTypes.find((st: any) => st.id === form.supplier_type_id);
                        if (!st) return form.supplier_type_id;
                        return lang === "ar" ? st.name_ar : st.name_en;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="font-semibold mb-2">{t("supplier.apply.step_contact")}</div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>{t("supplier.apply.contact_name")}:</div><div className="text-foreground">{form.contact_name}</div>
                    <div>{t("label.email")}:</div><div className="text-foreground">{form.contact_email}</div>
                    <div>{t("label.phone")}:</div><div className="text-foreground">{form.contact_phone}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("supplier.apply.review_note")}</p>
              </div>
            )}
            {error && <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</div>}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => (step === 0 ? navigate("/auth") : setStep(step - 1))} disabled={busy}>
                <ArrowLeft className="h-4 w-4 me-1" />{step === 0 ? t("supplier.apply.back_to_signin") : t("actions.back")}
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 0 && !validStep0) || (step === 1 && !validStep1) || (step === 2 && !validStep2)}
                >{t("supplier.apply.next")}</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={busy} style={{ background: "var(--gradient-brand)" }} className="text-white border-0">
                  {busy ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />{t("actions.saving")}</> : t("supplier.apply.submit")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/auth" className="hover:underline">{t("supplier.apply.have_account")}</Link>
        </p>
      </div>
    </div>
  );
}

export default Component;
