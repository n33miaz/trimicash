import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-select',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }],
  template: `
    <div class="tc-input-wrapper">
      @if (label()) { <label [for]="id">{{ label() }}</label> }
      <select 
        [id]="id"
        [value]="value"
        [disabled]="disabled"
        (change)="onChangeEvent($event)"
        (blur)="onBlur()"
        [class.has-error]="error()">
        <option value="" disabled selected hidden>Selecione...</option>
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      
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
    select {
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: border-color var(--motion-fast), box-shadow var(--motion-fast);
      appearance: none;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%232f80ed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      cursor: pointer;
    }
    select:hover:not(:disabled) {
      border-color: var(--color-accent-500);
    }
    select:focus-visible {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    select.has-error { border-color: var(--color-danger-500); }
    select:disabled { background-color: var(--color-background); cursor: not-allowed; opacity: 0.7; box-shadow: none; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements ControlValueAccessor {
  id = 'tc-select-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();
  options = input.required<readonly { label: string; value: string }[]>();

  value = '';
  disabled = false;

  onChange: (value: string) => void = (_value: string): void => { return; };
  onTouched: () => void = (): void => { return; };

  writeValue(val: string | null): void { this.value = val || ''; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onChangeEvent(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
  
  onBlur() { this.onTouched(); }
}
