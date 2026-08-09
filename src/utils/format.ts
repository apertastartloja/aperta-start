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

export const formatTimeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours} h`;
  if (diffDays < 30) return `há ${diffDays} d`;
  return formatDate(iso);
};

export const isValidCPF = (cpf: string): boolean => {
  const clean = (cpf || "").replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
};
