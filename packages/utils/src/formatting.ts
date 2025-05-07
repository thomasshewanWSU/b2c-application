// @repo/utils/src/formatting.ts
// Format currency
export function formatPrice(
  price: number,
  locale = "en-AU",
  currency = "AUD",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
}

// Format date
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
