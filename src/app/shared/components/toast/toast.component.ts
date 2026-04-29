import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tc-toast',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-message" [ngClass]="toast.type">
          {{ toast.message }}
          <button class="close-btn" (click)="toastService.remove(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: var(--space-5);
      right: var(--space-5);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      pointer-events: none;
    }
    .toast-message {
      pointer-events: auto;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      color: white;
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      box-shadow: var(--shadow-md);
      animation: slideIn var(--motion-normal);
    }
    .success { background-color: var(--color-success-500); }
    .error { background-color: var(--color-danger-500); }
    .info { background-color: var(--color-primary-500); }
    
    .close-btn {
      background: none;
      border: none;
      color: currentColor;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
    }
    .close-btn:hover { opacity: 1; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  toastService = inject(ToastService);
}
