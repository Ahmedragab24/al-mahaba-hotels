import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "@/lib/i18n";
import { selectAuth } from "@/store/features/authSlice";
import { useLoginMutation, useGetRolesQuery } from "@/store/api";
import { requestPermission } from "@/lib/firebaseMessaging";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSwitcher } from "@/components/lang-switcher";
import { Loader2 } from "lucide-react";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import logoDarkUrl from "@/assets/daleel-logo-dark.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LoginPage() {
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [login, { isLoading: busy }] = useLoginMutation();
  const { data: apiRolesResponse } = useGetRolesQuery();
  const rolesArray = Array.isArray(apiRolesResponse)
    ? apiRolesResponse
    : apiRolesResponse?.data || [];

  const activeRoles = rolesArray.filter((r: any) => r.status !== false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Set default role when roles are loaded
  useEffect(() => {
    if (activeRoles.length > 0 && !roleId) {
      setRoleId(String(activeRoles[0].id));
    }
  }, [activeRoles, roleId]);

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const emailClean = email.trim().toLowerCase();

      let fcmToken: string | null = null;
      try {
        fcmToken = await requestPermission();
      } catch (err) {
        console.warn("Failed to retrieve FCM token before login:", err);
      }

      const res = await login({
        email: emailClean,
        password: password,
        role_id: roleId,
        ...(fcmToken ? { fcm: fcmToken } : {}),
      }).unwrap();

      // Handle API response structure (unwrapped by baseQuery)
      const token = res.access_token || res.token;
      const user = res.user;

      if (token) {
        const userId = String(user?.id || "");
        document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
        if (userId) {
          document.cookie = `auth_user_id=${encodeURIComponent(userId)}; path=/; max-age=86400; SameSite=Lax`;
          localStorage.setItem("auth_user_id", userId);
        }
        navigate("/", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.data?.message || err.message || t("auth.conn_error"));
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

      <div className="relative z-10 w-full max-w-lg">
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
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground text-center">
            {t("brand.name")}
          </h1>
          <div className="mt-4 h-px w-20" style={{ background: "var(--gradient-brand)" }} />
          <p className="mt-4 text-base font-medium text-foreground">{t("auth.title")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <Card className="border-border/60" style={{ boxShadow: "var(--shadow-brand)" }}>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" dir={dir}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  dir="ltr"
                  className="text-start rounded-xl bg-background/50 focus:bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={busy}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  dir="ltr"
                  className="text-start rounded-xl bg-background/50 focus:bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={busy}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="role_id">{t("label.user_type")}</Label>
                <Select value={roleId} onValueChange={setRoleId} disabled={busy}>
                  <SelectTrigger id="role_id" className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeRoles.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {dir === "rtl" ? r.name_ar || r.name : r.name_en || r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="h-10 w-full border-0 font-semibold text-white rounded-xl cursor-pointer"
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

        <div className="mt-6 text-center">
          <Link
            to="/supplier-apply"
            className="text-sm font-medium text-[var(--brand-gold-deep)] hover:underline"
          >
            {t("supplier.apply_cta")} ←
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("brand.name")}
        </p>
      </div>
    </div>
  );
}
