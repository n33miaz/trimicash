import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-date-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateInputComponent),
    multi: true
  }],
  template: `
    <div class="tc-input-wrapper">
      @if (label()) { <label [for]="id">{{ label() }}</label> }
      <input 
        [id]="id"
        type="date"
        [value]="value"
        [disabled]="disabled"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        [class.has-error]="error()">
      
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
    input {
      width: 100%;
      box-sizing: border-box;
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      cursor: pointer;
    }
    input:hover:not(:disabled) {
      border-color: var(--color-accent-500);
    }
    input:focus-visible {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    input::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity var(--motion-fast);
      padding: 4px;
      border-radius: 4px;
    }
    input::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
      background-color: var(--color-bg-input);
    }
    input.has-error { border-color: var(--color-danger-500); }
    input:disabled { background: var(--color-background); cursor: not-allowed; opacity: 0.7; box-shadow: none; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputComponent implements ControlValueAccessor {
  id = 'tc-date-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();

  value = '';
  disabled = false;

  onChange: (value: Date | null) => void = (_value: Date | null): void => { return; };
  onTouched: () => void = (): void => { return; };

  writeValue(val: string | Date): void { 
    if (val instanceof Date) {
      this.value = val.toISOString().split('T')[0];
    } else {
      this.value = val || ''; 
    }
  }
  registerOnChange(fn: (value: Date | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val ? new Date(`${val}T12:00:00`) : null);
  }
  
  onBlur() { this.onTouched(); }
}
