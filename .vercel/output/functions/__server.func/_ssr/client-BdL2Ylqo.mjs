import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
function createSupabaseClient() {
  const SUPABASE_URL = "https://nnfknlcsecmsgxbrytuu.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZmtubGNzZWNtc2d4YnJ5dHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODY1OTQsImV4cCI6MjA5NjY2MjU5NH0.j6pZWqqSOA-QF2wTaJfTyn1ToI3dZpv7fh5zQ8d1fKY";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
