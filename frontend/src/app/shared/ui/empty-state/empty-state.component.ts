import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="w-full flex flex-col items-center justify-center p-8 text-center rounded-card border border-dashed border-neutral-300 bg-neutral-50/50">
      <div class="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mb-3">
        <ng-content select="[icon]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </ng-content>
      </div>

      <h3 class="text-base font-semibold text-neutral-900 mb-1">
        {{ title }}
      </h3>

      <p class="text-sm text-neutral-600 max-w-sm mb-4 leading-relaxed">
        {{ description }}
      </p>

      @if (actionLabel) {
        <app-button
          [variant]="actionVariant"
          (clicked)="actionClicked.emit()"
        >
          {{ actionLabel }}
        </app-button>
      }

      <ng-content select="[actions]"></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'لا توجد بيانات متاحة';
  @Input() description = '';
  @Input() actionLabel?: string;
  @Input() actionVariant: 'primary' | 'secondary' | 'ghost' = 'primary';

  @Output() actionClicked = new EventEmitter<void>();
  @Output() action = this.actionClicked;
}
