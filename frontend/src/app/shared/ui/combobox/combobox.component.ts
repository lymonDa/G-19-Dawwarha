import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown, Check, X, Search as SearchIcon, AlertCircle } from 'lucide-angular';

export interface ComboboxOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col gap-1.5" (keydown)="onKeydown($event)" #container>
      <label *ngIf="label" class="block text-sm font-semibold text-neutral-900" [id]="labelId">
        {{ label }} <span *ngIf="required" class="text-danger">*</span>
      </label>

      <div class="relative w-full">
        <!-- Trigger Button -->
        <button
          #trigger
          type="button"
          [disabled]="disabled"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-expanded]="isOpen"
          [attr.aria-labelledby]="labelId"
          (click)="toggle()"
          class="relative w-full flex items-center justify-between px-3 py-2 text-sm bg-white border rounded-md outline-none transition-colors duration-200 text-left disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
          [ngClass]="{
            'border-neutral-200 focus:border-primary-600 focus:ring-1 focus:ring-primary-600': !error && !isOpen,
            'border-primary-600 ring-1 ring-primary-600': isOpen && !error,
            'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-danger': error,
            'text-neutral-900': hasSelection(),
            'text-neutral-500': !hasSelection()
          }">
          
          <span class="truncate block pr-6">
            <ng-container *ngIf="!multiple">
              {{ displayValue || placeholder }}
            </ng-container>
            <ng-container *ngIf="multiple">
              <span *ngIf="selectedOptions.length === 0">{{ placeholder }}</span>
              <span *ngIf="selectedOptions.length > 0" class="flex gap-1 flex-wrap">
                <span *ngFor="let opt of selectedOptions; let i = index" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-primary-100 text-primary-800 text-xs">
                  {{ opt.label }}
                  <span (click)="removeMultiOption(opt, $event)" class="cursor-pointer hover:bg-primary-200 rounded-full p-0.5" aria-hidden="true">
                    <lucide-icon name="x" [size]="10"></lucide-icon>
                  </span>
                </span>
              </span>
            </ng-container>
          </span>
          
          <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <lucide-icon *ngIf="error" name="alert-circle" [size]="16" class="text-danger mr-1"></lucide-icon>
            <lucide-icon name="chevron-down" [size]="16" class="text-neutral-500"></lucide-icon>
          </span>
        </button>

        <!-- Dropdown Panel -->
        <div 
          *ngIf="isOpen"
          class="absolute z-50 mt-1 w-full rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-60"
          role="listbox"
          [attr.aria-multiselectable]="multiple">
          
          <!-- Search input -->
          <div class="p-2 border-b border-neutral-100 flex-shrink-0 relative">
            <lucide-icon name="search" [size]="14" class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
            <input 
              #searchInput
              type="text" 
              class="w-full pl-8 pr-3 py-1.5 text-sm bg-neutral-50 border-none rounded-sm outline-none focus:ring-2 focus:ring-primary-600/20"
              placeholder="Search..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterOptions()"
              (click)="$event.stopPropagation()">
          </div>
          
          <!-- Options list -->
          <ul class="overflow-auto py-1 flex-1" tabindex="-1" role="presentation">
            <li *ngIf="filteredOptions.length === 0" class="px-3 py-2 text-sm text-neutral-500 text-center">
              No results found
            </li>
            
            <li 
              *ngFor="let option of filteredOptions; let i = index"
              [id]="'option-' + i"
              role="option"
              [attr.aria-selected]="isSelected(option)"
              [attr.aria-disabled]="option.disabled"
              (click)="selectOption(option)"
              (mouseenter)="focusedIndex = i"
              class="relative cursor-default select-none py-2 pl-3 pr-9 text-sm outline-none transition-colors"
              [ngClass]="{
                'text-neutral-900': !option.disabled,
                'text-neutral-400': option.disabled,
                'bg-neutral-100': focusedIndex === i && !option.disabled,
                'bg-primary-50': isSelected(option) && focusedIndex !== i,
                'bg-primary-100': isSelected(option) && focusedIndex === i
              }">
              
              <span class="block truncate" [class.font-medium]="isSelected(option)">
                {{ option.label }}
              </span>
              
              <span *ngIf="isSelected(option)" class="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                <lucide-icon name="check" [size]="16" strokeWidth="3"></lucide-icon>
              </span>
            </li>
          </ul>
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
export class ComboboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = 'Select...';
  @Input() helperText?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() multiple = false;
  
  _options: ComboboxOption[] = [];
  @Input() set options(val: ComboboxOption[]) {
    this._options = val || [];
    this.filterOptions();
    this.updateDisplayValue();
  }
  get options(): ComboboxOption[] {
    return this._options;
  }

  @ViewChild('container') containerEl!: ElementRef;
  @ViewChild('searchInput') searchInputEl!: ElementRef;
  @ViewChild('trigger') triggerEl!: ElementRef;

  isOpen = false;
  searchQuery = '';
  filteredOptions: ComboboxOption[] = [];
  focusedIndex = -1;
  
  value: any = null;
  displayValue = '';
  selectedOptions: ComboboxOption[] = [];
  labelId = 'combobox-label-' + Math.random().toString(36).substring(2, 9);

  readonly ChevronDown = ChevronDown;
  readonly Check = Check;
  readonly X = X;
  readonly SearchIcon = SearchIcon;
  readonly AlertCircle = AlertCircle;

  onChange: any = () => {};
  onTouched: any = () => {};

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isOpen && !this.containerEl.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchQuery = '';
      this.filterOptions();
      setTimeout(() => {
        if (this.searchInputEl) this.searchInputEl.nativeElement.focus();
        
        // Find focused index
        if (this.multiple) {
          this.focusedIndex = this.filteredOptions.length > 0 ? 0 : -1;
        } else {
          const selectedIdx = this.filteredOptions.findIndex(o => o.value === this.value);
          this.focusedIndex = selectedIdx >= 0 ? selectedIdx : (this.filteredOptions.length > 0 ? 0 : -1);
        }
      }, 0);
    } else {
      this.onTouched();
    }
  }

  close() {
    this.isOpen = false;
    this.focusedIndex = -1;
    this.onTouched();
    if (this.triggerEl) {
      this.triggerEl.nativeElement.focus();
    }
  }

  filterOptions() {
    if (!this.searchQuery) {
      this.filteredOptions = [...this.options];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredOptions = this.options.filter(o => o.label.toLowerCase().includes(q));
    }
    this.focusedIndex = this.filteredOptions.length > 0 ? 0 : -1;
  }

  hasSelection(): boolean {
    if (this.multiple) return this.selectedOptions.length > 0;
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  isSelected(option: ComboboxOption): boolean {
    if (this.multiple) {
      return this.selectedOptions.some(o => o.value === option.value);
    }
    return this.value === option.value;
  }

  selectOption(option: ComboboxOption) {
    if (option.disabled) return;

    if (this.multiple) {
      const isSelected = this.isSelected(option);
      if (isSelected) {
        this.selectedOptions = this.selectedOptions.filter(o => o.value !== option.value);
        const newValues = this.selectedOptions.map(o => o.value);
        this.value = newValues;
        this.onChange(newValues);
      } else {
        this.selectedOptions = [...this.selectedOptions, option];
        const newValues = this.selectedOptions.map(o => o.value);
        this.value = newValues;
        this.onChange(newValues);
      }
      if (this.searchInputEl) {
        this.searchInputEl.nativeElement.focus(); // keep focus
      }
    } else {
      this.value = option.value;
      this.onChange(this.value);
      this.updateDisplayValue();
      this.close();
    }
  }

  removeMultiOption(option: ComboboxOption, event: Event) {
    event.stopPropagation();
    if (this.disabled) return;
    this.selectedOptions = this.selectedOptions.filter(o => o.value !== option.value);
    const newValues = this.selectedOptions.map(o => o.value);
    this.value = newValues;
    this.onChange(newValues);
  }

  updateDisplayValue() {
    if (this.multiple) {
      if (Array.isArray(this.value)) {
        this.selectedOptions = this.options.filter(o => this.value.includes(o.value));
      } else {
        this.selectedOptions = [];
      }
    } else {
      const selected = this.options.find(o => o.value === this.value);
      this.displayValue = selected ? selected.label : '';
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen) {
      if ((event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') && !this.disabled) {
        event.preventDefault();
        this.toggle();
      }
      return;
    }

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.focusedIndex < this.filteredOptions.length - 1) {
        this.focusedIndex++;
        this.scrollToFocused();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.focusedIndex > 0) {
        this.focusedIndex--;
        this.scrollToFocused();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.focusedIndex >= 0 && this.focusedIndex < this.filteredOptions.length) {
        this.selectOption(this.filteredOptions[this.focusedIndex]);
      }
    }
  }

  scrollToFocused() {
    // Basic auto-scroll implementation could go here
  }

  writeValue(value: any): void {
    this.value = value;
    this.updateDisplayValue();
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
