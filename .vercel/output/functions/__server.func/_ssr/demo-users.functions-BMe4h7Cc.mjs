import { c as createServerRpc } from "./createServerRpc-CjnVr-4i.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"];
const DOMAIN = "uat-hrs.sa";
const PASSWORD = "12345678";
const ensureDemoUsers_createServerFn_handler = createServerRpc({
  id: "459a24fc04eeb742e6c61d0b4e68d543bd96e6dcb74a2a62253595402388f04f",
  name: "ensureDemoUsers",
  filename: "src/lib/demo-users.functions.ts"
}, (opts) => ensureDemoUsers.__executeServer(opts));
const ensureDemoUsers = createServerFn({
  method: "POST"
}).handler(ensureDemoUsers_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  for (const role of ROLES) {
    const email = `${role}@${DOMAIN}`;
    const {
      data: list
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200
    });
    let user = list?.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      const {
        data: created,
        error
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          display_name: role
        }
      });
      if (error && !error.message.toLowerCase().includes("already")) {
        console.error("createUser failed", role, error.message);
        continue;
      }
      user = created?.user ?? void 0;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: PASSWORD
      });
    }
    if (!user) continue;
    await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      email,
      username: role,
      full_name_ar: role,
      full_name_en: role,
      must_change_password: false
    }, {
      onConflict: "id"
    });
    await supabaseAdmin.from("user_roles").upsert({
      user_id: user.id,
      role
    }, {
      onConflict: "user_id,role"
    });
  }
  return {
    ok: true
  };
});
export {
  ensureDemoUsers_createServerFn_handler
};
