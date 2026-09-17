import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full overflow-x-auto rounded-card border border-neutral-200 bg-white">
      <table class="w-full text-start text-sm border-collapse">
        <ng-content></ng-content>
      </table>
    </div>
  `
})
export class TableComponent {}
