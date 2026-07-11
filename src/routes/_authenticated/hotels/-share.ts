// Hotel Information sharing engine — multilingual preview / print / PDF document.
// BRD: Hotel Information output in Arabic, English, Indonesian, Urdu (RTL/LTR aware).
import { db as supabase } from "@/store/queryBridge";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import { DOC_LANGS, HOTEL_RES, missingDocKeys, type DocLang } from "@/lib/doc-lang";
import { apiClient } from "@/store/queryBridge";

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
    supabase.from("hotels").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", hotelId).maybeSingle().catch(() => null),
    supabase.from("hotel_room_types").select("*").eq("hotel_id", hotelId).eq("is_active", true).order("sort_order").catch(() => null),
    supabase.from("hotel_views").select("*").eq("hotel_id", hotelId).eq("is_active", true).catch(() => null),
    supabase.from("hotel_meal_plans").select("*").eq("hotel_id", hotelId).eq("is_active", true).catch(() => null),
    supabase.from("hotel_facilities").select("facility:facilities(name_en,name_ar,category)").eq("hotel_id", hotelId).catch(() => null),
    supabase.from("hotel_images").select("*").eq("hotel_id", hotelId).order("is_cover", { ascending: false }).order("sort_order").limit(6).catch(() => null),
    supabase.from("hotel_contacts").select("*").eq("hotel_id", hotelId).order("is_primary", { ascending: false }).catch(() => null),
  ]);
  return {
    hotel: hotelApi || hotelSupa?.data,
    rooms: rooms?.data ?? [],
    views: views?.data ?? [],
    meals: meals?.data ?? [],
    facilities: (facilities?.data ?? []).map((f: any) => f?.facility).filter(Boolean),
    images: images?.data ?? [],
    contacts: contacts?.data ?? [],
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

export function formatTimeStr(timeStr: string | null | undefined, lang: string, forceSuffix?: "AM" | "PM"): string {
  if (!timeStr) return "—";
  const parts = String(timeStr).split(":");
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return timeStr;
  
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, "0");
  
  const isAr = lang === "ar" || lang === "ur";
  let suffix = "";
  if (forceSuffix) {
    if (forceSuffix === "AM") {
      suffix = isAr ? "صباحاً" : "AM";
    } else {
      suffix = isAr ? "مساءً" : "PM";
    }
  } else {
    const isPm = hour >= 12;
    if (isPm) {
      suffix = isAr ? "مساءً" : "PM";
    } else {
      suffix = isAr ? "صباحاً" : "AM";
    }
  }
  
  return `${displayHour.toString().padStart(2, "0")}:${displayMinute} ${suffix}`;
}

