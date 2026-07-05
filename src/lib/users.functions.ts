import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";

export async function createStaffUser({ data }: { data: any }) {
  const { full_name_ar, full_name_en, email, password, role, blocked_modules } = data;

  if (!email || !password || !role) {
    throw new Error("Missing required fields: email, password, and role are required.");
  }

  // Since we are client-side, we try to sign up the user.
  // Note: For a true admin operation, this should go through apiClient.
  // This client-side fallback is best-effort.
  const { data: authData, error: authError } = await db.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: full_name_en,
      }
    }
  });

  if (authError) throw authError;
  const userId = authData?.user?.id;
  if (!userId) throw new Error("Failed to create user.");

  // Insert profile
  const { error: profileError } = await db.from("profiles").upsert({
    id: userId,
    email,
    full_name_ar: full_name_ar || full_name_en,
    full_name_en: full_name_en || full_name_ar,
    is_active: true,
    must_change_password: false,
  });

  if (profileError) throw profileError;

  // Insert role
  const { error: roleError } = await db.from("user_roles").insert({
    user_id: userId,
    role,
  });

  if (roleError) throw roleError;

  // Insert module blocks
  if (blocked_modules && blocked_modules.length > 0) {
    const blockPayload = blocked_modules.map((key: string) => ({
      user_id: userId,
      module_key: key,
    }));
    const { error: blockError } = await db.from("user_module_blocks").insert(blockPayload);
    if (blockError) throw blockError;
  }

  return { ok: true, userId };
}

export async function loginOrCreateUser({ data }: { data: any }) {
  const { email, password } = data;
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  // Best effort client side signup/signin
  const { data: authData, error: authError } = await db.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // Try signing up if user not found
    const { data: signUpData, error: signUpError } = await db.auth.signUp({
      email,
      password,
    });
    if (signUpError) throw signUpError;
    return { ok: true };
  }

  return { ok: true };
}
