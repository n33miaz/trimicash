import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
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
      <div class="input-with-prefix">
        <span class="prefix">R$</span>
        <input 
          [id]="id"
          type="text"
          [value]="displayValue"
          [disabled]="disabled"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          [class.has-error]="error()">
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
    .tc-input-wrapper { display: flex; flex-direction: column; gap: var(--space-2); }
    label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
    .input-with-prefix {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      overflow: hidden;
      transition: border-color var(--motion-fast);
    }
    .input-with-prefix:focus-within {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50);
    }
    .input-with-prefix:has(.has-error) { border-color: var(--color-danger-500); }
    .prefix { padding: 0 var(--space-3); color: var(--color-text-secondary); background: var(--color-background); border-right: 1px solid var(--color-border); height: 100%; display: flex; align-items: center; }
    input { flex: 1; padding: var(--space-3); border: none; font-family: var(--font-family-body); font-size: var(--font-size-md); color: var(--color-text-primary); background: transparent; }
    input:focus { outline: none; }
    input:disabled { cursor: not-allowed; }
    .input-with-prefix:has(input:disabled) { background: var(--color-background); opacity: 0.7; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyInputComponent implements ControlValueAccessor {
  id = 'tc-money-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();

  rawValue: number = 0;
  displayValue: string = '';
  disabled = false;

  onChange = (value: number) => {};
  onTouched = () => {};

  writeValue(val: number): void { 
    this.rawValue = val || 0; 
    this.displayValue = this.formatMoney(this.rawValue);
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.rawValue = val ? parseInt(val, 10) / 100 : 0;
    this.displayValue = this.formatMoney(this.rawValue);
    (event.target as HTMLInputElement).value = this.displayValue;
    this.onChange(this.rawValue);
  }
  
  onBlur() { this.onTouched(); }

  private formatMoney(val: number): string {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
