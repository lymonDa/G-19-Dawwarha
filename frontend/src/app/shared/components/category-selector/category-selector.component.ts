<<<<<<< HEAD
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { RequestApiService } from '../../../features/requests/services/request-api.service';
=======
import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryApiService } from '../../../features/categories/category-api.service';
import { ComboboxComponent, ComboboxOption } from '../../ui/combobox/combobox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { SkeletonComponent } from '../../ui/skeleton/skeleton.component';
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1

@Component({
  selector: 'app-category-selector',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1">
      <div class="relative">
        <select
          [id]="id"
          [disabled]="disabled || loading"
          [ngModel]="value"
          (ngModelChange)="onSelectionChange($event)"
          (blur)="onBlur()"
          class="w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-0 px-3.5 py-2.5 text-sm text-neutral-900 transition focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 disabled:bg-neutral-100 disabled:text-neutral-500"
          [ngClass]="{
            'border-danger focus:border-danger focus:ring-danger': isInvalid
          }"
        >
          <option value="" disabled selected>{{ placeholder }}</option>
          @for (cat of availableCategories; track cat._id || cat.id) {
            <option [value]="cat._id || cat.id">
              {{ cat.name }}
            </option>
          }
        </select>

        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
          @if (loading) {
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          } @else {
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          }
        </div>
      </div>

      @if (errorMessage) {
        <p class="text-xs text-danger">{{ errorMessage }}</p>
=======
  imports: [CommonModule, FormsModule, ComboboxComponent, ButtonComponent, SkeletonComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CategorySelectorComponent),
    multi: true
  }],
  template: `
    <div class="w-full flex flex-col gap-1.5" aria-live="polite">
      @if (isLoading() && !hasLoaded()) {
        <app-skeleton variant="rectangular" height="42px" customClass="!h-[42px]"></app-skeleton>
      } @else if (hasError()) {
        <div class="flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          <span>Couldn't load categories</span>
          <app-button variant="outline" size="sm" [isLoading]="isLoading()" (clicked)="retry()">Retry</app-button>
        </div>
      } @else {
        <app-combobox
          [label]="label"
          [placeholder]="placeholder"
          [options]="options()"
          [required]="required"
          [disabled]="disabled"
          [error]="error"
          [(ngModel)]="value"
          (ngModelChange)="handleValueChange($event)"
        ></app-combobox>
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
      }
    </div>
  `
})
<<<<<<< HEAD
export class CategorySelectorComponent implements OnInit, ControlValueAccessor {
  private api = inject(RequestApiService);

  @Input() id = 'category-selector';
  @Input() placeholder = 'Select a category...';
  @Input() categories: Category[] = [];
  @Input() isInvalid = false;
  @Input() errorMessage?: string;

  @Output() categoryChange = new EventEmitter<string>();

  value = '';
  disabled = false;
  loading = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  get availableCategories(): Category[] {
    if (this.categories && this.categories.length > 0) {
      return this.categories.filter(c => c.isActive !== false);
    }
    return this.fetchedCategories.filter(c => c.isActive !== false);
  }

  private fetchedCategories: Category[] = [];

  ngOnInit(): void {
    if (!this.categories || this.categories.length === 0) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.loading = true;
    this.api.getCategories().subscribe({
      next: (res) => {
        const list = res?.data || res || [];
        this.fetchedCategories = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSelectionChange(newVal: string): void {
    this.value = newVal;
    this.onChange(newVal);
    this.categoryChange.emit(newVal);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
=======
export class CategorySelectorComponent implements ControlValueAccessor, OnInit {
  private readonly categoryApi = inject(CategoryApiService);

  label = 'Category';
  placeholder = 'Select a category';
  required = false;
  disabled = false;
  error?: string;
  value: string | null = null;
  readonly hasLoaded = signal(false);
  readonly hasError = signal(false);
  readonly isLoading = this.categoryApi.isLoading;
  readonly options = signal<ComboboxOption[]>([]);

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.loadCategories();
  }

  retry(): void {
    this.loadCategories(true);
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
<<<<<<< HEAD
}
=======

  handleValueChange(value: string | null): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  private loadCategories(forceRefresh = false): void {
    this.hasError.set(false);
    this.categoryApi.list(forceRefresh).subscribe({
      next: categories => {
        this.options.set(categories
          .filter(category => category.isActive)
          .map(category => ({ value: category.id, label: category.name })));
        this.hasLoaded.set(true);
      },
      error: () => this.hasError.set(true)
    });
  }
}
>>>>>>> 2370b8e25b12033313748db7e74761bfb44f21e1
