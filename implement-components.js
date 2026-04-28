const fs = require('fs');
const path = require('path');

const writeComponent = (name, content) => {
  const filePath = path.join(__dirname, 'src', 'app', 'shared', 'components', name, `${name}.component.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
};

const components = {
  'button': `import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-button',
  standalone: true,
  template: \`
    <button 
      [class]="'tc-btn tc-btn-' + variant() + ' tc-btn-' + size()"
      [disabled]="disabled() || loading()"
      (click)="onClick.emit($event)">
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  \`,
  styles: [\`
    :host { display: inline-block; }
    .tc-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--motion-fast);
      white-space: nowrap;
    }
    .tc-btn:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
    .tc-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Sizes */
    .tc-btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--font-size-sm); }
    .tc-btn-md { padding: var(--space-3) var(--space-4); font-size: var(--font-size-md); }
    .tc-btn-lg { padding: var(--space-4) var(--space-5); font-size: var(--font-size-lg); }
    
    /* Variants */
    .tc-btn-primary { background: var(--color-accent-500); color: white; }
    .tc-btn-primary:hover:not(:disabled) { background: var(--color-accent-600); }
    
    .tc-btn-secondary { background: var(--color-surface); color: var(--color-text-primary); border: 1px solid var(--color-border); }
    .tc-btn-secondary:hover:not(:disabled) { background: var(--color-background); }
    
    .tc-btn-ghost { background: transparent; color: var(--color-text-primary); }
    .tc-btn-ghost:hover:not(:disabled) { background: var(--color-background); }
    
    .tc-btn-danger { background: var(--color-danger-500); color: white; }
    .tc-btn-danger:hover:not(:disabled) { background: var(--color-danger-600); }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  onClick = output<MouseEvent>();
}
`,

  'icon-button': `import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-icon-button',
  standalone: true,
  template: \`
    <button 
      class="tc-icon-btn"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
      (click)="onClick.emit($event)">
      <!-- Render SVG here based on icon input (simplified) -->
      <span class="icon">{{ icon() }}</span>
    </button>
  \`,
  styles: [\`
    :host { display: inline-block; }
    .tc-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--motion-fast);
    }
    .tc-icon-btn:hover:not(:disabled) {
      background: var(--color-background);
      color: var(--color-text-primary);
    }
    .tc-icon-btn:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
    .tc-icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  ariaLabel = input.required<string>();
  icon = input.required<string>();
  disabled = input<boolean>(false);
  onClick = output<MouseEvent>();
}
`,

  'card': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-card',
  standalone: true,
  template: \`
    <div class="tc-card">
      @if (title() || subtitle()) {
        <div class="tc-card-header">
          @if (title()) { <h3 class="tc-card-title">{{ title() }}</h3> }
          @if (subtitle()) { <p class="tc-card-subtitle">{{ subtitle() }}</p> }
        </div>
      }
      <div class="tc-card-content">
        <ng-content></ng-content>
      </div>
    </div>
  \`,
  styles: [\`
    :host { display: block; }
    .tc-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .tc-card-header {
      padding: var(--space-4) var(--space-4) 0;
    }
    .tc-card-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
    .tc-card-subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: var(--space-1) 0 0;
    }
    .tc-card-content {
      padding: var(--space-4);
    }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input<string>();
  subtitle = input<string>();
}
`,

  'input': `import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true
  }],
  template: \`
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
  \`,
  styles: [\`
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
    input:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50);
    }
    input.has-error { border-color: var(--color-danger-500); }
    input.has-error:focus { box-shadow: 0 0 0 3px var(--color-danger-50); }
    input:disabled { background: var(--color-background); cursor: not-allowed; opacity: 0.7; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  id = 'tc-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();
  type = input<string>('text');

  value: string = '';
  disabled = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(val: string): void { this.value = val || ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  
  onBlur() { this.onTouched(); }
}
`,

  'money-input': `import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-money-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MoneyInputComponent),
    multi: true
  }],
  template: \`
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
  \`,
  styles: [\`
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
  \`],
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
    const val = (event.target as HTMLInputElement).value.replace(/\\D/g, '');
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
`,

  'select': `import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-select',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }],
  template: \`
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
  \`,
  styles: [\`
    :host { display: block; margin-bottom: var(--space-4); }
    .tc-input-wrapper { display: flex; flex-direction: column; gap: var(--space-2); }
    label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
    select {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      background: var(--color-surface);
      color: var(--color-text-primary);
      transition: border-color var(--motion-fast);
      appearance: none;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
      background-repeat: no-repeat;
      background-position: right var(--space-3) center;
      background-size: 16px;
    }
    select:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50);
    }
    select.has-error { border-color: var(--color-danger-500); }
    select:disabled { background-color: var(--color-background); cursor: not-allowed; opacity: 0.7; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements ControlValueAccessor {
  id = 'tc-select-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();
  options = input.required<{label: string, value: any}[]>();

  value: any = '';
  disabled = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(val: any): void { this.value = val || ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onChangeEvent(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
  
  onBlur() { this.onTouched(); }
}
`,

  'date-input': `import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tc-date-input',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateInputComponent),
    multi: true
  }],
  template: \`
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
  \`,
  styles: [\`
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
    input:focus {
      outline: none;
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-50);
    }
    input.has-error { border-color: var(--color-danger-500); }
    input:disabled { background: var(--color-background); cursor: not-allowed; opacity: 0.7; }
    .error-msg { font-size: var(--font-size-xs); color: var(--color-danger-500); }
    .hint-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputComponent implements ControlValueAccessor {
  id = 'tc-date-input-' + Math.random().toString(36).substring(2, 9);
  label = input<string>();
  error = input<string>();
  hint = input<string>();

  value: string = '';
  disabled = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(val: string | Date): void { 
    if (val instanceof Date) {
      this.value = val.toISOString().split('T')[0];
    } else {
      this.value = val || ''; 
    }
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInputChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  
  onBlur() { this.onTouched(); }
}
`,

  'modal': `import { ChangeDetectionStrategy, Component, input, output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'tc-modal',
  standalone: true,
  template: \`
    @if (open()) {
      <div class="tc-modal-backdrop" (click)="onBackdropClick($event)">
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
  \`,
  styles: [\`
    .tc-modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(17, 24, 39, 0.5);
      backdrop-filter: blur(4px);
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
      background: transparent; border: none; cursor: pointer; color: var(--color-text-secondary); padding: var(--space-1); border-radius: var(--radius-sm); transition: all var(--motion-fast);
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
  \`],
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
}
`,

  'table': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-table',
  standalone: true,
  template: \`
    <div class="tc-table-container">
      <table class="tc-table">
        <thead>
          <tr>
            @for (col of columns(); track col) {
              <th>{{ col }}</th>
            }
          </tr>
        </thead>
        <tbody>
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  \`,
  styles: [\`
    :host { display: block; }
    .tc-table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }
    .tc-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .tc-table th {
      padding: var(--space-3) var(--space-4);
      background: var(--color-background);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--color-border);
    }
    ::ng-deep .tc-table td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
    }
    ::ng-deep .tc-table tr:last-child td {
      border-bottom: none;
    }
    ::ng-deep .tc-table tbody tr:hover {
      background: var(--color-background);
    }
    
    /* Mobile styles applied to the slotted content usually, handled in component */
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  columns = input.required<string[]>();
}
`,

  'badge': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-badge',
  standalone: true,
  template: \`
    <span [class]="'tc-badge tc-badge-' + tone()">
      <ng-content></ng-content>
    </span>
  \`,
  styles: [\`
    :host { display: inline-flex; }
    .tc-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: var(--font-size-xs);
      font-weight: 600;
      line-height: 1.5;
      white-space: nowrap;
    }
    .tc-badge-neutral { background: var(--color-background); color: var(--color-text-secondary); border: 1px solid var(--color-border); }
    .tc-badge-success { background: var(--color-success-50); color: var(--color-success-500); border: 1px solid rgba(22, 163, 74, 0.2); }
    .tc-badge-warning { background: var(--color-warning-50); color: var(--color-warning-500); border: 1px solid rgba(245, 158, 11, 0.2); }
    .tc-badge-danger { background: var(--color-danger-50); color: var(--color-danger-500); border: 1px solid rgba(220, 38, 38, 0.2); }
    .tc-badge-info { background: #eff6ff; color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info'>('neutral');
}
`,

  'empty-state': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-empty-state',
  standalone: true,
  template: \`
    <div class="tc-empty-state">
      <div class="icon-circle">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
      </div>
      <h3 class="title">{{ title() }}</h3>
      <p class="message">{{ message() }}</p>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  \`,
  styles: [\`
    :host { display: block; }
    .tc-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-8) var(--space-4);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
    }
    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-background);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    .title {
      margin: 0 0 var(--space-2);
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .message {
      margin: 0 0 var(--space-5);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      max-width: 400px;
    }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
}
`,

  'loading-state': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-loading-state',
  standalone: true,
  template: \`
    <div class="tc-loading-state">
      <div class="spinner"></div>
      @if (message()) {
        <p class="message">{{ message() }}</p>
      }
    </div>
  \`,
  styles: [\`
    :host { display: block; }
    .tc-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      color: var(--color-text-secondary);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(5, 27, 97, 0.1);
      border-top-color: var(--color-primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-4);
    }
    .message { margin: 0; font-size: var(--font-size-sm); font-weight: 500; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  message = input<string>();
}
`,

  'error-state': `import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'tc-error-state',
  standalone: true,
  template: \`
    <div class="tc-error-state">
      <div class="icon">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <p class="message">{{ message() }}</p>
      <button class="retry-btn" (click)="retry.emit()">Tentar Novamente</button>
    </div>
  \`,
  styles: [\`
    :host { display: block; }
    .tc-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background: var(--color-danger-50);
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .icon { color: var(--color-danger-500); margin-bottom: var(--space-3); }
    .message { color: var(--color-danger-500); font-weight: 500; margin: 0 0 var(--space-4); }
    .retry-btn {
      background: var(--color-surface);
      border: 1px solid var(--color-danger-500);
      color: var(--color-danger-500);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--motion-fast);
    }
    .retry-btn:hover { background: var(--color-danger-500); color: white; }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  message = input.required<string>();
  retry = output<void>();
}
`,

  'page-header': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-page-header',
  standalone: true,
  template: \`
    <header class="tc-page-header">
      <h1 class="title">{{ title() }}</h1>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </header>
  \`,
  styles: [\`
    :host { display: block; margin-bottom: var(--space-6); }
    .tc-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
    }
    .title {
      margin: 0;
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .actions { display: flex; gap: var(--space-2); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
}
`,

  'stat-card': `import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tc-stat-card',
  standalone: true,
  template: \`
    <div class="tc-stat-card" [class]="'tone-' + tone()">
      <div class="content">
        <span class="label">{{ label() }}</span>
        <span class="value">{{ value() }}</span>
        @if (hint()) {
          <span class="hint">{{ hint() }}</span>
        }
      </div>
    </div>
  \`,
  styles: [\`
    :host { display: block; height: 100%; }
    .tc-stat-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      height: 100%;
      box-shadow: var(--shadow-sm);
    }
    .content { display: flex; flex-direction: column; }
    .label { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: 500; margin-bottom: var(--space-2); }
    .value { font-family: var(--font-family-display); font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text-primary); }
    .hint { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2); }
    
    .tone-success .value { color: var(--color-success-500); }
    .tone-danger .value { color: var(--color-danger-500); }
    .tone-warning .value { color: var(--color-warning-500); }
    .tone-primary .value { color: var(--color-primary-500); }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  tone = input<'neutral' | 'success' | 'danger' | 'warning' | 'primary'>('neutral');
  hint = input<string>();
}
`
};

Object.entries(components).forEach(([name, content]) => {
  writeComponent(name, content);
});
