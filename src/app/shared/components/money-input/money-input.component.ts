import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-money-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MoneyInputComponent),
    multi: true
  }],
  template: `
    <div class="tc-input-wrapper">
      @if (label()) { <label [for]="id">{{ label() }}</label> }
      <div class="input-with-prefix" [class.has-error]="!!error()" [class.is-disabled]="disabled">
        <span class="prefix" aria-hidden="true">R$</span>
        <input
          [id]="id"
          type="text"
          [value]="displayValue"
          [disabled]="disabled"
          inputmode="decimal"
          autocomplete="off"
          enterkeyhint="done"
          [attr.aria-invalid]="!!error()"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          [class.has-error]="!!error()">
      </div>
      @if (error()) {
        <span class="error-msg">{{ error() }}</span>
      } @else if (hint()) {
        <span class="hint-msg">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; margin-bottom: var(--space-4); }

    .tc-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    label {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .input-with-prefix {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      min-height: 52px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(17, 24, 39, 0.05);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast), background-color var(--motion-fast);
    }

    .input-with-prefix:focus-within {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50), 0 10px 22px rgba(17, 24, 39, 0.08);
    }

    .input-with-prefix.has-error {
      border-color: var(--color-danger-500);
      background: color-mix(in srgb, var(--color-danger-50) 35%, var(--color-surface));
    }

    .input-with-prefix.has-error:focus-within {
      box-shadow: 0 0 0 3px var(--color-danger-50), 0 10px 22px rgba(220, 38, 38, 0.08);
    }

    .prefix {
      align-self: stretch;
      padding: 0 var(--space-4);
      color: var(--color-text-secondary);
      background: color-mix(in srgb, var(--color-accent-500) 7%, var(--color-surface));
      border-right: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      font-weight: 700;
      font-family: var(--font-family-display);
      letter-spacing: 0;
    }

    input {
      flex: 1;
      min-width: 0;
      padding: var(--space-3) var(--space-4);
      border: none;
      font-family: var(--font-family-display);
      font-size: clamp(1rem, 2vw, 1.15rem);
      color: var(--color-text-primary);
      background: transparent;
      font-weight: 700;
      line-height: 1.2;
    }

    input:focus {
      outline: none;
    }

    input::placeholder {
      color: var(--color-text-secondary);
    }

    input:disabled {
      cursor: not-allowed;
    }

    .input-with-prefix.is-disabled {
      background: var(--color-background);
      box-shadow: none;
      opacity: 0.74;
    }

    .error-msg {
      font-size: var(--font-size-xs);
      color: var(--color-danger-500);
    }

    .hint-msg {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    @media (max-width: 767px) {
      .input-with-prefix {
        min-height: 56px;
      }

      .prefix {
        padding-inline: var(--space-3);
      }

      input {
        padding-inline: var(--space-3);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyInputComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  id = 'tc-money-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();

  rawValue = 0;
  displayValue = '';
  disabled = false;

  onChange: (value: number) => void = (_value: number): void => undefined;
  onTouched: () => void = (): void => undefined;

  writeValue(val: number): void {
    this.rawValue = val || 0;
    this.displayValue = this.formatMoney(this.rawValue);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.rawValue = val ? parseInt(val, 10) / 100 : 0;
    this.displayValue = this.formatMoney(this.rawValue);
    (event.target as HTMLInputElement).value = this.displayValue;
    this.onChange(this.rawValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  private formatMoney(val: number): string {
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
