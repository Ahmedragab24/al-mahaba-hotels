import { createServerFn } from "@tanstack/react-start";

export const createStaffUser = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { full_name_ar, full_name_en, email, password, role, blocked_modules } = data;

    if (!email || !password || !role) {
      throw new Error("Missing required fields: email, password, and role are required.");
    }

    // 1. Create Supabase Auth User
    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: full_name_en },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const userId = created.user.id;

    // 2. Create Profile row
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name_ar: full_name_ar || full_name_en,
        full_name_en: full_name_en || full_name_ar,
        is_active: true,
        must_change_password: false,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      // Clean up user on failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    // 3. Create User Role
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role,
    });

    if (roleError) {
      // Clean up profile & user on failure
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(roleError.message);
    }

    // 4. Create User Module Blocks (permissions) if any
    if (blocked_modules && blocked_modules.length > 0) {
      const blockPayload = blocked_modules.map((key: string) => ({
        user_id: userId,
        module_key: key,
      }));
      const { error: blockError } = await supabaseAdmin.from("user_module_blocks").insert(blockPayload);
      if (blockError) {
        // Clean up role, profile & user on failure
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(blockError.message);
      }
    }

    return { ok: true, userId };
  });

export const loginOrCreateUser = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const emailClean = email.trim().toLowerCase();

    // Find if user exists in auth
    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) throw listError;

    let user = list?.users.find((u) => u.email?.toLowerCase() === emailClean);

    if (!user) {
      // Create user
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: emailClean,
        password,
        email_confirm: true,
        user_metadata: { display_name: emailClean.split("@")[0] },
      });
      if (createError) throw createError;
      user = created.user;

      // Create profile
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: user.id,
        email: emailClean,
        full_name_ar: emailClean.split("@")[0],
        full_name_en: emailClean.split("@")[0],
        is_active: true,
        must_change_password: false,
      });
      if (profileError) throw profileError;

      // Assign role (super_admin to ensure full access)
      const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
        user_id: user.id,
        role: "super_admin",
      });
      if (roleError) throw roleError;
    }

    return { ok: true };
  });
