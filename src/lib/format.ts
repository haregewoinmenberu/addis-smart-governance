export function formatCurrency(value: number, currency = "ETB") {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value?: string | number | Date | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
