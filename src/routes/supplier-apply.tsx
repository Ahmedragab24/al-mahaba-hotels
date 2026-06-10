import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  submitSupplierApplication,
  getApplyLookups,
  type SupplierType,
} from "@/lib/supplier-applications.functions";
import logoUrl from "@/assets/daleel-logo-transparent.png";

export const Route = createFileRoute("/supplier-apply")({
  ssr: false,
  component: ApplyPage,
});

type Form = {
  name_ar: string; name_en: string; supplier_type: SupplierType;
  legal_name: string; tax_number: string; commercial_registration: string;
  country_code: string; city_id: string; address_line1: string; website: string;
  contact_name: string; contact_email: string; contact_phone: string; contact_position: string;
};

const DRAFT_KEY = "supplier_apply_draft_v1";

function ApplyPage() {
  const { t, dir, lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>({
    name_ar: "", name_en: "", supplier_type: "direct_hotel",
    legal_name: "", tax_number: "", commercial_registration: "",
    country_code: "", city_id: "", address_line1: "", website: "",
    contact_name: "", contact_email: "", contact_phone: "", contact_position: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...form, ...JSON.parse(saved) });
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const { data: lookups } = useQuery({ queryKey: ["apply-lookups"], queryFn: () => getApplyLookups() });
  const countries = lookups?.countries ?? [];
  const cities = useMemo(
    () => (lookups?.cities ?? []).filter((c) => !form.country_code || c.country_code === form.country_code),
    [lookups, form.country_code],
  );

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validStep0 = form.name_ar.trim() && form.name_en.trim() && form.supplier_type;
  const validStep1 = true; // company details all optional
  const validStep2 = form.contact_name.trim() && form.contact_email.trim() && form.contact_phone.trim();

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      const res = await submitSupplierApplication({ data: form });
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted({ id: res.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("DUPLICATE")) setError(t("supplier.apply.err_duplicate"));
      else if (msg.includes("INVALID_EMAIL")) setError(t("supplier.apply.err_email"));
      else if (msg.includes("MISSING_FIELD")) setError(t("supplier.apply.err_missing"));
      else setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir={dir}
        style={{ background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), var(--background)" }}>
        <Card className="max-w-lg w-full">
          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <h2 className="text-2xl font-bold">{t("supplier.apply.success_title")}</h2>
            <p className="text-muted-foreground">{t("supplier.apply.success_desc")}</p>
            <p className="text-xs text-muted-foreground">#{submitted.id.slice(0, 8)}</p>
            <Button onClick={() => navigate({ to: "/auth" })} className="mt-2">{t("supplier.apply.back_to_signin")}</Button>
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
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i <= step ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 text-muted-foreground"
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
                    <Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} required /></div>
                  <div className="space-y-2"><Label>{t("label.name_en")} *</Label>
                    <Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} required /></div>
                </div>
                <div className="space-y-2"><Label>{t("supplier.apply.type")} *</Label>
                  <Select value={form.supplier_type} onValueChange={(v) => set("supplier_type", v as SupplierType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct_hotel">{t("supplier.type.direct_hotel")}</SelectItem>
                      <SelectItem value="wholesaler">{t("supplier.type.wholesaler")}</SelectItem>
                      <SelectItem value="dmc">{t("supplier.type.dmc")}</SelectItem>
                      <SelectItem value="hotel_supplier">{t("supplier.type.hotel_supplier")}</SelectItem>
                      <SelectItem value="other">{t("supplier.type.other")}</SelectItem>
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
                    <Input value={form.commercial_registration} onChange={(e) => set("commercial_registration", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("label.country")}</Label>
                    <Select value={form.country_code} onValueChange={(v) => { set("country_code", v); set("city_id", ""); }}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                      ))}</SelectContent>
                    </Select></div>
                  <div className="space-y-2"><Label>{t("label.city")}</Label>
                    <Select value={form.city_id} onValueChange={(v) => set("city_id", v)} disabled={!form.country_code}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{cities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                      ))}</SelectContent>
                    </Select></div>
                  <div className="space-y-2 sm:col-span-2"><Label>{t("label.address")}</Label>
                    <Textarea rows={2} value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} /></div>
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
                <div className="space-y-2"><Label>{t("label.email")} *</Label>
                  <Input type="email" dir="ltr" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} required /></div>
                <div className="space-y-2"><Label>{t("label.phone")} *</Label>
                  <Input dir="ltr" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} required /></div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3 text-sm">
                <div className="rounded-md border p-3">
                  <div className="font-semibold mb-2">{t("supplier.apply.step_company")}</div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>{t("label.name_ar")}:</div><div className="text-foreground">{form.name_ar}</div>
                    <div>{t("label.name_en")}:</div><div className="text-foreground">{form.name_en}</div>
                    <div>{t("supplier.apply.type")}:</div><div className="text-foreground">{t(`supplier.type.${form.supplier_type}`)}</div>
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
              <Button variant="ghost" onClick={() => (step === 0 ? navigate({ to: "/auth" }) : setStep(step - 1))} disabled={busy}>
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
