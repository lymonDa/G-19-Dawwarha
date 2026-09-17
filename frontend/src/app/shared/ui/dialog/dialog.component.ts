import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? 'dialog-title' : null"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          (click)="handleClose()"
        ></div>

        <!-- Panel -->
        <div
          class="relative bg-white rounded-xl shadow-lg border border-neutral-200 max-w-lg w-full p-6 transition-all transform duration-200 ease-out scale-100 opacity-100 z-10"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <h3 id="dialog-title" class="text-lg font-semibold text-neutral-900">
              {{ title }}
            </h3>
            <button
              type="button"
              (click)="handleClose()"
              class="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
              aria-label="إغلاق"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="text-sm text-neutral-700 leading-relaxed mb-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 pt-2">
            @if (showCancel) {
              <app-button
                variant="ghost"
                (clicked)="handleClose()"
              >
                {{ cancelText }}
              </app-button>
            }
            <app-button
              [variant]="confirmVariant"
              [isLoading]="isLoading"
              (clicked)="handleConfirm()"
            >
              {{ confirmText }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `
})
export class DialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() confirmText = 'تأكيد';
  @Input() cancelText = 'إلغاء';
  @Input() confirmVariant: 'primary' | 'danger' = 'primary';
  @Input() showCancel = true;
  @Input() isLoading = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    if (this.isOpen && !this.isLoading) {
      this.handleClose();
    }
  }

  handleClose(): void {
    this.close.emit();
  }

  handleConfirm(): void {
    this.confirm.emit();
  }
}
