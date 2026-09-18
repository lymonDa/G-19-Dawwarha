import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 z-50 flex"
      [ngClass]="{'justify-end': position === 'end', 'justify-start': position === 'start'}"
      role="dialog" 
      aria-modal="true" 
      [attr.aria-labelledby]="titleId">
      
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-neutral-900/50 transition-opacity duration-280 animate-in fade-in"
        (click)="close()"
        aria-hidden="true">
      </div>

      <!-- Drawer Panel -->
      <div 
        #panel
        class="relative flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-280 ease-out animate-in"
        [ngClass]="{
          'slide-in-from-right': position === 'end',
          'slide-in-from-left': position === 'start'
        }"
        tabindex="-1">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-4 sm:px-6">
          <h2 [id]="titleId" class="text-lg font-semibold text-neutral-900">
            {{ title }}
          </h2>
          <button 
            type="button" 
            class="rounded-md bg-white text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
            (click)="close()">
            <span class="sr-only">Close panel</span>
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer -->
        <div *ngIf="hasFooter" class="border-t border-neutral-200 px-4 py-4 sm:px-6">
          <ng-content select="[drawer-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .duration-280 { transition-duration: 280ms; }
  `]
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() position: 'start' | 'end' = 'end';
  @Input() hasFooter = false;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('panel') panel!: ElementRef;

  titleId = 'drawer-title-' + Math.random().toString(36).substring(2, 9);
  readonly X = X;

  close() {
    this.isOpen = false;
    this.closed.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeydown(event: KeyboardEvent) {
    if (this.isOpen) {
      this.close();
    }
  }
}
