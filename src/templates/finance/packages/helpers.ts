import type { Package } from "./types";

export const formatCurrency = (amount: string | number, currency = "IDR") => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const getDisplayPrice = (
  pkg: Package,
): { label: string; isRange: boolean } => {
  if (pkg.items.length === 0) {
    return {
      label: formatCurrency(pkg.price, pkg.currency),
      isRange: false,
    };
  }
  const prices = pkg.items
    .map((v) => parseFloat(v.price))
    .filter((n) => !isNaN(n));
  if (prices.length === 0) return { label: "-", isRange: false };
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) {
    return {
      label: formatCurrency(min, pkg.currency),
      isRange: false,
    };
  }
  return {
    label: `${formatCurrency(min, pkg.currency)} – ${formatCurrency(max, pkg.currency)}`,
    isRange: true,
  };
};
