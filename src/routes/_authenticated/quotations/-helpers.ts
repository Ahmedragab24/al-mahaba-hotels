import type { DocLang } from "@/lib/doc-lang";
import { DOC_LANGS } from "@/lib/doc-lang";

/** Brand colors aligned with src/styles.css (--brand-gold, --brand-gold-deep, --brand-dark). */
export const QUOTE_PRINT_THEME = {
  gold: "#bf9f53",
  goldDeep: "#8b7342",
  goldLight: "#f5f0e6",
  dark: "#2a2520",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
} as const;

export type QuotationRecipient = "customer" | "supplier";

export function localizedName(
  obj: { name?: string | null; name_ar?: string | null; name_en?: string | null } | null | undefined,
  rtl: boolean,
): string {
  if (!obj) return "—";
  if (typeof obj === "string") return obj;
  return (rtl ? obj.name_ar || obj.name_en || obj.name : obj.name_en || obj.name_ar || obj.name) ?? "—";
}

export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const normalized = value.includes(" ") && !value.includes("T") ? value.replace(" ", "T") : value;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function calcNights(checkIn: string | null | undefined, checkOut: string | null | undefined): number {
  const start = parseApiDate(checkIn);
  const end = parseApiDate(checkOut);
  if (!start || !end) return 0;
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function getStayDates(quotation: any): { checkIn: string; checkOut: string; nights: number } {
  let checkIn = quotation.check_in || quotation.start_date;
  let checkOut = quotation.check_out || quotation.end_date;

  if (Array.isArray(quotation.items) && quotation.items.length > 0) {
    const dates = quotation.items.map((i: any) => i.start_date).filter(Boolean);
    const endDates = quotation.items.map((i: any) => i.end_date).filter(Boolean);
    if (dates.length > 0) {
      checkIn = dates.reduce((min: string, d: string) => d < min ? d : min, dates[0]);
    }
    if (endDates.length > 0) {
      checkOut = endDates.reduce((max: string, d: string) => d > max ? d : max, endDates[0]);
    }
  }

  const nights = calcNights(checkIn, checkOut);
  return { checkIn: checkIn || "", checkOut: checkOut || "", nights: nights || 1 };
}

export function resolveItemHotel(item: any, quotation: any) {
  return (
    item.price_details?.hotel ||
    item.price_details?.room?.hotel ||
    quotation.hotel ||
    null
  );
}

export function collectSuppliers(items: any[]): { id: number | string; name: string; phone?: string | null }[] {
  const map = new Map<string, { id: number | string; name: string; phone?: string | null }>();
  for (const item of items) {
    const pd = item.price_details;
    if (!pd?.supplier_id && pd?.is_direct) continue;
    const sid = pd?.supplier_id ?? pd?.supplier?.id;
    if (!sid) continue;
    const key = String(sid);
    if (map.has(key)) continue;
    map.set(key, {
      id: sid,
      name: pd.supplier?.name || pd.supplier?.name_ar || pd.supplier?.name_en || `#${sid}`,
      phone: pd.supplier?.phone ?? pd.supplier?.mobile ?? null,
    });
  }
  return [...map.values()];
}

export type MappedPrintItem = {
  hotel: any;
  room_type: any;
  meal_plan: string;
  occupancy_type: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  selling_price: number | null;
  taxes: number;
  fees: number;
  total_selling: number;
  cancellation_policy?: string | null;
  supplier_name?: string | null;
};

export function mapQuotationItemsForPrint(
  quotation: any,
  items: any[],
  printLang: DocLang,
  mealLabel: (type: string) => string,
  hotels?: any[],
): MappedPrintItem[] {
  const rtl = DOC_LANGS[printLang].dir === "rtl";

  return items.map((item) => {
    const pd = item.price_details ?? {};
    const taxRate = Number(pd.tax_rate ?? 0);
    const subtotal = Number(item.subtotal ?? 0);
    const estimatedTax = pd.tax_type?.includes("tax") && taxRate > 0
      ? subtotal - subtotal / (1 + taxRate / 100)
      : 0;

    let hotel = resolveItemHotel(item, quotation);
    if (!hotel && hotels) {
      const hid = item.hotel_id || pd.hotel_id;
      hotel = hotels.find((h: any) => String(h.id) === String(hid)) || null;
    }

    const checkIn = item.start_date || quotation.check_in || quotation.start_date;
    const checkOut = item.end_date || quotation.check_out || quotation.end_date;
    const nights = calcNights(checkIn, checkOut) || 1;

    let mealPlanStr = "";
    if (Array.isArray(pd.meal_plan_details) && pd.meal_plan_details.length > 0) {
      mealPlanStr = pd.meal_plan_details
        .map((m: any) => mealLabel(m.key || m) || m.label || m.key || String(m))
        .filter(Boolean)
        .join(" + ");
    } else {
      const mType = pd.meal_plan_type || "inclusive";
      if (mType === "exclusive") {
        mealPlanStr = rtl ? "بدون وجبات (إقامة فقط)" : "No Meals (Room Only)";
      } else {
        mealPlanStr = mealLabel(mType);
      }
    }

    return {
      hotel,
      room_type: pd.room,
      meal_plan: mealPlanStr,
      occupancy_type: pd.price_type || "standard",
      check_in: checkIn,
      check_out: checkOut,
      nights,
      rooms: Number(item.room_count ?? 1),
      selling_price: item.night_price != null ? Number(item.night_price) : null,
      taxes: estimatedTax,
      fees: 0,
      total_selling: subtotal,
      cancellation_policy: pd.cancellation_policy ?? null,
      supplier_name: pd.is_direct
        ? (rtl ? "مباشر" : "Direct")
        : localizedName(pd.supplier, rtl),
    };
  });
}
