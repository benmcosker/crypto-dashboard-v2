import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Global toast host with short-window de-duplication so one outage doesn't
 *  stack identical messages. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private recent = new Map<string, number>();

  error(message: string): void {
    const now = Date.now();
    if (now - (this.recent.get(message) ?? 0) < 4000) {
      return;
    }
    this.recent.set(message, now);
    this.snackBar.open(message, 'Dismiss', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'app-error-snack',
    });
  }
}
