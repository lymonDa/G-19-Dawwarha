import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ],
  template: `
    <label 
      class="inline-flex items-center group"
      [class.cursor-pointer]="!disabled && !loading"
      [class.cursor-not-allowed]="disabled || loading"
      [class.opacity-60]="disabled">
      
      <div 
        class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-inherit items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
        [ngClass]="{
          'bg-primary-600': checked && !loading,
          'bg-neutral-300': !checked && !loading,
          'bg-primary-300': checked && loading,
          'bg-neutral-200': !checked && loading,
          'ring-2 ring-primary-600/40 ring-offset-2': focused && !disabled && !loading
        }">
        
        <input 
          type="checkbox" 
          role="switch"
          class="sr-only"
          [attr.aria-checked]="checked"
          [checked]="checked"
          [disabled]="disabled || loading"
          (change)="onToggle($event)"
          (focus)="focused = true"
          (blur)="onBlur()">
          
        <span 
          class="pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
          [ngClass]="checked ? 'translate-x-[18px]' : 'translate-x-0'">
          
          <lucide-icon 
            *ngIf="loading" 
            name="loader-2" 
            [size]="12" 
            class="animate-spin text-primary-600">
          </lucide-icon>
        </span>
      </div>

      <span *ngIf="label" class="ms-3 text-sm font-medium text-neutral-900 select-none">
        {{ label }}
      </span>
    </label>
  `
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() loading = false;

  checked = false;
  focused = false;
  
  readonly Loader2 = Loader2;

  onChange: any = () => {};
  onTouched: any = () => {};

  onToggle(event: Event) {
    if (this.disabled || this.loading) return;
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
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
