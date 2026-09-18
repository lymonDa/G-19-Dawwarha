import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown-item',
  standalone: true,
  template: `
    <button 
      class="w-full text-start px-4 py-2 text-sm transition-colors focus:outline-none focus:bg-neutral-100 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
      [class.text-danger]="danger"
      [class.text-neutral-700]="!danger"
      [disabled]="disabled"
      role="menuitem"
      tabindex="-1"
      (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `
})
export class DropdownItemComponent {
  @Input() disabled = false;
  @Input() danger = false;
  @Output() action = new EventEmitter<void>();
  
  constructor(public elementRef: ElementRef) {}

  onClick(event: Event) {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }
    this.action.emit();
  }
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-start" (keydown)="onKeydown($event)">
      <!-- Trigger -->
      <div (click)="toggle()" #trigger>
        <ng-content select="[dropdown-trigger]"></ng-content>
      </div>

      <!-- Menu -->
      <div 
        *ngIf="isOpen"
        class="absolute z-50 mt-1 w-56 rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200"
        [ngClass]="(position === 'right' || position === 'end') ? 'end-0 origin-top-right rtl:origin-top-left' : 'start-0 origin-top-left rtl:origin-top-right'"
        role="menu" 
        aria-orientation="vertical" 
        tabindex="-1"
        #menu>
        <div class="py-1" role="none">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class DropdownComponent implements AfterContentInit {
  @Input() position: 'left' | 'right' | 'start' | 'end' = 'start';
  @ContentChildren(DropdownItemComponent) items!: QueryList<DropdownItemComponent>;
  
  isOpen = false;
  
  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit() {
    this.items.changes.subscribe(() => {
      // Re-subscribe or handle dynamic items if needed
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.focusFirstItem(), 0);
    }
  }

  close() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.toggle();
      }
      return;
    }

    const itemsArr = this.items.toArray().filter(i => !i.disabled);
    if (itemsArr.length === 0) return;

    const currentIndex = itemsArr.findIndex(i => i.elementRef.nativeElement.querySelector('button') === document.activeElement);

    if (event.key === 'Escape') {
      this.close();
      const triggerEl = this.elementRef.nativeElement.querySelector('[dropdown-trigger] button, [dropdown-trigger] a');
      if (triggerEl) triggerEl.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex < itemsArr.length - 1 ? currentIndex + 1 : 0;
      itemsArr[nextIndex].elementRef.nativeElement.querySelector('button').focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemsArr.length - 1;
      itemsArr[prevIndex].elementRef.nativeElement.querySelector('button').focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      itemsArr[0].elementRef.nativeElement.querySelector('button').focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      itemsArr[itemsArr.length - 1].elementRef.nativeElement.querySelector('button').focus();
    }
  }

  private focusFirstItem() {
    const firstItem = this.items.find(i => !i.disabled);
    if (firstItem) {
      firstItem.elementRef.nativeElement.querySelector('button').focus();
    }
  }
}
