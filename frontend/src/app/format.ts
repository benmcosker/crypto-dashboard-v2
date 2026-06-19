export function formatCurrency(value: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  const digits = value < 1 ? 6 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}
