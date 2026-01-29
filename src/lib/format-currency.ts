import { Locale } from "./locale";

export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
}

export function formatNumber(amount: number, locale?: Locale): string {
  return amount.toLocaleString(locale || 'en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
