import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthCtx = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  blockedModules: string[];
  hasRole: (r: AppRole) => boolean;
  hasAnyRole: (rs: AppRole[]) => boolean;
  canAccessModule: (key: string | null) => boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [blockedModules, setBlockedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const [{ data: p }, { data: r }, { data: b }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("user_module_blocks").select("module_key").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
    setBlockedModules(((b ?? []) as { module_key: string }[]).map((x) => x.module_key));
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) await loadProfile(data.session.user.id);
    else {
      setProfile(null);
      setRoles([]);
      setBlockedModules([]);
    }
  }

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => { void loadProfile(sess.user!.id); }, 0);
      } else {
        setProfile(null);
        setRoles([]);
        setBlockedModules([]);
      }
    });
    void (async () => {
      await refresh();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const hasRole = (r: AppRole) => roles.includes(r);
  const hasAnyRole = (rs: AppRole[]) => rs.some((r) => roles.includes(r));
  const isAdmin = hasAnyRole(["super_admin", "admin"]);
  // super admin can never be locked out of a module
  const canAccessModule = (key: string | null) =>
    !key || hasRole("super_admin") || !blockedModules.includes(key);

  async function signOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("demo_role");
      window.localStorage.removeItem("custom_display_email");
    }
    await supabase.auth.signOut();
    setSession(null); setUser(null); setProfile(null); setRoles([]); setBlockedModules([]);
  }

  return (
    <Ctx.Provider value={{ loading, session, user, profile, roles, blockedModules, hasRole, hasAnyRole, canAccessModule, isAdmin, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
