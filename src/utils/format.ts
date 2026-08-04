import { CURRENCY, INSTALLMENTS } from "@/constants";

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(value);

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat(CURRENCY.locale).format(value);

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(CURRENCY.locale, { dateStyle: "medium" }).format(new Date(iso));

export const formatPercent = (value: number): string => `${Math.round(value)}%`;

export const discountPercent = (price: number, compareAtPrice?: number | null): number =>
  compareAtPrice && compareAtPrice > price
    ? ((compareAtPrice - price) / compareAtPrice) * 100
    : 0;

export interface Installment {
  count: number;
  value: number;
  interestFree: boolean;
}

export const bestInstallment = (total: number): Installment => {
  const count = Math.max(
    1,
    Math.min(INSTALLMENTS.max, Math.floor(total / INSTALLMENTS.minValue)),
  );
  return { count, value: total / count, interestFree: INSTALLMENTS.interestFree };
};

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
