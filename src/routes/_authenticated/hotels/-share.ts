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
  const cityEn = String(h?.city?.name_en ?? h?.city?.name ?? (typeof h?.city === "string" ? h.city : "") ?? "").toLowerCase();
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

  // Robust name selector with string and object fallbacks
  const nm = (o: any) => {
    if (!o) return "—";
    if (typeof o === "string") return o;
    return (rtl ? o.name_ar || o.name_en || o.name : o.name_en || o.name_ar || o.name) ?? "—";
  };

  const haram = haramInfo(h);

  const meta = (k: string, v: unknown, ltr = false) =>
    `<div class="box"><div class="k">${esc(k)}</div><div class="v"${ltr ? ' dir="ltr"' : ""}>${esc(v || "—")}</div></div>`;

  // Fallbacks for related data (from API response h.* if Supabase data.* is empty)
  const hotelRooms = (data.rooms && data.rooms.length) ? data.rooms : (h.rooms ?? h.room_types ?? []);
  const hotelViews = (data.views && data.views.length) ? data.views : (h.views ?? []);
  const hotelMeals = (data.meals && data.meals.length) ? data.meals : (h.meals ?? h.meal_plans ?? []);
  const hotelFacilities = (data.facilities && data.facilities.length) ? data.facilities : (h.facilities ?? []);
  const hotelContacts = (data.contacts && data.contacts.length) ? data.contacts : (h.contacts ?? []);
  const hotelImages = ((data.images && data.images.length) ? data.images : (h.images ?? [])).slice(0, 6);

  const imgGrid = hotelImages.length
    ? `<h2>${esc(s.images)}</h2><div class="imgs">${hotelImages
        .map((i: any) => `<figure><img src="${esc(i.image_url ?? i.file_path)}" alt="${esc(i.caption ?? nm(h))}" />${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ""}</figure>`)
        .join("")}</div>`
    : "";

  const roomRows = hotelRooms
    .map((r: any) => `<tr><td>${esc(nm(r))}</td><td class="c">${esc(r.max_adults ?? "—")}</td><td class="c">${esc(r.max_children ?? "—")}</td><td>${esc(r.bed_type ?? "—")}</td></tr>`)
    .join("");
  const roomsTable = hotelRooms.length
    ? `<h2>${esc(s.room_types)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.max_adults)}</th><th>${esc(s.max_children)}</th><th>${esc(s.bed_type)}</th></tr></thead><tbody>${roomRows}</tbody></table>`
    : "";

  const getViewName = (v: any) => {
    if (typeof v === "string") return v;
    return nm(v);
  };
  const viewsList = hotelViews.length
    ? `<h2>${esc(s.views)}</h2><div class="chips">${hotelViews.map((v: any) => `<span class="chip">${esc(getViewName(v))}</span>`).join("")}</div>`
    : "";

  const mealRows = hotelMeals
    .map((m: any) => `<tr><td class="c">${esc(m.board ?? m.code ?? "—")}</td><td>${esc(nm(m))}</td><td>${esc((rtl ? m.description_ar || m.description_en || m.description : m.description_en || m.description_ar || m.description) ?? "")}</td></tr>`)
    .join("");
  const mealsTable = hotelMeals.length
    ? `<h2>${esc(s.meal_plans)}</h2><table><thead><tr><th>${esc(s.board)}</th><th>${esc(s.name)}</th><th>${esc(s.description)}</th></tr></thead><tbody>${mealRows}</tbody></table>`
    : "";

  const getFacilityName = (f: any) => {
    if (typeof f === "string") return f;
    return nm(f);
  };
  const facChips = hotelFacilities.length
    ? `<h2>${esc(s.facilities)}</h2><div class="chips">${hotelFacilities.map((f: any) => `<span class="chip">${esc(getFacilityName(f))}</span>`).join("")}</div>`
    : "";

  const contactRows = hotelContacts
    .map((c: any) => `<tr><td>${esc(c.full_name || c.name || "—")}${c.is_primary ? " ★" : ""}</td><td>${esc(c.title ?? c.job_title ?? "—")}</td><td dir="ltr">${esc(c.phone || c.mobile || "—")}</td><td dir="ltr">${esc(c.email ?? "—")}</td><td dir="ltr">${esc(c.whatsapp ?? "—")}</td></tr>`)
    .join("");
  const contactsTable = hotelContacts.length
    ? `<h2>${esc(s.contacts)}</h2><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.job_title)}</th><th>${esc(s.phone)}</th><th>${esc(s.email)}</th><th>WhatsApp</th></tr></thead><tbody>${contactRows}</tbody></table>`
    : "";

  const desc = rtl ? h.description_ar || h.description || h.description_en : h.description_en || h.description || h.description_ar;
  const policies = rtl ? h.policies_ar || h.policies || h.policies_en : h.policies_en || h.policies || h.policies_ar;

  const starsCount = Number(h.stars ?? h.star_rating ?? 0);
  const coverImage = h.cover_image ?? h.cover_image_path;

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} — ${esc(nm(h))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif; color: #1e293b; padding: 32px; font-size: 13px; background: #fff; line-height: 1.5; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #14532d; padding-bottom: 16px; }
  .head img { height: 60px; object-fit: contain; }
  .head .t { text-align: ${rtl ? "left" : "right"}; }
  .head h1 { font-size: 22px; color: #14532d; font-weight: 700; }
  .head .no { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 600; }
  .hero { margin: 20px 0; border-radius: 12px; overflow: hidden; height: 280px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
  .hero img { width: 100%; height: 100%; object-fit: cover; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
  .box .k { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .box .v { font-weight: 600; margin-top: 3px; color: #0f172a; }
  h2 { font-size: 15px; color: #14532d; margin: 24px 0 10px; font-weight: 700; border-bottom: 1px solid #f0fdf4; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
  th, td { padding: 9px 12px; text-align: ${rtl ? "right" : "left"}; border-bottom: 1px solid #e2e8f0; }
  th { background: #14532d; color: #fff; font-size: 12px; font-weight: 600; }
  tr:last-child td { border-bottom: none; }
  td.c { text-align: center; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534; border-radius: 999px; padding: 5px 14px; font-size: 12px; font-weight: 500; }
  .imgs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 10px; }
  .imgs figure { margin: 0; }
  .imgs img { width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.05); }
  .imgs figcaption { font-size: 11px; color: #64748b; margin-top: 4px; text-align: center; }
  .desc { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; background: #f8fafc; line-height: 1.7; white-space: pre-wrap; color: #334155; }
  .stars { color: #eab308; letter-spacing: 2px; }
  .foot { margin-top: 36px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-weight: 500; }
  @media print { 
    body { padding: 0; font-size: 12px; } 
    .noprint { display: none; } 
    .box { background: #fff !important; border-color: #ddd !important; }
    .chip { background: #fff !important; border-color: #ddd !important; color: #333 !important; }
    .desc { background: #fff !important; border-color: #ddd !important; }
    table { border-color: #ddd !important; }
    th { background: #14532d !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .noprint { position: fixed; top: 12px; ${rtl ? "left" : "right"}: 12px; z-index: 9999; }
  .noprint button { background: #166534; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: background 0.2s; }
  .noprint button:hover { background: #14532d; }
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
      <div class="no">${esc(nm(h))} <span class="stars">${starsCount > 0 ? "★".repeat(starsCount) : ""}</span></div>
    </div>
  </div>

  ${coverImage ? `<div class="hero"><img src="${esc(coverImage)}" alt="${esc(nm(h))}" /></div>` : ""}

  <div class="meta">
    ${meta(s.code, h.code, true)}
    ${meta(s.brand, h.brand)}
    ${meta(s.rating, starsCount > 0 ? "★".repeat(starsCount) : "—")}
    ${meta(s.country, nm(h.country))}
    ${meta(s.city, nm(h.city))}
    ${meta(s.district, h.district)}
    ${meta(s.address, [h.address_1 ?? h.address_line1 ?? h.address, h.address_2 ?? h.address_line2, h.postal_code].filter(Boolean).join(", "))}
    ${meta(s.near_haram, haram.meters == null ? "—" : haram.near ? s.yes : s.no)}
    ${meta(s.distance, haram.meters == null ? "—" : haram.meters.toLocaleString("en-US"), true)}
    ${(h.map_link ?? h.location_url) ? `<div class="box"><div class="k">${esc(s.maps)}</div><div class="v"><a href="${esc(h.map_link ?? h.location_url)}" target="_blank" style="color:#14532d;text-decoration:underline;font-weight:600">${esc(s.maps)}</a></div></div>` : ""}
    ${meta(s.phone, h.phone, true)}
    ${meta(s.email, h.email, true)}
    ${meta(s.website, h.website, true)}
    ${meta(s.check_in_time + " / " + s.check_out_time, [(h.check_in ?? h.check_in_time)?.slice(0, 5), (h.check_out ?? h.check_out_time)?.slice(0, 5)].filter(Boolean).join(" / "), true)}
  </div>

  ${desc ? `<h2>${esc(s.description)}</h2><div class="desc">${esc(desc)}</div>` : ""}
  ${policies ? `<h2>${esc(s.policies)}</h2><div class="desc">${esc(policies)}</div>` : ""}
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