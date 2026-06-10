import { createServerFn } from "@tanstack/react-start";

const ROLES = [
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

const DOMAIN = "uat-hrs.sa";
const PASSWORD = "12345678";

export const ensureDemoUsers = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  for (const role of ROLES) {
    const email = `${role}@${DOMAIN}`;

    // Check existing user by email
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    let user = list?.users.find((u) => u.email?.toLowerCase() === email);

    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: role },
      });
      if (error && !error.message.toLowerCase().includes("already")) {
        console.error("createUser failed", role, error.message);
        continue;
      }
      user = created?.user ?? undefined;
    } else {
      // Reset password to the demo password to stay in sync
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password: PASSWORD });
    }

    if (!user) continue;

    // Ensure profile row
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: user.id, display_name: role }, { onConflict: "id" });

    // Ensure role row
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: user.id, role }, { onConflict: "user_id,role" });
  }

  return { ok: true };
});
