import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-x-auto rounded-card border border-neutral-200 bg-white shadow-sm">
      <table class="w-full text-start text-sm border-collapse" [attr.aria-label]="ariaLabel">
        <caption *ngIf="caption" class="sr-only">{{ caption }}</caption>
        <ng-content></ng-content>
      </table>
    </div>
  `
})
export class TableComponent {
  @Input() caption?: string;
  @Input() ariaLabel?: string;
}
