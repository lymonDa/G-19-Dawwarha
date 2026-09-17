import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative inline-flex group"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (focusin)="onFocusIn()"
      (focusout)="onFocusOut()">
      
      <!-- Content wrapper -->
      <div [attr.aria-describedby]="tooltipId">
        <ng-content></ng-content>
      </div>
      
      <!-- Tooltip -->
      <div 
        *ngIf="isVisible"
        [id]="tooltipId"
        role="tooltip"
        class="absolute z-50 px-2 py-1 text-[12px] leading-[18px] text-white bg-neutral-900 rounded-md shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200"
        [ngClass]="positionClasses()">
        {{ text }}
        <!-- Caret -->
        <div class="absolute w-2 h-2 bg-neutral-900 rotate-45" [ngClass]="caretClasses()"></div>
      </div>
    </div>
  `
})
export class TooltipComponent {
  @Input() text: string = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() disabled = false;

  isVisible = false;
  tooltipId = 'tooltip-' + Math.random().toString(36).substring(2, 9);
  
  private timeoutId: any;

  onMouseEnter() {
    if (this.disabled || !this.text) return;
    this.timeoutId = setTimeout(() => {
      this.isVisible = true;
    }, 400); // 400ms delay per DESIGN.md
  }

  onMouseLeave() {
    clearTimeout(this.timeoutId);
    this.isVisible = false;
  }

  onFocusIn() {
    if (this.disabled || !this.text) return;
    this.isVisible = true; // instant on focus
  }

  onFocusOut() {
    this.isVisible = false;
  }

  positionClasses(): string {
    switch (this.position) {
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2';
    }
  }

  caretClasses(): string {
    switch (this.position) {
      case 'top': return 'bottom-[-4px] left-1/2 -translate-x-1/2';
      case 'bottom': return 'top-[-4px] left-1/2 -translate-x-1/2';
      case 'left': return 'right-[-4px] top-1/2 -translate-y-1/2';
      case 'right': return 'left-[-4px] top-1/2 -translate-y-1/2';
    }
  }
}
