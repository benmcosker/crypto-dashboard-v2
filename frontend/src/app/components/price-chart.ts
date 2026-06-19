import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MarketChart, PERIODS, Period } from '../models';
import { CryptoApi } from '../services/crypto-api';
import { formatCurrency } from '../format';
import { WidgetCard } from './widget-card';

Chart.register(...registerables);

// Metric 3: price-history chart for the selected coin over the chosen period.
@Component({
  selector: 'app-price-chart',
  imports: [WidgetCard],
  template: `
    <app-widget-card
      title="Price History"
      [subtitle]="subtitle()"
      [loading]="loading()"
      [error]="error()"
      [refetching]="refetching()"
      (retry)="reload()">
      <div class="wrap" [style.display]="hasData() ? 'block' : 'none'">
        <canvas #canvas></canvas>
      </div>
      @if (!hasData()) {
        <div class="empty">No price data available.</div>
      }
    </app-widget-card>
  `,
  styles: `
    .wrap { position: relative; height: 300px; width: 100%; }
    .empty { padding: 32px 0; text-align: center; color: #5a6b7b; }
  `,
})
export class PriceChart implements AfterViewInit, OnDestroy {
  private readonly api = inject(CryptoApi);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly coinId = input<string>('bitcoin');
  readonly period = input<Period>('week');

  protected readonly data = signal<MarketChart | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<unknown>(null);
  protected readonly refetching = signal(false);

  protected readonly hasData = computed(() => (this.data()?.prices.length ?? 0) > 1);
  protected readonly subtitle = computed(() => {
    const label = PERIODS.find((p) => p.value === this.period())?.label ?? '';
    return `${this.coinId().toUpperCase()} · ${label}`;
  });

  private chart?: Chart;
  private ready = false;

  constructor() {
    // Refetch whenever the selected coin or period changes.
    effect(() => {
      const id = this.coinId();
      const period = this.period();
      this.fetch(id, period);
    });
    // Re-render the canvas whenever data arrives (once the view exists).
    effect(() => {
      this.data();
      if (this.ready) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  reload(): void {
    this.fetch(this.coinId(), this.period());
  }

  private fetch(id: string, period: Period): void {
    this.refetching.set(this.data() !== null);
    this.loading.set(this.data() === null);
    this.error.set(null);
    this.api.chart(id, period).subscribe({
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

  private render(): void {
    const el = this.canvas()?.nativeElement;
    const prices = this.data()?.prices ?? [];
    if (!el || prices.length < 2) {
      return;
    }
    const today = this.period() === 'today';
    const labels = prices.map(([t]) =>
      today
        ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    );
    const values = prices.map(([, v]) => v);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    this.chart = new Chart(el, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: '#1565c0',
            backgroundColor: 'rgba(21, 101, 192, 0.12)',
            fill: true,
            pointRadius: 0,
            tension: 0.25,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
          y: { ticks: { callback: (v) => formatCurrency(Number(v)) } },
        },
      },
    });
  }
}
