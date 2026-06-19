import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Exchange } from '../models';
import { CryptoApi } from '../services/crypto-api';
import { formatCompact } from '../format';
import { WidgetCard } from './widget-card';

// Metric 5: exchange volume (24h BTC) — a live snapshot (period-independent).
@Component({
  selector: 'app-exchange-volume',
  imports: [WidgetCard, MatProgressBarModule],
  template: `
    <app-widget-card
      title="Exchange Volume"
      subtitle="24h trade volume (BTC)"
      [loading]="loading()"
      [error]="error()"
      [refetching]="refetching()"
      (retry)="load()">
      <div class="list">
        @for (ex of exchanges(); track ex.id) {
          <div class="row">
            <div class="top">
              <img [src]="ex.image" [alt]="ex.name" width="22" height="22" />
              <span class="nm">{{ ex.name }}</span>
              <span class="vol">₿{{ compact(ex.trade_volume_24h_btc) }}</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="pct(ex)" />
          </div>
        }
      </div>
    </app-widget-card>
  `,
  styles: `
    .list { display: flex; flex-direction: column; gap: 12px; }
    .top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .top img { border-radius: 50%; }
    .nm { flex: 1; font-weight: 600; font-size: 0.9rem; }
    .vol { color: #5a6b7b; font-size: 0.85rem; }
  `,
})
export class ExchangeVolume implements OnInit {
  private readonly api = inject(CryptoApi);

  protected readonly exchanges = signal<Exchange[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<unknown>(null);
  protected readonly refetching = signal(false);

  protected readonly compact = formatCompact;
  private readonly max = computed(() =>
    this.exchanges().reduce((m, e) => Math.max(m, e.trade_volume_24h_btc), 0) || 1,
  );

  protected pct(ex: Exchange): number {
    return (ex.trade_volume_24h_btc / this.max()) * 100;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.refetching.set(this.exchanges().length > 0);
    this.loading.set(this.exchanges().length === 0);
    this.error.set(null);
    this.api.exchanges().subscribe({
      next: (d) => {
        this.exchanges.set(d.slice(0, 8));
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
