import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', durationMs = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    this._toasts.update(current => [...current, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  remove(id: string) {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }
}
