import { Component, input, output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PERIODS, Period } from '../models';

@Component({
  selector: 'app-period-filter',
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      [value]="value()"
      (change)="periodChange.emit($event.value)"
      hideSingleSelectionIndicator
      aria-label="Time period">
      @for (p of periods; track p.value) {
        <mat-button-toggle [value]="p.value">{{ p.label }}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
  styles: `
    mat-button-toggle-group { background: rgba(255, 255, 255, 0.14); border: none; }
  `,
})
export class PeriodFilter {
  readonly value = input<Period>('week');
  readonly periodChange = output<Period>();
  protected readonly periods = PERIODS;
}
