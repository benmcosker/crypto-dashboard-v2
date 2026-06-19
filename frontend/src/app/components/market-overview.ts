import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlobalData } from '../models';
import { CryptoApi } from '../services/crypto-api';
import { ApiError } from '../services/api-error';
import { formatCompact } from '../format';
import { PercentChange } from './percent-change';

// Metric 2: market cap & dominance — a live snapshot (period-independent).
@Component({
  selector: 'app-market-overview',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PercentChange],
  template: `
    @if (error()) {
      <div class="error" role="alert">
        <div>
          <strong>Couldn't load market overview</strong>
          <div>{{ errorMessage() }}</div>
        </div>
        <button matButton (click)="load()"><mat-icon>refresh</mat-icon>Retry</button>
      </div>
    } @else {
      <div class="row">
        @if (loading() || !data()) {
          @for (i of [1, 2, 3, 4]; track i) {
            <mat-card class="stat" appearance="outlined"><mat-progress-spinner mode="indeterminate" diameter="24" /></mat-card>
          }
        } @else {
          <mat-card class="stat" appearance="outlined">
            <span class="label">Total Market Cap</span>
            <span class="value">\${{ compact(cap()) }}</span>
            <app-percent-change [value]="capChange()" />
          </mat-card>
          <mat-card class="stat" appearance="outlined">
            <span class="label">24h Volume</span>
            <span class="value">\${{ compact(volume()) }}</span>
          </mat-card>
          <mat-card class="stat" appearance="outlined">
            <span class="label">BTC Dominance</span>
            <span class="value">{{ btc().toFixed(1) }}%</span>
          </mat-card>
          <mat-card class="stat" appearance="outlined">
            <span class="label">ETH Dominance</span>
            <span class="value">{{ eth().toFixed(1) }}%</span>
          </mat-card>
        }
      </div>
    }
  `,
  styles: `
    .row { display: flex; flex-wrap: wrap; gap: 16px; }
    .stat { flex: 1 1 180px; min-width: 160px; display: flex; flex-direction: column; gap: 4px;
            align-items: flex-start; justify-content: center; min-height: 92px; }
    .label { font-size: 0.8rem; font-weight: 600; color: #5a6b7b; }
    .value { font-size: 1.5rem; font-weight: 700; }
    .error { display: flex; align-items: center; justify-content: space-between; gap: 12px;
             background: #fdecea; color: #611a15; border-radius: 8px; padding: 12px 16px; }
  `,
})
export class MarketOverview implements OnInit {
  private readonly api = inject(CryptoApi);

  protected readonly data = signal<GlobalData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<unknown>(null);

  protected readonly compact = formatCompact;
  protected readonly cap = computed(() => this.data()?.data.total_market_cap['usd'] ?? 0);
  protected readonly volume = computed(() => this.data()?.data.total_volume['usd'] ?? 0);
  protected readonly capChange = computed(() => this.data()?.data.market_cap_change_percentage_24h_usd);
  protected readonly btc = computed(() => this.data()?.data.market_cap_percentage['btc'] ?? 0);
  protected readonly eth = computed(() => this.data()?.data.market_cap_percentage['eth'] ?? 0);
  protected readonly errorMessage = computed(() => {
    const e = this.error();
    return e instanceof ApiError || e instanceof Error ? e.message : 'Something went wrong.';
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.global().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }
}
