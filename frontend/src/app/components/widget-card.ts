import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiError } from '../services/api-error';

@Component({
  selector: 'app-widget-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="widget" appearance="outlined">
      <div class="head">
        <div>
          <h2>{{ title() }}</h2>
          @if (subtitle()) {
            <span class="sub">{{ subtitle() }}</span>
          }
        </div>
        <ng-content select="[card-action]" />
      </div>

      @if (loading()) {
        <div class="center"><mat-progress-spinner mode="indeterminate" diameter="28" /></div>
      } @else if (error()) {
        <div class="error" role="alert" [class.warn]="isRateLimited()">
          <div class="msg">
            <strong>{{ errorTitle() }}</strong>
            <div>{{ errorMessage() }}</div>
          </div>
          <button matButton (click)="retry.emit()" [disabled]="refetching()">
            <mat-icon>refresh</mat-icon>{{ refetching() ? 'Retrying…' : 'Retry' }}
          </button>
        </div>
      } @else {
        <ng-content />
      }
    </mat-card>
  `,
  styles: `
    .widget { height: 100%; }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
    h2 { font-size: 1.15rem; font-weight: 700; margin: 0; }
    .sub { font-size: 0.75rem; color: #5a6b7b; }
    .center { display: flex; justify-content: center; padding: 28px 0; }
    .error { display: flex; align-items: center; justify-content: space-between; gap: 12px;
             background: #fdecea; color: #611a15; border-radius: 8px; padding: 12px 14px; }
    .error.warn { background: #fff4e5; color: #663c00; }
    .error .msg strong { display: block; }
    .error .msg div { font-size: 0.85rem; }
  `,
})
export class WidgetCard {
  readonly title = input('');
  readonly subtitle = input<string | undefined>(undefined);
  readonly loading = input(false);
  readonly error = input<unknown>(null);
  readonly refetching = input(false);
  readonly retry = output<void>();

  protected readonly isRateLimited = computed(
    () => this.error() instanceof ApiError && (this.error() as ApiError).isRateLimited,
  );
  protected readonly errorTitle = computed(() => {
    const e = this.error();
    if (e instanceof ApiError) {
      if (e.isRateLimited) return 'Rate limited';
      if (e.isNetwork) return "Can't reach the server";
    }
    return "Couldn't load data";
  });
  protected readonly errorMessage = computed(() => {
    const e = this.error();
    return e instanceof Error ? e.message : 'Something went wrong.';
  });
}
