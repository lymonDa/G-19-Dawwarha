import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || isLoading"
      [class]="buttonClasses"
      [attr.aria-busy]="isLoading"
      [attr.aria-disabled]="disabled || isLoading"
      (click)="handleClick($event)"
    >
      @if (isLoading) {
        <svg class="animate-spin -ms-1 me-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium transition-all select-none rounded-md min-h-[40px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
    const widthClass = this.fullWidth ? 'w-full' : '';

    // Sizes
    let sizeClass = 'px-4 py-2 text-sm';
    if (this.size === 'sm') sizeClass = 'px-3 py-1.5 text-xs min-h-[40px] min-w-[40px]';
    if (this.size === 'lg') sizeClass = 'px-6 py-3 text-base min-h-[48px]';

    // Variants
    let variantClass = '';
    switch (this.variant) {
      case 'primary':
        variantClass = 'bg-primary text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm';
        break;
      case 'secondary':
        variantClass = 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 shadow-sm';
        break;
      case 'outline':
        variantClass = 'bg-transparent text-primary border border-primary hover:bg-primary-50 active:bg-primary-100';
        break;
      case 'ghost':
        variantClass = 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200';
        break;
      case 'danger':
        variantClass = 'bg-danger text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm';
        break;
    }

    const disabledClass = (this.disabled || this.isLoading)
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : 'cursor-pointer active:scale-[0.98]';

    return `${base} ${sizeClass} ${variantClass} ${widthClass} ${disabledClass}`;
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.isLoading) {
      this.clicked.emit(event);
    }
  }
}
