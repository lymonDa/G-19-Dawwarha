import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-5 end-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-card border shadow-lg bg-white transition-all transform duration-300 ease-out translate-y-0 opacity-100"
          [class.border-success]="toast.variant === 'success'"
          [class.border-danger]="toast.variant === 'error'"
          [class.border-warning]="toast.variant === 'warning'"
          [class.border-info]="toast.variant === 'info'"
          role="alert"
        >
          <!-- Variant Icon -->
          <div class="shrink-0 mt-0.5">
            @if (toast.variant === 'success') {
              <div class="w-7 h-7 rounded-full bg-success-bg text-success flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            } @else if (toast.variant === 'error') {
              <div class="w-7 h-7 rounded-full bg-danger-bg text-danger flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            } @else if (toast.variant === 'warning') {
              <div class="w-7 h-7 rounded-full bg-warning-bg text-warning flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            } @else {
              <div class="w-7 h-7 rounded-full bg-info-bg text-info flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="text-sm font-semibold text-neutral-900">{{ toast.title }}</h4>
            }
            <p class="text-xs text-neutral-700 mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Dismiss Button -->
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
            aria-label="إغلاق التنبيه"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
