import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { r as Route$7, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { h as useFacilities, c as useSuppliersLite } from "./_ssr/lookups-DjTAjyZF.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { C as Checkbox } from "./_ssr/checkbox-Co4oTAVV.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter, f as DialogTrigger } from "./_ssr/dialog-B3U_60pZ.mjs";
import { H as HotelForm } from "./_ssr/-form-Lp50SWV7.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./_ssr/dropdown-menu-CvBV4MCF.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { t as toDocLang, w as waTemplateExists, D as DOC_LANGS, H as HOTEL_RES, r as renderWaTemplate, m as missingDocKeys, a as DOC_LANG_LIST } from "./_ssr/doc-lang-Doexz-GC.mjs";
import { l as logoUrl } from "./_ssr/daleel-logo-transparent-BMZzokD7.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { A as ArrowLeft, _ as Pencil, a0 as Eye, aI as Printer, aJ as MessageCircle, Z as Plus, V as Trash2, a5 as Star } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-tooltip.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_ssr/simulation-engine.server-CqcvilV1.mjs";
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/react-hook-form.mjs";
import "./_libs/hookform__resolvers.mjs";
import "./_libs/zod.mjs";
import "./_ssr/form-BepQWxLA.mjs";
import "./_ssr/label-BWkpBOCr.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-dropdown-menu.mjs";
import "./_libs/radix-ui__react-menu.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function fetchHotelShareData(hotelId) {
  const [hotel, rooms, views, meals, facilities, images, contacts] = await Promise.all([
    supabase.from("hotels").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", hotelId).maybeSingle(),
    supabase.from("hotel_room_types").select("*").eq("hotel_id", hotelId).eq("is_active", true).order("sort_order"),
    supabase.from("hotel_views").select("*").eq("hotel_id", hotelId).eq("is_active", true),
    supabase.from("hotel_meal_plans").select("*").eq("hotel_id", hotelId).eq("is_active", true),
    supabase.from("hotel_facilities").select("facility:facilities(name_en,name_ar,category)").eq("hotel_id", hotelId),
    supabase.from("hotel_images").select("*").eq("hotel_id", hotelId).order("is_cover", { ascending: false }).order("sort_order").limit(6),
    supabase.from("hotel_contacts").select("*").eq("hotel_id", hotelId).order("is_primary", { ascending: false })
  ]);
  return {
    hotel: hotel.data,
    rooms: rooms.data ?? [],
    views: views.data ?? [],
    meals: meals.data ?? [],
    facilities: (facilities.data ?? []).map((f) => f.facility).filter(Boolean),
    images: images.data ?? [],
    contacts: contacts.data ?? []
  };
}
const HARAM = {
  makkah: { lat: 21.4225, lng: 39.8262 },
  madinah: { lat: 24.4672, lng: 39.6111 }
};
function haramInfo(h) {
  const cityEn = String(h?.city?.name_en ?? "").toLowerCase();
  const target = /makkah|mecca/.test(cityEn) ? HARAM.makkah : /madinah|medina/.test(cityEn) ? HARAM.madinah : null;
  const lat = h?.latitude == null ? null : Number(h.latitude);
  const lng = h?.longitude == null ? null : Number(h.longitude);
  if (!target || lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return { near: false, meters: null };
  const R = 6371e3;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(target.lat - lat);
  const dLng = toRad(target.lng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(target.lat)) * Math.sin(dLng / 2) ** 2;
  const meters = Math.round(2 * R * Math.asin(Math.sqrt(a)));
  return { near: meters <= 1500, meters };
}
function buildHotelInfoHtml(lang, data) {
  if (missingDocKeys(lang, "hotel").length > 0) return null;
  const s = HOTEL_RES[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const rtl = dir === "rtl";
  const h = data.hotel;
  if (!h) return null;
  const nm = (o) => (rtl ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const haram = haramInfo(h);
  const meta = (k, v, ltr = false) => `<div class="box"><div class="k">${esc(k)}</div><div class="v"${ltr ? ' dir="ltr"' : ""}>${esc(v || "—")}</div></div>`;
  const imgGrid = data.images.length ? `<h2>${esc(s.images)}</h2><div class="imgs">${data.images.map((i) => `<figure><img src="${esc(i.file_path)}" alt="${esc(i.caption ?? nm(h))}" />${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ""}</figure>`).join("")}</div>` : "";
  const roomRows = data.rooms.map((r) => `<tr><td>${esc(nm(r))}</td><td class="c">${esc(r.max_adults ?? "—")}</td><td class="c">${esc(r.max_children ?? "—")}</td><td>${esc(r.bed_type ?? "—")}</td></tr>`).join("");
  const roomsTable = data.rooms.length ? `<h2>${esc(s.room_types)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.max_adults)}</th><th>${esc(s.max_children)}</th><th>${esc(s.bed_type)}</th></tr></thead><tbody>${roomRows}</tbody></table>` : "";
  const viewsList = data.views.length ? `<h2>${esc(s.views)}</h2><div class="chips">${data.views.map((v) => `<span class="chip">${esc(nm(v))}</span>`).join("")}</div>` : "";
  const mealRows = data.meals.map((m) => `<tr><td class="c">${esc(m.board)}</td><td>${esc(nm(m))}</td><td>${esc((rtl ? m.description_ar || m.description_en : m.description_en || m.description_ar) ?? "")}</td></tr>`).join("");
  const mealsTable = data.meals.length ? `<h2>${esc(s.meal_plans)}</h2><table><thead><tr><th>${esc(s.board)}</th><th>${esc(s.name)}</th><th>${esc(s.description)}</th></tr></thead><tbody>${mealRows}</tbody></table>` : "";
  const facChips = data.facilities.length ? `<h2>${esc(s.facilities)}</h2><div class="chips">${data.facilities.map((f) => `<span class="chip">${esc(nm(f))}</span>`).join("")}</div>` : "";
  const contactRows = data.contacts.map((c) => `<tr><td>${esc(c.full_name)}${c.is_primary ? " ★" : ""}</td><td>${esc(c.title ?? "—")}</td><td dir="ltr">${esc(c.phone || c.mobile || "—")}</td><td dir="ltr">${esc(c.email ?? "—")}</td><td dir="ltr">${esc(c.whatsapp ?? "—")}</td></tr>`).join("");
  const contactsTable = data.contacts.length ? `<h2>${esc(s.contacts)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.job_title)}</th><th>${esc(s.phone)}</th><th>${esc(s.email)}</th><th>WhatsApp</th></tr></thead><tbody>${contactRows}</tbody></table>` : "";
  const desc = rtl ? h.description_ar || h.description_en : h.description_en || h.description_ar;
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} — ${esc(nm(h))}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #14532d; padding-bottom: 16px; }
  .head img { height: 64px; }
  .head .t { text-align: ${rtl ? "left" : "right"}; }
  .head h1 { font-size: 24px; color: #14532d; }
  .head .no { font-size: 14px; color: #555; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px 14px; }
  .box .k { font-size: 11px; color: #777; }
  .box .v { font-weight: 600; margin-top: 2px; }
  h2 { font-size: 15px; color: #14532d; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th, td { border: 1px solid #ddd; padding: 7px 8px; text-align: ${rtl ? "right" : "left"}; }
  th { background: #14532d; color: #fff; font-size: 11px; }
  td.c { text-align: center; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { border: 1px solid #cdd; background: #f3faf5; border-radius: 999px; padding: 4px 12px; font-size: 12px; }
  .imgs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .imgs img { width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
  .imgs figcaption { font-size: 11px; color: #777; margin-top: 3px; }
  .desc { border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; background: #fafafa; line-height: 1.7; white-space: pre-wrap; }
  .stars { color: #b8860b; letter-spacing: 2px; }
  .foot { margin-top: 28px; text-align: center; color: #777; font-size: 11px; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 12px; } .noprint { display: none; } }
  .noprint { position: fixed; top: 12px; ${rtl ? "left" : "right"}: 12px; }
  .noprint button { background: #14532d; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">🖨 ${esc(s.print)}</button></div>
  <div class="head">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="${esc(location.origin + logoUrl)}" alt="logo" />
      <div style="font-weight:700;font-size:16px;color:#14532d">${esc(s.company)}</div>
    </div>
    <div class="t">
      <h1>${esc(s.title)}</h1>
      <div class="no">${esc(nm(h))} <span class="stars">${h.star_rating ? "★".repeat(h.star_rating) : ""}</span></div>
    </div>
  </div>

  <div class="meta">
    ${meta(s.code, h.code, true)}
    ${meta(s.rating, h.star_rating ? "★".repeat(h.star_rating) : "—")}
    ${meta(s.country, nm(h.country))}
    ${meta(s.city, nm(h.city))}
    ${meta(s.district, h.district)}
    ${meta(s.address, [h.address_line1, h.address_line2, h.postal_code].filter(Boolean).join(", "))}
    ${meta(s.near_haram, haram.meters == null ? "—" : haram.near ? s.yes : s.no)}
    ${meta(s.distance, haram.meters == null ? "—" : haram.meters.toLocaleString("en-US"), true)}
    ${meta(s.phone, h.phone, true)}
    ${meta(s.email, h.email, true)}
    ${meta(s.website, h.website, true)}
    ${meta(s.check_in_time + " / " + s.check_out_time, [h.check_in_time?.slice(0, 5), h.check_out_time?.slice(0, 5)].filter(Boolean).join(" / "), true)}
  </div>

  ${desc ? `<h2>${esc(s.description)}</h2><div class="desc">${esc(desc)}</div>` : ""}
  ${imgGrid}
  ${roomsTable}
  ${viewsList}
  ${mealsTable}
  ${facChips}
  ${contactsTable}

  <div class="foot">${esc(s.generated)}: <span dir="ltr">${(/* @__PURE__ */ new Date()).toLocaleString(locale)}</span> — ${esc(s.footer)}</div>
</body>
</html>`;
}
async function openHotelInfoPrint(lang, data) {
  const html = buildHotelInfoHtml(lang, data);
  if (!html) return false;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  try {
    await supabase.rpc("log_audit", {
      _action: "pdf_generate",
      _entity_type: "hotels",
      _entity_id: data.hotel.id,
      _metadata: { lang, doc: "hotel_information", hotel_code: data.hotel.code }
    });
  } catch {
  }
  return true;
}
function HotelShareActions({ hotelId, contextCustomerId }) {
  const { t, lang: uiLang } = useI18n();
  const [previewOpen, setPreviewOpen] = reactExports.useState(false);
  const [previewLang, setPreviewLang] = reactExports.useState(null);
  const [waOpen, setWaOpen] = reactExports.useState(false);
  const [waLang, setWaLang] = reactExports.useState(null);
  const [waCustomerId, setWaCustomerId] = reactExports.useState(contextCustomerId);
  const [sending, setSending] = reactExports.useState(false);
  const share = useQuery({
    queryKey: ["hotel-share", hotelId],
    queryFn: () => fetchHotelShareData(hotelId),
    enabled: previewOpen || waOpen
  });
  const customers = useQuery({
    queryKey: ["customers-lite-wa"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id,name_en,name_ar,phone,preferred_language").is("deleted_at", null).order("name_en").limit(500);
      if (error) throw error;
      return data ?? [];
    },
    enabled: waOpen || !!contextCustomerId
  });
  const contextCustomer = customers.data?.find((c) => c.id === contextCustomerId);
  const preferredLang = contextCustomer ? toDocLang(contextCustomer.preferred_language) : toDocLang(uiLang);
  const langOrder = [preferredLang, ...DOC_LANG_LIST.filter((l) => l !== preferredLang)];
  const effPreviewLang = previewLang ?? preferredLang;
  const effWaLang = waLang ?? preferredLang;
  const previewHtml = reactExports.useMemo(() => {
    if (!share.data?.hotel) return null;
    return buildHotelInfoHtml(effPreviewLang, share.data);
  }, [share.data, effPreviewLang]);
  const waMessage = reactExports.useMemo(() => {
    const data = share.data;
    if (!data?.hotel || !waTemplateExists("hotel_info", effWaLang)) return null;
    const h = data.hotel;
    const s = HOTEL_RES[effWaLang];
    const rtl = DOC_LANGS[effWaLang].dir === "rtl";
    const nm = (o) => (rtl ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
    const haram = haramInfo(h);
    const nearLine = haram.meters == null ? `${s.near_haram}: —` : `${s.near_haram}: ${haram.near ? s.yes : s.no} (${haram.meters.toLocaleString("en-US")} m)`;
    return renderWaTemplate("hotel_info", effWaLang, {
      hotel: nm(h),
      city: nm(h.city),
      rating: h.star_rating ? "★".repeat(h.star_rating) : "—",
      near_haram: nearLine,
      company: s.company
    });
  }, [share.data, effWaLang]);
  const doPrint = async (l) => {
    const data = share.data ?? await fetchHotelShareData(hotelId);
    if (!data.hotel) return;
    const ok = await openHotelInfoPrint(l, data);
    if (!ok) toast.error(t("doc.missing_translations"));
  };
  const doSend = async () => {
    const data = share.data;
    if (!data?.hotel) return;
    if (!waTemplateExists("hotel_info", effWaLang) || !waMessage) {
      toast.error(t("wa.no_template"));
      return;
    }
    const cust = customers.data?.find((c) => c.id === waCustomerId);
    if (!cust) {
      toast.error(t("wa.select_customer"));
      return;
    }
    setSending(true);
    let logged = true;
    try {
      const { error } = await supabase.from("customer_communications").insert({
        customer_id: cust.id,
        channel: "whatsapp",
        direction: "outbound",
        subject: `${waMessage.name} [${effWaLang}] — ${data.hotel.code}`,
        body: waMessage.body
      });
      if (error) throw error;
    } catch {
      logged = false;
    }
    try {
      await supabase.rpc("log_audit", {
        _action: "whatsapp_send",
        _entity_type: "hotels",
        _entity_id: data.hotel.id,
        _metadata: {
          lang: effWaLang,
          template: waMessage.name,
          doc: "hotel_information",
          hotel_code: data.hotel.code,
          customer_id: cust.id,
          status: logged ? "success" : "failed"
        }
      });
    } catch {
    }
    setSending(false);
    if (!logged) {
      toast.error(t("wa.failed"));
      return;
    }
    const phone = String(cust.phone ?? "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMessage.body)}`, "_blank");
    toast.success(t("wa.sent"));
    setWaOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setPreviewOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
      " ",
      t("hotels.preview_info")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        " ",
        t("hotels.print_info")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: langOrder.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => doPrint(l), children: [
        DOC_LANGS[l].native,
        " PDF",
        l === preferredLang ? " ★" : ""
      ] }, l)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setWaOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
      " ",
      t("hotels.send_whatsapp")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: previewOpen, onOpenChange: setPreviewOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("hotels.info_doc") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: effPreviewLang, onValueChange: (v) => setPreviewLang(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: langOrder.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: l, children: [
          DOC_LANGS[l].native,
          l === preferredLang ? " ★" : ""
        ] }, l)) })
      ] }) }),
      share.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-muted-foreground", children: t("label.loading") }) : previewHtml ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { title: "hotel-info-preview", srcDoc: previewHtml, className: "h-[60vh] w-full rounded-md border bg-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-destructive", children: t("doc.missing_translations") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPreviewOpen(false), children: t("actions.close") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => doPrint(effPreviewLang), disabled: !previewHtml, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          " ",
          t("hotels.print_info")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: waOpen, onOpenChange: setWaOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("hotels.send_whatsapp") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("wa.language") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: effWaLang, onValueChange: (v) => setWaLang(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: langOrder.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: l, children: [
              DOC_LANGS[l].native,
              l === preferredLang ? " ★" : ""
            ] }, l)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("wa.customer") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: waCustomerId, onValueChange: setWaCustomerId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("wa.select_customer") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: (uiLang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) ?? c.id }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("wa.message_preview") }),
          waMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "pre",
            {
              dir: DOC_LANGS[effWaLang].dir,
              className: "max-h-56 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-sans text-sm",
              children: waMessage.body
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive", children: t("wa.no_template") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setWaOpen(false), children: t("actions.close") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: doSend, disabled: sending || !waMessage || !waCustomerId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          " ",
          t("wa.send")
        ] })
      ] })
    ] }) })
  ] });
}
const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"];
function HotelDetail() {
  const {
    id
  } = Route$7.useParams();
  const search = Route$7.useSearch();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = reactExports.useState(!!search.edit);
  const hotel = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("hotels").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const counts = useQuery({
    queryKey: ["hotel-counts", id],
    queryFn: async () => {
      const tables = ["hotel_room_types", "hotel_views", "hotel_meal_plans", "hotel_facilities", "hotel_images", "hotel_contacts", "hotel_suppliers", "rates"];
      const out = {};
      await Promise.all(tables.map(async (tb) => {
        const {
          count
        } = await supabase.from(tb).select("*", {
          count: "exact",
          head: true
        }).eq("hotel_id", id);
        out[tb] = count ?? 0;
      }));
      return out;
    }
  });
  if (hotel.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!hotel.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.no_results") });
  const h = hotel.data;
  const displayName = lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: displayName, subtitle: `${h.code}${h.brand ? " · " + h.brand : ""}${h.star_rating ? " · " + "★".repeat(h.star_rating) : ""}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/hotels"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HotelShareActions, { hotelId: id, contextCustomerId: search.customer }),
      canWrite && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: h.status })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("hotels.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "rooms", children: [
          t("hotels.rooms"),
          " (",
          counts.data?.hotel_room_types ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "views", children: [
          t("hotels.views"),
          " (",
          counts.data?.hotel_views ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "meals", children: [
          t("hotels.meal_plans"),
          " (",
          counts.data?.hotel_meal_plans ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "facilities", children: [
          t("hotels.facilities"),
          " (",
          counts.data?.hotel_facilities ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "images", children: [
          t("hotels.images"),
          " (",
          counts.data?.hotel_images ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "contacts", children: [
          t("hotels.contacts"),
          " (",
          counts.data?.hotel_contacts ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "suppliers", children: [
          t("hotels.suppliers"),
          " (",
          counts.data?.hotel_suppliers ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "rates", children: [
          t("hotels.rates_history"),
          " (",
          counts.data?.rates ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bookings", children: t("hotels.bookings") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(HotelForm, { initial: h, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["hotel", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.code"), value: h.code, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.brand"), value: h.brand }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.stars"), value: h.star_rating ? "★".repeat(h.star_rating) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_en"), value: h.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_ar"), value: h.name_ar }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.status"), value: t(`status.${h.status}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.country"), value: h.country ? lang === "ar" ? h.country.name_ar : h.country.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.city"), value: h.city ? lang === "ar" ? h.city.name_ar : h.city.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.district"), value: h.district }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.address"), value: [h.address_line1, h.address_line2, h.postal_code].filter(Boolean).join(", ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.latitude"), value: h.latitude }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.longitude"), value: h.longitude }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.phone"), value: h.phone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.email"), value: h.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.website"), value: h.website }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.checkin"), value: h.check_in_time?.slice(0, 5) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.checkout"), value: h.check_out_time?.slice(0, 5) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(h.created_at, lang) }),
        (h.description_en || h.description_ar) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: lang === "ar" ? h.description_ar || h.description_en : h.description_en || h.description_ar })
        ] }),
        (h.policies_en || h.policies_ar) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Policies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: lang === "ar" ? h.policies_ar || h.policies_en : h.policies_en || h.policies_ar })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rooms", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "views", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ViewsTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "meals", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MealsTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "facilities", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FacilitiesTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "images", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImagesTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contacts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactsTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "suppliers", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuppliersTab, { hotelId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatesHistoryTab, { hotelId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bookings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsTab, {}) })
    ] }) })
  ] });
}
function KV({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: mono ? "font-mono text-sm" : "text-sm", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function RoomsTab({
  hotelId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-rooms", hotelId],
    queryFn: async () => (await supabase.from("hotel_room_types").select("*").eq("hotel_id", hotelId).order("sort_order")).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_room_types").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-rooms", hotelId]
      });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.rooms") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.max_adults") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.max_children") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.bed_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.size_sqm") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_active") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.name_ar : r.name_en }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.max_adults }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.max_children }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.bed_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.size_sqm }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoomDialog, { open, onOpenChange: setOpen, hotelId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["hotel-rooms", hotelId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function RoomDialog({
  open,
  onOpenChange,
  hotelId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.code?.trim() || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload = {
        hotel_id: hotelId,
        code: v.code.trim(),
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        max_adults: Number(v.max_adults ?? 2),
        max_children: Number(v.max_children ?? 0),
        max_occupancy: Number(v.max_occupancy ?? Number(v.max_adults ?? 2) + Number(v.max_children ?? 0)),
        bed_type: v.bed_type || null,
        size_sqm: v.size_sqm ? Number(v.size_sqm) : null,
        description_en: v.description_en || null,
        description_ar: v.description_ar || null,
        is_active: v.is_active ?? true,
        sort_order: Number(v.sort_order ?? 0)
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("hotel_room_types").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_room_types").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {
      max_adults: 2,
      max_children: 0,
      max_occupancy: 2,
      is_active: true,
      sort_order: 0
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("hotels.rooms")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.code")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.code ?? "", onChange: (e) => setV({
        ...v,
        code: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.bed_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.bed_type ?? "", onChange: (e) => setV({
        ...v,
        bed_type: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({
        ...v,
        name_en: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({
        ...v,
        name_ar: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_adults"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: v.max_adults ?? 2, onChange: (e) => setV({
        ...v,
        max_adults: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_children"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: v.max_children ?? 0, onChange: (e) => setV({
        ...v,
        max_children: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.max_occupancy"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: v.max_occupancy ?? 2, onChange: (e) => setV({
        ...v,
        max_occupancy: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.size_sqm"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: v.size_sqm ?? "", onChange: (e) => setV({
        ...v,
        size_sqm: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.sort_order"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.sort_order ?? 0, onChange: (e) => setV({
        ...v,
        sort_order: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({
          ...v,
          is_active: !!x
        }) }),
        t("label.is_active")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.description")} (EN)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "ltr", value: v.description_en ?? "", onChange: (e) => setV({
        ...v,
        description_en: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.description")} (AR)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "rtl", value: v.description_ar ?? "", onChange: (e) => setV({
        ...v,
        description_ar: e.target.value
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function ViewsTab({
  hotelId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-views", hotelId],
    queryFn: async () => (await supabase.from("hotel_views").select("*").eq("hotel_id", hotelId).order("name_en")).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_views").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-views", hotelId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.views") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_active") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.name_ar : r.name_en }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ViewDialog, { open, onOpenChange: setOpen, hotelId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["hotel-views", hotelId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function ViewDialog({
  open,
  onOpenChange,
  hotelId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.code?.trim() || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload = {
        hotel_id: hotelId,
        code: v.code.trim(),
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        is_active: v.is_active ?? true
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("hotel_views").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_views").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {
      is_active: true
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("hotels.views")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.code")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.code ?? "", onChange: (e) => setV({
        ...v,
        code: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({
        ...v,
        name_en: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({
        ...v,
        name_ar: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({
          ...v,
          is_active: !!x
        }) }),
        t("label.is_active")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
    ] })
  ] }) });
}
function MealsTab({
  hotelId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-meals", hotelId],
    queryFn: async () => (await supabase.from("hotel_meal_plans").select("*").eq("hotel_id", hotelId)).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_meal_plans").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-meals", hotelId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.meal_plans") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_active") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.board }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-2 text-xs text-muted-foreground", children: t(`board.${r.board}`) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.name_ar : r.name_en }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground line-clamp-2", children: lang === "ar" ? r.description_ar : r.description_en }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MealDialog, { open, onOpenChange: setOpen, hotelId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["hotel-meals", hotelId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function MealDialog({
  open,
  onOpenChange,
  hotelId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.board || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload = {
        hotel_id: hotelId,
        board: v.board,
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        description_en: v.description_en || null,
        description_ar: v.description_ar || null,
        is_active: v.is_active ?? true
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("hotel_meal_plans").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_meal_plans").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {
      board: "BB",
      is_active: true
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("hotels.meal_plans")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.type")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.board ?? "", onValueChange: (x) => setV({
        ...v,
        board: x
      }), disabled: isEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BOARDS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b, children: [
          b,
          " — ",
          t(`board.${b}`)
        ] }, b)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_en")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.name_en ?? "", onChange: (e) => setV({
        ...v,
        name_en: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.name_ar")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "rtl", value: v.name_ar ?? "", onChange: (e) => setV({
        ...v,
        name_ar: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.description")} (EN)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "ltr", value: v.description_en ?? "", onChange: (e) => setV({
        ...v,
        description_en: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.description")} (AR)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, dir: "rtl", value: v.description_ar ?? "", onChange: (e) => setV({
        ...v,
        description_ar: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_active, onCheckedChange: (x) => setV({
          ...v,
          is_active: !!x
        }) }),
        t("label.is_active")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
    ] })
  ] }) });
}
function FacilitiesTab({
  hotelId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const facilities = useFacilities();
  const linked = useQuery({
    queryKey: ["hotel-facilities", hotelId],
    queryFn: async () => (await supabase.from("hotel_facilities").select("facility_id").eq("hotel_id", hotelId)).data ?? []
  });
  const linkedIds = new Set((linked.data ?? []).map((r) => r.facility_id));
  const toggle = useMutation({
    mutationFn: async ({
      facilityId,
      on
    }) => {
      if (on) {
        const {
          error
        } = await supabase.from("hotel_facilities").insert({
          hotel_id: hotelId,
          facility_id: facilityId
        });
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_facilities").delete().eq("hotel_id", hotelId).eq("facility_id", facilityId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["hotel-facilities", hotelId]
      });
      qc.invalidateQueries({
        queryKey: ["hotel-counts", hotelId]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const byCat = {};
  (facilities.data ?? []).forEach((f) => {
    const c = f.category || "other";
    (byCat[c] ??= []).push(f);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 space-y-6", children: [
    Object.keys(byCat).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-10", children: t("empty.title") }),
    Object.entries(byCat).map(([cat, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-sm font-medium text-muted-foreground uppercase", children: cat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2 md:grid-cols-3", children: items.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 rounded-md border p-2 hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: linkedIds.has(f.id), disabled: !canWrite || toggle.isPending, onCheckedChange: (v) => toggle.mutate({
          facilityId: f.id,
          on: !!v
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: lang === "ar" ? f.name_ar : f.name_en })
      ] }, f.id)) })
    ] }, cat))
  ] }) });
}
function ImagesTab({
  hotelId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [v, setV] = reactExports.useState({});
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-images", hotelId],
    queryFn: async () => (await supabase.from("hotel_images").select("*").eq("hotel_id", hotelId).order("sort_order")).data ?? []
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.file_path?.trim()) throw new Error(t("label.required"));
      const payload = {
        hotel_id: hotelId,
        file_path: v.file_path.trim(),
        caption: v.caption || null,
        sort_order: Number(v.sort_order ?? 0),
        is_cover: !!v.is_cover
      };
      const {
        error
      } = await supabase.from("hotel_images").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["hotel-images", hotelId]
      });
      setOpen(false);
      setV({});
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_images").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-images", hotelId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.images") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (o) setV({
          is_cover: false,
          sort_order: 0
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("actions.add")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("hotels.images") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.file_url")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.file_path ?? "", onChange: (e) => setV({
              ...v,
              file_path: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.caption"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.caption ?? "", onChange: (e) => setV({
              ...v,
              caption: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.sort_order"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: v.sort_order ?? 0, onChange: (e) => setV({
              ...v,
              sort_order: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_cover, onCheckedChange: (x) => setV({
                ...v,
                is_cover: !!x
              }) }),
              t("label.is_cover")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", children: [
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center text-muted-foreground py-10", children: t("empty.title") }),
      q.data?.map((img) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-md border overflow-hidden group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: img.file_path, className: "aspect-video w-full object-cover bg-muted", loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: img.caption || "—" }),
          img.is_cover && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("label.is_cover") })
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "icon", className: "absolute top-1 end-1 h-7 w-7 opacity-0 group-hover:opacity-100", onClick: () => setDelId(img.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
      ] }, img.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v2) => !v2 && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function ContactsTab({
  hotelId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-contacts", hotelId],
    queryFn: async () => (await supabase.from("hotel_contacts").select("*").eq("hotel_id", hotelId).order("is_primary", {
      ascending: false
    })).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_contacts").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-contacts", hotelId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.contacts") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.full_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.title_position") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.department") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.phone") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_primary") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.full_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.department }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: c.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: c.phone || c.mobile }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.is_primary && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("label.is_primary") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(c);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContactDialog, { open, onOpenChange: setOpen, hotelId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["hotel-contacts", hotelId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function ContactDialog({
  open,
  onOpenChange,
  hotelId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload = {
        hotel_id: hotelId,
        full_name: v.full_name.trim(),
        title: v.title || null,
        department: v.department || null,
        email: v.email || null,
        phone: v.phone || null,
        mobile: v.mobile || null,
        whatsapp: v.whatsapp || null,
        is_primary: !!v.is_primary,
        preferred_language: v.preferred_language || "en",
        notes: v.notes || null
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("hotel_contacts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_contacts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {
      is_primary: false,
      preferred_language: "en"
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("hotels.contacts")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.full_name")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.full_name ?? "", onChange: (e) => setV({
        ...v,
        full_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.title_position"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.title ?? "", onChange: (e) => setV({
        ...v,
        title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.department"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.department ?? "", onChange: (e) => setV({
        ...v,
        department: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.language"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.preferred_language ?? "en", onValueChange: (x) => setV({
        ...v,
        preferred_language: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ar", children: "العربية" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "en", children: "English" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.email"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", value: v.email ?? "", onChange: (e) => setV({
        ...v,
        email: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.phone"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.phone ?? "", onChange: (e) => setV({
        ...v,
        phone: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.mobile"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.mobile ?? "", onChange: (e) => setV({
        ...v,
        mobile: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.whatsapp"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.whatsapp ?? "", onChange: (e) => setV({
        ...v,
        whatsapp: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_primary, onCheckedChange: (x) => setV({
          ...v,
          is_primary: !!x
        }) }),
        t("label.is_primary")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
        ...v,
        notes: e.target.value
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function SuppliersTab({
  hotelId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const suppliers = useSuppliersLite();
  const [open, setOpen] = reactExports.useState(false);
  const [v, setV] = reactExports.useState({});
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["hotel-suppliers", hotelId],
    queryFn: async () => (await supabase.from("hotel_suppliers").select("*, supplier:suppliers(id,code,name_en,name_ar)").eq("hotel_id", hotelId).order("is_preferred", {
      ascending: false
    })).data ?? []
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.supplier_id) throw new Error(t("label.required"));
      const {
        error
      } = await supabase.from("hotel_suppliers").insert({
        hotel_id: hotelId,
        supplier_id: v.supplier_id,
        is_preferred: !!v.is_preferred,
        notes: v.notes || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["hotel-suppliers", hotelId]
      });
      setOpen(false);
      setV({});
    },
    onError: (e) => toast.error(e.message)
  });
  const togglePref = useMutation({
    mutationFn: async ({
      rid,
      on
    }) => {
      const {
        error
      } = await supabase.from("hotel_suppliers").update({
        is_preferred: on
      }).eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["hotel-suppliers", hotelId]
    })
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("hotel_suppliers").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotel-suppliers", hotelId]
      });
      setDelId(null);
    }
  });
  const linkedIds = new Set((q.data ?? []).map((r) => r.supplier_id));
  const available = (suppliers.data ?? []).filter((s) => !linkedIds.has(s.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("hotels.suppliers") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (o) setV({
          is_preferred: false
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: available.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("actions.add")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("hotels.suppliers") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("filter.supplier")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.supplier_id ?? "", onValueChange: (x) => setV({
              ...v,
              supplier_id: x
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: available.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.id, children: [
                s.code,
                " — ",
                lang === "ar" ? s.name_ar : s.name_en
              ] }, s.id)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_preferred, onCheckedChange: (x) => setV({
                ...v,
                is_preferred: !!x
              }) }),
              t("label.is_preferred")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
              ...v,
              notes: e.target.value
            }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_preferred") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.notes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.supplier?.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.supplier?.name_ar : r.supplier?.name_en }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: canWrite ? /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!r.is_preferred, onCheckedChange: (x) => togglePref.mutate({
            rid: r.id,
            on: !!x
          }) }) : r.is_preferred && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-amber-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: r.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v2) => !v2 && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function RatesHistoryTab({
  hotelId
}) {
  const {
    t,
    lang
  } = useI18n();
  const q = useQuery({
    queryKey: ["hotel-rates", hotelId],
    queryFn: async () => (await supabase.from("rates").select("id,code,supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar),meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,created_at").eq("hotel_id", hotelId).is("deleted_at", null).order("valid_from", {
      ascending: false
    })).data ?? []
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.supplier") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.room_type") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.meal_plan") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_from") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_to") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.cost") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("hotels.no_rates") }) }),
      q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.supplier?.name_ar : r.supplier?.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? r.room_type?.name_ar : r.room_type?.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.meal_plan }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.valid_from }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.valid_to }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: Number(r.cost_per_night).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.status }) })
      ] }, r.id))
    ] })
  ] }) }) });
}
function BookingsTab() {
  const {
    t
  } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-10 text-center text-muted-foreground", children: t("hotels.no_bookings") }) });
}
export {
  HotelDetail as component
};
