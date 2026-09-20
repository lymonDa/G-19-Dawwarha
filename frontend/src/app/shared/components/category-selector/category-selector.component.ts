import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, OnInit, signal, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CategoryApiService } from '../../../features/categories/category-api.service';
import { ComboboxComponent, ComboboxOption } from '../../ui/combobox/combobox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { SkeletonComponent } from '../../ui/skeleton/skeleton.component';
import { LanguageService, injectLanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-category-selector',
  standalone: true,
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
          <span>{{ isArabic ? 'تعذر تحميل التصنيفات' : "Couldn't load categories" }}</span>
          <app-button variant="outline" size="sm" [isLoading]="isLoading()" (clicked)="retry()">
            {{ isArabic ? 'إعادة المحاولة' : 'Retry' }}
          </app-button>
        </div>
      } @else {
        <app-combobox
          [label]="resolvedLabel"
          [placeholder]="resolvedPlaceholder"
          [options]="options()"
          [required]="required"
          [disabled]="disabled"
          [error]="error"
          [(ngModel)]="value"
          (ngModelChange)="handleValueChange($event)"
        ></app-combobox>
      }
    </div>
  `
})
export class CategorySelectorComponent implements ControlValueAccessor, OnInit {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly languageService = injectLanguageService();

  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() error?: string;

  get isArabic(): boolean {
    return this.languageService?.currentLanguage() === 'ar';
  }

  get resolvedLabel(): string {
    if (this.label) return this.label;
    return this.isArabic ? 'التصنيف' : 'Category';
  }

  get resolvedPlaceholder(): string {
    if (this.placeholder) return this.placeholder;
    return this.isArabic ? 'اختر تصنيفاً' : 'Select a category';
  }

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
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

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
          .map(category => ({
            value: category.id,
            label: (this.isArabic && (category as any).nameAr) ? (category as any).nameAr : category.name
          })));
        this.hasLoaded.set(true);
      },
      error: () => this.hasError.set(true)
    });
  }
}