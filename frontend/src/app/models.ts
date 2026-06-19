export type Period = 'today' | 'week' | 'month' | 'quarter';

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
  { value: 'quarter', label: 'Last quarter' },
];

// Which CoinGecko change window backs each period in the prices table.
// Quarter has no native 90d field, so it falls back to 30d.
export type ChangeField =
  | 'price_change_percentage_24h_in_currency'
  | 'price_change_percentage_7d_in_currency'
  | 'price_change_percentage_30d_in_currency';

export const PERIOD_CHANGE_FIELD: Record<Period, ChangeField> = {
  today: 'price_change_percentage_24h_in_currency',
  week: 'price_change_percentage_7d_in_currency',
  month: 'price_change_percentage_30d_in_currency',
  quarter: 'price_change_percentage_30d_in_currency',
};

export const PERIOD_CHANGE_LABEL: Record<Period, string> = {
  today: '24h',
  week: '7d',
  month: '30d',
  quarter: '30d',
};

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

export interface GlobalData {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface MarketChart {
  prices: [number, number][];
}

export interface TrendingItem {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    data?: { price_change_percentage_24h?: { usd?: number } };
  };
}

export interface TrendingResponse {
  coins: TrendingItem[];
}

export interface Exchange {
  id: string;
  name: string;
  image: string;
  trade_volume_24h_btc: number;
}
