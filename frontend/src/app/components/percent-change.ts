import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-percent-change',
  imports: [MatIconModule],
  template: `
    @if (missing()) {
      <span class="muted">—</span>
    } @else {
      <span class="pc" [class.up]="positive()" [class.down]="!positive()">
        <mat-icon class="ic">{{ positive() ? 'arrow_drop_up' : 'arrow_drop_down' }}</mat-icon>
        {{ text() }}
      </span>
    }
  `,
  styles: `
    .pc { display: inline-flex; align-items: center; font-weight: 600; }
    .up { color: var(--color-up); }
    .down { color: var(--color-down); }
    .muted { color: #90a4ae; }
    .ic { font-size: 18px; height: 18px; width: 18px; }
  `,
})
export class PercentChange {
  readonly value = input<number | undefined>(undefined);

  protected readonly missing = computed(() => {
    const v = this.value();
    return v == null || Number.isNaN(v);
  });
  protected readonly positive = computed(() => (this.value() ?? 0) >= 0);
  protected readonly text = computed(() => {
    const v = this.value() ?? 0;
    return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  });
}
