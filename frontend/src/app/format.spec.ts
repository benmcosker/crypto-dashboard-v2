import { formatCompact, formatCurrency } from './format';

describe('format', () => {
  it('formats whole-dollar amounts with two decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('shows more precision for sub-dollar prices', () => {
    expect(formatCurrency(0.012345)).toBe('$0.012345');
  });

  it('abbreviates large numbers', () => {
    expect(formatCompact(2_500_000_000)).toBe('2.5B');
  });

  it('returns an em dash for NaN', () => {
    expect(formatCurrency(NaN)).toBe('—');
    expect(formatCompact(NaN)).toBe('—');
  });
});
