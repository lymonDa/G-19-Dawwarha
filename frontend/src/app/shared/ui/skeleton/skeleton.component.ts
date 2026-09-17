import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="skeletonClasses"
      [style.width]="width"
      [style.height]="height"
      aria-busy="true"
      aria-hidden="true"
    ></div>
  `
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() customClass = '';

  get skeletonClasses(): string {
    const base = 'animate-pulse bg-neutral-200';
    let variantClass = '';

    switch (this.variant) {
      case 'text':
        variantClass = 'h-4 w-full rounded';
        break;
      case 'circular':
        variantClass = 'rounded-full w-10 h-10 shrink-0';
        break;
      case 'rectangular':
        variantClass = 'rounded-md w-full h-24';
        break;
      case 'card':
        variantClass = 'rounded-card w-full h-48 border border-neutral-200';
        break;
    }

    return `${base} ${variantClass} ${this.customClass}`;
  }
}
