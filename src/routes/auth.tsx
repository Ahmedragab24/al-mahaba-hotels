import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LangSwitcher } from "@/components/lang-switcher";
import { Loader2 } from "lucide-react";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import logoDarkUrl from "@/assets/daleel-logo-dark.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { ensureDemoUsers } from "@/lib/demo-users.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: LoginPage,
});

const DEMO_ROLES = [
  "super_admin",
  "admin",
  "sales_manager",
  "sales_agent",
  "operations_manager",
  "operations_agent",
  "finance_manager",
  "finance_agent",
  "viewer",
] as const;


const DEFAULT_DOMAIN = "uat-hrs.sa";

/** Normalize Arabic-Indic digits to Latin and expand bare usernames to full emails. */
function normalizeEmail(raw: string): string {
  const latin = raw
    .trim()
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
  if (!latin) return latin;
  return latin.includes("@") ? latin.toLowerCase() : `${latin.toLowerCase()}@${DEFAULT_DOMAIN}`;
}

function normalizeDigits(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

function LoginPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("super_admin");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    ensureDemoUsers()
      .catch(() => undefined)
      .finally(() => setSeeding(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: `${role}@${DEFAULT_DOMAIN}`,
        password: normalizeDigits(password),
      });
      if (err) {
        setError(err.message.includes("Invalid") ? t("auth.invalid") : err.message);
        return;
      }
      navigate({ to: "/", replace: true });
    } catch {
      setError(t("auth.conn_error"));
    } finally {
      setBusy(false);
    }
  }


  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      dir={dir}
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), linear-gradient(180deg, var(--background), color-mix(in oklab, var(--brand-gold) 6%, var(--background)))",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -end-40 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-gold)]/15 blur-3xl" />
        <div className="absolute -bottom-40 -start-40 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-gold-deep)]/15 blur-3xl" />
      </div>

      <div className="absolute end-4 top-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        <LangSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-28 w-28 items-center justify-center">
            <img
              src={logoUrl}
              alt={t("brand.name")}
              className="h-full w-full object-contain drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--brand-gold-deep)_35%,transparent)] dark:hidden"
            />
            <img
              src={logoDarkUrl}
              alt={t("brand.name")}
              className="hidden h-full w-full object-contain drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--brand-gold)_30%,transparent)] dark:block"
            />
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
            {t("brand.name")}
          </h1>
          <div className="mt-4 h-px w-20" style={{ background: "var(--gradient-brand)" }} />
          <p className="mt-4 text-base font-medium text-foreground">{t("auth.title")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <Card className="border-border/60" style={{ boxShadow: "var(--shadow-brand)" }}>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir={dir}>
              <div className="space-y-2">
                <Label htmlFor="role">{t("auth.email")}</Label>
                <Select value={role} onValueChange={setRole} disabled={seeding}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`role.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  dir="ltr"
                  className="text-start"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="h-10 w-full border-0 font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("auth.signing_in")}
                  </span>
                ) : (
                  t("auth.signin")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("brand.name")}
        </p>
      </div>
    </div>
  );
}
