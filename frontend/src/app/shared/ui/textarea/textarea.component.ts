import { Component, Input, forwardRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col gap-1.5">
      <label *ngIf="label" class="block text-sm font-semibold text-neutral-900">
        {{ label }} <span *ngIf="required" class="text-danger">*</span>
      </label>

      <div class="relative w-full">
        <textarea
          #textareaEl
          [rows]="rows"
          [attr.placeholder]="placeholder"
          [attr.maxlength]="maxLength"
          [disabled]="disabled"
          [readonly]="readonly"
          class="w-full px-3 py-2 text-sm bg-white border rounded-md outline-none transition-colors duration-200 placeholder:text-neutral-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          [ngClass]="{
            'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600': !error,
            'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-danger pr-10': error,
            'resize-none overflow-hidden': autoGrow
          }"
          (input)="onInput($event)"
          (blur)="onTouched()"></textarea>
          
        <div *ngIf="error" class="absolute top-2.5 right-3 text-danger pointer-events-none">
          <lucide-icon name="alert-circle" [size]="16"></lucide-icon>
        </div>
      </div>

      <div class="flex justify-between items-start gap-4">
        <span *ngIf="error" class="text-xs text-danger" id="error-message">
          {{ error }}
        </span>
        <span *ngIf="helperText && !error" class="text-xs text-neutral-500" id="helper-text">
          {{ helperText }}
        </span>
        <span *ngIf="maxLength" class="text-xs text-neutral-500 text-end whitespace-nowrap ml-auto" aria-live="polite">
          {{ currentLength }}/{{ maxLength }}
        </span>
      </div>
    </div>
  `
})
export class TextareaComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helperText?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() rows = 3;
  @Input() autoGrow = false;
  @Input() maxLength?: number;

  @ViewChild('textareaEl') textareaEl!: ElementRef<HTMLTextAreaElement>;

  currentLength = 0;
  readonly AlertCircle = AlertCircle;

  onChange: any = () => {};
  onTouched: any = () => {};

  ngAfterViewInit() {
    if (this.autoGrow) {
      this.adjustHeight();
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.currentLength = target.value.length;
    this.onChange(target.value);
    
    if (this.autoGrow) {
      this.adjustHeight();
    }
  }

  adjustHeight() {
    if (!this.textareaEl) return;
    const el = this.textareaEl.nativeElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  writeValue(value: any): void {
    if (this.textareaEl) {
      this.textareaEl.nativeElement.value = value || '';
      this.currentLength = (value || '').length;
      if (this.autoGrow) {
        setTimeout(() => this.adjustHeight(), 0);
      }
    }
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
