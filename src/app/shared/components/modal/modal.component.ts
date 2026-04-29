import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="tc-modal-backdrop"
        tabindex="-1"
        (click)="onBackdropClick($event)"
        (keydown)="onBackdropKeydown($event)"
      >
        <div class="tc-modal-dialog" role="dialog" aria-modal="true" [attr.aria-label]="title()">
          <div class="tc-modal-header">
            <h2 class="tc-modal-title">{{ title() }}</h2>
            <button class="tc-modal-close" (click)="close.emit()" aria-label="Fechar">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="tc-modal-content">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .tc-modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(17, 24, 39, 0.5);
      backdrop-filter: blur(4px);
      overscroll-behavior: contain;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }
    .tc-modal-dialog {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: modalFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tc-modal-header {
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tc-modal-title { margin: 0; font-family: var(--font-family-display); font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text-primary); }
    .tc-modal-close {
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      transition:
        background-color var(--motion-fast),
        color var(--motion-fast);
    }
    .tc-modal-close:hover { background: var(--color-background); color: var(--color-text-primary); }
    .tc-modal-content {
      padding: var(--space-5);
      overflow-y: auto;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  open = input<boolean>(false);
  title = input.required<string>();
  closeOnBackdrop = input<boolean>(true);
  close = output<void>();

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnBackdrop() && (event.target as HTMLElement).classList.contains('tc-modal-backdrop')) {
      this.close.emit();
    }
  }

  onBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.closeOnBackdrop()) {
      this.close.emit();
    }
  }
}
