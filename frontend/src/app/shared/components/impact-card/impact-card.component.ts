import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../../ui/skeleton/skeleton.component';
import { LanguageService, injectLanguageService } from '../../../core/services/language.service';

export type ImpactCardVariant = 'personal' | 'organization' | 'aggregate';

@Component({
  selector: 'app-impact-card',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div
      [class]="cardClasses"
      [attr.aria-label]="accessibleLabel"
      role="region"
    >
      @if (isLoading) {
        <div class="flex flex-col gap-2 p-5" aria-busy="true">
          <app-skeleton variant="text" width="60px" height="32px"></app-skeleton>
          <app-skeleton variant="text" width="120px" height="16px"></app-skeleton>
        </div>
      } @else if (isError) {
        <div class="flex flex-col items-center justify-center p-5 text-center text-xs text-danger" role="alert">
          <svg class="w-5 h-5 mb-1 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ resolvedErrorMessage }}</span>
        </div>
      } @else if (isEmpty || value === 0) {
        <div class="flex flex-col items-center justify-center p-5 text-center text-xs text-neutral-400">
          <span class="text-xl font-bold font-mono text-neutral-300">0</span>
          <span class="mt-1">{{ resolvedEmptyMessage }}</span>
          <span class="text-[10px] text-neutral-400 mt-0.5">{{ label }}</span>
        </div>
      } @else {
        <div class="flex items-center justify-between p-5">
          <div class="flex flex-col">
            <!-- Large Numeral Leads -->
            <span class="text-3xl font-extrabold tracking-tight font-mono" [class]="numeralClass">
              {{ formattedValue }}
            </span>
            <!-- Label Secondary -->
            <span class="text-xs font-semibold mt-1" [class]="labelClass">
              {{ label }}
            </span>
            @if (description) {
              <span class="text-[11px] opacity-75 mt-0.5">
                {{ description }}
              </span>
            }
          </div>

          @if (icon) {
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              [class]="iconContainerClass"
              aria-hidden="true"
            >
              <ng-content select="[icon]"></ng-content>
              @if (!hasProjectedIcon) {
                <span class="text-lg font-bold">{{ icon }}</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ImpactCardComponent {
  private languageService = injectLanguageService();

  @Input() value: number | string = 0;
  @Input() label: string = 'مساهمة مجتمعية';
  @Input() description?: string;
  @Input() variant: ImpactCardVariant = 'personal';
  @Input() icon?: string = '★';
  @Input() hasProjectedIcon = false;
  @Input() isLoading = false;
  @Input() isError = false;
  @Input() errorMessage?: string;
  @Input() isEmpty = false;
  @Input() emptyMessage?: string;

  get isEnglish(): boolean {
    return this.languageService?.currentLanguage() === 'en';
  }

  get resolvedErrorMessage(): string {
    return this.errorMessage || (this.isEnglish ? 'Failed to load impact metric' : 'تعذر تحميل مؤشر الأثر');
  }

  get resolvedEmptyMessage(): string {
    return this.emptyMessage || (this.isEnglish ? 'No completed contributions yet' : 'لا توجد مساهمات مكتملة بعد');
  }

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      return this.value.toLocaleString(this.isEnglish ? 'en-US' : 'ar-EG');
    }
    return String(this.value);
  }

  get accessibleLabel(): string {
    return `${this.label}: ${this.formattedValue}`;
  }

  get cardClasses(): string {
    const base = 'rounded-card border transition-all duration-200';
    // Warm Sand accent is allowed ONLY for personal and organization contexts per DESIGN.md §4.
    // Aggregate/Admin views MUST use neutral treatment per DESIGN.md §4 & §28.
    if (this.variant === 'aggregate') {
      return `${base} bg-white border-neutral-200 text-neutral-900 shadow-xs`;
    }
    return `${base} bg-sand-50 border-sand-200 text-neutral-900 shadow-xs`;
  }

  get numeralClass(): string {
    if (this.variant === 'aggregate') {
      return 'text-neutral-900';
    }
    return 'text-sand-700';
  }

  get labelClass(): string {
    if (this.variant === 'aggregate') {
      return 'text-neutral-600';
    }
    return 'text-sand-800';
  }

  get iconContainerClass(): string {
    if (this.variant === 'aggregate') {
      return 'bg-neutral-100 text-neutral-700';
    }
    return 'bg-sand-500/10 text-sand-700';
  }
}
