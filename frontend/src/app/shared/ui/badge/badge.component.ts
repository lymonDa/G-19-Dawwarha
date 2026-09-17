import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sand';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      @if (dot) {
        <span class="w-1.5 h-1.5 rounded-full me-1.5 shrink-0" [class]="dotClass"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;

  get badgeClasses(): string {
    const base = 'inline-flex items-center font-medium rounded-full border leading-none';
    
    // Size
    const sizeClass = this.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

    // Variant
    let variantClass = '';
    switch (this.variant) {
      case 'success':
        variantClass = 'bg-success-bg text-success border-success/20';
        break;
      case 'warning':
        variantClass = 'bg-warning-bg text-warning border-warning/20';
        break;
      case 'danger':
        variantClass = 'bg-danger-bg text-danger border-danger/20';
        break;
      case 'info':
        variantClass = 'bg-info-bg text-info border-info/20';
        break;
      case 'sand':
        variantClass = 'bg-sand-50 text-sand-700 border-sand-500/20';
        break;
      case 'neutral':
      default:
        variantClass = 'bg-neutral-100 text-neutral-700 border-neutral-200';
        break;
    }

    return `${base} ${sizeClass} ${variantClass}`;
  }

  get dotClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'danger': return 'bg-danger';
      case 'info': return 'bg-info';
      case 'sand': return 'bg-sand';
      default: return 'bg-neutral-500';
    }
  }
}
