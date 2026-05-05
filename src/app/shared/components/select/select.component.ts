import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'tc-select',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }],
  template: `
    <div class="tc-select-wrapper" [class.is-open]="isOpen()" [class.has-error]="!!error()" [class.is-disabled]="disabled()">
      @if (label()) {
        <span class="select-label" [id]="labelId">{{ label() }}</span>
      }

      <div class="select-field" [class.full-width]="fullWidth()">
        <button
          [id]="triggerId"
          type="button"
          class="select-trigger"
          [class.size-sm]="size() === 'sm'"
          [class.size-md]="size() === 'md'"
          [class.placeholder]="!selectedOption()"
          [disabled]="disabled()"
          role="combobox"
          aria-haspopup="listbox"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="isOpen() ? listboxId : null"
          [attr.aria-activedescendant]="isOpen() && highlightedIndex() >= 0 ? optionId(highlightedIndex()) : null"
          [attr.aria-labelledby]="label() ? labelId + ' ' + triggerId : null"
          [attr.aria-label]="label() ? null : (selectedOption()?.label || placeholder())"
          [attr.aria-invalid]="!!error()"
          (click)="toggleDropdown()"
          (keydown)="onTriggerKeydown($event)"
          (blur)="onTouched()">
          <span class="trigger-value">{{ selectedOption()?.label || placeholder() }}</span>
          <span class="trigger-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </button>

        @if (isOpen()) {
          <div
            [id]="listboxId"
            class="select-dropdown"
            role="listbox"
            [attr.aria-labelledby]="label() ? labelId : null">
            @for (opt of options(); track opt.value; let index = $index) {
              <button
                type="button"
                class="select-option"
                [id]="optionId(index)"
                role="option"
                [class.is-selected]="opt.value === value()"
                [class.is-highlighted]="index === highlightedIndex()"
                [attr.aria-selected]="opt.value === value()"
                (mouseenter)="highlightedIndex.set(index)"
                (click)="selectValue(opt.value)">
                <span>{{ opt.label }}</span>
                @if (opt.value === value()) {
                  <span class="option-check" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M5 10.5L8.5 14L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                }
              </button>
            } @empty {
              <div class="select-empty">Nenhuma opcao</div>
            }
          </div>
        }
      </div>

      @if (error()) {
        <span class="error-msg">{{ error() }}</span>
      } @else if (hint()) {
        <span class="hint-msg">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: var(--space-4);
    }

    .tc-select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      position: relative;
    }

    .select-label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .select-field {
      position: relative;
      width: 100%;
    }

    .select-trigger {
      width: 100%;
      min-height: 48px;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      text-align: left;
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      line-height: 1.4;
      box-shadow: 0 1px 2px rgba(17, 24, 39, 0.05);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast), background-color var(--motion-fast);
      cursor: pointer;
    }

    .select-trigger.size-sm {
      min-height: 40px;
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
    }

    .select-trigger.placeholder .trigger-value {
      color: var(--color-text-secondary);
    }

    .select-trigger:hover:not(:disabled) {
      border-color: var(--color-accent-500);
    }

    .select-trigger:focus-visible {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50), 0 1px 2px rgba(17, 24, 39, 0.05);
    }

    .has-error .select-trigger {
      border-color: var(--color-danger-500);
    }

    .has-error .select-trigger:focus-visible {
      box-shadow: 0 0 0 3px var(--color-danger-50), 0 1px 2px rgba(17, 24, 39, 0.05);
    }

    .is-open .select-trigger {
      border-color: var(--color-accent-500);
      box-shadow: 0 0 0 3px var(--color-primary-50), 0 12px 24px rgba(17, 24, 39, 0.08);
    }

    .select-trigger:disabled {
      background: var(--color-background);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      box-shadow: none;
      opacity: 0.72;
    }

    .trigger-value {
      min-width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .trigger-icon {
      width: 18px;
      height: 18px;
      color: var(--color-accent-500);
      flex-shrink: 0;
      transition: transform var(--motion-fast);
    }

    .trigger-icon svg,
    .option-check svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .is-open .trigger-icon {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      left: 0;
      right: 0;
      z-index: 20;
      max-height: min(280px, 50vh);
      overflow-y: auto;
      padding: var(--space-2);
      border: 1px solid var(--color-border-card);
      border-radius: var(--radius-lg);
      background: var(--color-bg-card);
      box-shadow: var(--shadow-lg);
      animation: dropdownIn var(--motion-normal);
    }

    :host-context([data-theme="dark"]) .select-trigger {
      background: color-mix(in srgb, var(--color-surface) 88%, #000 12%);
    }

    :host-context([data-theme="dark"]) .select-dropdown {
      background: color-mix(in srgb, var(--color-surface) 94%, #000 6%);
      border-color: color-mix(in srgb, var(--color-accent-500) 24%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    :host-context([data-theme="dark"]) .select-option.is-selected {
      background: color-mix(in srgb, var(--color-accent-500) 18%, var(--color-surface));
    }

    .select-option {
      width: 100%;
      min-height: 44px;
      padding: var(--space-3);
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-primary);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      text-align: left;
      cursor: pointer;
      transition: background-color var(--motion-fast), color var(--motion-fast);
    }

    .select-option.is-highlighted,
    .select-option:hover {
      background: var(--color-bg-row-hover);
    }

    .select-option.is-selected {
      color: var(--color-accent-500);
      font-weight: 600;
      background: color-mix(in srgb, var(--color-accent-500) 10%, var(--color-surface));
    }

    .option-check {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .select-empty {
      padding: var(--space-3);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .error-msg {
      font-size: var(--font-size-xs);
      color: var(--color-danger-500);
    }

    .hint-msg {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    @keyframes dropdownIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly id = 'tc-select-' + Math.random().toString(36).substring(2, 9);
  readonly triggerId = `${this.id}-trigger`;
  readonly labelId = `${this.id}-label`;
  readonly listboxId = `${this.id}-listbox`;

  readonly label = input<string>();
  readonly placeholder = input('Selecione...');
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly size = input<'sm' | 'md'>('md');
  readonly fullWidth = input(true);

  readonly value = signal('');
  readonly disabled = signal(false);
  readonly isOpen = signal(false);
  readonly highlightedIndex = signal(-1);

  readonly selectedOption = computed(() =>
    this.options().find(option => option.value === this.value()) ?? null
  );

  onChange: (value: string) => void = (_value: string): void => undefined;
  onTouched: () => void = (): void => undefined;

  writeValue(val: string | null): void {
    this.value.set(val || '');
    this.highlightSelectedOption();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) this.closeDropdown();
    this.cdr.markForCheck();
  }

  optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closeDropdown();
      return;
    }

    this.openDropdown();
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.highlightSelectedOption();
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.highlightSelectedOption();
  }

  selectValue(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.closeDropdown();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen()) {
          this.selectHighlighted();
        } else {
          this.openDropdown();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) this.openDropdown();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) this.openDropdown();
        this.moveHighlight(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.openDropdown();
        this.highlightedIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.openDropdown();
        this.highlightedIndex.set(Math.max(this.options().length - 1, 0));
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  private highlightSelectedOption(): void {
    const selectedIndex = this.options().findIndex(option => option.value === this.value());
    this.highlightedIndex.set(selectedIndex >= 0 ? selectedIndex : 0);
  }

  private moveHighlight(direction: 1 | -1): void {
    const options = this.options();
    if (options.length === 0) return;

    const current = this.highlightedIndex();
    const nextIndex = current < 0
      ? 0
      : (current + direction + options.length) % options.length;

    this.highlightedIndex.set(nextIndex);
  }

  private selectHighlighted(): void {
    const option = this.options()[this.highlightedIndex()];
    if (option) this.selectValue(option.value);
  }
}
