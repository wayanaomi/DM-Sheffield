const CURRENCY_LOCALE: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
};

/** Format an integer minor-unit amount (e.g. kobo, cents) as a currency string. */
export function formatPrice(priceMinor: number, currency: string): string {
  if (priceMinor === 0) return "Free";
  const locale = CURRENCY_LOCALE[currency] ?? "en-NG";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceMinor / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
}
