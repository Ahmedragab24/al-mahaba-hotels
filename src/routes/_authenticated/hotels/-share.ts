// Hotel Information sharing engine — multilingual preview / print / PDF document.
// BRD: Hotel Information output in Arabic, English, Indonesian, Urdu (RTL/LTR aware).
import { supabase } from "@/integrations/supabase/client";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import { DOC_LANGS, HOTEL_RES, missingDocKeys, type DocLang } from "@/lib/doc-lang";
import { apiClient } from "@/lib/api/api-client";

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type HotelShareData = {
  hotel: any;
  rooms: any[];
  views: any[];
  meals: any[];
  facilities: any[];
  images: any[];
  contacts: any[];
};

/** Fetch everything required for the hotel information document. */
export async function fetchHotelShareData(hotelId: string): Promise<HotelShareData> {
  const [hotelApi, hotelSupa, rooms, views, meals, facilities, images, contacts] = await Promise.all([
    apiClient.hotels.getById(Number(hotelId)).catch(() => null),
    supabase.from("hotels").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", hotelId).maybeSingle(),
    supabase.from("hotel_room_types").select("*").eq("hotel_id", hotelId).eq("is_active", true).order("sort_order"),
    supabase.from("hotel_views").select("*").eq("hotel_id", hotelId).eq("is_active", true),
    supabase.from("hotel_meal_plans").select("*").eq("hotel_id", hotelId).eq("is_active", true),
    supabase.from("hotel_facilities").select("facility:facilities(name_en,name_ar,category)").eq("hotel_id", hotelId),
    supabase.from("hotel_images").select("*").eq("hotel_id", hotelId).order("is_cover", { ascending: false }).order("sort_order").limit(6),
    supabase.from("hotel_contacts").select("*").eq("hotel_id", hotelId).order("is_primary", { ascending: false }),
  ]);
  return {
    hotel: hotelApi || hotelSupa.data,
    rooms: rooms.data ?? [],
    views: views.data ?? [],
    meals: meals.data ?? [],
    facilities: (facilities.data ?? []).map((f: any) => f.facility).filter(Boolean),
    images: images.data ?? [],
    contacts: contacts.data ?? [],
  };
}

// Haram reference coordinates (Masjid al-Haram, Makkah / Masjid an-Nabawi, Madinah)
const HARAM = {
  makkah: { lat: 21.4225, lng: 39.8262 },
  madinah: { lat: 24.4672, lng: 39.6111 },
};

