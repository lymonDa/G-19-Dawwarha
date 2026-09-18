import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LucideAngularModule, Search as SearchIcon, X, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full flex items-center group">
      <div class="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-primary-600 transition-colors">
        <lucide-icon name="search" [size]="16"></lucide-icon>
      </div>
      
      <input
        #inputEl
        type="text"
        role="searchbox"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="block w-full ps-9 pe-9 py-2 text-sm border border-neutral-200 rounded-md outline-none transition-colors duration-200 bg-white placeholder:text-neutral-500 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed">
        
      <div class="absolute inset-y-0 end-0 pe-2 flex items-center">
        <lucide-icon 
          *ngIf="loading" 
          name="loader-2" 
          [size]="16" 
          class="animate-spin text-primary-600 me-1">
        </lucide-icon>
        
        <button
          *ngIf="value && !loading && !disabled"
          type="button"
          (click)="clear()"
          class="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:text-neutral-700 transition-colors"
          aria-label="Clear search">
          <lucide-icon name="x" [size]="16"></lucide-icon>
        </button>
      </div>
    </div>
  `
})
export class SearchComponent implements ControlValueAccessor {
  @Input() placeholder = 'Search...';
  @Input() disabled = false;
  @Input() loading = false;
  
  @Output() search = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  value = '';
  readonly SearchIcon = SearchIcon;
  readonly X = X;
  readonly Loader2 = Loader2;

  onChange: any = () => {};
  onTouched: any = () => {};

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.search.emit(this.value);
  }

  clear() {
    this.value = '';
    if (this.inputEl) {
      this.inputEl.nativeElement.value = '';
      this.inputEl.nativeElement.focus();
    }
    this.onChange(this.value);
    this.search.emit(this.value);
    this.cleared.emit();
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.inputEl) {
      this.inputEl.nativeElement.value = this.value;
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
