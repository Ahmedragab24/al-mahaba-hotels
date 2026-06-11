function formatMoney(value, currency = "SAR", lang = "en") {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(Number(value));
  } catch {
    return `${value} ${currency}`;
  }
}
function formatDate(value, lang = "en") {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(d);
}
function formatDateTime(value, lang = "en") {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}
export {
  formatDate as a,
  formatMoney as b,
  formatDateTime as f
};
