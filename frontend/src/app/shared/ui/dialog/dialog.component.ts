import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
        (keydown.tab)="handleTabKey($event)"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
          (click)="handleClose()"
        ></div>

        <!-- Panel -->
        <div
          #dialogPanel
          tabindex="-1"
          class="relative bg-white rounded-xl shadow-lg border border-neutral-200 max-w-lg w-full p-6 transition-all transform duration-200 ease-out scale-100 opacity-100 z-10 outline-none"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <h3 id="dialog-title" class="text-lg font-semibold text-neutral-900">
              {{ title }}
            </h3>
            <button
              #closeButton
              type="button"
              (click)="handleClose()"
              class="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-primary"
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
              [disabled]="confirmDisabled"
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
export class DialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() confirmText = 'تأكيد';
  @Input() cancelText = 'إلغاء';
  @Input() confirmVariant: 'primary' | 'danger' = 'primary';
  @Input() confirmDisabled = false;
  @Input() showCancel = true;
  @Input() isLoading = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  @ViewChild('dialogPanel') dialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;

  private previouslyFocusedElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        if (typeof document !== 'undefined') {
          this.previouslyFocusedElement = document.activeElement as HTMLElement;
        }
        setTimeout(() => {
          this.setInitialFocus();
        }, 50);
      } else {
        this.restorePreviousFocus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.dialogPanel?.nativeElement) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(
      this.dialogPanel.nativeElement.querySelectorAll<HTMLElement>(selector)
    ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  }

  private setInitialFocus(): void {
    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else if (this.dialogPanel?.nativeElement) {
      this.dialogPanel.nativeElement.focus();
    }
  }

  private restorePreviousFocus(): void {
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  handleTabKey(event: Event): void {
    const kbEvent = event as KeyboardEvent;
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      kbEvent.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (kbEvent.shiftKey) {
      if (document.activeElement === first) {
        kbEvent.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        kbEvent.preventDefault();
        first.focus();
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    if (this.isOpen && !this.isLoading) {
      this.handleClose();
    }
  }

  handleClose(): void {
    this.restorePreviousFocus();
    this.close.emit();
  }

  handleConfirm(): void {
    this.confirm.emit();
  }
}
