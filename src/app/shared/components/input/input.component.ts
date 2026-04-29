import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }],
  template: `
    <div class="tc-input-wrapper">
      @if (label()) { <label [for]="id">{{ label() }}</label> }
      <input 
        [id]="id"
        [type]="type()"
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
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: border-color var(--motion-fast);
    }
    input:focus-visible {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50);
    }
    input.has-error { border-color: var(--color-danger-500); }
    input.has-error:focus-visible { box-shadow: 0 0 0 3px var(--color-danger-50); }
    input:disabled { background: var(--color-background); cursor: not-allowed; opacity: 0.7; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  id = 'tc-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();
  type = input<string>('text');

  value = '';
  disabled = false;

  onChange: (value: string) => void = (_value: string): void => { return; };
  onTouched: () => void = (): void => { return; };

  writeValue(val: string): void { this.value = val || ''; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  
  onBlur() { this.onTouched(); }
}
