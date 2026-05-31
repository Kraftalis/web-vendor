export type Preset =
  | "this-month"
  | "last-month"
  | "3-months"
  | "6-months"
  | "year"
  | "custom";

export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);

export const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);

export const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

export const presetRange = (
  preset: Preset,
): { startDate: string; endDate: string } => {
  const now = new Date();
  switch (preset) {
    case "this-month":
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case "last-month": {
      const lm = monthsAgo(1);
      return { startDate: startOfMonth(lm), endDate: endOfMonth(lm) };
    }
    case "3-months":
      return {
        startDate: startOfMonth(monthsAgo(2)),
        endDate: endOfMonth(now),
      };
    case "6-months":
      return {
        startDate: startOfMonth(monthsAgo(5)),
        endDate: endOfMonth(now),
      };
    case "year":
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: endOfMonth(now),
      };
    default:
      return { startDate: "", endDate: "" };
  }
};

export const fmtCurrency = (val: number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export const fmtMonth = (yyyyMM: string) => {
  const [y, m] = yyyyMM.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
};
