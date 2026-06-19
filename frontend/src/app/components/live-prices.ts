import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import {
  Coin,
  PERIOD_CHANGE_FIELD,
  PERIOD_CHANGE_LABEL,
  Period,
} from '../models';
import { CryptoApi } from '../services/crypto-api';
import { formatCurrency } from '../format';
import { WidgetCard } from './widget-card';
import { PercentChange } from './percent-change';
import { Sparkline } from './sparkline';

// Metric 1: live price + change + 7-day sparkline. Rows select the chart coin.
@Component({
  selector: 'app-live-prices',
  imports: [WidgetCard, PercentChange, Sparkline],
  template: `
    <app-widget-card
      title="Live Prices"
      [subtitle]="subtitle()"
      [loading]="loading()"
      [error]="error()"
      [refetching]="refetching()"
      (retry)="load()">
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th class="r">Price</th>
              <th class="r">{{ label() }} %</th>
              <th class="r">7d</th>
            </tr>
          </thead>
          <tbody>
            @for (coin of data() ?? []; track coin.id) {
              <tr [class.sel]="coin.id === selectedCoin()" (click)="selectCoin.emit(coin.id)">
                <td>
                  <div class="coin">
                    <img [src]="coin.image" [alt]="coin.name" width="22" height="22" />
                    <div>
                      <div class="nm">{{ coin.name }}</div>
                      <div class="sym">{{ coin.symbol.toUpperCase() }}</div>
                    </div>
                  </div>
                </td>
                <td class="r">{{ currency(coin.current_price) }}</td>
                <td class="r"><app-percent-change [value]="change(coin)" /></td>
                <td class="r"><app-sparkline [data]="coin.sparkline_in_7d?.price ?? []" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-widget-card>
  `,
  styles: `
    .scroll { max-height: 420px; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    th { position: sticky; top: 0; background: #fff; text-align: left; color: #5a6b7b;
         font-weight: 600; padding: 8px; border-bottom: 1px solid #e3e8ef; }
    td { padding: 8px; border-bottom: 1px solid #f0f3f7; }
    .r { text-align: right; }
    tr { cursor: pointer; }
    tbody tr:hover { background: #f4f7fc; }
    tr.sel { background: #e8f0fe; }
    .coin { display: flex; align-items: center; gap: 8px; }
    .coin img { border-radius: 50%; }
    .nm { font-weight: 600; line-height: 1.1; }
    .sym { font-size: 0.7rem; color: #5a6b7b; }
  `,
})
export class LivePrices implements OnInit {
  private readonly api = inject(CryptoApi);

  readonly period = input<Period>('week');
  readonly selectedCoin = input<string>('bitcoin');
  readonly selectCoin = output<string>();

  protected readonly data = signal<Coin[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<unknown>(null);
  protected readonly refetching = signal(false);

  protected readonly currency = formatCurrency;
  protected readonly label = computed(() => PERIOD_CHANGE_LABEL[this.period()]);
  protected readonly subtitle = computed(
    () => `Top coins · ${this.label()} change · click a row to chart it`,
  );

  protected change(coin: Coin): number | undefined {
    return coin[PERIOD_CHANGE_FIELD[this.period()]];
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.refetching.set(this.data() !== null);
    this.loading.set(this.data() === null);
    this.error.set(null);
    this.api.markets().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        this.refetching.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
        this.refetching.set(false);
      },
    });
  }
}
