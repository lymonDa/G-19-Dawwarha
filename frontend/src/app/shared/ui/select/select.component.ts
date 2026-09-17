import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown, AlertCircle } from 'lucide-angular';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col gap-1.5">
      <label *ngIf="label" class="block text-sm font-semibold text-neutral-900">
        {{ label }} <span *ngIf="required" class="text-danger">*</span>
      </label>

      <div class="relative w-full group">
        <select
          [disabled]="disabled"
          [attr.aria-invalid]="error ? 'true' : null"
          [ngModel]="value"
          (ngModelChange)="onSelect($event)"
          (blur)="onTouched()"
          class="w-full appearance-none px-3 py-2 text-sm bg-white border rounded-md outline-none transition-colors duration-200 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          [ngClass]="{
            'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600': !error,
            'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-danger': error,
            'text-neutral-900': value !== null && value !== undefined && value !== '',
            'text-neutral-500': value === null || value === undefined || value === ''
          }">
          
          <option *ngIf="placeholder" value="" disabled selected class="text-neutral-500">
            {{ placeholder }}
          </option>
          
          <option *ngFor="let option of options" [value]="option.value" [disabled]="option.disabled" class="text-neutral-900">
            {{ option.label }}
          </option>
        </select>
        
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <lucide-icon *ngIf="error" name="alert-circle" [size]="16" class="text-danger mr-2"></lucide-icon>
          <lucide-icon name="chevron-down" [size]="16" class="text-neutral-500"></lucide-icon>
        </div>
      </div>

      <div class="flex justify-between items-start gap-4">
        <span *ngIf="error" class="text-xs text-danger" id="error-message">
          {{ error }}
        </span>
        <span *ngIf="helperText && !error" class="text-xs text-neutral-500" id="helper-text">
          {{ helperText }}
        </span>
      </div>
    </div>
  `
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helperText?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() options: SelectOption[] = [];

  value: any = '';

  readonly ChevronDown = ChevronDown;
  readonly AlertCircle = AlertCircle;

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelect(val: any) {
    this.value = val;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
