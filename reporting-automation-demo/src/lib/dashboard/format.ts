export function formatCurrency(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatPercentage(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("en-CA", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(value);
}

export function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}
