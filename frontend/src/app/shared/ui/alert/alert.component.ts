import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-angular';
import { LanguageService } from '../../../core/services/language.service';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      *ngIf="isVisible"
      [class]="containerClasses()"
      [attr.role]="role()"
      class="flex items-start w-full p-4 rounded-lg border">
      
      <div class="flex-shrink-0 mt-0.5">
        <lucide-icon [name]="iconName()" [size]="20" [class]="iconClasses()"></lucide-icon>
      </div>

      <div class="ms-3 flex-1">
        <h3 *ngIf="title" class="text-sm font-semibold mb-1" [class]="textClasses()">
          {{ title }}
        </h3>
        <div class="text-sm" [class]="textClasses()">
          <ng-content></ng-content>
          {{ message }}
        </div>
        
        <div *ngIf="actionLabel" class="mt-3">
          <button 
            type="button" 
            (click)="action.emit()"
            class="text-sm font-semibold underline hover:opacity-80 transition-opacity"
            [class]="textClasses()">
            {{ actionLabel }}
          </button>
        </div>
      </div>

      <div *ngIf="dismissible" class="ms-auto ps-3">
        <button 
          type="button" 
          (click)="dismiss()"
          class="inline-flex p-1.5 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer"
          [class]="textClasses()"
          [attr.aria-label]="dismissAriaLabel">
          <lucide-icon name="x" [size]="16"></lucide-icon>
        </button>
      </div>
    </div>
  `
})
export class AlertComponent {
  private languageService = inject(LanguageService, { optional: true });

  @Input() variant: AlertVariant = 'info';
  @Input() title?: string;
  @Input() message?: string;
  @Input() dismissible = false;
  @Input() actionLabel?: string;

  get dismissAriaLabel(): string {
    return this.languageService?.currentLanguage() === 'ar' ? 'إغلاق التنبيه' : 'Dismiss';
  }
  
  @Output() dismissed = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  isVisible = true;
  
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle2 = CheckCircle2;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
  readonly X = X;

  role = computed(() => ['danger', 'warning'].includes(this.variant) ? 'alert' : 'status');

  iconName = computed(() => {
    switch (this.variant) {
      case 'success': return 'check-circle-2';
      case 'warning': return 'alert-triangle';
      case 'danger': return 'alert-circle';
      case 'info': default: return 'info';
    }
  });

  containerClasses = computed(() => {
    switch (this.variant) {
      case 'success': return 'bg-success-50 border-success/20';
      case 'warning': return 'bg-warning-50 border-warning/20';
      case 'danger': return 'bg-danger-50 border-danger/20';
      case 'info': default: return 'bg-info-50 border-info/20';
    }
  });

  textClasses = computed(() => {
    switch (this.variant) {
      case 'success': return 'text-success-800 dark:text-success-900';
      case 'warning': return 'text-warning-800 dark:text-warning-900';
      case 'danger': return 'text-danger-800 dark:text-danger-900';
      case 'info': default: return 'text-info-800 dark:text-info-900';
    }
  });

  iconClasses = computed(() => {
    switch (this.variant) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'info': default: return 'text-info';
    }
  });

  dismiss() {
    this.isVisible = false;
    this.dismissed.emit();
  }
}
