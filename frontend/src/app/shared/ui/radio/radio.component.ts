import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  template: `
    <label 
      class="inline-flex items-start group cursor-pointer"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled">
      
      <div class="relative flex items-center justify-center w-[18px] h-[18px] mt-0.5 rounded-full border border-neutral-300 bg-white transition-colors duration-200 shrink-0"
           [ngClass]="{
             'border-primary-600': checked,
             'group-hover:border-primary-500': !disabled && !checked,
             'ring-2 ring-primary-600/40 ring-offset-2': focused && !disabled
           }">
        
        <input 
          type="radio" 
          class="sr-only"
          [value]="value"
          [name]="name"
          [checked]="checked"
          [disabled]="disabled"
          (change)="onSelect()"
          (focus)="focused = true"
          (blur)="onBlur()">
          
        <div *ngIf="checked" class="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
      </div>

      <div *ngIf="label" class="ms-2 select-none">
        <span class="text-sm text-neutral-900">
          {{ label }}
        </span>
        <div *ngIf="description" class="text-xs text-neutral-500 mt-0.5">
          {{ description }}
        </div>
      </div>
    </label>
  `
})
export class RadioComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() description?: string;
  @Input() value: any;
  @Input() name: string = '';
  @Input() disabled = false;

  checked = false;
  focused = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelect() {
    if (this.disabled) return;
    this.checked = true;
    this.onChange(this.value);
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  writeValue(value: any): void {
    this.checked = value === this.value;
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
