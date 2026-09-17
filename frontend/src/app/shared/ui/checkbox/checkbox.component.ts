import { Component, Input, forwardRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check, Minus } from 'lucide-angular';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label 
      class="inline-flex items-start group cursor-pointer"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled">
      
      <div class="relative flex items-center justify-center w-[18px] h-[18px] mt-0.5 rounded-[6px] border border-neutral-300 bg-white transition-colors duration-200 shrink-0"
           [ngClass]="{
             'bg-primary-600 border-primary-600': checked || indeterminate,
             'border-danger': error && !checked && !indeterminate,
             'group-hover:border-primary-500': !disabled && !checked && !indeterminate,
             'ring-2 ring-primary-600/40 ring-offset-2': focused && !disabled
           }">
        
        <input 
          type="checkbox" 
          class="sr-only"
          [checked]="checked"
          [disabled]="disabled"
          (change)="onToggle($event)"
          (focus)="focused = true"
          (blur)="onBlur()"
          [attr.aria-invalid]="error ? 'true' : null">
          
        <lucide-icon *ngIf="checked && !indeterminate" name="check" [size]="12" class="text-white" strokeWidth="3"></lucide-icon>
        <lucide-icon *ngIf="indeterminate" name="minus" [size]="12" class="text-white" strokeWidth="3"></lucide-icon>
      </div>

      <div *ngIf="label" class="ms-2 select-none">
        <span class="text-sm text-neutral-900" [class.text-danger]="error && !checked && !indeterminate">
          {{ label }}
        </span>
        <div *ngIf="description" class="text-xs text-neutral-500 mt-0.5">
          {{ description }}
        </div>
      </div>
    </label>
  `
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() description?: string;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() error = false;

  checked = false;
  focused = false;
  
  readonly Check = Check;
  readonly Minus = Minus;

  onChange: any = () => {};
  onTouched: any = () => {};

  onToggle(event: Event) {
    if (this.disabled) return;
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false; // clear indeterminate on manual toggle
    this.onChange(this.checked);
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  writeValue(value: any): void {
    this.checked = !!value;
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
