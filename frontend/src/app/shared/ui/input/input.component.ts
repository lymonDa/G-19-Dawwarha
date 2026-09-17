import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col gap-1.5">
      @if (label) {
        <label [for]="inputId" class="text-sm font-medium text-neutral-900 flex items-center justify-between">
          <span>
            {{ label }}
            @if (required) {
              <span class="text-danger ms-0.5">*</span>
            }
          </span>
          @if (hint) {
            <span class="text-xs font-normal text-neutral-500">{{ hint }}</span>
          }
        </label>
      }

      <div class="relative flex items-center">
        <input
          [id]="inputId"
          [type]="actualType()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value()"
          (input)="handleInput($event)"
          (blur)="onTouched()"
          [attr.aria-invalid]="!!error"
          [attr.aria-describedby]="error ? inputId + '-error' : (helperText ? inputId + '-helper' : null)"
          class="w-full px-3.5 py-2.5 bg-white text-neutral-900 text-sm rounded-md border transition-all placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          [class.border-neutral-200]="!error"
          [class.border-danger]="!!error"
          [class.focus:ring-danger]="!!error"
          [class.pe-10]="type === 'password'"
        />

        @if (type === 'password') {
          <button
            type="button"
            (click)="togglePasswordVisibility()"
            class="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-500 hover:text-neutral-700 focus:outline-none"
            [attr.aria-label]="isPasswordVisible() ? 'Hide password' : 'Show password'"
          >
            @if (isPasswordVisible()) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            }
          </button>
        }
      </div>

      @if (error) {
        <p [id]="inputId + '-error'" class="text-xs text-danger font-medium flex items-center gap-1 mt-0.5">
          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ error }}</span>
        </p>
      } @else if (helperText) {
        <p [id]="inputId + '-helper'" class="text-xs text-neutral-500 mt-0.5">
          {{ helperText }}
        </p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() helperText = '';
  @Input() hint = '';
  @Input() error: string | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() inputId = 'input-' + Math.random().toString(36).substring(2, 9);

  readonly value = signal<string>('');
  readonly isPasswordVisible = signal<boolean>(false);

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  actualType(): string {
    if (this.type === 'password') {
      return this.isPasswordVisible() ? 'text' : 'password';
    }
    return this.type;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update(v => !v);
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
  }

  writeValue(val: any): void {
    this.value.set(val !== null && val !== undefined ? String(val) : '');
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
