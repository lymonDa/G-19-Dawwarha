import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'bordered' | 'muted' | 'interactive' | 'sand';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="cardClasses"
      [attr.role]="isInteractive ? 'button' : null"
      [attr.tabindex]="isInteractive ? '0' : null"
      (click)="handleClick($event)"
      (keydown.enter)="handleKeydown($event)"
      (keydown.space)="handleKeydown($event)"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() variant: CardVariant = 'bordered';
  @Input() padding: CardPadding = 'md';
  @Input() isInteractive = false;
  @Input() isSelected = false;

  @Output() clicked = new EventEmitter<MouseEvent | KeyboardEvent>();

  get cardClasses(): string {
    const base = 'rounded-card transition-all duration-200';
    
    // Padding
    let paddingClass = 'p-5';
    if (this.padding === 'none') paddingClass = 'p-0';
    if (this.padding === 'sm') paddingClass = 'p-3';
    if (this.padding === 'lg') paddingClass = 'p-6';

    // Variant
    let variantClass = 'bg-white border border-neutral-200';
    switch (this.variant) {
      case 'default':
        variantClass = 'bg-white shadow-sm border border-neutral-200';
        break;
      case 'bordered':
        variantClass = 'bg-white border border-neutral-200';
        break;
      case 'muted':
        variantClass = 'bg-neutral-100 border border-neutral-200';
        break;
      case 'sand':
        variantClass = 'bg-sand-50 border border-sand-100 text-neutral-900';
        break;
      case 'interactive':
        variantClass = 'bg-white border border-neutral-200 hover:border-primary-500 hover:shadow-sm cursor-pointer';
        break;
    }

    if (this.isInteractive && this.variant !== 'interactive') {
      variantClass += ' hover:border-primary-500 hover:shadow-sm cursor-pointer';
    }

    if (this.isSelected) {
      variantClass += ' ring-2 ring-primary border-transparent';
    }

    return `${base} ${paddingClass} ${variantClass}`;
  }

  handleClick(event: MouseEvent): void {
    if (this.isInteractive) {
      this.clicked.emit(event);
    }
  }

  handleKeydown(event: Event): void {
    if (this.isInteractive) {
      const kbEvent = event as KeyboardEvent;
      kbEvent.preventDefault();
      this.clicked.emit(kbEvent);
    }
  }
}