export function formatGeneratedDate(lang: string): string {
  const d = new Date();
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const isAr = lang === "ar" || lang === "ur";
  const localeStr = isAr ? "ar-EG" : lang === "id" ? "id-ID" : "en-US";
  try {
    return new Intl.DateTimeFormat(localeStr, formatOptions).format(d);
  } catch {
    return d.toLocaleString();
  }
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

  // Prioritize API response arrays (h.*) over the separate Supabase queries (data.*)
  const hotelRooms = h.rooms ?? h.room_types ?? h.roomTypes ?? (data.rooms && data.rooms.length ? data.rooms : []);
  const hotelViews = h.views ?? (data.views && data.views.length ? data.views : []);
  const hotelMeals = h.meals ?? h.meal_plans ?? h.mealPlans ?? (data.meals && data.meals.length ? data.meals : []);
  const hotelFacilities = h.facilities ?? (data.facilities && data.facilities.length ? data.facilities : []);
  const hotelContacts = h.contacts ?? (data.contacts && data.contacts.length ? data.contacts : []);
  const hotelImages = h.images ?? (data.images && data.images.length ? data.images : []);

  const parsedImages = hotelImages.slice(0, 9);
  const coverImage = h.cover_image ?? h.cover_image_path;
  const secondaryImages = parsedImages.filter((img: any) => {
    const url = img.image_url ?? img.file_path;
    return url !== coverImage;
  });

  const roomRows = hotelRooms
    .map((r: any) => `<tr><td>${esc(nm(r))}</td><td class="c">${esc(r.max_adults ?? "—")}</td><td class="c">${esc(r.max_children ?? "—")}</td><td>${esc(r.bed_type ?? "—")}</td></tr>`)
    .join("");
  const roomsTable = hotelRooms.length
    ? `<h3 class="section-title">${esc(s.room_types)}</h3><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.max_adults)}</th><th>${esc(s.max_children)}</th><th>${esc(s.bed_type)}</th></tr></thead><tbody>${roomRows}</tbody></table>`
    : "";

  const getViewName = (v: any) => {
    if (typeof v === "string") return v;
    return nm(v);
  };
  const viewsList = hotelViews.length
    ? hotelViews.map((v: any) => `<span class="chip">${esc(getViewName(v))}</span>`).join("")
    : "";

  const mealRows = hotelMeals
    .map((m: any) => `<tr><td class="c">${esc(m.board ?? m.code ?? "—")}</td><td>${esc(nm(m))}</td><td>${esc((rtl ? m.description_ar || m.description_en || m.description : m.description_en || m.description_ar || m.description) ?? "")}</td></tr>`)
    .join("");
  const mealsTable = hotelMeals.length
    ? `<h3 class="section-title">${esc(s.meal_plans)}</h3><table><thead><tr><th>${esc(s.board)}</th><th>${esc(s.name)}</th><th>${esc(s.description)}</th></tr></thead><tbody>${mealRows}</tbody></table>`
    : "";

  const getFacilityName = (f: any) => {
    if (typeof f === "string") return f;
    return nm(f);
  };
  const facChips = hotelFacilities.length
    ? hotelFacilities.map((f: any) => `<span class="chip">${esc(getFacilityName(f))}</span>`).join("")
    : "";

  const contactRows = hotelContacts
    .map((c: any) => `<tr><td>${esc(c.full_name || c.name || "—")}${c.is_primary ? " ★" : ""}</td><td>${esc(c.title ?? c.job_title ?? "—")}</td><td dir="ltr">${esc(c.phone || c.mobile || "—")}</td><td dir="ltr">${esc(c.email ?? "—")}</td><td dir="ltr">${esc(c.whatsapp ?? "—")}</td></tr>`)
    .join("");
  const contactsTable = hotelContacts.length
    ? `<h3 class="section-title">${esc(s.contacts)}</h3><table><thead><tr><th>${esc(s.name)}</th><th>${esc(s.job_title)}</th><th>${esc(s.phone)}</th><th>${esc(s.email)}</th><th>WhatsApp</th></tr></thead><tbody>${contactRows}</tbody></table>`
    : "";

  const desc = rtl ? h.description_ar || h.description || h.description_en : h.description_en || h.description || h.description_ar;
  const policies = rtl ? h.policies_ar || h.policies || h.policies_en : h.policies_en || h.policies || h.policies_ar;

  const starsCount = Number(h.stars ?? h.star_rating ?? 0);

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} — ${esc(nm(h))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }
  body { 
    font-family: 'Cairo', 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif; 
    color: #1e293b; 
    padding: 32px; 
    font-size: 13px; 
    background: #fff; 
    line-height: 1.6; 
  }
  .head { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    border-bottom: 2px solid #b38e46; 
    padding-bottom: 16px; 
    margin-bottom: 24px;
  }
  .logo-container { 
    display: flex; 
    align-items: center; 
    gap: 14px; 
  }
  .logo-container img { 
    height: 50px; 
    object-fit: contain; 
  }
  .company-name { 
    font-weight: 700; 
    font-size: 18px; 
    color: #0f5132; 
  }
  .doc-title { 
    text-align: ${rtl ? "left" : "right"}; 
  }
  .doc-title h1 { 
    font-size: 24px; 
    color: #0f5132; 
    font-weight: 700; 
    margin-bottom: 4px;
  }
  .doc-title .hotel-subtitle { 
    font-size: 14px; 
    color: #b38e46; 
    font-weight: 600; 
  }
  
  .hero { 
    position: relative; 
    border-radius: 12px; 
    overflow: hidden; 
    height: 300px; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
    margin-bottom: 24px;
    page-break-inside: avoid;
  }
  .hero img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
  }
  .hero-overlay { 
    position: absolute; 
    bottom: 0; 
    left: 0; 
    right: 0; 
    background: linear-gradient(to top, rgba(15, 81, 50, 0.95), rgba(15, 81, 50, 0.4), transparent); 
    padding: 24px; 
    color: #fff; 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
  }
  .hero-text h2 { 
    font-size: 24px; 
    font-weight: 700; 
    margin: 0 0 6px 0;
    color: #fff;
  }
  .hero-text p { 
    font-size: 13px; 
    color: #f1f5f9; 
    font-weight: 500;
  }
  .hero-stars { 
    color: #b38e46; 
    font-size: 20px; 
  }

  .content-grid { 
    display: grid; 
    grid-template-columns: 2.2fr 1fr; 
    gap: 24px; 
    margin-bottom: 24px; 
  }
  
  .main-column { 
    display: flex; 
    flex-direction: column; 
    gap: 24px; 
  }
  .side-column { 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
  }

  .card { 
    border: 1px solid #e2e8f0; 
    border-radius: 12px; 
    background: #fff; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.02); 
    overflow: hidden; 
    page-break-inside: avoid;
  }
  .card-header { 
    background: #0f5132; 
    color: #fff; 
    padding: 12px 18px; 
    font-weight: 700; 
    font-size: 14px; 
  }
  .card-body { 
    padding: 16px; 
  }

  .spec-item { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 10px 0; 
    border-bottom: 1px solid #f1f5f9; 
  }
  .spec-item:last-child { 
    border-bottom: none; 
  }
  .spec-label { 
    font-size: 12px; 
    color: #64748b; 
    font-weight: 600; 
  }
  .spec-value { 
    font-size: 13px; 
    color: #0f172a; 
    font-weight: 600; 
    text-align: ${rtl ? "left" : "right"};
  }

  .section-title { 
    font-size: 16px; 
    color: #0f5132; 
    margin-bottom: 12px; 
    font-weight: 700; 
    border-inline-start: 4px solid #b38e46; 
    padding-inline-start: 10px;
    page-break-after: avoid;
  }

  .desc-box { 
    border: 1px solid #e2e8f0; 
    border-radius: 10px; 
    padding: 16px; 
    background: #f8fafc; 
    line-height: 1.8; 
    white-space: pre-wrap; 
    color: #334155; 
    font-size: 13px;
    page-break-inside: avoid;
  }
  .policy-box { 
    border: 1px solid #fed7aa; 
    border-inline-start: 4px solid #dd6b20;
    border-radius: 10px; 
    padding: 16px; 
    background: #fffaf0; 
    line-height: 1.8; 
    white-space: pre-wrap; 
    color: #4a5568; 
    font-size: 13px;
    page-break-inside: avoid;
  }

  .chips-container { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 8px; 
    margin-bottom: 8px;
    page-break-inside: avoid;
  }
  .chip { 
    border: 1px solid #d1fae5; 
    background: #ecfdf5; 
    color: #065f46; 
    border-radius: 20px; 
    padding: 6px 14px; 
    font-size: 12px; 
    font-weight: 600; 
  }

  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-bottom: 24px; 
    border-radius: 10px; 
    overflow: hidden; 
    border: 1px solid #e2e8f0; 
    page-break-inside: avoid;
  }
  th, td { 
    padding: 12px 16px; 
    text-align: ${rtl ? "right" : "left"}; 
    border-bottom: 1px solid #e2e8f0; 
  }
  th { 
    background: #0f5132; 
    color: #fff; 
    font-size: 12px; 
    font-weight: 700; 
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:last-child td { 
    border-bottom: none; 
  }
  tr:nth-child(even) {
    background: #f8fafc;
  }
  td.c { 
    text-align: center; 
  }
  
  .gallery-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 14px; 
    margin-bottom: 24px;
    page-break-inside: avoid;
  }
  .gallery-grid figure { 
    margin: 0; 
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    border: 1px solid #e2e8f0;
  }
  .gallery-grid img { 
    width: 100%; 
    aspect-ratio: 4/3; 
    object-fit: cover; 
    display: block;
  }
  
  .maps-btn {
    display: block;
    background: #b38e46;
    color: #fff;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12px;
    text-align: center;
    transition: background 0.2s;
    width: 100%;
    margin-top: 8px;
  }
  .maps-btn:hover {
    background: #967537;
  }

  .stars { 
    color: #b38e46; 
  }
  
  .foot { 
    margin-top: 40px; 
    text-align: center; 
    color: #64748b; 
    font-size: 11px; 
    border-top: 1px solid #e2e8f0; 
    padding-top: 20px; 
    font-weight: 600; 
  }

  .full-width-section {
    margin-bottom: 24px;
    page-break-inside: avoid;
  }

  @media print { 
    body { 
      padding: 0; 
      font-size: 12px; 
    } 
    .noprint { 
      display: none; 
    } 
    .card {
      box-shadow: none !important;
      border-color: #cbd5e1 !important;
    }
    .desc-box, .policy-box { 
      background: #fff !important; 
      border-color: #cbd5e1 !important; 
    }
    .chip { 
      background: #fff !important; 
      border-color: #cbd5e1 !important; 
      color: #0f172a !important; 
    }
  }

  .noprint { 
    position: fixed; 
    top: 16px; 
    ${rtl ? "left" : "right"}: 16px; 
    z-index: 9999; 
  }
  .noprint button { 
    background: #0f5132; 
    color: #fff; 
    border: 0; 
    border-radius: 6px; 
    padding: 10px 20px; 
    font-size: 14px; 
    font-weight: 700; 
    cursor: pointer; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.15); 
    transition: background 0.2s; 
  }
  .noprint button:hover { 
    background: #0c4028; 
  }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">🖨 ${esc(s.print)}</button></div>
  
  <div class="head">
    <div class="logo-container">
      <img src="${esc(location.origin + logoUrl)}" alt="logo" />
      <div class="company-name">${esc(s.company)}</div>
    </div>
    <div class="doc-title">
      <h1>${esc(s.title)}</h1>
      <div class="hotel-subtitle">${esc(nm(h))}</div>
    </div>
  </div>

  ${coverImage ? `
  <div class="hero">
    <img src="${esc(coverImage)}" alt="${esc(nm(h))}" />
    <div class="hero-overlay">
      <div class="hero-text">
        <h2>${esc(nm(h))}</h2>
        <p>${esc(nm(h.city))}, ${esc(nm(h.country))}</p>
      </div>
      <div class="hero-stars">${starsCount > 0 ? "★".repeat(starsCount) : ""}</div>
    </div>
  </div>
  ` : ""}

  <div class="content-grid">
    <div class="main-column">
      ${desc ? `
      <div>
        <h3 class="section-title">${esc(s.description)}</h3>
        <div class="desc-box">${esc(desc)}</div>
      </div>
      ` : ""}

      ${policies ? `
      <div>
        <h3 class="section-title">${esc(s.policies)}</h3>
        <div class="policy-box">${esc(policies)}</div>
      </div>
      ` : ""}

      ${viewsList ? `
      <div>
        <h3 class="section-title">${esc(s.views)}</h3>
        <div class="chips-container">${viewsList}</div>
      </div>
      ` : ""}

      ${facChips ? `
      <div>
        <h3 class="section-title">${esc(s.facilities)}</h3>
        <div class="chips-container">${facChips}</div>
      </div>
      ` : ""}
    </div>

    <div class="side-column">
      <div class="card">
        <div class="card-header">${esc(s.title)}</div>
        <div class="card-body" style="padding: 0 16px;">
          <div class="spec-item">
            <span class="spec-label">${esc(s.code)}</span>
            <span class="spec-value" dir="ltr">${esc(h.code)}</span>
          </div>
          ${h.brand ? `
          <div class="spec-item">
            <span class="spec-label">${esc(s.brand)}</span>
            <span class="spec-value">${esc(h.brand)}</span>
          </div>
          ` : ""}
          <div class="spec-item">
            <span class="spec-label">${esc(s.rating)}</span>
            <span class="spec-value stars">${starsCount > 0 ? "★".repeat(starsCount) : "—"}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">${esc(s.country)}</span>
            <span class="spec-value">${esc(nm(h.country))}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">${esc(s.city)}</span>
            <span class="spec-value">${esc(nm(h.city))}</span>
          </div>
          ${h.district ? `
          <div class="spec-item">
            <span class="spec-label">${esc(s.district)}</span>
            <span class="spec-value">${esc(h.district)}</span>
          </div>
          ` : ""}
          <div class="spec-item">
            <span class="spec-label">${esc(s.check_in_time)}</span>
            <span class="spec-value" dir="ltr">${esc(formatTimeStr(h.check_in ?? h.check_in_time, lang, "AM"))}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">${esc(s.check_out_time)}</span>
            <span class="spec-value" dir="ltr">${esc(formatTimeStr(h.check_out ?? h.check_out_time, lang, "PM"))}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">${rtl ? "اتصال" : "Contact Details"}</div>
        <div class="card-body">
          ${h.phone ? `
          <div style="margin-bottom: 8px;">
            <div class="spec-label" style="margin-bottom: 2px;">${esc(s.phone)}</div>
            <div class="spec-value" style="text-align: ${rtl ? 'right' : 'left'}" dir="ltr">${esc(h.phone)}</div>
          </div>
          ` : ""}
          ${h.email ? `
          <div style="margin-bottom: 8px;">
            <div class="spec-label" style="margin-bottom: 2px;">${esc(s.email)}</div>
            <div class="spec-value" style="text-align: ${rtl ? 'right' : 'left'}" dir="ltr">${esc(h.email)}</div>
          </div>
          ` : ""}
          ${h.website ? `
          <div style="margin-bottom: 8px;">
            <div class="spec-label" style="margin-bottom: 2px;">${esc(s.website)}</div>
            <div class="spec-value" style="text-align: ${rtl ? 'right' : 'left'}" dir="ltr">
              <a href="${esc(h.website.startsWith('http') ? h.website : 'https://' + h.website)}" target="_blank" style="color:#0f5132;text-decoration:underline;">${esc(h.website)}</a>
            </div>
          </div>
          ` : ""}
          
          ${(h.map_link ?? h.location_url) ? `
            <a href="${esc(h.map_link ?? h.location_url)}" target="_blank" class="maps-btn">📍 ${esc(s.maps)}</a>
          ` : ""}
        </div>
      </div>
    </div>
  </div>

  ${secondaryImages.length ? `
  <div class="full-width-section">
    <h3 class="section-title">${esc(s.images)}</h3>
    <div class="gallery-grid">
      ${secondaryImages.map((i: any) => `
        <figure>
          <img src="${esc(i.image_url ?? i.file_path)}" alt="${esc(nm(h))}" />
        </figure>
      `).join("")}
    </div>
  </div>
  ` : ""}

  ${contactsTable ? `<div class="full-width-section">${contactsTable}</div>` : ""}

  <div class="foot">${esc(s.generated)}: <span dir="ltr">${esc(formatGeneratedDate(lang))}</span> — ${esc(s.footer)}</div>
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