/** Derive Haram distance / Near-Haram flag from hotel coordinates (no schema change). */
export function haramInfo(h: any): { near: boolean; meters: number | null } {
  const cityEn = String(h?.city?.name_en ?? "").toLowerCase();
  const target = /makkah|mecca/.test(cityEn) ? HARAM.makkah : /madinah|medina/.test(cityEn) ? HARAM.madinah : null;
  const lat = h?.latitude == null ? null : Number(h.latitude);
  const lng = h?.longitude == null ? null : Number(h.longitude);
  if (!target || lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return { near: false, meters: null };
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(target.lat - lat);
  const dLng = toRad(target.lng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(target.lat)) * Math.sin(dLng / 2) ** 2;
  const meters = Math.round(2 * R * Math.asin(Math.sqrt(a)));
  return { near: meters <= 1500, meters };
}

/** Build the multilingual hotel information HTML document. Returns null if mandatory translations are missing. */
export function buildHotelInfoHtml(lang: DocLang, data: HotelShareData): string | null {
  // BR: document generation cannot proceed if mandatory translations are missing.
  if (missingDocKeys(lang, "hotel").length > 0) return null;
  const s = HOTEL_RES[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const rtl = dir === "rtl";
  const h = data.hotel;
  if (!h) return null;
  const nm = (o: any) => (rtl ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const haram = haramInfo(h);

  const meta = (k: string, v: unknown, ltr = false) =>
    `<div class="box"><div class="k">${esc(k)}</div><div class="v"${ltr ? ' dir="ltr"' : ""}>${esc(v || "—")}</div></div>`;

  const imgGrid = data.images.length
    ? `<h2>${esc(s.images)}</h2><div class="imgs">${data.images
        .map((i: any) => `<figure><img src="${esc(i.file_path)}" alt="${esc(i.caption ?? nm(h))}" />${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ""}</figure>`)
        .join("")}</div>`
    : "";

  const roomRows = data.rooms
    .map((r: any) => `<tr><td>${esc(nm(r))}</td><td class="c">${esc(r.max_adults ?? "—")}</td><td class="c">${esc(r.max_children ?? "—")}</td><td>${esc(r.bed_type ?? "—")}</td></tr>`)
    .join("");
  const roomsTable = data.rooms.length
    ? `<h2>${esc(s.room_types)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.max_adults)}</th><th>${esc(s.max_children)}</th><th>${esc(s.bed_type)}</th></tr></thead><tbody>${roomRows}</tbody></table>`
    : "";

  const viewsList = data.views.length
    ? `<h2>${esc(s.views)}</h2><div class="chips">${data.views.map((v: any) => `<span class="chip">${esc(nm(v))}</span>`).join("")}</div>`
    : "";

  const mealRows = data.meals
    .map((m: any) => `<tr><td class="c">${esc(m.board)}</td><td>${esc(nm(m))}</td><td>${esc((rtl ? m.description_ar || m.description_en : m.description_en || m.description_ar) ?? "")}</td></tr>`)
    .join("");
  const mealsTable = data.meals.length
    ? `<h2>${esc(s.meal_plans)}</h2><table><thead><tr><th>${esc(s.board)}</th><th>${esc(s.name)}</th><th>${esc(s.description)}</th></tr></thead><tbody>${mealRows}</tbody></table>`
    : "";

  const facChips = data.facilities.length
    ? `<h2>${esc(s.facilities)}</h2><div class="chips">${data.facilities.map((f: any) => `<span class="chip">${esc(nm(f))}</span>`).join("")}</div>`
    : "";

  const contactRows = data.contacts
    .map((c: any) => `<tr><td>${esc(c.full_name)}${c.is_primary ? " ★" : ""}</td><td>${esc(c.title ?? "—")}</td><td dir="ltr">${esc(c.phone || c.mobile || "—")}</td><td dir="ltr">${esc(c.email ?? "—")}</td><td dir="ltr">${esc(c.whatsapp ?? "—")}</td></tr>`)
    .join("");
  const contactsTable = data.contacts.length
    ? `<h2>${esc(s.contacts)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.job_title)}</th><th>${esc(s.phone)}</th><th>${esc(s.email)}</th><th>WhatsApp</th></tr></thead><tbody>${contactRows}</tbody></table>`
    : "";

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
      <div class="no">${esc(nm(h))} <span class="stars">${(h.stars ?? h.star_rating) ? "★".repeat(h.stars ?? h.star_rating) : ""}</span></div>
    </div>
  </div>

  <div class="meta">
    ${meta(s.code, h.code, true)}
    ${meta(s.rating, (h.stars ?? h.star_rating) ? "★".repeat(h.stars ?? h.star_rating) : "—")}
    ${meta(s.country, nm(h.country))}
    ${meta(s.city, nm(h.city))}
    ${meta(s.district, h.district)}
    ${meta(s.address, [h.address_1 ?? h.address_line1, h.postal_code].filter(Boolean).join(", "))}
    ${meta(s.near_haram, haram.meters == null ? "—" : haram.near ? s.yes : s.no)}
    ${meta(s.distance, haram.meters == null ? "—" : haram.meters.toLocaleString("en-US"), true)}
    ${(h.map_link ?? h.location_url) ? `<div class="box"><div class="k">${esc(s.maps)}</div><div class="v"><a href="${esc(h.map_link ?? h.location_url)}" target="_blank" style="color:#14532d;text-decoration:underline">${esc(s.maps)}</a></div></div>` : ""}
    ${meta(s.phone, h.phone, true)}
    ${meta(s.email, h.email, true)}
    ${meta(s.website, h.website, true)}
    ${meta(s.check_in_time + " / " + s.check_out_time, [(h.check_in ?? h.check_in_time)?.slice(0, 5), (h.check_out ?? h.check_out_time)?.slice(0, 5)].filter(Boolean).join(" / "), true)}
  </div>

  ${desc ? `<h2>${esc(s.description)}</h2><div class="desc">${esc(desc)}</div>` : ""}
  ${imgGrid}
  ${roomsTable}
  ${viewsList}
  ${mealsTable}
  ${facChips}
  ${contactsTable}

  <div class="foot">${esc(s.generated)}: <span dir="ltr">${new Date().toLocaleString(locale)}</span> — ${esc(s.footer)}</div>
</body>
</html>`;
}

/** Open the printable hotel information document in a new window + audit log. */
export async function openHotelInfoPrint(lang: DocLang, data: HotelShareData): Promise<boolean> {
  const html = buildHotelInfoHtml(lang, data);
  if (!html) return false;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  try {
    await (supabase.rpc as any)("log_audit", {
      _action: "pdf_generate",
      _entity_type: "hotels",
      _entity_id: data.hotel.id,
      _metadata: { lang, doc: "hotel_information", hotel_code: data.hotel.code },
    });
  } catch {
    // audit failure must not block printing
  }
  return true;
}