import { Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Period } from './models';
import { PeriodFilter } from './components/period-filter';
import { MarketOverview } from './components/market-overview';
import { LivePrices } from './components/live-prices';
import { PriceChart } from './components/price-chart';
import { Trending } from './components/trending';
import { ExchangeVolume } from './components/exchange-volume';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatIconModule,
    PeriodFilter,
    MarketOverview,
    LivePrices,
    PriceChart,
    Trending,
    ExchangeVolume,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly period = signal<Period>('week');
  protected readonly selectedCoin = signal<string>('bitcoin');
}
