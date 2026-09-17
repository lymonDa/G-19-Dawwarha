import { Component, ContentChildren, QueryList, Input, Output, EventEmitter, AfterContentInit, TemplateRef, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[appTab]',
  standalone: true
})
export class TabDirective {
  @Input('appTab') label: string = '';
  @Input() disabled = false;
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div 
        class="flex overflow-x-auto border-b border-neutral-200 hide-scrollbar" 
        role="tablist" 
        (keydown)="onKeydown($event)">
        
        <button 
          *ngFor="let tab of tabs; let i = index"
          #tabButton
          role="tab"
          [attr.aria-selected]="activeTabIndex === i"
          [attr.aria-controls]="'tabpanel-' + i"
          [attr.aria-disabled]="tab.disabled"
          [id]="'tab-' + id + '-' + i"
          [tabindex]="activeTabIndex === i ? 0 : -1"
          (click)="selectTab(i)"
          class="whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none focus-visible:bg-neutral-50"
          [ngClass]="{
            'border-primary-600 text-primary-600': activeTabIndex === i && !tab.disabled,
            'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300': activeTabIndex !== i && !tab.disabled,
            'opacity-50 cursor-not-allowed border-transparent text-neutral-500': tab.disabled
          }">
          {{ tab.label }}
        </button>
      </div>
      
      <div 
        class="pt-4" 
        role="tabpanel" 
        [id]="'tabpanel-' + id + '-' + activeTabIndex" 
        [attr.aria-labelledby]="'tab-' + id + '-' + activeTabIndex"
        tabindex="0">
        <ng-container *ngIf="tabs.length > 0">
          <ng-container *ngTemplateOutlet="tabs.toArray()[activeTabIndex].template"></ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabDirective) tabs!: QueryList<TabDirective>;
  
  @Input() activeTabIndex = 0;
  @Output() tabChange = new EventEmitter<number>();

  id = Math.random().toString(36).substring(2, 9);

  ngAfterContentInit() {
    if (this.activeTabIndex >= this.tabs.length) {
      this.activeTabIndex = 0;
    }
  }

  selectTab(index: number) {
    const tab = this.tabs.toArray()[index];
    if (tab && !tab.disabled) {
      this.activeTabIndex = index;
      this.tabChange.emit(this.activeTabIndex);
    }
  }

  onKeydown(event: KeyboardEvent) {
    const tabsArr = this.tabs.toArray();
    let newIndex = this.activeTabIndex;

    if (event.key === 'ArrowRight') {
      newIndex = (this.activeTabIndex + 1) % tabsArr.length;
      while (tabsArr[newIndex].disabled && newIndex !== this.activeTabIndex) {
        newIndex = (newIndex + 1) % tabsArr.length;
      }
    } else if (event.key === 'ArrowLeft') {
      newIndex = (this.activeTabIndex - 1 + tabsArr.length) % tabsArr.length;
      while (tabsArr[newIndex].disabled && newIndex !== this.activeTabIndex) {
        newIndex = (newIndex - 1 + tabsArr.length) % tabsArr.length;
      }
    } else if (event.key === 'Home') {
      newIndex = 0;
      while (tabsArr[newIndex]?.disabled && newIndex < tabsArr.length - 1) newIndex++;
    } else if (event.key === 'End') {
      newIndex = tabsArr.length - 1;
      while (tabsArr[newIndex]?.disabled && newIndex > 0) newIndex--;
    } else {
      return; // Do nothing for other keys
    }

    event.preventDefault();
    this.selectTab(newIndex);
    
    // Focus the new button
    const tablist = (event.target as HTMLElement).closest('[role="tablist"]');
    if (tablist) {
      const buttons = tablist.querySelectorAll('button');
      if (buttons[newIndex]) {
        (buttons[newIndex] as HTMLElement).focus();
      }
    }
  }
}
