import { Component, OnInit, inject, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TrendingItem } from '../models';
import { CryptoApi } from '../services/crypto-api';
import { WidgetCard } from './widget-card';
import { PercentChange } from './percent-change';

// Metric 4: trending coins — a live snapshot (period-independent).
@Component({
  selector: 'app-trending',
  imports: [WidgetCard, PercentChange, MatIconModule],
  template: `
    <app-widget-card
      title="Trending"
      subtitle="Most searched right now"
      [loading]="loading()"
      [error]="error()"
      [refetching]="refetching()"
      (retry)="load()">
      <mat-icon card-action style="color: var(--mat-sys-tertiary, #f9a825)">whatshot</mat-icon>
      <ol class="list">
        @for (t of items(); track t.item.id; let i = $index) {
          <li (click)="selectCoin.emit(t.item.id)">
            <span class="rank">{{ i + 1 }}</span>
            <img [src]="t.item.thumb" [alt]="t.item.name" width="26" height="26" />
            <span class="nm">{{ t.item.name }} <span class="sym">{{ t.item.symbol.toUpperCase() }}</span></span>
            <app-percent-change [value]="t.item.data?.price_change_percentage_24h?.usd" />
          </li>
        }
      </ol>
    </app-widget-card>
  `,
  styles: `
    .list { list-style: none; margin: 0; padding: 0; }
    li { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-radius: 6px; cursor: pointer; }
    li:hover { background: #f4f7fc; }
    .rank { width: 18px; text-align: center; font-weight: 700; color: #5a6b7b; }
    img { border-radius: 50%; }
    .nm { flex: 1; font-weight: 600; font-size: 0.9rem; }
    .sym { font-size: 0.7rem; color: #5a6b7b; font-weight: 500; }
  `,
})
export class Trending implements OnInit {
  private readonly api = inject(CryptoApi);

  readonly selectCoin = output<string>();

  protected readonly items = signal<TrendingItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<unknown>(null);
  protected readonly refetching = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.refetching.set(this.items().length > 0);
    this.loading.set(this.items().length === 0);
    this.error.set(null);
    this.api.trending().subscribe({
      next: (d) => {
        this.items.set(d.coins.slice(0, 7));
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
