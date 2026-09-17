import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      <img 
        *ngIf="imageUrl() && !imageError()" 
        [src]="imageUrl()" 
        [alt]="altText()" 
        (error)="onImageError()" 
        class="w-full h-full object-cover rounded-full" 
      />
      <div 
        *ngIf="!imageUrl() || imageError()" 
        class="w-full h-full flex items-center justify-center rounded-full font-medium"
        [class]="fallbackClasses()"
        aria-hidden="true">
        {{ initials() }}
      </div>
    </div>
  `
})
export class AvatarComponent {
  imageUrl = signal<string | undefined>(undefined);
  
  @Input() set src(val: string | undefined | null) {
    this.imageUrl.set(val || undefined);
    this.imageError.set(false);
  }
  
  @Input() name: string = '';
  @Input() size: AvatarSize = 'md';
  @Input() alt: string = '';

  imageError = signal(false);

  altText = computed(() => {
    if (this.alt !== undefined && this.alt !== '') return this.alt;
    return this.name ? this.name : '';
  });

  initials = computed(() => {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  containerClasses = computed(() => {
    let sizeClass = 'w-8 h-8'; // md
    if (this.size === 'sm') sizeClass = 'w-6 h-6';
    else if (this.size === 'lg') sizeClass = 'w-12 h-12';
    
    return `${sizeClass} rounded-full overflow-hidden inline-flex items-center justify-center select-none bg-neutral-100 flex-shrink-0`;
  });

  fallbackClasses = computed(() => {
    let textClass = 'text-sm';
    if (this.size === 'sm') textClass = 'text-xs';
    else if (this.size === 'lg') textClass = 'text-lg';
    
    // Deterministic color based on name length to give a consistent tint (simplified hash)
    const colors = [
      'bg-primary-100 text-primary-800',
      'bg-info-100 text-info-800',
      'bg-success-100 text-success-800',
      'bg-warning-100 text-warning-800',
      'bg-sand-100 text-sand-800'
    ];
    
    const index = this.name ? this.name.length % colors.length : 0;
    
    return `${textClass} ${colors[index]}`;
  });

  onImageError() {
    this.imageError.set(true);
  }
}
