// =====================================================================
// Document output language resources — BRD multilingual requirement.
// Output languages for Quotations, Hotel Information and WhatsApp:
// Arabic (RTL), English (LTR), Indonesian (LTR), Urdu (RTL).
// These are proper translation entities (not machine placeholders).
// =====================================================================

export type DocLang = "ar" | "en" | "id" | "ur";

export const DOC_LANGS: Record<DocLang, { label: string; native: string; dir: "rtl" | "ltr"; locale: string }> = {
  ar: { label: "Arabic", native: "العربية", dir: "rtl", locale: "ar-SA-u-nu-latn" },
  en: { label: "English", native: "English", dir: "ltr", locale: "en-GB" },
  id: { label: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", locale: "id-ID" },
  ur: { label: "Urdu", native: "اردو", dir: "rtl", locale: "ur-PK-u-nu-latn" },
};

export const DOC_LANG_LIST: DocLang[] = ["ar", "en", "id", "ur"];

/** Normalize a customer's preferred_language value to a supported output language. */
export function toDocLang(v?: string | null): DocLang {
  const s = (v ?? "").toLowerCase();
  if (s.startsWith("ar")) return "ar";
  if (s.startsWith("id") || s.startsWith("in")) return "id";
  if (s.startsWith("ur")) return "ur";
  return s.startsWith("en") ? "en" : "ar";
}

// ---------------------------------------------------------------------
// Quotation document resources (cover, hotel info, room info, meal plans,
// pricing, terms & conditions, final summary, recommended badge)
// ---------------------------------------------------------------------
export type QuoteRes = Record<string, string>;

export const QUOTE_RES: Record<DocLang, QuoteRes> = {
  ar: {
    title: "عرض سعر",
    company: "دليل المعالم",
    quotation_no: "رقم العرض",
    date: "تاريخ العرض",
    valid_until: "صالح حتى",
    travel_date: "تاريخ السفر",
    generated: "تاريخ الإصدار",
    to: "مقدم إلى",
    customer: "العميل",
    cover: "الغلاف",
    hotel_info: "معلومات الفندق",
    room_info: "معلومات الغرف",
    meal_plans: "خطط الوجبات",
    pricing: "التسعير",
    summary: "الملخص النهائي",
    recommended: "الفندق الموصى به",
    hotel: "الفندق",
    room: "نوع الغرفة",
    meal: "خطة الوجبات",
    occupancy: "الإشغال",
    check_in: "الدخول",
    check_out: "الخروج",
    nights: "الليالي",
    rooms: "الغرف",
    unit: "السعر/ليلة",
    taxes: "الضرائب",
    fees: "الرسوم",
    line_total: "الإجمالي",
    breakdown: "تفاصيل التسعير",
    rooms_total: "إجمالي الإقامة",
    total_taxes: "إجمالي الضرائب",
    total_fees: "إجمالي الرسوم",
    grand_total: "الإجمالي النهائي",
    notes: "ملاحظات",
    terms: "الشروط والأحكام",
    terms_text:
      "هذا العرض صالح حتى التاريخ المذكور أعلاه. الأسعار قابلة للتغيير حسب التوفر عند تأكيد الحجز. يخضع الحجز لسياسات الإلغاء الخاصة بكل فندق. لا يعتبر هذا العرض تأكيدًا للحجز.",
    footer: "شكرًا لتعاملكم معنا.",
    status: "الحالة",
    print: "طباعة / حفظ PDF",
  },
  en: {
    title: "Quotation",
    company: "Dalil Al-Maalem",
    quotation_no: "Quotation No.",
    date: "Quotation Date",
    valid_until: "Valid Until",
    travel_date: "Travel Date",
    generated: "Generated",
    to: "Presented To",
    customer: "Customer",
    cover: "Cover",
    hotel_info: "Hotel Information",
    room_info: "Room Information",
    meal_plans: "Meal Plans",
    pricing: "Pricing",
    summary: "Final Summary",
    recommended: "Recommended Hotel",
    hotel: "Hotel",
    room: "Room Type",
    meal: "Meal Plan",
    occupancy: "Occupancy",
    check_in: "Check-in",
    check_out: "Check-out",
    nights: "Nights",
    rooms: "Rooms",
    unit: "Rate/Night",
    taxes: "Taxes",
    fees: "Fees",
    line_total: "Total",
    breakdown: "Pricing Breakdown",
    rooms_total: "Accommodation Total",
    total_taxes: "Total Taxes",
    total_fees: "Total Fees",
    grand_total: "Grand Total",
    notes: "Notes",
    terms: "Terms & Conditions",
    terms_text:
      "This quotation is valid until the date stated above. Prices are subject to availability at the time of booking confirmation. Bookings are subject to each hotel's cancellation policy. This quotation does not constitute a confirmed reservation.",
    footer: "Thank you for your business.",
    status: "Status",
    print: "Print / Save PDF",
  },
  id: {
    title: "Penawaran Harga",
    company: "Dalil Al-Maalem",
    quotation_no: "No. Penawaran",
    date: "Tanggal Penawaran",
    valid_until: "Berlaku Hingga",
    travel_date: "Tanggal Perjalanan",
    generated: "Diterbitkan",
    to: "Ditujukan Kepada",
    customer: "Pelanggan",
    cover: "Sampul",
    hotel_info: "Informasi Hotel",
    room_info: "Informasi Kamar",
    meal_plans: "Paket Makan",
    pricing: "Harga",
    summary: "Ringkasan Akhir",
    recommended: "Hotel yang Direkomendasikan",
    hotel: "Hotel",
    room: "Tipe Kamar",
    meal: "Paket Makan",
    occupancy: "Okupansi",
    check_in: "Check-in",
    check_out: "Check-out",
    nights: "Malam",
    rooms: "Kamar",
    unit: "Tarif/Malam",
    taxes: "Pajak",
    fees: "Biaya",
    line_total: "Total",
    breakdown: "Rincian Harga",
    rooms_total: "Total Akomodasi",
    total_taxes: "Total Pajak",
    total_fees: "Total Biaya",
    grand_total: "Total Keseluruhan",
    notes: "Catatan",
    terms: "Syarat & Ketentuan",
    terms_text:
      "Penawaran ini berlaku hingga tanggal yang tercantum di atas. Harga dapat berubah sesuai ketersediaan pada saat konfirmasi pemesanan. Pemesanan tunduk pada kebijakan pembatalan masing-masing hotel. Penawaran ini bukan merupakan konfirmasi pemesanan.",
    footer: "Terima kasih atas kepercayaan Anda.",
    status: "Status",
    print: "Cetak / Simpan PDF",
  },
  ur: {
    title: "کوٹیشن",
    company: "دلیل المعالم",
    quotation_no: "کوٹیشن نمبر",
    date: "کوٹیشن کی تاریخ",
    valid_until: "آخری تاریخ",
    travel_date: "سفر کی تاریخ",
    generated: "تاریخِ اجراء",
    to: "بنام",
    customer: "گاہک",
    cover: "سرورق",
    hotel_info: "ہوٹل کی معلومات",
    room_info: "کمروں کی معلومات",
    meal_plans: "کھانے کے پلان",
    pricing: "قیمتیں",
    summary: "حتمی خلاصہ",
    recommended: "تجویز کردہ ہوٹل",
    hotel: "ہوٹل",
    room: "کمرے کی قسم",
    meal: "کھانے کا پلان",
    occupancy: "گنجائش",
    check_in: "چیک اِن",
    check_out: "چیک آؤٹ",
    nights: "راتیں",
    rooms: "کمرے",
    unit: "فی رات قیمت",
    taxes: "ٹیکس",
    fees: "فیس",
    line_total: "کل",
    breakdown: "قیمتوں کی تفصیل",
    rooms_total: "قیام کا کل",
    total_taxes: "کل ٹیکس",
    total_fees: "کل فیس",
    grand_total: "مجموعی کل",
    notes: "نوٹس",
    terms: "شرائط و ضوابط",
    terms_text:
      "یہ کوٹیشن اوپر دی گئی تاریخ تک کارآمد ہے۔ قیمتیں بکنگ کی تصدیق کے وقت دستیابی سے مشروط ہیں۔ بکنگ ہر ہوٹل کی منسوخی کی پالیسی سے مشروط ہے۔ یہ کوٹیشن تصدیق شدہ بکنگ نہیں ہے۔",
    footer: "آپ کے اعتماد کا شکریہ۔",
    status: "حیثیت",
    print: "پرنٹ / PDF محفوظ کریں",
  },
};

export const OCC_RES: Record<DocLang, Record<string, string>> = {
  ar: { SGL: "مفرد", DBL: "مزدوج", TPL: "ثلاثي", QUAD: "رباعي", CHD: "طفل", INF: "رضيع" },
  en: { SGL: "Single", DBL: "Double", TPL: "Triple", QUAD: "Quad", CHD: "Child", INF: "Infant" },
  id: { SGL: "Single", DBL: "Double", TPL: "Triple", QUAD: "Quad", CHD: "Anak", INF: "Bayi" },
  ur: { SGL: "سنگل", DBL: "ڈبل", TPL: "ٹرپل", QUAD: "کواڈ", CHD: "بچہ", INF: "شیر خوار" },
};

// ---------------------------------------------------------------------
// Hotel information document resources
// ---------------------------------------------------------------------
export const HOTEL_RES: Record<DocLang, Record<string, string>> = {
  ar: {
    title: "معلومات الفندق", code: "رمز الفندق", rating: "التصنيف", country: "الدولة", city: "المدينة",
    district: "الحي", address: "العنوان", phone: "الهاتف", email: "البريد الإلكتروني", website: "الموقع الإلكتروني",
    maps: "موقع الخريطة", near_haram: "قريب من الحرم", distance: "المسافة من الحرم (متر)",
    description: "الوصف", facilities: "المرافق", room_types: "أنواع الغرف", meal_plans: "خطط الوجبات",
    check_in_time: "وقت الدخول", check_out_time: "وقت الخروج", yes: "نعم", no: "لا",
    recommended: "الفندق الموصى به", generated: "تاريخ الإصدار", footer: "شكرًا لتعاملكم معنا.",
    company: "دليل المعالم", print: "طباعة / حفظ PDF",
    views: "الإطلالات", contacts: "جهات الاتصال", name: "الاسم", board: "نظام الوجبات",
    max_adults: "أقصى عدد للبالغين", max_children: "أقصى عدد للأطفال", images: "الصور", bed_type: "نوع السرير",
    job_title: "المسمى الوظيفي", brand: "العلامة التجارية", policies: "السياسات",
  },
  en: {
    title: "Hotel Information", code: "Hotel Code", rating: "Rating", country: "Country", city: "City",
    district: "District", address: "Address", phone: "Phone", email: "Email", website: "Website",
    maps: "Map Location", near_haram: "Near Haram", distance: "Distance from Haram (m)",
    description: "Description", facilities: "Facilities", room_types: "Room Types", meal_plans: "Meal Plans",
    check_in_time: "Check-in Time", check_out_time: "Check-out Time", yes: "Yes", no: "No",
    recommended: "Recommended Hotel", generated: "Generated", footer: "Thank you for your business.",
    company: "Dalil Al-Maalem", print: "Print / Save PDF",
    views: "Views", contacts: "Contacts", name: "Name", board: "Board",
    max_adults: "Max Adults", max_children: "Max Children", images: "Images", bed_type: "Bed Type",
    job_title: "Job Title", brand: "Brand", policies: "Policies",
  },
  id: {
    title: "Informasi Hotel", code: "Kode Hotel", rating: "Peringkat", country: "Negara", city: "Kota",
    district: "Distrik", address: "Alamat", phone: "Telepon", email: "Email", website: "Situs Web",
    maps: "Lokasi Peta", near_haram: "Dekat Haram", distance: "Jarak dari Haram (m)",
    description: "Deskripsi", facilities: "Fasilitas", room_types: "Tipe Kamar", meal_plans: "Paket Makan",
    check_in_time: "Waktu Check-in", check_out_time: "Waktu Check-out", yes: "Ya", no: "Tidak",
    recommended: "Hotel yang Direkomendasikan", generated: "Diterbitkan", footer: "Terima kasih atas kepercayaan Anda.",
    company: "Dalil Al-Maalem", print: "Cetak / Simpan PDF",
    views: "Pemandangan", contacts: "Kontak", name: "Nama", board: "Paket",
    max_adults: "Maks. Dewasa", max_children: "Maks. Anak", images: "Gambar", bed_type: "Tipe Tempat Tidur",
    job_title: "Jabatan", brand: "Merek", policies: "Kebijakan",
  },
  ur: {
    title: "ہوٹل کی معلومات", code: "ہوٹل کوڈ", rating: "درجہ بندی", country: "ملک", city: "شہر",
    district: "علاقہ", address: "پتہ", phone: "فون", email: "ای میل", website: "ویب سائٹ",
    maps: "نقشے پر مقام", near_haram: "حرم کے قریب", distance: "حرم سے فاصلہ (میٹر)",
    description: "تفصیل", facilities: "سہولیات", room_types: "کمروں کی اقسام", meal_plans: "کھانے کے پلان",
    check_in_time: "چیک اِن کا وقت", check_out_time: "چیک آؤٹ کا وقت", yes: "ہاں", no: "نہیں",
    recommended: "تجویز کردہ ہوٹل", generated: "تاریخِ اجراء", footer: "آپ کے اعتماد کا شکریہ۔",
    company: "دلیل المعالم", print: "پرنٹ / PDF محفوظ کریں",
    views: "مناظر", contacts: "رابطے", name: "نام", board: "بورڈ",
    max_adults: "زیادہ سے زیادہ بالغ", max_children: "زیادہ سے زیادہ بچے", images: "تصاویر", bed_type: "بستر کی قسم",
    job_title: "عہدہ", brand: "برانڈ", policies: "پالیسیاں",
  },
};

// ---------------------------------------------------------------------
// Approved WhatsApp templates (per kind, per language)
// ---------------------------------------------------------------------
export type WaKind = "quotation" | "hotel_info";

export const WA_TEMPLATES: Record<WaKind, Partial<Record<DocLang, { name: string; body: string }>>> = {
  quotation: {
    ar: {
      name: "quotation_summary_v1",
      body: "السلام عليكم {{customer}}،\nيسعدنا تقديم عرض السعر رقم {{quotation_no}}:\n{{hotels}}\nالإجمالي: {{total}} {{currency}}\nالعرض صالح حتى {{valid_until}}.\nمع تحيات {{company}}",
    },
    en: {
      name: "quotation_summary_v1",
      body: "Dear {{customer}},\nWe are pleased to share quotation {{quotation_no}}:\n{{hotels}}\nTotal: {{total}} {{currency}}\nValid until {{valid_until}}.\nBest regards, {{company}}",
    },
    id: {
      name: "quotation_summary_v1",
      body: "Yth. {{customer}},\nDengan senang hati kami sampaikan penawaran {{quotation_no}}:\n{{hotels}}\nTotal: {{total}} {{currency}}\nBerlaku hingga {{valid_until}}.\nHormat kami, {{company}}",
    },
    ur: {
      name: "quotation_summary_v1",
      body: "محترم {{customer}}،\nہمیں کوٹیشن نمبر {{quotation_no}} پیش کرتے ہوئے خوشی ہے:\n{{hotels}}\nکل: {{total}} {{currency}}\nیہ پیشکش {{valid_until}} تک کارآمد ہے۔\nنیک تمنائیں، {{company}}",
    },
  },
  hotel_info: {
    ar: {
      name: "hotel_info_v1",
      body: "معلومات الفندق: {{hotel}}\nالمدينة: {{city}}\nالتصنيف: {{rating}}\n{{near_haram}}\nللاستفسار والحجز: {{company}}",
    },
    en: {
      name: "hotel_info_v1",
      body: "Hotel information: {{hotel}}\nCity: {{city}}\nRating: {{rating}}\n{{near_haram}}\nFor inquiries and booking: {{company}}",
    },
    id: {
      name: "hotel_info_v1",
      body: "Informasi hotel: {{hotel}}\nKota: {{city}}\nPeringkat: {{rating}}\n{{near_haram}}\nUntuk pertanyaan dan pemesanan: {{company}}",
    },
    ur: {
      name: "hotel_info_v1",
      body: "ہوٹل کی معلومات: {{hotel}}\nشہر: {{city}}\nدرجہ بندی: {{rating}}\n{{near_haram}}\nمعلومات اور بکنگ کے لیے: {{company}}",
    },
  },
};

/** BR-WA-001: a template must exist for the selected language before sending. */
export function waTemplateExists(kind: WaKind, lang: DocLang): boolean {
  const t = WA_TEMPLATES[kind][lang];
  return !!t && t.body.trim().length > 0;
}

/** Render an approved template with variables. Returns null if no template exists. */
export function renderWaTemplate(
  kind: WaKind,
  lang: DocLang,
  vars: Record<string, string>,
): { name: string; body: string } | null {
  const tpl = WA_TEMPLATES[kind][lang];
  if (!tpl || !tpl.body.trim()) return null;
  const body = tpl.body.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "—");
  return { name: tpl.name, body };
}

/** BR-QUO: PDF generation cannot proceed if mandatory translations are missing. */
export function missingDocKeys(lang: DocLang, kind: "quotation" | "hotel"): string[] {
  const res = kind === "quotation" ? QUOTE_RES[lang] : HOTEL_RES[lang];
  const reference = kind === "quotation" ? QUOTE_RES.en : HOTEL_RES.en;
  if (!res) return Object.keys(reference);
  return Object.keys(reference).filter((k) => !res[k] || !res[k].trim());
}