import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  template: `
    @if (points()) {
      <svg [attr.width]="width()" [attr.height]="height()"
           [attr.viewBox]="'0 0 ' + width() + ' ' + height()" preserveAspectRatio="none">
        <polyline [attr.points]="points()" fill="none"
                  [attr.stroke]="up() ? 'var(--color-up)' : 'var(--color-down)'"
                  stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
    }
  `,
  styles: `:host { display: inline-block; line-height: 0; }`,
})
export class Sparkline {
  readonly data = input<number[]>([]);
  readonly width = input(96);
  readonly height = input(28);

  protected readonly up = computed(() => {
    const d = this.data();
    return d.length < 2 || d[d.length - 1] >= d[0];
  });

  protected readonly points = computed<string | null>(() => {
    const d = this.data();
    if (d.length < 2) return null;
    const w = this.width();
    const h = this.height();
    const pad = 2;
    const min = Math.min(...d);
    const max = Math.max(...d);
    const range = max - min || 1;
    return d
      .map((v, i) => {
        const x = (i / (d.length - 1)) * w;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
