import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Reports & Dispute Management</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Resolve complaints of no-show or resource mismatch from the listed specifications.</p>
      </div>

      <app-table>
        <thead class="bg-neutral-50 border-b border-neutral-200 text-neutral-600">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-semibold">Report ID</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Entity Type</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Reason</th>
            <th class="px-4 py-3 text-start text-xs font-semibold">Status</th>
            <th class="px-4 py-3 text-end text-xs font-semibold">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 text-xs">
          <tr class="hover:bg-neutral-50/80">
            <td class="px-4 py-3 font-mono font-bold text-neutral-900">#REP-104</td>
            <td class="px-4 py-3 text-neutral-600">Resource</td>
            <td class="px-4 py-3 text-neutral-700">Wheelchair specs don't match what was listed in the listing</td>
            <td class="px-4 py-3"><app-badge variant="danger" size="sm">Open — Under Review</app-badge></td>
            <td class="px-4 py-3 text-end">
              <app-button variant="secondary" size="sm">Handle Report</app-button>
            </td>
          </tr>
        </tbody>
      </app-table>
    </div>
  `
})
export class AdminReportsComponent {}
